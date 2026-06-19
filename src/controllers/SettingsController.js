/**
 * @file SettingsController.js
 * @description
 *   Handles settings field changes: persists via SettingsModel and
 *   triggers a React state update via the onUpdate callback.
 */

import settingsModel from '../models/SettingsModel.js';
import logger from '../utils/logger.js';

const SettingsController = {
  /**
   * @param {string} key
   * @param {function} onUpdate - receives new settings snapshot
   */
  handleApiKeyChange(key, onUpdate) {
    settingsModel.saveApiKey(key.trim());
    logger.info('SettingsController', 'API key updated');
    onUpdate(settingsModel.toSnapshot());
  },

  /**
   * @param {string} sort
   * @param {function} onUpdate
   */
  handleSortChange(sort, onUpdate) {
    settingsModel.saveDefaultSort(sort);
    logger.info('SettingsController', 'Default sort updated', { sort });
    onUpdate(settingsModel.toSnapshot());
  },
};

export default SettingsController;
