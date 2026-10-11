import client from './client'

export async function listMaterials() {
  // returns array of { code, label, pricePerKg }
  return client.get('/materials')
}

export async function getMaterialByCode(code) {
  // returns a single material object
  return client.get(`/materials/${code}`)
}