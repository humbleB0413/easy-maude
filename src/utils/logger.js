/**
 * @file logger.js
 * @description
 *   Debug/Release mode logger. All output suppressed in production.
 *   Methods: info, warn, error, api.
 */

const isDev = import.meta.env.DEV;

const logger = {
  info:  (tag, message, data)  => { if (isDev) console.info(`[${tag}]`, message, data ?? ''); },
  warn:  (tag, message, data)  => { if (isDev) console.warn(`[${tag}]`, message, data ?? ''); },
  error: (tag, message, error) => { if (isDev) console.error(`[${tag}]`, message, error ?? ''); },
  api:   (tag, req, res)       => { if (isDev) console.log(`[API:${tag}]`, req ?? '', res ?? ''); },
};

export default logger;
