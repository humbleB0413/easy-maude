/**
 * @file ResultModel.js
 * @description
 *   Stores and retrieves search results via IndexedDB.
 *   Results ≤ MAX_STORABLE are stored inline; larger sets are split into
 *   CHUNK_SIZE-record chunks in search_result_chunks and reassembled on load.
 *   Maintains an in-memory cache for the current session.
 */

import { dbPut, dbGet } from '../utils/indexedDBUtils.js';
import { DB_STORES, PAGINATION } from '../constants/config.js';
import logger from '../utils/logger.js';

const resultModel = {
  currentSearchId: null,
  currentResults: [],

  /**
   * Persists results to IndexedDB and updates in-memory cache.
   * Small sets (≤ MAX_STORABLE) stored inline; larger sets stored as chunks.
   * @param {string} searchId
   * @param {string} query
   * @param {Array} results
   * @returns {Promise<number>} estimated dataSize in bytes
   */
  async store(searchId, query, results) {
    this.currentSearchId = searchId;
    this.currentResults  = results;
    const dataSize   = estimateSize(results);
    const createdAt  = new Date().toISOString();

    if (results.length <= PAGINATION.MAX_STORABLE) {
      await dbPut(DB_STORES.RESULTS, {
        searchId, query, totalCount: results.length,
        dataSize, createdAt, results,
      });
      logger.info('ResultModel', `Stored ${results.length} results (inline)`, { searchId });
    } else {
      const chunkCount = Math.ceil(results.length / PAGINATION.CHUNK_SIZE);
      await Promise.all(
        Array.from({ length: chunkCount }, (_, i) =>
          dbPut(DB_STORES.RESULT_CHUNKS, {
            chunkId: `${searchId}_${i}`,
            data: results.slice(i * PAGINATION.CHUNK_SIZE, (i + 1) * PAGINATION.CHUNK_SIZE),
          })
        )
      );
      await dbPut(DB_STORES.RESULTS, {
        searchId, query, totalCount: results.length,
        dataSize, createdAt, chunked: true, chunkCount,
      });
      logger.info('ResultModel', `Stored ${results.length} results (${chunkCount} chunks)`, { searchId });
    }
    return dataSize;
  },

  /**
   * Loads results from IndexedDB into in-memory cache.
   * Reassembles chunked results if needed.
   * @param {string} searchId
   * @returns {Promise<object|null>}
   */
  async load(searchId) {
    const record = await dbGet(DB_STORES.RESULTS, searchId);
    if (!record) return null;

    if (record.chunked) {
      const chunks = await Promise.all(
        Array.from({ length: record.chunkCount }, (_, i) =>
          dbGet(DB_STORES.RESULT_CHUNKS, `${searchId}_${i}`)
        )
      );
      record.results = chunks.flatMap(c => c?.data ?? []);
      logger.info('ResultModel', `Loaded ${record.results.length} results from ${record.chunkCount} chunks`, { searchId });
    }

    this.currentSearchId = record.searchId;
    this.currentResults  = record.results;
    return record;
  },

  getCurrent() {
    return this.currentResults;
  },

  /**
   * Clears the in-memory cache without touching IndexedDB.
   * Called on search cancellation to prevent stale data from being served.
   */
  clearCache() {
    this.currentSearchId = null;
    this.currentResults  = [];
  },
};

/**
 * Estimates serialized size by sampling up to 10 records.
 * Avoids stringifying the full array, which can be hundreds of MB for large datasets.
 * @param {Array} results
 * @returns {number} estimated byte size
 */
function estimateSize(results) {
  if (!results.length) return 0;
  const sampleSize = Math.min(10, results.length);
  const avgBytes = results
    .slice(0, sampleSize)
    .reduce((sum, r) => sum + JSON.stringify(r).length, 0) / sampleSize;
  return Math.round(avgBytes * results.length);
}

export default resultModel;
