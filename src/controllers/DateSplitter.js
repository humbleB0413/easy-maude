/**
 * @file DateSplitter.js
 * @description
 *   Handles automatic date-range splitting when a query exceeds MAX_RECORDS.
 *   Recursively narrows date windows using the prescribed interval sequence.
 *
 *   500 error handling (mirrors Python crawl_fda pattern):
 *     - 500 on fetchTotal → treat as oversized window, split to next interval
 *     - 500 on fetchPage  → split window and retry from sub-ranges
 *     - At minimum interval (1 day) with 500 → log and skip; cannot split further
 *
 *   Progress shape emitted per leaf window:
 *   { windowReceived, windowTotal, windowDateRange }
 *   Main export: fetchAllWithSplitting.
 */

import { fetchTotal, fetchPage } from '../services/OpenFDAService.js';
import { PAGINATION, DATE_SPLIT_INTERVALS, DEFAULT_DATE_RANGE_START } from '../constants/config.js';
import logger from '../utils/logger.js';

/**
 * Fetches all records, using date splitting when total exceeds MAX_RECORDS.
 * @param {string} baseSearch
 * @param {string|null} userDateRange - "YYYYMMDD-YYYYMMDD" or null
 * @param {string|null} apiKey
 * @param {AbortSignal} signal
 * @param {number} cap - Hard upper bound on records to accumulate
 * @param {function} onProgress - ({ windowReceived, windowTotal, windowDateRange }) => void
 * @returns {Promise<Array>}
 */
export async function fetchAllWithSplitting(baseSearch, userDateRange, apiKey, signal, cap, onProgress) {
  const [startDate, endDate] = parseDateRange(userDateRange);
  const cleanBase = removeExistingDateClause(baseSearch);
  const accumulator = [];

  await splitAndFetch(cleanBase, startDate, endDate, 0, apiKey, signal, cap, onProgress, accumulator);
  return accumulator;
}

async function splitAndFetch(baseSearch, startDate, endDate, intervalIdx, apiKey, signal, cap, onProgress, accumulator) {
  if (accumulator.length >= cap) return;

  const search = appendDateClause(baseSearch, startDate, endDate);

  // ── fetchTotal: 500 → split further instead of failing ────────────────────
  let total;
  try {
    total = await fetchTotal(search, apiKey, signal);
  } catch (e) {
    if (e.status === 500) {
      if (intervalIdx < DATE_SPLIT_INTERVALS.length) {
        logger.warn('DateSplitter', `500 on count [${startDate}→${endDate}] → split to ${DATE_SPLIT_INTERVALS[intervalIdx].unit}`);
        await recurse(baseSearch, startDate, endDate, intervalIdx, apiKey, signal, cap, onProgress, accumulator);
      } else {
        logger.warn('DateSplitter', `500 on count at min interval [${startDate}→${endDate}] → skip`);
      }
      return;
    }
    throw e;
  }

  logger.info('DateSplitter', `[${startDate}→${endDate}] total=${total}`);

  if (total === 0) return;

  const isLeaf = total <= PAGINATION.MAX_RECORDS || intervalIdx >= DATE_SPLIT_INTERVALS.length;

  if (isLeaf) {
    await fetchLeaf(baseSearch, search, startDate, endDate, intervalIdx, total, apiKey, signal, cap, onProgress, accumulator);
    return;
  }

  await recurse(baseSearch, startDate, endDate, intervalIdx, apiKey, signal, cap, onProgress, accumulator);
}

/**
 * Fetches a leaf window. On 500, retries by splitting to the next interval.
 */
async function fetchLeaf(baseSearch, search, startDate, endDate, intervalIdx, total, apiKey, signal, cap, onProgress, accumulator) {
  const windowLimit = total <= PAGINATION.MAX_RECORDS ? total : PAGINATION.MAX_RECORDS;
  const remaining   = cap - accumulator.length;
  const toFetch     = Math.min(windowLimit, remaining);

  if (intervalIdx >= DATE_SPLIT_INTERVALS.length) {
    logger.warn('DateSplitter', `Min interval at ${startDate}–${endDate}, fetching ${toFetch}`);
  }

  const windowDateRange = `${fmtDisplay(startDate)} ~ ${fmtDisplay(endDate)}`;
  onProgress({ windowReceived: 0, windowTotal: toFetch, windowDateRange });

  // ── fetchAllPages: 500 → split further instead of failing ─────────────────
  let records;
  try {
    records = await fetchAllPages(search, toFetch, apiKey, signal, (windowReceived) => {
      onProgress({ windowReceived, windowTotal: toFetch, windowDateRange });
    });
  } catch (e) {
    if (e.status === 500 && intervalIdx < DATE_SPLIT_INTERVALS.length) {
      logger.warn('DateSplitter', `500 on fetch [${startDate}→${endDate}] → split to ${DATE_SPLIT_INTERVALS[intervalIdx].unit}`);
      await recurse(baseSearch, startDate, endDate, intervalIdx, apiKey, signal, cap, onProgress, accumulator);
      return;
    }
    throw e;
  }

  accumulator.push(...records);
}

/**
 * Splits the date range by the current interval and recurses into each sub-range.
 */
async function recurse(baseSearch, startDate, endDate, intervalIdx, apiKey, signal, cap, onProgress, accumulator) {
  const subRanges = subdivide(startDate, endDate, DATE_SPLIT_INTERVALS[intervalIdx]);
  for (const [subStart, subEnd] of subRanges) {
    if (accumulator.length >= cap) break;
    await splitAndFetch(baseSearch, subStart, subEnd, intervalIdx + 1, apiKey, signal, cap, onProgress, accumulator);
  }
}

/**
 * Fetches exactly toFetch records, calling onPageProgress after each batch.
 * @param {string} search
 * @param {number} toFetch
 * @param {string|null} apiKey
 * @param {AbortSignal} signal
 * @param {function} onPageProgress - (windowReceived: number) => void
 * @returns {Promise<Array>}
 */
async function fetchAllPages(search, toFetch, apiKey, signal, onPageProgress) {
  const results = [];
  let collected = 0;
  while (collected < toFetch) {
    const batchLimit = Math.min(PAGINATION.MAX_LIMIT, toFetch - collected);
    const data = await fetchPage(search, batchLimit, collected, apiKey, signal);
    if (!data.results?.length) break;
    results.push(...data.results);
    collected += data.results.length;
    onPageProgress?.(collected);
    if (data.results.length < batchLimit) break;
  }
  return results;
}

function parseDateRange(userDateRange) {
  if (!userDateRange) {
    return [DEFAULT_DATE_RANGE_START, formatDate(new Date())];
  }
  const dashIdx = userDateRange.indexOf('-', 4);
  if (dashIdx === -1) return [userDateRange, formatDate(new Date())];
  const start = userDateRange.slice(0, dashIdx) || DEFAULT_DATE_RANGE_START;
  const end   = userDateRange.slice(dashIdx + 1) || formatDate(new Date());
  return [start, end];
}

function appendDateClause(baseSearch, start, end) {
  const clause = `date_received:[${start} TO ${end}]`;
  return baseSearch ? `${baseSearch} AND ${clause}` : clause;
}

function removeExistingDateClause(search) {
  return search
    .replace(/\s*AND\s*date_received:\[[^\]]*\]/gi, '')
    .replace(/date_received:\[[^\]]*\]\s*AND\s*/gi, '')
    .replace(/date_received:\[[^\]]*\]/gi, '')
    .trim();
}

function subdivide(startDate, endDate, interval) {
  const start  = parseYMD(startDate);
  const end    = parseYMD(endDate);
  const ranges = [];
  let current  = start;

  while (current <= end) {
    let chunkEnd;
    if (interval.months) {
      chunkEnd = addMonths(current, interval.months);
      chunkEnd = new Date(chunkEnd.getTime() - 86400000);
    } else {
      chunkEnd = new Date(current.getTime() + (interval.days - 1) * 86400000);
    }
    if (chunkEnd > end) chunkEnd = end;
    ranges.push([formatDate(current), formatDate(chunkEnd)]);

    const next = new Date(chunkEnd.getTime() + 86400000);
    if (next > end) break;
    current = next;
  }

  return ranges;
}

function parseYMD(str) {
  return new Date(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Converts YYYYMMDD → YYYY-MM-DD for display. */
function fmtDisplay(yyyymmdd) {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
