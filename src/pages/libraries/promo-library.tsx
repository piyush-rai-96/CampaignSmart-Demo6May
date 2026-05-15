import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, Filter, AlertTriangle, X, ExternalLink, 
  ChevronLeft, ChevronRight, Download, RefreshCw, CheckCircle, 
  Clock, Eye, Info, RotateCcw, Calendar, Check, Sparkles
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Tooltip } from 'impact-ui/src/components/Tooltip/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Tabs } from 'impact-ui/src/components/Tabs/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Panel } from 'impact-ui/src/components/Panel/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Accordion } from 'impact-ui/src/components/Accordion/index.js'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

function promoMatchesDateRange(
  promo: { startDate: Date; endDate: Date },
  dateRange: string
): boolean {
  const now = new Date()
  if (dateRange === 'Last 7 Days') {
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 7)
    return promo.endDate >= cutoff
  }
  if (dateRange === 'Last 30 Days') {
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 30)
    return promo.endDate >= cutoff
  }
  if (dateRange === 'Last Quarter') {
    const cutoff = new Date(now)
    cutoff.setMonth(cutoff.getMonth() - 3)
    return promo.endDate >= cutoff
  }
  if (dateRange === 'YTD') {
    const start = new Date(now.getFullYear(), 0, 1)
    return promo.endDate >= start
  }
  if (dateRange.includes(' - ')) {
    const [startStr, endStr] = dateRange.split(' - ')
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return promo.startDate >= start && promo.endDate <= end
    }
  }
  return true
}

// Extended Promotion type for this screen
interface Promotion {
  id: string
  name: string
  type: string
  discountLabel: string
  discountValue: number
  discountUnit: '%' | '$'
  scopeType: string
  scopeSummary: string
  startDate: Date
  endDate: Date
  status: 'Running' | 'Upcoming' | 'Past'
  // Marketing KPIs (renamed from finance terms)
  campaignImpact: number // renamed from liftPercent
  expectedCampaignImpact: number // renamed from expectedLiftPercent
  marginSensitivity: number // renamed from gmPercent
  forecastedMarginSensitivity: number
  impressions: number
  ctr: number // Click-through rate
  engagementRate: number
  conversionRate: number
  creativeUsageCount: number
  campaignCoverage: number // percentage
  unitsSold: number // renamed from units
  forecastedUnitsSold: number
  campaignUsage: number
  channel: string
  // Product Scope (industry-specific)
  productType: string // e.g., Hair Color, Yarn, Canvas
  treatmentType?: string // e.g., Permanent, Semi-Permanent (Beauty)
  brand?: string
  useCase?: string // e.g., Color Refresh, DIY Project
  materialType?: string // e.g., Acrylic, Oil (Michaels)
  projectType?: string // e.g., Kids Craft, Seasonal Kit
  season: string
  promotionCategory?: string
}

// Alert type with full context
interface PromoAlert {
  id: number
  severity: 'critical' | 'warning' | 'info'
  campaign?: string
  issue: string
  impactExplanation: string
  recommendation: string
  actionLabel: string
  actionType: 'create-promo' | 'edit-promo' | 'view-campaign' | 'dismiss'
  agentSuggestion?: {
    promoType: string
    discountRange: string
    scopeLevel: string
  }
}

const mockPromotions: Promotion[] = [
  // ── Pet Supplies / Pet Rewards ──
  {
    id: 'PROMO-101',
    name: 'Cat Month $5 Reward',
    type: 'Rewards',
    discountLabel: '$5 Reward on $40 Cat Spend',
    discountValue: 5,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'All Cat Products',
    startDate: new Date('2025-04-30'),
    endDate: new Date('2025-05-06'),
    status: 'Running',
    campaignImpact: 32,
    expectedCampaignImpact: 33,
    marginSensitivity: 38,
    forecastedMarginSensitivity: 38,
    impressions: 210000,
    ctr: 6.4,
    engagementRate: 15.2,
    conversionRate: 5.2,
    creativeUsageCount: 4,
    campaignCoverage: 91,
    unitsSold: 4850,
    forecastedUnitsSold: 5000,
    campaignUsage: 5,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-102',
    name: 'BOGO 40% Off KONG Toys',
    type: 'BOGO + Discount',
    discountLabel: 'BOGO 40% Off',
    discountValue: 40,
    discountUnit: '%',
    scopeType: 'Brand',
    scopeSummary: 'KONG Toys & Treats',
    startDate: new Date('2025-04-30'),
    endDate: new Date('2025-05-13'),
    status: 'Running',
    campaignImpact: 34,
    expectedCampaignImpact: 35,
    marginSensitivity: 30,
    forecastedMarginSensitivity: 30,
    impressions: 225000,
    ctr: 7.1,
    engagementRate: 16.8,
    conversionRate: 5.8,
    creativeUsageCount: 5,
    campaignCoverage: 88,
    unitsSold: 5420,
    forecastedUnitsSold: 5600,
    campaignUsage: 6,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-103',
    name: 'Muddy Dog Grooming Add-ons',
    type: 'Service Discount',
    discountLabel: '25% Off Grooming Add-ons',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Service',
    scopeSummary: 'Dog Grooming',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 22,
    expectedCampaignImpact: 23,
    marginSensitivity: 36,
    forecastedMarginSensitivity: 36,
    impressions: 148000,
    ctr: 5.3,
    engagementRate: 12.4,
    conversionRate: 4.6,
    creativeUsageCount: 3,
    campaignCoverage: 76,
    unitsSold: 2950,
    forecastedUnitsSold: 3100,
    campaignUsage: 4,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-104',
    name: 'Buy 3 Get 1 Free Wet Food',
    type: 'BOGO + Category Deal',
    discountLabel: 'Buy 3, Get 1 Free',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Cat Wet Food & Toppers',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-20'),
    status: 'Running',
    campaignImpact: 30,
    expectedCampaignImpact: 31,
    marginSensitivity: 28,
    forecastedMarginSensitivity: 28,
    impressions: 195000,
    ctr: 6.8,
    engagementRate: 15.5,
    conversionRate: 5.5,
    creativeUsageCount: 4,
    campaignCoverage: 84,
    unitsSold: 4120,
    forecastedUnitsSold: 4400,
    campaignUsage: 5,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-105',
    name: '$10 Off Premium Dog Food',
    type: '$ Off + Rewards',
    discountLabel: '$10 Off + $10 Reward',
    discountValue: 10,
    discountUnit: '$',
    scopeType: 'Brand',
    scopeSummary: 'Badlands Ranch Dog Food',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 20,
    expectedCampaignImpact: 21,
    marginSensitivity: 29,
    forecastedMarginSensitivity: 29,
    impressions: 162000,
    ctr: 5.7,
    engagementRate: 13.1,
    conversionRate: 4.9,
    creativeUsageCount: 3,
    campaignCoverage: 73,
    unitsSold: 2780,
    forecastedUnitsSold: 3000,
    campaignUsage: 4,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-106',
    name: '$10 Off PureVita Dog Food',
    type: '$ Off + Rewards',
    discountLabel: '$10 Off + $10 Reward',
    discountValue: 10,
    discountUnit: '$',
    scopeType: 'Brand',
    scopeSummary: 'PureVita Dog Food',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 18,
    expectedCampaignImpact: 19,
    marginSensitivity: 27,
    forecastedMarginSensitivity: 27,
    impressions: 155000,
    ctr: 5.5,
    engagementRate: 12.6,
    conversionRate: 4.7,
    creativeUsageCount: 3,
    campaignCoverage: 71,
    unitsSold: 2640,
    forecastedUnitsSold: 2850,
    campaignUsage: 3,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-107',
    name: 'Cinco De Meow Store Event',
    type: 'Campaign / Event',
    discountLabel: 'Free Samples + Rewards Deals',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Event',
    scopeSummary: 'Cat Month Local Store Event',
    startDate: new Date('2025-05-09'),
    endDate: new Date('2025-05-09'),
    status: 'Running',
    campaignImpact: 35,
    expectedCampaignImpact: 36,
    marginSensitivity: 40,
    forecastedMarginSensitivity: 40,
    impressions: 280000,
    ctr: 8.2,
    engagementRate: 18.0,
    conversionRate: 3.4,
    creativeUsageCount: 6,
    campaignCoverage: 100,
    unitsSold: 6100,
    forecastedUnitsSold: 6200,
    campaignUsage: 8,
    channel: 'Omnichannel',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-108',
    name: '5X Points Cat Products',
    type: 'Multiplier Rewards',
    discountLabel: '5X Points',
    discountValue: 5,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Cat Food, Litter & Accessories',
    startDate: new Date('2025-04-30'),
    endDate: new Date('2025-05-06'),
    status: 'Running',
    campaignImpact: 31,
    expectedCampaignImpact: 32,
    marginSensitivity: 37,
    forecastedMarginSensitivity: 37,
    impressions: 205000,
    ctr: 6.9,
    engagementRate: 15.8,
    conversionRate: 5.6,
    creativeUsageCount: 4,
    campaignCoverage: 89,
    unitsSold: 4760,
    forecastedUnitsSold: 4900,
    campaignUsage: 5,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-109',
    name: 'Select Cat Litter Rewards',
    type: 'Rewards',
    discountLabel: '$5 Reward on Select Litter',
    discountValue: 5,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Cat Litter',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-15'),
    status: 'Running',
    campaignImpact: 19,
    expectedCampaignImpact: 20,
    marginSensitivity: 36,
    forecastedMarginSensitivity: 36,
    impressions: 138000,
    ctr: 4.9,
    engagementRate: 11.2,
    conversionRate: 4.1,
    creativeUsageCount: 2,
    campaignCoverage: 69,
    unitsSold: 2250,
    forecastedUnitsSold: 2400,
    campaignUsage: 3,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  {
    id: 'PROMO-110',
    name: 'Pet Treats Weekly Deal',
    type: 'Price + Rewards',
    discountLabel: '$4.99 + Bonus Points',
    discountValue: 4.99,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Dog & Cat Treats',
    startDate: new Date('2025-05-03'),
    endDate: new Date('2025-05-10'),
    status: 'Running',
    campaignImpact: 17,
    expectedCampaignImpact: 18,
    marginSensitivity: 38,
    forecastedMarginSensitivity: 38,
    impressions: 125000,
    ctr: 4.6,
    engagementRate: 10.5,
    conversionRate: 3.9,
    creativeUsageCount: 2,
    campaignCoverage: 64,
    unitsSold: 1980,
    forecastedUnitsSold: 2100,
    campaignUsage: 2,
    channel: 'Loyalty',
    productType: 'Pet Supplies / Pet Rewards',
    season: 'Spring',
    promotionCategory: 'Pet Supplies / Pet Rewards',
  },
  // ── Running Promotions (14 of 23 = ~60%) ──
  {
    id: 'PROMO-001',
    name: '$4.99 + 300 Bonus Points on Purple Power Cleaner',
    type: 'Bundle + Rewards',
    discountLabel: '$4.99 + 300 Points',
    discountValue: 4.99,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Purple Power Cleaner/Degreaser',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 18,
    expectedCampaignImpact: 20,
    marginSensitivity: 36,
    forecastedMarginSensitivity: 35,
    impressions: 185000,
    ctr: 4.2,
    engagementRate: 11.8,
    conversionRate: 3.6,
    creativeUsageCount: 3,
    campaignCoverage: 72,
    unitsSold: 2200,
    forecastedUnitsSold: 2800,
    campaignUsage: 4,
    channel: 'Loyalty',
    productType: 'Fluids and Chemicals',
    brand: 'Purple Power',
    season: 'Spring',
  },
  {
    id: 'PROMO-002',
    name: '$5 Gift Card + 200 Bonus Points on Armor All',
    type: 'Gift Card + Rewards',
    discountLabel: '$5 Gift Card + 200 Points',
    discountValue: 5,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Armor All Products (min spend $15)',
    startDate: new Date('2025-03-20'),
    endDate: new Date('2025-05-15'),
    status: 'Running',
    campaignImpact: 22,
    expectedCampaignImpact: 25,
    marginSensitivity: 32,
    forecastedMarginSensitivity: 32,
    impressions: 210000,
    ctr: 4.8,
    engagementRate: 13.2,
    conversionRate: 4.1,
    creativeUsageCount: 4,
    campaignCoverage: 85,
    unitsSold: 3100,
    forecastedUnitsSold: 3500,
    campaignUsage: 5,
    channel: 'Loyalty',
    productType: 'Appearance and Paint',
    brand: 'Armor All',
    season: 'Spring',
  },
  {
    id: 'PROMO-003',
    name: 'Save $10 + 200 Bonus Points on Innova Scanner',
    type: '$ Off + Rewards',
    discountLabel: '$10 + 200 Points',
    discountValue: 10,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Innova Wireless Code Scanner',
    startDate: new Date('2025-03-10'),
    endDate: new Date('2025-05-10'),
    status: 'Running',
    campaignImpact: 28,
    expectedCampaignImpact: 30,
    marginSensitivity: 34,
    forecastedMarginSensitivity: 33,
    impressions: 165000,
    ctr: 5.1,
    engagementRate: 14.5,
    conversionRate: 4.5,
    creativeUsageCount: 3,
    campaignCoverage: 68,
    unitsSold: 1850,
    forecastedUnitsSold: 2200,
    campaignUsage: 3,
    channel: 'Loyalty',
    productType: 'Tools',
    brand: 'Innova',
    season: 'Spring',
  },
  {
    id: 'PROMO-004',
    name: '$8.99 + 2X Points on Chevron Techron Fuel Cleaner',
    type: 'Price + Multiplier Rewards',
    discountLabel: '$8.99 + 2X Points',
    discountValue: 8.99,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Chevron Techron Fuel System Cleaner',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 15,
    expectedCampaignImpact: 18,
    marginSensitivity: 38,
    forecastedMarginSensitivity: 37,
    impressions: 142000,
    ctr: 3.9,
    engagementRate: 10.8,
    conversionRate: 3.2,
    creativeUsageCount: 2,
    campaignCoverage: 62,
    unitsSold: 1680,
    forecastedUnitsSold: 2000,
    campaignUsage: 3,
    channel: 'Loyalty',
    productType: 'Fuel and Emissions System',
    brand: 'Chevron',
    season: 'Spring',
  },
  {
    id: 'PROMO-005',
    name: '$8.99 + 2X Points on WD-40 Smart Straw',
    type: 'Price + Multiplier Rewards',
    discountLabel: '$8.99 + 2X Points',
    discountValue: 8.99,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'WD-40 Smart Straw',
    startDate: new Date('2025-03-05'),
    endDate: new Date('2025-05-20'),
    status: 'Running',
    campaignImpact: 20,
    expectedCampaignImpact: 22,
    marginSensitivity: 35,
    forecastedMarginSensitivity: 35,
    impressions: 198000,
    ctr: 4.5,
    engagementRate: 12.1,
    conversionRate: 3.8,
    creativeUsageCount: 3,
    campaignCoverage: 76,
    unitsSold: 2400,
    forecastedUnitsSold: 2800,
    campaignUsage: 4,
    channel: 'Loyalty',
    productType: 'Fluids and Chemicals',
    brand: 'WD-40',
    season: 'Spring',
  },
  {
    id: 'PROMO-006',
    name: '50 Bonus Points on Valvoline Motorcycle Oil',
    type: 'Rewards',
    discountLabel: '50 Points',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Valvoline Motorcycle Oil Quarts',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-06-15'),
    status: 'Running',
    campaignImpact: 12,
    expectedCampaignImpact: 14,
    marginSensitivity: 40,
    forecastedMarginSensitivity: 40,
    impressions: 120000,
    ctr: 3.5,
    engagementRate: 9.8,
    conversionRate: 2.9,
    creativeUsageCount: 2,
    campaignCoverage: 55,
    unitsSold: 1420,
    forecastedUnitsSold: 1800,
    campaignUsage: 2,
    channel: 'Loyalty',
    productType: 'Oil and Lubricants',
    brand: 'Valvoline',
    season: 'Spring',
  },
  {
    id: 'PROMO-007',
    name: 'BOGO FREE + 2X Points on STP Octane Booster',
    type: 'BOGO + Rewards',
    discountLabel: 'Buy 1 Get 1 Free + 2X Points',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'STP Octane Booster',
    startDate: new Date('2025-03-10'),
    endDate: new Date('2025-05-10'),
    status: 'Running',
    campaignImpact: 32,
    expectedCampaignImpact: 28,
    marginSensitivity: 28,
    forecastedMarginSensitivity: 30,
    impressions: 225000,
    ctr: 5.8,
    engagementRate: 16.2,
    conversionRate: 5.1,
    creativeUsageCount: 4,
    campaignCoverage: 82,
    unitsSold: 3800,
    forecastedUnitsSold: 3200,
    campaignUsage: 5,
    channel: 'Loyalty',
    productType: 'Fuel and Emissions System',
    brand: 'STP',
    season: 'Spring',
  },
  {
    id: 'PROMO-008',
    name: '$7.99 + 2X Points on TruFuel Premixed Fuel',
    type: 'Price + Multiplier Rewards',
    discountLabel: '$7.99 + 2X Points',
    discountValue: 7.99,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'TruFuel Premixed Engine Fuel',
    startDate: new Date('2025-03-20'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 16,
    expectedCampaignImpact: 19,
    marginSensitivity: 36,
    forecastedMarginSensitivity: 36,
    impressions: 135000,
    ctr: 4.0,
    engagementRate: 11.0,
    conversionRate: 3.4,
    creativeUsageCount: 2,
    campaignCoverage: 58,
    unitsSold: 1560,
    forecastedUnitsSold: 1900,
    campaignUsage: 3,
    channel: 'Loyalty',
    productType: 'Lawn and Garden',
    brand: 'TruFuel',
    season: 'Spring',
  },
  {
    id: 'PROMO-009',
    name: 'Save $2 + 2X Points on Lucas Chain Lube',
    type: '$ Off + Rewards',
    discountLabel: '$2 + 2X Points',
    discountValue: 2,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Lucas Chain Lube',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-15'),
    status: 'Running',
    campaignImpact: 14,
    expectedCampaignImpact: 16,
    marginSensitivity: 38,
    forecastedMarginSensitivity: 38,
    impressions: 98000,
    ctr: 3.6,
    engagementRate: 9.5,
    conversionRate: 2.8,
    creativeUsageCount: 2,
    campaignCoverage: 48,
    unitsSold: 1100,
    forecastedUnitsSold: 1400,
    campaignUsage: 2,
    channel: 'Loyalty',
    productType: 'Oil and Lubricants',
    brand: 'Lucas',
    season: 'Spring',
  },
  {
    id: 'PROMO-010',
    name: 'Garage of Legends Sweepstakes',
    type: 'Sweepstakes',
    discountLabel: 'Win up to $25,000',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Campaign / Event',
    scopeSummary: 'Sweepstakes Entry',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-06-30'),
    status: 'Running',
    campaignImpact: 35,
    expectedCampaignImpact: 32,
    marginSensitivity: 42,
    forecastedMarginSensitivity: 42,
    impressions: 450000,
    ctr: 6.2,
    engagementRate: 18.5,
    conversionRate: 2.1,
    creativeUsageCount: 6,
    campaignCoverage: 100,
    unitsSold: 5200,
    forecastedUnitsSold: 4800,
    campaignUsage: 8,
    channel: 'Loyalty',
    productType: 'Accessories',
    season: 'Spring',
  },
  {
    id: 'PROMO-011',
    name: 'Save up to $50 on Cold Air Intakes',
    type: '$ Off',
    discountLabel: 'Up to $50',
    discountValue: 50,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Cold Air Intakes (K&N, Spectre)',
    startDate: new Date('2025-03-10'),
    endDate: new Date('2025-05-10'),
    status: 'Running',
    campaignImpact: 25,
    expectedCampaignImpact: 28,
    marginSensitivity: 30,
    forecastedMarginSensitivity: 30,
    impressions: 175000,
    ctr: 5.2,
    engagementRate: 14.8,
    conversionRate: 4.2,
    creativeUsageCount: 4,
    campaignCoverage: 78,
    unitsSold: 2800,
    forecastedUnitsSold: 3200,
    campaignUsage: 5,
    channel: 'Omnichannel',
    productType: 'Air Intake',
    brand: 'K&N',
    season: 'Spring',
  },
  {
    id: 'PROMO-012',
    name: 'BOGO 50% OFF Meguiar\'s Ultimate Products',
    type: 'BOGO',
    discountLabel: '50% Off Second Item',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Meguiar\'s Products',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-05-15'),
    status: 'Running',
    campaignImpact: 30,
    expectedCampaignImpact: 26,
    marginSensitivity: 28,
    forecastedMarginSensitivity: 28,
    impressions: 240000,
    ctr: 5.6,
    engagementRate: 15.5,
    conversionRate: 4.8,
    creativeUsageCount: 5,
    campaignCoverage: 88,
    unitsSold: 4100,
    forecastedUnitsSold: 3800,
    campaignUsage: 6,
    channel: 'Omnichannel',
    productType: 'Appearance and Paint',
    brand: 'Meguiar\'s',
    season: 'Spring',
  },
  {
    id: 'PROMO-013',
    name: 'BOGO 50% OFF New Appearance Products',
    type: 'BOGO',
    discountLabel: '50% Off Second Item',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Appearance Products',
    startDate: new Date('2025-03-18'),
    endDate: new Date('2025-05-18'),
    status: 'Running',
    campaignImpact: 24,
    expectedCampaignImpact: 22,
    marginSensitivity: 30,
    forecastedMarginSensitivity: 30,
    impressions: 195000,
    ctr: 4.9,
    engagementRate: 13.8,
    conversionRate: 4.0,
    creativeUsageCount: 3,
    campaignCoverage: 74,
    unitsSold: 2650,
    forecastedUnitsSold: 2800,
    campaignUsage: 4,
    channel: 'Omnichannel',
    productType: 'Appearance and Paint',
    season: 'Spring',
  },
  {
    id: 'PROMO-014',
    name: 'Save $5 Mail-in Rebate on Armor All',
    type: '$ Off (Mail-in Rebate)',
    discountLabel: '$5',
    discountValue: 5,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Armor All (min spend $15)',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-31'),
    status: 'Running',
    campaignImpact: 10,
    expectedCampaignImpact: 12,
    marginSensitivity: 40,
    forecastedMarginSensitivity: 40,
    impressions: 110000,
    ctr: 3.2,
    engagementRate: 8.5,
    conversionRate: 2.6,
    creativeUsageCount: 2,
    campaignCoverage: 65,
    unitsSold: 1200,
    forecastedUnitsSold: 1500,
    campaignUsage: 2,
    channel: 'Omnichannel',
    productType: 'Appearance and Paint',
    brand: 'Armor All',
    season: 'Spring',
  },
  // ── Upcoming Promotions (9 of 23 = ~40%) ──
  {
    id: 'PROMO-015',
    name: '$6 Brake Bundle',
    type: 'Bundle Price',
    discountLabel: '$6 Bundle',
    discountValue: 6,
    discountUnit: '$',
    scopeType: 'Product Bundle',
    scopeSummary: 'Cleaner + Fluid + Lubricant',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-06-30'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 22,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 32,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 55,
    unitsSold: 0,
    forecastedUnitsSold: 2400,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Braking',
    season: 'Spring',
  },
  {
    id: 'PROMO-016',
    name: '$6 Clean Hands Bundle',
    type: 'Bundle Price',
    discountLabel: '$6 Bundle',
    discountValue: 6,
    discountUnit: '$',
    scopeType: 'Product Bundle',
    scopeSummary: 'Scott Towels + Fast Orange Cleaner',
    startDate: new Date('2025-05-05'),
    endDate: new Date('2025-06-30'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 18,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 35,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 48,
    unitsSold: 0,
    forecastedUnitsSold: 1800,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Accessories',
    season: 'Spring',
  },
  {
    id: 'PROMO-017',
    name: 'Save $16 on 2 Rain-X Truck & SUV Wipers',
    type: '$ Off',
    discountLabel: '$16 (on 2)',
    discountValue: 16,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Rain-X Wiper Blades (min qty 2)',
    startDate: new Date('2025-05-10'),
    endDate: new Date('2025-06-10'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 26,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 30,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 62,
    unitsSold: 0,
    forecastedUnitsSold: 3200,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Wipers and Related',
    brand: 'Rain-X',
    season: 'Spring',
  },
  {
    id: 'PROMO-018',
    name: 'Save $8 on 2 Bosch FOCUS Front Wipers',
    type: '$ Off',
    discountLabel: '$8 (on 2)',
    discountValue: 8,
    discountUnit: '$',
    scopeType: 'Product',
    scopeSummary: 'Bosch Wiper Blades (min qty 2)',
    startDate: new Date('2025-05-10'),
    endDate: new Date('2025-06-10'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 20,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 34,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 58,
    unitsSold: 0,
    forecastedUnitsSold: 2600,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Wipers and Related',
    brand: 'Bosch',
    season: 'Spring',
  },
  {
    id: 'PROMO-019',
    name: 'BOGO FREE DieHard Power Tools & Batteries',
    type: 'BOGO',
    discountLabel: 'Buy 1 Get 1 Free',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Power Tools & Batteries',
    startDate: new Date('2025-05-15'),
    endDate: new Date('2025-06-15'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 35,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 25,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 72,
    unitsSold: 0,
    forecastedUnitsSold: 4200,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Tools',
    brand: 'DieHard',
    season: 'Spring',
  },
  {
    id: 'PROMO-020',
    name: 'Save up to $8 on Carquest Air Filters',
    type: '$ Off',
    discountLabel: 'Up to $8',
    discountValue: 8,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Engine / Cabin Air Filters',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-06-30'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 16,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 38,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 65,
    unitsSold: 0,
    forecastedUnitsSold: 2800,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Filters and PCV',
    brand: 'Carquest',
    season: 'Spring',
  },
  {
    id: 'PROMO-021',
    name: 'BOGO 50% OFF Chemical Guys Odor Eliminators',
    type: 'BOGO',
    discountLabel: '50% Off Second Item',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Product',
    scopeSummary: 'Odor Eliminators',
    startDate: new Date('2025-05-20'),
    endDate: new Date('2025-06-20'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 24,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 28,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 60,
    unitsSold: 0,
    forecastedUnitsSold: 3500,
    campaignUsage: 0,
    channel: 'Omnichannel',
    productType: 'Interior',
    brand: 'Chemical Guys',
    season: 'Spring',
  },
  {
    id: 'PROMO-022',
    name: '15% OFF Orders $35+ (Code SPRING)',
    type: '% Off',
    discountLabel: '15%',
    discountValue: 15,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'Min order $35',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-06-30'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 28,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 32,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 100,
    unitsSold: 0,
    forecastedUnitsSold: 5500,
    campaignUsage: 0,
    channel: 'Online',
    productType: 'Accessories',
    season: 'Spring',
  },
  {
    id: 'PROMO-023',
    name: '20% OFF Orders $100+ (Code SPRING)',
    type: '% Off',
    discountLabel: '20%',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'Min order $100',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-06-30'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 32,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 30,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 100,
    unitsSold: 0,
    forecastedUnitsSold: 4800,
    campaignUsage: 0,
    channel: 'Online',
    productType: 'Accessories',
    season: 'Spring',
  },
]

// Enhanced Alerts with Agent Suggestions
const initialAlerts: PromoAlert[] = [
  { 
    id: 1, 
    severity: 'critical',
    campaign: 'Spring Maintenance Push', 
    issue: 'No promotion mapped for Brake Pads & Rotors category',
    impactExplanation: 'Campaign blocked – cannot launch without promo coverage for primary product scope',
    recommendation: 'Add category-level $ Off promo targeting Brake Pads & Rotors',
    actionLabel: 'Create in PromoSmart',
    actionType: 'create-promo',
    agentSuggestion: {
      promoType: '$ Off',
      discountRange: '$10-$25',
      scopeLevel: 'Category: Brake Pads & Rotors'
    }
  },
  { 
    id: 2, 
    severity: 'warning',
    campaign: 'Spring Loyalty Drive', 
    issue: 'Armor All rebate promo expires before campaign end (May 31 vs Jun 15)',
    impactExplanation: 'Last 15 days of campaign will have no active rebate – expected 18% drop in conversion',
    recommendation: 'Extend promo end date or create follow-up promotion',
    actionLabel: 'Edit Promo',
    actionType: 'edit-promo',
    agentSuggestion: {
      promoType: 'Extension',
      discountRange: 'Same as current',
      scopeLevel: 'Maintain current scope'
    }
  },
  { 
    id: 3, 
    severity: 'info',
    campaign: 'Wiper Blade Season', 
    issue: 'Low creative usage (1 of 4 creatives using Rain-X promo)',
    impactExplanation: 'Underutilized promo may reduce campaign reach by ~25%',
    recommendation: 'Consider adding promo badge to remaining creatives',
    actionLabel: 'View Campaign',
    actionType: 'view-campaign'
  },
]

const productTypes = ['All Categories', 'Pet Supplies / Pet Rewards', 'Fluids and Chemicals', 'Appearance and Paint', 'Tools', 'Fuel and Emissions System', 'Oil and Lubricants', 'Lawn and Garden', 'Accessories', 'Air Intake', 'Braking', 'Wipers and Related', 'Filters and PCV', 'Interior']
const seasons = ['All Seasons', 'Spring']
const promoTypes = ['All Types', 'Bundle + Rewards', 'Gift Card + Rewards', '$ Off + Rewards', 'Price + Multiplier Rewards', 'Rewards', 'BOGO + Rewards', 'BOGO', '$ Off', '$ Off (Mail-in Rebate)', 'Bundle Price', '% Off', 'Sweepstakes']

type TabType = 'running-past' | 'upcoming'

const scopeTypes = ['All Scopes', 'Category', 'Brand', 'Product', 'Service', 'Event']

export function PromoLibrary() {
  const { showComingSoon } = useToast()
  const [showFilters, setShowFilters] = useState(false)
  const [alertsExpanded, setAlertsExpanded] = useState(false)
  const [alerts, setAlerts] = useState(initialAlerts)

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }
  const [activeTab, setActiveTab] = useState<TabType>('running-past')
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  
  // Filter states
  const [productTypeFilter, setProductTypeFilter] = useState('All Categories')
  const [seasonFilter, setSeasonFilter] = useState('All Seasons')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [scopeFilter, setScopeFilter] = useState('All Scopes')
  const [campaignUsedFilter, setCampaignUsedFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleDateRangeSelect = (value: string) => {
    setDateRange(value)
    if (value === 'Custom') {
      setShowCustomDatePicker(true)
    } else {
      setShowCustomDatePicker(false)
    }
  }

  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setDateRange(`${customStartDate} - ${customEndDate}`)
      setShowCustomDatePicker(false)
    }
  }

  const hasActiveFilters = productTypeFilter !== 'All Categories' ||
    seasonFilter !== 'All Seasons' ||
    channelFilter !== 'All Channels' ||
    typeFilter !== 'All Types' ||
    scopeFilter !== 'All Scopes' ||
    campaignUsedFilter !== 'all' ||
    dateRange !== 'Last 30 Days'

  const resetFilters = () => {
    setProductTypeFilter('All Categories')
    setSeasonFilter('All Seasons')
    setChannelFilter('All Channels')
    setTypeFilter('All Types')
    setScopeFilter('All Scopes')
    setCampaignUsedFilter('all')
    setDateRange('Last 30 Days')
    setCustomStartDate('')
    setCustomEndDate('')
    setShowCustomDatePicker(false)
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, productTypeFilter, seasonFilter, channelFilter, typeFilter, scopeFilter, campaignUsedFilter, dateRange])

  const filteredPromotions = mockPromotions.filter(promo => {
    const matchesTab = activeTab === 'upcoming' 
      ? promo.status === 'Upcoming'
      : promo.status === 'Running' || promo.status === 'Past'
    const matchesProductType = productTypeFilter === 'All Categories' || promo.productType === productTypeFilter
    const matchesSeason = seasonFilter === 'All Seasons' || promo.season === seasonFilter
    const matchesChannel = channelFilter === 'All Channels' || promo.channel === channelFilter
    const matchesType = typeFilter === 'All Types' || promo.type === typeFilter
    const matchesScope = scopeFilter === 'All Scopes' || promo.scopeType === scopeFilter
    const matchesCampaignUsed = campaignUsedFilter === 'all' || 
      (campaignUsedFilter === 'yes' && promo.campaignUsage > 0) ||
      (campaignUsedFilter === 'no' && promo.campaignUsage === 0)
    const matchesDate = promoMatchesDateRange(promo, dateRange)
    
    return matchesTab && matchesProductType && matchesSeason && matchesChannel && matchesType && matchesScope && matchesCampaignUsed && matchesDate
  })

  // Pagination calculations (safePage clamps to valid range when filters reduce page count)
  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex)

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  // KPI calculations with marketing qualifiers
  const totalPromotions = mockPromotions.length
  const campaignReadyPromos = mockPromotions.filter(p => p.campaignCoverage >= 50).length
  const draftPromos = totalPromotions - campaignReadyPromos
  const avgCoverage = Math.round(mockPromotions.reduce((acc, p) => acc + p.campaignCoverage, 0) / totalPromotions)

  const runningPromos = mockPromotions.filter(p => p.status === 'Running')
  const runningPromotions = runningPromos.length
  const lowPerformingRunning = runningPromos.filter(p => p.ctr < 3 || p.campaignCoverage < 50).length
  const avgRunningCTR = runningPromos.length > 0 
    ? (runningPromos.reduce((acc, p) => acc + p.ctr, 0) / runningPromos.length).toFixed(1)
    : '0'
  const avgRunningConversion = runningPromos.length > 0
    ? (runningPromos.reduce((acc, p) => acc + p.conversionRate, 0) / runningPromos.length).toFixed(1)
    : '0'

  const upcomingPromos = mockPromotions.filter(p => p.status === 'Upcoming')
  const upcomingPromotions = upcomingPromos.length
  const missingScope = upcomingPromos.filter(p => !p.productType || p.productType === 'All Products').length
  const belowCoverageThreshold = upcomingPromos.filter(p => p.campaignCoverage < 50).length

  const usedPromos = mockPromotions.filter(p => p.campaignUsage > 0)
  const usedInCampaigns = usedPromos.length
  const avgCampaignImpact = usedPromos.length > 0
    ? Math.round(usedPromos.reduce((acc, p) => acc + p.campaignImpact, 0) / usedPromos.length)
    : 0
  const highImpactPromos = usedPromos.filter(p => p.campaignImpact >= 30).length
  const mediumImpactPromos = usedPromos.filter(p => p.campaignImpact >= 15 && p.campaignImpact < 30).length
  const lowImpactPromos = usedPromos.filter(p => p.campaignImpact < 15).length

  const unusedPromos = mockPromotions.filter(p => p.campaignUsage === 0)
  const unusedPromotions = unusedPromos.length
  const reusablePromos = unusedPromos.filter(p => p.status !== 'Past' && new Date(p.endDate) > new Date()).length
  const expiredPromos = unusedPromotions - reusablePromos

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Helper to get Campaign Impact tier
  const getImpactTier = (impact: number): { label: string; color: string } => {
    if (impact >= 30) return { label: 'High', color: 'text-success' }
    if (impact >= 15) return { label: 'Medium', color: 'text-warning' }
    return { label: 'Low', color: 'text-text-muted' }
  }

  // Helper to get Margin Sensitivity tier
  const getMarginRisk = (sensitivity: number): { label: string; color: string } => {
    if (sensitivity >= 35) return { label: 'Low', color: 'text-success' }
    if (sensitivity >= 25) return { label: 'Medium', color: 'text-warning' }
    return { label: 'High', color: 'text-danger' }
  }

  // Helper to format discount display based on offer type
  const formatDiscountDisplay = (promo: Promotion): string => {
    return promo.discountLabel || '—'
  }

  // Helper to get offer type short label
  const getOfferTypeLabel = (type: string): string => {
    return type
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-4 shadow-sm">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Promotion Library</h1>
                <p className="text-sm text-text-secondary">Synced from PromoSmart</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-secondary rounded-lg border border-border">
                <Button variant="primary" size="small" className="gap-2" onClick={() => showComingSoon('Sync with PromoSmart')}>
                  <RefreshCw className="w-4 h-4" />
                  Sync with PromoSmart
                </Button>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Last synced: Dec 15, 2024, 09:30 AM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">Up to date</span>
                </div>
                <button type="button" aria-label="About promotions" className="p-1 hover:bg-surface-tertiary rounded" onClick={() => showComingSoon('Promotion info')}>
                  <Info className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-8 py-6">
        {/* Filters Toggle - At Top */}
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
                {[productTypeFilter !== 'All Categories', seasonFilter !== 'All Seasons', channelFilter !== 'All Channels', typeFilter !== 'All Types', scopeFilter !== 'All Scopes', campaignUsedFilter !== 'all'].filter(Boolean).length}
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
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {/* Date Range */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Date Range</label>
                    <Select
                      value={dateRange}
                      onChange={handleDateRangeSelect}
                      options={['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'YTD', 'Custom']}
                      placeholder="Select range..."
                    />
                    <AnimatePresence>
                      {showCustomDatePicker && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 mt-1 p-4 bg-surface border border-border rounded-lg shadow-lg z-[9999] min-w-[280px]">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-text-primary">Custom Range</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-text-muted mb-1">Start Date</label>
                              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">End Date</label>
                              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button variant="outlined" size="small" className="flex-1" onClick={() => setShowCustomDatePicker(false)}>Cancel</Button>
                              <Button variant="primary" size="small" className="flex-1" onClick={applyCustomDateRange}>Apply</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Channel</label>
                    <Select
                      value={channelFilter === 'All Channels' ? '' : channelFilter}
                      onChange={(val) => setChannelFilter(val || 'All Channels')}
                      options={['Loyalty', 'Omnichannel', 'Online']}
                      placeholder="All Channels"
                    />
                  </div>

                  {/* Offer Type */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Offer Type</label>
                    <Select
                      value={typeFilter === 'All Types' ? '' : typeFilter}
                      onChange={(val) => setTypeFilter(val || 'All Types')}
                      options={promoTypes.filter(o => o !== 'All Types')}
                      placeholder="All Types"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Category</label>
                    <Select
                      value={productTypeFilter === 'All Categories' ? '' : productTypeFilter}
                      onChange={(val) => setProductTypeFilter(val || 'All Categories')}
                      options={productTypes.filter(o => o !== 'All Categories')}
                      placeholder="All Categories"
                    />
                  </div>

                  {/* Season */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Season</label>
                    <Select
                      value={seasonFilter === 'All Seasons' ? '' : seasonFilter}
                      onChange={(val) => setSeasonFilter(val || 'All Seasons')}
                      options={seasons.filter(o => o !== 'All Seasons')}
                      placeholder="All Seasons"
                    />
                  </div>
                </div>

                <motion.div className="grid grid-cols-5 gap-4 mt-4">
                  <motion.div>
                    <label className="block text-xs text-text-muted mb-1.5">Scope</label>
                    <Select
                      value={scopeFilter === 'All Scopes' ? '' : scopeFilter}
                      onChange={(val) => setScopeFilter(val || 'All Scopes')}
                      options={scopeTypes.filter((o) => o !== 'All Scopes')}
                      placeholder="All Scopes"
                      withPortal
                      searchable={false}
                    />
                  </motion.div>
                </motion.div>

                {/* Campaign Used Filter */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-text-secondary">Campaign Used:</span>
                  <div className="flex gap-2">
                    {(['all', 'yes', 'no'] as const).map((option) => (
                      <button key={option} onClick={() => setCampaignUsedFilter(option)}
                        className={cn('px-3 py-1.5 text-sm rounded-lg transition-colors',
                          campaignUsedFilter === option ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/50')}>
                        {option === 'all' ? 'All' : option === 'yes' ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Alerts Section - Collapsed by Default */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="mb-4 accordions_white"
            >
              <Accordion
                expanded={alertsExpanded ? 'alerts' : ''}
                setExpanded={(val: string) => setAlertsExpanded(val === 'alerts')}
                data={[{
                  value: 'alerts',
                  header: (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          {alerts.filter(a => a.severity === 'critical').length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{alerts.length} Alerts</span>
                          <div className="flex items-center gap-1.5 text-xs">
                            {alerts.filter(a => a.severity === 'critical').length > 0 && (
                              <span className="text-danger font-medium">{alerts.filter(a => a.severity === 'critical').length} critical</span>
                            )}
                            {alerts.filter(a => a.severity === 'warning').length > 0 && (
                              <>
                                {alerts.filter(a => a.severity === 'critical').length > 0 && <span className="text-text-muted">•</span>}
                                <span className="text-warning">{alerts.filter(a => a.severity === 'warning').length} warning</span>
                              </>
                            )}
                            {alerts.filter(a => a.severity === 'info').length > 0 && (
                              <>
                                <span className="text-text-muted">•</span>
                                <span className="text-info">{alerts.filter(a => a.severity === 'info').length} info</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setAlerts([]); }}
                        className="text-xs text-text-muted hover:text-danger transition-colors mr-2"
                      >
                        × Clear All
                      </button>
                    </div>
                  ),
                  content: (
                    <div>
                      <div className="max-h-[280px] overflow-y-auto">
                        <AnimatePresence mode="popLayout">
                          {alerts.map((alert) => (
                            <motion.div
                              key={alert.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-start gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-surface-secondary/30 transition-colors group"
                            >
                              <div className={cn(
                                'w-1 h-full min-h-[40px] rounded-full flex-shrink-0',
                                alert.severity === 'critical' ? 'bg-danger' :
                                alert.severity === 'warning' ? 'bg-warning' : 'bg-info'
                              )} />
                              <div className="flex-1 min-w-0 py-0.5">
                                <div className="flex items-center gap-2 mb-1">
                                  {alert.campaign && (
                                    <span className="text-xs font-medium text-primary">{alert.campaign}</span>
                                  )}
                                </div>
                                <p className="text-sm text-text-primary leading-snug">{alert.issue}</p>
                                <p className="text-xs text-text-muted mt-1">
                                  <span className="text-success">→</span> {alert.recommendation}
                                </p>
                              </div>
                              {alert.agentSuggestion && (
                                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-agent/5 rounded text-xs flex-shrink-0">
                                  <Sparkles className="w-3 h-3 text-agent" />
                                  <span className="text-agent font-medium">{alert.agentSuggestion.promoType}</span>
                                  <span className="text-text-muted">@</span>
                                  <span className="text-text-secondary">{alert.agentSuggestion.discountRange}</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="px-4 py-2 bg-surface-secondary/30 border-t border-border/30 flex items-center justify-end gap-3 text-xs">
                        <button onClick={() => setAlerts(alerts.filter(a => a.severity !== 'info'))} className="text-text-muted hover:text-info transition-colors">Clear info</button>
                        <span className="text-border">•</span>
                        <button onClick={() => setAlerts(alerts.filter(a => a.severity !== 'warning'))} className="text-text-muted hover:text-warning transition-colors">Clear warnings</button>
                        <span className="text-border">•</span>
                        <button onClick={() => setAlerts([])} className="text-text-muted hover:text-danger transition-colors">Clear all</button>
                      </div>
                    </div>
                  )
                }]}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards with Marketing Qualifiers */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* Total Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="group" sx={{ padding: '16px', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Total Promotions</span>
                <Tag className="w-4 h-4 text-text-muted" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-1.5">{totalPromotions}</p>
              <p className="text-xs text-text-secondary">
                <span className="text-success font-medium">{campaignReadyPromos} ready</span>
                <span className="mx-1">•</span>
                <span>{draftPromos} draft</span>
              </p>
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-text-muted">Avg Coverage: {avgCoverage}%</p>
              </div>
            </Card>
          </motion.div>

          {/* Running Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="group" sx={{ padding: '16px', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Running</span>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-1.5">{runningPromotions}</p>
              {lowPerformingRunning > 0 ? (
                <p className="text-xs text-warning">
                  <span className="font-medium">{lowPerformingRunning} flagged</span> low coverage/CTR
                </p>
              ) : (
                <p className="text-xs text-success">All performing well</p>
              )}
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-text-muted">Avg CTR: {avgRunningCTR}% | Conv: {avgRunningConversion}%</p>
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="group" sx={{ padding: '16px', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Upcoming</span>
                <Clock className="w-4 h-4 text-info" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-1.5">{upcomingPromotions}</p>
              {missingScope > 0 ? (
                <p className="text-xs text-warning">
                  <span className="font-medium">{missingScope} missing</span> product scope
                </p>
              ) : (
                <p className="text-xs text-success">All scopes defined</p>
              )}
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-text-muted">{belowCoverageThreshold} below coverage threshold</p>
              </div>
            </Card>
          </motion.div>

          {/* Used in Campaigns - Marketing KPI explicit here */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="group" sx={{ padding: '16px', borderColor: 'rgba(66,89,238,0.25)', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Used in Campaigns</span>
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-1.5">{usedInCampaigns}</p>
              <p className="text-xs">
                <span className="text-primary font-semibold">Avg Impact: +{avgCampaignImpact}%</span>
              </p>
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-text-muted">
                  High: {highImpactPromos} • Med: {mediumImpactPromos} • Low: {lowImpactPromos}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Unused Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="group" sx={{ padding: '16px', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Unused</span>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <p className="text-xl font-bold text-text-primary mb-1.5">{unusedPromotions}</p>
              <p className="text-xs text-text-secondary">
                <span className="text-success font-medium">{reusablePromos} reusable</span>
                <span className="mx-1">•</span>
                <span className="text-text-muted">{expiredPromos} expired</span>
              </p>
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-text-muted">Opportunity for campaign mapping</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tabs and Export Row */}
        <div className="flex items-center justify-between mb-6">
          <Tabs
            value={activeTab === 'running-past' ? 0 : 1}
            onChange={(_e: unknown, idx: number) => handleTabChange(idx === 0 ? 'running-past' : 'upcoming')}
            tabNames={[
              { label: 'Running & Past', value: 0 },
              { label: 'Upcoming', value: 1 },
            ]}
            tabPanels={[null, null]}
          />
          <Button variant="outlined" className="gap-2" onClick={() => showComingSoon('Export')}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Promotion Table - Production Ready with Clean Styling */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-surface-secondary/80 border-b border-border">
                <tr className="divide-x divide-border/30">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[95px]">ID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[160px]">Promotion</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[110px]">Offer Type</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[100px]">Discount</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[140px]">Scope</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[85px]">Start</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted whitespace-nowrap w-[85px]">End</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-muted whitespace-nowrap w-[80px]">Status</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-muted whitespace-nowrap w-[75px] group relative cursor-help">
                    Impact
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-primary text-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Relative uplift vs baseline (not revenue)
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-muted whitespace-nowrap w-[90px] group relative cursor-help">
                    Margin Risk
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-primary text-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Risk based on discount depth & elasticity
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-muted whitespace-nowrap w-[60px]">CTR</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-muted whitespace-nowrap w-[60px]">Conv.</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-muted whitespace-nowrap w-[90px]">Coverage</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-muted whitespace-nowrap w-[85px]">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedPromotions.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Tag className="w-10 h-10 text-text-muted mb-3" />
                        <p className="text-text-primary font-medium mb-1">No promotions found</p>
                        <p className="text-sm text-text-secondary">
                          {activeTab === 'upcoming' 
                            ? 'No upcoming promotions scheduled'
                            : 'No promotions match your current filters'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPromotions.map((promo, index) => {
                    const impactValue = activeTab === 'upcoming' ? promo.expectedCampaignImpact : promo.campaignImpact
                    const impactTier = getImpactTier(impactValue)
                    const marginValue = activeTab === 'upcoming' ? promo.forecastedMarginSensitivity : promo.marginSensitivity
                    const marginRisk = getMarginRisk(marginValue)
                    
                    return (
                      <tr 
                        key={promo.id} 
                        className={cn(
                          'hover:bg-primary/5 transition-colors group',
                          index % 2 === 0 ? 'bg-surface' : 'bg-surface-secondary/20'
                        )}
                      >
                        {/* ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            className="text-xs font-mono text-primary hover:underline hover:text-primary-dark cursor-pointer transition-colors"
                            onClick={() => setSelectedPromotion(promo)}
                          >
                            {promo.id}
                          </button>
                        </td>
                        {/* Promotion Name */}
                        <td className="px-4 py-3">
                          <Tooltip title={promo.name} orientation="top">
                            <p className="text-sm font-medium text-text-primary truncate max-w-[150px]">{promo.name}</p>
                          </Tooltip>
                        </td>
                        {/* Offer Type */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-secondary whitespace-nowrap" title={getOfferTypeLabel(promo.type)}>{getOfferTypeLabel(promo.type)}</span>
                        </td>
                        {/* Discount */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold whitespace-nowrap">
                            {formatDiscountDisplay(promo)}
                          </span>
                        </td>
                        {/* Scope */}
                        <td className="px-4 py-3">
                          <Tooltip title={promo.scopeType} orientation="top">
                            <p className="text-xs font-medium text-text-primary truncate max-w-[130px]">{promo.scopeType}</p>
                          </Tooltip>
                          <Tooltip title={promo.scopeSummary} orientation="top">
                            <p className="text-xs text-text-muted truncate max-w-[130px]">{promo.scopeSummary}</p>
                          </Tooltip>
                        </td>
                        {/* Start Date */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {promo.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        {/* End Date */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {promo.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={promo.status === 'Running' ? 'success' : promo.status === 'Upcoming' ? 'info' : 'default'}
                            className="text-xs px-2 py-0.5"
                          >
                            {promo.status}
                          </Badge>
                        </td>
                        {/* Campaign Impact - Tier based */}
                        <td className="px-4 py-3 text-center group/cell relative">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                            impactTier.label === 'High' ? 'bg-success/10 text-success' :
                            impactTier.label === 'Medium' ? 'bg-warning/10 text-warning' :
                            'bg-surface-tertiary text-text-muted'
                          )}>
                            {impactTier.label}
                          </span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-text-primary text-surface text-xs rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            +{impactValue}% vs baseline
                          </span>
                        </td>
                        {/* Margin Risk */}
                        <td className="px-4 py-3 text-center group/cell relative">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                            marginRisk.label === 'Low' ? 'bg-success/10 text-success' :
                            marginRisk.label === 'Medium' ? 'bg-warning/10 text-warning' :
                            'bg-danger/10 text-danger'
                          )}>
                            {marginRisk.label}
                          </span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-text-primary text-surface text-xs rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {marginValue}% margin sensitivity
                          </span>
                        </td>
                        {/* CTR */}
                        <td className="px-4 py-3 text-center text-xs text-text-secondary font-medium">
                          {promo.ctr > 0 ? `${promo.ctr}%` : '—'}
                        </td>
                        {/* Conversion */}
                        <td className="px-4 py-3 text-center text-xs text-text-secondary font-medium">
                          {promo.conversionRate > 0 ? `${promo.conversionRate}%` : '—'}
                        </td>
                        {/* Coverage */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  'h-full rounded-full',
                                  promo.campaignCoverage >= 80 ? 'bg-success' : 
                                  promo.campaignCoverage >= 50 ? 'bg-warning' : 'bg-danger'
                                )}
                                style={{ width: `${promo.campaignCoverage}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted font-medium w-8">{promo.campaignCoverage}%</span>
                          </div>
                        </td>
                        {/* Units Sold */}
                        <td className="px-4 py-3 text-right text-xs text-text-secondary font-medium whitespace-nowrap">
                          {promo.unitsSold > 0 ? formatNumber(promo.unitsSold) : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPromotions.length > 0 && (() => {
            // Build smart page window: always show first, last, and up to 3 around current
            const pageWindow: (number | '…')[] = []
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pageWindow.push(i)
            } else {
              const left = Math.max(2, safePage - 1)
              const right = Math.min(totalPages - 1, safePage + 1)
              pageWindow.push(1)
              if (left > 2) pageWindow.push('…')
              for (let i = left; i <= right; i++) pageWindow.push(i)
              if (right < totalPages - 1) pageWindow.push('…')
              pageWindow.push(totalPages)
            }

            return (
              <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between gap-4">
                {/* Left: count */}
                <p className="text-sm text-text-secondary whitespace-nowrap">
                  Showing{' '}
                  <span className="font-semibold text-text-primary">{startIndex + 1}–{Math.min(endIndex, filteredPromotions.length)}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-text-primary">{filteredPromotions.length}</span>
                  {' '}promotions
                </p>

                {/* Right: navigation */}
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    disabled={safePage === 1}
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); }}
                    className={cn(
                      'flex items-center gap-1 px-3 h-8 rounded-lg text-sm font-medium border transition-all',
                      safePage === 1
                        ? 'border-border text-text-muted cursor-not-allowed opacity-40'
                        : 'border-border text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 mx-1">
                    {pageWindow.map((p, idx) =>
                      p === '…' ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-sm text-text-muted select-none">…</span>
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
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next */}
                  <button
                    disabled={safePage === totalPages}
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                    className={cn(
                      'flex items-center gap-1 px-3 h-8 rounded-lg text-sm font-medium border transition-all',
                      safePage === totalPages
                        ? 'border-border text-text-muted cursor-not-allowed opacity-40'
                        : 'border-border text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </main>

      {/* Promotion Details Drawer - Structured View */}
      <Panel
        title={selectedPromotion?.name ?? ''}
        anchor="right"
        open={!!selectedPromotion}
        setIsOpen={(open: boolean) => { if (!open) setSelectedPromotion(null) }}
        onClose={() => setSelectedPromotion(null)}
        size="medium"
      >
        {selectedPromotion && (<>
              {/* A. Header / Identity */}
              <div className="pb-4 mb-2 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      selectedPromotion.status === 'Running' ? 'success' :
                      selectedPromotion.status === 'Upcoming' ? 'info' : 'default'
                    }
                    className="text-xs"
                  >
                    {selectedPromotion.status}
                  </Badge>
                  <span className="text-xs text-text-muted">{selectedPromotion.id}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-text-secondary">{getOfferTypeLabel(selectedPromotion.type)}</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">
                    {selectedPromotion.channel === 'All' ? 'Omni' : selectedPromotion.channel}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* B. Offer Mechanics */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Offer Mechanics</h4>
                  <Card sx={{ padding: '16px', backgroundColor: 'rgba(248,250,252,0.6)' }}>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary mb-1">How it works</p>
                        <p className="text-sm text-text-secondary">
                          {selectedPromotion.type.includes('BOGO')
                            ? `Buy one, get one deal on qualifying ${selectedPromotion.scopeSummary}`
                            : selectedPromotion.type.includes('Bundle')
                            ? `Bundle price of ${selectedPromotion.discountLabel} on ${selectedPromotion.scopeSummary}`
                            : selectedPromotion.type === 'Sweepstakes'
                            ? `Enter for a chance to ${selectedPromotion.discountLabel}`
                            : selectedPromotion.type === 'Rewards'
                            ? `Earn ${selectedPromotion.discountLabel} on qualifying purchase`
                            : selectedPromotion.type.includes('Rewards')
                            ? `${selectedPromotion.discountLabel} on ${selectedPromotion.scopeSummary}`
                            : selectedPromotion.type === '% Off'
                            ? `${selectedPromotion.discountLabel} off ${selectedPromotion.scopeType === 'Sitewide' ? 'sitewide' : 'qualifying items'}`
                            : `Save ${selectedPromotion.discountLabel} on ${selectedPromotion.scopeSummary}`
                          }
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-1.5">Conditions</p>
                        <ul className="text-xs text-text-secondary space-y-1">
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                            <span>Valid {selectedPromotion.startDate.toLocaleDateString()} – {selectedPromotion.endDate.toLocaleDateString()}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                            <span>{selectedPromotion.channel === 'All' ? 'Available on all channels' : `${selectedPromotion.channel} channel only`}</span>
                          </li>
                          {selectedPromotion.type !== 'Sitewide' && (
                            <li className="flex items-start gap-2">
                              <Info className="w-3 h-3 text-info mt-0.5 flex-shrink-0" />
                              <span>Excludes gift cards and clearance items</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-1">Stackability</p>
                        <p className="text-xs text-text-secondary">
                          {selectedPromotion.channel === 'Loyalty'
                            ? 'Can be combined with loyalty points redemption'
                            : 'Not stackable with other promotional offers'
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                </section>

                {/* C. Product Scope — Deep Dive */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Product Scope</h4>
                  <Card sx={{ padding: '16px', backgroundColor: 'rgba(248,250,252,0.6)' }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Scope Type</span>
                        <Badge variant="default" className="text-xs">{selectedPromotion.scopeType}</Badge>
                      </div>
                      
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-2">Included</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{selectedPromotion.productType}</span>
                          {selectedPromotion.treatmentType && (
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{selectedPromotion.treatmentType}</span>
                          )}
                          {selectedPromotion.brand && (
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{selectedPromotion.brand}</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-2">Excluded</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded">Professional-only SKUs</span>
                          <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded">Clearance items</span>
                        </div>
                      </div>

                      {selectedPromotion.channel === 'All' && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-text-muted mb-1">Channel-specific scope</p>
                          <p className="text-xs text-text-secondary">Store scope limited to Tier-1 locations</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </section>

                {/* D. Performance Interpretation (NO Raw KPIs) */}
                {selectedPromotion.status !== 'Upcoming' && (
                  <section>
                    <h4 className="text-xs font-semibold text-text-muted mb-3">Performance Interpretation</h4>
                    <Card sx={{ padding: '16px', background: 'linear-gradient(135deg, rgba(66,89,238,0.05) 0%, transparent 100%)', borderColor: 'rgba(66,89,238,0.2)' }}>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-text-primary">
                            {selectedPromotion.ctr >= 5 
                              ? `Above-average engagement for ${getOfferTypeLabel(selectedPromotion.type)} promos in ${selectedPromotion.channel === 'All' ? 'Omni' : selectedPromotion.channel} channel`
                              : selectedPromotion.ctr >= 3
                              ? `Moderate engagement, typical for ${selectedPromotion.productType} category`
                              : `Below-benchmark engagement — consider creative refresh`
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-text-primary">
                            {selectedPromotion.conversionRate >= 4.5
                              ? 'Strong conversion indicates high purchase intent'
                              : selectedPromotion.conversionRate >= 3
                              ? 'Conversion slightly below benchmark — consider threshold adjustment'
                              : 'High reach but moderate conversion indicates browsing behavior'
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-text-primary">
                            {selectedPromotion.campaignImpact >= 30
                              ? 'Significant lift vs baseline — strong performer'
                              : selectedPromotion.campaignImpact >= 15
                              ? 'Moderate lift — performing within expected range'
                              : 'Minimal incremental impact — evaluate offer attractiveness'
                            }
                          </p>
                        </div>
                      </div>
                    </Card>
                  </section>
                )}

                {/* E. Campaign Usage Context */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Campaign Usage</h4>
                  <Card sx={{ padding: '16px', backgroundColor: 'rgba(248,250,252,0.6)' }}>
                    {selectedPromotion.campaignUsage > 0 ? (
                      <div className="space-y-2">
                        {/* Mock campaign usage data based on promo */}
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                          <div>
                            <p className="text-sm font-medium text-text-primary">Spring Color Refresh</p>
                            <p className="text-xs text-text-muted">Online • 2 creatives</p>
                          </div>
                          <Badge variant="success" className="text-xs">Live</Badge>
                        </div>
                        {selectedPromotion.campaignUsage > 1 && (
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <div>
                              <p className="text-sm font-medium text-text-primary">Holiday Gift Guide</p>
                              <p className="text-xs text-text-muted">Omni • 1 creative</p>
                            </div>
                            <Badge variant="default" className="text-xs">Completed</Badge>
                          </div>
                        )}
                        {selectedPromotion.campaignUsage > 2 && (
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-text-primary">Winter Essentials</p>
                              <p className="text-xs text-text-muted">Email • 3 creatives</p>
                            </div>
                            <Badge variant="info" className="text-xs">Scheduled</Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-text-muted">Not yet used in any campaign</p>
                        <p className="text-xs text-text-secondary mt-1">Available for mapping</p>
                      </div>
                    )}
                  </Card>
                </section>

                {/* F. Volume Context (Supportive Only) */}
                {selectedPromotion.status !== 'Upcoming' && selectedPromotion.unitsSold > 0 && (
                  <section>
                    <h4 className="text-xs font-semibold text-text-muted mb-3">Volume Context</h4>
                    <Card sx={{ padding: '16px', backgroundColor: 'rgba(248,250,252,0.6)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-muted">Units Sold</span>
                        <span className="text-sm text-text-secondary">{formatNumber(selectedPromotion.unitsSold)}</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {selectedPromotion.unitsSold >= 5000
                          ? 'High volume indicates strong demand and offer resonance.'
                          : selectedPromotion.unitsSold >= 2000
                          ? 'Moderate unit volume relative to reach suggests consideration-stage behavior.'
                          : 'Lower volume — may indicate niche appeal or awareness gap.'
                        }
                      </p>
                    </Card>
                  </section>
                )}

                {/* G. Risk & Constraints */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted mb-3">Risk & Constraints</h4>
                  <Card sx={{ padding: '16px', backgroundColor: 'rgba(248,250,252,0.6)' }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Margin Risk</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          (selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 35 
                            ? 'bg-success/10 text-success' 
                            : (selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 25 
                            ? 'bg-warning/10 text-warning' 
                            : 'bg-danger/10 text-danger'
                        )}>
                          {(selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 35 
                            ? 'Low' 
                            : (selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 25 
                            ? 'Medium' 
                            : 'High'
                          }
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-1">Constraints</p>
                        <ul className="text-xs text-text-secondary space-y-1">
                          {selectedPromotion.discountValue >= 40 && (
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              <span>Deep discount may impact margin on low-stock items</span>
                            </li>
                          )}
                          {selectedPromotion.channel === 'All' && (
                            <li className="flex items-center gap-2">
                              <Info className="w-3 h-3 text-info" />
                              <span>Store execution requires POS sync verification</span>
                            </li>
                          )}
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-success" />
                            <span>No inventory constraints identified</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </section>

                {/* H. Agent Insights & Recommendations */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-agent" />
                    Agent Recommendations
                  </h4>
                  <Card sx={{ padding: '16px', background: 'linear-gradient(135deg, rgba(66,89,238,0.05) 0%, transparent 100%)', borderColor: 'rgba(66,89,238,0.2)' }}>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-agent/5 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-agent/10 flex items-center justify-center flex-shrink-0">
                          <RotateCcw className="w-3 h-3 text-agent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Reuse Recommendation</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {selectedPromotion.campaignImpact >= 20 || selectedPromotion.expectedCampaignImpact >= 20
                              ? `Recommend reuse for Spring Sale (similar scope & offer type)`
                              : `Consider scope expansion before reuse to improve reach`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-agent/5 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-agent/10 flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-3 h-3 text-agent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Channel Optimization</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {selectedPromotion.channel === 'Email'
                              ? 'Pair with Push channel to improve reach by ~25%'
                              : selectedPromotion.channel === 'All'
                              ? 'Omni execution performing well — maintain current distribution'
                              : 'Avoid Store-only execution due to low in-store conversion history'
                            }
                          </p>
                        </div>
                      </div>
                      {selectedPromotion.campaignCoverage < 70 && (
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-agent/5 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-3 h-3 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">Coverage Alert</p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              Low campaign coverage — consider mapping to upcoming campaigns
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </section>

                {/* Actions */}
                <div className="flex gap-3 pt-2 pb-4">
                  <Button variant="outlined" className="flex-1 gap-2" onClick={() => showComingSoon('View campaigns')}>
                    <Eye className="w-4 h-4" />
                    View Campaigns
                  </Button>
                  <Button variant="primary" className="flex-1 gap-2" onClick={() => showComingSoon('Open in PromoSmart')}>
                    <ExternalLink className="w-4 h-4" />
                    Open in PromoSmart
                  </Button>
                </div>
              </div>
        </>)}
      </Panel>
    </div>
  )
}
