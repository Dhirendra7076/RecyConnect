import client from './client'

export async function getImpactSummary() {
  // returns { completedCount, totalKg, totalValue, co2SavedKg, treesEquivalent }
  return client.get('/impact/summary')
}

export async function getImpactBreakdown() {
  // returns [{ code, kg, value, count }]
  return client.get('/impact/breakdown')
}