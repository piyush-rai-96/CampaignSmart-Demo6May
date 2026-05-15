import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { CampaignStepper } from '@/components/campaign/campaign-stepper'
import { AgentPanel } from '@/components/agent/agent-panel'
import { useCampaignStore } from '@/store/campaign-store'
import { ContextStep } from './steps/context-step'
import { AudienceStep } from './steps/audience-step'
import { OfferStep } from './steps/offer-step'
import { CreativeStep } from './steps/creative-step'
import { ReviewStep } from './steps/review-step'
import type { CampaignStep, AgentMessage } from '@/types'

const stepMessages: Record<CampaignStep, AgentMessage[]> = {
  context: [
    {
      id: '1',
      type: 'suggestion',
      content: "Let's define your campaign's purpose. I'll help you lock in the scope so we can build the right strategy.",
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'question',
      content: "What's the primary objective for this campaign? I can suggest options based on your historical performance.",
      timestamp: new Date(),
    },
  ],
  audience: [
    {
      id: '3',
      type: 'suggestion',
      content: "Based on your campaign context, I've identified 3 high-potential audience segments. Each is optimized for your objective.",
      timestamp: new Date(),
    },
  ],
  offer: [
    {
      id: '4',
      type: 'explanation',
      content: "I've matched your selected audiences with available promotions. Some segments have alerts that need your attention.",
      timestamp: new Date(),
    },
  ],
  creative: [
    {
      id: '5',
      type: 'suggestion',
      content: "Here's how your campaign will appear to each audience. I've personalized the messaging based on segment characteristics.",
      timestamp: new Date(),
    },
  ],
  review: [
    {
      id: '6',
      type: 'explanation',
      content: "Everything looks ready. Review the summary below and approve when you're confident.",
      timestamp: new Date(),
    },
  ],
}

export function ActiveCampaign() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeCampaign, campaigns, setActiveCampaign, currentStep, setCurrentStep } = useCampaignStore()
  const [completedSteps, setCompletedSteps] = useState<CampaignStep[]>([])
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>(stepMessages.context)

  useEffect(() => {
    if (!activeCampaign && id) {
      const campaign = campaigns.find(c => c.id === id)
      if (campaign) {
        setActiveCampaign(campaign)
      } else {
        navigate('/campaigns')
      }
    }
  }, [id, activeCampaign, campaigns, setActiveCampaign, navigate])

  useEffect(() => {
    setAgentMessages(stepMessages[currentStep])
  }, [currentStep])

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    
    const stepOrder: CampaignStep[] = ['context', 'audience', 'offer', 'creative', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const agentReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (agentReplyTimeoutRef.current) window.clearTimeout(agentReplyTimeoutRef.current)
    }
  }, [])

  const handleAgentMessage = (message: string) => {
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      type: 'question',
      content: message,
      timestamp: new Date(),
      isUser: true,
    }
    setAgentMessages((prev) => [...prev, userMessage])

    if (agentReplyTimeoutRef.current) window.clearTimeout(agentReplyTimeoutRef.current)
    agentReplyTimeoutRef.current = window.setTimeout(() => {
      const agentResponse: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'explanation',
        content: "I understand. Let me adjust the recommendations based on your input.",
        timestamp: new Date(),
      }
      setAgentMessages((prev) => [...prev, agentResponse])
      agentReplyTimeoutRef.current = null
    }, 1000)
  }

  if (!activeCampaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-text-muted">Loading campaign...</div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'context':
        return <ContextStep onComplete={handleStepComplete} />
      case 'audience':
        return <AudienceStep onComplete={handleStepComplete} />
      case 'offer':
        return <OfferStep onComplete={handleStepComplete} />
      case 'creative':
        return <CreativeStep onComplete={handleStepComplete} />
      case 'review':
        return <ReviewStep />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-surface-secondary">
      {/* Top Bar */}
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="tertiary" size="small" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-semibold text-text-primary">{activeCampaign.name}</h1>
          </div>
          <Badge
            variant={
              activeCampaign.status === 'live' ? 'success' :
              activeCampaign.status === 'draft' ? 'warning' : 'default'
            }
          >
            {activeCampaign.status.charAt(0).toUpperCase() + activeCampaign.status.slice(1)}
          </Badge>
        </div>
      </header>

      {/* Stepper */}
      <CampaignStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <main className="flex-1 overflow-auto p-8">
          {renderStep()}
        </main>

        {/* Agent Panel */}
        <AgentPanel
          messages={agentMessages}
          onSendMessage={handleAgentMessage}
        />
      </div>
    </div>
  )
}
