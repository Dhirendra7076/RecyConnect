import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      {/* A11y: keyboard users can skip the sidebar */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] btn btn-primary btn-sm"
      >
        Skip to content
      </a>

      <input
        id="app-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={(e) => setDrawerOpen(e.target.checked)}
      />

      <div className="drawer-content flex flex-col min-h-screen">
        <Navbar />
        <main
          id="main-content"
          className="flex-1 p-4 lg:p-6 max-w-6xl w-full mx-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <Outlet />
        </main>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="app-drawer"
          className="drawer-overlay"
          aria-label="Close menu"
        />
        <Sidebar />
      </div>
    </div>
  )
}