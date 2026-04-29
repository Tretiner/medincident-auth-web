/**
 * Просто прокидываем миллисекунды дальше
 */
export const timestampFromMs = (ms: number): number => ms;

/**
 * Превращаем миллисекунды в Date
 */
export const timestampDate = (ms: number): Date => new Date(ms);
