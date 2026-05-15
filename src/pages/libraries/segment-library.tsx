import { useState, useEffect, Fragment, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Sparkles, X, Eye, ChevronLeft, ChevronRight, Check, 
  RotateCcw, Copy, Archive, Edit3, Clock, CheckCircle,
  AlertCircle, Lightbulb, BarChart3, Filter, Download, Tag
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Panel } from 'impact-ui/src/components/Panel/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Checkbox } from 'impact-ui/src/components/Checkbox/index.js'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { AgentFlowPanel, AgentFlowOrb, stepsFromProgress } from '@/components/agent/agent-flow-panel'
import './segment-wizard.css'

// ── Rule-builder option sets ─────────────────────────────────────────────────
const FIELD_OPTIONS: Record<string, { label: string; value: string }[]> = {
  rfm: [
    { value: 'recency',   label: 'Recency (days)' },
    { value: 'frequency', label: 'Frequency (orders)' },
    { value: 'monetary',  label: 'Monetary (spend)' },
    { value: 'rfm_score', label: 'RFM Score' },
  ],
  lifecycle: [
    { value: 'days_since_first', label: 'Days since first purchase' },
    { value: 'days_since_last',  label: 'Days since last purchase' },
    { value: 'total_orders',     label: 'Total orders' },
    { value: 'lifecycle_stage',  label: 'Lifecycle stage' },
  ],
  value: [
    { value: 'ltv',             label: 'Lifetime Value' },
    { value: 'avg_order_value', label: 'Avg Order Value' },
    { value: 'total_spend',     label: 'Total Spend' },
    { value: 'value_tier',      label: 'Value Tier' },
  ],
  promo: [
    { value: 'promo_response_rate',  label: 'Promo Response Rate' },
    { value: 'coupon_usage',         label: 'Coupon Usage' },
    { value: 'discount_sensitivity', label: 'Discount Sensitivity' },
    { value: 'promo_orders_pct',     label: 'Promo Orders %' },
  ],
  channel: [
    { value: 'primary_channel',   label: 'Primary Channel' },
    { value: 'online_orders_pct', label: 'Online Orders %' },
    { value: 'store_orders_pct',  label: 'Store Orders %' },
    { value: 'channel_switches',  label: 'Channel Switches' },
  ],
  category: [
    { value: 'top_category',       label: 'Top Category' },
    { value: 'category_diversity', label: 'Category Diversity' },
    { value: 'category_spend',     label: 'Category Spend' },
    { value: 'cross_category',     label: 'Cross-Category Buyer' },
  ],
}

const OPERATOR_OPTIONS = [
  { value: 'equals',       label: 'Equals' },
  { value: 'not_equals',   label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than',    label: 'Less Than' },
  { value: 'between',      label: 'Between' },
  { value: 'contains',     label: 'Contains' },
]

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
  segmentType: 'PRO' | 'DIY' | 'PET'
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

const INITIAL_SEGMENTS: Segment[] = [
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
  // ── Pet Supplies / Pet Rewards Segments ──
  {
    id: 'PET_001',
    name: 'Pet – Cat Month Loyalists',
    segmentType: 'PET',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'High-frequency cat product buyers with strong brand affinity and reward redemption history during seasonal promotions.',
    logicSummary: 'Customers with 3+ cat product orders in last 90 days, reward redemption rate >60%, and active loyalty membership.',
    category: 'Retention',
    channel: 'Loyalty',
    campaignUsage: 8,
    campaignDetails: { total: 8, active: 3, completed: 5, lastUsedDate: new Date('2026-05-01'), primaryIntent: 'Retention' },
    lastUpdated: new Date('2026-05-01'),
    estimatedSize: 14200,
    status: 'Active',
    features: ['Category affinity (Cat)', 'Reward redemption rate', 'Purchase frequency', 'Loyalty tier'],
  },
  {
    id: 'PET_002',
    name: 'Pet – Dog Grooming Service Regulars',
    segmentType: 'PET',
    createdBy: 'System',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers who regularly book or purchase dog grooming services and add-on products with high service loyalty.',
    logicSummary: 'Customers with 2+ grooming bookings in last 6 months and at least one add-on product purchase per visit.',
    category: 'Upsell',
    channel: 'Omnichannel',
    campaignUsage: 5,
    campaignDetails: { total: 5, active: 2, completed: 3, lastUsedDate: new Date('2026-04-28'), primaryIntent: 'Upsell' },
    lastUpdated: new Date('2026-04-30'),
    estimatedSize: 8600,
    status: 'Active',
    rules: ['Service category = Dog Grooming', 'Booking count >= 2 in 180 days', 'Add-on purchase = true'],
  },
  {
    id: 'PET_003',
    name: 'Pet – Multi-Pet Household Buyers',
    segmentType: 'PET',
    createdBy: 'Alan',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Households purchasing across both cat and dog product categories, indicating multi-pet ownership with high cross-category spend.',
    logicSummary: 'Statistical model detecting cross-species purchase patterns, high basket diversity, and frequent treat and food replenishment.',
    category: 'Cross-Sell',
    channel: 'Omnichannel',
    campaignUsage: 6,
    campaignDetails: { total: 6, active: 3, completed: 3, lastUsedDate: new Date('2026-05-03'), primaryIntent: 'Upsell' },
    lastUpdated: new Date('2026-05-04'),
    estimatedSize: 19500,
    status: 'Active',
    features: ['Dog category spend', 'Cat category spend', 'Basket diversity score', 'Replenishment cycle'],
  },
  {
    id: 'PET_004',
    name: 'Pet – Premium Brand Advocates',
    segmentType: 'PET',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers consistently choosing premium pet food brands (Badlands Ranch, PureVita, KONG) with low discount sensitivity.',
    logicSummary: 'High AOV in pet food category, premium brand purchase rate >70%, and below-average promo redemption.',
    category: 'Retention',
    channel: 'Online',
    campaignUsage: 4,
    campaignDetails: { total: 4, active: 2, completed: 2, lastUsedDate: new Date('2026-04-25'), primaryIntent: 'Retention' },
    lastUpdated: new Date('2026-04-26'),
    estimatedSize: 7800,
    status: 'Active',
    features: ['Brand affinity score', 'Premium purchase rate', 'Avg order value', 'Promo sensitivity'],
  },
  {
    id: 'PET_005',
    name: 'Pet – New Pet Parents',
    segmentType: 'PET',
    createdBy: 'Alan',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Static',
    definitionSummary: 'First-time pet product buyers likely acquiring a new pet, showing broad exploratory purchasing across starter categories.',
    logicSummary: 'Customers with first pet product purchase in last 45 days, 3+ different sub-categories purchased, and no prior pet product history.',
    category: 'Activation',
    channel: 'Online',
    campaignUsage: 3,
    campaignDetails: { total: 3, active: 2, completed: 1, lastUsedDate: new Date('2026-05-05'), primaryIntent: 'Activation' },
    lastUpdated: new Date('2026-05-05'),
    estimatedSize: 5400,
    status: 'Active',
    rules: ['First pet purchase < 45 days ago', 'Sub-categories purchased >= 3', 'Prior pet product orders = 0'],
  },
  {
    id: 'PET_006',
    name: 'Pet – Treat & Toy Impulse Buyers',
    segmentType: 'PET',
    createdBy: 'System',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers with high purchase frequency in treats, toys, and accessories with strong response to BOGO and limited-time offers.',
    logicSummary: 'High-frequency buyers with >60% of orders including treats or toys, elevated CTR on BOGO promotions.',
    category: 'Conversion',
    channel: 'Loyalty',
    campaignUsage: 7,
    campaignDetails: { total: 7, active: 4, completed: 3, lastUsedDate: new Date('2026-05-02'), primaryIntent: 'Conversion' },
    lastUpdated: new Date('2026-05-03'),
    estimatedSize: 11300,
    status: 'Active',
    features: ['Treat purchase rate', 'Toy purchase rate', 'BOGO response rate', 'Impulse order frequency'],
  },
]

const alanSteps = [
  'Understanding business context',
  'Identifying relevant customer signals',
  'Applying selected segmentation method',
  'Designing segment definitions',
  'Validating size & overlap',
  'Classifying static vs dynamic behavior',
  'Finalizing segments',
]

/** Primary CTA styling for Create Segment wizard (matches campaign engine gradient CTAs) */
const WIZARD_PRIMARY_BTN_CLASSNAME =
  'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25 border-0'

export function SegmentLibrary() {
  const { showComingSoon } = useToast()
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS)
  const alanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRulesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter states
  const [creationModeFilter, setCreationModeFilter] = useState<'all' | 'Manual' | 'Alan' | 'System'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'Rule-Based' | 'Statistical'>('all')
  const [natureFilter, setNatureFilter] = useState<'all' | 'Static' | 'Dynamic'>('all')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [campaignUsedFilter, setCampaignUsedFilter] = useState<'all' | 'yes' | 'no'>('all')
  
  const [showFilters, setShowFilters] = useState(false)
  
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
  const [selectedSegmentationType, setSelectedSegmentationType] = useState<string>('')
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
    if (autoRulesTimeoutRef.current) window.clearTimeout(autoRulesTimeoutRef.current)
    setAutoRulesLoading(true)
    autoRulesTimeoutRef.current = window.setTimeout(() => {
      setRuleConditions(getAgentSuggestedRules())
      setAutoRulesGenerated(true)
      setAutoRulesLoading(false)
      autoRulesTimeoutRef.current = null
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
    setSelectedSegmentationType('')
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

  const segmentationTypeLabel = (id: string) =>
    ({
      rfm: 'RFM Analysis',
      lifecycle: 'Lifecycle Stage',
      value: 'Value Tier',
      promo: 'Promo Sensitivity',
      channel: 'Channel Preference',
      category: 'Category Affinity',
    }[id] ?? id)

  const saveManualSegment = (flow: 'rule-based' | 'statistical') => {
    const now = new Date()
    const name = segmentName.trim()
    if (!name) return

    if (flow === 'rule-based') {
      const conditions = ruleConditions.filter((c) => c.field && c.value)
      if (conditions.length === 0) return
      const ruleLines = conditions.map((c) => {
        const fieldLabel =
          FIELD_OPTIONS[selectedSegmentationType]?.find((o) => o.value === c.field)?.label ??
          c.field
        const opLabel =
          OPERATOR_OPTIONS.find((o) => o.value === c.operator)?.label ??
          String(c.operator).replace(/_/g, ' ')
        return `${fieldLabel} ${opLabel} ${c.value}`
      })
      const newSeg: Segment = {
        id: `USER_${Date.now()}`,
        name,
        segmentType: 'DIY',
        createdBy: 'User',
        segmentationMethod: 'Rule-Based',
        segmentNature: segmentNature,
        definitionSummary: `Custom rule-based segment using ${segmentationTypeLabel(selectedSegmentationType)}. ${conditions.length} active condition${conditions.length === 1 ? '' : 's'}.`,
        logicSummary: ruleLines.join('; '),
        category: 'Retention',
        channel: segmentChannel,
        campaignUsage: 0,
        campaignDetails: {
          total: 0,
          active: 0,
          completed: 0,
          lastUsedDate: now,
          primaryIntent: 'Retention',
        },
        lastUpdated: now,
        estimatedSize: 41_250,
        status: 'Active',
        rules: ruleLines,
      }
      setSegments((prev) => [newSeg, ...prev])
    } else {
      const newSeg: Segment = {
        id: `USER_${Date.now()}`,
        name,
        segmentType: 'DIY',
        createdBy: 'User',
        segmentationMethod: 'Statistical',
        segmentNature: segmentNature,
        definitionSummary: `ML clustering (${selectedClusteringAlgorithm}) with ${clusterCount} clusters on ${selectedFeatures.length} behavioral features.`,
        logicSummary: `Algorithm: ${selectedClusteringAlgorithm}. Features: ${selectedFeatures.join(', ')}. Clusters: ${clusterCount}.`,
        category: 'Retention',
        channel: segmentChannel,
        campaignUsage: 0,
        campaignDetails: {
          total: 0,
          active: 0,
          completed: 0,
          lastUsedDate: now,
          primaryIntent: 'Retention',
        },
        lastUpdated: now,
        estimatedSize: 48_500,
        status: 'Active',
        features: [...selectedFeatures],
      }
      setSegments((prev) => [newSeg, ...prev])
    }

    setCreationModeFilter('Manual')
    setCurrentPage(1)
    setShowCreateModal(false)
    resetCreateWizard()
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetCreateWizard()
  }

  useEffect(() => {
    if (!showCreateModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      closeCreateModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCreateModal])

  useEffect(() => {
    if (!showAlanResults) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAlanResults(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAlanResults])

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

  const filteredSegments = segments.filter(segment => {
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

  const totalPagesSegments = Math.max(1, Math.ceil(filteredSegments.length / itemsPerPage))
  const safePageSegments = Math.min(currentPage, totalPagesSegments)
  const startIndex = (safePageSegments - 1) * itemsPerPage
  const paginatedSegments = filteredSegments.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [creationModeFilter, methodFilter, natureFilter, channelFilter, campaignUsedFilter])

  useEffect(() => {
    return () => {
      if (alanIntervalRef.current) clearInterval(alanIntervalRef.current)
      if (autoRulesTimeoutRef.current) window.clearTimeout(autoRulesTimeoutRef.current)
    }
  }, [])

  const rulePreviewEstimate = useMemo(() => {
    const key = ruleConditions
      .filter((c) => c.field && c.value)
      .map((c) => `${c.field}:${c.operator}:${c.value}`)
      .join('|')
    if (!key) return 0
    let hash = 0
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
    return 15_000 + (Math.abs(hash) % 30_000)
  }, [ruleConditions])

  const runAlan = () => {
    if (!alanMethod || !alanNature || !alanBusinessIntent || !alanChannel) return
    if (alanIntervalRef.current) clearInterval(alanIntervalRef.current)
    setAlanRunning(true)
    setAlanCurrentStep(0)
    setShowAlanPanel(false)
    const intentWords = alanBusinessIntent.split(' ').slice(0, 3).join(' ')
    setAlanGeneratedSegmentName(`${intentWords} - ${alanChannel}`)
    alanIntervalRef.current = setInterval(() => {
      setAlanCurrentStep((prev) => {
        if (prev >= alanSteps.length - 1) {
          if (alanIntervalRef.current) clearInterval(alanIntervalRef.current)
          alanIntervalRef.current = null
          setAlanRunning(false)
          setShowAlanInsights(true)
          setShowAlanResults(true)
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  const resetAlanWizard = () => {
    setAlanMethod(null)
    setAlanNature(null)
    setAlanBusinessIntent('')
    setAlanChannel('')
    setAlanTimeWindow('')
    setAlanGeneratedSegmentName('')
  }

  const saveAlanSegmentToLibrary = () => {
    if (!alanMethod || !alanNature || !alanChannel) return
    const name = alanGeneratedSegmentName.trim() || `Alan segment — ${alanChannel}`
    const ch = alanChannel as Segment['channel']
    const now = new Date()
    const newSeg: Segment = {
      id: `ALAN_${Date.now()}`,
      name,
      segmentType: 'DIY',
      createdBy: 'Alan',
      segmentationMethod: alanMethod,
      segmentNature: alanNature,
      definitionSummary:
        `Alan-generated from your intent: "${alanBusinessIntent}". Optimized for ${ch} within ${alanTimeWindow || 'the default lookback window'}.`,
      logicSummary:
        alanMethod === 'Rule-Based'
          ? `Rule set derived from signals matching: ${alanBusinessIntent}. Channel scope: ${ch}.`
          : `Statistical clustering applied to behavioral signals for: ${alanBusinessIntent}. Channel scope: ${ch}.`,
      category: 'Retention',
      channel: ch,
      campaignUsage: 0,
      campaignDetails: {
        total: 0,
        active: 0,
        completed: 0,
        lastUsedDate: now,
        primaryIntent: 'Retention',
      },
      lastUpdated: now,
      estimatedSize: 32_450,
      status: 'Active',
      ...(alanMethod === 'Rule-Based'
        ? { rules: ['Rules compiled by Alan — review in segment details'] }
        : {
            features: ['Engagement signals', 'Purchase recency', 'Channel affinity', 'Intent alignment'],
          }),
    }
    setSegments((prev) => [newSeg, ...prev])
    setCreationModeFilter('Alan')
    setChannelFilter('All Channels')
    setCurrentPage(1)
    setShowAlanResults(false)
    setShowAlanInsights(false)
    resetAlanWizard()
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
            <AgentFlowPanel
              className="mb-6"
              title="Alan is creating segments…"
              subtitle="This may take a moment"
              steps={stepsFromProgress(alanSteps, alanCurrentStep)}
            />
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
                    <Select
                      value={creationModeFilter === 'all' ? '' : creationModeFilter}
                      onChange={(val) => {
                        setCreationModeFilter((val || 'all') as 'all' | 'Manual' | 'Alan' | 'System')
                        setCurrentPage(1)
                      }}
                      options={['Manual', 'Alan', 'System']}
                      placeholder="All Modes"
                      withPortal
                      searchable={false}
                    />
                  </div>

                  {/* Segmentation Method */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Segmentation Method</label>
                    <Select
                      value={methodFilter === 'all' ? '' : methodFilter}
                      onChange={(val) => {
                        setMethodFilter((val || 'all') as 'all' | 'Rule-Based' | 'Statistical')
                        setCurrentPage(1)
                      }}
                      options={['Rule-Based', 'Statistical']}
                      placeholder="All Methods"
                      withPortal
                      searchable={false}
                    />
                  </div>

                  {/* Segment Nature */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Segment Nature</label>
                    <Select
                      value={natureFilter === 'all' ? '' : natureFilter}
                      onChange={(val) => {
                        setNatureFilter((val || 'all') as 'all' | 'Static' | 'Dynamic')
                        setCurrentPage(1)
                      }}
                      options={['Static', 'Dynamic']}
                      placeholder="All Natures"
                      withPortal
                      searchable={false}
                    />
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Channel</label>
                    <Select
                      value={channelFilter === 'All Channels' ? '' : channelFilter}
                      onChange={(val) => {
                        setChannelFilter(val || 'All Channels')
                        setCurrentPage(1)
                      }}
                      options={['Loyalty', 'Omnichannel', 'Online']}
                      placeholder="All Channels"
                      withPortal
                      searchable={false}
                    />
                  </div>

                  {/* Used in Campaign */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Used in Campaign</label>
                    <Select
                      value={campaignUsedFilter === 'all' ? '' : campaignUsedFilter}
                      onChange={(val) => {
                        setCampaignUsedFilter((val || 'all') as 'all' | 'yes' | 'no')
                        setCurrentPage(1)
                      }}
                      options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                      placeholder="All"
                      withPortal
                      searchable={false}
                    />
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Row */}
        <div className="flex items-center justify-end mb-6">
          <Button variant="outlined" className="gap-2" onClick={() => showComingSoon('Export')}>
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
                      <td className="px-4 py-3"><p className="text-sm text-text-secondary line-clamp-2" title={segment.definitionSummary}>{segment.definitionSummary}</p></td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.channel}</td>
                      <td className="px-4 py-3 text-center text-sm text-text-primary font-medium">{segment.campaignUsage}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.lastUpdated.toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="tertiary" size="small" aria-label={`View ${segment.name}`} onClick={() => setSelectedSegment(segment)}><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredSegments.length > 0 && (() => {
            const totalPagesLocal = Math.max(1, Math.ceil(filteredSegments.length / itemsPerPage))
            const safePage = Math.min(currentPage, totalPagesLocal)
            const pageWindow: (number | '…')[] = []
            if (totalPagesLocal <= 7) {
              for (let i = 1; i <= totalPagesLocal; i++) pageWindow.push(i)
            } else {
              const left = Math.max(2, safePage - 1)
              const right = Math.min(totalPagesLocal - 1, safePage + 1)
              pageWindow.push(1)
              if (left > 2) pageWindow.push('…')
              for (let i = left; i <= right; i++) pageWindow.push(i)
              if (right < totalPagesLocal - 1) pageWindow.push('…')
              pageWindow.push(totalPagesLocal)
            }
            return (
              <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between gap-4">
                <p className="text-sm text-text-secondary whitespace-nowrap">
                  Showing{' '}
                  <span className="font-semibold text-text-primary">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSegments.length)}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-text-primary">{filteredSegments.length}</span>
                  {' '}segments
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={cn(
                      'flex items-center gap-1 px-3 h-8 rounded-lg text-sm font-medium border transition-all',
                      safePage === 1
                        ? 'border-border text-text-muted cursor-not-allowed opacity-40'
                        : 'border-border text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /><span>Prev</span>
                  </button>
                  <div className="flex items-center gap-1 mx-1">
                    {pageWindow.map((p, idx) =>
                      p === '…' ? (
                        <span key={`el-${idx}`} className="w-8 text-center text-sm text-text-muted select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={cn(
                            'w-8 h-8 text-sm font-medium rounded-lg transition-all border',
                            safePage === p
                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                              : 'border-border text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                          )}
                        >{p}</button>
                      )
                    )}
                  </div>
                  <button
                    disabled={safePage === totalPagesLocal}
                    onClick={() => setCurrentPage(p => Math.min(totalPagesLocal, p + 1))}
                    className={cn(
                      'flex items-center gap-1 px-3 h-8 rounded-lg text-sm font-medium border transition-all',
                      safePage === totalPagesLocal
                        ? 'border-border text-text-muted cursor-not-allowed opacity-40'
                        : 'border-border text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    <span>Next</span><ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </main>

      {/* Create Segment Modal - Multi-step Wizard */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            key="create-segment-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            className="fixed inset-0 z-[450] flex min-h-[100dvh] justify-center items-start pt-24 sm:pt-28 px-4 pb-12 bg-black/45 overflow-y-auto backdrop-blur-[2px]"
            onClick={closeCreateModal}
          >
            <motion.div
              key="create-segment-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-segment-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative self-start mx-auto w-full max-w-2xl bg-surface rounded-2xl shadow-2xl mt-1 sm:mt-2 mb-10 max-h-[min(90vh,calc(100vh-56px-3rem))] flex flex-col overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 id="create-segment-title" className="font-semibold text-text-primary text-lg">Create New Segment</h3>
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
                <button onClick={closeCreateModal} type="button" aria-label="Close" className="p-2 hover:bg-surface-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              {createStep > 1 && (
                <div className="px-6 pt-3 pb-2 border-b border-border/60 shrink-0 bg-surface">
                  {selectedMethod === 'rule-based' ? (
                    <div className="space-y-2">
                      <div className="flex items-center w-full gap-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <Fragment key={step}>
                            <div className="flex flex-col items-center flex-1 min-w-0">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200',
                                  step < createStep
                                    ? 'bg-primary text-white'
                                    : step === createStep
                                      ? 'bg-primary text-white ring-2 ring-primary/25 ring-offset-2 ring-offset-surface'
                                      : 'bg-surface-tertiary text-text-muted'
                                )}
                              >
                                {step < createStep ? <Check className="w-3.5 h-3.5" /> : step}
                              </div>
                              <span className="mt-1.5 text-[10px] text-text-muted text-center leading-tight px-0.5 hidden sm:block">
                                {(['Method', 'Type', 'Rules', 'Details', 'Save'] as const)[step - 1]}
                              </span>
                            </div>
                            {step < 5 && (
                              <div
                                className={cn(
                                  'h-0.5 flex-1 min-w-2 mx-1 rounded-full self-start mt-4 transition-colors duration-200',
                                  step < createStep ? 'bg-primary' : 'bg-surface-tertiary'
                                )}
                              />
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 sm:hidden text-[10px] text-text-muted">
                        {(['Method', 'Type', 'Rules', 'Details', 'Save'] as const).map((lbl) => (
                          <span key={lbl} className="flex-1 text-center min-w-0 leading-tight">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center w-full gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <Fragment key={step}>
                            <div className="flex flex-col items-center flex-1 min-w-0">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200',
                                  step < createStep
                                    ? 'bg-primary text-white'
                                    : step === createStep
                                      ? 'bg-primary text-white ring-2 ring-primary/25 ring-offset-2 ring-offset-surface'
                                      : 'bg-surface-tertiary text-text-muted'
                                )}
                              >
                                {step < createStep ? <Check className="w-4 h-4" /> : step}
                              </div>
                              <span className="mt-1.5 text-[10px] text-text-muted text-center leading-tight px-0.5 hidden sm:block">
                                {(['Method', 'Configure', 'Details', 'Save'] as const)[step - 1]}
                              </span>
                            </div>
                            {step < 4 && (
                              <div
                                className={cn(
                                  'h-0.5 flex-1 min-w-3 mx-1 rounded-full self-start mt-4 transition-colors duration-200',
                                  step < createStep ? 'bg-primary' : 'bg-surface-tertiary'
                                )}
                              />
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 sm:hidden text-[10px] text-text-muted">
                        {(['Method', 'Configure', 'Details', 'Save'] as const).map((lbl) => (
                          <span key={lbl} className="flex-1 text-center min-w-0 leading-tight">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto min-h-0">

              {/* Step 1: Choose Method */}
              {createStep === 1 && (
                <div className="p-6">
                  <h4 className="text-center text-lg font-semibold text-text-primary mb-2">How would you like to create this segment?</h4>
                  <p className="text-center text-text-secondary mb-6">Choose a segmentation method based on your needs</p>
                  
                  <div className="space-y-4">
                    <button type="button" onClick={() => { setSelectedMethod('rule-based'); setCreateStep(2) }}
                      className="w-full p-5 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all duration-200 shadow-sm hover:shadow-md">
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

                    <button type="button" onClick={() => { setSelectedMethod('statistical'); setCreateStep(2) }}
                      className="w-full p-5 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all duration-200 shadow-sm hover:shadow-md">
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
                      <button type="button" key={type.id} onClick={() => setSelectedSegmentationType(type.id)}
                        className={cn('p-4 rounded-xl border text-left transition-all duration-200 shadow-sm hover:shadow',
                          selectedSegmentationType === type.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md' : 'border-border hover:border-primary/50 hover:bg-surface-secondary')}>
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
                    <Button variant="tertiary" onClick={() => { setCreateStep(1); setSelectedMethod(null); setSelectedSegmentationType('') }}>Back</Button>
                    <Button variant="primary" disabled={!selectedSegmentationType} className={WIZARD_PRIMARY_BTN_CLASSNAME} onClick={() => setCreateStep(3)}>
                      Continue
                    </Button>
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
                      <button type="button" key={algo.id} onClick={() => setSelectedClusteringAlgorithm(algo.id)}
                        className={cn('p-4 rounded-xl border text-left transition-all duration-200 shadow-sm hover:shadow',
                          selectedClusteringAlgorithm === algo.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50')}>
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
                        className={cn('p-3 rounded-lg border transition-all flex items-center justify-between',
                          selectedFeatures.includes(feature.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
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
                    <Button variant="primary" className={WIZARD_PRIMARY_BTN_CLASSNAME} onClick={() => setCreateStep(3)}>
                      Continue
                    </Button>
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
                    <div className="py-12">
                      <AgentFlowOrb label="AI is analyzing your data..." />
                      <p className="text-xs text-text-secondary text-center mt-2">Generating optimal rules for {selectedSegmentationType?.replace('-', ' ')} segmentation</p>
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
                        <div
                          key={index}
                          className="flex gap-5 items-start segment-wizard-select rounded-xl border border-border/70 bg-surface-secondary/50 p-4 shadow-sm"
                        >
                          <div className="w-[5rem] shrink-0 flex flex-col items-end justify-start gap-1 pt-1">
                            {index > 0 ? (
                              <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                                AND
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                                If
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div className="min-w-0 w-full">
                              <Select
                                value={condition.field}
                                onChange={(val) => updateRuleCondition(index, 'field', val)}
                                options={FIELD_OPTIONS[selectedSegmentationType] ?? []}
                                placeholder="Select field..."
                                withPortal
                                clearable={false}
                              />
                            </div>
                            <div className="min-w-0 w-full">
                              <Select
                                value={condition.operator || 'equals'}
                                onChange={(val) => updateRuleCondition(index, 'operator', val)}
                                options={OPERATOR_OPTIONS}
                                placeholder="Equals"
                                withPortal
                                searchable={false}
                                clearable={false}
                              />
                            </div>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateRuleCondition(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                              className="min-w-0 w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                            />
                          </div>
                          {ruleConditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRuleCondition(index)}
                              className="p-2 shrink-0 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg self-start"
                              aria-label="Remove condition"
                            >
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
                        <div
                          key={index}
                          className="flex gap-5 items-start segment-wizard-select rounded-xl border border-border/70 bg-surface-secondary/50 p-4 shadow-sm"
                        >
                          <div className="w-[5rem] shrink-0 flex flex-col items-end justify-start gap-1 pt-1">
                            {index > 0 ? (
                              <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                                AND
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                                If
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div className="min-w-0 w-full">
                              <Select
                                value={condition.field}
                                onChange={(val) => updateRuleCondition(index, 'field', val)}
                                options={FIELD_OPTIONS[selectedSegmentationType] ?? []}
                                placeholder="Select field..."
                                withPortal
                                clearable={false}
                              />
                            </div>
                            <div className="min-w-0 w-full">
                              <Select
                                value={condition.operator || 'equals'}
                                onChange={(val) => updateRuleCondition(index, 'operator', val)}
                                options={OPERATOR_OPTIONS}
                                placeholder="Equals"
                                withPortal
                                searchable={false}
                                clearable={false}
                              />
                            </div>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateRuleCondition(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                              className="min-w-0 w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                            />
                          </div>
                          {ruleConditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRuleCondition(index)}
                              className="p-2 shrink-0 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg self-start"
                              aria-label="Remove condition"
                            >
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
                          ✓ Estimated segment size: ~{formatNumber(rulePreviewEstimate)} customers
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="tertiary" onClick={() => { setCreateStep(2); setRuleDefinitionMode(null); setAutoRulesGenerated(false) }}>Back</Button>
                    <Button
                      variant="primary"
                      className={WIZARD_PRIMARY_BTN_CLASSNAME}
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
                    <Button variant="primary" className={WIZARD_PRIMARY_BTN_CLASSNAME} disabled={!segmentName.trim()} onClick={() => setCreateStep(4)}>
                      Continue
                    </Button>
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
                    <Button variant="primary" className={WIZARD_PRIMARY_BTN_CLASSNAME} disabled={!segmentName.trim()} onClick={() => setCreateStep(5)}>
                      Continue
                    </Button>
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
                    <Button
                      variant="primary"
                      className={WIZARD_PRIMARY_BTN_CLASSNAME}
                      disabled={!segmentName.trim()}
                      onClick={() => saveManualSegment('statistical')}
                    >
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

                  <div className="mt-6 pt-6 border-t border-border flex justify-between gap-3">
                    <Button variant="tertiary" onClick={() => setCreateStep(4)}>Back</Button>
                    <Button
                      variant="primary"
                      className={WIZARD_PRIMARY_BTN_CLASSNAME}
                      disabled={!segmentName.trim()}
                      onClick={() => saveManualSegment('rule-based')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </div>
              )}
            </div>
            </motion.div>
          </motion.div>
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
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Channel <span className="text-danger">*</span></label>
                  <Select
                    value={alanChannel}
                    onChange={setAlanChannel}
                    options={['Online', 'Loyalty', 'Omnichannel']}
                    placeholder="Select channel..."
                    withPortal
                    searchable={false}
                  />
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

      {/* Alan Results — anchored below app header (56px + breadcrumbs strip), not vertically centered */}
      <AnimatePresence>
        {showAlanResults && (
          <div
            role="presentation"
            className="fixed inset-0 z-[450] flex justify-center items-start pt-28 px-4 pb-10 bg-black/45 overflow-y-auto backdrop-blur-[2px]"
            onClick={() => setShowAlanResults(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="alan-generated-segment-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl mt-2 mb-8 max-h-[min(90vh,calc(100vh-56px-3rem))] flex flex-col overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-agent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-agent" />
                  </div>
                  <div id="alan-generated-segment-title">
                    <h3 className="font-semibold text-text-primary text-lg">Alan Generated Segment</h3>
                    <p className="text-sm text-text-secondary">Review the segment before saving</p>
                  </div>
                </div>
                <button onClick={() => setShowAlanResults(false)} className="p-2 hover:bg-surface-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
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
                    onClick={() => {
                      setShowAlanResults(false)
                      setShowAlanInsights(false)
                      resetAlanWizard()
                    }}
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
                    onClick={saveAlanSegmentToLibrary}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Segment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
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
                    <Button variant="outlined" className="justify-start" onClick={() => showComingSoon('Edit segment')}><Edit3 className="w-4 h-4 mr-2" />Edit Segment</Button>
                    <Button variant="outlined" className="justify-start" onClick={() => showComingSoon('Duplicate segment')}><Copy className="w-4 h-4 mr-2" />Duplicate Segment</Button>
                    <Button variant="outlined" className="justify-start text-warning hover:text-warning" onClick={() => showComingSoon('Archive segment')}><Archive className="w-4 h-4 mr-2" />Archive Segment</Button>
                  </div>
                </div>
              </div>
        </>)}
      </Panel>
    </div>
  )
}
