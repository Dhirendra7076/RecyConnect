import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * <ProtectedRoute roles={['household']}> <Page /> </ProtectedRoute>
 * - Not logged in → redirect to /login (preserves intended path)
 * - Logged in but wrong role → redirect to /dashboard
 * - No `roles` prop → any authenticated user passes
 */
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}