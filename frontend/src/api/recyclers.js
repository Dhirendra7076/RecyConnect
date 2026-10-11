import client from './client'

export async function getMatch(listingId) {
  // returns { listing, matches: [{ recycler, distanceKm, estimatedPickupIn }] }
  return client.get('/match', { params: { listingId } })
}

export async function getRecycler(id) {
  // returns a recycler profile
  return client.get(`/recyclers/${id}`)
}

export async function getMyRecyclerProfile() {
  // returns { recycler }
  return client.get('/recyclers/me')
}

export async function updateMyRecyclerProfile(patch) {
  // returns { recycler }
  return client.patch('/recyclers/me', patch)
}