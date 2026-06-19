/**
 * @file SettingsModel.js
 * @description
 *   Settings data model. Loads from and persists to AES-encrypted cookies.
 *   Fields: apiKey, defaultSort.
 */

import { getCookie, setCookie } from '../utils/cookieUtils.js';
import { COOKIE_KEYS } from '../constants/config.js';

const settingsModel = {
  apiKey: '',
  defaultSort: 'date_received:desc',

  loadFromCookie() {
    this.apiKey      = getCookie(COOKIE_KEYS.API_KEY) ?? '';
    this.defaultSort = getCookie(COOKIE_KEYS.DEFAULT_SORT) ?? 'date_received:desc';
  },

  saveApiKey(key) {
    this.apiKey = key;
    setCookie(COOKIE_KEYS.API_KEY, key);
  },

  saveDefaultSort(sort) {
    this.defaultSort = sort;
    setCookie(COOKIE_KEYS.DEFAULT_SORT, sort);
  },

  /**
   * @returns {{ apiKey: string, defaultSort: string }}
   */
  toSnapshot() {
    return {
      apiKey:      this.apiKey,
      defaultSort: this.defaultSort,
    };
  },
};

export default settingsModel;
