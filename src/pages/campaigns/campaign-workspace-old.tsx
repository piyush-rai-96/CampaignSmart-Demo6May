import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, ChevronRight, Clock, Check, Lock, FileText, 
  Users, Package, Tag, Palette, ClipboardCheck, Sparkles,
  MoreVertical, Trash2, Edit3
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import { useAgenticCampaignStore } from '@/store/agentic-campaign-store'
import type { AgenticCampaign, AgenticStep } from '@/types'

// Step Components
import { ContextStep } from './workspace-steps/context-step'
import { SegmentStrategyStep } from './workspace-steps/segment-strategy-step'
import { SegmentCreationStep } from './workspace-steps/segment-creation-step'
import { ProductLogicStep } from './workspace-steps/product-logic-step'
import { PromotionStep } from './workspace-steps/promotion-step'
import { CreativeStep } from './workspace-steps/creative-step'
import { ReviewStep } from './workspace-steps/review-step'

const STEPS: { id: AgenticStep; label: string; icon: React.ElementType }[] = [
  { id: 'context', label: 'Campaign Context', icon: FileText },
  { id: 'segment-strategy', label: 'Segment Strategy', icon: Users },
  { id: 'segment-creation', label: 'Segment Creation', icon: Users },
  { id: 'product-logic', label: 'Product Logic', icon: Package },
  { id: 'promotion', label: 'Promotion Selection', icon: Tag },
  { id: 'creative', label: 'Creative Generation', icon: Palette },
  { id: 'review', label: 'Review & Export', icon: ClipboardCheck },
]

function getStepIndex(step: AgenticStep): number {
  return STEPS.findIndex(s => s.id === step)
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function CampaignWorkspace() {
  const { 
    campaigns, 
    activeCampaignId, 
    agentThinking,
    agentMessage,
    getActiveCampaign,
    createCampaign, 
    setActiveCampaign,
    deleteCampaign
  } = useAgenticCampaignStore()
  
  const [showNewCampaignInput, setShowNewCampaignInput] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [campaignMenuOpen, setCampaignMenuOpen] = useState<string | null>(null)
  
  const activeCampaign = getActiveCampaign()
  
  const draftCampaigns = campaigns.filter(c => c.status === 'draft')
  const activeCampaigns = campaigns.filter(c => c.status === 'live' || c.status === 'locked')
  const completedCampaigns = campaigns.filter(c => c.status === 'completed')

  const handleCreateCampaign = () => {
    if (newCampaignName.trim()) {
      createCampaign(newCampaignName.trim())
      setNewCampaignName('')
      setShowNewCampaignInput(false)
    }
  }

  const getStepStatus = (campaign: AgenticCampaign, stepId: AgenticStep) => {
    const currentIndex = getStepIndex(campaign.currentStep)
    const stepIndex = getStepIndex(stepId)
    
    if (campaign.completedSteps.includes(stepId)) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    if (stepIndex < currentIndex) return 'completed'
    return 'pending'
  }

  const isStepLocked = (campaign: AgenticCampaign, stepId: AgenticStep) => {
    switch (stepId) {
      case 'context': return campaign.contextLocked
      case 'segment-strategy': return campaign.strategyLocked
      case 'segment-creation': return campaign.segmentsLocked
      case 'product-logic': return campaign.productsLocked
      case 'promotion': return campaign.promotionsLocked
      case 'creative': return campaign.creativesLocked
      default: return false
    }
  }

  const renderStepContent = () => {
    if (!activeCampaign) return null
    
    switch (activeCampaign.currentStep) {
      case 'context':
        return <ContextStep campaign={activeCampaign} />
      case 'segment-strategy':
        return <SegmentStrategyStep campaign={activeCampaign} />
      case 'segment-creation':
        return <SegmentCreationStep campaign={activeCampaign} />
      case 'product-logic':
        return <ProductLogicStep campaign={activeCampaign} />
      case 'promotion':
        return <PromotionStep campaign={activeCampaign} />
      case 'creative':
        return <CreativeStep campaign={activeCampaign} />
      case 'review':
        return <ReviewStep campaign={activeCampaign} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex bg-surface-secondary">
      {/* Left Panel - Campaign List */}
      <div className="w-80 bg-surface border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-text-primary">Campaigns</h1>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowNewCampaignInput(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>
          
          {/* New Campaign Input */}
          <AnimatePresence>
            {showNewCampaignInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-surface-secondary rounded-lg mb-2">
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Campaign name..."
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCampaign()}
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" size="small" className="flex-1" onClick={handleCreateCampaign}>
                      Create
                    </Button>
                    <Button variant="tertiary" size="small" onClick={() => setShowNewCampaignInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Campaign Lists */}
        <div className="flex-1 overflow-y-auto">
          {/* Drafts */}
          <div className="p-3">
            <p className="text-xs font-medium text-text-muted mb-2 px-2">
              Drafts ({draftCampaigns.length})
            </p>
            <div className="space-y-1">
              {draftCampaigns.map(campaign => (
                <CampaignListItem
                  key={campaign.id}
                  campaign={campaign}
                  isActive={activeCampaignId === campaign.id}
                  onClick={() => setActiveCampaign(campaign.id)}
                  onMenuToggle={() => setCampaignMenuOpen(campaignMenuOpen === campaign.id ? null : campaign.id)}
                  menuOpen={campaignMenuOpen === campaign.id}
                  onDelete={() => { deleteCampaign(campaign.id); setCampaignMenuOpen(null) }}
                />
              ))}
              {draftCampaigns.length === 0 && (
                <p className="text-xs text-text-muted px-2 py-4 text-center">No drafts</p>
              )}
            </div>
          </div>

          {/* Active */}
          <div className="p-3 border-t border-border">
            <p className="text-xs font-medium text-text-muted mb-2 px-2">
              Active ({activeCampaigns.length})
            </p>
            <div className="space-y-1">
              {activeCampaigns.map(campaign => (
                <CampaignListItem
                  key={campaign.id}
                  campaign={campaign}
                  isActive={activeCampaignId === campaign.id}
                  onClick={() => setActiveCampaign(campaign.id)}
                  onMenuToggle={() => setCampaignMenuOpen(campaignMenuOpen === campaign.id ? null : campaign.id)}
                  menuOpen={campaignMenuOpen === campaign.id}
                  onDelete={() => { deleteCampaign(campaign.id); setCampaignMenuOpen(null) }}
                />
              ))}
              {activeCampaigns.length === 0 && (
                <p className="text-xs text-text-muted px-2 py-4 text-center">No active campaigns</p>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="p-3 border-t border-border">
            <p className="text-xs font-medium text-text-muted mb-2 px-2">
              Completed ({completedCampaigns.length})
            </p>
            <div className="space-y-1">
              {completedCampaigns.map(campaign => (
                <CampaignListItem
                  key={campaign.id}
                  campaign={campaign}
                  isActive={activeCampaignId === campaign.id}
                  onClick={() => setActiveCampaign(campaign.id)}
                  onMenuToggle={() => setCampaignMenuOpen(campaignMenuOpen === campaign.id ? null : campaign.id)}
                  menuOpen={campaignMenuOpen === campaign.id}
                  onDelete={() => { deleteCampaign(campaign.id); setCampaignMenuOpen(null) }}
                />
              ))}
              {completedCampaigns.length === 0 && (
                <p className="text-xs text-text-muted px-2 py-4 text-center">No completed campaigns</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeCampaign ? (
          <>
            {/* Campaign Header */}
            <div className="bg-surface border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-text-primary">{activeCampaign.name}</h2>
                    <Badge variant={activeCampaign.status === 'draft' ? 'warning' : activeCampaign.status === 'live' ? 'success' : 'default'}>
                      {activeCampaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Last updated {formatTimeAgo(new Date(activeCampaign.lastUpdated))}
                  </p>
                </div>
                
                {/* Agent Status */}
                {agentThinking && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-agent/10 rounded-lg">
                    <Loader size="small" color="var(--color-agent)" />
                    <span className="text-sm text-agent font-medium">{agentMessage || 'Agent thinking...'}</span>
                  </div>
                )}
              </div>

              {/* Step Progress */}
              <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
                {STEPS.map((step, index) => {
                  const status = getStepStatus(activeCampaign, step.id)
                  const locked = isStepLocked(activeCampaign, step.id)
                  const StepIcon = step.icon
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        status === 'current' && 'bg-primary text-white',
                        status === 'completed' && 'bg-success/10 text-success',
                        status === 'pending' && 'bg-surface-tertiary text-text-muted'
                      )}>
                        {status === 'completed' ? (
                          locked ? <Lock className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
                        ) : (
                          <StepIcon className="w-3.5 h-3.5" />
                        )}
                        <span className="whitespace-nowrap">{step.label}</span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className={cn(
                          'w-4 h-4 mx-1 flex-shrink-0',
                          status === 'completed' ? 'text-success' : 'text-border'
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCampaign.currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Campaign Workspace</h2>
              <p className="text-text-secondary mb-6">
                Select a campaign from the left panel to continue, or create a new campaign to get started.
              </p>
              <Button variant="primary" onClick={() => setShowNewCampaignInput(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create New Campaign
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Campaign List Item Component
function CampaignListItem({ 
  campaign, 
  isActive, 
  onClick, 
  onMenuToggle,
  menuOpen,
  onDelete
}: { 
  campaign: AgenticCampaign
  isActive: boolean
  onClick: () => void
  onMenuToggle: () => void
  menuOpen: boolean
  onDelete: () => void
}) {
  const currentStepLabel = STEPS.find(s => s.id === campaign.currentStep)?.label || 'Unknown'
  
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          'w-full p-3 rounded-lg text-left transition-colors group',
          isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-surface-secondary'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-medium truncate',
              isActive ? 'text-primary' : 'text-text-primary'
            )}>
              {campaign.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={campaign.status === 'draft' ? 'warning' : campaign.status === 'live' ? 'success' : 'default'}
                className="text-xs"
              >
                {campaign.status}
              </Badge>
              <span className="text-xs text-text-muted">
                {formatTimeAgo(new Date(campaign.lastUpdated))}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentStepLabel}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onMenuToggle() }}
            className="p-1 rounded hover:bg-surface-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-2 top-12 z-50 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[120px]"
          >
            <button className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Rename
            </button>
            <button 
              onClick={onDelete}
              className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
