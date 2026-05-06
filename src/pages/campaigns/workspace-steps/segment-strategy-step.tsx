import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Lock, Users, BarChart3, Plus, Minus, RefreshCw } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, SegmentStrategy } from '@/types'

interface SegmentStrategyStepProps {
  campaign: AgenticCampaign
}

export function SegmentStrategyStep({ campaign }: SegmentStrategyStepProps) {
  const { setSegmentStrategy, lockStrategy, setAgentThinking } = useAgenticCampaignStore()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [strategy, setStrategy] = useState<SegmentStrategy | null>(campaign.segmentStrategy || null)

  const isLocked = campaign.strategyLocked

  const handleGenerateStrategy = async () => {
    setIsGenerating(true)
    setAgentThinking(true, 'Designing segmentation strategy...')
    
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const generatedStrategy: SegmentStrategy = {
      approach: 'hybrid',
      agentRationale: `Based on your ${campaign.context?.campaignType} campaign goal, I recommend a hybrid segmentation approach. Rule-based layers will capture behavioral patterns (purchase recency, category affinity), while statistical clustering will identify value-based segments. This ensures MECE coverage of your ${campaign.context?.customerUniverse?.toLocaleString()} customer universe.`,
      layers: [
        {
          id: 'layer-1',
          name: 'Engagement Tier',
          type: 'rule-based',
          description: 'Segment by email engagement and purchase recency',
          rationale: 'High-engagement customers are 3x more likely to convert on clearance offers'
        },
        {
          id: 'layer-2',
          name: 'Value Cluster',
          type: 'statistical',
          description: 'K-means clustering on AOV, frequency, and margin contribution',
          rationale: 'Identifies price-sensitive vs premium customers for offer targeting'
        },
        {
          id: 'layer-3',
          name: 'Category Affinity',
          type: 'rule-based',
          description: `Customers with ${campaign.context?.category} purchases in lookback window`,
          rationale: 'Direct category buyers have highest conversion potential'
        }
      ]
    }
    
    setStrategy(generatedStrategy)
    setSegmentStrategy(generatedStrategy)
    setIsGenerating(false)
    setAgentThinking(false)
  }

  const handleRemoveLayer = (layerId: string) => {
    if (!strategy) return
    const updated = {
      ...strategy,
      layers: strategy.layers.filter(l => l.id !== layerId)
    }
    setStrategy(updated)
    setSegmentStrategy(updated)
  }

  const handleConfirm = () => {
    lockStrategy()
  }

  if (isLocked) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Strategy Locked</h2>
              <p className="text-sm text-text-secondary">Segmentation strategy has been confirmed</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {campaign.segmentStrategy?.layers.map(layer => (
              <div key={layer.id} className="p-4 bg-surface-secondary rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-text-primary">{layer.name}</span>
                  <Badge variant={layer.type === 'rule-based' ? 'default' : 'info'}>{layer.type}</Badge>
                </div>
                <p className="text-sm text-text-secondary">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Segment Strategy</h2>
        <p className="text-text-secondary">
          Agent will propose segmentation layers based on your campaign context
        </p>
      </div>

      {!strategy ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-agent/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-agent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Design Strategy</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Based on your campaign context, the agent will propose MECE segmentation layers optimized for your goal.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerateStrategy}
            disabled={isGenerating}
            className="bg-agent hover:bg-agent/90"
          >
            {isGenerating ? (
              <>
                <Loader size="small" className="mr-2" />
                Designing Strategy...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Strategy
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
          {/* Agent Rationale */}
          <div className="bg-agent/5 border border-agent/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-agent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-agent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Strategy Rationale</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{strategy.agentRationale}</p>
                <div className="mt-3">
                  <Badge variant="info">Approach: {strategy.approach}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Layers */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Proposed Layers</h3>
              <Button variant="tertiary" size="small" onClick={handleGenerateStrategy}>
                <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
              </Button>
            </div>
            
            <div className="space-y-3">
              {strategy.layers.map((layer, index) => (
                <div key={layer.id} className="p-4 bg-surface-secondary rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text-muted">Layer {index + 1}</span>
                        <Badge variant={layer.type === 'rule-based' ? 'default' : 'info'}>
                          {layer.type === 'rule-based' ? <Users className="w-3 h-3 mr-1" /> : <BarChart3 className="w-3 h-3 mr-1" />}
                          {layer.type}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-text-primary mb-1">{layer.name}</h4>
                      <p className="text-sm text-text-secondary mb-2">{layer.description}</p>
                      <p className="text-xs text-agent">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {layer.rationale}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveLayer(layer.id)}
                      className="p-2 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 p-3 border-2 border-dashed border-border rounded-xl text-sm text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Request Additional Layer
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="tertiary" onClick={handleGenerateStrategy}>
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              <Check className="w-4 h-4 mr-2" /> Approve Strategy
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
