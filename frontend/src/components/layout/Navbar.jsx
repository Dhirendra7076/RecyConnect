import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ROLE_LABELS } from '../../lib/constants'
import { initials } from '../../lib/formatters'

export default function Navbar() {
  const { user, logout } = useAuth()
  const toast = useToast()

  return (
    <header className="sticky top-0 z-30 bg-base-100 border-b border-base-300">
      <div className="navbar min-h-14 px-2 lg:px-4 gap-1">
        {/* Mobile drawer toggle — controls #app-drawer in AppLayout */}
        <label
          htmlFor="app-drawer"
          className="btn btn-ghost btn-square lg:hidden"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </label>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-bold text-emerald-800 px-1"
        >
          <span aria-hidden="true">♻️</span>
          <span className="hidden sm:inline">RecyConnect</span>
        </Link>

        <div className="flex-1" />

        {/* User menu */}
        {user && (
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm gap-2 px-1"
              aria-label="User menu"
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-xs font-bold">{initials(user.displayName)}</span>
                </div>
              </div>
              <span className="hidden md:inline text-sm font-medium max-w-[8rem] truncate">
                {user.displayName}
              </span>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box shadow-lg z-40 w-60 p-2 mt-1"
            >
              <li className="menu-title text-xs">
                <span className="opacity-70">{ROLE_LABELS[user.role] || user.role}</span>
              </li>
              <li className="px-2 pb-1 text-xs opacity-60 truncate">{user.email}</li>
              <li>
                <Link to="/profile">👤 Profile</Link>
              </li>
              <li>
                <Link to="/impact">🌱 Impact</Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    toast.info('Logged out')
                  }}
                >
                  🚪 Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}