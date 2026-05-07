import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Palette, Search } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Tabs } from 'impact-ui/src/components/Tabs/index.js'
import { SearchBar } from '@/components/ui/search-bar'
import { CampaignCard } from '@/components/campaign/campaign-card'
import { useCampaignStore } from '@/store/campaign-store'
import type { CampaignStatus } from '@/types'

export function CampaignOverview() {
  const navigate = useNavigate()
  const { campaigns, createCampaign, setActiveCampaign } = useCampaignStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')

  const STATUS_TABS = [
    { value: 0, label: 'All' },
    { value: 1, label: 'Draft' },
    { value: 2, label: 'Live' },
    { value: 3, label: 'Completed' },
  ] as const

  type TabIdx = 0 | 1 | 2 | 3
  const TAB_TO_STATUS: Record<TabIdx, CampaignStatus | 'all'> = {
    0: 'all', 1: 'draft', 2: 'live', 3: 'completed',
  }
  const activeTabIdx: TabIdx = (
    statusFilter === 'all' ? 0
    : statusFilter === 'draft' ? 1
    : statusFilter === 'live' ? 2
    : 3
  ) as TabIdx

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateCampaign = () => {
    const campaign = createCampaign('New Campaign')
    setActiveCampaign(campaign)
    navigate(`/campaigns/${campaign.id}`)
  }

  const handleCampaignClick = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setActiveCampaign(campaign)
      navigate(`/campaigns/${campaignId}`)
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Campaign Workspace</h1>
              <p className="text-sm text-text-secondary mt-1">Create and manage your marketing campaigns</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/creative-studio')}>
                <Palette className="w-4 h-4 mr-2" />
                Create Creative
              </Button>
              <Button onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>

          {/* Search + Status Tabs — reference layout: search left, tabs right */}
          <div className="flex items-center justify-between gap-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns, status, owner..."
              className="w-72"
            />
            <Tabs
              tabNames={[...STATUS_TABS]}
              tabPanels={[null, null, null, null]}
              value={activeTabIdx}
              onChange={(_e: unknown, idx: TabIdx) => setStatusFilter(TAB_TO_STATUS[idx])}
            />
          </div>
        </div>
      </header>

      {/* Campaign Grid */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary/50" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-text-primary mb-1">
                {searchQuery || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
              </h3>
              <p className="text-sm text-text-secondary max-w-xs">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first campaign'}
              </p>
            </div>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CampaignCard
                  campaign={campaign}
                  onClick={() => handleCampaignClick(campaign.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
