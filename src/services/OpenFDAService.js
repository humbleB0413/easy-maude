/**
 * @file OpenFDAService.js
 * @description
 *   Raw API fetch layer for the OpenFDA device/event endpoint.
 *   Handles HTTP 429 rate limiting with exponential backoff.
 *   Returns raw response data only — no business logic.
 */

import { OPENFDA_BASE_URL, RATE_LIMIT } from '../constants/config.js';
import logger from '../utils/logger.js';

/**
 * Builds an OpenFDA API URL without over-encoding Lucene query syntax characters.
 *
 * URLSearchParams encodes ':' → '%3A', '[' → '%5B', ']' → '%5D'.
 * OpenFDA's Lucene parser expects these characters to be literal (or at least
 * properly decoded), and the documented API examples show them unencoded.
 * Using encodeURIComponent then restoring these characters is the safe approach.
 *
 * @param {string} search - Lucene search string
 * @param {number} limit
 * @param {number} skip
 * @param {string|null} apiKey
 * @returns {string}
 */
function buildUrl(search, limit, skip, apiKey) {
  const encodedSearch = encodeURIComponent(search)
    .replace(/%3A/gi, ':')   // field:value separator
    .replace(/%5B/gi, '[')   // range open bracket
    .replace(/%5D/gi, ']')   // range close bracket
    .replace(/%20/g,  '+')   // space → +
    .replace(/%2B/g,  '+');  // literal + signs

  let url = `${OPENFDA_BASE_URL}?search=${encodedSearch}&limit=${limit}&skip=${skip}`;
  if (apiKey) url += `&api_key=${encodeURIComponent(apiKey)}`;
  return url;
}

/**
 * Fetches one page from the OpenFDA API.
 * @param {string} search - OpenFDA Lucene search string
 * @param {number} limit
 * @param {number} skip
 * @param {string|null} apiKey
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ meta: object, results: Array }>}
 */
export async function fetchPage(search, limit, skip, apiKey, signal) {
  const url = buildUrl(search, limit, skip, apiKey);
  logger.api('OpenFDAService', { url, limit, skip });

  let attempt = 0;
  while (attempt <= RATE_LIMIT.MAX_RETRIES) {
    const res = await fetch(url, { signal });

    if (res.status === 429) {
      if (attempt === RATE_LIMIT.MAX_RETRIES) {
        throw new RateLimitError('Rate limit exceeded after max retries');
      }
      const delay = RATE_LIMIT.BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn('OpenFDAService', `Rate limited — retrying in ${delay}ms (attempt ${attempt + 1})`);
      await sleep(delay, signal);
      attempt++;
      continue;
    }

    if (res.status === 404) {
      logger.info('OpenFDAService', 'No results (404)', { search });
      return { meta: { results: { total: 0 } }, results: [] };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      logger.error('OpenFDAService', `HTTP ${res.status}`, { search, body });
      throw new ApiError(`HTTP ${res.status}: ${body?.error?.message ?? 'Unknown error'}`, res.status, body);
    }

    const data = await res.json();
    logger.api('OpenFDAService', null, {
      total:    data.meta?.results?.total,
      returned: data.results?.length,
    });
    return data;
  }
}

/**
 * Fetches only the total record count for a query (limit=1, skip=0).
 * @param {string} search
 * @param {string|null} apiKey
 * @param {AbortSignal} [signal]
 * @returns {Promise<number>}
 */
export async function fetchTotal(search, apiKey, signal) {
  const data = await fetchPage(search, 1, 0, apiKey, signal);
  return data.meta?.results?.total ?? 0;
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name   = 'ApiError';
    this.status = status;
    this.body   = body;
  }
}

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}
