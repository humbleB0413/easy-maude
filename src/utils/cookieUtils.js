/**
 * @file cookieUtils.js
 * @description
 *   AES-encrypted cookie read/write utilities.
 *   Encryption key is derived from an app constant + user-agent hash.
 *   All cookie values must go through these functions — never write plaintext.
 */

import CryptoJS from 'crypto-js';
import { COOKIE_EXPIRES_DAYS } from '../constants/config.js';
import logger from './logger.js';

function getEncryptionKey() {
  return 'maude_v1_' + navigator.userAgent.slice(0, 32);
}

/**
 * Writes an AES-encrypted cookie.
 * @param {string} name - Cookie key
 * @param {string} value - Plaintext value
 * @param {number} days - Expiry in days
 */
export function setCookie(name, value, days = COOKIE_EXPIRES_DAYS) {
  try {
    const encrypted = CryptoJS.AES.encrypt(String(value), getEncryptionKey()).toString();
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(encrypted)};expires=${expires};path=/;SameSite=Strict;Secure`;
  } catch (e) {
    logger.error('cookieUtils', 'setCookie failed', e);
  }
}

/**
 * Reads and decrypts a cookie value.
 * @param {string} name
 * @returns {string|null}
 */
export function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    if (!match) return null;
    const encrypted = decodeURIComponent(match[1]);
    const bytes = CryptoJS.AES.decrypt(encrypted, getEncryptionKey());
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Deletes a cookie by name.
 * @param {string} name
 */
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
