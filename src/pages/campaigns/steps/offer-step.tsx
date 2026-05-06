import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, AlertTriangle, ChevronRight, ExternalLink, Package, Check } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Panel } from 'impact-ui/src/components/Panel/index.js'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCampaignStore } from '@/store/campaign-store'
import { cn } from '@/lib/utils'
import type { Promo } from '@/types'

interface OfferStepProps {
  onComplete: () => void
}

const availablePromos: Promo[] = [
  { id: 'p1', name: '20% Off First Order', discount: '20%', status: 'active', channel: 'Email', category: 'Discount' },
  { id: 'p2', name: 'Free Shipping', discount: 'Free', status: 'active', channel: 'All', category: 'Shipping' },
  { id: 'p3', name: 'Buy 2 Get 1 Free', discount: 'BOGO', status: 'active', channel: 'Email', category: 'Bundle' },
  { id: 'p4', name: 'Holiday Special 30%', discount: '30%', status: 'upcoming', channel: 'All', category: 'Seasonal' },
]

const sampleProducts = [
  { id: 'prod1', name: 'Premium Wireless Headphones', sku: 'WH-1000XM5', price: '$349.99', stock: 'In Stock' },
  { id: 'prod2', name: 'Smart Watch Series 8', sku: 'SW-S8-BLK', price: '$399.99', stock: 'Low Stock' },
  { id: 'prod3', name: 'Portable Bluetooth Speaker', sku: 'PBS-MINI', price: '$79.99', stock: 'In Stock' },
]

export function OfferStep({ onComplete }: OfferStepProps) {
  const { selectedAudiences, audiencePromoMapping, setAudiencePromo } = useCampaignStore()
  const [showProductDrawer, setShowProductDrawer] = useState(false)

  const getPromoForAudience = (audienceId: string) => {
    const promoId = audiencePromoMapping[audienceId]
    return availablePromos.find(p => p.id === promoId)
  }

  const hasAllPromos = selectedAudiences.every(a => audiencePromoMapping[a.id])

  const handleViewProducts = (_audienceId: string) => {
    setShowProductDrawer(true)
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
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Offer & Product Eligibility</h2>
            <p className="text-text-secondary text-sm">Match promotions to your audiences</p>
          </div>
        </div>
      </motion.div>

      {/* Audience-Promo Mapping */}
      <div className="space-y-4 mb-8">
        {selectedAudiences.map((audience, index) => {
          const assignedPromo = getPromoForAudience(audience.id)
          const hasAlert = !assignedPromo

          return (
            <motion.div
              key={audience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={hasAlert ? { borderColor: 'var(--color-warning)', borderWidth: '1.5px' } : undefined}>
                <div className="flex items-start gap-4">
                  {/* Audience Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-text-primary">{audience.name}</h4>
                      {hasAlert && (
                        <Badge variant="warning">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Promo Missing
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-4">{audience.description}</p>

                    {/* Promo Selection */}
                    <div className="flex flex-wrap gap-2">
                      {availablePromos.filter(p => p.status === 'active').map((promo) => (
                        <button
                          key={promo.id}
                          onClick={() => setAudiencePromo(audience.id, promo.id)}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                            audiencePromoMapping[audience.id] === promo.id
                              ? 'bg-primary text-white border-primary'
                              : 'bg-surface border-border text-text-secondary hover:border-primary/50'
                          )}
                        >
                          <span className="font-semibold">{promo.discount}</span>
                          <span className="ml-1 text-xs opacity-75">{promo.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Preview */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleViewProducts(audience.id)}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Package className="w-4 h-4" />
                      View Products
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {assignedPromo && (
                      <div className="flex items-center gap-1 text-success text-sm">
                        <Check className="w-4 h-4" />
                        Promo assigned
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Constraints */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-text-muted mb-2">Product Eligibility</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-surface-tertiary rounded text-xs text-text-secondary">
                      Category: Electronics
                    </span>
                    <span className="px-2 py-1 bg-surface-tertiary rounded text-xs text-text-secondary">
                      Min. Price: $50
                    </span>
                    <span className="px-2 py-1 bg-surface-tertiary rounded text-xs text-text-secondary">
                      Excludes: Clearance
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-text-muted">
          {Object.keys(audiencePromoMapping).length} of {selectedAudiences.length} audiences have promos
        </p>
        <Button
          size="large"
          onClick={onComplete}
          disabled={!hasAllPromos}
        >
          Continue to Creative
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Product Drawer */}
      <Panel
        title="Sample Products"
        anchor="right"
        open={showProductDrawer}
        setIsOpen={setShowProductDrawer}
        onClose={() => setShowProductDrawer(false)}
        size="medium"
      >
        <div className="space-y-4 p-2">
          {sampleProducts.map((product) => (
            <div key={product.id} className="p-4 bg-surface-secondary rounded-lg">
              <h4 className="font-medium text-text-primary mb-1">{product.name}</h4>
              <p className="text-xs text-text-muted mb-2">SKU: {product.sku}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary">{product.price}</span>
                <Badge variant={product.stock === 'In Stock' ? 'success' : 'warning'}>
                  {product.stock}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
