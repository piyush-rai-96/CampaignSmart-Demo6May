import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Lock, Users, X, RefreshCw } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, CampaignSegment } from '@/types'

interface SegmentCreationStepProps {
  campaign: AgenticCampaign
}

export function SegmentCreationStep({ campaign }: SegmentCreationStepProps) {
  const { setSegments, approveSegment, removeSegment, lockSegments, setAgentThinking } = useAgenticCampaignStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [segments, setLocalSegments] = useState<CampaignSegment[]>(campaign.segments || [])

  const isLocked = campaign.segmentsLocked
  const allApproved = segments.length > 0 && segments.every(s => s.isApproved)

  const handleGenerateSegments = async () => {
    setIsGenerating(true)
    setAgentThinking(true, 'Materializing segments...')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const generatedSegments: CampaignSegment[] = [
      {
        id: 'seg-1',
        name: 'High-Value Clearance Seekers',
        layerId: 'layer-1',
        size: 45200,
        percentage: 18.4,
        intent: 'Price-sensitive high-value customers actively seeking deals',
        characteristics: ['AOV > $150', 'Email open rate > 40%', 'Last purchase < 60 days', 'Discount redemption > 3x'],
        isApproved: false
      },
      {
        id: 'seg-2',
        name: 'Lapsed Category Buyers',
        layerId: 'layer-2',
        size: 32100,
        percentage: 13.1,
        intent: 'Previously active customers who haven\'t purchased in 90+ days',
        characteristics: [`${campaign.context?.category} purchase history`, 'No activity 90+ days', 'High lifetime value', 'Win-back potential'],
        isApproved: false
      },
      {
        id: 'seg-3',
        name: 'New Customer Converters',
        layerId: 'layer-3',
        size: 28500,
        percentage: 11.6,
        intent: 'Recent first-time buyers ready for second purchase',
        characteristics: ['First purchase < 30 days', 'Single transaction', 'Email engaged', 'Browse activity high'],
        isApproved: false
      },
      {
        id: 'seg-4',
        name: 'Brand Loyalists',
        layerId: 'layer-1',
        size: 18900,
        percentage: 7.7,
        intent: 'Repeat customers with strong brand affinity',
        characteristics: ['5+ purchases', 'Low discount sensitivity', 'High NPS', 'Cross-category buyer'],
        isApproved: false
      }
    ]
    
    setLocalSegments(generatedSegments)
    setSegments(generatedSegments)
    setIsGenerating(false)
    setAgentThinking(false)
  }

  const handleApprove = (segmentId: string) => {
    const updated = segments.map(s => s.id === segmentId ? { ...s, isApproved: true } : s)
    setLocalSegments(updated)
    approveSegment(segmentId)
  }

  const handleRemove = (segmentId: string) => {
    const updated = segments.filter(s => s.id !== segmentId)
    setLocalSegments(updated)
    removeSegment(segmentId)
  }

  const handleApproveAll = () => {
    const updated = segments.map(s => ({ ...s, isApproved: true }))
    setLocalSegments(updated)
    updated.forEach(s => approveSegment(s.id))
  }

  const handleConfirm = () => {
    lockSegments()
  }

  if (isLocked) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Segments Locked</h2>
              <p className="text-sm text-text-secondary">{campaign.segments?.length} segments approved</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {campaign.segments?.map(segment => (
              <div key={segment.id} className="p-4 bg-surface-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{segment.name}</span>
                  <Badge variant="success">Approved</Badge>
                </div>
                <p className="text-sm text-text-secondary">{segment.size.toLocaleString()} customers ({segment.percentage}%)</p>
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
        <h2 className="text-lg font-semibold text-text-primary mb-2">Segment Creation</h2>
        <p className="text-text-secondary">
          Agent will materialize segments based on your approved strategy
        </p>
      </div>

      {segments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-agent/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-agent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Create Segments</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            The agent will materialize segments, calculate volumes, and explain the intent for each.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerateSegments}
            disabled={isGenerating}
            className="bg-agent hover:bg-agent/90"
          >
            {isGenerating ? (
              <>
                <Loader size="small" className="mr-2" />
                Creating Segments...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Segments
              </>
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-agent/5 border border-agent/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-agent" />
              <span className="text-sm text-text-primary">
                <strong>{segments.length}</strong> segments created covering{' '}
                <strong>{segments.reduce((acc, s) => acc + s.size, 0).toLocaleString()}</strong> customers
              </span>
            </div>
            <Button variant="tertiary" size="small" onClick={handleApproveAll}>
              <Check className="w-4 h-4 mr-1" /> Accept All
            </Button>
          </div>

          {/* Segments Grid */}
          <div className="grid grid-cols-2 gap-4">
            {segments.map(segment => (
              <motion.div
                key={segment.id}
                layout
                className={cn(
                  'bg-surface rounded-2xl border-2 p-5 transition-colors',
                  segment.isApproved ? 'border-success/50 bg-success/5' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-text-primary">{segment.name}</h4>
                    <p className="text-sm text-primary font-medium">
                      {segment.size.toLocaleString()} customers ({segment.percentage}%)
                    </p>
                  </div>
                  {segment.isApproved ? (
                    <Badge variant="success"><Check className="w-3 h-3 mr-1" /> Approved</Badge>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleApprove(segment.id)}
                        className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(segment.id)}
                        className="p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-text-secondary mb-3">{segment.intent}</p>
                
                <div className="flex flex-wrap gap-1.5">
                  {segment.characteristics.map((char, i) => (
                    <span key={i} className="px-2 py-1 bg-surface-tertiary rounded text-xs text-text-secondary">
                      {char}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="tertiary" onClick={handleGenerateSegments}>
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!allApproved}>
              <Check className="w-4 h-4 mr-2" /> Approve Segments
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
