import { useEffect } from 'react'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    // Lock scroll while modal is open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="modal modal-open z-50"
      role="dialog"
      aria-modal="true"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`modal-box ${SIZES[size] || SIZES.md}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {title && <h3 className="font-bold text-lg pr-8">{title}</h3>}
        <div className={title ? 'py-3' : 'py-1'}>{children}</div>
        {footer && <div className="modal-action">{footer}</div>}
      </div>
    </div>
  )
}