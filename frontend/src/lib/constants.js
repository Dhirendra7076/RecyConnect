// ---------- Roles ----------
export const ROLES = {
  HOUSEHOLD: 'household',
  RECYCLER: 'recycler',
  BUSINESS: 'business',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  household: 'Household',
  recycler: 'Recycler (Kabadiwala)',
  business: 'Business',
  admin: 'Admin',
}

export const ROLE_EMOJI = {
  household: '🏠',
  recycler: '🚛',
  business: '🏭',
  admin: '🛡️',
}

// ---------- Listing statuses ----------
export const LISTING_STATUS = {
  CREATED: 'CREATED',
  OPEN: 'OPEN',
  ACCEPTED: 'ACCEPTED',
  PICKUP_SCHEDULED: 'PICKUP_SCHEDULED',
  COLLECTED: 'COLLECTED',
  PRICE_CONFIRMED: 'PRICE_CONFIRMED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REJECTED: 'REJECTED',
}

// Linear happy-path flow — used by StatusTimeline later.
export const LISTING_FLOW = [
  'CREATED',
  'OPEN',
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'PRICE_CONFIRMED',
  'PAYMENT_PENDING',
  'COMPLETED',
]

export const LISTING_STATUS_LABELS = {
  CREATED: 'Created',
  OPEN: 'Open for pickup',
  ACCEPTED: 'Accepted by recycler',
  PICKUP_SCHEDULED: 'Pickup scheduled',
  COLLECTED: 'Collected',
  PRICE_CONFIRMED: 'Price confirmed',
  PAYMENT_PENDING: 'Payment pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
  REJECTED: 'Rejected',
}

// DaisyUI badge color per status
export const LISTING_STATUS_BADGE = {
  CREATED: 'badge-ghost',
  OPEN: 'badge-info',
  ACCEPTED: 'badge-primary',
  PICKUP_SCHEDULED: 'badge-primary',
  COLLECTED: 'badge-accent',
  PRICE_CONFIRMED: 'badge-accent',
  PAYMENT_PENDING: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-neutral',
  DISPUTED: 'badge-error',
  REJECTED: 'badge-error',
}

// ---------- Materials ----------
export const MATERIALS = [
  { code: 'newspaper', label: 'Newspaper', emoji: '📰', unit: 'kg' },
  { code: 'cardboard', label: 'Cardboard', emoji: '📦', unit: 'kg' },
  { code: 'pet_plastic', label: 'PET Plastic', emoji: '🧴', unit: 'kg' },
  { code: 'hdpe_plastic', label: 'HDPE Plastic', emoji: '🧴', unit: 'kg' },
  { code: 'aluminium', label: 'Aluminium', emoji: '🥫', unit: 'kg' },
  { code: 'copper', label: 'Copper', emoji: '🔶', unit: 'kg' },
  { code: 'steel', label: 'Steel', emoji: '🔩', unit: 'kg' },
  { code: 'e_waste', label: 'E-Waste', emoji: '💻', unit: 'kg' },
]

export const MATERIAL_BY_CODE = Object.fromEntries(
  MATERIALS.map((m) => [m.code, m])
)

export const getMaterial = (code) =>
  MATERIAL_BY_CODE[code] || { code, label: code, emoji: '♻️', unit: 'kg' }