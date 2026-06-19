/**
 * @file sanitize.js
 * @description
 *   XSS prevention for user inputs before use in API queries or rendering.
 *   Functions: sanitize, stripHtml, sanitizeQuery.
 */

/**
 * Encodes HTML special characters.
 * @param {string} input
 * @returns {string}
 */
export function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strips all HTML tags, returns plain text.
 * @param {string} input
 * @returns {string}
 */
export function stripHtml(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a search query: strips HTML while preserving tag:value and pipe syntax.
 * @param {string} query
 * @returns {string}
 */
export function sanitizeQuery(query) {
  return stripHtml(query).trim();
}
