import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Lock, Tag, RefreshCw, ExternalLink, X } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, PromotionMapping } from '@/types'

interface PromotionStepProps {
  campaign: AgenticCampaign
}

const AVAILABLE_PROMOS = [
  { id: 'promo-1', name: 'Summer Clearance 30%', value: '30% OFF', type: 'Percentage' },
  { id: 'promo-2', name: 'BOGO Summer Styles', value: 'Buy 1 Get 1 50%', type: 'BOGO' },
  { id: 'promo-3', name: 'Free Shipping Weekend', value: 'Free Shipping', type: 'Shipping' },
  { id: 'promo-4', name: '$20 Off $100+', value: '$20 OFF', type: 'Fixed Amount' },
]

export function PromotionStep({ campaign }: PromotionStepProps) {
  const { setPromotionMappings, updatePromotionMapping, lockPromotions, setAgentThinking } = useAgenticCampaignStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [mappings, setLocalMappings] = useState<PromotionMapping[]>(campaign.promotionMappings || [])
  const [showPromoSelector, setShowPromoSelector] = useState<string | null>(null)

  const isLocked = campaign.promotionsLocked

  const handleGenerateMappings = async () => {
    setIsGenerating(true)
    setAgentThinking(true, 'Matching promotions to segments...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const segments = campaign.segments || []
    const generatedMappings: PromotionMapping[] = segments.map((segment, index) => ({
      segmentId: segment.id,
      segmentName: segment.name,
      promotionId: AVAILABLE_PROMOS[index % AVAILABLE_PROMOS.length].id,
      promotionName: AVAILABLE_PROMOS[index % AVAILABLE_PROMOS.length].name,
      promotionValue: AVAILABLE_PROMOS[index % AVAILABLE_PROMOS.length].value,
      status: 'pending',
      scores: {
        lift: Math.round(Math.random() * 30 + 70),
        margin: Math.round(Math.random() * 20 + 60),
        overstockFit: Math.round(Math.random() * 25 + 75)
      }
    }))
    
    setLocalMappings(generatedMappings)
    setPromotionMappings(generatedMappings)
    setIsGenerating(false)
    setAgentThinking(false)
  }

  const handleAccept = (segmentId: string) => {
    const updated = mappings.map(m => m.segmentId === segmentId ? { ...m, status: 'accepted' as const } : m)
    setLocalMappings(updated)
    updatePromotionMapping(segmentId, { status: 'accepted' })
  }

  const handleNoPromo = (segmentId: string) => {
    const updated = mappings.map(m => m.segmentId === segmentId ? { ...m, status: 'none' as const, promotionId: null, promotionName: null, promotionValue: null } : m)
    setLocalMappings(updated)
    updatePromotionMapping(segmentId, { status: 'none', promotionId: null, promotionName: null, promotionValue: null })
  }

  const handleSwitchPromo = (segmentId: string, promo: typeof AVAILABLE_PROMOS[0]) => {
    const updated = mappings.map(m => m.segmentId === segmentId ? { 
      ...m, 
      status: 'switched' as const, 
      promotionId: promo.id, 
      promotionName: promo.name, 
      promotionValue: promo.value 
    } : m)
    setLocalMappings(updated)
    updatePromotionMapping(segmentId, { status: 'switched', promotionId: promo.id, promotionName: promo.name, promotionValue: promo.value })
    setShowPromoSelector(null)
  }

  const handleConfirm = () => {
    lockPromotions()
  }

  const allDecided = mappings.length > 0 && mappings.every(m => m.status !== 'pending')

  if (isLocked) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Promotions Locked</h2>
              <p className="text-sm text-text-secondary">Segment-promotion mappings confirmed</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {campaign.promotionMappings?.map(mapping => (
              <div key={mapping.segmentId} className="p-4 bg-surface-secondary rounded-xl flex items-center justify-between">
                <span className="font-medium text-text-primary">{mapping.segmentName}</span>
                {mapping.promotionValue ? (
                  <Badge variant="success">{mapping.promotionValue}</Badge>
                ) : (
                  <Badge variant="default">No Promo</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Promotion Selection</h2>
        <p className="text-text-secondary">
          Agent matches promotions from your library to each segment
        </p>
      </div>

      {mappings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-agent/10 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-agent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Match Promotions</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            The agent will pull promotions from your library and score them for each segment.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerateMappings}
            disabled={isGenerating}
            className="bg-agent hover:bg-agent/90"
          >
            {isGenerating ? (
              <>
                <Loader size="small" className="mr-2" />
                Matching Promotions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Match Promotions
              </>
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {mappings.map(mapping => (
            <div key={mapping.segmentId} className={cn(
              'bg-surface rounded-2xl border-2 p-5 transition-colors',
              mapping.status === 'accepted' || mapping.status === 'switched' ? 'border-success/50' : 
              mapping.status === 'none' ? 'border-border' : 'border-primary/50'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-text-primary">{mapping.segmentName}</h4>
                    {mapping.status !== 'pending' && (
                      <Badge variant={mapping.status === 'none' ? 'default' : 'success'}>
                        {mapping.status === 'accepted' ? 'Accepted' : mapping.status === 'switched' ? 'Switched' : 'No Promo'}
                      </Badge>
                    )}
                  </div>
                  
                  {mapping.promotionValue ? (
                    <div className="p-4 bg-surface-secondary rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-text-primary">{mapping.promotionName}</p>
                          <p className="text-lg font-bold text-primary">{mapping.promotionValue}</p>
                        </div>
                        {mapping.scores && (
                          <div className="flex gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-text-muted text-xs">Lift</p>
                              <p className="font-semibold text-success">{mapping.scores.lift}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-text-muted text-xs">Margin</p>
                              <p className="font-semibold text-warning">{mapping.scores.margin}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-text-muted text-xs">Fit</p>
                              <p className="font-semibold text-info">{mapping.scores.overstockFit}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">No promotion assigned</p>
                  )}
                </div>
              </div>

              {mapping.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="primary" size="small" onClick={() => handleAccept(mapping.segmentId)}>
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button variant="tertiary" size="small" onClick={() => setShowPromoSelector(mapping.segmentId)}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Switch
                  </Button>
                  <Button variant="tertiary" size="small" onClick={() => handleNoPromo(mapping.segmentId)}>
                    <X className="w-4 h-4 mr-1" /> No Promo
                  </Button>
                  <Button variant="tertiary" size="small" className="ml-auto">
                    <ExternalLink className="w-4 h-4 mr-1" /> Create in PromoSmart
                  </Button>
                </div>
              )}

              {/* Promo Selector */}
              {showPromoSelector === mapping.segmentId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <p className="text-sm font-medium text-text-primary mb-3">Select a different promotion:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_PROMOS.map(promo => (
                      <button
                        key={promo.id}
                        onClick={() => handleSwitchPromo(mapping.segmentId, promo)}
                        className="p-3 bg-surface-secondary rounded-lg text-left hover:bg-surface-tertiary transition-colors"
                      >
                        <p className="font-medium text-text-primary">{promo.name}</p>
                        <p className="text-sm text-primary">{promo.value}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="tertiary" onClick={handleGenerateMappings}>
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!allDecided}>
              <Check className="w-4 h-4 mr-2" /> Confirm Promotions
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
