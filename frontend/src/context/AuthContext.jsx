import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { TOKEN_KEY } from '../api/client'
import * as authApi from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // initial bootstrap
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // Bootstrap: if a token exists, fetch /auth/me to hydrate user
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const stored = localStorage.getItem(TOKEN_KEY)
      if (!stored) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const { user: me } = await authApi.me()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  // React to 401s from the axios interceptor
  useEffect(() => {
    const onUnauthorized = () => clearSession()
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () =>
      window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [clearSession])

  const login = useCallback(
    async (email, password) => {
      const { token: t, user: u } = await authApi.login({ email, password })
      persistSession(t, u)
      return u
    },
    [persistSession]
  )

  const register = useCallback(
    async (payload) => {
      const { token: t, user: u } = await authApi.register(payload)
      persistSession(t, u)
      return u
    },
    [persistSession]
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      hasRole: (roles) => !!user && roles.includes(user.role),
    }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}