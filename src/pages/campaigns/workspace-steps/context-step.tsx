import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, Check, Edit3, Lock, Target, Globe, Calendar, 
  MapPin, Package
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Loader } from '@/components/ui/loader'
import { Select } from '@/components/ui/select'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, CampaignContext } from '@/types'

interface ContextStepProps {
  campaign: AgenticCampaign
}

const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home & Garden', 'Beauty']
const CHANNELS = ['Email', 'Push', 'SMS', 'Email + Push', 'Omnichannel']
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Global']
const LOOKBACK_OPTIONS = ['30 days', '60 days', '90 days', '180 days', '1 year']

export function ContextStep({ campaign }: ContextStepProps) {
  const { updateContext, lockContext, setAgentThinking } = useAgenticCampaignStore()
  
  const [goal, setGoal] = useState(campaign.context?.goal || '')
  const [category, setCategory] = useState(campaign.context?.category || '')
  const [channel, setChannel] = useState(campaign.context?.channel || '')
  const [region, setRegion] = useState(campaign.context?.region || '')
  const [lookbackWindow, setLookbackWindow] = useState(campaign.context?.lookbackWindow || '')
  
  const [agentAnalyzed, setAgentAnalyzed] = useState(!!campaign.context?.agentSummary)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const canAnalyze = goal && category && channel && region && lookbackWindow
  const isLocked = campaign.contextLocked

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    
    setIsAnalyzing(true)
    setAgentThinking(true, 'Analyzing campaign context...')
    
    // Simulate agent analysis
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Agent derives context
    const derivedContext: CampaignContext = {
      goal,
      category,
      channel,
      region,
      lookbackWindow,
      campaignType: goal.toLowerCase().includes('clear') ? 'Clearance' : 'Full-Price Push',
      customerUniverse: Math.floor(Math.random() * 200000) + 50000,
      inventoryRelevance: 'High - 12,000 units in scope',
      timeSensitivity: 'Moderate - 4 weeks runway',
      agentSummary: `Based on your goal "${goal}", this appears to be a ${goal.toLowerCase().includes('clear') ? 'clearance' : 'growth'} campaign targeting ${category} customers via ${channel}. The ${lookbackWindow} lookback window will help identify customers with recent ${category.toLowerCase()} engagement in ${region}. I recommend focusing on price-sensitive segments with high email engagement rates.`
    }
    
    updateContext(derivedContext)
    setAgentAnalyzed(true)
    setIsAnalyzing(false)
    setAgentThinking(false)
  }

  const handleConfirm = () => {
    lockContext()
  }

  const handleEdit = () => {
    setAgentAnalyzed(false)
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
              <h2 className="text-lg font-semibold text-text-primary">Context Locked</h2>
              <p className="text-sm text-text-secondary">Campaign context has been confirmed and locked</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-muted mb-1">Goal</p>
              <p className="text-sm font-medium text-text-primary">{campaign.context?.goal}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-muted mb-1">Category</p>
              <p className="text-sm font-medium text-text-primary">{campaign.context?.category}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-muted mb-1">Channel</p>
              <p className="text-sm font-medium text-text-primary">{campaign.context?.channel}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-xs text-text-muted mb-1">Region</p>
              <p className="text-sm font-medium text-text-primary">{campaign.context?.region}</p>
            </div>
          </div>
          
          <div className="p-4 bg-agent/5 border border-agent/20 rounded-xl">
            <p className="text-sm text-text-primary">{campaign.context?.agentSummary}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Define Campaign Context</h2>
        <p className="text-text-secondary">
          Provide your intent and the agent will derive the full campaign structure
        </p>
      </div>

      {!agentAnalyzed ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-6">Your Intent</h3>
          
          <div className="space-y-5">
            {/* Goal */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Campaign Goal
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Clear excess summer inventory before fall arrivals..."
                className="w-full h-24 px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Category & Channel */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <Select
                  value={category}
                  onChange={setCategory}
                  options={CATEGORIES}
                  placeholder="Select category..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Channel
                </label>
                <Select
                  value={channel}
                  onChange={setChannel}
                  options={CHANNELS}
                  placeholder="Select channel..."
                />
              </div>
            </div>

            {/* Region & Lookback */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Region
                </label>
                <Select
                  value={region}
                  onChange={setRegion}
                  options={REGIONS}
                  placeholder="Select region..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Lookback Window
                </label>
                <Select
                  value={lookbackWindow}
                  onChange={setLookbackWindow}
                  options={LOOKBACK_OPTIONS}
                  placeholder="Select window..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              disabled={!canAnalyze || isAnalyzing}
              onClick={handleAnalyze}
              className="bg-agent hover:bg-agent/90"
            >
              {isAnalyzing ? (
                <>
                  <Loader size="small" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Let Agent Analyze
                </>
              )}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Agent Summary */}
          <div className="bg-agent/5 border border-agent/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-agent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-agent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-2">Agent Analysis</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {campaign.context?.agentSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Derived Metrics */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-text-primary mb-4">Derived Context</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-surface-secondary rounded-xl">
                <p className="text-xs text-text-muted mb-1">Campaign Type</p>
                <p className="text-lg font-semibold text-text-primary">{campaign.context?.campaignType}</p>
              </div>
              <div className="p-4 bg-surface-secondary rounded-xl">
                <p className="text-xs text-text-muted mb-1">Customer Universe</p>
                <p className="text-lg font-semibold text-text-primary">{campaign.context?.customerUniverse?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-surface-secondary rounded-xl">
                <p className="text-xs text-text-muted mb-1">Inventory Relevance</p>
                <p className="text-sm font-medium text-text-primary">{campaign.context?.inventoryRelevance}</p>
              </div>
              <div className="p-4 bg-surface-secondary rounded-xl">
                <p className="text-xs text-text-muted mb-1">Time Sensitivity</p>
                <p className="text-sm font-medium text-text-primary">{campaign.context?.timeSensitivity}</p>
              </div>
            </div>
          </div>

          {/* Input Summary */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Your Inputs</h3>
              <Button variant="tertiary" size="small" onClick={handleEdit}>
                <Edit3 className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Goal</p>
                <p className="text-sm text-text-primary truncate">{goal}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Category</p>
                <p className="text-sm text-text-primary">{category}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Channel</p>
                <p className="text-sm text-text-primary">{channel}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Region</p>
                <p className="text-sm text-text-primary">{region}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Lookback</p>
                <p className="text-sm text-text-primary">{lookbackWindow}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="tertiary" onClick={handleEdit}>
              <Edit3 className="w-4 h-4 mr-2" /> Edit Inputs
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              <Check className="w-4 h-4 mr-2" /> Confirm Context
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
