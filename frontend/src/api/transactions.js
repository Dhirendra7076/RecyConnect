import client from './client'

export async function listTransactions() {
  // returns array of transaction summaries for the current user
  return client.get('/transactions')
}