import { motion } from 'framer-motion'
import { 
  Lock, FileText, Users, Package, Tag, Palette, 
  Download, Rocket, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign } from '@/types'

interface ReviewStepProps {
  campaign: AgenticCampaign
}


export function ReviewStep({ campaign }: ReviewStepProps) {
  const { exportCampaign } = useAgenticCampaignStore()

  const handleExport = () => {
    exportCampaign()
  }

  const allLocked = campaign.contextLocked && campaign.strategyLocked && 
    campaign.segmentsLocked && campaign.productsLocked && 
    campaign.promotionsLocked && campaign.creativesLocked

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Review & Export</h2>
        <p className="text-text-secondary">
          Review your complete campaign before launching
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Campaign Summary */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-text-primary">{campaign.name}</h3>
              <p className="text-sm text-text-secondary mt-1">
                Created by {campaign.owner} • Last updated {new Date(campaign.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={allLocked ? 'success' : 'warning'} className="text-sm px-3 py-1">
              {allLocked ? 'Ready to Launch' : 'In Progress'}
            </Badge>
          </div>

          {/* Context Summary */}
          {campaign.context && (
            <div className="p-4 bg-surface-secondary rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-primary">Campaign Context</span>
                {campaign.contextLocked && <Lock className="w-3 h-3 text-success" />}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-text-muted">Goal</p>
                  <p className="text-sm text-text-primary truncate">{campaign.context.goal}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Category</p>
                  <p className="text-sm text-text-primary">{campaign.context.category}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Channel</p>
                  <p className="text-sm text-text-primary">{campaign.context.channel}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Customer Universe</p>
                  <p className="text-sm text-text-primary">{campaign.context.customerUniverse?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Segments Summary */}
          {campaign.segments && campaign.segments.length > 0 && (
            <div className="p-4 bg-surface-secondary rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-primary">Segments ({campaign.segments.length})</span>
                {campaign.segmentsLocked && <Lock className="w-3 h-3 text-success" />}
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.segments.map(segment => (
                  <div key={segment.id} className="px-3 py-2 bg-surface rounded-lg">
                    <p className="text-sm font-medium text-text-primary">{segment.name}</p>
                    <p className="text-xs text-text-secondary">{segment.size.toLocaleString()} customers</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Groups Summary */}
          {campaign.productGroups && campaign.productGroups.length > 0 && (
            <div className="p-4 bg-surface-secondary rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-primary">Product Groups ({campaign.productGroups.length})</span>
                {campaign.productsLocked && <Lock className="w-3 h-3 text-success" />}
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.productGroups.map(group => (
                  <div key={group.id} className="px-3 py-2 bg-surface rounded-lg">
                    <p className="text-sm font-medium text-text-primary">{group.segmentName}</p>
                    <p className="text-xs text-text-secondary">{group.products.length} products • {group.bias}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promotions Summary */}
          {campaign.promotionMappings && campaign.promotionMappings.length > 0 && (
            <div className="p-4 bg-surface-secondary rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-primary">Promotions</span>
                {campaign.promotionsLocked && <Lock className="w-3 h-3 text-success" />}
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.promotionMappings.map(mapping => (
                  <div key={mapping.segmentId} className="px-3 py-2 bg-surface rounded-lg">
                    <p className="text-sm font-medium text-text-primary">{mapping.segmentName}</p>
                    <p className="text-xs text-primary">{mapping.promotionValue || 'No promo'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creatives Summary */}
          {campaign.creatives && campaign.creatives.length > 0 && (
            <div className="p-4 bg-surface-secondary rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-primary">Creatives ({campaign.creatives.length})</span>
                {campaign.creativesLocked && <Lock className="w-3 h-3 text-success" />}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {campaign.creatives.map(creative => (
                  <div key={creative.id} className="relative">
                    <img src={creative.imageUrl} alt="" className="w-full aspect-video rounded-lg object-cover" />
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="text-xs text-white bg-black/60 px-2 py-1 rounded truncate">{creative.segmentName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Trail */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-text-primary mb-4">Decision Audit Trail</h3>
          <div className="space-y-3">
            {[
              { step: 'Context', locked: campaign.contextLocked, time: '2 hours ago' },
              { step: 'Segment Strategy', locked: campaign.strategyLocked, time: '1 hour ago' },
              { step: 'Segments', locked: campaign.segmentsLocked, time: '45 min ago' },
              { step: 'Product Logic', locked: campaign.productsLocked, time: '30 min ago' },
              { step: 'Promotions', locked: campaign.promotionsLocked, time: '15 min ago' },
              { step: 'Creatives', locked: campaign.creativesLocked, time: '5 min ago' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
                {item.locked ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-text-muted" />
                )}
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', item.locked ? 'text-text-primary' : 'text-text-muted')}>
                    {item.step}
                  </p>
                </div>
                {item.locked && (
                  <>
                    <Badge variant="success" className="text-xs">Locked</Badge>
                    <span className="text-xs text-text-muted">{item.time}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="tertiary">
            <Download className="w-4 h-4 mr-2" /> Export as Draft
          </Button>
          <Button 
            variant="primary" 
            onClick={handleExport}
            disabled={!allLocked}
            className="bg-success hover:bg-success/90"
          >
            <Rocket className="w-4 h-4 mr-2" /> Launch Campaign
          </Button>
        </div>

        {!allLocked && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Campaign not ready</p>
              <p className="text-xs text-text-secondary">Complete and lock all steps before launching.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
