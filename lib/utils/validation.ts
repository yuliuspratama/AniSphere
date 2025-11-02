/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username (alphanumeric, underscore, dash, 3-20 chars)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 6 characters
  return password.length >= 6;
}

/**
 * Validate anime ID (must be numeric string)
 */
export function isValidAnimeId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Validate search query (prevent injection)
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>\"']/g, ""); // Remove potentially dangerous chars
}

/**
 * Validate integer within range
 */
export function isValidInteger(value: string | number, min: number, max: number): boolean {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  return !isNaN(num) && num >= min && num <= max;
}

