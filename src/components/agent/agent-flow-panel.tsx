import { motion, useReducedMotion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import './agent-flow.css'

export type AgentStepStatus = 'pending' | 'active' | 'complete'

export function stepsFromProgress(labels: string[], activeIndex: number): AgentFlowStep[] {
  return labels.map((label, i) => ({
    label,
    status:
      i < activeIndex ? 'complete' : i === activeIndex ? 'active' : 'pending',
  }))
}

export interface AgentFlowStep {
  label: string
  status: AgentStepStatus
}

interface AgentFlowPanelProps {
  title: string
  subtitle?: string
  statusLine?: string
  steps?: AgentFlowStep[]
  /** 0–1 progress when steps are unknown */
  progress?: number
  variant?: 'default' | 'compact' | 'hero'
  className?: string
}

function stepIcon(status: AgentStepStatus, reduceMotion: boolean) {
  if (status === 'complete') {
    return (
      <motion.div
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15"
      >
        <Check className="h-3.5 w-3.5 text-success" />
      </motion.div>
    )
  }
  if (status === 'active') {
    return (
      <motion.div
        animate={reduceMotion ? {} : { scale: [1, 1.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="h-5 w-5 rounded-full border-2 border-agent border-t-transparent"
        style={{ animation: reduceMotion ? undefined : 'agent-ring-spin 0.9s linear infinite' }}
      />
    )
  }
  return <motion.div className="h-5 w-5 rounded-full border-2 border-border bg-surface-secondary" />
}

export function AgentFlowPanel({
  title,
  subtitle,
  statusLine,
  steps = [],
  progress,
  variant = 'default',
  className,
}: AgentFlowPanelProps) {
  const reduceMotion = useReducedMotion()
  const completedCount = steps.filter((s) => s.status === 'complete').length
  const progressPct =
    progress ?? (steps.length > 0 ? (completedCount / steps.length) * 100 : undefined)

  const orbSize = variant === 'hero' ? 'h-16 w-16' : variant === 'compact' ? 'h-9 w-9' : 'h-12 w-12'
  const iconSize = variant === 'hero' ? 'h-8 w-8' : variant === 'compact' ? 'h-4 w-4' : 'h-6 w-6'

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'agent-flow-panel rounded-2xl border border-agent/25 bg-gradient-to-br from-agent/8 via-surface to-primary/5 p-5 shadow-lg shadow-agent/10',
        variant === 'compact' && 'p-4',
        variant === 'hero' && 'p-8',
        className
      )}
    >
      <div className="agent-flow-scan" aria-hidden />

      <motion.div
        className="relative z-[1] flex gap-4"
        layout
      >
        <motion.div className={cn('agent-flow-orb-wrap rounded-xl', orbSize)}>
          <div className={cn('agent-flow-orb-ring rounded-xl', orbSize)} aria-hidden />
          <motion.div
            className={cn(
              'agent-flow-orb relative flex items-center justify-center rounded-xl bg-gradient-to-br from-agent to-primary shadow-lg shadow-agent/30',
              orbSize
            )}
          >
            <motion.div
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className={cn('text-white', iconSize)} />
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <motion.p
            key={title}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'font-semibold text-agent',
              variant === 'hero' ? 'text-lg' : 'text-sm'
            )}
          >
            {title}
          </motion.p>
          {subtitle && (
            <p className={cn('text-text-secondary', variant === 'compact' ? 'text-xs' : 'text-sm')}>
              {subtitle}
            </p>
          )}
          {statusLine && (
            <motion.p
              key={statusLine}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-1 text-sm font-medium text-text-primary"
            >
              {statusLine}
            </motion.p>
          )}

          {progressPct !== undefined && steps.length === 0 && (
            <motion.div
              className="agent-flow-progress-track mt-3 h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden"
              initial={false}
            >
              <motion.div
                className="agent-flow-progress-bar h-full w-1/3 rounded-full bg-gradient-to-r from-agent via-primary to-agent"
                layout
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {steps.length > 0 && (
        <motion.div
          className={cn('relative z-[1] space-y-1.5', variant === 'compact' ? 'mt-3' : 'mt-4')}
          layout
        >
          {progressPct !== undefined && (
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface-tertiary">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-agent to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
              />
            </div>
          )}
          {steps.map((step, i) => (
            <motion.div
              key={`${step.label}-${i}`}
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: reduceMotion ? 0 : i * 0.06,
                type: 'spring',
                stiffness: 320,
                damping: 28,
              }}
              layout
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                step.status === 'complete' && 'bg-success/5',
                step.status === 'active' && 'bg-agent/10 ring-1 ring-agent/20'
              )}
            >
              {stepIcon(step.status, !!reduceMotion)}
              <span
                className={cn(
                  'text-sm',
                  step.status === 'pending' ? 'text-text-muted' : 'text-text-primary',
                  step.status === 'active' && 'font-medium'
                )}
              >
                {step.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

/** Compact pulsing orb + cycling status — for inline loaders */
export function AgentFlowOrb({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('flex flex-col items-center gap-4 text-center', className)}
    >
      <div className="agent-flow-orb-wrap h-14 w-14 rounded-2xl">
        <motion.div
          className="agent-flow-orb-ring h-14 w-14 rounded-2xl"
          style={{ animation: reduceMotion ? undefined : 'agent-ring-spin 1s linear infinite' }}
        />
        <motion.div
          className="agent-flow-orb flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-agent to-primary shadow-lg shadow-agent/25"
          animate={reduceMotion ? {} : { scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-7 w-7 text-white" />
        </motion.div>
      </div>
      {label && (
        <motion.p
          key={label}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </motion.p>
      )}
    </motion.div>
  )
}
