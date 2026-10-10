// In-memory fake backend for local frontend dev when the real API isn't running.
// Toggle with VITE_USE_MOCK in .env. Delete this file once the real backend is deployed.

const USERS_KEY = 'recyconnect_mock_users'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

function ok(data, config) {
  return {
    data: { success: true, data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function fail(status, code, message, config) {
  const error = new Error(message)
  error.config = config
  error.response = {
    status,
    statusText: code,
    headers: {},
    config,
    data: { success: false, error: { code, message } },
  }
  return error
}

function parseBody(config) {
  if (!config.data) return {}
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data)
    } catch {
      return {}
    }
  }
  return config.data
}

function getTokenUserId(config) {
  const auth =
    config.headers?.Authorization || config.headers?.authorization || ''
  const m = /^Bearer mock_(\d+)$/.exec(auth)
  return m ? Number(m[1]) : null
}

const MATERIALS = [
  { code: 'newspaper', label: 'Newspaper', pricePerKg: 12 },
  { code: 'cardboard', label: 'Cardboard', pricePerKg: 8 },
  { code: 'pet_plastic', label: 'PET Plastic', pricePerKg: 20 },
  { code: 'hdpe_plastic', label: 'HDPE Plastic', pricePerKg: 25 },
  { code: 'aluminium', label: 'Aluminium', pricePerKg: 130 },
  { code: 'copper', label: 'Copper', pricePerKg: 480 },
  { code: 'steel', label: 'Steel', pricePerKg: 35 },
  { code: 'e_waste', label: 'E-Waste', pricePerKg: 90 },
]

/**
 * Axios adapter. Same envelope shape as the real backend:
 *   { success: true, data } | { success: false, error: { code, message } }
 */
export async function mockAdapter(config) {
  await delay(250)

  const method = (config.method || 'get').toLowerCase()
  const url = (config.url || '').replace(/^\/+/, '').split('?')[0]
  const body = parseBody(config)

  // ---------- auth ----------
  if (method === 'post' && url === 'auth/register') {
    const { email, password, role, displayName, phone } = body
    if (!email || !password || !role || !displayName || !phone) {
      throw fail(400, 'BAD_REQUEST', 'Missing required fields', config)
    }
    const users = readUsers()
    if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      throw fail(409, 'EMAIL_TAKEN', 'That email is already registered', config)
    }
    const user = {
      id: users.length + 1,
      email,
      password,
      role,
      displayName,
      phone,
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    writeUsers(users)
    const { password: _pw, ...safe } = user
    return ok({ token: `mock_${user.id}`, user: safe }, config)
  }

  if (method === 'post' && url === 'auth/login') {
    const { email, password } = body
    const users = readUsers()
    const user = users.find(
      (u) => u.email.toLowerCase() === String(email || '').toLowerCase()
    )
    if (!user || user.password !== password) {
      throw fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password', config)
    }
    const { password: _pw, ...safe } = user
    return ok({ token: `mock_${user.id}`, user: safe }, config)
  }

  if (method === 'get' && url === 'auth/me') {
    const userId = getTokenUserId(config)
    if (!userId) throw fail(401, 'UNAUTHORIZED', 'Missing or invalid token', config)
    const user = readUsers().find((u) => u.id === userId)
    if (!user) throw fail(401, 'UNAUTHORIZED', 'User not found', config)
    const { password: _pw, ...safe } = user
    return ok({ user: safe }, config)
  }

  // ---------- materials ----------
  if (method === 'get' && url === 'materials') {
    return ok(MATERIALS, config)
  }

  // ---------- catch-all ----------
  throw fail(
    404,
    'NOT_FOUND',
    `Mock has no handler for ${method.toUpperCase()} /${url}`,
    config
  )
}