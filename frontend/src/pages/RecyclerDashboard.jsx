import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useMyListings } from '../hooks/useListings'
import { useToast } from '../hooks/useToast'
import StatsGrid from '../components/dashboard/StatsGrid'
import RecyclerListingRow from '../components/recyclers/RecyclerListingRow'
import EmptyState from '../components/ui/EmptyState'
import Loader from '../components/ui/Loader'
import Button from '../components/ui/Button'

const TABS = [
  { key: 'incoming', label: 'Incoming', emoji: '📥' },
  { key: 'active', label: 'My pickups', emoji: '🚛' },
  { key: 'completed', label: 'Completed', emoji: '✅' },
]

const ACTIVE_STATUSES = [
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'PRICE_CONFIRMED',
  'PAYMENT_PENDING',
]

export default function RecyclerDashboard() {
  const { user } = useAuth()
  const { listings, loading, error, refresh } = useMyListings()
  const toast = useToast()
  const [tab, setTab] = useState('incoming')

  useEffect(() => {
    if (error) toast.error(error.message || 'Could not load pickups')
  }, [error, toast])

  const buckets = useMemo(() => {
    const incoming = listings.filter((l) => l.status === 'OPEN')
    const active = listings.filter(
      (l) => l.recyclerId === user.id && ACTIVE_STATUSES.includes(l.status)
    )
    const completed = listings.filter(
      (l) => l.recyclerId === user.id && l.status === 'COMPLETED'
    )
    return { incoming, active, completed }
  }, [listings, user.id])

  const stats = useMemo(
    () => [
      {
        emoji: '📥',
        label: 'Incoming',
        value: String(buckets.incoming.length),
        hint: buckets.incoming.length === 1 ? 'request' : 'requests',
      },
      {
        emoji: '🚛',
        label: 'Active pickups',
        value: String(buckets.active.length),
        hint: 'in progress',
      },
      {
        emoji: '✅',
        label: 'Completed',
        value: String(buckets.completed.length),
        hint: 'all time',
      },
    ],
    [buckets]
  )

  const current = buckets[tab]

  const TAB_EMPTY = {
    incoming: {
      emoji: '📭',
      title: 'No incoming requests',
      description:
        'New pickup requests from households in your area will appear here.',
    },
    active: {
      emoji: '🚛',
      title: 'No active pickups',
      description:
        'Accept an incoming request to start a pickup. It will show up here.',
    },
    completed: {
      emoji: '✅',
      title: 'No completed pickups yet',
      description: 'Complete your first pickup to see it here.',
    },
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Hi, {user.displayName.split(' ')[0]} 👋
        </h1>
        <p className="text-sm opacity-70 mt-1">
          🚛 Recycler dashboard — pick up, weigh, get paid.
        </p>
      </header>

      <StatsGrid items={stats} />

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed w-full sm:w-auto bg-base-100 shadow-sm p-1">
        {TABS.map((t) => {
          const active = tab === t.key
          const count = buckets[t.key].length
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={[
                'tab flex-1 sm:flex-initial gap-2',
                active ? 'tab-active' : '',
              ].join(' ')}
            >
              <span aria-hidden="true">{t.emoji}</span>
              <span>{t.label}</span>
              <span className="badge badge-sm">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <Loader fullScreen label="Loading pickups…" />
      ) : current.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <EmptyState {...TAB_EMPTY[tab]} />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {current.map((l) => (
              <RecyclerListingRow
                key={l.id}
                listing={l}
                variant={tab === 'incoming' ? 'incoming' : 'assigned'}
                onUpdated={refresh}
              />
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={refresh}>
              🔄 Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  )
}