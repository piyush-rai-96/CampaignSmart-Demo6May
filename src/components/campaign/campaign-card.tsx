import { motion } from 'framer-motion'
import { Calendar, User, MoreHorizontal, Mail, Bell, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Campaign } from '@/types'

interface CampaignCardProps {
  campaign: Campaign
  onClick?: () => void
}

const channelIcons: Record<string, typeof Mail> = {
  Email: Mail,
  Push: Bell,
  SMS: MessageSquare,
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const ChannelIcon = campaign.channel ? channelIcons[campaign.channel] || Mail : Mail

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card hover size="small" onClick={onClick} className="relative group">
        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Badge
            variant={
              campaign.status === 'live' ? 'success' :
              campaign.status === 'draft' ? 'warning' : 'default'
            }
          >
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-tertiary rounded">
            <MoreHorizontal className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Channel icon */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <ChannelIcon className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-sm font-semibold text-text-primary mb-1 pr-20">{campaign.name}</h3>
        {campaign.objective && (
          <p className="text-sm text-text-secondary mb-4">{campaign.objective}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{campaign.owner}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{campaign.lastUpdated.toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
