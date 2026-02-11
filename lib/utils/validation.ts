/**
 * CUIT/CUIL validation using mod-11 check digit algorithm.
 * Accepts formats: XXXXXXXXXXX, XX-XXXXXXXX-X
 */
export function validateCUIT(cuit: string): boolean {
  const cleaned = cuit.replace(/-/g, "");
  if (!/^\d{11}$/.test(cleaned)) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = cleaned.split("").map(Number);
  const checkDigit = digits[10];

  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const remainder = sum % 11;
  const expected = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return checkDigit === expected;
}

/** Formats a CUIT/CUIL as XX-XXXXXXXX-X */
export function formatCUIT(cuit: string): string {
  const cleaned = cuit.replace(/\D/g, "");
  if (cleaned.length !== 11) return cuit;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned);
}
