export const isEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

// Indian mobile: 10 digits starting 6-9. Accepts +91 / spaces / dashes.
export const isIndianPhone = (v) => {
  const digits = String(v || '').replace(/\D/g, '').slice(-10)
  return /^[6-9]\d{9}$/.test(digits)
}

export const minLen = (v, n) => String(v || '').trim().length >= n

/**
 * Validates a signup payload.
 * Returns { valid: boolean, errors: { field: message } }
 */
export function validateSignup({ email, password, displayName, phone, role }) {
  const errors = {}
  if (!isEmail(email)) errors.email = 'Enter a valid email address'
  if (!minLen(password, 6)) errors.password = 'Password must be at least 6 characters'
  if (!minLen(displayName, 2)) errors.displayName = 'Display name is required'
  if (!isIndianPhone(phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number'
  if (!['household', 'recycler', 'business'].includes(role)) {
    errors.role = 'Choose an account type'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!isEmail(email)) errors.email = 'Enter a valid email address'
  if (!minLen(password, 1)) errors.password = 'Password is required'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateListing({ materialCode, estimatedWeightKg, address }) {
  const errors = {}

  if (!materialCode) errors.materialCode = 'Pick a material'

  const w = Number(estimatedWeightKg)
  if (!estimatedWeightKg) errors.estimatedWeightKg = 'Enter an approximate weight'
  else if (Number.isNaN(w) || w <= 0) errors.estimatedWeightKg = 'Weight must be a positive number'
  else if (w > 500) errors.estimatedWeightKg = 'For bulk (>500 kg), please contact us'

  if (!address?.line1?.trim()) errors.line1 = 'Street address is required'
  if (!address?.city?.trim()) errors.city = 'City is required'
  if (!/^\d{6}$/.test(address?.pincode || '')) errors.pincode = 'Enter a 6-digit pincode'

  return { valid: Object.keys(errors).length === 0, errors }
}