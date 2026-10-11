import {
  LISTING_FLOW,
  LISTING_STATUS_LABELS,
} from '../../lib/constants'
import { formatDateTime } from '../../lib/formatters'

const TERMINAL_BAD = ['CANCELLED', 'REJECTED', 'DISPUTED']

function TerminalAlert({ status }) {
  const variant =
    status === 'CANCELLED' ? 'alert-neutral' : 'alert-error'
  const emoji = status === 'DISPUTED' ? '⚖️' : '🚫'

  return (
    <div className={`alert ${variant}`} role="alert">
      <span className="text-xl" aria-hidden="true">{emoji}</span>
      <div>
        <p className="font-semibold">{LISTING_STATUS_LABELS[status] || status}</p>
        <p className="text-xs opacity-80">
          This listing is no longer part of the active flow.
        </p>
      </div>
    </div>
  )
}

export default function StatusTimeline({ status, history = [] }) {
  if (TERMINAL_BAD.includes(status)) {
    return <TerminalAlert status={status} />
  }

  // Map status → timestamp for O(1) lookup
  const at = {}
  for (const h of history) {
    if (h?.status) at[h.status] = h.at
  }

  const currentIdx = LISTING_FLOW.indexOf(status)

  return (
    <ol className="space-y-0">
      {LISTING_FLOW.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        const pending = i > currentIdx

        const circleCls = done
          ? 'bg-primary text-primary-content border-primary'
          : active
          ? 'bg-primary text-primary-content border-primary ring-4 ring-primary/20'
          : 'bg-base-100 border-base-300'

        const lineCls = done ? 'bg-primary' : 'bg-base-300'
        const labelCls = pending ? 'opacity-50' : active ? 'font-semibold' : ''

        return (
          <li key={step} className="grid grid-cols-[28px_1fr] gap-3">
            {/* Circle + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${circleCls}`}
              >
                {done ? '✓' : ''}
              </div>
              {i < LISTING_FLOW.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 min-h-[1.5rem] ${lineCls}`} />
              )}
            </div>

            {/* Label */}
            <div className={i < LISTING_FLOW.length - 1 ? 'pb-4' : ''}>
              <p className={`text-sm leading-6 ${labelCls}`}>
                {LISTING_STATUS_LABELS[step] || step}
              </p>
              {at[step] && (
                <p className="text-xs opacity-60 mt-0.5">
                  {formatDateTime(at[step])}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}