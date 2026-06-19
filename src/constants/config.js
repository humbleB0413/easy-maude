/**
 * @file config.js
 * @description
 *   App-wide constants: API endpoints, cookie keys, pagination limits,
 *   date-splitter intervals, IndexedDB config, history retention policy.
 */

export const OPENFDA_BASE_URL = 'https://api.fda.gov/device/event.json';

export const COOKIE_KEYS = {
  API_KEY: 'openfda_api_key',
  DEFAULT_SORT: 'default_sort',
};

export const COOKIE_EXPIRES_DAYS = 365;

export const DB_NAME = 'maude_search_db';
export const DB_VERSION = 2;
export const DB_STORES = {
  RESULTS:       'search_results',
  HISTORY:       'search_history',
  RESULT_CHUNKS: 'search_result_chunks',
};

export const PAGINATION = {
  MAX_LIMIT:   1_000,   // records per API request (API ceiling)
  MAX_SKIP:   25_000,   // API skip ceiling (confirmed: "Skip value must 25000 or less")
  MAX_RECORDS: 26_000,  // DateSplitter trigger: MAX_SKIP(25,000) + MAX_LIMIT(1,000)
  PAGE_SIZE:      10,   // UI table page size
  MAX_STORABLE:  10_000, // inline storage threshold; larger sets are stored as chunks
  CHUNK_SIZE:    5_000,  // records per chunk for chunked IndexedDB storage
};

// Ordered from largest to smallest interval — used by DateSplitter recursion
export const DATE_SPLIT_INTERVALS = [
  { unit: 'year',  months: 12 },
  { unit: '6mo',   months: 6  },
  { unit: '3mo',   months: 3  },
  { unit: '1mo',   months: 1  },
  { unit: '1wk',   days: 7    },
  { unit: '3day',  days: 3    },
  { unit: '1day',  days: 1    },
];

export const RATE_LIMIT = {
  MAX_RETRIES: 5,
  BASE_DELAY_MS: 1000,
};

export const HISTORY = {
  MAX_SIZE_BYTES: 200 * 1024 * 1024,
  MAX_AGE_DAYS: 30,
};

export const DEFAULT_DATE_RANGE_START = '19900101';

export const ADSENSE = {
  CLIENT: import.meta.env.VITE_ADSENSE_CLIENT ?? '',
  SLOTS: {
    SEARCH_BANNER:   import.meta.env.VITE_ADSENSE_SLOT_SEARCH    ?? '',
    PROGRESS_BANNER: import.meta.env.VITE_ADSENSE_SLOT_PROGRESS  ?? '',
    RESULT_BANNER:   import.meta.env.VITE_ADSENSE_SLOT_RESULT    ?? '',
  },
};
