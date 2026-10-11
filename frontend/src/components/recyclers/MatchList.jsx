import RecyclerCard from './RecyclerCard'

export default function MatchList({
  matches,
  selectedId,
  onSelect,
  busyRecyclerId,
}) {
  if (!matches.length) {
    return (
      <div className="alert alert-info">
        <span>ℹ️</span>
        <span>No recyclers found nearby yet. Try again in a few minutes.</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => (
        <RecyclerCard
          key={m.recycler.id}
          match={m}
          selected={m.recycler.id === selectedId}
          onSelect={onSelect}
          busy={busyRecyclerId === m.recycler.id}
        />
      ))}
    </div>
  )
}