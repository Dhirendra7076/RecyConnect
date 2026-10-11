import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_EMOJI, ROLE_LABELS } from '../../lib/constants'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', emoji: '🏠', roles: ['household', 'recycler', 'business', 'admin'] },
  { to: '/listings', label: 'My listings', emoji: '📋', roles: ['household'] },
  { to: '/listings/new', label: 'New listing', emoji: '➕', roles: ['household'] },
  { to: '/recycler/dashboard', label: 'Pickups', emoji: '🚛', roles: ['recycler'] },
  { to: '/recycler/profile', label: 'My business', emoji: '🏪', roles: ['recycler'] },
  { to: '/impact', label: 'Impact', emoji: '🌱', roles: ['household', 'recycler', 'business', 'admin'] },
  { to: '/profile', label: 'Profile', emoji: '👤', roles: ['household', 'recycler', 'business', 'admin'] },
]

function NavItem({ to, label, emoji, end }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) => (isActive ? 'active font-semibold' : '')}
      >
        <span aria-hidden="true" className="text-lg">{emoji}</span>
        <span>{label}</span>
      </NavLink>
    </li>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  if (!user) return null

  const visible = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  return (
    <aside className="bg-base-100 min-h-full w-64 border-r border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-3">
          <div className="text-3xl" aria-hidden="true">
            {ROLE_EMOJI[user.role] || '♻️'}
          </div>
          <div className="min-w-0">
            <p className="text-xs opacity-60">Signed in as</p>
            <p className="font-semibold text-sm truncate">{user.displayName}</p>
            <p className="text-xs opacity-60 truncate">
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>
      </div>

      <ul className="menu p-3 gap-1 flex-1">
        {visible.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            end={item.to === '/listings' || item.to === '/recycler/dashboard'}
          />
        ))}
      </ul>

      <div className="p-3">
        <p className="text-[11px] opacity-50 text-center">♻️ RecyConnect · beta</p>
      </div>
    </aside>
  )
}