import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Check, ChevronRight, Sparkles, Settings2 } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCampaignStore } from '@/store/campaign-store'
import { cn } from '@/lib/utils'
import type { Audience } from '@/types'

interface AudienceStepProps {
  onComplete: () => void
}

const recommendedAudiences: Audience[] = [
  {
    id: '1',
    name: 'High-Value Loyalists',
    description: 'Customers with 5+ purchases and high lifetime value',
    size: 45000,
    sizeLabel: 'large',
    criteria: ['LTV > $500', 'Purchase count >= 5', 'Last active < 30 days'],
    isRecommended: true,
  },
  {
    id: '2',
    name: 'At-Risk Churners',
    description: 'Previously active customers showing disengagement signals',
    size: 12000,
    sizeLabel: 'medium',
    criteria: ['No purchase in 60+ days', 'Previously active', 'Email engaged'],
    isRecommended: true,
  },
  {
    id: '3',
    name: 'New Subscribers',
    description: 'Recently joined customers ready for first purchase',
    size: 8500,
    sizeLabel: 'small',
    criteria: ['Joined < 14 days', 'No purchase yet', 'Email verified'],
    isRecommended: true,
  },
]

const sizeColors = {
  small: 'bg-primary-subtle text-primary',
  medium: 'bg-warning-subtle text-warning-text',
  large: 'bg-success-subtle text-success-text',
}

export function AudienceStep({ onComplete }: AudienceStepProps) {
  const { selectedAudiences, selectAudience, deselectAudience } = useCampaignStore()
  const [showLogic, setShowLogic] = useState<string | null>(null)

  const isSelected = (audienceId: string) => selectedAudiences.some(a => a.id === audienceId)

  const handleToggleAudience = (audience: Audience) => {
    if (isSelected(audience.id)) {
      deselectAudience(audience.id)
    } else {
      selectAudience(audience)
    }
  }

  const formatSize = (size: number) => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}K`
    }
    return size.toString()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Audience Strategy</h2>
            <p className="text-text-secondary text-sm">Select who this campaign should target</p>
          </div>
        </div>
      </motion.div>

      {/* Agent Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 bg-agent-light rounded-xl border border-agent/20"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-agent mt-0.5" />
          <div>
            <p className="text-sm font-medium text-agent">Agent Recommendation</p>
            <p className="text-sm text-text-secondary mt-1">
              Based on your campaign objective, I've identified 3 high-potential segments. 
              These audiences have historically shown strong response rates for similar campaigns.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Audience Cards */}
      <div className="space-y-4 mb-8">
        {recommendedAudiences.map((audience, index) => (
          <motion.div
            key={audience.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card
              hover
              selected={isSelected(audience.id)}
              onClick={() => handleToggleAudience(audience)}
              className="relative"
            >
              <div className="flex items-start gap-4">
                {/* Selection Indicator */}
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors',
                  isSelected(audience.id)
                    ? 'bg-primary border-primary'
                    : 'border-border'
                )}>
                  {isSelected(audience.id) && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-text-primary">{audience.name}</h4>
                    {audience.isRecommended && (
                      <Badge variant="agent">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{audience.description}</p>
                  
                  {/* Size Indicator */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={cn('px-2 py-1 rounded text-xs font-medium', sizeColors[audience.sizeLabel])}>
                        {formatSize(audience.size)} users
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className={cn(
                              'w-1.5 rounded-full transition-colors',
                              bar <= (audience.sizeLabel === 'large' ? 3 : audience.sizeLabel === 'medium' ? 2 : 1)
                                ? 'bg-primary h-4'
                                : 'bg-border h-3'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Logic */}
                  {showLogic === audience.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <p className="text-xs font-medium text-text-muted mb-2">Segment Criteria</p>
                      <div className="flex flex-wrap gap-2">
                        {audience.criteria.map((criterion, i) => (
                          <span key={i} className="px-2 py-1 bg-surface-tertiary rounded text-xs text-text-secondary">
                            {criterion}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Edit Logic Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowLogic(showLogic === audience.id ? null : audience.id)
                  }}
                  className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors text-text-muted hover:text-text-primary"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-text-muted">
          {selectedAudiences.length} audience{selectedAudiences.length !== 1 ? 's' : ''} selected
        </p>
        <Button
          size="large"
          onClick={onComplete}
          disabled={selectedAudiences.length === 0}
        >
          Continue to Offers
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}
