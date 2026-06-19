/**
 * @file ApiKeyValidator.js
 * @description
 *   Validates an OpenFDA API key by format check.
 *   A valid key is a non-empty string of at least 8 characters.
 */

import logger from '../utils/logger.js';

const ApiKeyValidator = {
  /**
   * @param {string} key
   * @returns {boolean}
   */
  validate(key) {
    if (!key || typeof key !== 'string') return false;
    const trimmed = key.trim();
    const valid   = trimmed.length >= 8;
    logger.info('ApiKeyValidator', `Key validation: ${valid}`);
    return valid;
  },
};

export default ApiKeyValidator;
