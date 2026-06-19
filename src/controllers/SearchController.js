/**
 * @file SearchController.js
 * @description
 *   Orchestrates the full search flow: query building → total count →
 *   page fetching (with DateSplitter for >10k results) → progress callbacks.
 *
 *   All records matching the query are fetched with no artificial cap.
 *   When total > 10,000, DateSplitter handles recursive date-range splitting.
 */

import { buildOpenFDAQuery } from './QueryBuilder.js';
import { fetchTotal, fetchPage } from '../services/OpenFDAService.js';
import { fetchAllWithSplitting } from './DateSplitter.js';
import { PAGINATION } from '../constants/config.js';
import logger from '../utils/logger.js';

const SearchController = {
  /**
   * Executes a search end-to-end and returns all matching results.
   * @param {string} rawQuery - User input string
   * @param {{ apiKey: string }} settings
   * @param {function} onProgress - ({ received, total, windowReceived?, windowTotal?, windowDateRange? }) => void
   * @param {AbortSignal} signal
   * @returns {Promise<{ results: Array, searchId: string }>}
   */
  async execute(rawQuery, settings, onProgress, signal) {
    logger.info('SearchController', 'Starting search', { rawQuery });

    const { search, dateRange } = buildOpenFDAQuery(rawQuery);
    const { apiKey } = settings;

    const total = await fetchTotal(search, apiKey, signal);

    logger.info('SearchController', `Records total=${total}`);
    onProgress({ received: 0, total });

    if (total === 0) {
      return { results: [], searchId: String(Date.now()) };
    }

    let results;

    if (total > PAGINATION.MAX_RECORDS) {
      // DateSplitter recursively splits date ranges until each window ≤ 10,000.
      // Passing total as cap ensures all matching records are collected.
      results = await fetchAllWithSplitting(
        search,
        dateRange,
        apiKey,
        signal,
        total,
        onProgress,
      );
    } else {
      results = [];
      const pageCount = Math.ceil(total / PAGINATION.MAX_LIMIT);
      for (let page = 0; page < pageCount; page++) {
        const skip = page * PAGINATION.MAX_LIMIT;
        const data = await fetchPage(search, PAGINATION.MAX_LIMIT, skip, apiKey, signal);
        if (data.results?.length) {
          results.push(...data.results);
          onProgress({ received: results.length, total });
        }
      }
    }

    const searchId = String(Date.now());
    logger.info('SearchController', `Search complete: ${results.length} records`, { searchId });
    return { results, searchId };
  },
};

export default SearchController;
