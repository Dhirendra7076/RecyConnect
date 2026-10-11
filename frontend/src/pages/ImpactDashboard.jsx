import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useImpact } from '../hooks/useImpact'
import { useToast } from '../hooks/useToast'
import { getMaterial } from '../lib/constants'
import { formatCurrency, formatWeight } from '../lib/formatters'
import ImpactCard from '../components/dashboard/ImpactCard'
import EarningsCard from '../components/dashboard/EarningsCard'
import HistoryList from '../components/dashboard/HistoryList'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function ImpactDashboard() {
  const { user } = useAuth()
  const { summary, breakdown, transactions, loading, error, refresh } = useImpact()
  const toast = useToast()

  useEffect(() => {
    if (error) toast.error(error.message || 'Could not load impact data')
  }, [error, toast])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Loader fullScreen label="Crunching your impact numbers…" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <header>
          <h1 className="text-2xl lg:text-3xl font-bold">Impact</h1>
        </header>
        <div className="card bg-base-100 shadow-md">
          <EmptyState
            emoji="⚠️"
            title="Could not load impact"
            description={error?.message || 'Please try again.'}
            actionLabel="Retry"
            onAction={refresh}
          />
        </div>
      </div>
    )
  }

  const hasData = summary.completedCount > 0

  const earnedLabel = user.role === 'household' ? 'Total earned' : 'Total paid'
  const earnedEmoji = user.role === 'household' ? '💰' : '💸'

  const emptyCopy =
    user.role === 'household'
      ? {
          emoji: '♻️',
          title: 'Your impact starts with your first pickup',
          description:
            'Complete a listing and see kg recycled, CO₂ saved, and money earned here.',
          actionLabel: 'Create a listing',
          actionTo: '/listings/new',
        }
      : user.role === 'recycler'
      ? {
          emoji: '🚛',
          title: 'No completed pickups yet',
          description:
            'Once you complete your first pickup, your totals will show up here.',
          actionLabel: 'See incoming requests',
          actionTo: '/recycler/dashboard',
        }
      : {
          emoji: '🌱',
          title: 'No impact yet',
          description: 'Completed transactions will appear here.',
        }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Impact</h1>
          <p className="text-sm opacity-70 mt-1">
            Your recycling footprint, tracked over time.
          </p>
        </div>
        {hasData && (
          <Button variant="ghost" size="sm" onClick={refresh}>
            🔄 Refresh
          </Button>
        )}
      </header>

      {!hasData ? (
        <div className="card bg-base-100 shadow-md">
          <EmptyState {...emptyCopy} />
        </div>
      ) : (
        <>
          {/* Hero stat cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <ImpactCard
              emoji="♻️"
              accent="primary"
              value={formatWeight(summary.totalKg)}
              label="Recycled"
              hint={`${summary.completedCount} pickup${
                summary.completedCount === 1 ? '' : 's'
              }`}
            />
            <ImpactCard
              emoji="🌱"
              accent="success"
              value={formatWeight(summary.co2SavedKg)}
              label="CO₂ saved"
              hint="vs. landfill"
            />
            <ImpactCard
              emoji="🌳"
              accent="info"
              value={Math.round(summary.treesEquivalent)}
              label="Trees-equivalent"
              hint="1 year of absorption"
            />
            <EarningsCard
              amount={summary.totalValue}
              label={earnedLabel}
              sublabel="All time"
              emoji={earnedEmoji}
            />
          </div>

          {/* Breakdown by material */}
          <Card>
            <h2 className="font-semibold text-base mb-3">By material</h2>
            {breakdown.length === 0 ? (
              <p className="text-sm opacity-60">No material breakdown yet.</p>
            ) : (
              <ul className="space-y-3">
                {breakdown.map((row) => {
                  const meta = getMaterial(row.code)
                  const pct = Math.round((row.kg / summary.totalKg) * 100)
                  return (
                    <li key={row.code}>
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl" aria-hidden="true">
                            {meta.emoji}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold">
                            {formatWeight(row.kg)}
                          </div>
                          <div className="text-xs opacity-60">
                            {formatCurrency(row.value)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Recent activity */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-base">Recent pickups</h2>
              {transactions.length > 5 && (
                <Link
                  to="/dashboard"
                  className="text-xs link link-primary opacity-70"
                >
                  See all
                </Link>
              )}
            </div>
            <HistoryList transactions={transactions} limit={5} fromPath="/impact" />
          </Card>

          {/* Fun fact */}
          <div className="alert alert-success/10 border border-success/20">
            <span className="text-xl" aria-hidden="true">💡</span>
            <span className="text-sm">
              Recycling aluminium saves <strong>~9 kg CO₂ per kg</strong> —
              one of the highest-impact materials you can divert.
            </span>
          </div>
        </>
      )}
    </div>
  )
}