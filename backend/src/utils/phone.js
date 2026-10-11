export function normalizePhone(input) {
  if (!input) return null;
  let s = String(input).replace(/[\s\-()]/g, "");

  if (s.startsWith("+")) return s;                        // already E.164
  if (s.startsWith("91") && s.length === 12) return `+${s}`; // 91XXXXXXXXXX
  if (s.length === 10) return `+91${s}`;                  // XXXXXXXXXX

  return s; // fallback — let DB validation reject if invalid
}

export function isValidIndianPhone(input) {
  if (!input) return false;
  const normalized = normalizePhone(input);
  return /^\+91[6-9]\d{9}$/.test(normalized);
}