// In-memory fake backend for local frontend dev when the real API isn't running.
// Toggle with VITE_USE_MOCK in .env. Delete this file once the real backend is deployed.

import { cityToCoords, jitter, haversineKm } from '../lib/geo'

const USERS_KEY = 'recyconnect_mock_users'
const LISTINGS_KEY = 'recyconnect_mock_listings'

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const readUsers = () => readJson(USERS_KEY, [])
const writeUsers = (u) => writeJson(USERS_KEY, u)
const readListings = () => readJson(LISTINGS_KEY, [])
const writeListings = (l) => writeJson(LISTINGS_KEY, l)

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
  // FormData or already-parsed object
  return config.data
}

function getTokenUserId(config) {
  const auth =
    config.headers?.Authorization || config.headers?.authorization || ''
  const m = /^Bearer mock_(\d+)$/.exec(auth)
  return m ? Number(m[1]) : null
}

function requireUser(config) {
  const id = getTokenUserId(config)
  if (!id) throw fail(401, 'UNAUTHORIZED', 'Missing or invalid token', config)
  const user = readUsers().find((u) => u.id === id)
  if (!user) throw fail(401, 'UNAUTHORIZED', 'User not found', config)
  return user
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

// ---- NEW ----
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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
    const user = requireUser(config)
    const { password: _pw, ...safe } = user
    return ok({ user: safe }, config)
  }

  // ---------- materials ----------
  if (method === 'get' && url === 'materials') {
    return ok(MATERIALS, config)
  }

  // ---------- uploads ---- NEW ----
  if (method === 'post' && url === 'uploads') {
    requireUser(config)
    const fd = config.data
    const file =
      fd && typeof fd.get === 'function' ? fd.get('file') : null
    if (!file) {
      throw fail(400, 'BAD_REQUEST', 'No file provided', config)
    }
    // Return a real data URL so previews work offline.
    const dataUrl = await fileToDataUrl(file)
    return ok({ url: dataUrl }, config)
  }

  // ---------- listings ---- NEW ----
  if (method === 'post' && url === 'listings') {
    const user = requireUser(config)
    if (user.role !== 'household') {
      throw fail(403, 'FORBIDDEN', 'Only households can create listings', config)
    }
    const { materialCode, estimatedWeightKg, description, photoUrls, address } = body
    if (!materialCode || !estimatedWeightKg) {
      throw fail(400, 'BAD_REQUEST', 'Missing material or weight', config)
    }

    const listings = readListings()
    const now = new Date().toISOString()
    const listing = {
      id: listings.length + 1,
      householdId: user.id,
      householdName: user.displayName,
      materialCode,
      estimatedWeightKg: Number(estimatedWeightKg),
      description: description || '',
      photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
      address: {
        line1: address?.line1 || '',
        city: address?.city || '',
        pincode: address?.pincode || '',
      },
      status: 'OPEN', // created as OPEN so it's immediately matchable
      acceptedBy: null,
      recyclerId: null,
      recyclerName: null,
      finalWeightKg: null,
      finalPrice: null,
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: 'OPEN', at: now, by: user.id }],
    }
    listings.push(listing)
    writeListings(listings)
    return ok(listing, config)
  }

    if (method === 'get' && url === 'listings') {
    const user = requireUser(config)
    const listings = readListings()
    let visible = []

    if (user.role === 'household') {
      visible = listings.filter((l) => l.householdId === user.id)
    } else if (user.role === 'recycler') {
      // Recyclers see OPEN requests (any household) + their own assigned pickups.
      const open = listings.filter((l) => l.status === 'OPEN')
      const mine = listings.filter((l) => l.recyclerId === user.id)
      const seen = new Set()
      visible = [...mine, ...open].filter((l) => {
        if (seen.has(l.id)) return false
        seen.add(l.id)
        return true
      })
    } else {
      visible = listings
    }

    visible = [...visible].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    return ok(visible, config)
  }

  // /listings/:id
  const listingMatch = /^listings\/(\d+)$/.exec(url)
  if (listingMatch && method === 'get') {
    const user = requireUser(config)
    const id = Number(listingMatch[1])
    const listing = readListings().find((l) => l.id === id)
    if (!listing) throw fail(404, 'NOT_FOUND', 'Listing not found', config)

    const isOwner = listing.householdId === user.id
    const isAssignedRecycler = listing.recyclerId === user.id
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAssignedRecycler && !isAdmin) {
      // Recyclers browsing OPEN listings in Step 9 will need this — allow it here.
      if (user.role === 'recycler' && listing.status === 'OPEN') {
        return ok(listing, config)
      }
      throw fail(403, 'FORBIDDEN', 'Not allowed to view this listing', config)
    }
    return ok(listing, config)
  }

    // ---------- POST /listings/:id/accept ---- NEW ----
  const acceptMatch = /^listings\/(\d+)\/accept$/.exec(url)
  if (acceptMatch && method === 'post') {
    const user = requireUser(config)
    if (user.role !== 'recycler') {
      throw fail(403, 'FORBIDDEN', 'Only recyclers can accept listings', config)
    }
    const id = Number(acceptMatch[1])
    const listings = readListings()
    const idx = listings.findIndex((l) => l.id === id)
    if (idx === -1) throw fail(404, 'NOT_FOUND', 'Listing not found', config)
    const listing = listings[idx]
    if (listing.status !== 'OPEN') {
      throw fail(409, 'CONFLICT', 'This listing is no longer open', config)
    }
    const now = new Date().toISOString()
    listing.status = 'ACCEPTED'
    listing.recyclerId = user.id
    listing.recyclerName = user.displayName
    listing.updatedAt = now
    listing.statusHistory = [
      ...(listing.statusHistory || []),
      { status: 'ACCEPTED', at: now, by: user.id },
    ]
    listings[idx] = listing
    writeListings(listings)
    return ok(listing, config)
  }

    // ---------- PATCH /listings/:id/status ----------
  const statusMatch = /^listings\/(\d+)\/status$/.exec(url)
  if (statusMatch && method === 'patch') {
    const user = requireUser(config)
    const id = Number(statusMatch[1])
    const listings = readListings()
    const idx = listings.findIndex((l) => l.id === id)
    if (idx === -1) throw fail(404, 'NOT_FOUND', 'Listing not found', config)
    const listing = listings[idx]

    const newStatus = body?.status
    if (!newStatus) throw fail(400, 'BAD_REQUEST', 'Missing status', config)

    const isOwner = listing.householdId === user.id
    const isAssigned = listing.recyclerId === user.id
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAssigned && !isAdmin) {
      throw fail(403, 'FORBIDDEN', 'Not allowed on this listing', config)
    }

    // ----- role-based transition rules -----
    const RECYCLER_FLOW = [
      'PICKUP_SCHEDULED',
      'COLLECTED',
      'PRICE_CONFIRMED',
      'PAYMENT_PENDING',
      'COMPLETED',
    ]
    const HOUSEHOLD_ALLOWED = ['CANCELLED', 'ACCEPTED', 'PAYMENT_PENDING']

    if (user.role === 'household' && isOwner) {
      if (!HOUSEHOLD_ALLOWED.includes(newStatus)) {
        throw fail(
          403,
          'FORBIDDEN',
          'Households can only cancel or assign a recycler',
          config
        )
      }
      if (newStatus === 'ACCEPTED' && !body?.recyclerId) {
        throw fail(400, 'BAD_REQUEST', 'Missing recyclerId for assignment', config)
      }
    }

    if (user.role === 'recycler' && isAssigned) {
      if (!RECYCLER_FLOW.includes(newStatus)) {
        throw fail(
          403,
          'FORBIDDEN',
          'Invalid recycler transition',
          config
        )
      }
    }

    const now = new Date().toISOString()
    listing.status = newStatus
    listing.updatedAt = now

    if (user.role === 'household' && newStatus === 'ACCEPTED') {
      listing.recyclerId = body.recyclerId
      listing.recyclerName = body.recyclerName || 'Recycler'
    }

    listing.statusHistory = [
      ...(listing.statusHistory || []),
      { status: newStatus, at: now, by: user.id },
    ]
    listings[idx] = listing
    writeListings(listings)
    return ok(listing, config)
  }

    // ---------- seed recyclers ---- NEW ----
  // Six recyclers around the listing's city. Used by /match.
  const SEED_RECYCLERS = [
    { id: 101, displayName: 'Ravi Kumar', phone: '9876543210', rating: 4.8, pickupsCompleted: 240, materials: ['newspaper', 'cardboard', 'pet_plastic'], seed: 1, city: 'Bengaluru' },
    { id: 102, displayName: 'Sunita Devi', phone: '9876543211', rating: 4.9, pickupsCompleted: 312, materials: ['newspaper', 'cardboard', 'aluminium', 'steel'], seed: 2, city: 'Bengaluru' },
    { id: 103, displayName: 'Mohammed Iqbal', phone: '9876543212', rating: 4.7, pickupsCompleted: 178, materials: ['e_waste', 'copper', 'aluminium'], seed: 3, city: 'Bengaluru' },
    { id: 104, displayName: 'Lakshmi Narayan', phone: '9876543213', rating: 4.6, pickupsCompleted: 96, materials: ['pet_plastic', 'hdpe_plastic'], seed: 4, city: 'Bengaluru' },
    { id: 105, displayName: 'Arjun Reddy', phone: '9876543214', rating: 4.5, pickupsCompleted: 54, materials: ['newspaper', 'cardboard', 'pet_plastic', 'hdpe_plastic'], seed: 5, city: 'Bengaluru' },
    { id: 106, displayName: 'Kavya Iyer', phone: '9876543215', rating: 5.0, pickupsCompleted: 22, materials: ['copper', 'e_waste'], seed: 6, city: 'Bengaluru' },
  ]

  // ---------- GET /match?listingId=X ---- NEW ----
  if (method === 'get' && url === 'match') {
    const user = requireUser(config)
    if (user.role !== 'household') {
      throw fail(403, 'FORBIDDEN', 'Only households can request matches', config)
    }
    const listingId = Number(config.params?.listingId)
    if (!listingId) throw fail(400, 'BAD_REQUEST', 'Missing listingId', config)

    const listing = readListings().find((l) => l.id === listingId)
    if (!listing) throw fail(404, 'NOT_FOUND', 'Listing not found', config)
    if (listing.householdId !== user.id) {
      throw fail(403, 'FORBIDDEN', 'Not your listing', config)
    }

    const center = cityToCoords(listing.address?.city)
    const listingCoords = jitter(center, listing.id + 100)

    const recyclers = SEED_RECYCLERS.map((r) => {
      const coords = jitter(center, r.seed + 10)
      const distanceKm = haversineKm(listingCoords, coords)
      // Slight preference for recyclers who handle the material
      const handles = r.materials.includes(listing.materialCode) ? 0.85 : 1.4
      return {
        recycler: {
          id: r.id,
          displayName: r.displayName,
          phone: r.phone,
          rating: r.rating,
          pickupsCompleted: r.pickupsCompleted,
          materials: r.materials,
          lat: coords.lat,
          lng: coords.lng,
          city: r.city,
        },
        distanceKm: distanceKm * handles,
        estimatedPickupIn:
          distanceKm < 2 ? 'Within 2 hours' : distanceKm < 5 ? '2–4 hours' : 'Same day',
      }
    })

    recyclers.sort((a, b) => a.distanceKm - b.distanceKm)
    // Return top 5 for a clean UI
    return ok(
      {
        listing: {
          ...listing,
          lat: listingCoords.lat,
          lng: listingCoords.lng,
        },
        matches: recyclers.slice(0, 5),
      },
      config
    )
  }

  // ---------- GET /recyclers/:id ---- NEW ----
  const recyclerMatch = /^recyclers\/(\d+)$/.exec(url)
  if (recyclerMatch && method === 'get') {
    requireUser(config)
    const id = Number(recyclerMatch[1])
    const seed = SEED_RECYCLERS.find((r) => r.id === id)
    if (!seed) throw fail(404, 'NOT_FOUND', 'Recycler not found', config)
    const center = cityToCoords(seed.city)
    const coords = jitter(center, seed.seed + 10)
    const { seed: _s, ...safe } = seed
    return ok({ ...safe, lat: coords.lat, lng: coords.lng }, config)
  }

    // ---------- POST /listings/:id/complete ---- NEW ----
  const completeMatch = /^listings\/(\d+)\/complete$/.exec(url)
  if (completeMatch && method === 'post') {
    const user = requireUser(config)
    if (user.role !== 'recycler') {
      throw fail(403, 'FORBIDDEN', 'Only recyclers can complete listings', config)
    }
    const id = Number(completeMatch[1])
    const listings = readListings()
    const idx = listings.findIndex((l) => l.id === id)
    if (idx === -1) throw fail(404, 'NOT_FOUND', 'Listing not found', config)
    const listing = listings[idx]

    if (listing.recyclerId !== user.id) {
      throw fail(403, 'FORBIDDEN', 'You are not assigned to this pickup', config)
    }
    if (listing.status !== 'COLLECTED') {
      throw fail(
        409,
        'CONFLICT',
        'Pickup must be collected before entering weight and price',
        config
      )
    }

    const { finalWeightKg, finalPrice } = body
    const w = Number(finalWeightKg)
    const p = Number(finalPrice)
    if (!w || w <= 0 || Number.isNaN(w)) {
      throw fail(400, 'BAD_REQUEST', 'Invalid final weight', config)
    }
    if (!p || p < 0 || Number.isNaN(p)) {
      throw fail(400, 'BAD_REQUEST', 'Invalid final price', config)
    }

    const now = new Date().toISOString()
    listing.finalWeightKg = w
    listing.finalPrice = p
    listing.status = 'PRICE_CONFIRMED'
    listing.updatedAt = now
    listing.statusHistory = [
      ...(listing.statusHistory || []),
      { status: 'PRICE_CONFIRMED', at: now, by: user.id },
    ]
    listings[idx] = listing
    writeListings(listings)
    return ok(listing, config)
  }

    // ---------- Impact + Transactions ---- NEW ----
  const CO2_FACTORS = {
    newspaper: 0.9,
    cardboard: 0.7,
    pet_plastic: 1.5,
    hdpe_plastic: 1.4,
    aluminium: 9.0,
    copper: 3.5,
    steel: 1.8,
    e_waste: 2.0,
  }
  const TREES_PER_KG_CO2 = 1 / 21

  function completedForUser(user) {
    const listings = readListings()
    return listings.filter((l) => {
      if (l.status !== 'COMPLETED') return false
      if (user.role === 'household') return l.householdId === user.id
      if (user.role === 'recycler') return l.recyclerId === user.id
      return true // business / admin
    })
  }

  if (method === 'get' && url === 'impact/summary') {
    const user = requireUser(config)
    const mine = completedForUser(user)

    const totalKg = mine.reduce((s, l) => s + (l.finalWeightKg || 0), 0)
    const totalValue = mine.reduce((s, l) => s + (l.finalPrice || 0), 0)
    const co2SavedKg = mine.reduce((s, l) => {
      const factor = CO2_FACTORS[l.materialCode] || 1
      return s + (l.finalWeightKg || 0) * factor
    }, 0)

    return ok(
      {
        completedCount: mine.length,
        totalKg,
        totalValue,
        co2SavedKg,
        treesEquivalent: co2SavedKg * TREES_PER_KG_CO2,
      },
      config
    )
  }

  if (method === 'get' && url === 'impact/breakdown') {
    const user = requireUser(config)
    const mine = completedForUser(user)

    const byCode = {}
    for (const l of mine) {
      const k = l.materialCode
      if (!byCode[k]) byCode[k] = { code: k, kg: 0, value: 0, count: 0 }
      byCode[k].kg += l.finalWeightKg || 0
      byCode[k].value += l.finalPrice || 0
      byCode[k].count += 1
    }
    const breakdown = Object.values(byCode).sort((a, b) => b.kg - a.kg)
    return ok(breakdown, config)
  }

  if (method === 'get' && url === 'transactions') {
    const user = requireUser(config)
    const mine = completedForUser(user).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )
    return ok(mine, config)
  }

  // ---------- catch-all ----------
  throw fail(
    404,
    'NOT_FOUND',
    `Mock has no handler for ${method.toUpperCase()} /${url}`,
    config
  )
}