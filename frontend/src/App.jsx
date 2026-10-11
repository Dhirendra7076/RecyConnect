import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ImpactDashboard from './pages/ImpactDashboard'
import CreateListing from './pages/CreateListing'
import MyListings from './pages/MyListings'
import ListingDetailPage from './pages/ListingDetailPage'
import MatchResults from './pages/MatchResults'
import RecyclerDashboard from './pages/RecyclerDashboard'
import TransactionPage from './pages/TransactionPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/impact" element={<ImpactDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/transaction/:id" element={<TransactionPage />} />

        {/* Household-only */}
        <Route
          path="/listings"
          element={
            <ProtectedRoute roles={['household']}>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/new"
          element={
            <ProtectedRoute roles={['household']}>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match/:listingId"
          element={
            <ProtectedRoute roles={['household']}>
              <MatchResults />
            </ProtectedRoute>
          }
        />

        {/* Recycler-only */}
        <Route
          path="/recycler/dashboard"
          element={
            <ProtectedRoute roles={['recycler']}>
              <RecyclerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}