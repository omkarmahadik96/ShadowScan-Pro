/**
 * System Logger
 * Centralized logging for tracking monitoring activity and errors.
 */

export const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${new Date().toISOString()}: ${msg}`, meta || ''),
  debug: (msg: string, meta?: any) => console.log(`[DEBUG] ${new Date().toISOString()}: ${msg}`, meta || ''),
  monitor: (source: string, msg: string) => console.log(`[MONITOR][${source}] ${msg}`),
};
