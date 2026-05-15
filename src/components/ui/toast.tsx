import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export interface ToastItem {
  id: string
  message: string
}

interface ToastContextValue {
  showToast: (message: string) => void
  showComingSoon: (feature: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION_MS = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const reduceMotion = useReducedMotion()

  const showToast = useCallback((message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  const showComingSoon = useCallback(
    (feature: string) => {
      showToast(`${feature} — coming soon`)
    },
    [showToast]
  )

  const value = useMemo(() => ({ showToast, showComingSoon }), [showToast, showComingSoon])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <motion.div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[500] flex flex-col gap-2 pointer-events-none max-w-sm"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              role="status"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="pointer-events-auto px-4 py-3 rounded-xl bg-dark text-white text-sm shadow-lg border border-white/10"
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
