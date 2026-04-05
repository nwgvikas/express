/** India-style 10-digit mobile; +91 / leading 0 allowed in input. */
export function normalizeIndianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const last = digits.slice(-10);
    return /^[6-9]\d{9}$/.test(last) ? last : null;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    const rest = digits.slice(1);
    return /^[6-9]\d{9}$/.test(rest) ? rest : null;
  }
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits) ? digits : null;
  }
  return null;
}
