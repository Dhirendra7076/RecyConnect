import client from './client'

export async function createListing(payload) {
  // payload: { materialCode, estimatedWeightKg, description, photoUrls, address }
  return client.post('/listings', payload)
}

export async function listOwnListings() {
  return client.get('/listings')
}

export async function getListing(id) {
  return client.get(`/listings/${id}`)
}

export async function acceptListing(id) {
  return client.post(`/listings/${id}/accept`)
}

export async function updateListingStatus(id, status, extra = {}) {
  // extra can carry { recyclerId, recyclerName, ... } for demo assignment
  return client.patch(`/listings/${id}/status`, { status, ...extra })
}

export async function completeListing(id, payload) {
  // payload: { finalWeightKg, finalPrice, notes? }
  return client.post(`/listings/${id}/complete`, payload)
}