import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Palette, Filter, X, Search } from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { CampaignCard } from '@/components/campaign/campaign-card'
import { useCampaignStore } from '@/store/campaign-store'
import type { CampaignStatus } from '@/types'

export function CampaignOverview() {
  const navigate = useNavigate()
  const { campaigns, createCampaign, setActiveCampaign } = useCampaignStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

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

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns..."
              className="flex-1"
            />
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {statusFilter !== 'all' && (
                <Badge variant="agent" className="ml-2">1</Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary">Status:</span>
                <div className="flex gap-2">
                  {(['all', 'draft', 'live', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === status
                          ? 'bg-primary text-white'
                          : 'bg-surface-tertiary text-text-secondary hover:bg-border'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Campaign Grid */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-base font-medium text-text-primary mb-2">No campaigns found</h3>
            <p className="text-sm text-text-secondary mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first campaign'}
            </p>
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
