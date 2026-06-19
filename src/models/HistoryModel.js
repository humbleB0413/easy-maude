/**
 * @file HistoryModel.js
 * @description
 *   IndexedDB search history CRUD.
 *   Auto-cleanup: removes entries older than MAX_AGE_DAYS when total data exceeds MAX_SIZE_BYTES.
 */

import { dbPut, dbGet, dbGetAll, dbDelete, dbClear } from '../utils/indexedDBUtils.js';
import { DB_STORES, HISTORY } from '../constants/config.js';
import logger from '../utils/logger.js';

const historyModel = {
  /**
   * @param {string} searchId
   * @param {string} query
   * @param {number} totalCount
   * @param {number} dataSize - bytes
   */
  async addEntry(searchId, query, totalCount, dataSize) {
    const expiresAt = new Date(Date.now() + HISTORY.MAX_AGE_DAYS * 864e5).toISOString();
    await dbPut(DB_STORES.HISTORY, {
      searchId, query, totalCount, dataSize,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    await this._autoClean();
  },

  /** @returns {Promise<Array>} */
  async getAll() {
    const entries = await dbGetAll(DB_STORES.HISTORY);
    return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Deletes both the history entry and its stored results (including chunks).
   * @param {string} searchId
   */
  async delete(searchId) {
    const result = await dbGet(DB_STORES.RESULTS, searchId);
    if (result?.chunked && result.chunkCount) {
      await Promise.all(
        Array.from({ length: result.chunkCount }, (_, i) =>
          dbDelete(DB_STORES.RESULT_CHUNKS, `${searchId}_${i}`)
        )
      );
    }
    await dbDelete(DB_STORES.HISTORY, searchId);
    await dbDelete(DB_STORES.RESULTS, searchId);
    logger.info('HistoryModel', `Deleted entry ${searchId}`);
  },

  async clearAll() {
    await dbClear(DB_STORES.HISTORY);
    await dbClear(DB_STORES.RESULTS);
    await dbClear(DB_STORES.RESULT_CHUNKS);
    logger.info('HistoryModel', 'Cleared all history');
  },

  async _autoClean() {
    const entries = await dbGetAll(DB_STORES.HISTORY);
    const totalSize = entries.reduce((sum, e) => sum + (e.dataSize ?? 0), 0);
    if (totalSize < HISTORY.MAX_SIZE_BYTES) return;

    const now = Date.now();
    const expired = entries.filter(e => new Date(e.expiresAt).getTime() < now);
    for (const e of expired) {
      await this.delete(e.searchId);
    }
    if (expired.length > 0) {
      logger.info('HistoryModel', `Auto-cleaned ${expired.length} expired entries`);
    }
  },
};

export default historyModel;
