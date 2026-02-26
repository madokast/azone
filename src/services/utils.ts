/**
 * Utility functions for storage operations.
 */

/**
 * Generates an ID in the format yyyyMMdd-hhmmss-{random 6-character alphanumeric}.
 * @returns A formatted ID string.
 */
export function generateId(): string {
  const now = new Date();
  
  // Format date and time
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Generate random 6-character alphanumeric string
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}-${randomPart}`;
}
