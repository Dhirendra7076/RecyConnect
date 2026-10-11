import axios from 'axios'
import { mockAdapter } from './mock'

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const TOKEN_KEY = 'recyconnect_token'

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === 'true'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  ...(USE_MOCK ? { adapter: mockAdapter } : {}),
})

if (USE_MOCK) {
  // eslint-disable-next-line no-console
  console.info(
    '%c[RecyConnect] Using MOCK API — no network calls will be made.',
    'background:#10b981;color:white;padding:2px 6px;border-radius:4px;'
  )
}

// ---- Request: attach JWT from localStorage ----
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- Response: unwrap envelope, normalize errors ----
client.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success === false) {
        const err = new Error(body.error?.message || 'Request failed')
        err.code = body.error?.code || 'UNKNOWN'
        err.status = response.status
        throw err
      }
      return body.data
    }
    return body
  },
  (error) => {
    const status = error.response?.status
    const body = error.response?.data
    const message =
      body?.error?.message ||
      error.message ||
      (status ? `Request failed (${status})` : 'Network error')
    const code = body?.error?.code || (status ? `HTTP_${status}` : 'NETWORK')

    const err = new Error(message)
    err.code = code
    err.status = status

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    return Promise.reject(err)
  }
)

export default client