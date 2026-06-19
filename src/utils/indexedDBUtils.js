/**
 * @file indexedDBUtils.js
 * @description
 *   Promise-based IndexedDB wrapper for maude_search_db.
 *   Stores: search_results (metadata + inline results ≤ 10k), search_history (metadata only),
 *   search_result_chunks (5k-record chunks for large result sets).
 *   Functions: dbPut, dbGet, dbGetAll, dbDelete, dbClear.
 */

import { DB_NAME, DB_VERSION, DB_STORES } from '../constants/config.js';
import logger from './logger.js';

let db = null;

async function openDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(DB_STORES.RESULTS)) {
        database.createObjectStore(DB_STORES.RESULTS, { keyPath: 'searchId' });
      }
      if (!database.objectStoreNames.contains(DB_STORES.HISTORY)) {
        database.createObjectStore(DB_STORES.HISTORY, { keyPath: 'searchId' });
      }
      if (!database.objectStoreNames.contains(DB_STORES.RESULT_CHUNKS)) {
        database.createObjectStore(DB_STORES.RESULT_CHUNKS, { keyPath: 'chunkId' });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    req.onerror = (e) => {
      logger.error('indexedDBUtils', 'Failed to open DB', e);
      reject(e);
    };
  });
}

/**
 * @param {string} storeName
 * @param {object} value - Must include the store's keyPath field
 * @returns {Promise<IDBValidKey>}
 */
export async function dbPut(storeName, value) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e);
  });
}

/**
 * @param {string} storeName
 * @param {IDBValidKey} key
 * @returns {Promise<object|null>}
 */
export async function dbGet(storeName, key) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = (e) => reject(e);
  });
}

/**
 * @param {string} storeName
 * @returns {Promise<Array>}
 */
export async function dbGetAll(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e);
  });
}

/**
 * @param {string} storeName
 * @param {IDBValidKey} key
 * @returns {Promise<void>}
 */
export async function dbDelete(storeName, key) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

/**
 * @param {string} storeName
 * @returns {Promise<void>}
 */
export async function dbClear(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).clear();
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}
