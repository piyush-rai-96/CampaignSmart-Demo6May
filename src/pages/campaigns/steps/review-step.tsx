import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Check, Users, Gift, Palette, Target, Edit2, Rocket } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCampaignStore } from '@/store/campaign-store'

export function ReviewStep() {
  const navigate = useNavigate()
  const { activeCampaign, selectedAudiences, audiencePromoMapping, creativeVariants, completeCampaign, setCurrentStep } = useCampaignStore()

  const handleApprove = () => {
    completeCampaign()
    navigate('/campaigns')
  }

  const totalReach = selectedAudiences.reduce((sum, a) => sum + a.size, 0)
  const approvedCreatives = creativeVariants.filter(v => v.compliance.approved).length
  const offersComplete =
    selectedAudiences.length > 0 &&
    Object.keys(audiencePromoMapping).length === selectedAudiences.length
  const creativesComplete =
    creativeVariants.length > 0 && approvedCreatives === creativeVariants.length
  const allComplete = offersComplete && creativesComplete

  const sections = [
    {
      icon: Target,
      title: 'Campaign Context',
      step: 'context' as const,
      complete: Boolean(activeCampaign?.name && activeCampaign?.objective && activeCampaign?.channel),
      items: [
        { label: 'Name', value: activeCampaign?.name },
        { label: 'Objective', value: activeCampaign?.objective },
        { label: 'Channel', value: activeCampaign?.channel },
      ],
    },
    {
      icon: Users,
      title: 'Audience Strategy',
      step: 'audience' as const,
      complete: selectedAudiences.length > 0,
      items: [
        { label: 'Segments', value: `${selectedAudiences.length} selected` },
        { label: 'Total Reach', value: `${(totalReach / 1000).toFixed(1)}K users` },
        { label: 'Audiences', value: selectedAudiences.map(a => a.name).join(', ') },
      ],
    },
    {
      icon: Gift,
      title: 'Offers',
      step: 'offer' as const,
      complete: offersComplete,
      items: [
        { label: 'Promos Assigned', value: `${Object.keys(audiencePromoMapping).length} of ${selectedAudiences.length}` },
        { label: 'Status', value: offersComplete ? 'Complete' : 'Incomplete' },
      ],
    },
    {
      icon: Palette,
      title: 'Creatives',
      step: 'creative' as const,
      complete: creativesComplete,
      items: [
        { label: 'Variants', value: `${creativeVariants.length} created` },
        { label: 'Compliance', value: `${approvedCreatives} of ${creativeVariants.length} approved` },
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Review & Launch</h2>
            <p className="text-text-secondary text-sm">Final check before going live</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Sections */}
      <div className="space-y-4 mb-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-sm text-text-primary">{section.title}</h4>
                      <Badge variant={section.complete ? 'success' : 'warning'}>
                        <Check className="w-3 h-3 mr-1" />
                        {section.complete ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                    <div className="space-y-2.5">
                      {section.items.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <span className="text-text-muted w-24 flex-shrink-0">{item.label}:</span>
                          <span className="text-text-primary font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(section.step)}
                  aria-label={`Edit ${section.title}`}
                  className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Checklist Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(65,200,147,0.06) 0%, rgba(66,89,238,0.04) 100%)',
            borderColor: 'rgba(65,200,147,0.25)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-text-primary">{allComplete ? 'Ready to Launch' : 'Almost Ready'}</h4>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                {allComplete
                  ? `All sections are complete. Your campaign will reach ${(totalReach / 1000).toFixed(1)}K users.`
                  : 'Complete offers and creative compliance before launching.'}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-end gap-4"
      >
        <Button variant="outlined" onClick={() => navigate('/campaigns')}>
          Save as Draft
        </Button>
        <Button size="large" onClick={handleApprove} disabled={!allComplete}>
          <Rocket className="w-4 h-4 mr-2" />
          Approve & Launch
        </Button>
      </motion.div>
    </div>
  )
}
