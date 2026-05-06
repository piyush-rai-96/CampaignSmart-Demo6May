import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Lock, Palette, RefreshCw, X } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, CampaignCreative } from '@/types'

interface CreativeStepProps {
  campaign: AgenticCampaign
}

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
]

export function CreativeStep({ campaign }: CreativeStepProps) {
  const { setCreatives, updateCreativeStatus, lockCreatives, setAgentThinking } = useAgenticCampaignStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [creatives, setLocalCreatives] = useState<CampaignCreative[]>(campaign.creatives || [])
  const [showRationale, setShowRationale] = useState(true)

  const isLocked = campaign.creativesLocked
  const allApproved = creatives.length > 0 && creatives.every(c => c.status === 'approved')

  const handleGenerateCreatives = async () => {
    setIsGenerating(true)
    setAgentThinking(true, 'Generating creative variants...')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const segments = campaign.segments || []
    const promoMappings = campaign.promotionMappings || []
    
    const generatedCreatives: CampaignCreative[] = segments.map((segment, index) => {
      const promo = promoMappings.find(p => p.segmentId === segment.id)
      return {
        id: `creative-${segment.id}`,
        segmentId: segment.id,
        segmentName: segment.name,
        tone: index % 2 === 0 ? 'Urgent & Value-focused' : 'Premium & Exclusive',
        headline: promo?.promotionValue ? `${promo.promotionValue} on ${campaign.context?.category}!` : `Shop ${campaign.context?.category} Now`,
        subcopy: `Exclusive offer for ${segment.name.toLowerCase()}. ${campaign.context?.goal?.slice(0, 50)}...`,
        cta: index % 2 === 0 ? 'Shop Now →' : 'Explore Collection →',
        imageUrl: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
        rationale: `Tone set to "${index % 2 === 0 ? 'urgent' : 'premium'}" based on ${segment.name} characteristics. ${promo?.promotionValue ? `Promotion "${promo.promotionValue}" prominently featured.` : 'No promotion - focusing on product value.'}`,
        status: 'pending'
      }
    })
    
    setLocalCreatives(generatedCreatives)
    setCreatives(generatedCreatives)
    setIsGenerating(false)
    setAgentThinking(false)
    setShowRationale(true)
  }

  const handleApprove = (creativeId: string) => {
    const updated = creatives.map(c => c.id === creativeId ? { ...c, status: 'approved' as const } : c)
    setLocalCreatives(updated)
    updateCreativeStatus(creativeId, 'approved')
  }

  const handleReject = (creativeId: string) => {
    const updated = creatives.map(c => c.id === creativeId ? { ...c, status: 'rejected' as const } : c)
    setLocalCreatives(updated)
    updateCreativeStatus(creativeId, 'rejected')
  }

  const handleRegenerate = async (creativeId: string) => {
    const updated = creatives.map(c => c.id === creativeId ? { ...c, status: 'regenerating' as const } : c)
    setLocalCreatives(updated)
    updateCreativeStatus(creativeId, 'regenerating')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const regenerated = creatives.map(c => c.id === creativeId ? { 
      ...c, 
      status: 'pending' as const,
      headline: c.headline.includes('!') ? c.headline.replace('!', ' - Limited Time!') : c.headline + '!'
    } : c)
    setLocalCreatives(regenerated)
    updateCreativeStatus(creativeId, 'pending')
  }

  const handleConfirm = () => {
    lockCreatives()
  }

  if (isLocked) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Creatives Locked</h2>
              <p className="text-sm text-text-secondary">{campaign.creatives?.length} banners approved</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {campaign.creatives?.map(creative => (
              <div key={creative.id} className="p-4 bg-surface-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <img src={creative.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-text-primary">{creative.segmentName}</p>
                    <p className="text-sm text-text-secondary">{creative.headline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Creative Generation</h2>
        <p className="text-text-secondary">
          Agent generates banners per segment using locked context
        </p>
      </div>

      {creatives.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-agent/10 flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-agent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Generate Creatives</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            The agent will create banners for each segment with appropriate tone, copy, and visuals.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerateCreatives}
            disabled={isGenerating}
            className="bg-agent hover:bg-agent/90"
          >
            {isGenerating ? (
              <>
                <Loader size="small" className="mr-2" />
                Generating Creatives...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Creatives
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
          {/* Rationale Banner */}
          {showRationale && (
            <div className="bg-agent/5 border border-agent/20 rounded-2xl p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-agent mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary mb-1">Creative Rationale</p>
                  <p className="text-sm text-text-secondary">
                    Banners generated with segment-specific tones. Each creative reflects the locked context, 
                    segment characteristics, and promotion assignments.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowRationale(false)} className="p-1 hover:bg-surface-tertiary rounded">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          )}

          {/* Creatives Grid */}
          <div className="grid grid-cols-2 gap-6">
            {creatives.map(creative => (
              <motion.div
                key={creative.id}
                layout
                className={cn(
                  'bg-surface rounded-2xl border-2 overflow-hidden transition-colors',
                  creative.status === 'approved' ? 'border-success/50' : 
                  creative.status === 'rejected' ? 'border-danger/50' : 'border-border'
                )}
              >
                {/* Banner Preview */}
                <div className="relative aspect-video bg-surface-secondary p-4">
                  <div className="absolute top-3 left-3">
                    <Badge variant="default" className="bg-dark/80 text-white text-xs">{creative.tone}</Badge>
                  </div>
                  
                  <div className="h-full flex items-center">
                    <div className="w-1/3 flex items-center justify-center">
                      <img src={creative.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover shadow-lg" />
                    </div>
                    <div className="flex-1 pl-4">
                      <p className="text-xs font-semibold text-success mb-1">{creative.segmentName}</p>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">{creative.headline}</h3>
                      <p className="text-xs text-text-secondary mb-3 line-clamp-2">{creative.subcopy}</p>
                      <button className="px-4 py-2 bg-dark text-white rounded-lg text-xs font-semibold">
                        {creative.cta}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-4 border-t border-border">
                  <p className="text-xs text-text-secondary mb-3">
                    <Sparkles className="w-3 h-3 inline mr-1 text-agent" />
                    {creative.rationale}
                  </p>
                  
                  {creative.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="small" className="flex-1" onClick={() => handleApprove(creative.id)}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <button 
                        onClick={() => handleRegenerate(creative.id)}
                        className="p-2 border border-border rounded-lg hover:bg-surface-secondary"
                      >
                        <RefreshCw className="w-4 h-4 text-text-muted" />
                      </button>
                      <button 
                        onClick={() => handleReject(creative.id)}
                        className="p-2 border border-border rounded-lg hover:bg-danger/10"
                      >
                        <X className="w-4 h-4 text-danger" />
                      </button>
                    </div>
                  )}
                  
                  {creative.status === 'approved' && (
                    <Badge variant="success" className="w-full justify-center py-2">
                      <Check className="w-4 h-4 mr-1" /> Approved
                    </Badge>
                  )}
                  
                  {creative.status === 'rejected' && (
                    <Badge variant="danger" className="w-full justify-center py-2">
                      <X className="w-4 h-4 mr-1" /> Rejected
                    </Badge>
                  )}
                  
                  {creative.status === 'regenerating' && (
                    <div className="flex items-center justify-center py-2 text-agent">
                      <Loader size="small" className="mr-2" />
                      Regenerating...
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="tertiary" onClick={handleGenerateCreatives}>
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate All
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!allApproved}>
              <Check className="w-4 h-4 mr-2" /> Approve Creatives
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
