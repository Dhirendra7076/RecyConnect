import client from './client'

export async function register({ email, password, role, displayName, phone }) {
  // returns { token, user }
  return client.post('/auth/register', {
    email,
    password,
    role,
    displayName,
    phone,
  })
}

export async function login({ email, password }) {
  // returns { token, user }
  return client.post('/auth/login', { email, password })
}

export async function me() {
  // returns { user }
  return client.get('/auth/me')
}