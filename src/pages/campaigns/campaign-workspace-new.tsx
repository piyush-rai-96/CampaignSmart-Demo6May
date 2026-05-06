import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Check, Lock, Sparkles, TrendingUp, Users, 
  Mail, Bell, MessageSquare, Smartphone,
  Package, Tag, Palette, Rocket, Edit3, RefreshCw, CheckCircle,
  ChevronRight, AlertTriangle, Shield, Target, Zap, Eye,
  Calendar, Globe, ShoppingBag, BarChart3, ArrowRight
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Select } from '@/components/ui/select'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Tabs } from 'impact-ui/src/components/Tabs/index.js'
import { cn } from '@/lib/utils'

type CampaignStep = 'context' | 'audience' | 'offer' | 'creative' | 'review'

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'
  currentStep: CampaignStep
  lockedSteps: CampaignStep[]
  goal: string
  category: string | null
  channel: string | null
  region: string | null
  derivedContext?: {
    campaignType: string
    campaignName: string
    risks: string[]
    guardrails: string[]
    estimatedUniverse: number
    marginProtection: string | null
    seasonality: string | null
  }
  audienceStrategy?: {
    segments: { id: string; name: string; size: number; percentage: number; description: string; logic: string }[]
    totalCoverage: number
    segmentationLayers: string[]
  }
  offerMapping?: {
    segmentId: string
    segmentName: string
    productGroup: string
    promotion: string
    promoValue: string
    expectedLift: number
    marginImpact: number
    overstockCoverage: number
  }[]
  creatives?: {
    id: string
    segmentId: string
    segmentName: string
    headline: string
    subcopy: string
    cta: string
    tone: string
    hasOffer: boolean
    offerBadge?: string
    complianceStatus: string
    reasoning: string
    image: string
    approved: boolean
  }[]
}

const CATEGORIES = ['Apparel', 'Electronics', 'Home & Garden', 'Beauty', 'Sports']
const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'push', label: 'Push', icon: Bell },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'in-app', label: 'In-App', icon: Smartphone },
]
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America']

const STEPS: { id: CampaignStep; label: string; icon: React.ElementType }[] = [
  { id: 'context', label: 'Context', icon: Target },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'offer', label: 'Offer', icon: Tag },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'review', label: 'Review', icon: Rocket },
]

const deriveContext = (goal: string, category: string) => {
  const isClearance = goal.toLowerCase().includes('clear') || goal.toLowerCase().includes('inventory')
  return {
    campaignType: isClearance ? 'Clearance Push' : 'Full-Price Promotion',
    campaignName: isClearance ? `${category} Clearance Campaign` : `${category} Engagement Campaign`,
    risks: isClearance 
      ? ['Margin dilution on high-value items', 'Brand perception risk', 'Cannibalization of full-price'] 
      : ['Lower conversion without discount', 'Competition from clearance'],
    guardrails: isClearance 
      ? ['Cap discount at 40% for premium', 'Exclude new arrivals', 'Min margin: 25%'] 
      : ['Focus on value messaging', 'Highlight exclusivity'],
    estimatedUniverse: Math.floor(Math.random() * 100000) + 150000,
    marginProtection: null,
    seasonality: null
  }
}

const deriveAudienceStrategy = () => ({
  segments: [
    { id: 'seg-1', name: 'VIP Promo-Responsive', size: 45200, percentage: 18.4, description: 'High-value customers who engage with promos', logic: 'statistical' },
    { id: 'seg-2', name: 'Mid-Value Fence Sitters', size: 62100, percentage: 25.3, description: 'Moderate spenders with browse-not-buy behavior', logic: 'rule-based' },
    { id: 'seg-3', name: 'At-Risk High Affinity', size: 28500, percentage: 11.6, description: 'Previously active with declining engagement', logic: 'statistical' },
    { id: 'seg-4', name: 'New Customer Converters', size: 34900, percentage: 14.2, description: 'Recent first-time buyers', logic: 'rule-based' },
  ],
  totalCoverage: 69.5,
  segmentationLayers: ['Engagement recency', 'Value clustering (k-means)', 'Category affinity']
})

const deriveOfferMapping = () => [
  { segmentId: 'seg-1', segmentName: 'VIP Promo-Responsive', productGroup: 'Premium Clearance', promotion: 'VIP Early Access 25%', promoValue: '25% OFF', expectedLift: 89, marginImpact: -12, overstockCoverage: 78 },
  { segmentId: 'seg-2', segmentName: 'Mid-Value Fence Sitters', productGroup: 'Best Sellers', promotion: 'Limited Time 20%', promoValue: '20% OFF', expectedLift: 67, marginImpact: -8, overstockCoverage: 45 },
  { segmentId: 'seg-3', segmentName: 'At-Risk High Affinity', productGroup: 'Category Favorites', promotion: 'Welcome Back $30', promoValue: '$30 OFF', expectedLift: 76, marginImpact: -15, overstockCoverage: 32 },
  { segmentId: 'seg-4', segmentName: 'New Customer Converters', productGroup: 'Trending Items', promotion: 'Free Shipping + 15%', promoValue: '15% + Free Ship', expectedLift: 82, marginImpact: -6, overstockCoverage: 28 },
]

const deriveCreatives = () => [
  { id: 'cr-1', segmentId: 'seg-1', segmentName: 'VIP Promo-Responsive', headline: 'VIP Early Access: 25% OFF', subcopy: 'Exclusive clearance for our best customers', cta: 'Shop VIP Sale', tone: 'Exclusive', hasOffer: true, offerBadge: '25% OFF', complianceStatus: 'approved', reasoning: 'VIP messaging reinforces loyalty while urgency drives conversion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600', approved: false },
  { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Mid-Value Fence Sitters', headline: "Don't Miss Out: 20% OFF", subcopy: 'The styles you\'ve been eyeing are now on sale', cta: 'Complete Your Look', tone: 'Persuasive', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Addresses browse-abandon behavior with direct CTA', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', approved: false },
  { id: 'cr-3', segmentId: 'seg-3', segmentName: 'At-Risk High Affinity', headline: "We've Missed You!", subcopy: "Here's $30 OFF to welcome you back", cta: 'Come Back & Save', tone: 'Warm', hasOffer: true, offerBadge: '$30 OFF', complianceStatus: 'approved', reasoning: 'Personal tone re-engages lapsed customers', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600', approved: false },
  { id: 'cr-4', segmentId: 'seg-4', segmentName: 'New Customer Converters', headline: 'Your 2nd Order Ships Free!', subcopy: 'Plus 15% OFF to say thanks', cta: 'Shop Again', tone: 'Encouraging', hasOffer: true, offerBadge: '15% + Free Ship', complianceStatus: 'pending', reasoning: 'Builds habit with low-friction incentive', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', approved: false },
]

export function CampaignWorkspace() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [isAlanWorking, setIsAlanWorking] = useState(false)
  const [alanStatus, setAlanStatus] = useState<string | null>(null)

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId)

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const handleStartCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: 'New Campaign',
      status: 'draft',
      currentStep: 'context',
      lockedSteps: [],
      goal: '',
      category: null,
      channel: null,
      region: null
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setActiveCampaignId(newCampaign.id)
  }

  const handleLockStep = async (
    step: CampaignStep,
    nextStep: CampaignStep,
    statusMsg: string,
    deriveData: () => Partial<Campaign>
  ) => {
    if (!activeCampaign) return
    setIsAlanWorking(true)
    setAlanStatus(statusMsg)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const derived = deriveData()
    updateCampaign(activeCampaign.id, {
      ...derived,
      lockedSteps: [...activeCampaign.lockedSteps, step],
      currentStep: nextStep
    })
    setIsAlanWorking(false)
    setAlanStatus(null)
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Left Panel - Campaign List */}
      <div className="w-72 bg-surface border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-text-primary mb-3">Campaigns</h2>
          <Button variant="primary" className="w-full" onClick={handleStartCampaign}>
            <Plus className="w-4 h-4 mr-2" /> New Campaign
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {campaigns.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No campaigns yet</p>
          ) : (
            campaigns.map(campaign => (
              <button
                key={campaign.id}
                onClick={() => setActiveCampaignId(campaign.id)}
                className={cn(
                  'w-full p-3 rounded-xl text-left transition-colors',
                  activeCampaignId === campaign.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-surface-secondary hover:bg-surface-tertiary'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text-primary text-sm truncate">
                    {campaign.name}
                  </span>
                  <Badge variant="warning" className="text-xs">{campaign.status}</Badge>
                </div>
                <div className="flex gap-1">
                  {STEPS.map(step => (
                    <div
                      key={step.id}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        campaign.lockedSteps.includes(step.id)
                          ? 'bg-success'
                          : campaign.currentStep === step.id
                          ? 'bg-primary'
                          : 'bg-border'
                      )}
                    />
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Stepper */}
        {activeCampaign && (
          <div className="bg-surface border-b border-border px-8 py-4">
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((step, i) => {
                const isLocked = activeCampaign.lockedSteps.includes(step.id)
                const isCurrent = activeCampaign.currentStep === step.id
                const StepIcon = step.icon
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                        isLocked
                          ? 'bg-success/10 text-success'
                          : isCurrent
                          ? 'bg-primary text-white'
                          : 'bg-surface-tertiary text-text-muted'
                      )}
                    >
                      {isLocked ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      {step.label}
                      {isLocked && <Lock className="w-3 h-3 ml-1" />}
                    </div>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className={cn('w-5 h-5 mx-2', isLocked ? 'text-success' : 'text-border')} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!activeCampaign ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">Start a New Campaign</h2>
                <p className="text-text-secondary mb-6">Alan will guide you through the entire process</p>
                <Button variant="primary" onClick={handleStartCampaign}>
                  <Plus className="w-4 h-4 mr-2" /> Create Campaign
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-8 px-6">
              {/* Alan Working Indicator */}
              <AnimatePresence>
                {isAlanWorking && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-5 bg-gradient-to-r from-agent/10 to-primary/10 border border-agent/20 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-agent/20 flex items-center justify-center">
                        <Loader size="medium" color="var(--color-agent)" />
                      </div>
                      <div>
                        <p className="font-semibold text-agent">Alan is working...</p>
                        <p className="text-sm text-text-secondary">{alanStatus}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {activeCampaign.currentStep === 'context' && !activeCampaign.derivedContext && (
                  <ContextInputStep
                    campaign={activeCampaign}
                    onUpdate={(u) => updateCampaign(activeCampaign.id, u)}
                    onSubmit={() =>
                      handleLockStep('context', 'context', 'Analyzing campaign context...', () => ({
                        derivedContext: deriveContext(activeCampaign.goal, activeCampaign.category!)
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'context' && activeCampaign.derivedContext && (
                  <ContextDecisionStep
                    campaign={activeCampaign}
                    onUpdateDerived={(f, v) =>
                      updateCampaign(activeCampaign.id, {
                        derivedContext: { ...activeCampaign.derivedContext!, [f]: v }
                      })
                    }
                    onConfirm={() =>
                      handleLockStep('context', 'audience', 'Designing audience strategy...', () => ({
                        name: activeCampaign.derivedContext!.campaignName,
                        audienceStrategy: deriveAudienceStrategy()
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'audience' && (
                  <AudienceStep
                    campaign={activeCampaign}
                    onConfirm={() =>
                      handleLockStep('audience', 'offer', 'Mapping promotions...', () => ({
                        offerMapping: deriveOfferMapping()
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'offer' && (
                  <OfferStep
                    campaign={activeCampaign}
                    onConfirm={() =>
                      handleLockStep('offer', 'creative', 'Generating creatives...', () => ({
                        creatives: deriveCreatives()
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'creative' && (
                  <CreativeStep
                    campaign={activeCampaign}
                    onApprove={(id) =>
                      updateCampaign(activeCampaign.id, {
                        creatives: activeCampaign.creatives?.map(c =>
                          c.id === id ? { ...c, approved: !c.approved } : c
                        )
                      })
                    }
                    onConfirm={() =>
                      handleLockStep('creative', 'review', 'Validating campaign...', () => ({}))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'review' && <ReviewStep campaign={activeCampaign} />}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Components

function ContextInputStep({
  campaign,
  onUpdate,
  onSubmit,
  isWorking
}: {
  campaign: Campaign
  onUpdate: (u: Partial<Campaign>) => void
  onSubmit: () => void
  isWorking: boolean
}) {
  const canSubmit = campaign.goal && campaign.category && campaign.channel

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-border p-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Define Your Goal</h2>
            <p className="text-text-secondary">Tell Alan what you want to achieve</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Campaign Goal <span className="text-danger">*</span>
          </label>
          <textarea
            value={campaign.goal}
            onChange={(e) => onUpdate({ goal: e.target.value })}
            placeholder="e.g., Clear excess summer inventory before fall arrivals..."
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              <ShoppingBag className="w-4 h-4 inline mr-1" /> Category *
            </label>
            <Select
              value={campaign.category || ''}
              onChange={(v) => onUpdate({ category: v || null })}
              options={CATEGORIES}
              placeholder="Select category"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              <Mail className="w-4 h-4 inline mr-1" /> Channel *
            </label>
            <div className="flex gap-2">
              {CHANNELS.map(ch => {
                const Icon = ch.icon
                return (
                  <button
                    key={ch.id}
                    onClick={() => onUpdate({ channel: ch.id })}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium',
                      campaign.channel === ch.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 text-text-secondary'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {ch.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              <Globe className="w-4 h-4 inline mr-1" /> Region
            </label>
            <Select
              value={campaign.region || ''}
              onChange={(v) => onUpdate({ region: v || null })}
              options={REGIONS}
              placeholder="All regions"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> Lookback
            </label>
            <Select
              value="Default (90 days)"
              onChange={() => {}}
              options={['Default (90 days)', '30 days', '60 days', '180 days']}
              placeholder="Select lookback"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={!canSubmit || isWorking}
            className="px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Let Alan Analyze
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ContextDecisionStep({
  campaign,
  onUpdateDerived,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onUpdateDerived: (f: string, v: string) => void
  onConfirm: () => void
  isWorking: boolean
}) {
  const derived = campaign.derivedContext!
  const needsInput = !derived.marginProtection || !derived.seasonality

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has analyzed your goal</p>
              <p className="text-sm text-text-secondary">Review the derived strategy below</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Type */}
          <div className="flex items-start gap-4 p-4 bg-surface-secondary rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">Campaign Type</p>
              <p className="text-lg font-semibold text-text-primary">{derived.campaignType}</p>
              <p className="text-sm text-text-secondary mt-1">
                Suggested name: <span className="font-medium">{derived.campaignName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted mb-1">Est. Universe</p>
              <p className="text-lg font-semibold text-primary">
                {derived.estimatedUniverse.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="font-medium text-text-primary">Key Risks</p>
            </div>
            <ul className="space-y-2">
              {derived.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Guardrails */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-success" />
              <p className="font-medium text-text-primary">Guardrails</p>
            </div>
            <ul className="space-y-2">
              {derived.guardrails.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-success mt-0.5" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Why this works */}
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <p className="text-sm font-medium text-success mb-1">Why this approach works</p>
            <p className="text-sm text-text-secondary">
              This strategy balances inventory clearance with margin protection by targeting
              price-sensitive segments with appropriate discounts.
            </p>
          </div>

          {/* Alan needs input */}
          {needsInput && (
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
              <p className="text-sm font-medium text-warning mb-3">Alan needs your input</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted mb-2">Margin Protection</p>
                  <div className="flex gap-2">
                    {['strict', 'flexible'].map(v => (
                      <button
                        key={v}
                        onClick={() => onUpdateDerived('marginProtection', v)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 capitalize',
                          derived.marginProtection === v
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-2">Campaign Type</p>
                  <div className="flex gap-2">
                    {['seasonal', 'evergreen'].map(v => (
                      <button
                        key={v}
                        onClick={() => onUpdateDerived('seasonality', v)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 capitalize',
                          derived.seasonality === v
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="tertiary">
            <Edit3 className="w-4 h-4 mr-2" /> Adjust Inputs
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={needsInput || isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm & Lock Context
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function AudienceStep({
  campaign,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  isWorking: boolean
}) {
  const strategy = campaign.audienceStrategy

  if (!strategy) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" color="var(--color-agent)" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has designed your audience strategy</p>
              <p className="text-sm text-text-secondary">
                MECE segmentation with {strategy.totalCoverage}% coverage
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Layers */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-muted">Layers:</span>
            {strategy.segmentationLayers.map((l, i) => (
              <Badge key={i} variant="default" className="bg-surface-tertiary">{l}</Badge>
            ))}
          </div>

          {/* Segments */}
          <div className="space-y-3">
            {strategy.segments.map(seg => (
              <div key={seg.id} className="p-4 bg-surface-secondary rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary">{seg.name}</h4>
                      <Badge
                        variant={seg.logic === 'statistical' ? 'info' : 'default'}
                        className="text-xs"
                      >
                        {seg.logic}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{seg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{seg.size.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{seg.percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coverage */}
          <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-success">Total Coverage</p>
              <p className="text-sm text-text-secondary">
                {strategy.segments.reduce((a, s) => a + s.size, 0).toLocaleString()} customers
              </p>
            </div>
            <p className="text-lg font-bold text-success">{strategy.totalCoverage}%</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="tertiary" size="small">Make stricter</Button>
            <Button variant="tertiary" size="small">Make broader</Button>
          </div>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm Segment Strategy
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function OfferStep({
  campaign,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  isWorking: boolean
}) {
  const mapping = campaign.offerMapping

  if (!mapping) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" color="var(--color-agent)" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has mapped offers to segments</p>
              <p className="text-sm text-text-secondary">Optimized for lift while protecting margins</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {mapping.map(o => (
            <div key={o.segmentId} className="p-4 bg-surface-secondary rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-text-muted">{o.segmentName}</p>
                  <p className="font-semibold text-text-primary">
                    {o.productGroup} → {o.promotion}
                  </p>
                </div>
                <Badge variant="success" className="text-lg px-4 py-1">{o.promoValue}</Badge>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm">
                    <span className="font-semibold text-success">+{o.expectedLift}%</span> lift
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-warning" />
                  <span className="text-sm">
                    <span className="font-semibold text-warning">{o.marginImpact}%</span> margin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    <span className="font-semibold text-primary">{o.overstockCoverage}%</span> overstock
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="tertiary" size="small">Adjust Mapping</Button>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm Promo Mapping
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function CreativeStep({
  campaign,
  onApprove,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onApprove: (id: string) => void
  onConfirm: () => void
  isWorking: boolean
}) {
  const creatives = campaign.creatives
  const [activeTab, setActiveTab] = useState(creatives?.[0]?.segmentId || null)

  if (!creatives) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" color="var(--color-agent)" />
      </div>
    )
  }

  const active = creatives.find(c => c.segmentId === activeTab)
  const allApproved = creatives.every(c => c.approved)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has generated segment-specific creatives</p>
              <p className="text-sm text-text-secondary">Based on confirmed context and offer mapping</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="mb-6">
            <Tabs
              value={creatives.findIndex(c => c.segmentId === activeTab)}
              onChange={(_e: unknown, idx: number) => setActiveTab(creatives[idx]?.segmentId ?? null)}
              tabNames={creatives.map((c, i) => ({
                label: c.approved ? `${c.segmentName} ✓` : c.segmentName,
                value: i,
              }))}
              tabPanels={creatives.map(() => null)}
            />
          </div>

          {/* Creative Preview */}
          {active && (
            <div className="grid grid-cols-2 gap-6">
              {/* Banner */}
              <div className={cn('rounded-2xl overflow-hidden border-2', active.approved ? 'border-success' : 'border-border')}>
                <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-secondary to-surface-tertiary">
                  <img src={active.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent">
                    {active.hasOffer && (
                      <Badge className="self-start mb-3 bg-danger text-white text-sm px-3 py-1">
                        {active.offerBadge}
                      </Badge>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2">{active.headline}</h3>
                    <p className="text-white/80 mb-4">{active.subcopy}</p>
                    <button className="self-start px-6 py-2.5 bg-white text-text-primary rounded-lg font-semibold">
                      {active.cta} →
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{active.tone}</Badge>
                    <Badge variant={active.complianceStatus === 'approved' ? 'success' : 'warning'}>
                      {active.complianceStatus}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(active.id)}
                      className={cn(
                        'p-2 rounded-lg',
                        active.approved
                          ? 'bg-success text-white'
                          : 'bg-surface-secondary text-text-muted hover:bg-success/10'
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-tertiary">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-tertiary">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="p-4 bg-surface-secondary rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Segment</p>
                  <p className="font-semibold text-text-primary">{active.segmentName}</p>
                </div>
                <div className="p-4 bg-surface-secondary rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Headline</p>
                  <p className="font-semibold text-text-primary">{active.headline}</p>
                </div>
                <div className="p-4 bg-surface-secondary rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Subcopy</p>
                  <p className="text-text-primary">{active.subcopy}</p>
                </div>
                <div className="p-4 bg-agent/5 border border-agent/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-agent" />
                    <p className="text-sm font-medium text-agent">Why this creative works</p>
                  </div>
                  <p className="text-sm text-text-secondary">{active.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {creatives.filter(c => c.approved).length}/{creatives.length} approved
          </p>
          <Button variant="primary" onClick={onConfirm} disabled={!allApproved || isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm All Creatives
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ReviewStep({ campaign }: { campaign: Campaign }) {
  const checks = [
    { label: 'Context', locked: campaign.lockedSteps.includes('context') },
    { label: 'Audience', locked: campaign.lockedSteps.includes('audience') },
    { label: 'Offer', locked: campaign.lockedSteps.includes('offer') },
    { label: 'Creative', locked: campaign.lockedSteps.includes('creative') },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-success/30 overflow-hidden">
        {/* Header */}
        <div className="bg-success/5 px-6 py-4 border-b border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success">Alan has validated this campaign</p>
              <p className="text-sm text-text-secondary">All decisions are locked and ready for launch</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Campaign</p>
              <p className="font-semibold text-text-primary">{campaign.derivedContext?.campaignName}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Type</p>
              <p className="font-semibold text-text-primary">{campaign.derivedContext?.campaignType}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Reach</p>
              <p className="font-semibold text-text-primary">
                {campaign.audienceStrategy?.segments.reduce((a, s) => a + s.size, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Segments</p>
              <p className="font-semibold text-text-primary">{campaign.audienceStrategy?.segments.length}</p>
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 bg-surface-secondary rounded-xl">
            <p className="font-medium text-text-primary mb-3">Validation Checklist</p>
            <div className="space-y-2">
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  {c.locked ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={cn('text-sm', c.locked ? 'text-text-primary' : 'text-text-muted')}>
                    {c.label}
                  </span>
                  {c.locked && <Lock className="w-3 h-3 text-text-muted" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-center gap-4">
          <Button variant="tertiary" className="px-8">Save as Draft</Button>
          <Button variant="primary">
            <Rocket className="w-4 h-4 mr-2" /> Approve & Launch
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
