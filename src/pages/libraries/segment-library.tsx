import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Sparkles, X, Eye, ChevronDown, Check, 
  RotateCcw, Copy, Archive, Edit3, Clock, CheckCircle,
  AlertCircle, Lightbulb, BarChart3, Filter, Download, Tag
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Panel } from 'impact-ui/src/components/Panel/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Menu } from 'impact-ui/src/components/Menu/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Checkbox } from 'impact-ui/src/components/Checkbox/index.js'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Extended Segment type for this screen
interface CampaignUsageDetails {
  total: number
  active: number
  completed: number
  lastUsedDate: Date
  primaryIntent: 'Retention' | 'Win-back' | 'Conversion' | 'Promotion' | 'Acquisition' | 'Loyalty' | 'Volume Growth' | 'Availability' | 'Upsell' | 'Activation'
}

interface Segment {
  id: string
  name: string
  segmentType: 'PRO' | 'DIY'
  createdBy: 'User' | 'Alan' | 'System'
  segmentationMethod: 'Rule-Based' | 'Statistical'
  segmentNature: 'Static' | 'Dynamic'
  definitionSummary: string
  logicSummary: string
  category: string
  channel: 'Online' | 'Loyalty' | 'Omnichannel'
  campaignUsage: number
  campaignDetails: CampaignUsageDetails
  lastUpdated: Date
  estimatedSize: number
  status: 'Active' | 'Archived'
  rules?: string[]
  features?: string[]
}

const mockSegments: Segment[] = [
  // ── PRO Segments ──
  {
    id: 'PRO_001',
    name: 'Pro – High-Value Shops',
    segmentType: 'PRO',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Repair shops with high purchase frequency, large basket sizes, and repeat buying across core parts categories.',
    logicSummary: 'Customers with >15 monthly orders, high AOV, and consistent purchases in Braking, Engine, and Filters.',
    category: 'Retention',
    channel: 'Omnichannel',
    campaignUsage: 25,
    campaignDetails: { total: 25, active: 10, completed: 15, lastUsedDate: new Date('2026-04-18'), primaryIntent: 'Retention' },
    lastUpdated: new Date('2026-04-20'),
    estimatedSize: 18000,
    status: 'Active',
    features: ['Purchase frequency', 'Average order value', 'Category affinity', 'Account type'],
  },
  {
    id: 'PRO_002',
    name: 'Pro – Fleet Operators',
    segmentType: 'PRO',
    createdBy: 'System',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Dynamic',
    definitionSummary: 'Fleet operators purchasing in bulk for maintenance across multiple vehicles.',
    logicSummary: 'Customers purchasing high volumes of Oil, Filters, and Braking components with bulk order patterns.',
    category: 'Volume Growth',
    channel: 'Omnichannel',
    campaignUsage: 18,
    campaignDetails: { total: 18, active: 7, completed: 11, lastUsedDate: new Date('2026-03-28'), primaryIntent: 'Volume Growth' },
    lastUpdated: new Date('2026-03-30'),
    estimatedSize: 12000,
    status: 'Active',
    rules: ['Bulk orders = true', 'Categories: Oil and Lubricants, Filters and PCV, Braking', 'Order quantity > 20 units/order'],
  },
  {
    id: 'PRO_003',
    name: 'Pro – Emergency Restock Buyers',
    segmentType: 'PRO',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Workshops making urgent, time-sensitive purchases for immediate repairs.',
    logicSummary: 'Frequent same-day or rush purchases across critical repair categories.',
    category: 'Availability',
    channel: 'Omnichannel',
    campaignUsage: 12,
    campaignDetails: { total: 12, active: 5, completed: 7, lastUsedDate: new Date('2026-02-20'), primaryIntent: 'Availability' },
    lastUpdated: new Date('2026-02-22'),
    estimatedSize: 9000,
    status: 'Active',
    features: ['Delivery speed', 'Purchase timing', 'Category urgency'],
  },
  // ── DIY Segments ──
  {
    id: 'DIY_001',
    name: 'DIY – Enthusiasts / Performance Modders',
    segmentType: 'DIY',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Car enthusiasts focused on performance upgrades and modifications.',
    logicSummary: 'Customers purchasing performance parts, upgrades, and accessories frequently.',
    category: 'Upsell',
    channel: 'Online',
    campaignUsage: 20,
    campaignDetails: { total: 20, active: 8, completed: 12, lastUsedDate: new Date('2026-04-10'), primaryIntent: 'Upsell' },
    lastUpdated: new Date('2026-04-12'),
    estimatedSize: 22000,
    status: 'Active',
    features: ['Category affinity', 'Purchase frequency', 'Product type'],
  },
  {
    id: 'DIY_002',
    name: 'DIY – Routine Maintenance Buyers',
    segmentType: 'DIY',
    createdBy: 'System',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers regularly maintaining their vehicles with basic parts and fluids.',
    logicSummary: 'Repeat purchases of oil, filters, and wipers in predictable intervals.',
    category: 'Retention',
    channel: 'Omnichannel',
    campaignUsage: 30,
    campaignDetails: { total: 30, active: 12, completed: 18, lastUsedDate: new Date('2026-03-15'), primaryIntent: 'Retention' },
    lastUpdated: new Date('2026-03-18'),
    estimatedSize: 45000,
    status: 'Active',
    rules: ['Categories: Oil and Lubricants, Filters and PCV, Wipers and Related', 'Purchase cycle: Every 3-6 months'],
  },
  {
    id: 'DIY_003',
    name: 'DIY – Price Sensitive Shoppers',
    segmentType: 'DIY',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers highly responsive to discounts and promotions.',
    logicSummary: 'High engagement during promo events with low full-price purchases.',
    category: 'Conversion',
    channel: 'Online',
    campaignUsage: 22,
    campaignDetails: { total: 22, active: 9, completed: 13, lastUsedDate: new Date('2026-04-05'), primaryIntent: 'Conversion' },
    lastUpdated: new Date('2026-04-08'),
    estimatedSize: 38000,
    status: 'Active',
    features: ['Promo usage', 'Discount sensitivity', 'Conversion rate'],
  },
  {
    id: 'DIY_004',
    name: 'DIY – First-Time Buyers',
    segmentType: 'DIY',
    createdBy: 'System',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Static',
    definitionSummary: 'New customers making their first purchase in the platform.',
    logicSummary: 'Customers with 1 completed order in the last 30 days.',
    category: 'Activation',
    channel: 'Online',
    campaignUsage: 10,
    campaignDetails: { total: 10, active: 4, completed: 6, lastUsedDate: new Date('2026-02-10'), primaryIntent: 'Activation' },
    lastUpdated: new Date('2026-02-14'),
    estimatedSize: 27000,
    status: 'Active',
    rules: ['Purchase count = 1', 'Recency < 30 days'],
  },
]

const channels = ['All Channels', 'Loyalty', 'Omnichannel', 'Online']

const alanSteps = [
  'Understanding business context',
  'Identifying relevant customer signals',
  'Applying selected segmentation method',
  'Designing segment definitions',
  'Validating size & overlap',
  'Classifying static vs dynamic behavior',
  'Finalizing segments',
]

export function SegmentLibrary() {
  // Filter states
  const [creationModeFilter, setCreationModeFilter] = useState<'all' | 'Manual' | 'Alan' | 'System'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'Rule-Based' | 'Statistical'>('all')
  const [natureFilter, setNatureFilter] = useState<'all' | 'Static' | 'Dynamic'>('all')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [campaignUsedFilter, setCampaignUsedFilter] = useState<'all' | 'yes' | 'no'>('all')
  
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const openFilterMenu = (key: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(e.currentTarget)
    setOpenDropdown(key)
  }
  const closeFilterMenu = () => { setFilterAnchorEl(null); setOpenDropdown(null) }
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAlanPanel, setShowAlanPanel] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  
  // Alan states
  const [alanRunning, setAlanRunning] = useState(false)
  const [alanCurrentStep, setAlanCurrentStep] = useState(0)
  const [showAlanInsights, setShowAlanInsights] = useState(false)
  const [showAlanResults, setShowAlanResults] = useState(false)
  
  // Alan configuration
  const [alanMethod, setAlanMethod] = useState<'Rule-Based' | 'Statistical' | null>(null)
  const [alanNature, setAlanNature] = useState<'Static' | 'Dynamic' | null>(null)
  const [alanBusinessIntent, setAlanBusinessIntent] = useState('')
  const [alanChannel, setAlanChannel] = useState('')
  const [alanTimeWindow, setAlanTimeWindow] = useState('')
  const [alanGeneratedSegmentName, setAlanGeneratedSegmentName] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Create segment wizard state
  const [createStep, setCreateStep] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState<'rule-based' | 'statistical' | null>(null)
  const [selectedSegmentationType, setSelectedSegmentationType] = useState<string | null>(null)
  const [selectedClusteringAlgorithm, setSelectedClusteringAlgorithm] = useState<string>('K-Means')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Recency', 'Frequency', 'Monetary', 'Avg Order Value'])
  const [clusterCount, setClusterCount] = useState(5)
  const [segmentName, setSegmentName] = useState('')
  const [segmentNature, setSegmentNature] = useState<'Static' | 'Dynamic'>('Dynamic')
  const [segmentChannel, setSegmentChannel] = useState<'Online' | 'Loyalty' | 'Omnichannel'>('Omnichannel')
  // Rule definition state
  const [ruleDefinitionMode, setRuleDefinitionMode] = useState<'manual' | 'auto' | null>(null)
  const [autoRulesGenerated, setAutoRulesGenerated] = useState(false)
  const [autoRulesLoading, setAutoRulesLoading] = useState(false)
  const [ruleConditions, setRuleConditions] = useState<{field: string, operator: string, value: string}[]>([
    { field: '', operator: 'equals', value: '' }
  ])
  
  // Agent-generated rules based on segmentation type
  const getAgentSuggestedRules = () => {
    const rulesMap: Record<string, {field: string, operator: string, value: string}[]> = {
      'rfm': [
        { field: 'recency', operator: 'less_than', value: '30' },
        { field: 'frequency', operator: 'greater_than', value: '5' },
        { field: 'monetary', operator: 'greater_than', value: '500' },
      ],
      'lifecycle': [
        { field: 'days_since_first', operator: 'greater_than', value: '90' },
        { field: 'total_orders', operator: 'greater_than', value: '3' },
        { field: 'lifecycle_stage', operator: 'equals', value: 'Active' },
      ],
      'value': [
        { field: 'ltv', operator: 'greater_than', value: '1000' },
        { field: 'avg_order_value', operator: 'greater_than', value: '150' },
      ],
      'promo': [
        { field: 'promo_response_rate', operator: 'greater_than', value: '40' },
        { field: 'coupon_usage', operator: 'greater_than', value: '3' },
      ],
      'channel': [
        { field: 'primary_channel', operator: 'equals', value: 'Online' },
        { field: 'online_orders_pct', operator: 'greater_than', value: '70' },
      ],
      'category': [
        { field: 'top_category', operator: 'equals', value: 'Hair Care' },
        { field: 'category_diversity', operator: 'greater_than', value: '3' },
      ],
    }
    return rulesMap[selectedSegmentationType || 'rfm'] || rulesMap['rfm']
  }
  
  const generateAutoRules = () => {
    setAutoRulesLoading(true)
    // Simulate agent processing
    setTimeout(() => {
      setRuleConditions(getAgentSuggestedRules())
      setAutoRulesGenerated(true)
      setAutoRulesLoading(false)
    }, 1500)
  }
  
  const addRuleCondition = () => {
    setRuleConditions([...ruleConditions, { field: '', operator: 'equals', value: '' }])
  }
  
  const updateRuleCondition = (index: number, key: string, value: string) => {
    const updated = [...ruleConditions]
    updated[index] = { ...updated[index], [key]: value }
    setRuleConditions(updated)
  }
  
  const removeRuleCondition = (index: number) => {
    if (ruleConditions.length > 1) {
      setRuleConditions(ruleConditions.filter((_, i) => i !== index))
    }
  }
  
  const resetCreateWizard = () => {
    setCreateStep(1)
    setSelectedMethod(null)
    setSelectedSegmentationType(null)
    setSelectedClusteringAlgorithm('K-Means')
    setSelectedFeatures(['Recency', 'Frequency', 'Monetary', 'Avg Order Value'])
    setClusterCount(5)
    setSegmentName('')
    setSegmentNature('Dynamic')
    setSegmentChannel('Omnichannel')
    setRuleConditions([{ field: '', operator: 'equals', value: '' }])
    setRuleDefinitionMode(null)
    setAutoRulesGenerated(false)
    setAutoRulesLoading(false)
  }

  const hasActiveFilters = creationModeFilter !== 'all' || methodFilter !== 'all' || natureFilter !== 'all' ||
    channelFilter !== 'All Channels' || campaignUsedFilter !== 'all'

  const resetFilters = () => {
    setCreationModeFilter('all')
    setMethodFilter('all')
    setNatureFilter('all')
    setChannelFilter('All Channels')
    setCampaignUsedFilter('all')
    setCurrentPage(1)
  }

  const filteredSegments = mockSegments.filter(segment => {
    const matchesCreation = creationModeFilter === 'all' || 
      (creationModeFilter === 'Manual' && segment.createdBy === 'User') ||
      (creationModeFilter === 'Alan' && segment.createdBy === 'Alan') ||
      (creationModeFilter === 'System' && segment.createdBy === 'System')
    const matchesMethod = methodFilter === 'all' || segment.segmentationMethod === methodFilter
    const matchesNature = natureFilter === 'all' || segment.segmentNature === natureFilter
    const matchesChannel = channelFilter === 'All Channels' || segment.channel === channelFilter
    const matchesCampaignUsed = campaignUsedFilter === 'all' || 
      (campaignUsedFilter === 'yes' && segment.campaignUsage > 0) ||
      (campaignUsedFilter === 'no' && segment.campaignUsage === 0)
    return matchesCreation && matchesMethod && matchesNature && matchesChannel && matchesCampaignUsed
  })

  const totalPages = Math.ceil(filteredSegments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSegments = filteredSegments.slice(startIndex, startIndex + itemsPerPage)

  const runAlan = () => {
    if (!alanMethod || !alanNature || !alanBusinessIntent || !alanChannel) return
    setAlanRunning(true)
    setAlanCurrentStep(0)
    setShowAlanPanel(false)
    // Generate a segment name based on business intent
    const intentWords = alanBusinessIntent.split(' ').slice(0, 3).join(' ')
    setAlanGeneratedSegmentName(`${intentWords} - ${alanChannel}`)
    const interval = setInterval(() => {
      setAlanCurrentStep(prev => {
        if (prev >= alanSteps.length - 1) {
          clearInterval(interval)
          setAlanRunning(false)
          setShowAlanInsights(true)
          setShowAlanResults(true) // Show results panel when done
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-4 shadow-sm">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-border">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Segment Library</h1>
              <p className="text-sm text-text-secondary">All Customer Segments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outlined" onClick={() => setShowAlanPanel(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Create with Alan
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-8 py-6">
        {/* Alan Running Banner */}
        <AnimatePresence>
          {alanRunning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-agent/5 border border-agent/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-agent/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-agent animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Alan is creating segments…</h3>
                  <p className="text-sm text-text-secondary">This may take a moment</p>
                </div>
              </div>
              <div className="space-y-2">
                {alanSteps.map((step, index) => (
                  <div key={step} className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                    index < alanCurrentStep && 'bg-success/5',
                    index === alanCurrentStep && 'bg-agent/10'
                  )}>
                    {index < alanCurrentStep ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : index === alanCurrentStep ? (
                      <div className="w-4 h-4 rounded-full border-2 border-agent border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                    <span className={cn('text-sm', index <= alanCurrentStep ? 'text-text-primary' : 'text-text-muted')}>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alan Insights Section */}
        <AnimatePresence>
          {showAlanInsights && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-agent" />
                  <h3 className="font-semibold text-text-primary">Alan's Insights</h3>
                </div>
                <button onClick={() => setShowAlanInsights(false)} className="text-sm text-text-muted hover:text-text-primary">Dismiss all</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Card sx={{ padding: '16px', backgroundColor: 'rgba(66,89,238,0.05)', borderColor: 'rgba(66,89,238,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Lightbulb className="w-4 h-4 text-agent" />
                    <span className="text-xs font-semibold text-agent">Key Behavior</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">Identified strong correlation between email engagement and purchase frequency.</p>
                </Card>
                <Card sx={{ padding: '16px', backgroundColor: 'rgba(66,89,238,0.05)', borderColor: 'rgba(66,89,238,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <BarChart3 className="w-4 h-4 text-agent" />
                    <span className="text-xs font-semibold text-agent">Segmentation Logic</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">Used K-means clustering with 4 behavioral features to identify 3 distinct groups.</p>
                </Card>
                <Card sx={{ padding: '16px', backgroundColor: 'rgba(66,89,238,0.05)', borderColor: 'rgba(66,89,238,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Users className="w-4 h-4 text-agent" />
                    <span className="text-xs font-semibold text-agent">Coverage Summary</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">New segments cover 78% of active customers with minimal overlap (&lt;5%).</p>
                </Card>
                <Card sx={{ padding: '16px', backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="text-xs font-semibold text-warning">Caveat</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">Segment "Price Sensitive" may need refinement as holiday data could skew results.</p>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Toggle */}
        <div className="mb-6">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {[creationModeFilter !== 'all', methodFilter !== 'all', natureFilter !== 'all', channelFilter !== 'All Channels', campaignUsedFilter !== 'all'].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 relative z-50"
            >
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-primary">Global Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {/* Creation Mode */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Creation Mode</label>
                    <button onClick={openFilterMenu('creationMode')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{creationModeFilter === 'all' ? 'All Modes' : creationModeFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'creationMode' && 'rotate-180')} />
                    </button>
                    <Menu anchorEl={openDropdown === 'creationMode' ? filterAnchorEl : null} open={openDropdown === 'creationMode' && !!filterAnchorEl} onClose={closeFilterMenu}
                      options={[{value:'all',label:'All Modes'},{value:'Manual',label:'Manual'},{value:'Alan',label:'Alan'},{value:'System',label:'System'}].map(o => ({label:o.label,callback:()=>{setCreationModeFilter(o.value as 'all'|'Manual'|'Alan'|'System');closeFilterMenu()}}))}
                      onClick={() => {}} />
                  </div>

                  {/* Segmentation Method */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Segmentation Method</label>
                    <button onClick={openFilterMenu('method')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{methodFilter === 'all' ? 'All Methods' : methodFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'method' && 'rotate-180')} />
                    </button>
                    <Menu anchorEl={openDropdown === 'method' ? filterAnchorEl : null} open={openDropdown === 'method' && !!filterAnchorEl} onClose={closeFilterMenu}
                      options={[{value:'all',label:'All Methods'},{value:'Rule-Based',label:'Rule-Based'},{value:'Statistical',label:'Statistical'}].map(o => ({label:o.label,callback:()=>{setMethodFilter(o.value as 'all'|'Rule-Based'|'Statistical');closeFilterMenu()}}))}
                      onClick={() => {}} />
                  </div>

                  {/* Segment Nature */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Segment Nature</label>
                    <button onClick={openFilterMenu('nature')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{natureFilter === 'all' ? 'All Natures' : natureFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'nature' && 'rotate-180')} />
                    </button>
                    <Menu anchorEl={openDropdown === 'nature' ? filterAnchorEl : null} open={openDropdown === 'nature' && !!filterAnchorEl} onClose={closeFilterMenu}
                      options={[{value:'all',label:'All Natures'},{value:'Static',label:'Static'},{value:'Dynamic',label:'Dynamic'}].map(o => ({label:o.label,callback:()=>{setNatureFilter(o.value as 'all'|'Static'|'Dynamic');closeFilterMenu()}}))}
                      onClick={() => {}} />
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Channel</label>
                    <button onClick={openFilterMenu('channel')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{channelFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'channel' && 'rotate-180')} />
                    </button>
                    <Menu anchorEl={openDropdown === 'channel' ? filterAnchorEl : null} open={openDropdown === 'channel' && !!filterAnchorEl} onClose={closeFilterMenu}
                      options={channels.map(o => ({label:o,callback:()=>{setChannelFilter(o);closeFilterMenu()}}))}
                      onClick={() => {}} />
                  </div>

                  {/* Used in Campaign */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Used in Campaign</label>
                    <button onClick={openFilterMenu('campaignUsed')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{campaignUsedFilter === 'all' ? 'All' : campaignUsedFilter === 'yes' ? 'Yes' : 'No'}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'campaignUsed' && 'rotate-180')} />
                    </button>
                    <Menu anchorEl={openDropdown === 'campaignUsed' ? filterAnchorEl : null} open={openDropdown === 'campaignUsed' && !!filterAnchorEl} onClose={closeFilterMenu}
                      options={[{value:'all',label:'All'},{value:'yes',label:'Yes'},{value:'no',label:'No'}].map(o => ({label:o.label,callback:()=>{setCampaignUsedFilter(o.value as 'all'|'yes'|'no');closeFilterMenu()}}))}
                      onClick={() => {}} />
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Row */}
        <div className="flex items-center justify-end mb-6">
          <Button variant="outlined" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Segment Table */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Segment Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Nature</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted w-64">Definition Summary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Channel</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted">Campaigns</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Last Updated</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedSegments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
                      <p className="text-text-primary font-medium mb-1">No segments found</p>
                      <p className="text-sm text-text-secondary mb-4">Create your first segment manually or with Alan</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outlined" onClick={() => setShowAlanPanel(true)}><Sparkles className="w-4 h-4 mr-2" />Create with Alan</Button>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Create Segment</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSegments.map((segment) => (
                    <tr key={segment.id} className="hover:bg-surface-secondary transition-colors">
                      <td className="px-4 py-3"><span className="text-sm font-medium text-text-primary">{segment.name}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {segment.createdBy === 'Alan' && <Sparkles className="w-3.5 h-3.5 text-agent" />}
                          <span className="text-sm text-text-secondary">{segment.createdBy}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={segment.segmentationMethod === 'Statistical' ? 'info' : 'default'}>{segment.segmentationMethod}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={segment.segmentNature === 'Dynamic' ? 'success' : 'default'}>{segment.segmentNature}</Badge></td>
                      <td className="px-4 py-3"><p className="text-sm text-text-secondary line-clamp-2">{segment.definitionSummary}</p></td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.channel}</td>
                      <td className="px-4 py-3 text-center text-sm text-text-primary font-medium">{segment.campaignUsage}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.lastUpdated.toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="tertiary" size="small" onClick={() => setSelectedSegment(segment)}><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredSegments.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-sm text-text-secondary">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSegments.length)} of {filteredSegments.length} segments</p>
              <div className="flex items-center gap-2">
                <Button variant="outlined" size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={cn('w-8 h-8 text-sm rounded-md transition-colors', currentPage === page ? 'bg-primary text-white' : 'hover:bg-surface-tertiary text-text-secondary')}>{page}</button>
                  ))}
                </div>
                <Button variant="outlined" size="small" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Segment Modal - Multi-step Wizard */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[100]" onClick={() => { setShowCreateModal(false); resetCreateWizard() }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface rounded-2xl shadow-xl z-[101] max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">Create New Segment</h3>
                    <p className="text-sm text-text-secondary">
                      {createStep === 1 && 'Choose segmentation method'}
                      {createStep === 2 && selectedMethod === 'rule-based' && 'Choose segmentation types'}
                      {createStep === 2 && selectedMethod === 'statistical' && 'Configure clustering'}
                      {createStep === 3 && selectedMethod === 'rule-based' && 'Define segment rules'}
                      {createStep === 3 && selectedMethod === 'statistical' && 'Configure segment details'}
                      {createStep === 4 && selectedMethod === 'rule-based' && 'Configure segment details'}
                      {createStep === 4 && selectedMethod === 'statistical' && 'Review and save'}
                      {createStep === 5 && 'Review and save'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowCreateModal(false); resetCreateWizard() }} className="p-2 hover:bg-surface-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              {createStep > 1 && (
                <div className="px-6 pt-4">
                  {selectedMethod === 'rule-based' ? (
                    <>
                      <div className="flex items-center justify-between">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
                              step < createStep ? 'bg-primary text-white' :
                              step === createStep ? 'bg-primary text-white' :
                              'bg-surface-tertiary text-text-muted'
                            )}>
                              {step < createStep ? <Check className="w-3 h-3" /> : step}
                            </div>
                            {step < 5 && (
                              <div className={cn('w-10 h-1 mx-1 rounded', step < createStep ? 'bg-primary' : 'bg-surface-tertiary')} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-text-muted">
                        <span>Method</span>
                        <span>Type</span>
                        <span>Rules</span>
                        <span>Details</span>
                        <span>Save</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                              step < createStep ? 'bg-primary text-white' :
                              step === createStep ? 'bg-primary text-white' :
                              'bg-surface-tertiary text-text-muted'
                            )}>
                              {step < createStep ? <Check className="w-4 h-4" /> : step}
                            </div>
                            {step < 4 && (
                              <div className={cn('w-16 h-1 mx-2 rounded', step < createStep ? 'bg-primary' : 'bg-surface-tertiary')} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-text-muted">
                        <span>Method</span>
                        <span>Configure</span>
                        <span>Details</span>
                        <span>Save</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 1: Choose Method */}
              {createStep === 1 && (
                <div className="p-6">
                  <h4 className="text-center text-lg font-semibold text-text-primary mb-2">How would you like to create this segment?</h4>
                  <p className="text-center text-text-secondary mb-6">Choose a segmentation method based on your needs</p>
                  
                  <div className="space-y-4">
                    <button onClick={() => { setSelectedMethod('rule-based'); setCreateStep(2) }}
                      className="w-full p-5 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-text-primary mb-1">Rule-Based Segmentation</h5>
                          <p className="text-sm text-text-secondary mb-3">Define segments using business rules like lifecycle stages, RFM tiers, promo sensitivity, and channel preferences.</p>
                          <div className="flex flex-wrap gap-2">
                            {['Lifecycle Windows', 'RFM Tiers', 'Promo Sensitivity', 'Channel Preference', 'Category Affinity'].map((tag) => (
                              <span key={tag} className="px-2.5 py-1 bg-surface-tertiary rounded-full text-xs text-text-secondary">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>

                    <button onClick={() => { setSelectedMethod('statistical'); setCreateStep(2) }}
                      className="w-full p-5 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-agent/10 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-6 h-6 text-agent" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-text-primary mb-1">Statistical (ML Clustering)</h5>
                          <p className="text-sm text-text-secondary mb-3">Let machine learning algorithms automatically discover customer segments based on behavioral patterns.</p>
                          <div className="flex flex-wrap gap-2">
                            {['K-Means Clustering', 'Auto-Feature Selection', 'PCA Visualization', 'Auto-Labeling'].map((tag) => (
                              <span key={tag} className="px-2.5 py-1 bg-surface-tertiary rounded-full text-xs text-text-secondary">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Rule-Based - Choose Segmentation Types */}
              {createStep === 2 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Choose Segmentation Types</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'rfm', name: 'RFM Analysis', desc: 'Segment by Recency, Frequency & Monetary value', icon: BarChart3, color: 'text-primary' },
                      { id: 'lifecycle', name: 'Lifecycle Stage', desc: 'Based on customer journey position', icon: Clock, color: 'text-success' },
                      { id: 'value', name: 'Value Tier', desc: 'Customer lifetime value classification', icon: Tag, color: 'text-warning' },
                      { id: 'promo', name: 'Promo Sensitivity', desc: 'Response to promotional offers', icon: Tag, color: 'text-danger' },
                      { id: 'channel', name: 'Channel Preference', desc: 'Preferred shopping channel', icon: Users, color: 'text-info' },
                      { id: 'category', name: 'Category Affinity', desc: 'Product category preferences', icon: Tag, color: 'text-agent' },
                    ].map((type) => (
                      <button key={type.id} onClick={() => setSelectedSegmentationType(type.id)}
                        className={cn('p-4 rounded-xl border text-left transition-all',
                          selectedSegmentationType === type.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface-secondary')}>
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', 
                          selectedSegmentationType === type.id ? 'bg-primary/10' : 'bg-surface-tertiary')}>
                          <type.icon className={cn('w-5 h-5', type.color)} />
                        </div>
                        <h5 className="font-medium text-text-primary mb-1">{type.name}</h5>
                        <p className="text-xs text-text-secondary">{type.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => { setCreateStep(1); setSelectedMethod(null); setSelectedSegmentationType(null) }}>Back</Button>
                    <Button variant="primary" disabled={!selectedSegmentationType} onClick={() => setCreateStep(3)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Statistical - Configure Clustering */}
              {createStep === 2 && selectedMethod === 'statistical' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-4">Choose Clustering Algorithm</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'K-Means', name: 'K-Means', desc: 'Most common, works well for spherical clusters' },
                      { id: 'Gaussian', name: 'Gaussian Mixture', desc: 'Handles overlapping clusters with soft assignments' },
                      { id: 'Hierarchical', name: 'Hierarchical', desc: 'Creates nested cluster hierarchy' },
                      { id: 'DBSCAN', name: 'DBSCAN', desc: 'Detects noise and outliers automatically' },
                    ].map((algo) => (
                      <button key={algo.id} onClick={() => setSelectedClusteringAlgorithm(algo.id)}
                        className={cn('p-4 rounded-xl border text-left transition-all',
                          selectedClusteringAlgorithm === algo.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-text-primary">{algo.name}</h5>
                          {selectedClusteringAlgorithm === algo.id && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-text-secondary">{algo.desc}</p>
                      </button>
                    ))}
                  </div>

                  <h4 className="text-lg font-semibold text-text-primary mb-4">Select Input Features</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'Recency', category: 'RFM', score: 95 },
                      { id: 'Frequency', category: 'RFM', score: 92 },
                      { id: 'Monetary', category: 'RFM', score: 94 },
                      { id: 'Avg Order Value', category: 'Transaction', score: 91 },
                      { id: 'Promo Sensitivity', category: 'Behavior', score: 88 },
                      { id: 'Category Affinity', category: 'Preference', score: 90 },
                    ].map((feature) => (
                      <div key={feature.id}
                        className={cn('p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between',
                          selectedFeatures.includes(feature.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                        onClick={() => setSelectedFeatures(prev =>
                          prev.includes(feature.id) ? prev.filter(f => f !== feature.id) : [...prev, feature.id])}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedFeatures.includes(feature.id)}
                            onChange={() => setSelectedFeatures(prev =>
                              prev.includes(feature.id) ? prev.filter(f => f !== feature.id) : [...prev, feature.id])}
                            label={feature.id}
                          />
                          <p className="text-xs text-text-muted ml-1">{feature.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full" style={{ width: `${feature.score}%` }} />
                          </div>
                          <span className="text-xs text-text-muted">{feature.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 className="text-lg font-semibold text-text-primary mb-4">Number of Clusters</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-lg font-bold text-text-primary">{clusterCount}</span>
                    <span className="text-text-secondary">clusters</span>
                  </div>
                  <input type="range" min={3} max={10} value={clusterCount} onChange={(e) => setClusterCount(Number(e.target.value))}
                    className="w-full h-2 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-primary" />
                  <div className="flex justify-between text-xs text-text-muted mt-1"><span>3</span><span>10</span></div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => { setCreateStep(1); setSelectedMethod(null) }}>Back</Button>
                    <Button variant="primary" onClick={() => setCreateStep(3)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Rule-Based - Define Rules with Manual vs Auto Selection */}
              {createStep === 3 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Define Segment Rules</h4>
                  <p className="text-sm text-text-secondary mb-6">
                    Configure the rules for your {selectedSegmentationType?.replace('-', ' ')} segmentation
                  </p>
                  
                  {/* Manual vs Auto Selection */}
                  {!ruleDefinitionMode && (
                    <div className="space-y-3 mb-6">
                      <p className="text-sm font-medium text-text-primary mb-3">How would you like to define rules?</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setRuleDefinitionMode('manual')
                            setRuleConditions([{ field: '', operator: 'equals', value: '' }])
                          }}
                          className="p-4 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Edit3 className="w-5 h-5 text-primary" />
                            </div>
                            <h5 className="font-semibold text-text-primary">Manual</h5>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Build rules yourself using the rule builder with full control over conditions
                          </p>
                        </button>
                        
                        <button
                          onClick={() => {
                            setRuleDefinitionMode('auto')
                            generateAutoRules()
                          }}
                          className="p-4 bg-surface border border-border rounded-xl text-left hover:border-agent/50 hover:bg-agent/5 transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-agent/10 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-agent" />
                            </div>
                            <h5 className="font-semibold text-text-primary">Auto (AI)</h5>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Let AI define optimal rules based on your segmentation type, then review
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Auto Mode - Loading State */}
                  {ruleDefinitionMode === 'auto' && autoRulesLoading && (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-agent/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-agent animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-text-primary mb-1">AI is analyzing your data...</p>
                      <p className="text-xs text-text-secondary">Generating optimal rules for {selectedSegmentationType?.replace('-', ' ')} segmentation</p>
                    </div>
                  )}

                  {/* Auto Mode - Generated Rules Review */}
                  {ruleDefinitionMode === 'auto' && autoRulesGenerated && !autoRulesLoading && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-agent" />
                          <span className="text-sm font-medium text-agent">AI-Generated Rules</span>
                        </div>
                        <button
                          onClick={() => {
                            setRuleDefinitionMode(null)
                            setAutoRulesGenerated(false)
                            setRuleConditions([{ field: '', operator: 'equals', value: '' }])
                          }}
                          className="text-xs text-text-muted hover:text-text-primary"
                        >
                          Change method
                        </button>
                      </div>
                      
                      <div className="p-4 bg-agent/5 border border-agent/20 rounded-xl mb-4">
                        <p className="text-xs text-agent mb-2 font-medium">💡 AI Recommendation</p>
                        <p className="text-sm text-text-secondary">
                          Based on your {selectedSegmentationType?.replace('-', ' ')} segmentation type, these rules will capture high-value customers with strong engagement patterns. You can modify any rule below.
                        </p>
                      </div>

                      {ruleConditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {index > 0 && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">AND</span>
                          )}
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            {/* Field Dropdown - Custom Style */}
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === `field-${index}` ? null : `field-${index}`)}
                                className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm"
                              >
                                <span className={condition.field ? 'text-text-primary' : 'text-text-muted'}>
                                  {condition.field ? (
                                    selectedSegmentationType === 'rfm' ? { recency: 'Recency (days)', frequency: 'Frequency (orders)', monetary: 'Monetary (spend)', rfm_score: 'RFM Score' }[condition.field] :
                                    selectedSegmentationType === 'lifecycle' ? { days_since_first: 'Days since first purchase', days_since_last: 'Days since last purchase', total_orders: 'Total orders', lifecycle_stage: 'Lifecycle stage' }[condition.field] :
                                    selectedSegmentationType === 'value' ? { ltv: 'Lifetime Value', avg_order_value: 'Avg Order Value', total_spend: 'Total Spend', value_tier: 'Value Tier' }[condition.field] :
                                    selectedSegmentationType === 'promo' ? { promo_response_rate: 'Promo Response Rate', coupon_usage: 'Coupon Usage', discount_sensitivity: 'Discount Sensitivity', promo_orders_pct: 'Promo Orders %' }[condition.field] :
                                    selectedSegmentationType === 'channel' ? { primary_channel: 'Primary Channel', online_orders_pct: 'Online Orders %', store_orders_pct: 'Store Orders %', channel_switches: 'Channel Switches' }[condition.field] :
                                    selectedSegmentationType === 'category' ? { top_category: 'Top Category', category_diversity: 'Category Diversity', category_spend: 'Category Spend', cross_category: 'Cross-Category Buyer' }[condition.field] :
                                    condition.field
                                  ) : 'Select field...'}
                                </span>
                                <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === `field-${index}` && 'rotate-180')} />
                              </button>
                              <AnimatePresence>
                                {openDropdown === `field-${index}` && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -4 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg z-[9999] overflow-hidden py-1"
                                  >
                                    {selectedSegmentationType === 'rfm' && [
                                      { value: 'recency', label: 'Recency (days)' },
                                      { value: 'frequency', label: 'Frequency (orders)' },
                                      { value: 'monetary', label: 'Monetary (spend)' },
                                      { value: 'rfm_score', label: 'RFM Score' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'lifecycle' && [
                                      { value: 'days_since_first', label: 'Days since first purchase' },
                                      { value: 'days_since_last', label: 'Days since last purchase' },
                                      { value: 'total_orders', label: 'Total orders' },
                                      { value: 'lifecycle_stage', label: 'Lifecycle stage' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'value' && [
                                      { value: 'ltv', label: 'Lifetime Value' },
                                      { value: 'avg_order_value', label: 'Avg Order Value' },
                                      { value: 'total_spend', label: 'Total Spend' },
                                      { value: 'value_tier', label: 'Value Tier' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'promo' && [
                                      { value: 'promo_response_rate', label: 'Promo Response Rate' },
                                      { value: 'coupon_usage', label: 'Coupon Usage' },
                                      { value: 'discount_sensitivity', label: 'Discount Sensitivity' },
                                      { value: 'promo_orders_pct', label: 'Promo Orders %' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'channel' && [
                                      { value: 'primary_channel', label: 'Primary Channel' },
                                      { value: 'online_orders_pct', label: 'Online Orders %' },
                                      { value: 'store_orders_pct', label: 'Store Orders %' },
                                      { value: 'channel_switches', label: 'Channel Switches' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'category' && [
                                      { value: 'top_category', label: 'Top Category' },
                                      { value: 'category_diversity', label: 'Category Diversity' },
                                      { value: 'category_spend', label: 'Category Spend' },
                                      { value: 'cross_category', label: 'Cross-Category Buyer' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {/* Operator Dropdown - Custom Style */}
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === `operator-${index}` ? null : `operator-${index}`)}
                                className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm"
                              >
                                <span className="text-text-primary">
                                  {{ equals: 'Equals', not_equals: 'Not Equals', greater_than: 'Greater Than', less_than: 'Less Than', between: 'Between', contains: 'Contains' }[condition.operator] || 'Equals'}
                                </span>
                                <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === `operator-${index}` && 'rotate-180')} />
                              </button>
                              <AnimatePresence>
                                {openDropdown === `operator-${index}` && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -4 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg z-[9999] overflow-hidden py-1"
                                  >
                                    {[
                                      { value: 'equals', label: 'Equals' },
                                      { value: 'not_equals', label: 'Not Equals' },
                                      { value: 'greater_than', label: 'Greater Than' },
                                      { value: 'less_than', label: 'Less Than' },
                                      { value: 'between', label: 'Between' },
                                      { value: 'contains', label: 'Contains' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'operator', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.operator === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.operator === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateRuleCondition(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                              className="px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                            />
                          </div>
                          {ruleConditions.length > 1 && (
                            <button onClick={() => removeRuleCondition(index)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={addRuleCondition}
                        className="mt-2 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add Condition
                      </button>
                    </div>
                  )}

                  {/* Manual Mode - Rule Builder */}
                  {ruleDefinitionMode === 'manual' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Manual Rule Builder</span>
                        </div>
                        <button
                          onClick={() => {
                            setRuleDefinitionMode(null)
                            setRuleConditions([{ field: '', operator: 'equals', value: '' }])
                          }}
                          className="text-xs text-text-muted hover:text-text-primary"
                        >
                          Change method
                        </button>
                      </div>

                      {ruleConditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {index > 0 && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">AND</span>
                          )}
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            {/* Field Dropdown - Custom Style */}
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === `manual-field-${index}` ? null : `manual-field-${index}`)}
                                className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm"
                              >
                                <span className={condition.field ? 'text-text-primary' : 'text-text-muted'}>
                                  {condition.field ? (
                                    selectedSegmentationType === 'rfm' ? { recency: 'Recency (days)', frequency: 'Frequency (orders)', monetary: 'Monetary (spend)', rfm_score: 'RFM Score' }[condition.field] :
                                    selectedSegmentationType === 'lifecycle' ? { days_since_first: 'Days since first purchase', days_since_last: 'Days since last purchase', total_orders: 'Total orders', lifecycle_stage: 'Lifecycle stage' }[condition.field] :
                                    selectedSegmentationType === 'value' ? { ltv: 'Lifetime Value', avg_order_value: 'Avg Order Value', total_spend: 'Total Spend', value_tier: 'Value Tier' }[condition.field] :
                                    selectedSegmentationType === 'promo' ? { promo_response_rate: 'Promo Response Rate', coupon_usage: 'Coupon Usage', discount_sensitivity: 'Discount Sensitivity', promo_orders_pct: 'Promo Orders %' }[condition.field] :
                                    selectedSegmentationType === 'channel' ? { primary_channel: 'Primary Channel', online_orders_pct: 'Online Orders %', store_orders_pct: 'Store Orders %', channel_switches: 'Channel Switches' }[condition.field] :
                                    selectedSegmentationType === 'category' ? { top_category: 'Top Category', category_diversity: 'Category Diversity', category_spend: 'Category Spend', cross_category: 'Cross-Category Buyer' }[condition.field] :
                                    condition.field
                                  ) : 'Select field...'}
                                </span>
                                <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === `manual-field-${index}` && 'rotate-180')} />
                              </button>
                              <AnimatePresence>
                                {openDropdown === `manual-field-${index}` && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -4 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg z-[9999] overflow-hidden py-1"
                                  >
                                    {selectedSegmentationType === 'rfm' && [
                                      { value: 'recency', label: 'Recency (days)' },
                                      { value: 'frequency', label: 'Frequency (orders)' },
                                      { value: 'monetary', label: 'Monetary (spend)' },
                                      { value: 'rfm_score', label: 'RFM Score' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'lifecycle' && [
                                      { value: 'days_since_first', label: 'Days since first purchase' },
                                      { value: 'days_since_last', label: 'Days since last purchase' },
                                      { value: 'total_orders', label: 'Total orders' },
                                      { value: 'lifecycle_stage', label: 'Lifecycle stage' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'value' && [
                                      { value: 'ltv', label: 'Lifetime Value' },
                                      { value: 'avg_order_value', label: 'Avg Order Value' },
                                      { value: 'total_spend', label: 'Total Spend' },
                                      { value: 'value_tier', label: 'Value Tier' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'promo' && [
                                      { value: 'promo_response_rate', label: 'Promo Response Rate' },
                                      { value: 'coupon_usage', label: 'Coupon Usage' },
                                      { value: 'discount_sensitivity', label: 'Discount Sensitivity' },
                                      { value: 'promo_orders_pct', label: 'Promo Orders %' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'channel' && [
                                      { value: 'primary_channel', label: 'Primary Channel' },
                                      { value: 'online_orders_pct', label: 'Online Orders %' },
                                      { value: 'store_orders_pct', label: 'Store Orders %' },
                                      { value: 'channel_switches', label: 'Channel Switches' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                    {selectedSegmentationType === 'category' && [
                                      { value: 'top_category', label: 'Top Category' },
                                      { value: 'category_diversity', label: 'Category Diversity' },
                                      { value: 'category_spend', label: 'Category Spend' },
                                      { value: 'cross_category', label: 'Cross-Category Buyer' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'field', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.field === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.field === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {/* Operator Dropdown - Custom Style */}
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === `manual-operator-${index}` ? null : `manual-operator-${index}`)}
                                className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm"
                              >
                                <span className="text-text-primary">
                                  {{ equals: 'Equals', not_equals: 'Not Equals', greater_than: 'Greater Than', less_than: 'Less Than', between: 'Between', contains: 'Contains' }[condition.operator] || 'Equals'}
                                </span>
                                <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === `manual-operator-${index}` && 'rotate-180')} />
                              </button>
                              <AnimatePresence>
                                {openDropdown === `manual-operator-${index}` && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -4 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg z-[9999] overflow-hidden py-1"
                                  >
                                    {[
                                      { value: 'equals', label: 'Equals' },
                                      { value: 'not_equals', label: 'Not Equals' },
                                      { value: 'greater_than', label: 'Greater Than' },
                                      { value: 'less_than', label: 'Less Than' },
                                      { value: 'between', label: 'Between' },
                                      { value: 'contains', label: 'Contains' },
                                    ].map((opt) => (
                                      <button key={opt.value} onClick={() => { updateRuleCondition(index, 'operator', opt.value); setOpenDropdown(null) }}
                                        className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                          condition.operator === opt.value && 'text-primary font-medium')}>
                                        {opt.label}
                                        {condition.operator === opt.value && <Check className="w-4 h-4 text-primary" />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateRuleCondition(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                              className="px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                            />
                          </div>
                          {ruleConditions.length > 1 && (
                            <button onClick={() => removeRuleCondition(index)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={addRuleCondition}
                        className="mt-2 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add Condition
                      </button>
                    </div>
                  )}

                  {/* Preview - Adapts based on method */}
                  {ruleDefinitionMode && (ruleDefinitionMode === 'manual' || autoRulesGenerated) && (
                    <div className={cn(
                      "mt-6 p-4 rounded-xl",
                      ruleDefinitionMode === 'auto' ? 'bg-agent/5 border border-agent/20' : 'bg-surface-secondary'
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {ruleDefinitionMode === 'auto' && <Sparkles className="w-3 h-3 text-agent" />}
                        <p className="text-xs text-text-muted">
                          {ruleDefinitionMode === 'auto' ? 'AI-Generated Preview' : 'Preview'}
                        </p>
                      </div>
                      <p className="text-sm text-text-primary">
                        {ruleConditions.filter(c => c.field && c.value).length > 0 
                          ? ruleConditions.filter(c => c.field && c.value).map((c, i) => 
                              `${i > 0 ? ' AND ' : ''}${c.field} ${c.operator.replace('_', ' ')} "${c.value}"`
                            ).join('')
                          : 'No rules defined yet'}
                      </p>
                      {ruleDefinitionMode === 'auto' && ruleConditions.filter(c => c.field && c.value).length > 0 && (
                        <p className="text-xs text-agent mt-2">
                          ✓ Estimated segment size: ~{formatNumber(Math.floor(Math.random() * 30000) + 15000)} customers
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => { setCreateStep(2); setRuleDefinitionMode(null); setAutoRulesGenerated(false) }}>Back</Button>
                    <Button 
                      variant="primary" 
                      disabled={!ruleDefinitionMode || (ruleDefinitionMode === 'auto' && !autoRulesGenerated) || ruleConditions.filter(c => c.field && c.value).length === 0}
                      onClick={() => setCreateStep(4)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Statistical - Segment Details */}
              {createStep === 3 && selectedMethod === 'statistical' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Configure Segment Details</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Segment Name *</label>
                      <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="e.g., High-Value Loyalists"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                      <p className="text-xs text-text-muted mt-1.5">Give your segment a descriptive name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Segment Nature</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Static', 'Dynamic'] as const).map((nature) => (
                          <button key={nature} onClick={() => setSegmentNature(nature)}
                            className={cn('p-4 rounded-xl border text-left transition-all',
                              segmentNature === nature ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-text-primary">{nature}</h5>
                              {segmentNature === nature && <CheckCircle className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-xs text-text-secondary">
                              {nature === 'Static' ? 'Frozen snapshot of customers at creation time' : 'Auto-refreshes based on rules periodically'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Target Channel</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Online', 'Loyalty', 'Omnichannel'] as const).map((ch) => (
                          <button key={ch} onClick={() => setSegmentChannel(ch)}
                            className={cn('px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                              segmentChannel === ch ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary hover:border-primary/50')}>
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => setCreateStep(2)}>Back</Button>
                    <Button variant="primary" disabled={!segmentName.trim()} onClick={() => setCreateStep(4)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Rule-Based - Segment Details */}
              {createStep === 4 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Configure Segment Details</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Segment Name *</label>
                      <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="e.g., High-Value Loyalists"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                      <p className="text-xs text-text-muted mt-1.5">Give your segment a descriptive name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Segment Nature</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Static', 'Dynamic'] as const).map((nature) => (
                          <button key={nature} onClick={() => setSegmentNature(nature)}
                            className={cn('p-4 rounded-xl border text-left transition-all',
                              segmentNature === nature ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-text-primary">{nature}</h5>
                              {segmentNature === nature && <CheckCircle className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-xs text-text-secondary">
                              {nature === 'Static' ? 'Frozen snapshot of customers at creation time' : 'Auto-refreshes based on rules periodically'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Target Channel</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Online', 'Loyalty', 'Omnichannel'] as const).map((ch) => (
                          <button key={ch} onClick={() => setSegmentChannel(ch)}
                            className={cn('px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                              segmentChannel === ch ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary hover:border-primary/50')}>
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => setCreateStep(3)}>Back</Button>
                    <Button variant="primary" disabled={!segmentName.trim()} onClick={() => setCreateStep(5)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Statistical - Review & Save */}
              {createStep === 4 && selectedMethod === 'statistical' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Review & Create Segment</h4>
                  
                  <div className="bg-surface-secondary rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Segment Name</p>
                        <p className="font-semibold text-text-primary text-lg">{segmentName}</p>
                      </div>
                      <Badge variant="info">{segmentNature}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Method</p>
                        <p className="text-sm text-text-primary font-medium">Statistical (ML)</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Channel</p>
                        <p className="text-sm text-text-primary font-medium">{segmentChannel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Algorithm</p>
                        <p className="text-sm text-text-primary font-medium">{selectedClusteringAlgorithm}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Clusters</p>
                        <p className="text-sm text-text-primary font-medium">{clusterCount}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-text-muted mb-1">Features ({selectedFeatures.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedFeatures.map(f => (
                            <span key={f} className="px-2 py-1 bg-surface rounded text-xs text-text-secondary">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Estimated segment size</p>
                        <p className="text-xs text-text-secondary mt-1">Based on your configuration, this segment is estimated to contain approximately <strong>45,000 - 52,000 customers</strong>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => setCreateStep(3)}>Back</Button>
                    <Button variant="primary" onClick={() => { setShowCreateModal(false); resetCreateWizard() }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Rule-Based - Review & Save */}
              {createStep === 5 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Review & Create Segment</h4>
                  
                  <div className="bg-surface-secondary rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Segment Name</p>
                        <p className="font-semibold text-text-primary text-lg">{segmentName}</p>
                      </div>
                      <Badge variant="info">{segmentNature}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Method</p>
                        <p className="text-sm text-text-primary font-medium">Rule-Based</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Channel</p>
                        <p className="text-sm text-text-primary font-medium">{segmentChannel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Segmentation Type</p>
                        <p className="text-sm text-text-primary font-medium capitalize">{selectedSegmentationType?.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Rules</p>
                        <p className="text-sm text-text-primary font-medium">{ruleConditions.filter(c => c.field && c.value).length} conditions</p>
                      </div>
                    </div>

                    {ruleConditions.filter(c => c.field && c.value).length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-text-muted mb-2">Rule Preview</p>
                        <p className="text-sm text-text-primary bg-surface p-3 rounded-lg">
                          {ruleConditions.filter(c => c.field && c.value).map((c, i) => 
                            `${i > 0 ? ' AND ' : ''}${c.field} ${c.operator.replace('_', ' ')} "${c.value}"`
                          ).join('')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Estimated segment size</p>
                        <p className="text-xs text-text-secondary mt-1">Based on your rules, this segment is estimated to contain approximately <strong>38,000 - 45,000 customers</strong>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => setCreateStep(4)}>Back</Button>
                    <Button variant="primary" onClick={() => { setShowCreateModal(false); resetCreateWizard() }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create with Alan Panel */}
      <Panel
        title="Create with Alan"
        anchor="right"
        open={showAlanPanel}
        setIsOpen={setShowAlanPanel}
        onClose={() => setShowAlanPanel(false)}
        size="medium"
      >
        {showAlanPanel && (<>
              <p className="text-sm text-text-secondary mb-4">Configure segment generation</p>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Segmentation Method <span className="text-danger">*</span></label>
                  <div className="flex gap-2">
                    {(['Rule-Based', 'Statistical'] as const).map((m) => (
                      <button key={m} onClick={() => setAlanMethod(m)}
                        className={cn('flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors border',
                          alanMethod === m ? 'bg-agent/10 border-agent text-agent' : 'bg-surface-secondary border-border text-text-secondary hover:border-agent/50')}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Segment Nature <span className="text-danger">*</span></label>
                  <div className="flex gap-2">
                    {(['Static', 'Dynamic'] as const).map((n) => (
                      <button key={n} onClick={() => setAlanNature(n)}
                        className={cn('flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors border',
                          alanNature === n ? 'bg-agent/10 border-agent text-agent' : 'bg-surface-secondary border-border text-text-secondary hover:border-agent/50')}>
                        <span className="block">{n}</span>
                        <span className="block text-xs opacity-70 mt-0.5">{n === 'Static' ? 'Frozen snapshot' : 'Auto-refresh'}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-text-primary mb-2">Channel <span className="text-danger">*</span></label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'alanChannel' ? null : 'alanChannel')}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-agent/50 transition-colors"
                  >
                    <span className={alanChannel ? 'text-text-primary' : 'text-text-muted'}>{alanChannel || 'Select channel...'}</span>
                    <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'alanChannel' && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'alanChannel' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden"
                      >
                        {['Online', 'Loyalty', 'Omnichannel'].map((opt) => (
                          <button 
                            key={opt} 
                            onClick={() => { setAlanChannel(opt); setOpenDropdown(null) }}
                            className={cn(
                              'w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                              alanChannel === opt && 'bg-agent/5 text-agent font-medium'
                            )}
                          >
                            {opt}
                            {alanChannel === opt && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="p-3 bg-agent/5 rounded-lg border border-agent/20">
                  <p className="text-sm text-text-secondary">
                    <Sparkles className="w-4 h-4 text-agent inline mr-1.5" />
                    {alanMethod === 'Rule-Based' 
                      ? 'Alan will analyze your context and define optimal segmentation rules automatically.'
                      : 'Alan will own feature selection and clustering for statistical segmentation.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-text-primary mb-4">Context Inputs</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">Business Intent <span className="text-danger">*</span></label>
                      <textarea value={alanBusinessIntent} onChange={(e) => setAlanBusinessIntent(e.target.value)}
                        placeholder="e.g., Find customers likely to churn in the next 30 days..."
                        className="w-full h-24 px-3 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-agent/50" />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">Time Window</label>
                      <input type="text" value={alanTimeWindow} onChange={(e) => setAlanTimeWindow(e.target.value)} placeholder="e.g., Last 90 days"
                        className="w-full px-3 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agent/50" />
                    </div>
                  </div>
                </div>
                <Button variant="primary" className="w-full bg-agent hover:bg-agent/90" onClick={runAlan}
                  disabled={!alanMethod || !alanNature || !alanBusinessIntent || !alanChannel}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Alan
                </Button>
              </div>
        </>)}
      </Panel>

      {/* Alan Results Panel */}
      <AnimatePresence>
        {showAlanResults && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setShowAlanResults(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface rounded-2xl shadow-xl z-[101] max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-agent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-agent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">Alan Generated Segment</h3>
                    <p className="text-sm text-text-secondary">Review the segment before saving</p>
                  </div>
                </div>
                <button onClick={() => setShowAlanResults(false)} className="p-2 hover:bg-surface-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Segment Name */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Segment Name</label>
                  <input 
                    type="text" 
                    value={alanGeneratedSegmentName} 
                    onChange={(e) => setAlanGeneratedSegmentName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agent/50 focus:border-agent" 
                  />
                </div>

                {/* Segment Summary */}
                <div className="bg-surface-secondary rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Method</p>
                      <p className="font-medium text-text-primary">{alanMethod}</p>
                    </div>
                    <Badge variant="agent">{alanNature}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Channel</p>
                      <p className="text-sm text-text-primary font-medium">{alanChannel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Time Window</p>
                      <p className="text-sm text-text-primary font-medium">{alanTimeWindow || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Alan Insights */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-agent" />
                    Alan's Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-agent/5 border border-agent/20 rounded-xl">
                      <p className="text-sm text-text-primary font-medium mb-1">Segment Definition</p>
                      <p className="text-sm text-text-secondary">
                        Based on your intent "{alanBusinessIntent}", Alan identified customers with high churn risk 
                        based on declining purchase frequency and reduced engagement in the last 60 days.
                      </p>
                    </div>
                    <div className="p-4 bg-surface-secondary rounded-xl">
                      <p className="text-sm text-text-primary font-medium mb-1">Key Characteristics</p>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Last purchase: 45-90 days ago</li>
                        <li>• Purchase frequency dropped by 40%+</li>
                        <li>• Email engagement rate below 10%</li>
                        <li>• No app activity in last 30 days</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Estimated Size */}
                <div className="p-4 bg-info/5 border border-info/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Estimated Segment Size</p>
                      <p className="text-xs text-text-secondary mt-1">
                        This segment contains approximately <strong>32,450 customers</strong> (8.2% of total customer base).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">Recommended Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-surface-tertiary rounded-lg text-xs text-text-secondary">Win-back Email Campaign</span>
                    <span className="px-3 py-1.5 bg-surface-tertiary rounded-lg text-xs text-text-secondary">Personalized Discount Offer</span>
                    <span className="px-3 py-1.5 bg-surface-tertiary rounded-lg text-xs text-text-secondary">Re-engagement Push Notification</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-border flex gap-3">
                  <Button 
                    variant="tertiary" 
                    className="flex-1 text-danger hover:bg-danger/10"
                    onClick={() => { setShowAlanResults(false); setShowAlanInsights(false) }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="flex-1"
                    onClick={() => { setShowAlanResults(false); setShowAlanPanel(true) }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modify
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 bg-agent hover:bg-agent/90"
                    onClick={() => { setShowAlanResults(false); setShowAlanInsights(false) }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Segment
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Segment Details Drawer */}
      <Panel
        title="Segment Details"
        anchor="right"
        open={!!selectedSegment}
        setIsOpen={(open: boolean) => { if (!open) setSelectedSegment(null) }}
        onClose={() => setSelectedSegment(null)}
        size="medium"
      >
        {selectedSegment && (<>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Segment Overview</h4>
                  <Card sx={{ padding: "16px" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-text-primary text-base">{selectedSegment.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">{selectedSegment.id}</p>
                      </div>
                      <Badge variant={selectedSegment.status === 'Active' ? 'success' : 'default'}>{selectedSegment.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><span className="text-text-muted">Created by:</span><div className="flex items-center gap-1 mt-1">{selectedSegment.createdBy === 'Alan' && <Sparkles className="w-3 h-3 text-agent" />}<span className="font-semibold text-text-primary">{selectedSegment.createdBy}</span></div></div>
                      <div><span className="text-text-muted">Method:</span><div className="mt-1"><Badge variant={selectedSegment.segmentationMethod === 'Statistical' ? 'info' : 'default'}>{selectedSegment.segmentationMethod}</Badge></div></div>
                      <div><span className="text-text-muted">Nature:</span><div className="mt-1"><Badge variant={selectedSegment.segmentNature === 'Dynamic' ? 'success' : 'default'}>{selectedSegment.segmentNature}</Badge></div></div>
                      <div><span className="text-text-muted">Channel:</span><div className="font-semibold text-text-primary mt-1">{selectedSegment.channel}</div></div>
                    </div>
                  </Card>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Logic Summary</h4>
                  <Card sx={{ padding: "16px" }}>
                    <p className="text-sm text-text-secondary mb-3">{selectedSegment.logicSummary}</p>
                    {selectedSegment.features && (
                      <div>
                        <p className="text-xs font-medium text-text-muted mb-2">Features Used:</p>
                        <ul className="space-y-1">{selectedSegment.features.map((f, i) => (<li key={i} className="text-sm text-text-secondary flex items-center gap-2"><BarChart3 className="w-3 h-3 text-info" />{f}</li>))}</ul>
                      </div>
                    )}
                    {selectedSegment.rules && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-text-muted mb-2">Rules:</p>
                        <ul className="space-y-1">{selectedSegment.rules.map((rule, i) => (<li key={i} className="text-sm text-text-secondary flex items-center gap-2"><Check className="w-3 h-3 text-success" />{rule}</li>))}</ul>
                      </div>
                    )}
                  </Card>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Estimated Size</h4>
                  <Card sx={{ padding: "16px" }}>
                    <p className="text-xl font-bold text-text-primary">{formatNumber(selectedSegment.estimatedSize)}</p>
                    <p className="text-xs text-text-muted mt-0.5">customers</p>
                    {selectedSegment.segmentNature === 'Dynamic' && (
                      <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5"><Clock className="w-3 h-3" />Last refreshed: {selectedSegment.lastUpdated.toLocaleDateString()}</p>
                    )}
                  </Card>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Campaign Usage</h4>
                  <Card sx={{ padding: "16px" }} className="space-y-4">
                    {/* Total Campaigns */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-text-primary">{selectedSegment.campaignDetails.total}</p>
                        <p className="text-xs text-text-muted">total campaigns</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 text-success">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-lg font-semibold">{selectedSegment.campaignDetails.active}</span>
                          </div>
                          <p className="text-xs text-text-muted">Active</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-lg font-semibold">{selectedSegment.campaignDetails.completed}</span>
                          </div>
                          <p className="text-xs text-text-muted">Completed</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-border" />
                    
                    {/* Recency & Intent */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Last Used</p>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-sm font-medium text-text-primary">
                            {selectedSegment.campaignDetails.lastUsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Primary Intent</p>
                        <Badge variant={
                          selectedSegment.campaignDetails.primaryIntent === 'Retention' ? 'success' :
                          selectedSegment.campaignDetails.primaryIntent === 'Win-back' ? 'warning' :
                          selectedSegment.campaignDetails.primaryIntent === 'Conversion' ? 'info' :
                          selectedSegment.campaignDetails.primaryIntent === 'Promotion' ? 'agent' :
                          selectedSegment.campaignDetails.primaryIntent === 'Acquisition' ? 'default' : 'default'
                        }>
                          {selectedSegment.campaignDetails.primaryIntent}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outlined" className="justify-start"><Edit3 className="w-4 h-4 mr-2" />Edit Segment</Button>
                    <Button variant="outlined" className="justify-start"><Copy className="w-4 h-4 mr-2" />Duplicate Segment</Button>
                    <Button variant="outlined" className="justify-start text-warning hover:text-warning"><Archive className="w-4 h-4 mr-2" />Archive Segment</Button>
                  </div>
                </div>
              </div>
        </>)}
      </Panel>
    </div>
  )
}
