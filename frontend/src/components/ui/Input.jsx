import { useId } from 'react'

export default function Input({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  ...props
}) {
  const id = useId()
  const inputCls = [
    'input input-bordered w-full',
    error ? 'input-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label pb-1" htmlFor={id}>
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input id={id} type={type} className={inputCls} {...props} />
      {error ? (
        <label className="label pt-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      ) : hint ? (
        <label className="label pt-1">
          <span className="label-text-alt opacity-60">{hint}</span>
        </label>
      ) : null}
    </div>
  )
}