import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Users, ShoppingBag, Lock, Check } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCampaignStore } from '@/store/campaign-store'
import { cn } from '@/lib/utils'

interface ContextStepProps {
  onComplete: () => void
}

const objectives = [
  { id: 'revenue', label: 'Drive Revenue', description: 'Maximize sales and conversions', icon: TrendingUp },
  { id: 'engagement', label: 'Increase Engagement', description: 'Boost opens, clicks, and interactions', icon: Users },
  { id: 'acquisition', label: 'Customer Acquisition', description: 'Attract and convert new customers', icon: ShoppingBag },
]

const channels = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push Notification' },
  { id: 'sms', label: 'SMS' },
  { id: 'in-app', label: 'In-App Message' },
]

export function ContextStep({ onComplete }: ContextStepProps) {
  const { activeCampaign, updateCampaign } = useCampaignStore()
  const [selectedObjective, setSelectedObjective] = useState<string | null>(activeCampaign?.objective || null)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(activeCampaign?.channel || null)
  const [campaignName, setCampaignName] = useState(activeCampaign?.name || '')
  const [isLocked, setIsLocked] = useState(false)
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!activeCampaign?.id) return
    setSelectedObjective(
      objectives.find((o) => o.label === activeCampaign.objective)?.id ?? activeCampaign.objective ?? null
    )
    setSelectedChannel(
      channels.find((c) => c.label === activeCampaign.channel)?.id ?? activeCampaign.channel ?? null
    )
    setCampaignName(activeCampaign.name || '')
    setIsLocked(false)
  }, [activeCampaign?.id])

  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current)
    }
  }, [])

  const canLock = selectedObjective && selectedChannel && campaignName.trim()

  const handleLockScope = () => {
    if (canLock && activeCampaign) {
      updateCampaign(activeCampaign.id, {
        name: campaignName,
        objective: objectives.find(o => o.id === selectedObjective)?.label,
        channel: channels.find(c => c.id === selectedChannel)?.label,
      })
      setIsLocked(true)
      if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current)
      completeTimeoutRef.current = window.setTimeout(() => {
        onComplete()
        completeTimeoutRef.current = null
      }, 500)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Define Campaign Context</h2>
            <p className="text-text-secondary text-sm">Lock in your campaign's purpose and scope</p>
          </div>
        </div>
      </motion.div>

      {/* Campaign Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <label className="block text-sm font-semibold text-text-primary mb-2">Campaign Name</label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          disabled={isLocked}
          placeholder="Enter a memorable name..."
          className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </motion.div>

      {/* Objective Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <label className="block text-sm font-semibold text-text-primary mb-4">Primary Objective</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {objectives.map((objective) => (
            <Card
              key={objective.id}
              hover={!isLocked}
              selected={selectedObjective === objective.id}
              onClick={() => !isLocked && setSelectedObjective(objective.id)}
              className={cn(
                'text-center',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
              sx={{ paddingTop: '24px', paddingBottom: '24px' }}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors',
                selectedObjective === objective.id ? 'bg-primary text-white' : 'bg-surface-tertiary text-text-muted'
              )}>
                <objective.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-text-primary mb-1">{objective.label}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{objective.description}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Channel Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <label className="block text-sm font-semibold text-text-primary mb-4">Channel</label>
        <div className="flex flex-wrap gap-3">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => !isLocked && setSelectedChannel(channel.id)}
              disabled={isLocked}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                selectedChannel === channel.id
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:border-primary/50',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              {channel.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Lock Scope Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        {isLocked ? (
          <Badge variant="success" className="px-4 py-2 text-sm">
            <Check className="w-4 h-4 mr-2" />
            Scope Locked
          </Badge>
        ) : (
          <Button
            size="large"
            onClick={handleLockScope}
            disabled={!canLock}
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock Scope & Continue
          </Button>
        )}
      </motion.div>
    </div>
  )
}
