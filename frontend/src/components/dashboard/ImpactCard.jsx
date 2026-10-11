const ACCENTS = {
  primary: 'bg-primary/10 border-primary/20',
  success: 'bg-success/10 border-success/20',
  info: 'bg-info/10 border-info/20',
  warning: 'bg-warning/10 border-warning/20',
  accent: 'bg-accent/10 border-accent/20',
}

const VALUE_COLORS = {
  primary: 'text-primary',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  accent: 'text-accent',
}

export default function ImpactCard({
  emoji,
  value,
  label,
  hint,
  accent = 'primary',
}) {
  const bg = ACCENTS[accent] || ACCENTS.primary
  const textColor = VALUE_COLORS[accent] || VALUE_COLORS.primary

  return (
    <div className={`card border ${bg} shadow-sm`}>
      <div className="card-body p-4 gap-1">
        <div className="text-3xl" aria-hidden="true">{emoji}</div>
        <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs opacity-60 mt-0.5">{hint}</div>}
      </div>
    </div>
  )
}