const SIZES = {
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}

export default function Loader({ size = 'lg', label, fullScreen = false }) {
  const spinner = (
    <span className={`loading loading-spinner ${SIZES[size] || SIZES.lg} text-primary`} />
  )

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        {spinner}
        {label && <p className="text-sm opacity-70">{label}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {spinner}
      {label && <span className="text-sm opacity-70">{label}</span>}
    </div>
  )
}