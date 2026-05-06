import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Lock, Package, RefreshCw } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, ProductGroup } from '@/types'

interface ProductLogicStepProps {
  campaign: AgenticCampaign
}

export function ProductLogicStep({ campaign }: ProductLogicStepProps) {
  const { setProductGroups, updateProductGroupBias, lockProducts, setAgentThinking } = useAgenticCampaignStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [groups, setLocalGroups] = useState<ProductGroup[]>(campaign.productGroups || [])

  const isLocked = campaign.productsLocked

  const handleGenerateProducts = async () => {
    setIsGenerating(true)
    setAgentThinking(true, 'Deriving product logic per segment...')
    
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const segments = campaign.segments || []
    const generatedGroups: ProductGroup[] = segments.map((segment, index) => ({
      id: `group-${segment.id}`,
      segmentId: segment.id,
      segmentName: segment.name,
      rationale: `Selected based on ${segment.name.toLowerCase()} preferences: ${index % 2 === 0 ? 'high margin items with strong affinity scores' : 'clearance inventory matching category interest'}`,
      bias: index % 3 === 0 ? 'premium' : index % 3 === 1 ? 'clearance' : 'balanced',
      products: [
        { id: `prod-${index}-1`, name: 'Summer Linen Blazer', category: campaign.context?.category || 'Apparel', price: 129, margin: 45, inventory: 850, affinity: 0.89, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100' },
        { id: `prod-${index}-2`, name: 'Cotton Chino Pants', category: campaign.context?.category || 'Apparel', price: 79, margin: 38, inventory: 1200, affinity: 0.82, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100' },
        { id: `prod-${index}-3`, name: 'Casual Oxford Shirt', category: campaign.context?.category || 'Apparel', price: 65, margin: 42, inventory: 950, affinity: 0.78, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100' },
      ]
    }))
    
    setLocalGroups(generatedGroups)
    setProductGroups(generatedGroups)
    setIsGenerating(false)
    setAgentThinking(false)
  }

  const handleBiasChange = (groupId: string, bias: 'premium' | 'clearance' | 'balanced') => {
    const updated = groups.map(g => g.id === groupId ? { ...g, bias } : g)
    setLocalGroups(updated)
    updateProductGroupBias(groupId, bias)
  }

  const handleConfirm = () => {
    lockProducts()
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
              <h2 className="text-lg font-semibold text-text-primary">Product Logic Locked</h2>
              <p className="text-sm text-text-secondary">{campaign.productGroups?.length} product groups configured</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {campaign.productGroups?.map(group => (
              <div key={group.id} className="p-4 bg-surface-secondary rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">{group.segmentName}</span>
                  <Badge variant={group.bias === 'premium' ? 'info' : group.bias === 'clearance' ? 'warning' : 'default'}>
                    {group.bias}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary mt-1">{group.products.length} products selected</p>
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
        <h2 className="text-lg font-semibold text-text-primary mb-2">Product Logic</h2>
        <p className="text-text-secondary">
          Agent derives product groups per segment based on inventory, margin, and affinity
        </p>
      </div>

      {groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-agent/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-agent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Derive Products</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            The agent will select products for each segment based on inventory levels, margin contribution, and customer affinity.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerateProducts}
            disabled={isGenerating}
            className="bg-agent hover:bg-agent/90"
          >
            {isGenerating ? (
              <>
                <Loader size="small" className="mr-2" />
                Deriving Products...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Derive Product Logic
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
          {groups.map(group => (
            <div key={group.id} className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{group.segmentName}</h3>
                  <p className="text-sm text-text-secondary mt-1">{group.rationale}</p>
                </div>
                <div className="flex gap-1">
                  {(['premium', 'balanced', 'clearance'] as const).map(bias => (
                    <button
                      key={bias}
                      onClick={() => handleBiasChange(group.id, bias)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                        group.bias === bias 
                          ? bias === 'premium' ? 'bg-info text-white' : bias === 'clearance' ? 'bg-warning text-white' : 'bg-primary text-white'
                          : 'bg-surface-tertiary text-text-secondary hover:bg-surface-secondary'
                      )}
                    >
                      {bias}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {group.products.map(product => (
                  <div key={product.id} className="p-3 bg-surface-secondary rounded-xl flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                      <p className="text-xs text-text-secondary">${product.price} • {product.margin}% margin</p>
                      <p className="text-xs text-success">{product.inventory} units • {Math.round(product.affinity * 100)}% affinity</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="tertiary" onClick={handleGenerateProducts}>
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              <Check className="w-4 h-4 mr-2" /> Approve Product Groups
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
