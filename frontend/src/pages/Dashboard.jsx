import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useToast } from '../hooks/useToast'
import { ROLE_EMOJI, ROLE_LABELS } from '../lib/constants'
import { formatCurrency, formatWeight } from '../lib/formatters'
import StatsGrid from '../components/dashboard/StatsGrid'
import RecentActivity from '../components/dashboard/RecentActivity'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function buildStats(role, s, loading) {
  const val = (v) => (loading ? '—' : v)

  if (role === 'household') {
    return [
      {
        emoji: '📦',
        label: 'Active listings',
        value: val(s?.activeListings ?? 0),
        hint: 'In progress',
        loading,
      },
      {
        emoji: '💰',
        label: 'Total earned',
        value: val(formatCurrency(s?.totalValue ?? 0)),
        hint: 'All time',
        loading,
      },
      {
        emoji: '♻️',
        label: 'Waste recycled',
        value: val(formatWeight(s?.totalKg ?? 0)),
        hint: 'All time',
        loading,
      },
    ]
  }

  if (role === 'recycler') {
    return [
      {
        emoji: '📥',
        label: 'Open requests',
        value: val(s?.openRequests ?? 0),
        hint: 'Nearby',
        loading,
      },
      {
        emoji: '✅',
        label: 'Pickups done',
        value: val(s?.completedCount ?? 0),
        hint: 'All time',
        loading,
      },
      {
        emoji: '💰',
        label: 'Earnings',
        value: val(formatCurrency(s?.totalValue ?? 0)),
        hint: 'All time',
        loading,
      },
    ]
  }

  // business / admin
  return [
    {
      emoji: '📥',
      label: 'Open requests',
      value: val(s?.openRequests ?? 0),
      hint: 'Across platform',
      loading,
    },
    {
      emoji: '♻️',
      label: 'Processed',
      value: val(formatWeight(s?.totalKg ?? 0)),
      hint: 'All time',
      loading,
    },
    {
      emoji: '💰',
      label: 'Spend',
      value: val(formatCurrency(s?.totalValue ?? 0)),
      hint: 'All time',
      loading,
    },
  ]
}

const ACTIONS_BY_ROLE = {
  household: [
    {
      to: '/listings/new',
      emoji: '➕',
      title: 'Create a listing',
      desc: 'Post your waste, get matched with a recycler.',
      primary: true,
    },
    {
      to: '/listings',
      emoji: '📋',
      title: 'My listings',
      desc: 'Track pending and completed pickups.',
    },
  ],
  recycler: [
    {
      to: '/recycler/dashboard',
      emoji: '🚛',
      title: 'Pickup requests',
      desc: 'Accept pickups, weigh, and get paid.',
      primary: true,
    },
  ],
  business: [
    {
      to: '/impact',
      emoji: '🌱',
      title: 'Impact report',
      desc: 'See recycled volumes and CO₂ saved.',
      primary: true,
    },
  ],
}

function ActionTile({ to, emoji, title, desc, primary }) {
  return (
    <Link
      to={to}
      className={[
        'card bg-base-100 shadow-md hover:shadow-lg transition-shadow',
        primary ? 'border-2 border-primary' : '',
      ].join(' ')}
    >
      <div className="card-body items-start gap-1 p-4">
        <div className="text-3xl" aria-hidden="true">{emoji}</div>
        <h3 className="card-title text-base">{title}</h3>
        <p className="text-xs opacity-70">{desc}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { stats, loading, error, refresh } = useDashboardStats()
  const toast = useToast()

  useEffect(() => {
    if (error) toast.error(error.message || 'Could not load dashboard')
  }, [error, toast])

  const statsItems = buildStats(user.role, stats, loading)
  const actions = ACTIONS_BY_ROLE[user.role] || ACTIONS_BY_ROLE.household

  const recentEmptyHint =
    user.role === 'household'
      ? 'Your recent listings will appear here.'
      : user.role === 'recycler'
      ? 'Pickups assigned to you will appear here.'
      : 'Recent activity will appear here.'

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            {getGreeting()}, {user.displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm opacity-70 mt-1">
            {ROLE_EMOJI[user.role]} {ROLE_LABELS[user.role] || user.role} account
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
          🔄 Refresh
        </Button>
      </header>

      <StatsGrid items={statsItems} />

      <section>
        <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <ActionTile key={a.to} {...a} />
          ))}
        </div>
      </section>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-base">Recent activity</h2>
          {stats?.listings?.length > 4 && user.role === 'household' && (
            <Link to="/listings" className="text-xs link link-primary">
              See all
            </Link>
          )}
          {stats?.listings?.length > 4 && user.role === 'recycler' && (
            <Link to="/recycler/dashboard" className="text-xs link link-primary">
              See all
            </Link>
          )}
        </div>
        {loading ? (
          <p className="text-sm opacity-60">Loading…</p>
        ) : (
          <RecentActivity
            listings={stats?.listings ?? []}
            limit={4}
            emptyHint={recentEmptyHint}
            fromPath="/dashboard"
          />
        )}
      </Card>
    </div>
  )
}