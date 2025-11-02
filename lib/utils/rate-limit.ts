/**
 * Simple rate limiting utility
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit check
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false if exceeded
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    // Create new record
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

/**
 * Clean up old rate limit records
 */
export function cleanupRateLimit(olderThanMs: number = 3600000) {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime + olderThanMs) {
      delete store[key];
    }
  });
}

// Cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(() => cleanupRateLimit(), 3600000);
}

