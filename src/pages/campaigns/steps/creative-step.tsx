import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, ChevronRight, Check, Shield, AlertCircle, Eye } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { useCampaignStore } from '@/store/campaign-store'
import { cn } from '@/lib/utils'
import type { CreativeVariant } from '@/types'

interface CreativeStepProps {
  onComplete: () => void
}

export function CreativeStep({ onComplete }: CreativeStepProps) {
  const { selectedAudiences, audiencePromoMapping, creativeVariants, setCreativeVariants } = useCampaignStore()
  const [activeVariant, setActiveVariant] = useState<string | null>(null)

  useEffect(() => {
    // Generate creative variants based on selected audiences
    const variants: CreativeVariant[] = selectedAudiences.map((audience, index) => ({
      id: `variant-${audience.id}`,
      audienceId: audience.id,
      audienceName: audience.name,
      headline: getHeadlineForAudience(audience.name),
      subheadline: getSubheadlineForAudience(audience.name),
      cta: getCtaForAudience(audience.name),
      promoLabel: audiencePromoMapping[audience.id] ? getPromoLabel(audiencePromoMapping[audience.id]) : undefined,
      imageUrl: `/api/placeholder/600/400?text=Creative+${index + 1}`,
      compliance: {
        approved: Math.random() > 0.3,
        flags: Math.random() > 0.7 ? ['Review CTA text'] : [],
      },
    }))
    setCreativeVariants(variants)
    if (variants.length > 0) {
      setActiveVariant(variants[0].id)
    }
  }, [selectedAudiences, audiencePromoMapping, setCreativeVariants])

  const activeCreative = creativeVariants.find(v => v.id === activeVariant)

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Creative Preview</h2>
            <p className="text-text-secondary text-sm">See what your customers will experience</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-8">
        {/* Segment Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-3"
        >
          <p className="text-sm font-medium text-text-primary mb-3">Audience Variants</p>
          <div className="space-y-2">
            {creativeVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setActiveVariant(variant.id)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-all border',
                  activeVariant === variant.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-border text-text-secondary hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{variant.audienceName}</span>
                  {variant.compliance.approved ? (
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Creative Canvas - The WOW Screen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-9"
        >
          {activeCreative && (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-lg">
              {/* Preview Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-secondary">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">Preview for: <strong className="text-text-primary">{activeCreative.audienceName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {activeCreative.compliance.approved ? (
                    <Badge variant="success">
                      <Shield className="w-3 h-3 mr-1" />
                      Compliant
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Review Needed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Creative Visual */}
              <div className="relative">
                {/* Email Preview */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                  <div className="max-w-md mx-auto bg-surface rounded-xl shadow-md overflow-hidden">
                    {/* Email Header */}
                    <div className="bg-gradient-to-r from-primary to-accent p-6 text-white relative">
                      {activeCreative.promoLabel && (
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                          {activeCreative.promoLabel}
                        </div>
                      )}
                      <h3 className="text-lg font-bold mb-2">{activeCreative.headline}</h3>
                      <p className="text-white/80">{activeCreative.subheadline}</p>
                    </div>

                    {/* Email Body */}
                    <div className="p-6">
                      <div className="aspect-video bg-surface-tertiary rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <Palette className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm text-text-muted">Hero Image</p>
                        </div>
                      </div>

                      <p className="text-text-secondary text-sm mb-6">
                        Discover our exclusive collection curated just for you. 
                        Limited time offer - don't miss out on these amazing deals.
                      </p>

                      <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                        {activeCreative.cta}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compliance Flags */}
                {activeCreative.compliance.flags.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-warning mb-1">Compliance Notes</p>
                      <ul className="text-xs text-text-secondary">
                        {activeCreative.compliance.flags.map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between mt-8"
      >
        <p className="text-sm text-text-muted">
          {creativeVariants.filter(v => v.compliance.approved).length} of {creativeVariants.length} variants approved
        </p>
        <Button size="large" onClick={onComplete}>
          Continue to Review
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}

// Helper functions
function getHeadlineForAudience(audienceName: string): string {
  if (audienceName.includes('Loyalist')) return 'Thank You for Being Amazing!'
  if (audienceName.includes('Churner')) return 'We Miss You!'
  if (audienceName.includes('New')) return 'Welcome to the Family!'
  return 'Exclusive Offer Just for You'
}

function getSubheadlineForAudience(audienceName: string): string {
  if (audienceName.includes('Loyalist')) return 'Enjoy exclusive rewards as our valued customer'
  if (audienceName.includes('Churner')) return 'Come back and see what\'s new'
  if (audienceName.includes('New')) return 'Start your journey with a special welcome gift'
  return 'Don\'t miss this limited-time opportunity'
}

function getCtaForAudience(audienceName: string): string {
  if (audienceName.includes('Loyalist')) return 'Claim My Reward'
  if (audienceName.includes('Churner')) return 'Shop Now'
  if (audienceName.includes('New')) return 'Get Started'
  return 'Learn More'
}

function getPromoLabel(promoId: string): string {
  const labels: Record<string, string> = {
    p1: '20% OFF',
    p2: 'FREE SHIPPING',
    p3: 'BUY 2 GET 1',
    p4: '30% OFF',
  }
  return labels[promoId] || 'SPECIAL OFFER'
}
