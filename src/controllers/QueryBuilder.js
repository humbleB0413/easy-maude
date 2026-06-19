/**
 * @file QueryBuilder.js
 * @description
 *   Converts user tag:value input to an OpenFDA API search string.
 *   Handles AND (default), OR (pipe |), date ranges, and multi-word phrase values.
 *   Auto-uppercases code identifier fields (code, udi).
 *   Injects a default 1-year date range when no date is specified by the user.
 */

import tagMap from '../constants/tagMap.js';
import { sanitizeQuery } from '../utils/sanitize.js';
import logger from '../utils/logger.js';

// Values for these tags are always uppercase identifiers (e.g. FRN, QBJ)
const UPPERCASE_TAGS = new Set(['code', 'udi']);

/**
 * Parses user query and returns an OpenFDA search string plus extracted date range.
 * When no date tag is present, a default 1-year window ending today is injected.
 * @param {string} rawQuery
 * @returns {{ search: string, dateRange: string }}
 */
export function buildOpenFDAQuery(rawQuery) {
  const query = sanitizeQuery(rawQuery);
  logger.info('QueryBuilder', 'Building query', { query });

  const orGroups = query.split(/\s*\|\s*/);
  const orParts  = orGroups.map(group => buildAndGroup(group.trim())).filter(Boolean);
  const joined   = orParts.join(' OR ');

  // Extract user-provided date range for DateSplitter
  const dateMatch = query.match(/\bdate:(\S+)/i);
  let dateRange   = dateMatch ? dateMatch[1] : null;
  let search      = joined;

  // Inject default 1-year window when user omits a date filter
  if (!dateRange) {
    const today   = new Date();
    const oneYear = new Date(today);
    oneYear.setFullYear(today.getFullYear() - 1);
    const from  = fmtDate(oneYear);
    const to    = fmtDate(today);
    dateRange   = `${from}-${to}`;
    const base  = orParts.length > 1 ? `(${joined})` : joined;
    const clause = `date_received:[${from} TO ${to}]`;
    search = base ? `${base} AND ${clause}` : clause;
  }

  logger.info('QueryBuilder', 'Built query', { search, dateRange });
  return { search, dateRange };
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Parses one AND group (space-separated tag:value tokens).
 * Multi-word values extend until the next known tag: prefix.
 * @param {string} group
 * @returns {string}
 */
function buildAndGroup(group) {
  const tokens = tokenize(group);
  const parts  = tokens.map(buildClause).filter(Boolean);
  return parts.join(' AND ');
}

/**
 * Splits input into tag:value tokens.
 * A new token starts when a known tag name followed by ':' is encountered.
 * Words before the first tag token are silently ignored.
 */
function tokenize(input) {
  const tagNames  = Object.keys(tagMap).join('|');
  const splitRx   = new RegExp(`(?=\\b(?:${tagNames}):)`, 'i');
  return input.split(splitRx).map(s => s.trim()).filter(Boolean);
}

/**
 * Converts a single "tag:value" string to an OpenFDA query clause.
 * @param {string} token - e.g. "brand:dexcom" or "date:20240101-20241231"
 * @returns {string|null}
 */
function buildClause(token) {
  const colonIdx = token.indexOf(':');
  if (colonIdx === -1) return null;

  const tag   = token.slice(0, colonIdx).trim().toLowerCase();
  const value = token.slice(colonIdx + 1).trim();
  const field = tagMap[tag];

  if (!field) {
    logger.warn('QueryBuilder', `Unknown tag: "${tag}"`);
    return null;
  }

  if (tag === 'date' || tag === 'event_date') {
    return buildDateClause(field, value);
  }

  // Normalize identifier-type fields to uppercase (product codes, UDI-DI, etc.)
  const normalized = UPPERCASE_TAGS.has(tag) ? value.toUpperCase() : value;

  // Wrap multi-word values in quotes
  if (normalized.includes(' ') && !normalized.startsWith('"')) {
    return `${field}:"${normalized}"`;
  }

  return `${field}:${normalized}`;
}

/**
 * Builds a date range clause.
 * Formats: YYYYMMDD-YYYYMMDD, YYYYMMDD- (open end), -YYYYMMDD (open start), YYYYMMDD (exact)
 * @param {string} field
 * @param {string} value
 * @returns {string}
 */
function buildDateClause(field, value) {
  // Match optional 8-digit from-date + dash + optional 8-digit to-date
  const rangeMatch = value.match(/^(\d{0,8})-(\d{0,8})$/);
  if (rangeMatch) {
    const from = rangeMatch[1] || '*';
    const to   = rangeMatch[2] || '*';
    return `${field}:[${from} TO ${to}]`;
  }
  return `${field}:${value}`;
}
