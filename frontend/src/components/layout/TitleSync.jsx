import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const EXACT = {
  '/': 'Recycle smarter',
  '/login': 'Sign in',
  '/signup': 'Create account',
  '/dashboard': 'Dashboard',
  '/listings': 'My listings',
  '/listings/new': 'Create listing',
  '/impact': 'Impact',
  '/profile': 'Profile',
  '/recycler/dashboard': 'Pickups',
  '/recycler/profile': 'My business',
}

function titleFor(pathname) {
  if (EXACT[pathname]) return EXACT[pathname]
  if (pathname.startsWith('/listings/')) return 'Listing'
  if (pathname.startsWith('/match/')) return 'Find recyclers'
  if (pathname.startsWith('/transaction/')) return 'Transaction'
  if (pathname.startsWith('/recycler/')) return 'Recycler'
  return null
}

export default function TitleSync() {
  const { pathname } = useLocation()
  useEffect(() => {
    const t = titleFor(pathname)
    document.title = t ? `${t} · RecyConnect` : 'RecyConnect'
  }, [pathname])
  return null
}