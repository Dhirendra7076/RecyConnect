const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  error: 'btn-error',
  success: 'btn-success',
}

const SIZES = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const cls = [
    'btn',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="loading loading-spinner loading-sm" />}
      {children}
    </button>
  )
}