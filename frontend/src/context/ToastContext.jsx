import { createContext, useCallback, useState } from 'react'

export const ToastContext = createContext(null)

let idCounter = 0

const STYLES = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
}

const ICONS = {
  success: '✅',
  error: '⚠️',
  warning: '⏳',
  info: 'ℹ️',
}

function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="toast toast-end toast-top z-[9999] p-3 max-w-[92vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`alert ${STYLES[t.type] || STYLES.info} shadow-lg cursor-pointer`}
          onClick={() => onDismiss(t.id)}
          role="status"
        >
          <span aria-hidden="true">{ICONS[t.type] || ICONS.info}</span>
          <span className="text-sm break-words">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message, duration = 4500) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, type, message }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const value = {
    success: (m, d) => push('success', m, d),
    error: (m, d) => push('error', m, d),
    warning: (m, d) => push('warning', m, d),
    info: (m, d) => push('info', m, d),
    dismiss,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}