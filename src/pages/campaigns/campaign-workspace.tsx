import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Check, Sparkles, TrendingUp, Users, 
  Package, Tag, Palette, Rocket, Edit3, RefreshCw, CheckCircle,
  ChevronRight, ChevronDown, Shield, Target, Zap, Eye,
  Calendar, BarChart3, ArrowRight,
  Pause, MoreHorizontal, Copy, Trash2, FileText,
  Save, LogOut, ArrowLeft, Archive
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { Loader } from '@/components/ui/loader'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Tooltip } from 'impact-ui/src/components/Tooltip/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Tabs } from 'impact-ui/src/components/Tabs/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Modal } from 'impact-ui/src/components/Modal/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Panel } from 'impact-ui/src/components/Panel/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { AccordionModern } from 'impact-ui/src/components/AccordionModern/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Switch } from 'impact-ui/src/components/Switch/index.js'
import { cn } from '@/lib/utils'

// Global Data Standardization - Single Source of Truth for Categories & SKUs
import { 
  getProductGroupsByClient,
  handleImageError,
  PLACEHOLDER_IMAGE 
} from '@/data/product-data'

type CampaignStep = 'context' | 'segment' | 'product' | 'promo' | 'creative' | 'review'
type CampaignStatus = 'draft' | 'active' | 'scheduled' | 'completed'

interface StepState {
  status: 'pending' | 'thinking' | 'ready' | 'approved' | 'needs-rerun'
  completedAt?: Date
}

interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  currentStep: CampaignStep
  currentSubStep?: string
  lockedSteps: CampaignStep[]
  stepStates: Record<CampaignStep, StepState>
  goal: string
  selectedGoalId?: string  // ID of the selected business goal playbook
  category: string | null
  detectedCategories?: string[]  // All categories detected from goal text
  channel: string | null
  region: string | null
  lookbackWindow: string
  client?: 'autoparts'  // Client identifier
  // Audit info
  createdBy: string
  createdAt: Date
  lastSavedAt: Date
  lastSavedBy: string
  lastModifiedAt: Date
  lastModifiedBy: string
  // Campaign dates
  startDate?: Date
  endDate?: Date
  // Data snapshot
  dataSnapshotAt?: Date
  customerUniverseSize?: number
  skuUniverseSize?: number
  // Progress
  progressPercent: number
  completedStepsCount: number
  // Blocking items
  blockingItems?: string[]
  // Linked promos
  linkedPromoIds?: string[]
  derivedContext?: {
    campaignType: string
    campaignName: string
    detectedCategories?: string[]
    risks: string[]
    guardrails: string[]
    estimatedUniverse: number
    marginProtection: string | null
    seasonality: string | null
    assumptions: { key: string; value: string; isAssumed: boolean }[]
  }
  audienceStrategy?: {
    segments: { id: string; name: string; size: number; percentage: number; description: string; logic: string; rules?: string[] }[]
    totalCoverage: number
    segmentationLayers: { name: string; type: 'rule-based' | 'statistical' }[]
  }
  offerMapping?: {
    segmentId: string
    segmentName: string
    productGroup: string
    promotion: string
    promoId?: string
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
  promoSkipped?: boolean
}

const STEPS: { id: CampaignStep; label: string; icon: React.ElementType }[] = [
  { id: 'context', label: 'Context', icon: Target },
  { id: 'segment', label: 'Segments', icon: Users },
  { id: 'product', label: 'Products', icon: Package },
  { id: 'promo', label: 'Promos', icon: Tag },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'review', label: 'Review', icon: Rocket },
]

const createDefaultStepStates = (): Record<CampaignStep, StepState> => ({
  context: { status: 'pending' },
  segment: { status: 'pending' },
  product: { status: 'pending' },
  promo: { status: 'pending' },
  creative: { status: 'pending' },
  review: { status: 'pending' },
})

// Mock draft campaigns for demo - Auto Parts Domain
const MOCK_DRAFTS: Campaign[] = [
  {
    id: 'CAMP-001',
    name: 'Winter Vehicle Prep',
    status: 'draft',
    currentStep: 'promo',
    lockedSteps: ['context', 'segment', 'product'],
    stepStates: {
      context: { status: 'approved', completedAt: new Date('2026-03-15') },
      segment: { status: 'approved', completedAt: new Date('2026-03-16') },
      product: { status: 'approved', completedAt: new Date('2026-03-16') },
      promo: { status: 'ready' },
      creative: { status: 'pending' },
      review: { status: 'pending' },
    },
    goal: 'Drive winter maintenance sales for Oil, Filters, and Wipers while protecting margin on premium brands',
    category: 'Oil and Lubricants',
    detectedCategories: ['Oil and Lubricants', 'Filters and PCV', 'Wipers and Related'],
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 6 months',
    client: 'autoparts',
    createdBy: 'John Doe',
    createdAt: new Date('2026-03-15T09:30:00'),
    lastSavedAt: new Date('2026-03-17T07:10:00'),
    lastSavedBy: 'John Doe',
    lastModifiedAt: new Date('2026-03-17T07:10:00'),
    lastModifiedBy: 'John Doe',
    customerUniverseSize: 680000,
    skuUniverseSize: 320,
    progressPercent: 50,
    completedStepsCount: 3,
    derivedContext: {
      campaignType: 'Seasonal Maintenance',
      campaignName: 'Winter Vehicle Prep',
      risks: ['Margin dilution on synthetic oil', 'Overstock on wiper blades post-season'],
      guardrails: ['Cap discount at 20% for Mobil 1', 'Bundle oil + filter for margin protection', 'Free shipping over $50'],
      estimatedUniverse: 680000,
      marginProtection: 'Enabled',
      seasonality: 'Winter Prep',
      assumptions: [
        { key: 'Channel', value: 'Omni (DIY Online + PRO Store)', isAssumed: false },
        { key: 'Discount Strategy', value: 'Tiered: Maintenance 10-20%', isAssumed: true },
        { key: 'Product Scope', value: 'Oil, Filters, Wipers — Fitment validated', isAssumed: true },
        { key: 'Urgency', value: 'Seasonal (Winter prep)', isAssumed: true },
      ]
    },
    audienceStrategy: {
      segments: [
        { id: 'seg-cat-1', name: 'DIY Routine Maintenance Buyers', size: 145000, percentage: 24.5, description: 'Regular oil change & filter buyers, 3-6 month cycle, prefer online ordering', logic: 'statistical' },
        { id: 'seg-cat-2', name: 'DIY Routine Maintenance Buyers', size: 132000, percentage: 26.8, description: 'Regular filter replacements during oil changes, buy combos', logic: 'statistical' },
        { id: 'seg-cat-3', name: 'DIY Routine Maintenance Buyers', size: 118000, percentage: 28.2, description: 'Seasonal wiper replacements, prefer online purchase + pickup', logic: 'statistical' },
      ],
      totalCoverage: 79.5,
      segmentationLayers: [
        { name: 'Customer Type (PRO/DIY)', type: 'rule-based' },
        { name: 'Purchase Recency', type: 'rule-based' },
        { name: 'Category Affinity', type: 'statistical' },
        { name: 'Vehicle Age Bucket', type: 'rule-based' },
      ]
    }
  },
  {
    id: 'CAMP-002',
    name: 'Brake System Clearance',
    status: 'draft',
    currentStep: 'segment',
    lockedSteps: ['context'],
    stepStates: {
      context: { status: 'approved', completedAt: new Date('2026-03-14') },
      segment: { status: 'thinking' },
      product: { status: 'pending' },
      promo: { status: 'pending' },
      creative: { status: 'pending' },
      review: { status: 'pending' },
    },
    goal: 'Clear overstock brake pads and rotors while cross-selling brake fluid to PRO and DIY segments',
    category: 'Braking',
    detectedCategories: ['Braking'],
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 90 days',
    client: 'autoparts',
    createdBy: 'Sarah Chen',
    createdAt: new Date('2026-03-14T14:20:00'),
    lastSavedAt: new Date('2026-03-16T16:45:00'),
    lastSavedBy: 'Sarah Chen',
    lastModifiedAt: new Date('2026-03-16T16:45:00'),
    lastModifiedBy: 'Sarah Chen',
    customerUniverseSize: 450000,
    progressPercent: 17,
    completedStepsCount: 1,
  }
]

const MOCK_ACTIVE: Campaign[] = [
  {
    id: 'CAMP-003',
    name: 'Battery Season Push',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Drive battery replacement sales targeting vehicles 3+ years old before winter',
    category: 'Battery and Electrical',
    detectedCategories: ['Battery and Electrical'],
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 90 days',
    client: 'autoparts',
    createdBy: 'John Doe',
    createdAt: new Date('2026-02-01'),
    lastSavedAt: new Date('2026-02-10'),
    lastSavedBy: 'John Doe',
    lastModifiedAt: new Date('2026-02-10'),
    lastModifiedBy: 'John Doe',
    startDate: new Date('2026-02-15'),
    endDate: new Date('2026-03-31'),
    customerUniverseSize: 320000,
    progressPercent: 100,
    completedStepsCount: 6,
  },
  {
    id: 'CAMP-004',
    name: 'PRO Fleet Oil Program',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Bulk oil and filter program for fleet operators with volume pricing',
    category: 'Oil and Lubricants',
    detectedCategories: ['Oil and Lubricants', 'Filters and PCV'],
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 60 days',
    client: 'autoparts',
    createdBy: 'Maria Lopez',
    createdAt: new Date('2026-02-05'),
    lastSavedAt: new Date('2026-02-12'),
    lastSavedBy: 'Maria Lopez',
    lastModifiedAt: new Date('2026-02-12'),
    lastModifiedBy: 'Maria Lopez',
    startDate: new Date('2026-02-10'),
    endDate: new Date('2026-04-25'),
    customerUniverseSize: 95000,
    progressPercent: 100,
    completedStepsCount: 6,
  },
  {
    id: 'CAMP-005',
    name: 'Summer Road Trip Prep',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Drive coolant, AC, and tire care sales ahead of summer road trip season',
    category: 'Cooling and Heating',
    detectedCategories: ['Cooling and Heating'],
    channel: 'online',
    region: 'All US',
    lookbackWindow: 'Last 90 days',
    client: 'autoparts',
    createdBy: 'James Wilson',
    createdAt: new Date('2026-03-03'),
    lastSavedAt: new Date('2026-03-11'),
    lastSavedBy: 'James Wilson',
    lastModifiedAt: new Date('2026-03-11'),
    lastModifiedBy: 'James Wilson',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-06-30'),
    customerUniverseSize: 410000,
    progressPercent: 100,
    completedStepsCount: 6,
  },
  {
    id: 'CAMP-006',
    name: 'Emergency Brake Restock',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Target PRO shops needing emergency brake parts restock with fast delivery',
    category: 'Braking',
    detectedCategories: ['Braking'],
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 30 days',
    client: 'autoparts',
    createdBy: 'Keisha Brown',
    createdAt: new Date('2026-03-02'),
    lastSavedAt: new Date('2026-03-09'),
    lastSavedBy: 'Keisha Brown',
    lastModifiedAt: new Date('2026-03-09'),
    lastModifiedBy: 'Keisha Brown',
    startDate: new Date('2026-03-05'),
    endDate: new Date('2026-04-28'),
    customerUniverseSize: 72000,
    progressPercent: 100,
    completedStepsCount: 6,
  }
]

const deriveContext = (goal: string, category: string, channel?: string, _client?: 'autoparts') => {
  const lowerGoal = goal.toLowerCase()
  
  // 1. Intent Type Detection
  const isMaintenance = lowerGoal.includes('maintenance') || lowerGoal.includes('oil change') || lowerGoal.includes('routine')
  const isRepair = lowerGoal.includes('repair') || lowerGoal.includes('replace') || lowerGoal.includes('fix')
  const isEmergency = lowerGoal.includes('emergency') || lowerGoal.includes('urgent') || lowerGoal.includes('restock')
  const isUpgrade = lowerGoal.includes('upgrade') || lowerGoal.includes('performance') || lowerGoal.includes('premium')
  const isSeasonal = lowerGoal.includes('winter') || lowerGoal.includes('summer') || lowerGoal.includes('season')
  const isClearance = lowerGoal.includes('clear') || lowerGoal.includes('overstock') || lowerGoal.includes('excess')
  
  // 2. Vehicle Context Detection
  const isFleet = lowerGoal.includes('fleet')
  const isPRO = lowerGoal.includes('pro') || lowerGoal.includes('shop') || isFleet
  
  // 3. Product Category Mapping — detect ALL mentioned categories
  const categoryDetectors: { keywords: string[]; category: string }[] = [
    { keywords: ['oil', 'lubricant', 'synthetic'], category: 'Oil and Lubricants' },
    { keywords: ['brake', 'pad', 'rotor'], category: 'Braking' },
    { keywords: ['filter', 'pcv', 'air filter'], category: 'Filters and PCV' },
    { keywords: ['wiper', 'washer'], category: 'Wipers and Related' },
    { keywords: ['battery', 'electrical', 'starter'], category: 'Battery and Electrical' },
    { keywords: ['coolant', 'heating', 'thermostat'], category: 'Cooling and Heating' },
    { keywords: ['ignition', 'spark', 'coil'], category: 'Ignition and Tune Up' },
    { keywords: ['exhaust', 'emission'], category: 'Exhaust and Emissions' },
    { keywords: ['steering', 'suspension'], category: 'Steering and Suspension' },
    { keywords: ['light', 'bulb', 'headlight'], category: 'Lighting' },
  ]
  const detectedCategories: string[] = []
  for (const detector of categoryDetectors) {
    if (detector.keywords.some(kw => lowerGoal.includes(kw))) {
      detectedCategories.push(detector.category)
    }
  }
  // Fallback: use provided category or default
  if (detectedCategories.length === 0) detectedCategories.push(category || 'Oil and Lubricants')
  const derivedCategory = detectedCategories[0]
  
  // 4. Urgency Level
  const urgency = isEmergency ? 'Emergency' : (isSeasonal || lowerGoal.includes('mileage') || lowerGoal.includes('fail')) ? 'Triggered' : 'Planned'
  
  // 5. Channel Strategy: DIY → Online-first, PRO → Omni + Store priority
  const channelStrategy = isPRO ? 'Omni (PRO Store Priority)' : 'Online-first (DIY)'
  
  // Determine campaign type and name
  let campaignType = 'Maintenance Campaign'
  let campaignName = `${derivedCategory} Campaign`
  
  if (isEmergency) {
    campaignType = 'Emergency Restock'
    campaignName = `${derivedCategory} Emergency Restock`
  } else if (isClearance) {
    campaignType = 'Clearance Push'
    campaignName = `${derivedCategory} Clearance Campaign`
  } else if (isSeasonal) {
    const season = lowerGoal.includes('winter') ? 'Winter' : 'Summer'
    campaignType = `Seasonal Prep (${season})`
    campaignName = `${season} ${derivedCategory} Prep`
  } else if (isUpgrade) {
    campaignType = 'Performance Upgrade'
    campaignName = `${derivedCategory} Upgrade Campaign`
  } else if (isRepair) {
    campaignType = 'Repair Campaign'
    campaignName = `${derivedCategory} Repair Campaign`
  } else if (isMaintenance) {
    campaignType = 'Routine Maintenance'
    campaignName = `${derivedCategory} Maintenance Campaign`
  }
  
  // Derive risks and guardrails
  let risks: string[] = []
  let guardrails: string[] = []
  
  if (isClearance) {
    risks = ['Margin dilution on clearance SKUs', 'Brand perception risk on premium parts', 'Cannibalization of full-price inventory']
    guardrails = ['40%+ discount only on overstock SKUs', 'Exclude new product launches', 'Min margin: 15%', 'Vehicle fitment validation required']
  } else if (isEmergency) {
    risks = ['Supply chain constraints on fast-moving parts', 'Competitor pricing on urgent repairs', 'PRO stock-out risk']
    guardrails = ['Prioritize high-availability SKUs', 'Same-day pickup required', 'Margin floor at 20%']
  } else if (isSeasonal) {
    risks = ['Post-season overstock on seasonal items', 'Weather-dependent demand variance', 'Cross-category cannibalization']
    guardrails = ['Bundle seasonal items for margin protection', 'Free shipping over $50', 'Cap discount at 20% on premium brands']
  } else if (isPRO) {
    risks = ['Volume discount margin erosion', 'Contract pricing complexity', 'Inventory allocation conflicts']
    guardrails = ['Volume discount tiers with margin floors', 'Contract pricing requires min order', 'Priority stock allocation for PRO']
  } else {
    risks = ['DIY segment price sensitivity', 'Competitor online pricing pressure', 'Fitment accuracy for vehicle-specific parts']
    guardrails = ['Tiered discounts: 10-20% for maintenance', 'Bundle enforcement for margin protection', 'Fitment validation mandatory']
  }
  
  return {
    campaignType,
    campaignName,
    detectedCategories,
    risks,
    guardrails,
    estimatedUniverse: Math.floor(Math.random() * 200000) + 200000,
    marginProtection: lowerGoal.includes('margin') || lowerGoal.includes('protect') ? 'Enabled' : isClearance ? 'Threshold-based' : null,
    seasonality: isSeasonal ? (lowerGoal.includes('winter') ? 'Winter Prep' : 'Summer Prep') : null,
    assumptions: [
      { key: 'Channel', value: channel || channelStrategy, isAssumed: !channel },
      { key: 'Discount Strategy', value: isClearance ? 'Clearance: 40%+' : isRepair ? 'Competitive: 20-35%' : 'Maintenance: 10-20%', isAssumed: true },
      { key: 'Product Scope', value: `${detectedCategories.join(', ')} — Fitment validated`, isAssumed: true },
      { key: 'Vehicle Fitment', value: 'Include only compatible SKUs', isAssumed: true },
      { key: 'Urgency', value: urgency, isAssumed: urgency === 'Planned' },
      { key: 'Customer Split', value: isPRO ? 'PRO-focused' : 'DIY + PRO', isAssumed: true },
    ]
  }
}

// Auto Parts Category Segments — PRO/DIY MECE Structure
const CATEGORY_SEGMENTS: Record<string, { id: string; name: string; size: number; percentage: number; description: string; logic: string }[]> = {
  'Oil and Lubricants': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 145000, percentage: 24.5, description: 'Regular oil change & filter buyers, 3-6 month cycle, prefer online ordering', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Price-Sensitive Promo Buyers', size: 82000, percentage: 13.9, description: 'Wait for promotions, buy bulk synthetic oil when discounted', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 68000, percentage: 11.5, description: 'Independent repair shops with high-frequency bulk orders', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 42000, percentage: 7.1, description: 'Fleet maintenance teams needing scheduled bulk deliveries', logic: 'rule-based' },
  ],
  'Braking': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 98000, percentage: 22.1, description: 'Vehicle owners doing scheduled brake pad replacements, prefer kits', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Urgent Repair Buyers', size: 62000, percentage: 14.0, description: 'Failure-signal triggered buyers needing immediate brake parts', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 85000, percentage: 19.2, description: 'Brake specialist shops with high volume pad & rotor orders', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Emergency Restock Buyers', size: 38000, percentage: 8.6, description: 'Shops needing same-day brake parts for urgent repairs', logic: 'rule-based' },
  ],
  'Filters and PCV': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 132000, percentage: 26.8, description: 'Regular filter replacements during oil changes, buy combos', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY First-Time Fixers', size: 45000, percentage: 9.1, description: 'New vehicle owners learning basic maintenance, need guidance', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 72000, percentage: 14.6, description: 'Shops ordering bulk filters across multiple fitments', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 51000, percentage: 10.3, description: 'Fleet teams with standardized filter programs', logic: 'rule-based' },
  ],
  'Wipers and Related': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 118000, percentage: 28.2, description: 'Seasonal wiper replacements, prefer online purchase + pickup', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Price-Sensitive Promo Buyers', size: 67000, percentage: 16.0, description: 'Buy wipers only when on promotion or bundled', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 48000, percentage: 11.5, description: 'Service centers offering wiper replacement as add-on service', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 35000, percentage: 8.4, description: 'Fleet maintenance teams with bulk wiper programs', logic: 'rule-based' },
  ],
  'Battery and Electrical': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 89000, percentage: 20.4, description: 'Proactive battery replacers based on age/mileage signals', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Urgent Repair Buyers', size: 105000, percentage: 24.1, description: 'Emergency battery failures needing same-day replacement', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 62000, percentage: 14.2, description: 'Repair shops with consistent battery & alternator orders', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Emergency Restock Buyers', size: 45000, percentage: 10.3, description: 'Shops needing emergency battery stock during cold snaps', logic: 'rule-based' },
  ],
  'Cooling and Heating': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 76000, percentage: 19.8, description: 'Seasonal coolant flush and thermostat replacement buyers', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Urgent Repair Buyers', size: 58000, percentage: 15.1, description: 'Overheating-triggered buyers needing immediate cooling parts', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 54000, percentage: 14.1, description: 'Shops specializing in cooling system repairs', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 32000, percentage: 8.3, description: 'Fleet teams with scheduled coolant programs', logic: 'rule-based' },
  ],
  'Ignition and Tune Up': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 68000, percentage: 21.5, description: 'Spark plug and ignition wire replacements on schedule', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Price-Sensitive Promo Buyers', size: 42000, percentage: 13.3, description: 'Buy tune-up kits when bundled or discounted', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 58000, percentage: 18.4, description: 'Tune-up specialists with consistent ignition parts orders', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 28000, percentage: 8.9, description: 'Fleet maintenance with bulk tune-up schedules', logic: 'rule-based' },
  ],
  'Exhaust and Emissions': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 45000, percentage: 16.2, description: 'Planned exhaust component replacements for older vehicles', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Urgent Repair Buyers', size: 52000, percentage: 18.7, description: 'Failed emissions test or exhaust leak needing immediate fix', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 68000, percentage: 24.5, description: 'Muffler and exhaust specialist shops', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Emergency Restock Buyers', size: 32000, percentage: 11.5, description: 'Shops needing quick exhaust part restocks', logic: 'rule-based' },
  ],
  'Steering and Suspension': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 38000, percentage: 13.8, description: 'Planned strut and shock replacements on high-mileage vehicles', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Urgent Repair Buyers', size: 48000, percentage: 17.5, description: 'Steering noise or handling issues triggering immediate purchases', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 72000, percentage: 26.2, description: 'Alignment and suspension specialist shops', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 28000, percentage: 10.2, description: 'Fleet teams with suspension maintenance schedules', logic: 'rule-based' },
  ],
  'Lighting': [
    { id: 'seg-diy-1', name: 'DIY Routine Maintenance Buyers', size: 95000, percentage: 27.4, description: 'Bulb replacements and headlight upgrades, high online purchase rate', logic: 'statistical' },
    { id: 'seg-diy-2', name: 'DIY Price-Sensitive Promo Buyers', size: 58000, percentage: 16.7, description: 'Buy lighting upgrades when discounted or in bundles', logic: 'rule-based' },
    { id: 'seg-pro-1', name: 'PRO High-Value Shops', size: 42000, percentage: 12.1, description: 'Service centers offering lighting as add-on installation', logic: 'statistical' },
    { id: 'seg-pro-2', name: 'PRO Fleet Operators', size: 32000, percentage: 9.2, description: 'Fleet compliance teams maintaining headlight/tail light standards', logic: 'rule-based' },
  ],
}

// Auto Parts Category Offers — Segment-Based + Category-Based Promo Rules
const CATEGORY_OFFERS: Record<string, { segmentId: string; segmentName: string; productGroup: string; promotion: string; promoValue: string; expectedLift: number; marginImpact: number; overstockCoverage: number }[]> = {
  'Oil and Lubricants': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Synthetic Oil + Filter Kits', promotion: '15% Off Oil Change Kit', promoValue: '15% OFF + Bundle', expectedLift: 82, marginImpact: 5, overstockCoverage: 35 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', productGroup: 'Conventional Oil Bundles', promotion: 'Oil Bundle Deal', promoValue: 'Buy 2 Get Free Filter', expectedLift: 78, marginImpact: 8, overstockCoverage: 55 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Synthetic Oil Cases', promotion: 'PRO Volume Discount', promoValue: '20% OFF 10+ Cases', expectedLift: 91, marginImpact: 12, overstockCoverage: 42 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Oil Program SKUs', promotion: 'Fleet Contract Pricing', promoValue: '25% OFF Contract', expectedLift: 88, marginImpact: 15, overstockCoverage: 60 },
  ],
  'Braking': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Brake Pad + Rotor Kits', promotion: '15% Off Brake Kit', promoValue: '15% OFF Kit', expectedLift: 79, marginImpact: 6, overstockCoverage: 45 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', productGroup: 'Premium Brake Pads', promotion: 'Urgent Repair Deal', promoValue: '20% OFF + Free Fluid', expectedLift: 85, marginImpact: 10, overstockCoverage: 30 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Brake Components', promotion: 'PRO Brake Volume Deal', promoValue: '25% OFF 20+ Units', expectedLift: 92, marginImpact: 14, overstockCoverage: 55 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Emergency Restock Buyers', productGroup: 'Fast-Ship Brake SKUs', promotion: 'Emergency Restock Pricing', promoValue: '10% OFF Same-Day', expectedLift: 88, marginImpact: 5, overstockCoverage: 20 },
  ],
  'Filters and PCV': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Oil + Air Filter Combo Kits', promotion: '15% Off Filter Kit', promoValue: '15% OFF + Bundle', expectedLift: 80, marginImpact: 5, overstockCoverage: 40 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY First-Time Fixers', productGroup: 'Starter Filter Packs', promotion: 'First-Timer Filter Deal', promoValue: '10% OFF + Guide', expectedLift: 72, marginImpact: 4, overstockCoverage: 25 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Air & Oil Filters', promotion: 'PRO Filter Volume Deal', promoValue: '20% OFF 50+ Units', expectedLift: 90, marginImpact: 11, overstockCoverage: 50 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Filter Program SKUs', promotion: 'Fleet Filter Contract', promoValue: '25% OFF Contract', expectedLift: 87, marginImpact: 14, overstockCoverage: 58 },
  ],
  'Wipers and Related': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Wiper Blade Pairs', promotion: 'Seasonal Wiper Deal', promoValue: '15% OFF Pair', expectedLift: 76, marginImpact: 5, overstockCoverage: 65 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', productGroup: 'Value Wiper Bundles', promotion: 'Wiper + Washer Bundle', promoValue: 'Bundle: Wipers + Fluid', expectedLift: 74, marginImpact: 7, overstockCoverage: 72 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Wiper Inventory', promotion: 'PRO Wiper Stock Deal', promoValue: '20% OFF 30+ Pairs', expectedLift: 84, marginImpact: 10, overstockCoverage: 60 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Wiper Program', promotion: 'Fleet Wiper Contract', promoValue: '25% OFF Seasonal', expectedLift: 81, marginImpact: 12, overstockCoverage: 68 },
  ],
  'Battery and Electrical': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Replacement Batteries', promotion: 'Battery Swap Deal', promoValue: '15% OFF + Free Test', expectedLift: 83, marginImpact: 6, overstockCoverage: 30 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', productGroup: 'Emergency Battery SKUs', promotion: 'Emergency Battery Deal', promoValue: '10% OFF Same-Day', expectedLift: 89, marginImpact: 4, overstockCoverage: 15 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Batteries + Alternators', promotion: 'PRO Electrical Volume', promoValue: '20% OFF 10+ Units', expectedLift: 91, marginImpact: 13, overstockCoverage: 45 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Emergency Restock Buyers', productGroup: 'Fast-Ship Battery SKUs', promotion: 'Emergency Restock', promoValue: '10% OFF Rush Order', expectedLift: 86, marginImpact: 5, overstockCoverage: 20 },
  ],
  'Cooling and Heating': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Coolant + Thermostat Kits', promotion: 'Seasonal Coolant Deal', promoValue: '15% OFF Kit', expectedLift: 77, marginImpact: 5, overstockCoverage: 45 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', productGroup: 'Radiator + Hose SKUs', promotion: 'Overheat Repair Deal', promoValue: '20% OFF + Free Coolant', expectedLift: 84, marginImpact: 9, overstockCoverage: 30 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Cooling Components', promotion: 'PRO Cooling Volume', promoValue: '25% OFF 20+ Units', expectedLift: 88, marginImpact: 14, overstockCoverage: 50 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Cooling Program', promotion: 'Fleet Coolant Contract', promoValue: '20% OFF Contract', expectedLift: 85, marginImpact: 12, overstockCoverage: 55 },
  ],
  'Ignition and Tune Up': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Spark Plug + Wire Kits', promotion: 'Tune-Up Kit Deal', promoValue: '15% OFF Kit', expectedLift: 78, marginImpact: 5, overstockCoverage: 38 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', productGroup: 'Value Tune-Up Bundles', promotion: 'Tune-Up Bundle Save', promoValue: 'Bundle: Plugs + Wires + Coil', expectedLift: 75, marginImpact: 8, overstockCoverage: 48 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Ignition Components', promotion: 'PRO Ignition Volume', promoValue: '20% OFF 30+ Units', expectedLift: 87, marginImpact: 11, overstockCoverage: 42 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Tune-Up Program', promotion: 'Fleet Tune-Up Contract', promoValue: '25% OFF Contract', expectedLift: 84, marginImpact: 13, overstockCoverage: 52 },
  ],
  'Exhaust and Emissions': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Muffler + Pipe Kits', promotion: 'Exhaust Kit Deal', promoValue: '15% OFF Kit', expectedLift: 72, marginImpact: 6, overstockCoverage: 40 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', productGroup: 'Emergency Exhaust Parts', promotion: 'Emissions Fix Deal', promoValue: '20% OFF + Free Gasket', expectedLift: 81, marginImpact: 9, overstockCoverage: 25 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Exhaust Components', promotion: 'PRO Exhaust Volume', promoValue: '25% OFF 15+ Units', expectedLift: 89, marginImpact: 14, overstockCoverage: 55 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Emergency Restock Buyers', productGroup: 'Fast-Ship Exhaust SKUs', promotion: 'Emergency Exhaust Restock', promoValue: '10% OFF Same-Day', expectedLift: 85, marginImpact: 5, overstockCoverage: 20 },
  ],
  'Steering and Suspension': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Strut + Shock Kits', promotion: 'Suspension Kit Deal', promoValue: '15% OFF Kit', expectedLift: 74, marginImpact: 7, overstockCoverage: 35 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', productGroup: 'Tie Rod + Ball Joint SKUs', promotion: 'Steering Fix Deal', promoValue: '20% OFF + Free Alignment Check', expectedLift: 82, marginImpact: 10, overstockCoverage: 28 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Suspension Components', promotion: 'PRO Suspension Volume', promoValue: '25% OFF 20+ Units', expectedLift: 90, marginImpact: 15, overstockCoverage: 48 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Suspension Program', promotion: 'Fleet Suspension Contract', promoValue: '20% OFF Contract', expectedLift: 86, marginImpact: 13, overstockCoverage: 52 },
  ],
  'Lighting': [
    { segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Headlight + Bulb Kits', promotion: 'Lighting Upgrade Deal', promoValue: '15% OFF Kit', expectedLift: 79, marginImpact: 5, overstockCoverage: 42 },
    { segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', productGroup: 'Value Bulb Bundles', promotion: 'Bulb Bundle Save', promoValue: 'Buy 2 Get 1 Free', expectedLift: 76, marginImpact: 8, overstockCoverage: 55 },
    { segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', productGroup: 'Bulk Lighting Inventory', promotion: 'PRO Lighting Volume', promoValue: '20% OFF 30+ Units', expectedLift: 85, marginImpact: 10, overstockCoverage: 48 },
    { segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', productGroup: 'Fleet Lighting Program', promotion: 'Fleet Lighting Contract', promoValue: '25% OFF Contract', expectedLift: 82, marginImpact: 12, overstockCoverage: 58 },
  ],
}

// Auto Parts Creative Templates — Product-focused, functional use cases
const CATEGORY_CREATIVES: Record<string, { id: string; segmentId: string; segmentName: string; headline: string; subcopy: string; cta: string; tone: string; hasOffer: boolean; offerBadge: string; complianceStatus: string; reasoning: string; image: string; approved: boolean }[]> = {
  'Oil and Lubricants': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Save on Your Next Oil Change', subcopy: 'Full synthetic oil + filter kit — everything you need for a complete oil change at home', cta: 'Find Parts for Your Vehicle', tone: 'Practical', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'DIY maintenance savings messaging drives routine buyers', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', headline: 'Fix It Yourself & Save', subcopy: 'Conventional oil bundles at the best price — buy 2 jugs, get a free filter', cta: 'Order for Pickup Today', tone: 'Value', hasOffer: true, offerBadge: 'Free Filter', complianceStatus: 'approved', reasoning: 'Bundle value messaging for price-sensitive DIY buyers', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'Stock Up for Peak Demand', subcopy: 'Bulk synthetic oil cases with PRO volume pricing — 20% off 10+ cases', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF Bulk', complianceStatus: 'approved', reasoning: 'Volume discount drives PRO shop restock behavior', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fast Turnaround Parts', subcopy: 'Fleet oil program with scheduled deliveries and contract pricing', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '25% OFF Contract', complianceStatus: 'pending', reasoning: 'Fleet efficiency messaging with contract pricing appeal', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', approved: false },
  ],
  'Braking': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Brake Confidence Starts Here', subcopy: 'Complete brake pad + rotor kit — fitment validated for your vehicle', cta: 'Find Parts for Your Vehicle', tone: 'Trustworthy', hasOffer: true, offerBadge: '15% OFF Kit', complianceStatus: 'approved', reasoning: 'Safety and confidence messaging for DIY brake jobs', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', headline: 'Brake Issue? Fix It Today', subcopy: 'Premium brake pads + free brake fluid — same-day pickup available', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Urgency messaging for failure-triggered brake repairs', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'PRO Brake Parts at Volume Pricing', subcopy: 'Bulk brake components for high-volume shops — 25% off 20+ units', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '25% OFF Bulk', complianceStatus: 'approved', reasoning: 'Volume pricing drives PRO brake shop restocking', image: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Emergency Restock Buyers', headline: 'Emergency Brake Parts — Fast Ship', subcopy: 'Same-day delivery on fast-moving brake SKUs for urgent shop needs', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '10% OFF Rush', complianceStatus: 'pending', reasoning: 'Speed and availability messaging for emergency PRO restock', image: '/images/banner_assets/AdvanceRewards_460x260_5.webp', approved: false },
  ],
  'Filters and PCV': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Fresh Filters, Fresh Start', subcopy: 'Oil + air filter combo kits — easy installation, fitment guaranteed', cta: 'Find Parts for Your Vehicle', tone: 'Practical', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Routine maintenance convenience for DIY filter buyers', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY First-Time Fixers', headline: 'Your First Filter Change Made Easy', subcopy: 'Starter filter packs with step-by-step guide — perfect for beginners', cta: 'Find Parts for Your Vehicle', tone: 'Encouraging', hasOffer: true, offerBadge: '10% OFF', complianceStatus: 'approved', reasoning: 'Beginner-friendly messaging reduces first-timer hesitation', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'Bulk Filters for Every Fitment', subcopy: 'Air and oil filters in bulk — 20% off 50+ units for PRO shops', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF Bulk', complianceStatus: 'approved', reasoning: 'Multi-fitment bulk supply for high-volume shops', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fleet Filter Program — Contract Pricing', subcopy: 'Standardized filter program with scheduled deliveries for fleets', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '25% OFF Contract', complianceStatus: 'pending', reasoning: 'Fleet standardization and contract pricing appeal', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', approved: false },
  ],
  'Wipers and Related': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Clear Vision, Safe Driving', subcopy: 'Wiper blade pairs — seasonal replacement, fitment validated', cta: 'Find Parts for Your Vehicle', tone: 'Safety', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Safety-focused seasonal replacement messaging', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', headline: 'Wiper + Washer Bundle Deal', subcopy: 'Complete visibility bundle — wipers + washer fluid at one low price', cta: 'Order for Pickup Today', tone: 'Value', hasOffer: true, offerBadge: 'Bundle Deal', complianceStatus: 'approved', reasoning: 'Bundle value for price-sensitive seasonal buyers', image: '/images/banner_assets/AdvanceRewards_460x260_5.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'Stock Wipers for Every Vehicle', subcopy: 'Bulk wiper inventory — 20% off 30+ pairs for service centers', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF Bulk', complianceStatus: 'approved', reasoning: 'Service center add-on inventory stocking', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fleet Wiper Program — Seasonal', subcopy: 'Seasonal wiper replacement program with contract pricing', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '25% OFF Seasonal', complianceStatus: 'pending', reasoning: 'Fleet seasonal compliance and bulk savings', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', approved: false },
  ],
  'Battery and Electrical': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Prepare Your Car for Winter', subcopy: 'Replacement batteries with free testing — don\'t get stranded', cta: 'Find Parts for Your Vehicle', tone: 'Preventive', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Preventive battery replacement before winter messaging', image: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', headline: 'Dead Battery? Get Moving Fast', subcopy: 'Same-day pickup on replacement batteries — emergency pricing available', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '10% OFF', complianceStatus: 'approved', reasoning: 'Emergency urgency for dead battery situations', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'Bulk Batteries + Alternators', subcopy: 'PRO electrical volume pricing — 20% off 10+ units for repair shops', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF Bulk', complianceStatus: 'approved', reasoning: 'Volume electrical parts stocking for repair shops', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Emergency Restock Buyers', headline: 'Emergency Battery Stock — Fast Ship', subcopy: 'Rush order batteries during cold snaps — keep your shop running', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '10% OFF Rush', complianceStatus: 'pending', reasoning: 'Cold-weather emergency stock for PRO shops', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', approved: false },
  ],
  'Cooling and Heating': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Keep Your Engine Cool', subcopy: 'Coolant + thermostat kits for seasonal maintenance — fitment validated', cta: 'Find Parts for Your Vehicle', tone: 'Practical', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Seasonal cooling maintenance messaging', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', headline: 'Overheating? Fix It Now', subcopy: 'Radiator + hose repair parts with free coolant — same-day pickup', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Overheating emergency repair messaging', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'PRO Cooling Components in Bulk', subcopy: 'Bulk cooling system parts — 25% off 20+ units for specialist shops', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '25% OFF Bulk', complianceStatus: 'approved', reasoning: 'Cooling specialist volume stocking', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fleet Coolant Program', subcopy: 'Scheduled coolant program with contract pricing for fleet teams', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '20% OFF Contract', complianceStatus: 'pending', reasoning: 'Fleet cooling maintenance contract appeal', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', approved: false },
  ],
  'Ignition and Tune Up': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Tune Up & Save on Gas', subcopy: 'Spark plug + wire kits — improve fuel efficiency with a proper tune-up', cta: 'Find Parts for Your Vehicle', tone: 'Practical', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Fuel efficiency benefit messaging for tune-up buyers', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', headline: 'Complete Tune-Up Bundle', subcopy: 'Plugs + wires + coil bundle at one great price — save on the complete set', cta: 'Order for Pickup Today', tone: 'Value', hasOffer: true, offerBadge: 'Bundle Deal', complianceStatus: 'approved', reasoning: 'Complete bundle value for price-conscious buyers', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'PRO Ignition Parts in Bulk', subcopy: 'Bulk ignition components — 20% off 30+ units for tune-up specialists', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF Bulk', complianceStatus: 'approved', reasoning: 'Tune-up specialist bulk stocking', image: '/images/banner_assets/AdvanceRewards_460x260_5.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fleet Tune-Up Program', subcopy: 'Scheduled tune-up program with contract pricing for fleet maintenance', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '25% OFF Contract', complianceStatus: 'pending', reasoning: 'Fleet tune-up schedule and contract appeal', image: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', approved: false },
  ],
  'Exhaust and Emissions': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Pass Emissions with Confidence', subcopy: 'Muffler + pipe kits for planned exhaust replacements — fitment guaranteed', cta: 'Find Parts for Your Vehicle', tone: 'Practical', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Emissions compliance messaging for planned replacements', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', headline: 'Exhaust Leak? Fix It Fast', subcopy: 'Emergency exhaust parts + free gasket — get back on the road quickly', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Urgent exhaust leak repair messaging', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'PRO Exhaust Components in Bulk', subcopy: 'Bulk exhaust parts — 25% off 15+ units for muffler specialist shops', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '25% OFF Bulk', complianceStatus: 'approved', reasoning: 'Muffler shop specialist volume stocking', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Emergency Restock Buyers', headline: 'Emergency Exhaust Restock', subcopy: 'Same-day delivery on fast-moving exhaust SKUs for urgent shop needs', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '10% OFF Rush', complianceStatus: 'pending', reasoning: 'Emergency exhaust restock for PRO shops', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', approved: false },
  ],
  'Steering and Suspension': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Smooth Ride, Safe Drive', subcopy: 'Strut + shock kits for high-mileage vehicles — improve handling and comfort', cta: 'Find Parts for Your Vehicle', tone: 'Safety', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Safety and comfort messaging for suspension maintenance', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Urgent Repair Buyers', headline: 'Steering Problems? Fix Today', subcopy: 'Tie rod + ball joint parts — same-day pickup + free alignment check', cta: 'Order for Pickup Today', tone: 'Urgent', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Urgent steering repair with added alignment value', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'PRO Suspension Parts in Bulk', subcopy: 'Bulk suspension components — 25% off 20+ units for alignment shops', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '25% OFF Bulk', complianceStatus: 'approved', reasoning: 'Alignment shop specialist volume stocking', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fleet Suspension Program', subcopy: 'Scheduled suspension maintenance with contract pricing for fleets', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '20% OFF Contract', complianceStatus: 'pending', reasoning: 'Fleet suspension maintenance contract appeal', image: '/images/banner_assets/AdvanceRewards_460x260_5.webp', approved: false },
  ],
  'Lighting': [
    { id: 'cr-1', segmentId: 'seg-diy-1', segmentName: 'DIY Routine Maintenance Buyers', headline: 'Brighter Lights, Safer Nights', subcopy: 'Headlight + bulb upgrade kits — easy installation, performance benefits', cta: 'Find Parts for Your Vehicle', tone: 'Safety', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Safety and performance upgrade messaging for lighting', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', approved: false },
    { id: 'cr-2', segmentId: 'seg-diy-2', segmentName: 'DIY Price-Sensitive Promo Buyers', headline: 'Buy 2 Bulbs, Get 1 Free', subcopy: 'Stock up on replacement bulbs at the best price — all fitments available', cta: 'Order for Pickup Today', tone: 'Value', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Multi-buy value messaging for lighting buyers', image: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', approved: false },
    { id: 'cr-3', segmentId: 'seg-pro-1', segmentName: 'PRO High-Value Shops', headline: 'Bulk Lighting for Service Centers', subcopy: 'Bulk lighting inventory — 20% off 30+ units as add-on installation service', cta: 'Bulk Order Now', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF Bulk', complianceStatus: 'approved', reasoning: 'Service center lighting add-on stocking', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', approved: false },
    { id: 'cr-4', segmentId: 'seg-pro-2', segmentName: 'PRO Fleet Operators', headline: 'Fleet Lighting Compliance', subcopy: 'Fleet headlight/tail light compliance program with contract pricing', cta: 'Bulk Order Now', tone: 'Efficient', hasOffer: true, offerBadge: '25% OFF Contract', complianceStatus: 'pending', reasoning: 'Fleet lighting compliance and standards messaging', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', approved: false },
  ],
}

const deriveAudienceStrategy = (category: string, _client?: 'autoparts', detectedCategories?: string[], selectedGoalId?: string) => {
  let segments: { id: string; name: string; size: number; percentage: number; description: string; logic: string }[]

  // If a playbook goal was selected, use its deterministic segments
  const playbook = selectedGoalId ? BUSINESS_GOAL_PLAYBOOKS.find(g => g.id === selectedGoalId) : null
  if (playbook && playbook.segments) {
    segments = playbook.segments.map((seg, index) => ({
      id: `seg-goal-${index + 1}`,
      name: seg.name,
      size: index === 0 ? 145000 : 82000,
      percentage: index === 0 ? 58.5 : 41.5,
      description: seg.why,
      logic: 'rule-based',
    }))
  } else if (detectedCategories && detectedCategories.length > 0) {
    // Build one segment per detected category — pick the primary (first) segment from each
    segments = detectedCategories.map((cat, index) => {
      const catSegments = CATEGORY_SEGMENTS[cat] || CATEGORY_SEGMENTS['Oil and Lubricants']
      const primary = catSegments[0]
      return { ...primary, id: `seg-cat-${index + 1}` }
    })
  } else {
    segments = CATEGORY_SEGMENTS[category] || CATEGORY_SEGMENTS['Oil and Lubricants']
  }

  return {
    segments,
    totalCoverage: Math.round(segments.reduce((acc, s) => acc + s.percentage, 0) * 10) / 10,
    segmentationLayers: [
      { name: 'Customer Type (PRO/DIY)', type: 'rule-based' as const },
      { name: 'Purchase Recency', type: 'rule-based' as const },
      { name: 'Category Affinity', type: 'statistical' as const },
      { name: 'Vehicle Age Bucket', type: 'rule-based' as const },
      { name: 'Failure Signals', type: 'statistical' as const },
      { name: 'Price Sensitivity', type: 'statistical' as const },
    ]
  }
}

// Goal-specific, segment-specific promo offers — each segment gets a distinct promo strategy
const GOAL_PROMO_OFFERS: Record<string, { segmentName: string; productGroup: string; promotion: string; promoValue: string; expectedLift: number; marginImpact: number; overstockCoverage: number }[]> = {
  'clear-inventory': [
    { segmentName: 'DIY Price-Sensitive Buyers', productGroup: 'Brake & Battery Essentials', promotion: 'Clearance Blowout — Brake & Battery', promoValue: '30% OFF Select Overstock', expectedLift: 22, marginImpact: 3, overstockCoverage: 78 },
    { segmentName: 'High-Intent Repair Buyers', productGroup: 'Wiper & Visibility Products', promotion: 'Seasonal Wiper Markdown', promoValue: 'Buy 1 Get 1 50% Off', expectedLift: 18, marginImpact: 5, overstockCoverage: 70 },
    { segmentName: 'DIY Price-Sensitive Buyers', productGroup: 'Air Filter & PCV Components', promotion: 'Filter Clearance Bundle', promoValue: '25% OFF Filter Combos', expectedLift: 15, marginImpact: 4, overstockCoverage: 65 },
  ],
  'accelerate-revenue': [
    { segmentName: 'DIY Routine Maintenance Buyers', productGroup: 'Oil Change & Filter Kits', promotion: 'Oil Change Bundle Save', promoValue: '15% OFF Kit + Free Filter', expectedLift: 16, marginImpact: 7, overstockCoverage: 55 },
    { segmentName: 'PRO Fleet Operators', productGroup: 'Air Filter & PCV Components', promotion: 'PRO Volume Filter Program', promoValue: '20% OFF 50+ Units', expectedLift: 12, marginImpact: 9, overstockCoverage: 48 },
  ],
  'protect-margins': [
    { segmentName: 'PRO Fleet Buyers', productGroup: 'Bulk Maintenance Components', promotion: 'Fleet Bulk Pricing Tier', promoValue: '10% OFF Case Orders (12+)', expectedLift: 10, marginImpact: 14, overstockCoverage: 60 },
    { segmentName: 'Premium DIY Buyers', productGroup: 'Bulk Maintenance Components', promotion: 'Premium Value Multi-Pack', promoValue: 'Multi-Pack Savings (No Coupon)', expectedLift: 8, marginImpact: 16, overstockCoverage: 52 },
  ],
  'increase-basket': [
    { segmentName: 'Pet Food Loyalists', productGroup: 'Pet Food Bundles', promotion: 'Buy 3 Cat Wet Food, Get 1 Free', promoValue: 'Buy 3, Get 1 Free', expectedLift: 21, marginImpact: 6, overstockCoverage: 72 },
    { segmentName: 'Toy & Accessory Shoppers', productGroup: 'KONG Toy Bundles', promotion: 'BOGO 40% Off KONG Toys', promoValue: 'BOGO 40% Off', expectedLift: 18, marginImpact: 8, overstockCoverage: 65 },
  ],
  'retain-customers': [
    { segmentName: 'Cat Month Loyalists', productGroup: 'Cat Food & Rewards', promotion: '5X Points on Cat Products', promoValue: '5X Points', expectedLift: 16, marginImpact: 4, overstockCoverage: 68 },
    { segmentName: 'Dog Care Regulars', productGroup: 'Premium Dog Food', promotion: '$10 Off Premium Dog Food + $10 Reward', promoValue: '$10 Off + $10 Reward', expectedLift: 14, marginImpact: 7, overstockCoverage: 60 },
  ],
}

const deriveOfferMapping = (category: string, _client?: 'autoparts', detectedCategories?: string[], selectedGoalId?: string) => {
  // If a playbook goal was selected, use goal-specific segment-specific promos
  if (selectedGoalId && GOAL_PROMO_OFFERS[selectedGoalId]) {
    return GOAL_PROMO_OFFERS[selectedGoalId].map((offer, index) => ({
      segmentId: `seg-goal-${index + 1}`,
      segmentName: offer.segmentName,
      productGroup: offer.productGroup,
      promotion: offer.promotion,
      promoId: `promo-goal-${index + 1}`,
      promoValue: offer.promoValue,
      expectedLift: offer.expectedLift,
      marginImpact: offer.marginImpact,
      overstockCoverage: offer.overstockCoverage,
    }))
  }

  if (detectedCategories && detectedCategories.length > 0) {
    // One offer per detected category — pick the primary (first) offer from each
    return detectedCategories.map((cat, index) => {
      const catOffers = CATEGORY_OFFERS[cat] || CATEGORY_OFFERS['Oil and Lubricants']
      return { ...catOffers[0], segmentId: `seg-cat-${index + 1}` }
    })
  }
  return CATEGORY_OFFERS[category] || CATEGORY_OFFERS['Oil and Lubricants']
}

// Banner images per playbook goal — mapped to segments
const GOAL_CREATIVE_BANNERS: Record<string, { segmentIndex: number; headline: string; subcopy: string; cta: string; tone: string; image: string }[]> = {
  'clear-inventory': [
    { segmentIndex: 0, headline: 'Clearance Event — Up to 35% Off', subcopy: 'Brake pads, rotors, batteries & more — while supplies last', cta: 'Shop Clearance', tone: 'Urgency', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp' },
    { segmentIndex: 1, headline: 'Repair Parts — Ready Now', subcopy: 'Brakes, batteries, wipers & filters — in stock for immediate pickup', cta: 'Find Your Parts', tone: 'Action', image: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp' },
  ],
  'accelerate-revenue': [
    { segmentIndex: 0, headline: 'Oil Change Kit — Everything You Need', subcopy: 'Full synthetic oil + filter combos — save when you bundle', cta: 'Shop Oil Kits', tone: 'Value', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp' },
    { segmentIndex: 1, headline: 'PRO Fleet Oil Program', subcopy: 'Volume pricing on cases — scheduled delivery for your fleet', cta: 'Get Fleet Pricing', tone: 'Professional', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp' },
  ],
  'protect-margins': [
    { segmentIndex: 0, headline: 'Bulk Maintenance — Volume Savings', subcopy: 'Case pricing on brake pads, filters & wiper blades for PRO shops', cta: 'Bulk Order Now', tone: 'Professional', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp' },
    { segmentIndex: 1, headline: 'Premium Value Packs', subcopy: 'Quality parts in multi-packs — no coupons needed, just great value', cta: 'Shop Value Packs', tone: 'Premium', image: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp' },
  ],
  'increase-basket': [
    { segmentIndex: 0, headline: 'Buy 3 Cat Wet Food, Get 1 Free', subcopy: 'Stock up and save — Cat Wet Food & Toppers this week', cta: 'Shop Cat Food', tone: 'Value', image: '/images/banner_assets/cat_wet_food_bogo_banner.png' },
    { segmentIndex: 1, headline: 'BOGO 40% Off KONG Toys', subcopy: 'Your dog deserves the best — mix and match KONG Toys & Treats', cta: 'Shop KONG Toys', tone: 'Fun', image: '/images/banner_assets/kong_dog_toys_bogo_banner.png' },
  ],
  'retain-customers': [
    { segmentIndex: 0, headline: 'Cinco De Meow — Cat Month Event', subcopy: 'Cat Month rewards are here — free samples, 5X points & exclusive deals for cat loyalists', cta: 'Earn Cat Rewards', tone: 'Loyalty', image: '/images/banner_assets/cinco_de_meow_event_banner.png' },
    { segmentIndex: 1, headline: '$10 Off Premium Dog Food + $10 Reward', subcopy: 'Treat your dog to premium nutrition — and earn rewards', cta: 'Shop Dog Food', tone: 'Premium', image: '/images/banner_assets/premium_dog_food_rewards_banner.png' },
  ],
}

const deriveCreatives = (category: string, segmentNames?: string[], _client?: 'autoparts', detectedCategories?: string[], selectedGoalId?: string) => {
  // If a playbook goal was selected, use goal-specific creatives with banner images
  if (selectedGoalId && GOAL_CREATIVE_BANNERS[selectedGoalId]) {
    const playbook = BUSINESS_GOAL_PLAYBOOKS.find(g => g.id === selectedGoalId)
    const banners = GOAL_CREATIVE_BANNERS[selectedGoalId]
    return banners.map((banner, index) => {
      const segName = playbook?.segments?.[banner.segmentIndex]?.name || segmentNames?.[banner.segmentIndex] || 'All Customers'
      return {
        id: `cr-goal-${index + 1}`,
        segmentId: `seg-goal-${banner.segmentIndex + 1}`,
        segmentName: segName,
        headline: banner.headline,
        subcopy: banner.subcopy,
        cta: banner.cta,
        tone: banner.tone,
        hasOffer: true,
        offerBadge: playbook?.interpretation?.context.discountStrategy || '15–25%',
        complianceStatus: 'approved',
        reasoning: `Creative tailored for ${segName} — ${banner.tone.toLowerCase()} tone drives conversion`,
        image: banner.image,
        approved: false,
      }
    })
  }

  if (detectedCategories && detectedCategories.length > 0) {
    // One creative per detected category — pick the primary (first) creative from each
    return detectedCategories.map((cat, index) => {
      const catCreatives = CATEGORY_CREATIVES[cat] || CATEGORY_CREATIVES['Oil and Lubricants']
      const primary = catCreatives[0]
      return {
        ...primary,
        id: `cr-${index + 1}`,
        segmentId: `seg-cat-${index + 1}`,
        segmentName: segmentNames?.[index] || primary.segmentName,
      }
    })
  }

  const baseCreatives = CATEGORY_CREATIVES[category] || CATEGORY_CREATIVES['Oil and Lubricants']
  return baseCreatives.map((creative, index) => {
    return {
      ...creative,
      segmentName: segmentNames?.[index] || creative.segmentName,
    }
  })
}

export function CampaignWorkspace() {
  // Workspace state
  const [activeTab, setActiveTab] = useState<'draft' | 'active' | 'completed'>('draft')
  const [searchQuery, setSearchQuery] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([...MOCK_DRAFTS, ...MOCK_ACTIVE])
  
  // Active campaign flow state (for drafts)
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  // View mode for live/completed campaigns
  const [viewingCampaignId, setViewingCampaignId] = useState<string | null>(null)
  const [isAlanWorking, setIsAlanWorking] = useState(false)
  const [alanStatus, setAlanStatus] = useState<string | null>(null)
  const [alanThinkingSteps, setAlanThinkingSteps] = useState<string[]>([])

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId)
  
  // Filter campaigns by tab
  const filteredCampaigns = campaigns.filter(c => {
    const matchesTab = activeTab === 'draft' ? c.status === 'draft' 
      : activeTab === 'active' ? (c.status === 'active' || c.status === 'scheduled')
      : c.status === 'completed'
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const draftCount = campaigns.filter(c => c.status === 'draft').length
  const activeCount = campaigns.filter(c => c.status === 'active' || c.status === 'scheduled').length
  const completedCount = campaigns.filter(c => c.status === 'completed').length

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const handleStartCampaign = () => {
    const now = new Date()
    const newCampaign: Campaign = {
      id: `CAMP-${Date.now()}`,
      name: 'New Campaign',
      status: 'draft',
      currentStep: 'context',
      lockedSteps: [],
      stepStates: createDefaultStepStates(),
      goal: '',
      category: null,
      channel: null,
      region: null,
      lookbackWindow: 'Last 6 months',
      createdBy: 'John Doe',
      createdAt: now,
      lastSavedAt: now,
      lastSavedBy: 'John Doe',
      lastModifiedAt: now,
      lastModifiedBy: 'John Doe',
      progressPercent: 0,
      completedStepsCount: 0,
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setActiveCampaignId(newCampaign.id)
  }

  const handleResumeCampaign = (campaignId: string) => {
    // Find the campaign and ensure it has the necessary data for its current step
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      const updates: Partial<Campaign> = {}
      
      // Generate missing data based on current step
      if (campaign.currentStep === 'promo' && !campaign.offerMapping) {
        updates.offerMapping = deriveOfferMapping(campaign.category || 'Oil and Lubricants', campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId)
      }
      if (campaign.currentStep === 'creative' && !campaign.creatives) {
        const segmentNames = campaign.audienceStrategy?.segments.map(s => s.name)
        updates.creatives = deriveCreatives(campaign.category || 'Oil and Lubricants', segmentNames, campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId)
      }
      if (campaign.currentStep === 'segment' && !campaign.audienceStrategy) {
        updates.audienceStrategy = deriveAudienceStrategy(campaign.category || 'Oil and Lubricants', campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId)
      }
      if (campaign.currentStep === 'context' && campaign.goal && !campaign.derivedContext) {
        updates.derivedContext = deriveContext(campaign.goal, campaign.category || 'Oil and Lubricants', campaign.channel || undefined, campaign.client)
      }
      
      if (Object.keys(updates).length > 0) {
        updateCampaign(campaignId, updates)
      }
    }
    setActiveCampaignId(campaignId)
  }

  const handleSaveDraft = () => {
    if (!activeCampaign) return
    const now = new Date()
    updateCampaign(activeCampaign.id, {
      lastSavedAt: now,
      lastSavedBy: 'John Doe',
      lastModifiedAt: now,
      lastModifiedBy: 'John Doe',
    })
    setActiveCampaignId(null)
  }

  const handleExitFlow = () => {
    setActiveCampaignId(null)
  }

  const handleLockStep = async (
    step: CampaignStep,
    nextStep: CampaignStep,
    statusMsg: string,
    thinkingSteps: string[],
    deriveData: () => Partial<Campaign>
  ) => {
    if (!activeCampaign) return
    setIsAlanWorking(true)
    setAlanStatus(statusMsg)
    setAlanThinkingSteps([])
    
    // Simulate thinking steps one by one
    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setAlanThinkingSteps(prev => [...prev, thinkingSteps[i]])
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    const derived = deriveData()
    const completedCount = activeCampaign.completedStepsCount + 1
    updateCampaign(activeCampaign.id, {
      ...derived,
      lockedSteps: [...activeCampaign.lockedSteps, step],
      currentStep: nextStep,
      stepStates: {
        ...activeCampaign.stepStates,
        [step]: { status: 'approved', completedAt: new Date() },
        [nextStep]: { status: 'ready' }
      },
      completedStepsCount: completedCount,
      progressPercent: Math.round((completedCount / 6) * 100),
      lastModifiedAt: new Date(),
      lastModifiedBy: 'John Doe',
    })
    setIsAlanWorking(false)
    setAlanStatus(null)
    setAlanThinkingSteps([])
  }

  // Navigate to a specific step (for going back to completed steps)
  const handleGoToStep = (step: CampaignStep) => {
    if (!activeCampaign) return
    updateCampaign(activeCampaign.id, { currentStep: step })
  }

  // Get viewing campaign (for live/completed view)
  const viewingCampaign = campaigns.find(c => c.id === viewingCampaignId)

  // If we're in an active campaign flow (draft), show the flow UI
  if (activeCampaign) {
    return (
      <CampaignFlowView
        campaign={activeCampaign}
        isAlanWorking={isAlanWorking}
        alanStatus={alanStatus}
        alanThinkingSteps={alanThinkingSteps}
        onUpdate={(updates) => updateCampaign(activeCampaign.id, updates)}
        onLockStep={handleLockStep}
        onGoToStep={handleGoToStep}
        onSaveDraft={handleSaveDraft}
        onExit={handleExitFlow}
      />
    )
  }

  // Helper for relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get contextual agent suggestion
  const getAgentSuggestion = () => {
    const drafts = campaigns.filter(c => c.status === 'draft')
    if (drafts.length === 0) return null
    
    const needsAttention = drafts.find(c => c.currentStep === 'promo' || c.currentStep === 'creative')
    if (needsAttention) {
      return `Alan suggests completing ${needsAttention.name} — ${needsAttention.currentStep === 'promo' ? 'promo mapping' : 'creative review'} is next`
    }
    return drafts.length === 1 
      ? `You have 1 campaign in progress`
      : `You're midway through ${drafts.length} campaigns`
  }

  // Workspace Landing Page - Decision Hub Design
  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Global Header - Matching Other Screens */}
      <div className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Campaign Engine</h1>
              <p className="text-sm text-text-muted">Create and manage AI-powered marketing campaigns</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleStartCampaign} className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Quick Filters - Single Click, No Modals */}
      <div className="bg-surface border-b border-border">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* State Tabs - Structural Separation */}
              <Tabs
                tabNames={[
                  { value: 0, label: `In Progress${draftCount > 0 ? ` (${draftCount})` : ''}` },
                  { value: 1, label: `Live${activeCount > 0 ? ` (${activeCount})` : ''}` },
                  { value: 2, label: `Completed${completedCount > 0 ? ` (${completedCount})` : ''}` },
                ]}
                tabPanels={[null, null, null]}
                value={activeTab === 'draft' ? 0 : activeTab === 'active' ? 1 : 2}
                onChange={(_e: unknown, idx: number) =>
                  setActiveTab(idx === 0 ? 'draft' : idx === 1 ? 'active' : 'completed')
                }
              />

              {/* Quick Sort Toggles */}
              <div className="flex items-center gap-2 pl-6 border-l border-border">
                <span className="text-xs text-text-muted">Sort:</span>
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded hover:bg-surface-secondary">
                  Recently updated
                </button>
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded hover:bg-surface-secondary">
                  Needs attention
                </button>
              </div>
            </div>

            {/* Search */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns..."
              className="w-64"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        {/* Ambient Agent Hint */}
        {getAgentSuggestion() && activeTab === 'draft' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-agent" />
            <span>{getAgentSuggestion()}</span>
          </div>
        )}

        {filteredCampaigns.length === 0 ? (
          <EmptyState 
            tab={activeTab} 
            onStartCampaign={handleStartCampaign}
            onSwitchTab={setActiveTab}
          />
        ) : (
          <>
            {/* Draft Campaigns - Workspace Container */}
            {activeTab === 'draft' && (
              <div className="bg-surface-tertiary/50 rounded-xl p-4 space-y-3">
                {filteredCampaigns.map(campaign => (
                  <DraftCampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    onResume={() => handleResumeCampaign(campaign.id)}
                    getRelativeTime={getRelativeTime}
                  />
                ))}
              </div>
            )}

            {/* Active Campaigns - Operational Records */}
            {activeTab === 'active' && (
              <div className="space-y-3">
                {filteredCampaigns.map(campaign => (
                  <ActiveCampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onView={() => setViewingCampaignId(campaign.id)}
                  />
                ))}
              </div>
            )}

            {/* Completed Campaigns */}
            {activeTab === 'completed' && (
              <div className="space-y-3">
                {filteredCampaigns.map(campaign => (
                  <CompletedCampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onView={() => setViewingCampaignId(campaign.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Campaign Modal - Overlay */}
      {viewingCampaign && (viewingCampaign.status === 'active' || viewingCampaign.status === 'completed') && (
        <LiveCampaignModal
          campaign={viewingCampaign}
          onClose={() => setViewingCampaignId(null)}
        />
      )}
    </div>
  )
}

// ============================================================================
// WORKSPACE COMPONENTS
// ============================================================================

function EmptyState({ 
  tab, 
  onStartCampaign,
  onSwitchTab 
}: { 
  tab: 'draft' | 'active' | 'completed'
  onStartCampaign: () => void
  onSwitchTab: (tab: 'draft' | 'active' | 'completed') => void
}) {
  const content = {
    draft: {
      title: 'No work in progress',
      subtitle: 'Start a new campaign to begin',
      hint: 'Alan will guide you through segments, products, and creatives',
      secondaryAction: 'View live campaigns',
      secondaryTab: 'active' as const,
    },
    active: {
      title: 'No live campaigns',
      subtitle: 'Launch a campaign to see it here',
      hint: 'Check your drafts to continue work in progress',
      secondaryAction: 'View drafts',
      secondaryTab: 'draft' as const,
    },
    completed: {
      title: 'No completed campaigns yet',
      subtitle: 'Finished campaigns will appear here',
      hint: 'View reports and insights from past campaigns',
      secondaryAction: 'View live',
      secondaryTab: 'active' as const,
    },
  }

  const c = content[tab]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-12 h-12 rounded-xl bg-surface-tertiary flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-text-muted" />
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1">{c.title}</h3>
      <p className="text-sm text-text-muted mb-1">{c.subtitle}</p>
      <p className="text-xs text-text-muted/70 mb-6">{c.hint}</p>
      <div className="flex gap-2">
        <Button variant="primary" size="small" onClick={onStartCampaign} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Campaign
        </Button>
        <Button variant="tertiary" size="small" onClick={() => onSwitchTab(c.secondaryTab)}>
          {c.secondaryAction}
        </Button>
      </div>
    </motion.div>
  )
}

function DraftCampaignCard({ 
  campaign, 
  onResume,
  getRelativeTime 
}: { 
  campaign: Campaign
  onResume: () => void
  getRelativeTime: (date: Date) => string
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Get next step label for CTA
  const getNextStepLabel = () => {
    const stepLabels: Record<CampaignStep, string> = {
      context: 'Context',
      segment: 'Segments',
      product: 'Products',
      promo: 'Promos',
      creative: 'Creative',
      review: 'Review',
    }
    return stepLabels[campaign.currentStep]
  }

  const getStepStatus = (step: CampaignStep) => {
    if (campaign.lockedSteps.includes(step)) return 'completed'
    if (campaign.currentStep === step) return 'current'
    return 'pending'
  }

  // Semantic metadata line
  const getMetadataLine = () => {
    const parts = []
    if (campaign.category) parts.push(campaign.category)
    if (campaign.channel) parts.push(campaign.channel)
    if (campaign.region) parts.push(campaign.region)
    if (campaign.customerUniverseSize) {
      parts.push(`${(campaign.customerUniverseSize / 1000000).toFixed(1)}M customers`)
    }
    return parts.join(' · ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-surface rounded-xl border border-border/60 p-4 hover:border-border transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Left Anchor: Status + Progress */}
        <div className="flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full bg-warning mb-2" title="In Progress" />
          <div className="w-0.5 h-12 bg-surface-tertiary rounded-full overflow-hidden">
            <div 
              className="w-full bg-primary transition-all"
              style={{ height: `${campaign.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Goal - The Soul (Dominant) */}
          <p className="text-base font-medium text-text-primary leading-snug mb-1 line-clamp-2">
            {campaign.goal || 'Define campaign objective...'}
          </p>
          
          {/* Campaign Name + Metadata + Creator (Secondary) */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-text-secondary">{campaign.name}</span>
            {getMetadataLine() && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-muted">{getMetadataLine()}</span>
              </>
            )}
            <span className="text-text-muted">·</span>
            <span className="text-xs text-text-muted">by {campaign.createdBy}</span>
          </div>

          {/* Step Chips - Linear Style (Only Progress Indicator) */}
          <div className="flex items-center gap-0.5">
            {STEPS.map((step, i) => {
              const status = getStepStatus(step.id)
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors',
                    status === 'completed' ? 'bg-success/10 text-success' :
                    status === 'current' ? 'bg-primary text-white' :
                    'bg-surface-tertiary text-text-muted'
                  )}>
                    {status === 'completed' && <Check className="w-3 h-3" />}
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      'w-3 h-px mx-0.5',
                      status === 'completed' ? 'bg-success' : 'bg-border'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Freshness - Contextual */}
          <span className="text-xs text-text-muted mr-2">
            {getRelativeTime(campaign.lastModifiedAt)}
          </span>

          {/* Hover Actions - Revealed on Hover */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <Tooltip title="Duplicate" orientation="top">
              <button 
                className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </Tooltip>
            <Tooltip title="Archive" orientation="top">
              <button 
                className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              >
                <Archive className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </Tooltip>
            <Tooltip title="Delete" orientation="top">
              <button 
                className="p-1.5 hover:bg-danger/10 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-danger" />
              </button>
            </Tooltip>
          </div>

          {/* Primary CTA - Completes a Sentence */}
          <Button 
            variant="primary" 
            size="sm"
            onClick={onResume} 
            className="gap-1.5 ml-2"
          >
            Continue → {getNextStepLabel()}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ActiveCampaignCard({ campaign, onView }: { campaign: Campaign; onView: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  // Format date range
  const getDateRange = () => {
    if (!campaign.startDate || !campaign.endDate) return null
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
  }

  // Semantic metadata line
  const getMetadataLine = () => {
    const parts = []
    if (campaign.category) parts.push(campaign.category)
    if (campaign.channel) parts.push(campaign.channel)
    if (campaign.customerUniverseSize) {
      parts.push(`${(campaign.customerUniverseSize / 1000000).toFixed(1)}M reach`)
    }
    return parts.join(' · ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-surface rounded-xl border border-success/20 p-4 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Left Anchor: Status */}
        <div className="flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Live" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Goal - Dominant */}
          <p className="text-base font-medium text-text-primary leading-snug mb-1 line-clamp-2">
            {campaign.goal}
          </p>
          
          {/* Campaign Name + Metadata */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">{campaign.name}</span>
            {getMetadataLine() && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-muted">{getMetadataLine()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Date + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Date Range - Operational Info */}
          {getDateRange() && (
            <span className="text-xs text-text-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {getDateRange()}
            </span>
          )}

          {/* Hover Actions */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>

          <Button variant="outlined" size="small" onClick={onView}>
            View
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function CompletedCampaignCard({ campaign, onView }: { campaign: Campaign; onView: () => void }) {
  // Semantic metadata line
  const getMetadataLine = () => {
    const parts = []
    if (campaign.category) parts.push(campaign.category)
    if (campaign.channel) parts.push(campaign.channel)
    if (campaign.customerUniverseSize) {
      parts.push(`${(campaign.customerUniverseSize / 1000000).toFixed(1)}M reached`)
    }
    return parts.join(' · ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border/40 p-4 opacity-70 hover:opacity-100 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Left Anchor: Status */}
        <div className="flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full bg-text-muted" title="Completed" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Goal */}
          <p className="text-base font-medium text-text-secondary leading-snug mb-1 line-clamp-1">
            {campaign.goal}
          </p>
          
          {/* Campaign Name + Metadata */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">{campaign.name}</span>
            {getMetadataLine() && (
              <>
                <span className="text-text-muted/50">·</span>
                <span className="text-xs text-text-muted">{getMetadataLine()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action */}
        <Button variant="tertiary" size="small" className="shrink-0" onClick={onView}>
          View Report
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// LIVE CAMPAIGN VIEW (Status & Assurance Surface)
// ============================================================================

function LiveCampaignModal({
  campaign,
  onClose,
}: {
  campaign: Campaign
  onClose: () => void
}) {
  const isCompleted = campaign.status === 'completed'
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!campaign.endDate) return null
    const now = new Date()
    const diff = Math.ceil((campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  // Format date
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // Mock performance data
  const performanceStatus = {
    reach: { status: 'on-track', label: '287K', sublabel: 'of 300K target' },
    engagement: { status: 'above', label: '4.2%', sublabel: 'vs 3.5% target' },
    conversion: { status: 'at', label: '2.8%', sublabel: 'at target' },
    delivery: { status: 'healthy', label: '94%', sublabel: 'delivered' },
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={campaign.name}
      size="large"
      secondaryButtonLabel="Close"
      onSecondaryButtonClick={onClose}
    >
      <div className="space-y-5">
        {/* Status badge */}
        <span className={cn(
          "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
          isCompleted ? "bg-text-muted/10 text-text-muted" : "bg-success/10 text-success"
        )}>
          {isCompleted ? 'COMPLETED' : 'LIVE'}
        </span>
        <p className="text-xs text-text-muted">{campaign.channel} · {campaign.category} · {campaign.region}</p>

        {/* Campaign Details */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted mb-3">Campaign Details</h3>
          <div className="bg-surface-secondary rounded-lg p-4">
            <p className="text-sm text-text-primary font-medium mb-2">{campaign.goal}</p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {campaign.startDate && formatDate(campaign.startDate)} → {campaign.endDate && formatDate(campaign.endDate)}
                {!isCompleted && getDaysRemaining() !== null && getDaysRemaining()! > 0 && (
                  <span className="text-text-secondary ml-1">({getDaysRemaining()}d left)</span>
                )}
              </span>
              <span>·</span>
              <span className="text-primary">{campaign.audienceStrategy?.segments.length || 4} segments</span>
              <span>·</span>
              <span className="text-primary">{campaign.offerMapping?.length || 4} promotions</span>
              <span>·</span>
              <span>{((campaign.customerUniverseSize || 0) / 1000000).toFixed(1)}M customers</span>
            </div>
          </div>
        </div>

        {/* Performance Snapshot */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted mb-3">Performance Snapshot</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(performanceStatus).map(([key, data]) => (
              <div key={key} className="text-center p-3 bg-surface-secondary rounded-lg">
                <p className="text-xs text-text-muted capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className={cn(
                  "text-lg font-semibold",
                  data.status === 'on-track' || data.status === 'at' || data.status === 'healthy' ? 'text-success' :
                  data.status === 'above' ? 'text-primary' : 'text-warning'
                )}>
                  {data.label}
                </p>
                <p className="text-xs text-text-muted">{data.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted mb-3">Status</h3>
          <div className="flex items-center gap-2 p-3 bg-success/5 rounded-lg border border-success/20">
            <CheckCircle className="w-4 h-4 text-success" />
            <p className="text-sm text-success font-medium">Campaign is running as expected.</p>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center">To modify fundamentals, duplicate or create new.</p>
      </div>
    </Modal>
  )
}

// ============================================================================
// CAMPAIGN FLOW VIEW (Agent Mode)
// ============================================================================

function CampaignFlowView({
  campaign,
  isAlanWorking,
  alanStatus,
  alanThinkingSteps,
  onUpdate,
  onLockStep,
  onGoToStep,
  onSaveDraft,
  onExit,
}: {
  campaign: Campaign
  isAlanWorking: boolean
  alanStatus: string | null
  alanThinkingSteps: string[]
  onUpdate: (updates: Partial<Campaign>) => void
  onLockStep: (step: CampaignStep, nextStep: CampaignStep, status: string, thinkingSteps: string[], derive: () => Partial<Campaign>) => void
  onGoToStep: (step: CampaignStep) => void
  onSaveDraft: () => void
  onExit: () => void
}) {
  // Get current step label
  const getCurrentStepLabel = () => {
    const stepLabels: Record<CampaignStep, string> = {
      context: 'Context',
      segment: 'Segments',
      product: 'Products',
      promo: 'Promos',
      creative: 'Creative',
      review: 'Review',
    }
    return stepLabels[campaign.currentStep]
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Persistent Global Header - The Map */}
      <div className="bg-surface border-b border-border sticky top-0 z-50">
        {/* Primary Context Bar */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Tooltip title="Back to Campaign Engine" orientation="bottom">
              <button 
                onClick={onExit} 
                className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-text-muted" />
              </button>
            </Tooltip>
            
            {/* Global Context - Always Visible */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Campaign Engine</span>
              <span className="text-text-muted">/</span>
              <span className="text-lg font-semibold text-text-primary">{campaign.name}</span>
              <span className="text-text-muted">·</span>
              <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded">
                {getCurrentStepLabel()}
              </span>
            </div>
          </div>

          {/* Flow Controls */}
          <div className="flex items-center gap-2">
            <Button variant="tertiary" size="small" onClick={onSaveDraft} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </Button>
            <Button variant="outlined" size="small" onClick={onExit} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Stepper — Fully Navigable */}
      <div className="bg-surface border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => {
            const isCompleted = campaign.lockedSteps.includes(step.id)
            const isCurrent = campaign.currentStep === step.id
            const stepState = campaign.stepStates[step.id]
            const StepIcon = step.icon
            const currentIdx = STEPS.findIndex(s => s.id === campaign.currentStep)
            const stepIdx = i
            const isVisited = isCompleted || stepIdx <= currentIdx
            const canNavigate = isVisited && !isCurrent && !isAlanWorking
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canNavigate && onGoToStep(step.id)}
                  disabled={!canNavigate && !isCurrent}
                  title={canNavigate ? `Go back to ${step.label}` : undefined}
                  className={cn(
                    'group/step flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative',
                    isCurrent 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : isCompleted 
                        ? 'bg-success/10 text-success' 
                        : stepState?.status === 'thinking' 
                          ? 'bg-agent/10 text-agent' 
                          : 'bg-surface-tertiary text-text-muted',
                    canNavigate && 'cursor-pointer hover:ring-2 hover:ring-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-md'
                  )}
                >
                  {isCompleted ? (
                    <>
                      <Check className={cn('w-4 h-4 transition-all duration-200', canNavigate && 'group-hover/step:hidden')} />
                      <Edit3 className={cn('w-4 h-4 hidden transition-all duration-200', canNavigate && 'group-hover/step:block')} />
                    </>
                  ) : stepState?.status === 'thinking' ? (
                    <Loader size="small" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                  {step.label}
                </button>
                {i < STEPS.length - 1 && (
                  <div className="relative mx-2">
                    <ChevronRight className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isCompleted ? 'text-success' : 'text-border'
                    )} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-surface via-surface to-primary/5">
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Alan Working Indicator - Deep Research Style */}
          <AnimatePresence>
            {isAlanWorking && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-6 bg-gradient-to-r from-agent/5 via-primary/5 to-agent/5 border border-agent/20 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-agent to-primary flex items-center justify-center shadow-lg shadow-agent/25">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-agent mb-2">{alanStatus}</p>
                    <div className="space-y-2">
                      {alanThinkingSteps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-sm text-text-secondary"
                        >
                          <Check className="w-4 h-4 text-success" />
                          {step}
                        </motion.div>
                      ))}
                      {alanThinkingSteps.length < 4 && (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Loader size="small" color="var(--color-agent)" />
                          <span className="animate-pulse">Analyzing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {campaign.currentStep === 'context' && !campaign.derivedContext && (
              <ContextInputStep
                campaign={campaign}
                onUpdate={onUpdate}
                onSubmit={() =>
                  onLockStep('context', 'context', 'Alan is analyzing your campaign context...', [
                    'Parsing goal intent (clearance vs growth vs retention)',
                    'Identifying relevant customer signals',
                    'Evaluating channel and region implications',
                    'Generating strategic recommendations',
                  ], () => {
                    const ctx = deriveContext(campaign.goal, campaign.category!, campaign.channel || undefined, campaign.client)
                    return {
                      derivedContext: ctx,
                      detectedCategories: ctx.detectedCategories,
                      category: campaign.category || ctx.detectedCategories[0],
                    }
                  })
                }
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'context' && campaign.derivedContext && (
              <ContextDecisionStep
                campaign={campaign}
                onConfirm={() =>
                  onLockStep('context', 'segment', 'Alan is designing your segmentation strategy...', [
                    'Building MECE segment structure',
                    'Applying lifecycle and value clustering',
                    'Calculating segment volumes',
                    'Optimizing for campaign objective',
                  ], () => ({
                    name: campaign.derivedContext!.campaignName,
                    audienceStrategy: deriveAudienceStrategy(campaign.category!, campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId)
                  }))
                }
                onGoBack={() => {
                  onUpdate({ derivedContext: undefined })
                }}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'segment' && (
              <AudienceStep
                campaign={campaign}
                onConfirm={() =>
                  onLockStep('segment', 'product', 'Alan is matching products to segments...', [
                    'Analyzing inventory levels per category',
                    'Matching product affinity to segments',
                    'Applying margin protection rules',
                    'Finalizing product groups',
                  ], () => ({
                    offerMapping: deriveOfferMapping(campaign.category!, campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId)
                  }))
                }
                onGoBack={() => onGoToStep('context')}
                onUpdateStrategy={(strategy) => onUpdate({ audienceStrategy: strategy })}
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'product' && (
              <ProductStep
                campaign={campaign}
                onConfirm={() =>
                  onLockStep('product', 'promo', 'Alan is searching the promotion library...', [
                    'Scanning available promotions',
                    'Matching promos to product groups',
                    'Evaluating margin impact',
                    'Scoring promotion fit',
                  ], () => ({}))
                }
                onGoBack={() => onGoToStep('segment')}
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'promo' && (
              <OfferStep
                campaign={campaign}
                onGoBack={() => onGoToStep('product')}
                onConfirm={() => {
                  const segmentNames = campaign.audienceStrategy?.segments.map(s => s.name)
                  onLockStep('promo', 'creative', 'Alan is generating segment-specific creatives...', [
                    'Setting tone per segment',
                    'Generating headlines and copy',
                    'Matching imagery to messaging',
                    'Running compliance checks',
                  ], () => ({
                    creatives: deriveCreatives(campaign.category!, segmentNames, campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId),
                    promoSkipped: false
                  }))
                }}
                onSkipPromo={() => {
                  const segmentNames = campaign.audienceStrategy?.segments.map(s => s.name)
                  onLockStep('promo', 'creative', 'Alan is generating segment-specific creatives...', [
                    'Setting tone per segment',
                    'Generating headlines and copy',
                    'Matching imagery to messaging',
                    'Running compliance checks',
                  ], () => ({
                    creatives: deriveCreatives(campaign.category!, segmentNames, campaign.client, campaign.detectedCategories || campaign.derivedContext?.detectedCategories, campaign.selectedGoalId).map(c => ({ ...c, hasOffer: false, offerBadge: undefined })),
                    promoSkipped: true
                  }))
                }}
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'creative' && (
              <CreativeStep
                campaign={campaign}
                onApprove={(id) =>
                  onUpdate({
                    creatives: campaign.creatives?.map(c =>
                      c.id === id ? { ...c, approved: !c.approved } : c
                    )
                  })
                }
                onRegenerate={(id) => {
                  // Generate new creative content for this segment
                  const alternativeHeadlines = [
                    'Exclusive Offer Just for You',
                    'Don\'t Miss Out on Savings',
                    'Your Style, Your Price',
                    'Limited Time: Special Deal',
                    'Refresh Your Wardrobe Today',
                    'New Styles Await You',
                    'Shop the Latest Trends',
                  ]
                  const alternativeSubcopy = [
                    'Handpicked styles at prices you\'ll love',
                    'Shop now and save on your favorites',
                    'Discover new arrivals at amazing prices',
                    'Quality meets affordability',
                    'Treat yourself to something special',
                    'Curated just for you',
                    'Style that speaks to you',
                  ]
                  const randomHeadline = alternativeHeadlines[Math.floor(Math.random() * alternativeHeadlines.length)]
                  const randomSubcopy = alternativeSubcopy[Math.floor(Math.random() * alternativeSubcopy.length)]
                  
                  // Find the creative and update it
                  const updatedCreatives = campaign.creatives?.map(c => {
                    if (c.id === id) {
                      return { 
                        ...c, 
                        headline: randomHeadline,
                        subcopy: randomSubcopy,
                        approved: false // Reset approval on regenerate
                      }
                    }
                    return c
                  })
                  
                  if (updatedCreatives) {
                    onUpdate({ creatives: updatedCreatives })
                  }
                }}
                onConfirm={() =>
                  onLockStep('creative', 'review', 'Alan is validating your campaign...', [
                    'Checking all steps completed',
                    'Validating segment coverage',
                    'Confirming creative approvals',
                    'Preparing launch summary',
                  ], () => ({}))
                }
                onGoBack={() => onGoToStep('promo')}
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'review' && (
              <ReviewStep
                campaign={campaign}
                onGoBack={() => onGoToStep('creative')}
                onGoToStep={onGoToStep}
                onSaveDraft={onSaveDraft}
                onLaunch={() => {
                  onUpdate({ status: 'active' })
                  onExit()
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Assumption token type with confidence
type ConfidenceLevel = 'high' | 'medium' | 'low'
type AssumptionSource = 'assumed' | 'inferred' | 'confirmed'

interface AssumptionToken {
  id: string
  key: string
  value: string
  source: AssumptionSource
  confidence: ConfidenceLevel
  reason: string
  editable: boolean
}

// Business Goal → Campaign Playbook Mapping (1:1, no dynamic guessing)
// Fleet & Emergency Parts is strategically embedded (not isolated) — injected into PRO segments
const BUSINESS_GOAL_PLAYBOOKS = [
  // ── 3 ACTIONABLE GOALS ──
  {
    id: 'clear-inventory',
    icon: Package,
    iconGradient: 'from-warning to-warning/80',
    iconBg: 'bg-warning/10',
    label: 'Clear Inventory / Overstock',
    subtitle: '3 Categories — Brakes, Wipers, Filters',
    locked: false,
    campaignLabel: 'Multi-Category Clearance',
    goal: 'Clear excess inventory across Brake & Battery Essentials, Wiper & Visibility Products, and Air Filter & PCV Components by activating discount-led demand for DIY and repair buyers',
    client: 'autoparts' as const,
    interpretation: {
      summary: 'Alan has identified **excess inventory concentration** across fast-moving repair and maintenance categories. To accelerate sell-through, I will activate a **multi-category clearance strategy** focused on 3 high-pressure categories.',
      bullets: [
        'Drive immediate movement through discount-led demand',
        'Capture urgent repair needs (brakes, batteries)',
        'Increase basket size via low-friction add-ons like filters',
      ],
      context: {
        campaignType: 'Multi-Category Clearance Campaign',
        primaryIntent: 'Inventory Clearance + Basket Building',
        channel: 'Online + In-Store',
        productFocus: 'Brake & Battery · Wiper & Visibility · Air Filter & PCV',
        discountStrategy: 'Moderate to High (20–35%)',
        constraints: ['Protect margin thresholds on premium SKUs', 'Fleet & Emergency Parts injected for PRO urgency signals'],
      },
    },
    categories: [
      {
        name: 'Brake and Battery Essentials',
        imagePath: '/images/Brake and Battery Essentials',
        products: [
          { sku: 'SKU 2-12257635', name: 'Duralast Gold Brake Pads', image: '/images/Brake and Battery Essentials/SKU 2-12257635.webp' },
          { sku: 'SKU 2-12257833', name: 'Duralast Coated Rotors', image: '/images/Brake and Battery Essentials/SKU 2-12257833.webp' },
          { sku: 'SKU 2-12257842', name: 'Valucraft Battery 24F', image: '/images/Brake and Battery Essentials/SKU 2-12257842.webp' },
          { sku: 'SKU 2-12257867', name: 'Brake Hardware Kit', image: '/images/Brake and Battery Essentials/SKU 2-12257867.webp' },
        ],
      },
      {
        name: 'Wiper and Visibility Products',
        imagePath: '/images/Viper and Visibility Products',
        products: [
          { sku: 'SKU 6-11386730', name: 'Bosch Icon Beam Wiper 22"', image: '/images/Viper and Visibility Products/SKU 6-11386730.webp' },
          { sku: 'SKU 6-11688408', name: 'Rain-X Latitude Wiper 18"', image: '/images/Viper and Visibility Products/SKU 6-11688408.webp' },
          { sku: 'SKU 6-50014524', name: 'Sylvania Headlight Bulb', image: '/images/Viper and Visibility Products/SKU 6-50014524.webp' },
          { sku: 'SKU 6-7070036', name: 'Prestone Washer Fluid Gallon', image: '/images/Viper and Visibility Products/SKU 6-7070036.webp' },
        ],
      },
      {
        name: 'Air Filter & PCV Components',
        imagePath: '/images/Air Filter & PCV Components',
        products: [
          { sku: 'SKU 5-11592885', name: 'Fram Extra Guard Air Filter', image: '/images/Air Filter & PCV Components/SKU 5-11592885.webp' },
          { sku: 'SKU 5-22141637', name: 'STP Extended Life Filter', image: '/images/Air Filter & PCV Components/SKU 5-22141637.webp' },
          { sku: 'SKU 5-50065817', name: 'Cabin Air Filter Combo', image: '/images/Air Filter & PCV Components/SKU 5-50065817.webp' },
          { sku: 'SKU 5-50257773', name: 'PCV Valve Assembly', image: '/images/Air Filter & PCV Components/SKU 5-50257773.webp' },
        ],
      },
    ],
    segments: [
      { name: 'DIY Price-Sensitive Buyers', why: 'Most responsive to clearance-level discounts; high sell-through velocity on overstock SKUs' },
      { name: 'High-Intent Repair Buyers', why: 'Urgent repair needs (brakes, batteries) drive immediate conversion without heavy discounting' },
    ],
    outcome: 'Rapid inventory reduction + improved cash flow + higher conversion',
  },
  {
    id: 'accelerate-revenue',
    icon: TrendingUp,
    iconGradient: 'from-primary to-primary-dark',
    iconBg: 'bg-primary/10',
    label: 'Accelerate Core Category Revenue Growth',
    subtitle: '2 Categories — Oil Kits, Air Filters',
    locked: false,
    campaignLabel: 'Core Revenue Growth',
    goal: 'Drive consistent top-line growth through Oil Change & Filter Kits and Air Filter & PCV Components by expanding repeat purchase cycles and maintenance bundling',
    client: 'autoparts' as const,
    interpretation: {
      summary: 'Alan has identified **strong revenue expansion potential** in high-frequency maintenance categories. To drive consistent top-line growth, I will focus on **Oil Change & Filter Kits** and **Air Filter & PCV Components** — the two highest-repeat categories.',
      bullets: [
        'Increase repeat purchase cycles across maintenance categories',
        'Expand basket size through maintenance bundling (oil + filter kits)',
        'Capture both DIY and PRO maintenance demand',
      ],
      context: {
        campaignType: 'Core Revenue Growth Campaign',
        primaryIntent: 'Revenue Growth + Repeat Purchase',
        channel: 'Online + In-Store',
        productFocus: 'Oil Change & Filter Kits · Air Filter & PCV',
        discountStrategy: 'Low to Moderate (10–20%)',
        constraints: ['Protect premium brand margins', 'Bundle oil + filter kits for AOV lift'],
      },
    },
    categories: [
      {
        name: 'Oil Change & Filter Kits',
        imagePath: '/images/Oil Change & Filter Kits',
        products: [
          { sku: 'SKU 10558155', name: 'Mobil 1 Full Synthetic 5W-30 Kit', image: '/images/Oil Change & Filter Kits/SKU 10558155.webp' },
          { sku: 'SKU 10693169', name: 'Castrol EDGE 5W-30 Kit', image: '/images/Oil Change & Filter Kits/SKU 10693169.webp' },
          { sku: 'SKU 106931690', name: 'Valvoline High Mileage Kit', image: '/images/Oil Change & Filter Kits/SKU 106931690.webp' },
          { sku: 'SKU 50065372', name: 'Pennzoil Platinum 5W-30 Kit', image: '/images/Oil Change & Filter Kits/SKU 50065372.webp' },
        ],
      },
      {
        name: 'Air Filter & PCV Components',
        imagePath: '/images/Air Filter & PCV Components',
        products: [
          { sku: 'SKU 5-11592885', name: 'Fram Extra Guard Air Filter', image: '/images/Air Filter & PCV Components/SKU 5-11592885.webp' },
          { sku: 'SKU 5-22141637', name: 'STP Extended Life Filter', image: '/images/Air Filter & PCV Components/SKU 5-22141637.webp' },
          { sku: 'SKU 5-50065817', name: 'Cabin Air Filter Combo', image: '/images/Air Filter & PCV Components/SKU 5-50065817.webp' },
          { sku: 'SKU 5-50257773', name: 'PCV Valve Assembly', image: '/images/Air Filter & PCV Components/SKU 5-50257773.webp' },
        ],
      },
    ],
    segments: [
      { name: 'DIY Routine Maintenance Buyers', why: 'High-frequency repeat buyers (3–6 month oil change cycle); oil + filter bundles drive predictable revenue' },
      { name: 'PRO Fleet Operators', why: 'Volume orders on oil cases create stable B2B revenue stream with contract potential' },
    ],
    outcome: 'Sustained revenue growth + increased AOV + stronger repeat behavior',
  },
  {
    id: 'protect-margins',
    icon: Shield,
    iconGradient: 'from-success to-success/80',
    iconBg: 'bg-success/10',
    label: 'Protect Margins & Reduce Discount Dependency',
    subtitle: '1 Category — Bulk Maintenance (High Value)',
    locked: false,
    campaignLabel: 'Margin Protection — Bulk Program',
    goal: 'Improve profitability by shifting PRO and premium DIY buyers to volume-based bulk purchasing instead of blanket discounting on Bulk Maintenance Components',
    client: 'autoparts' as const,
    interpretation: {
      summary: 'Alan has identified **margin pressure driven by excessive discounting** in high-volume categories. To improve profitability, I will shift focus to **Bulk Maintenance Components** — a high-margin, volume-driven category that rewards bulk behavior over blanket discounts.',
      bullets: [
        'Prioritize bulk purchasing behavior from PRO customers',
        'Reduce reliance on blanket discounting',
        'Drive value through volume pricing instead of margin erosion',
      ],
      context: {
        campaignType: 'Margin Protection — Bulk Program',
        primaryIntent: 'Margin Expansion + PRO Engagement',
        channel: 'Direct Sales + Email + In-Store',
        productFocus: 'Bulk Maintenance Components',
        discountStrategy: 'Volume-based (5–15% on bulk orders only)',
        constraints: ['No blanket discounting', 'Fleet & Emergency Parts injected for PRO urgency signals'],
      },
    },
    categories: [
      {
        name: 'Bulk Maintenance Components',
        imagePath: '/images/Fleet & Emergency Part',
        products: [
          { sku: 'SKU 4-11089445', name: 'Bulk Brake Pad Set (Case of 12)', image: '/images/Fleet & Emergency Part/SKU 4-11089445.webp' },
          { sku: 'SKU 4-12071147', name: 'Fleet Oil Filter Multi-Pack', image: '/images/Fleet & Emergency Part/SKU 4-12071147.webp' },
          { sku: 'SKU 4-12430241', name: 'PRO Wiper Blade Assortment', image: '/images/Fleet & Emergency Part/SKU 4-12430241.webp' },
          { sku: 'SKU 4-50175300', name: 'Emergency Battery Kit (Bulk)', image: '/images/Fleet & Emergency Part/SKU 4-50175300.webp' },
        ],
      },
    ],
    segments: [
      { name: 'PRO Fleet Buyers', why: 'Bulk purchasing behavior from fleet operators drives volume-based margins without blanket discounting' },
      { name: 'Premium DIY Buyers', why: 'Brand-loyal customers who value quality over price; respond to value packs better than coupons' },
    ],
    outcome: 'Margin expansion + higher profitability per order + stronger PRO engagement',
  },
  // ── 5 LOCKED GOALS (coming soon) ──
  {
    id: 'increase-basket',
    icon: Package,
    iconGradient: 'from-primary to-primary-dark',
    iconBg: 'bg-primary/10',
    label: 'Increase Basket Size',
    subtitle: '2 Categories — Pet Toys, Pet Food',
    locked: false,
    campaignLabel: 'Pet Cross-Sell Bundles',
    goal: 'Increase average order value by cross-selling Pet Food & Treats with Pet Toys & Accessories through bundle-led offers and loyalty-friendly incentives',
    client: 'autoparts' as const,
    interpretation: {
      summary: 'Alan has identified a strong opportunity to **grow basket size** for pet shoppers by pairing essential purchases (food) with high-affinity add-ons (toys and accessories). I will activate a **bundle-first cross-sell strategy** across two pet categories.',
      bullets: [
        'Cross-sell toys and accessories with recurring pet food purchases',
        'Drive add-on attachment without heavy blanket discounting',
        'Use simple, high-clarity offers that convert fast',
      ],
      context: {
        campaignType: 'Cross-Sell + Bundle Campaign',
        primaryIntent: 'AOV Lift + Attach Rate',
        channel: 'Online + In-Store',
        productFocus: 'Pet Toys & Accessories · Pet Food & Treats',
        discountStrategy: 'Low to Moderate (BOGO / bundle-led)',
        constraints: ['Keep offers simple and high-clarity', 'Avoid blanket discounting on premium nutrition SKUs'],
      },
    },
    categories: [
      {
        name: 'Pet Food & Treats',
        imagePath: '/images/Pet Supplies',
        products: [
          { sku: 'PET-DOG-FOOD-001', name: 'Dog Food (Wet)', image: '/images/Pet Supplies/Dog Food Wet.png' },
          { sku: 'PET-DOG-FOOD-003', name: 'Dog Food (Dried)', image: '/images/Pet Supplies/Dog Food Dried.jpg' },
          { sku: 'PET-DOG-FOOD-002', name: 'Dog Food (Dry)', image: '/images/Pet Supplies/Dog Food Dry.jpg' },
          { sku: 'PET-CAT-FOOD-001', name: 'Cat Food (Wet)', image: '/images/Pet Supplies/Cat Food Wet.png' },
        ],
      },
      {
        name: 'Pet Toys & Accessories',
        imagePath: '/images/Pet Supplies',
        products: [
          { sku: 'PET-DOG-TOY-001', name: 'Dog Stuff Toy', image: '/images/Pet Supplies/Dog Stuff Toy.png' },
          { sku: 'PET-DOG-TOY-002', name: 'Dog Chew Toy', image: '/images/Pet Supplies/Dog Chew Toy.jpg' },
          { sku: 'PET-CAT-TOY-001', name: 'Cat Toy', image: '/images/Pet Supplies/Cat Toy 1.png' },
          { sku: 'PET-CAT-TOY-002', name: 'Cat Ball Toy', image: '/images/Pet Supplies/Cat Ball Toy.png' },
        ],
      },
    ],
    segments: [
      { name: 'Pet Food Loyalists', why: 'Recurring purchases with predictable cadence; strong propensity for add-on attachment when presented at checkout or in bundles' },
      { name: 'Toy & Accessory Shoppers', why: 'High engagement with fun, seasonal, and brand-led toy promotions; respond well to BOGO and bundle mechanics' },
    ],
    outcome: 'Higher attach rate + increased AOV + stronger bundle conversion',
  },
  {
    id: 'improve-conversion',
    icon: Zap,
    iconGradient: 'from-text-muted to-text-secondary',
    iconBg: 'bg-surface-secondary',
    label: 'Improve Conversion',
    subtitle: 'Cart abandonment & retargeting',
    locked: true,
    lockTooltip: 'Available in next release',
  },
  {
    id: 'retain-customers',
    icon: Users,
    iconGradient: 'from-success to-success/80',
    iconBg: 'bg-success/10',
    label: 'Retain Customers',
    subtitle: '2 Categories — Cat Rewards, Dog Care',
    locked: false,
    campaignLabel: 'Pet Loyalty & Lifecycle',
    goal: 'Improve retention by rewarding repeat pet purchases across Cat Rewards & Food and Dog Care & Nutrition with points, rewards, and service-led incentives',
    client: 'autoparts' as const,
    interpretation: {
      summary: 'Alan has identified an opportunity to **retain pet customers** by reinforcing repeat purchase behavior through rewards, points, and lifecycle messaging. I will activate a **loyalty-first retention strategy** across two core pet categories.',
      bullets: [
        'Reinforce repeat pet food purchases with rewards and points',
        'Keep premium shoppers engaged without relying on deep discounting',
        'Add service-led incentives to increase stickiness',
      ],
      context: {
        campaignType: 'Loyalty + Lifecycle Campaign',
        primaryIntent: 'Retention + Repeat Purchase',
        channel: 'Email + App + In-Store',
        productFocus: 'Cat Rewards & Food · Dog Care & Nutrition',
        discountStrategy: 'Rewards-led (points / rewards / targeted offers)',
        constraints: ['Protect premium nutrition margins', 'Use rewards mechanics over blanket discounts'],
      },
    },
    categories: [
      {
        name: 'Cat Rewards & Food',
        imagePath: '/images/Pet Supplies',
        products: [
          { sku: 'PET-CAT-FOOD-001', name: 'Cat Food (Wet)', image: '/images/Pet Supplies/Cat Food Wet.png' },
          { sku: 'PET-CAT-TOY-001', name: 'Cat Toy', image: '/images/Pet Supplies/Cat Toy 1.png' },
          { sku: 'PET-CAT-GROOM-001', name: 'Cat Grooming', image: '/images/Pet Supplies/Cat Grooming.jpg' },
          { sku: 'PET-CAT-LITTER-001', name: 'Cat Litter Box', image: '/images/Pet Supplies/Cat Litter Box.png' },
        ],
      },
      {
        name: 'Dog Care & Nutrition',
        imagePath: '/images/Pet Supplies',
        products: [
          { sku: 'PET-DOG-FOOD-002', name: 'Dog Food (Dry)', image: '/images/Pet Supplies/Dog Food Dry.jpg' },
          { sku: 'PET-DOG-FOOD-003', name: 'Dog Food (Dried)', image: '/images/Pet Supplies/Dog Food Dried.jpg' },
          { sku: 'PET-DOG-TOY-002', name: 'Dog Chew Toy', image: '/images/Pet Supplies/Dog Chew Toy.jpg' },
          { sku: 'PET-DOG-WEAR-001', name: 'Dog Wear', image: '/images/Pet Supplies/Dog Wear.png' },
        ],
      },
    ],
    segments: [
      { name: 'Cat Month Loyalists', why: 'High repeat behavior on cat essentials; rewards and points create strong retention loops during themed moments like Cat Month' },
      { name: 'Dog Care Regulars', why: 'Frequent nutrition and care purchases; respond to premium rewards and service-linked offers (grooming add-ons, food rewards)' },
    ],
    outcome: 'Higher repeat rate + improved loyalty engagement + reduced churn',
  },
  {
    id: 'win-back',
    icon: RefreshCw,
    iconGradient: 'from-text-muted to-text-secondary',
    iconBg: 'bg-surface-secondary',
    label: 'Win Back',
    subtitle: 'Lapsed customer re-engagement',
    locked: true,
    lockTooltip: 'Available in next release',
  },
  {
    id: 'seasonal-demand',
    icon: Calendar,
    iconGradient: 'from-text-muted to-text-secondary',
    iconBg: 'bg-surface-secondary',
    label: 'Seasonal Demand',
    subtitle: 'Weather & holiday driven campaigns',
    locked: true,
    lockTooltip: 'Available in next release',
  },
]

interface AgentState {
  phase: 'idle' | 'goal-selected' | 'interpreting' | 'hypothesizing' | 'clarifying' | 'ready'
  goalReceived: boolean
  hypotheses: { label: string; value: string; confidence: ConfidenceLevel }[]
  assumptions: AssumptionToken[]
  clarifications: { id: string; question: string; optional: boolean; answer: string }[]
  nextAction: string
}

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
  const [agentState, setAgentState] = useState<AgentState>({
    phase: 'idle',
    goalReceived: false,
    hypotheses: [],
    assumptions: [],
    clarifications: [],
    nextAction: ''
  })
  const [isPaused, setIsPaused] = useState(false)
  const [editingAssumption, setEditingAssumption] = useState<string | null>(null)
  const [selectedBusinessGoal, setSelectedBusinessGoal] = useState<typeof BUSINESS_GOAL_PLAYBOOKS[number] | null>(null)
  const [isInterpretationDone, setIsInterpretationDone] = useState(false)
  const [showInterpretation, setShowInterpretation] = useState(false)

  const canSubmit = campaign.goal && campaign.goal.trim().length > 10

  // Generate a proper campaign name from goal
  const generateCampaignName = (goal: string): string => {
    const lowerGoal = goal.toLowerCase()
    
    // Extract key elements
    let intent = ''
    let audience = ''
    let category = ''
    
    if (lowerGoal.includes('clear') || lowerGoal.includes('inventory') || lowerGoal.includes('excess')) {
      intent = 'Clearance'
    } else if (lowerGoal.includes('repeat') || lowerGoal.includes('retention')) {
      intent = 'Retention'
    } else if (lowerGoal.includes('vip')) {
      intent = 'VIP'
    } else if (lowerGoal.includes('full-price') || lowerGoal.includes('sell-through')) {
      intent = 'Full-Price'
    } else {
      intent = 'Engagement'
    }
    
    if (lowerGoal.includes('vip')) audience = 'VIP'
    else if (lowerGoal.includes('new customer')) audience = 'New Customers'
    
    if (lowerGoal.includes('kids') || lowerGoal.includes('children')) category = 'Kids'
    else if (lowerGoal.includes('women')) category = 'Women\'s'
    else if (lowerGoal.includes('men')) category = 'Men\'s'
    else if (lowerGoal.includes('apparel')) category = 'Apparel'
    else if (lowerGoal.includes('footwear') || lowerGoal.includes('shoes')) category = 'Footwear'
    
    const parts = [category, audience, intent, 'Campaign'].filter(Boolean)
    return parts.join(' ')
  }

  // Derive hypotheses from goal
  const deriveHypotheses = (goal: string) => {
    const hypotheses: { label: string; value: string; confidence: ConfidenceLevel }[] = []
    const lowerGoal = goal.toLowerCase()
    
    // Primary intent
    if (lowerGoal.includes('clear') || lowerGoal.includes('overstock') || lowerGoal.includes('inventory')) {
      hypotheses.push({ label: 'Primary intent', value: 'Inventory clearance', confidence: 'high' })
    } else if (lowerGoal.includes('repeat') || lowerGoal.includes('loyalty') || lowerGoal.includes('vip')) {
      hypotheses.push({ label: 'Primary intent', value: 'Customer retention', confidence: 'high' })
    } else if (lowerGoal.includes('new') || lowerGoal.includes('acquire')) {
      hypotheses.push({ label: 'Primary intent', value: 'Customer acquisition', confidence: 'high' })
    } else {
      hypotheses.push({ label: 'Primary intent', value: 'Engagement campaign', confidence: 'medium' })
    }
    
    // Constraint detection
    if (lowerGoal.includes('margin') || lowerGoal.includes('protect')) {
      hypotheses.push({ label: 'Constraint', value: 'Margin protection required', confidence: 'high' })
    }
    
    // Channel inference
    if (lowerGoal.includes('online')) {
      hypotheses.push({ label: 'Likely channel', value: 'Online', confidence: 'high' })
    } else if (lowerGoal.includes('store')) {
      hypotheses.push({ label: 'Likely channel', value: 'In-store', confidence: 'high' })
    } else {
      hypotheses.push({ label: 'Likely channel', value: 'Online (default)', confidence: 'medium' })
    }
    
    // Risk identification
    if (lowerGoal.includes('clear') && !lowerGoal.includes('margin')) {
      hypotheses.push({ label: 'Risk', value: 'Over-discounting VIP customers', confidence: 'medium' })
    }
    
    return hypotheses
  }

  // Generate assumptions from hypotheses
  const generateAssumptions = (hypotheses: { label: string; value: string; confidence: ConfidenceLevel }[], _client?: 'autoparts', _goal?: string) => {
    const assumptions: AssumptionToken[] = []
    
    // Channel assumption — Auto Parts: DIY Online-first, PRO Omni
    const channelHypo = hypotheses.find(h => h.label === 'Likely channel')
    const isPROGoal = hypotheses.some(h => h.label === 'Primary intent' && (h.value.includes('PRO') || h.value.includes('fleet') || h.value.includes('shop')))
    if (channelHypo && channelHypo.confidence !== 'high') {
      assumptions.push({
        id: 'channel',
        key: 'Channel',
        value: isPROGoal ? 'Omni (PRO Store Priority)' : 'Online-first (DIY)',
        source: 'assumed',
        confidence: 'medium',
        reason: isPROGoal ? 'PRO customers prefer store pickup and bulk ordering' : 'DIY customers prefer online ordering with pickup option',
        editable: true
      })
    }
    
    // Discount strategy — tiered by intent
    const hasMarginConstraint = hypotheses.some(h => h.label === 'Constraint' && h.value.includes('Margin'))
    const isClearance = hypotheses.some(h => h.label === 'Primary intent' && h.value.includes('clearance'))
    const isRepairIntent = hypotheses.some(h => h.label === 'Primary intent' && (h.value.includes('repair') || h.value.includes('emergency')))
    assumptions.push({
      id: 'discount',
      key: 'Discount Strategy',
      value: isClearance ? 'Clearance: 40%+' : isRepairIntent ? 'Competitive: 20-35%' : hasMarginConstraint ? 'Conservative: 10-15%' : 'Maintenance: 10-20%',
      source: 'inferred',
      confidence: hasMarginConstraint ? 'high' : 'medium',
      reason: isClearance 
        ? 'Clearance intent detected — deep discounts on overstock'
        : isRepairIntent 
          ? 'Repair urgency supports competitive pricing'
          : hasMarginConstraint 
            ? 'Margin protection mentioned in goal'
            : 'Standard maintenance discount tier applied',
      editable: true
    })
    
    // Product scope — category-driven with fitment
    const categoryHypo = hypotheses.find(h => h.label === 'Category focus')
    let productScope = categoryHypo ? `${categoryHypo.value} — Fitment validated` : 'Full category — Fitment validated'
    let scopeConfidence: ConfidenceLevel = categoryHypo ? 'high' : 'low'
    let scopeReason = categoryHypo ? `Category detected: ${categoryHypo.value}` : 'No specific category mentioned — will include all auto parts categories'
    
    assumptions.push({
      id: 'scope',
      key: 'Product Scope',
      value: productScope,
      source: categoryHypo ? 'confirmed' : 'assumed',
      confidence: scopeConfidence,
      reason: scopeReason,
      editable: true
    })

    // Vehicle fitment assumption
    assumptions.push({
      id: 'fitment',
      key: 'Vehicle Fitment',
      value: 'Include only compatible SKUs',
      source: 'assumed',
      confidence: 'high',
      reason: 'All auto parts campaigns require vehicle fitment validation',
      editable: true
    })
    
    return assumptions
  }

  // Generate optional clarifications based on low-confidence assumptions
  const generateClarifications = (assumptions: AssumptionToken[]) => {
    const clarifications: { id: string; question: string; optional: boolean; answer: string }[] = []
    
    const lowConfidence = assumptions.filter(a => a.confidence === 'low' || a.confidence === 'medium')
    
    if (lowConfidence.some(a => a.id === 'channel')) {
      clarifications.push({
        id: 'channel',
        question: 'Should this campaign include in-store traffic, or focus on online only?',
        optional: true,
        answer: ''
      })
    }
    
    if (lowConfidence.some(a => a.id === 'scope')) {
      clarifications.push({
        id: 'scope',
        question: `Are there specific ${campaign.category || 'product'} sub-categories to prioritize?`,
        optional: true,
        answer: ''
      })
    }
    
    return clarifications
  }

  // Handle business goal selection (skip locked goals)
  const handleSelectBusinessGoal = (goalPlaybook: typeof BUSINESS_GOAL_PLAYBOOKS[number]) => {
    if (goalPlaybook.locked) return
    setSelectedBusinessGoal(goalPlaybook)
    const playbookCategories = (goalPlaybook.categories || []).map(c => c.name).filter(Boolean)
    onUpdate({
      goal: goalPlaybook.goal!,
      client: goalPlaybook.client!,
      selectedGoalId: goalPlaybook.id,
      // Ensure category/title context is correct for non-auto-parts goals (e.g., Pet flows)
      category: playbookCategories[0] || null,
      detectedCategories: playbookCategories.length ? playbookCategories : undefined,
    })
  }

  // Handle goal submission - starts the reasoning canvas
  const handleSubmitGoal = async () => {
    if (isPaused) return
    
    // Generate and set proper campaign name
    const campaignName = generateCampaignName(campaign.goal)
    onUpdate({ name: campaignName })

    // If we have a business goal selected, show interpretation first
    if (selectedBusinessGoal) {
      setAgentState(prev => ({ ...prev, phase: 'goal-selected', goalReceived: true }))
      setShowInterpretation(true)
      // Animate interpretation appearing
      await new Promise(resolve => setTimeout(resolve, 800))
      setIsInterpretationDone(true)
      // Wait for user to review interpretation before proceeding
      return
    }
    
    // Phase 1: Interpreting
    setAgentState(prev => ({ ...prev, phase: 'interpreting', goalReceived: true }))
    await new Promise(resolve => setTimeout(resolve, 1200))
    if (isPaused) return
    
    // Phase 2: Hypothesizing
    const hypotheses = deriveHypotheses(campaign.goal)
    setAgentState(prev => ({ 
      ...prev, 
      phase: 'hypothesizing', 
      hypotheses,
      nextAction: 'Form initial hypotheses about your campaign'
    }))
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (isPaused) return
    
    // Phase 3: Generate assumptions
    const assumptions = generateAssumptions(hypotheses, campaign.client, campaign.goal)
    const clarifications = generateClarifications(assumptions)
    
    setAgentState(prev => ({ 
      ...prev, 
      phase: clarifications.length > 0 ? 'clarifying' : 'ready',
      assumptions,
      clarifications,
      nextAction: clarifications.length > 0 
        ? 'I can proceed with assumptions, or you can clarify now'
        : 'Ready to build customer segments'
    }))
  }

  // Handle continue after interpretation review — for playbook goals, skip hypothesis/assumption flow entirely
  const handleContinueAfterInterpretation = async () => {
    if (isPaused) return

    // Playbook goals already have deterministic context — skip hypothesis/assumption/clarification
    // Set detectedCategories from playbook so downstream steps (Products, Promos) use correct categories
    if (selectedBusinessGoal?.categories) {
      const playbookCategoryNames = selectedBusinessGoal.categories.map(c => c.name)
      onUpdate({
        detectedCategories: playbookCategoryNames,
        category: playbookCategoryNames[0],
      })
    }

    // Go straight to ready and auto-authorize
    setAgentState(prev => ({
      ...prev,
      phase: 'ready',
      nextAction: 'Ready to build customer segments'
    }))

    // Brief pause for UI feedback, then auto-authorize
    await new Promise(resolve => setTimeout(resolve, 600))
    if (isPaused) return
    onSubmit()
  }

  // Handle proceeding with assumptions
  const handleProceedWithAssumptions = () => {
    setAgentState(prev => ({ 
      ...prev, 
      phase: 'ready',
      nextAction: 'Ready to build customer segments'
    }))
  }

  // Handle clarification answer
  const handleClarificationAnswer = (id: string, answer: string) => {
    setAgentState(prev => ({
      ...prev,
      clarifications: prev.clarifications.map(c => 
        c.id === id ? { ...c, answer } : c
      )
    }))
  }

  // Handle assumption edit
  const handleAssumptionEdit = (id: string, newValue: string) => {
    setAgentState(prev => ({
      ...prev,
      assumptions: prev.assumptions.map(a => 
        a.id === id ? { ...a, value: newValue, source: 'confirmed' as AssumptionSource, confidence: 'high' as ConfidenceLevel } : a
      )
    }))
    setEditingAssumption(null)
  }

  // Handle final authorization
  const handleAuthorize = () => {
    // Update campaign with confirmed values
    const channelAssumption = agentState.assumptions.find(a => a.id === 'channel')
    if (channelAssumption) {
      onUpdate({ channel: channelAssumption.value.toLowerCase() })
    }
    onSubmit()
  }

  // Reset to start
  const handleReset = () => {
    setAgentState({
      phase: 'idle',
      goalReceived: false,
      hypotheses: [],
      assumptions: [],
      clarifications: [],
      nextAction: ''
    })
    setIsPaused(false)
    setSelectedBusinessGoal(null)
    setIsInterpretationDone(false)
    setShowInterpretation(false)
  }

  // Confidence badge color
  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'high': return 'bg-success/10 text-success border-success/20'
      case 'medium': return 'bg-warning/10 text-warning border-warning/20'
      case 'low': return 'bg-danger/10 text-danger border-danger/20'
    }
  }

  // Source badge
  const getSourceBadge = (source: AssumptionSource) => {
    switch (source) {
      case 'assumed': return { icon: '🟡', label: 'Assumed' }
      case 'inferred': return { icon: '🟠', label: 'Inferred' }
      case 'confirmed': return { icon: '🟢', label: 'Confirmed' }
    }
  }

  return (
    <div className="relative">
      {/* Agent Control Rail - Persistent */}
      {agentState.phase !== 'idle' && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "p-2.5 rounded-lg border shadow-lg transition-all",
              isPaused 
                ? "bg-warning/10 border-warning/30 text-warning" 
                : "bg-surface border-border text-text-muted hover:text-text-primary"
            )}
            title={isPaused ? "Resume agent" : "Pause agent"}
          >
            {isPaused ? <RefreshCw className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <Tooltip title="Edit assumptions" orientation="left">
            <button
              onClick={() => setEditingAssumption(editingAssumption ? null : 'any')}
              className="p-2.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary shadow-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip title="Roll back" orientation="left">
            <button
              onClick={handleReset}
              className="p-2.5 rounded-lg border border-border bg-surface text-text-muted hover:text-danger shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Single Reasoning Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* Goal Input - Always visible, collapses when submitted */}
        <motion.div
          layout="position"
          className={cn(
            "rounded-2xl border transition-all overflow-hidden",
            agentState.goalReceived 
              ? "bg-surface border-border" 
              : "bg-gradient-to-br from-primary/5 via-agent/5 to-primary/10 border-primary/10"
          )}
        >
          {!agentState.goalReceived ? (
            <motion.div 
              className="p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Header */}
              <motion.div 
                className="flex items-center gap-4 mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-agent flex items-center justify-center shadow-lg shadow-primary/25"
                  animate={{ 
                    boxShadow: ['0 10px 25px -5px rgba(99, 102, 241, 0.25)', '0 10px 35px -5px rgba(99, 102, 241, 0.4)', '0 10px 25px -5px rgba(99, 102, 241, 0.25)']
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Target className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">What do you want to achieve?</h2>
                  <p className="text-sm text-text-secondary">Select a business goal to get started</p>
                </div>
              </motion.div>

              {/* Actionable Business Goals (single-select) */}
              <motion.div
                className="space-y-3 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {BUSINESS_GOAL_PLAYBOOKS.filter(g => !g.locked).map((goalPlaybook, i) => {
                  const GoalIcon = goalPlaybook.icon
                  const isSelected = selectedBusinessGoal?.id === goalPlaybook.id
                  return (
                  <motion.button
                    key={goalPlaybook.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                    onClick={() => handleSelectBusinessGoal(goalPlaybook)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      isSelected
                        ? `bg-gradient-to-br ${goalPlaybook.iconGradient} shadow-lg`
                        : goalPlaybook.iconBg
                    )}>
                      <GoalIcon className={cn(
                        "w-5 h-5 transition-colors",
                        isSelected ? "text-white" : "text-text-secondary"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-semibold mb-0.5 transition-colors",
                        isSelected ? "text-primary" : "text-text-primary group-hover:text-primary"
                      )}>
                        {goalPlaybook.label}
                      </p>
                      <p className="text-xs text-text-muted">{goalPlaybook.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                      <ArrowRight className={cn(
                        "w-4 h-4 transition-all",
                        isSelected
                          ? "text-primary opacity-100"
                          : "text-text-muted opacity-0 group-hover:opacity-100"
                      )} />
                    </div>
                  </motion.button>
                  )
                })}
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Locked Goals */}
              <motion.div
                className="space-y-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {BUSINESS_GOAL_PLAYBOOKS.filter(g => g.locked).map((goalPlaybook) => {
                  const GoalIcon = goalPlaybook.icon
                  return (
                    <div
                      key={goalPlaybook.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border bg-surface-secondary/50 opacity-60 cursor-not-allowed"
                      title={goalPlaybook.lockTooltip || 'Available in next release'}
                    >
                      <div className="w-5 h-5 rounded border-2 border-border flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", goalPlaybook.iconBg)}>
                        <GoalIcon className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-muted">{goalPlaybook.label}</p>
                        <p className="text-xs text-text-muted">{goalPlaybook.subtitle}</p>
                      </div>
                      <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full border border-border">Coming Soon</span>
                    </div>
                  )
                })}
              </motion.div>

              {/* Selected Goal Preview */}
              <AnimatePresence>
                {selectedBusinessGoal && selectedBusinessGoal.campaignLabel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 p-4 bg-primary/5 border border-primary/15 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">
                          Mapped Campaign → {selectedBusinessGoal.campaignLabel}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{selectedBusinessGoal.goal}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Submit Button */}
              <motion.div 
                className="flex justify-end mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Button
                  variant="primary"
                  onClick={handleSubmitGoal}
                  disabled={!canSubmit}
                  size="sm"
                  className="gap-2 shadow-lg shadow-primary/25"
                >
                  <motion.div
                    animate={canSubmit ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Submit to Alan
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-text-primary font-medium">{campaign.goal}</span>
              </div>
              <button 
                onClick={handleReset}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Edit
              </button>
            </div>
          )}
        </motion.div>

        {/* Alan's Interpretation Card — shows when business goal selected */}
        <AnimatePresence>
          {showInterpretation && selectedBusinessGoal && selectedBusinessGoal.interpretation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-gradient-to-br from-agent/5 via-primary/5 to-agent/10 border border-agent/20 rounded-2xl overflow-hidden"
            >
              {/* Header — Alan's Story */}
              <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-agent to-primary flex items-center justify-center shadow-lg shadow-agent/25 flex-shrink-0"
                  animate={{ boxShadow: ['0 8px 20px -4px rgba(139, 92, 246, 0.25)', '0 8px 30px -4px rgba(139, 92, 246, 0.4)', '0 8px 20px -4px rgba(139, 92, 246, 0.25)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-agent mb-1">Alan's Strategy</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-sm text-text-primary leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedBusinessGoal.interpretation.summary
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
                    }}
                  />
                </div>
              </div>

              {/* This campaign will: */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isInterpretationDone ? 1 : 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="px-6 pb-4"
              >
                <p className="text-xs font-medium text-text-muted mb-2.5">This campaign will:</p>
                <div className="space-y-2">
                  {selectedBusinessGoal.interpretation.bullets.map((bullet, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isInterpretationDone ? 1 : 0, x: isInterpretationDone ? 0 : -10 }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-agent flex-shrink-0" />
                      <span className="text-sm text-text-secondary">{bullet}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Context Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isInterpretationDone ? 1 : 0, y: isInterpretationDone ? 0 : 10 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mx-6 mb-4 bg-surface/70 backdrop-blur border border-border rounded-xl p-5"
              >
                <p className="text-xs font-semibold text-text-muted mb-4 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Context from Goal
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Campaign Type', value: selectedBusinessGoal.interpretation.context.campaignType },
                    { label: 'Primary Intent', value: selectedBusinessGoal.interpretation.context.primaryIntent },
                    { label: 'Channel', value: selectedBusinessGoal.interpretation.context.channel },
                    { label: 'Product Focus', value: selectedBusinessGoal.interpretation.context.productFocus },
                    { label: 'Discount Strategy', value: selectedBusinessGoal.interpretation.context.discountStrategy },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-xs text-text-muted font-medium mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-text-primary">{item.value}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-text-muted font-medium mb-1">Constraints</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBusinessGoal.interpretation.context.constraints.map((c, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Categories (names only — products & segments come in their own flow steps) */}
              {isInterpretationDone && selectedBusinessGoal.categories && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mx-6 mb-4"
                >
                  <p className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Focus Categories
                  </p>
                  <div className="space-y-2">
                    {selectedBusinessGoal.categories.map((cat, ci) => (
                      <motion.div
                        key={ci}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + ci * 0.15 }}
                        className="flex items-center gap-3 px-4 py-3 bg-surface/70 backdrop-blur border border-border rounded-xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Outcome */}
              {isInterpretationDone && selectedBusinessGoal.outcome && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mx-6 mb-6 p-4 bg-success/5 border border-success/15 rounded-xl"
                >
                  <p className="text-xs font-semibold text-success mb-1 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Expected Outcome
                  </p>
                  <p className="text-sm font-medium text-success">{selectedBusinessGoal.outcome}</p>
                </motion.div>
              )}

              {/* Continue Button */}
              {isInterpretationDone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="px-6 pb-6 flex justify-end"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleContinueAfterInterpretation}
                    className="gap-2 shadow-lg shadow-primary/25"
                  >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Continue — Build Campaign
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Intent Statement */}
        {agentState.phase !== 'idle' && agentState.phase !== 'goal-selected' && (
          <div className="bg-agent/5 border border-agent/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-agent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-agent" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-agent mb-2">Alan's Plan</p>
                <div className="space-y-1">
                  <div className={cn("flex items-center gap-2 text-sm", agentState.phase === 'interpreting' ? 'text-text-primary' : 'text-text-muted')}>
                    {agentState.phase === 'interpreting' ? <Loader size="small" /> : <Check className="w-3 h-3" />}
                    <span>Interpret your goal</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", agentState.phase === 'hypothesizing' ? 'text-text-primary' : agentState.hypotheses.length > 0 ? 'text-text-muted' : 'text-text-muted/50')}>
                    {agentState.phase === 'hypothesizing' ? <Loader size="small" /> : agentState.hypotheses.length > 0 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Form initial hypotheses</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", agentState.phase === 'clarifying' || agentState.phase === 'ready' ? 'text-text-primary' : 'text-text-muted/50')}>
                    {agentState.assumptions.length > 0 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Validate assumptions before building segments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hypotheses Block */}
        {agentState.hypotheses.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-text-muted mb-3">Initial Hypotheses</p>
            <div className="grid grid-cols-2 gap-2">
              {agentState.hypotheses.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                  <div>
                    <p className="text-xs text-text-muted">{h.label}</p>
                    <p className="text-sm font-medium text-text-primary">{h.value}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full border",
                    getConfidenceColor(h.confidence)
                  )}>
                    {h.confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assumption Tokens */}
        {agentState.assumptions.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-muted">Assumptions</p>
              <p className="text-xs text-text-muted">Click to edit</p>
            </div>
            <div className="space-y-2">
              {agentState.assumptions.map((a) => (
                <div 
                  key={a.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    editingAssumption === a.id 
                      ? "bg-primary/5 border-primary/30" 
                      : "bg-surface-secondary border-transparent hover:border-border cursor-pointer"
                  )}
                  onClick={() => a.editable && setEditingAssumption(a.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{getSourceBadge(a.source).icon}</span>
                    <div>
                      <p className="text-xs text-text-muted">{a.key}</p>
                      {editingAssumption === a.id ? (
                        <input
                          type="text"
                          value={a.value}
                          onChange={(e) => handleAssumptionEdit(a.id, e.target.value)}
                          onBlur={() => setEditingAssumption(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingAssumption(null)}
                          className="text-sm font-medium text-text-primary bg-transparent border-b border-primary focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium text-text-primary">{a.value}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      getConfidenceColor(a.confidence)
                    )}>
                      {a.confidence} confidence
                    </span>
                    <span className="text-xs text-text-muted px-2 py-0.5 bg-surface rounded-full">
                      {getSourceBadge(a.source).label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Clarifications */}
        {agentState.phase === 'clarifying' && agentState.clarifications.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Optional Clarifications</p>
                <p className="text-xs text-text-muted mt-0.5">I can proceed with reasonable assumptions, or you can clarify now.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {agentState.clarifications.map((c) => (
                <div key={c.id} className="p-3 bg-surface-secondary rounded-lg">
                  <p className="text-sm text-text-primary mb-2">{c.question}</p>
                  <input
                    type="text"
                    value={c.answer}
                    onChange={(e) => handleClarificationAnswer(c.id, e.target.value)}
                    placeholder="Leave blank to use assumption..."
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleProceedWithAssumptions}
                className="flex-1"
              >
                Proceed with my assumptions
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Apply clarifications to assumptions
                  agentState.clarifications.forEach(c => {
                    if (c.answer.trim()) {
                      handleAssumptionEdit(c.id, c.answer)
                    }
                  })
                  handleProceedWithAssumptions()
                }}
                className="flex-1"
              >
                Apply & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Ready State - Authorization */}
        {agentState.phase === 'ready' && (
          <div className="bg-success/5 border border-success/20 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-success mb-1">Ready to proceed</p>
                <p className="text-sm text-text-secondary mb-4">
                  Based on your earlier emphasis on <span className="font-medium">{agentState.hypotheses[0]?.value.toLowerCase()}</span>, 
                  I will now build customer segments optimized for this goal.
                </p>
                <Button
                  variant="primary"
                  onClick={handleAuthorize}
                  disabled={isWorking}
                  className="gap-2"
                >
                  {isWorking ? (
                    <>
                      <Loader size="small" />
                      Building segments...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Authorize Alan to build customer segments
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Paused State */}
        {isPaused && (
          <div className="fixed inset-0 bg-black/20 z-30 flex items-center justify-center">
            <div className="bg-surface rounded-xl border border-warning/30 p-6 shadow-xl max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <Pause className="w-5 h-5 text-warning" />
                <p className="font-medium text-text-primary">Agent Paused</p>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Alan is paused. You can edit assumptions or roll back to a previous state.
              </p>
              <Button variant="primary" onClick={() => setIsPaused(false)} className="w-full">
                Resume Agent
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ContextDecisionStep({
  campaign,
  onConfirm,
  onGoBack,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onGoBack: () => void
  isWorking: boolean
}) {
  const derived = campaign.derivedContext!
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustFeedback, setAdjustFeedback] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Adjust Inputs Modal */}
      <Modal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Alan is listening"
        size="medium"
        primaryButtonLabel="Re-analyze"
        onPrimaryButtonClick={() => { setShowAdjustModal(false); onGoBack() }}
        primaryButtonProps={{ disabled: !adjustFeedback.trim() }}
        secondaryButtonLabel="Cancel"
        onSecondaryButtonClick={() => setShowAdjustModal(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tell me what you'd like to change about the campaign strategy. I'll re-analyze based on your feedback.
          </p>
          <textarea
            value={adjustFeedback}
            onChange={(e) => setAdjustFeedback(e.target.value)}
            placeholder="e.g., Focus more on high-value customers, reduce discount depth, target a different region..."
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agent/50 resize-none h-32"
          />
          <div>
            <p className="text-xs text-text-muted mb-2">Quick adjustments:</p>
            <div className="flex flex-wrap gap-2">
              {['Change target audience', 'Adjust discount levels', 'Different campaign type', 'Modify timeline'].map(s => (
                <button
                  key={s}
                  onClick={() => setAdjustFeedback(s)}
                  className="px-3 py-1.5 bg-surface-secondary border border-border rounded-lg text-xs text-text-secondary hover:border-agent/50 hover:text-agent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

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
          {/* Context Snapshot - Full Chat Context */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-primary">Context from Goal</p>
            </div>
            
            {/* Original Goal */}
            <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs text-text-muted mb-1">Your Goal</p>
              <p className="text-sm text-text-primary leading-relaxed font-medium">
                "{campaign.goal}"
              </p>
            </div>

            {/* Derived Understanding */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted mb-1">Category</p>
                <p className="text-sm text-text-primary font-medium">{campaign.category || 'Auto-detected'}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted mb-1">Region</p>
                <p className="text-sm text-text-primary font-medium">{campaign.region || 'US (default)'}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted mb-1">Lookback</p>
                <p className="text-sm text-text-primary font-medium">{campaign.lookbackWindow}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted mb-1">Margin Protection</p>
                <p className="text-sm text-text-primary font-medium">{derived.marginProtection || 'Standard'}</p>
              </div>
            </div>

            {/* Assumptions */}
            <div>
              <p className="text-xs text-text-muted mb-2">Assumptions Made</p>
              <div className="flex flex-wrap gap-2">
                {derived.assumptions.map((a, i) => (
                  <span 
                    key={i} 
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full",
                      a.isAssumed 
                        ? "bg-warning/10 text-warning border border-warning/20" 
                        : "bg-success/10 text-success border border-success/20"
                    )}
                  >
                    {a.isAssumed ? '🟡' : '🟢'} {a.key}: {a.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Type */}
          <div className="flex items-start gap-4 p-4 bg-surface-secondary rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">Campaign Type</p>
              <p className="text-lg font-semibold text-text-primary">{derived.campaignType}</p>
              <p className="text-sm text-text-secondary mt-1">
                Suggested name: <span className="font-medium text-text-primary">{derived.campaignName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted mb-1">Est. Universe</p>
              <p className="text-lg font-semibold text-primary">
                {derived.estimatedUniverse.toLocaleString()}
              </p>
            </div>
          </div>

          {/* What Alan Is Optimizing For */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-agent" />
              <p className="font-medium text-text-primary">What Alan Is Optimizing For</p>
            </div>
            <ul className="space-y-2">
              {(derived.campaignType === 'Clearance Push' || derived.campaignType === 'Holiday Promotion'
                ? ['Clearing excess inventory efficiently', 'Maintaining brand trust', 'Protecting long-term customer value']
                : derived.campaignType === 'VIP Retention'
                ? ['Maximizing customer lifetime value', 'Strengthening VIP relationships', 'Driving repeat purchase behavior']
                : derived.campaignType === 'Full-Price Promotion'
                ? ['Maximizing full-price sell-through', 'Preserving brand premium positioning', 'Targeting high-intent customers']
                : ['Driving customer engagement', 'Balancing reach and relevance', 'Optimizing conversion efficiency']
              ).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Sparkles className="w-4 h-4 text-agent mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What Alan Will Enforce */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <p className="font-medium text-text-primary">What Alan Will Enforce</p>
            </div>
            <ul className="space-y-2">
              {derived.guardrails.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Why this works */}
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <p className="text-sm font-medium text-success mb-1">Why this approach works</p>
            <p className="text-sm text-text-secondary">
              {derived.campaignType === 'Clearance Push' 
                ? 'This strategy balances inventory clearance with margin protection by targeting price-sensitive segments with appropriate discounts while preserving brand value.'
                : derived.campaignType === 'VIP Retention'
                ? 'This strategy focuses on retaining high-value customers through personalized experiences and exclusive offers, avoiding heavy discounts that could devalue the relationship.'
                : derived.campaignType === 'Full-Price Promotion'
                ? 'This strategy emphasizes product value and exclusivity to drive full-price conversions, targeting customers who prioritize quality over discounts.'
                : 'This strategy targets engaged customers with relevant messaging to drive conversions while maintaining healthy margins.'
              }
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="tertiary" onClick={() => setShowAdjustModal(true)}>
            <Edit3 className="w-4 h-4 mr-2" /> Adjust Inputs
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm & Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Mock Segment Library - segments that already exist
const SEGMENT_LIBRARY = [
  { id: 'lib-seg-1', name: 'Fashion Forward VIPs', category: 'Apparel' },
  { id: 'lib-seg-2', name: 'Seasonal Shoppers', category: 'Apparel' },
  { id: 'lib-seg-3', name: 'VIP Promo-Responsive', category: 'General' },
  { id: 'lib-seg-4', name: 'High-Value Parents', category: 'Kids' },
  { id: 'lib-seg-5', name: 'Tech Enthusiasts', category: 'Electronics' },
  { id: 'lib-seg-6', name: 'Deal Hunters', category: 'General' },
]

function AudienceStep({
  campaign,
  onConfirm,
  onGoBack,
  onUpdateStrategy,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onGoBack: () => void
  onUpdateStrategy: (strategy: Campaign['audienceStrategy']) => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const strategy = campaign.audienceStrategy
  const [scopeValue, setScopeValue] = useState(50) // 0-100 slider, 50 is default
  const [baseStrategy] = useState(strategy) // Store original for calculations
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [changeHighlight, setChangeHighlight] = useState<string | null>(null)
  const [prevScopeValue, setPrevScopeValue] = useState(50)

  // Check if segment exists in library
  const isFromLibrary = (segmentName: string) => {
    return SEGMENT_LIBRARY.some(libSeg => 
      segmentName.toLowerCase().includes(libSeg.name.toLowerCase().split(' ')[0]) ||
      libSeg.name.toLowerCase().includes(segmentName.toLowerCase().split(' ')[0])
    )
  }

  // Count library vs new segments
  const librarySegments = strategy?.segments.filter(s => isFromLibrary(s.name)).length || 0
  const newSegments = (strategy?.segments.length || 0) - librarySegments

  // Calculate scope label and multiplier based on slider value
  const getScopeInfo = (value: number) => {
    if (value < 25) return { label: 'Very Strict', color: 'text-danger', multiplier: 0.5, description: 'Targeting only highest-value customers' }
    if (value < 45) return { label: 'Stricter', color: 'text-warning', multiplier: 0.75, description: 'Fewer customers, higher conversion potential' }
    if (value <= 55) return { label: 'Balanced', color: 'text-success', multiplier: 1.0, description: 'Optimal balance of reach and precision' }
    if (value < 75) return { label: 'Broader', color: 'text-info', multiplier: 1.3, description: 'More customers, moderate targeting' }
    return { label: 'Very Broad', color: 'text-primary', multiplier: 1.6, description: 'Maximum reach, inclusive targeting' }
  }

  const scopeInfo = getScopeInfo(scopeValue)

  // Handle slider change with debounced update
  const handleSliderChange = async (value: number) => {
    const prevInfo = getScopeInfo(prevScopeValue)
    const newInfo = getScopeInfo(value)
    
    // Generate change highlight message
    if (prevInfo.label !== newInfo.label) {
      const totalCustomers = baseStrategy?.segments.reduce((a, s) => a + s.size, 0) || 0
      const prevCustomers = Math.round(totalCustomers * prevInfo.multiplier)
      const newCustomers = Math.round(totalCustomers * newInfo.multiplier)
      const diff = newCustomers - prevCustomers
      
      if (diff > 0) {
        setChangeHighlight(`+${diff.toLocaleString()} customers added to reach`)
      } else {
        setChangeHighlight(`${Math.abs(diff).toLocaleString()} customers removed for precision`)
      }
      
      // Clear highlight after 3 seconds
      setTimeout(() => setChangeHighlight(null), 3000)
    }
    
    setPrevScopeValue(value)
    setScopeValue(value)
    if (!baseStrategy) return
    
    setIsAdjusting(true)
    
    // Small delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const { multiplier } = getScopeInfo(value)
    
    // Calculate adjusted segment sizes
    const adjustedSegments = baseStrategy.segments.map(seg => ({
      ...seg,
      size: Math.round(seg.size * multiplier)
    }))
    
    // Calculate new total customers
    const newTotalCustomers = adjustedSegments.reduce((sum, seg) => sum + seg.size, 0)
    const baseTotalCustomers = baseStrategy.segments.reduce((sum, seg) => sum + seg.size, 0)
    
    // Recalculate percentages based on new sizes
    const adjustedSegmentsWithPercentage = adjustedSegments.map(seg => ({
      ...seg,
      percentage: Math.round((seg.size / newTotalCustomers) * 1000) / 10
    }))
    
    // Adjust coverage proportionally
    const coverageRatio = newTotalCustomers / baseTotalCustomers
    const adjustedCoverage = Math.round(baseStrategy.totalCoverage * coverageRatio * 10) / 10
    
    const adjustedStrategy = {
      ...baseStrategy,
      totalCoverage: Math.min(adjustedCoverage, 100), // Cap at 100%
      segments: adjustedSegmentsWithPercentage
    }
    
    onUpdateStrategy(adjustedStrategy)
    setIsAdjusting(false)
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-agent" />
              </div>
              <div>
                <p className="font-semibold text-agent">Alan has designed your audience strategy</p>
                <p className="text-sm text-text-secondary">
                  MECE segmentation with {Math.round(strategy.totalCoverage * 10) / 10}% coverage
                </p>
              </div>
            </div>
            <Badge variant={scopeValue < 45 ? 'warning' : scopeValue > 55 ? 'info' : 'success'} className="text-xs">
              {scopeInfo.label} scope
            </Badge>
          </div>
        </div>

        {/* Segment Source Info */}
        <div className="px-6 py-3 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-text-secondary">
                <span className="font-medium text-success">{librarySegments}</span> from Segment Library
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-agent" />
              <span className="text-text-secondary">
                <span className="font-medium text-agent">{newSegments}</span> newly created
              </span>
            </div>
            <span className="text-text-muted ml-auto">Alan checked library first, created new segments where needed</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Layers */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-muted">Layers:</span>
            {strategy.segmentationLayers.map((l, i) => (
              <Badge key={i} variant={l.type === 'statistical' ? 'info' : 'default'} className="bg-surface-tertiary">{l.name}</Badge>
            ))}
          </div>

          {/* Segments */}
          <div className="space-y-3">
            {strategy.segments.map((seg, idx) => {
              const baseSeg = baseStrategy?.segments[idx]
              const sizeChange = baseSeg ? ((seg.size - baseSeg.size) / baseSeg.size * 100) : 0
              const hasChange = Math.abs(sizeChange) > 1
              const fromLibrary = isFromLibrary(seg.name)
              
              return (
                <motion.div 
                  key={seg.id} 
                  className={cn(
                    "p-4 rounded-xl border",
                    fromLibrary 
                      ? "bg-success/5 border-success/20" 
                      : "bg-surface-secondary border-transparent"
                  )}
                  animate={{ opacity: isAdjusting ? 0.6 : 1 }}
                  transition={{ duration: 0.2 }}
                >
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
                        {fromLibrary && (
                          <Badge variant="success" className="text-xs gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Library
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{seg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-lg font-semibold text-primary">{seg.size.toLocaleString()}</p>
                        {hasChange && (
                          <motion.span 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              'text-xs font-medium px-1.5 py-0.5 rounded',
                              sizeChange > 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            )}
                          >
                            {sizeChange > 0 ? '+' : ''}{Math.round(sizeChange)}%
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{seg.percentage}%</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Coverage */}
          <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-success">Total Coverage</p>
              <p className="text-sm text-text-secondary">
                {strategy.segments.reduce((a, s) => a + s.size, 0).toLocaleString()} customers
              </p>
            </div>
            <p className="text-lg font-bold text-success">{Math.round(strategy.totalCoverage * 10) / 10}%</p>
          </div>
        </div>

        {/* Scope Slider */}
        <div className="px-6 py-4 border-t border-border">
          {/* Change Highlight Banner */}
          <AnimatePresence>
            {changeHighlight && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium text-center",
                  changeHighlight.startsWith('+') 
                    ? "bg-success/10 text-success border border-success/20" 
                    : "bg-warning/10 text-warning border border-warning/20"
                )}>
                  {changeHighlight.startsWith('+') ? '📈' : '🎯'} {changeHighlight}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted whitespace-nowrap">Stricter</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={scopeValue}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-warning via-success to-info rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 
                  [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary"
              />
              {/* Scope indicator */}
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-muted">Fewer, high-value</span>
                <div className="text-center">
                  <span className={cn('text-xs font-medium', scopeInfo.color)}>
                    {isAdjusting ? <Loader size="small" style={{display:"inline-block"}} /> : scopeInfo.label}
                  </span>
                  <p className="text-xs text-text-muted">{scopeInfo.description}</p>
                </div>
                <span className="text-xs text-text-muted">More, inclusive</span>
              </div>
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap">Broader</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onGoBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Button variant="tertiary" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
          </div>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking || isAdjusting}>
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
  onGoBack,
  onSkipPromo,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onGoBack: () => void
  onSkipPromo: () => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const mapping = campaign.offerMapping
  const [skippedSegments, setSkippedSegments] = useState<Set<string>>(new Set())

  if (!mapping) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" color="var(--color-agent)" />
      </div>
    )
  }

  const toggleSkipSegment = (segmentId: string) => {
    setSkippedSegments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId)
      } else {
        newSet.add(segmentId)
      }
      return newSet
    })
  }

  const skipAllSegments = () => {
    if (skippedSegments.size === mapping.length) {
      // If all are skipped, unskip all
      setSkippedSegments(new Set())
    } else {
      // Skip all
      setSkippedSegments(new Set(mapping.map(o => o.segmentId)))
    }
  }

  const activePromos = mapping.filter(o => !skippedSegments.has(o.segmentId))
  const allSkipped = skippedSegments.size === mapping.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-agent" />
              </div>
              <div>
                <p className="font-semibold text-agent">Alan has mapped offers to segments</p>
                <p className="text-sm text-text-secondary">Optimized for lift while protecting margins</p>
              </div>
            </div>
            {/* Skip All Toggle */}
            <button
              onClick={skipAllSegments}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-all",
                allSkipped
                  ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-surface border-border text-text-muted hover:text-text-primary hover:border-primary/30"
              )}
            >
              {allSkipped ? '✓ All Promos Skipped' : 'Skip All Promos'}
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        {skippedSegments.size > 0 && !allSkipped && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-6 py-2 bg-warning/5 border-b border-warning/20"
          >
            <p className="text-xs text-warning">
              ⚠️ {skippedSegments.size} of {mapping.length} segments will proceed without promo offers
            </p>
          </motion.div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {mapping.map(o => {
            const isSkipped = skippedSegments.has(o.segmentId)
            
            return (
              <motion.div 
                key={o.segmentId} 
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isSkipped 
                    ? "bg-surface-secondary/50 border-dashed border-border opacity-60" 
                    : "bg-surface-secondary border-transparent"
                )}
                animate={{ opacity: isSkipped ? 0.6 : 1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-text-muted">{o.segmentName}</p>
                    {isSkipped ? (
                      <p className="font-semibold text-text-muted line-through">
                        {o.productGroup} → {o.promotion}
                      </p>
                    ) : (
                      <p className="font-semibold text-text-primary">
                        {o.productGroup} → {o.promotion}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isSkipped ? (
                      <Badge variant="warning" className="text-sm px-3 py-1">No Promo</Badge>
                    ) : (
                      <Badge variant="success" className="text-lg px-4 py-1">{o.promoValue}</Badge>
                    )}
                    <Switch
                      value={!isSkipped}
                      onChange={() => toggleSkipSegment(o.segmentId)}
                      leftLabel="Skip"
                      rightLabel="Enable"
                    />
                  </div>
                </div>
                {!isSkipped && (
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm">
                        <span className="font-semibold text-success">+{o.expectedLift}%</span> lift
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className={`w-4 h-4 ${o.marginImpact >= 0 ? 'text-success' : 'text-warning'}`} />
                      <span className="text-sm">
                        <span className={`font-semibold ${o.marginImpact >= 0 ? 'text-success' : 'text-warning'}`}>{o.marginImpact >= 0 ? '+' : ''}{o.marginImpact}%</span> margin
                      </span>
                    </div>
                  </div>
                )}
                {isSkipped && (
                  <p className="text-xs text-text-muted mt-1">
                    This segment will receive creative content without promotional offers
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Impact Summary */}
        {skippedSegments.size > 0 && (
          <div className="px-6 py-3 bg-primary/5 border-t border-primary/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Active promos: <span className="font-medium text-text-primary">{activePromos.length} of {mapping.length}</span>
              </span>
              <span className="text-text-secondary">
                Est. lift: <span className="font-medium text-success">
                  +{activePromos.reduce((a, o) => a + o.expectedLift, 0) / Math.max(activePromos.length, 1)}%
                </span> avg
              </span>
              <span className="text-text-secondary">
                Margin impact: <span className={`font-medium ${(activePromos.reduce((a, o) => a + o.marginImpact, 0) / Math.max(activePromos.length, 1)) >= 0 ? 'text-success' : 'text-warning'}`}>
                  {(activePromos.reduce((a, o) => a + o.marginImpact, 0) / Math.max(activePromos.length, 1)) >= 0 ? '+' : ''}{Math.round(activePromos.reduce((a, o) => a + o.marginImpact, 0) / Math.max(activePromos.length, 1) * 10) / 10}%
                </span> avg
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onGoBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Button variant="tertiary" size="small" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
          </div>
          <Button 
            variant="primary" 
            onClick={allSkipped ? onSkipPromo : onConfirm} 
            disabled={isWorking}
          >
            <Check className="w-4 h-4 mr-2" /> 
            {allSkipped ? 'Continue Without Promos' : `Confirm ${activePromos.length} Promo${activePromos.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// STEP 3: PRODUCT / SKU ELIGIBILITY (NEW STEP)
// ============================================================================

function ProductStep({
  campaign,
  onConfirm,
  onGoBack,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onGoBack: () => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const segments = campaign.audienceStrategy?.segments || []
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustFeedback, setAdjustFeedback] = useState('')
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [adjustmentApplied, setAdjustmentApplied] = useState<string | null>(null)
  
  // Base product groups data - use playbook data when a goal was selected, otherwise generic
  const segmentNames = segments.map(s => s.name)
  const detectedCats = campaign.detectedCategories || campaign.derivedContext?.detectedCategories
  const playbook = campaign.selectedGoalId ? BUSINESS_GOAL_PLAYBOOKS.find(g => g.id === campaign.selectedGoalId) : null

  const baseProductGroups = (() => {
    if (playbook?.categories && playbook?.segments) {
      // Build one product group per segment, distributing categories across segments
      const segCount = playbook.segments.length
      const catCount = playbook.categories!.length
      return playbook.segments.map((seg, si) => {
        let catsForSeg: typeof playbook.categories
        if (catCount === segCount) {
          // One category per segment — assign by index for precise alignment
          catsForSeg = [playbook.categories![si]]
        } else if (segCount === 1 || catCount < segCount) {
          // Only one segment or fewer categories — all share everything
          catsForSeg = playbook.categories!
        } else {
          // More categories than segments — split evenly
          const perSeg = Math.ceil(catCount / segCount)
          const start = si === 0 ? 0 : perSeg
          const end = si === 0 ? perSeg : catCount
          catsForSeg = playbook.categories!.slice(start, end)
        }
        const catNames = catsForSeg.map(c => c.name)
        const allProducts = catsForSeg.flatMap(c => c.products)
        const colors = ['from-warning to-warning/80', 'from-success to-success/80', 'from-primary to-primary-dark']
        return {
          segmentId: `seg-goal-${si + 1}`,
          segmentName: seg.name,
          group: catNames.join(' + '),
          baseSkuCount: allProducts.length * 75,
          rationale: seg.why,
          color: colors[si % colors.length],
          skus: allProducts.map(p => ({
            id: p.sku,
            name: p.name,
            price: Math.floor(Math.random() * 50) + 10,
            image: p.image,
            visualDescription: p.name,
          })),
        }
      })
    }
    return getProductGroupsByClient(campaign.client || 'autoparts', segmentNames, detectedCats)
  })()

  // Dynamic product groups state
  const [productGroups, setProductGroups] = useState(
    baseProductGroups.map(pg => ({ ...pg, skuCount: pg.baseSkuCount }))
  )

  // Handle re-analyze products
  const handleReanalyze = async () => {
    if (!adjustFeedback.trim()) return
    setIsReanalyzing(true)
    
    // Simulate Alan re-analyzing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Apply adjustments based on feedback
    const feedback = adjustFeedback.toLowerCase()
    let multipliers = { seg1: 1, seg2: 1, seg3: 1 }
    let newRationales = { seg1: '', seg2: '', seg3: '' }
    
    if (feedback.includes('overstock')) {
      // Focus on overstock - reduce VIP, increase value segments
      multipliers = { seg1: 0.4, seg2: 1.3, seg3: 1.5 }
      newRationales = { 
        seg1: 'Reduced to overstock items only', 
        seg2: 'Expanded overstock selection', 
        seg3: 'Prioritized clearance items' 
      }
    } else if (feedback.includes('premium') || feedback.includes('high-value')) {
      // Focus on premium - increase VIP, reduce others
      multipliers = { seg1: 1.5, seg2: 0.7, seg3: 0.5 }
      newRationales = { 
        seg1: 'Expanded premium selection', 
        seg2: 'Filtered to higher-margin items', 
        seg3: 'Limited to premium clearance' 
      }
    } else if (feedback.includes('exclude') && feedback.includes('margin')) {
      // Exclude low-margin - reduce all slightly
      multipliers = { seg1: 0.85, seg2: 0.7, seg3: 0.6 }
      newRationales = { 
        seg1: 'Excluded low-margin items', 
        seg2: 'Removed items below margin threshold', 
        seg3: 'Filtered for margin protection' 
      }
    } else if (feedback.includes('seasonal')) {
      // Include seasonal - increase mid-tier
      multipliers = { seg1: 1.1, seg2: 1.4, seg3: 1.2 }
      newRationales = { 
        seg1: 'Added seasonal premium items', 
        seg2: 'Expanded with seasonal products', 
        seg3: 'Included seasonal clearance' 
      }
    } else {
      // Default adjustment
      multipliers = { seg1: 0.9, seg2: 1.1, seg3: 0.95 }
    }
    
    // Update product groups with new counts
    setProductGroups(prev => prev.map((pg, i) => {
      const mult = i === 0 ? multipliers.seg1 : i === 1 ? multipliers.seg2 : multipliers.seg3
      const newRationale = i === 0 ? newRationales.seg1 : i === 1 ? newRationales.seg2 : newRationales.seg3
      return {
        ...pg,
        skuCount: Math.round(pg.baseSkuCount * mult),
        rationale: newRationale || pg.rationale
      }
    }))
    
    setAdjustmentApplied(adjustFeedback)
    setAdjustFeedback('')
    setShowAdjustModal(false)
    setIsReanalyzing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* ADB Header */}
        <div className="bg-gradient-to-r from-agent/10 to-primary/10 px-6 py-5 border-b border-agent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agent to-primary flex items-center justify-center shadow-lg shadow-agent/25">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg text-text-primary">Alan has matched products per segment</p>
                <p className="text-sm text-text-secondary">Click any segment to preview sample SKUs from the product group</p>
              </div>
            </div>
            {adjustmentApplied && (
              <Badge variant="success" className="text-xs">
                <Check className="w-3 h-3 mr-1" /> Adjusted: {adjustmentApplied}
              </Badge>
            )}
          </div>
        </div>

        <div className="px-6 pt-5 pb-2 flex flex-col gap-3">
          {productGroups.slice(0, segments.length || 3).map((pg, i) => {
            const isExpanded = expandedSegment === pg.segmentId
            return (
              <div
                key={pg.segmentId}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isExpanded
                    ? "border-primary/30 shadow-sm shadow-primary/10"
                    : "border-border hover:border-primary/20"
                )}
              >
                {/* Clickable header row */}
                <button
                  type="button"
                  className="w-full text-left bg-surface hover:bg-surface-secondary/60 transition-colors px-5 py-4"
                  onClick={() => setExpandedSegment(isExpanded ? null : pg.segmentId)}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left — numbered badge + segment info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0",
                        pg.color
                      )}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary leading-tight">
                          {pg.segmentName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          <p className="text-sm text-primary font-medium leading-tight">
                            {pg.group}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right — SKU pill + chevron */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold whitespace-nowrap">
                        <Package className="w-3.5 h-3.5" /> {pg.skuCount.toLocaleString()} SKUs
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-text-muted transition-transform duration-200 shrink-0",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </div>

                  {/* Why row — always visible, aligned under text */}
                  <div className="flex items-start gap-2 mt-3 pl-14">
                    <Sparkles className="w-3.5 h-3.5 text-agent shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      <span className="text-agent font-semibold">Why:</span>{' '}
                      {pg.rationale}
                    </p>
                  </div>
                </button>

                {/* Expanded SKU preview */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 bg-surface-secondary/40 border-t border-border">
                    <p className="text-xs text-text-muted mb-3 flex items-center gap-1.5 pt-3">
                      <Eye className="w-3.5 h-3.5" /> Sample SKUs from this product group
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {pg.skus.slice(0, 4).map(sku => (
                        <div key={sku.id} className="group">
                          <div className="aspect-square rounded-xl overflow-hidden bg-surface border border-border group-hover:border-primary/50 transition-all">
                            <img
                              src={sku.image || PLACEHOLDER_IMAGE}
                              alt={sku.name}
                              onError={handleImageError}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <div className="mt-2 space-y-0.5">
                            <p className="text-xs font-medium text-text-primary truncate">{sku.name}</p>
                            <p className="text-xs text-text-muted truncate">{sku.id}</p>
                            <p className="text-xs text-primary font-semibold">${sku.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {pg.skus.length > 4 && (
                      <p className="text-xs text-text-muted mt-3 text-center">
                        +{pg.skus.length - 4} more SKUs in this group
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl text-center">
              <p className="text-lg font-bold text-primary">
                {productGroups.slice(0, segments.length || 3).reduce((acc, pg) => acc + pg.skuCount, 0)}
              </p>
              <p className="text-xs text-text-muted">Total SKUs</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-xl text-center">
              <p className="text-lg font-bold text-success">{segments.length || 3}</p>
              <p className="text-xs text-text-muted">Product Groups</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-agent/5 to-agent/10 rounded-xl text-center">
              <p className="text-lg font-bold text-agent">100%</p>
              <p className="text-xs text-text-muted">Segment Coverage</p>
            </div>
          </div>

          {/* Why this works */}
          <div className="p-4 bg-gradient-to-r from-success/5 to-agent/5 border border-success/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-success mb-1">Why this product mapping works</p>
                <p className="text-sm text-text-secondary">
                  Products are matched based on segment affinity, inventory levels, and margin requirements.
                  VIPs get premium items to protect brand perception, while value-focused segments
                  receive bundles and overstock items to maximize sell-through.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onGoBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Button variant="tertiary" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button variant="tertiary" onClick={() => setShowAdjustModal(true)}>
              <Edit3 className="w-4 h-4 mr-2" /> Adjust Products
            </Button>
          </div>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking} className="px-6">
            <Check className="w-4 h-4 mr-2" /> Approve Product Groups
          </Button>
        </div>
      </div>

      {/* Adjust Products Modal */}
      <Modal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Product Selection"
        size="medium"
        primaryButtonLabel={isReanalyzing ? 'Analyzing...' : 'Re-analyze Products'}
        onPrimaryButtonClick={handleReanalyze}
        primaryButtonProps={{ disabled: !adjustFeedback.trim() || isReanalyzing }}
        secondaryButtonLabel="Cancel"
        onSecondaryButtonClick={() => setShowAdjustModal(false)}
        secondaryButtonProps={{ disabled: isReanalyzing }}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Tell Alan what to change about the product selection.</p>
          <textarea
            value={adjustFeedback}
            onChange={(e) => setAdjustFeedback(e.target.value)}
            placeholder="e.g., Exclude items under $20, focus more on new arrivals, add more variety to the basics segment..."
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agent/50 resize-none h-32"
          />
          <div className="flex flex-wrap gap-2">
            {['Exclude low-margin items', 'Focus on overstock only', 'Add more premium items', 'Include seasonal products'].map(s => (
              <button
                key={s}
                onClick={() => setAdjustFeedback(s)}
                className="px-3 py-1.5 bg-surface-secondary border border-border rounded-lg text-xs text-text-secondary hover:border-agent/50 hover:text-agent transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

// ============================================================================
// STEP 5: CREATIVE
// ============================================================================

function CreativeStep({
  campaign,
  onApprove,
  onRegenerate,
  onConfirm,
  onGoBack,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onApprove: (id: string) => void
  onRegenerate: (id: string) => void
  onConfirm: () => void
  onGoBack: () => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const creatives = campaign.creatives
  const [activeTab, setActiveTab] = useState(creatives?.[0]?.segmentId || null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  if (!creatives) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" color="var(--color-agent)" />
      </div>
    )
  }

  const handleRegenerate = (id: string) => {
    setRegeneratingId(id)
    // Call regenerate
    onRegenerate(id)
    // Show spinner for visual feedback
    setTimeout(() => {
      setRegeneratingId(null)
    }, 1200)
  }

  const active = creatives.find(c => c.segmentId === activeTab)
  
  // CRITICAL FIX: Count-based approval check
  const approvedCount = creatives.filter(c => c.approved).length
  const totalRequired = creatives.length
  const allApproved = approvedCount === totalRequired

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
              {/* Banner - Hero Background Style */}
              <div className={cn('rounded-2xl overflow-hidden border-2', active.approved ? 'border-success' : 'border-border')}>
                <div className="relative aspect-[4/3]">
                  {/* Background Product Image */}
                  <div className="absolute inset-0 bg-surface-tertiary">
                    <img 
                      src={active.image} 
                      alt="" 
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain opacity-90 drop-shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-product.svg'
                      }}
                    />
                  </div>
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-transparent" />
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <div className="max-w-[60%]">
                      {active.hasOffer && (
                        <span className="inline-block mb-3 px-3 py-1.5 bg-danger text-white text-sm font-semibold rounded-full shadow-lg">
                          {active.offerBadge}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight drop-shadow-lg">{active.headline}</h3>
                      <p className="text-white/80 text-sm mb-5">{active.subcopy}</p>
                      <button className="px-6 py-2.5 bg-white text-text-primary rounded-lg font-semibold text-sm hover:bg-surface-secondary transition-colors shadow-lg">
                        {active.cta} →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{active.tone}</Badge>
                    <Badge variant={active.approved ? 'success' : 'warning'}>
                      {active.approved ? 'approved' : 'pending review'}
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
                    <Tooltip title="Regenerate creative" orientation="top">
                      <button 
                        onClick={() => handleRegenerate(active.id)}
                        disabled={regeneratingId === active.id}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          regeneratingId === active.id
                            ? "bg-agent/10 text-agent"
                            : "bg-surface-secondary text-text-muted hover:bg-agent/10 hover:text-agent"
                        )}
                      >
                        <RefreshCw className={cn("w-4 h-4", regeneratingId === active.id && "animate-spin")} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Edit creative" orientation="top">
                      <button className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-tertiary">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </Tooltip>
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
          <div className="flex items-center gap-4">
            <button onClick={onGoBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Button variant="tertiary" size="small" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <p className="text-sm text-text-secondary">
              {creatives.filter(c => c.approved).length}/{creatives.length} approved
            </p>
          </div>
          <Button variant="primary" onClick={onConfirm} disabled={!allApproved || isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm All Creatives
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ReviewStep({ campaign, onGoBack, onGoToStep, onSaveDraft, onLaunch }: { campaign: Campaign; onGoBack: () => void; onGoToStep: (step: CampaignStep) => void; onSaveDraft: () => void; onLaunch: () => void }) {
  const checks: { label: string; step: CampaignStep; completed: boolean }[] = [
    { label: 'Context', step: 'context', completed: campaign.lockedSteps.includes('context') },
    { label: 'Segments', step: 'segment', completed: campaign.lockedSteps.includes('segment') },
    { label: 'Products', step: 'product', completed: campaign.lockedSteps.includes('product') },
    { label: 'Promos', step: 'promo', completed: campaign.lockedSteps.includes('promo') },
    { label: 'Creative', step: 'creative', completed: campaign.lockedSteps.includes('creative') },
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
              <p className="text-sm text-text-secondary">All steps confirmed — you can edit any step before launching</p>
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

          {/* Checklist — with Edit affordance */}
          <div className="p-4 bg-surface-secondary rounded-xl">
            <p className="font-medium text-text-primary mb-3">Validation Checklist</p>
            <div className="space-y-2">
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-3 group">
                  {c.completed ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={cn('text-sm flex-1', c.completed ? 'text-text-primary' : 'text-text-muted')}>
                    {c.label}
                  </span>
                  {c.completed && (
                    <button
                      onClick={() => onGoToStep(c.step)}
                      className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 px-2 py-1 rounded-md hover:bg-primary/10"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onGoBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Button variant="tertiary" className="px-6" onClick={onSaveDraft}>Save as Draft</Button>
          </div>
          <Button variant="primary" onClick={onLaunch}>
            <Rocket className="w-4 h-4 mr-2" /> Approve & Launch
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
