/**
 * CUIT/CUIL validation and formatting utilities.
 * Standard Argentine tax identification number (11 digits with checksum).
 */

const CUIT_MULTIPLIERS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/**
 * Strip non-digit characters from a CUIT string.
 */
function stripCuit(cuit: string): string {
  return cuit.replace(/\D/g, "");
}

/**
 * Validate an Argentine CUIT/CUIL number.
 * Accepts formats: 20-12345678-9, 20123456789, 20.12345678.9
 */
export function isValidCuit(cuit: string): boolean {
  const digits = stripCuit(cuit);
  if (digits.length !== 11) return false;

  // Compute checksum
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * CUIT_MULTIPLIERS[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return checkDigit === parseInt(digits[10], 10);
}

/**
 * Format a CUIT as XX-XXXXXXXX-X.
 * Returns the input unchanged if it doesn't contain exactly 11 digits.
 */
export function formatCuit(cuit: string): string {
  const digits = stripCuit(cuit);
  if (digits.length !== 11) return cuit;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits[10]}`;
}
