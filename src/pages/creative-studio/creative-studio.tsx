import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Sparkles, Check, Search, Image, Mail, Bell, X, Eye, RefreshCw, 
  ArrowLeft, Settings, FileText, Type, Droplets, MessageSquare, 
  Shield, Clock, Plus, Filter, Upload
} from 'lucide-react'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Modal } from 'impact-ui/src/components/Modal/index.js'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Accordion } from 'impact-ui/src/components/Accordion/index.js'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'

// Brand Guidelines Data (mutable for demo)
const initialBrandGuidelines = {
  lastUpdatedBy: 'Maria Lopez',
  lastUpdatedAt: 'Mar 10, 2026',
  logo: {
    rules: [
      'Full color logo on white/light backgrounds',
      'White logo on dark/colored backgrounds',
      '24px height minimum',
      '1x logo height on all sides'
    ]
  },
  colors: [
    { name: 'Primary Blue', hex: '#2563EB', usage: 'CTAs, Links, Highlights' },
    { name: 'Success Green', hex: '#10B981', usage: 'Positive actions, Confirmations' },
    { name: 'Warning Orange', hex: '#F59E0B', usage: 'Alerts, Urgency' },
    { name: 'Neutral Dark', hex: '#1F2937', usage: 'Headlines, Body text' },
  ],
  typography: {
    headline: 'Inter Bold, 24-48px',
    subhead: 'Inter Semibold, 16-20px',
    body: 'Inter Regular, 14-16px',
    cta: 'Inter Semibold, 14-16px, ALL CAPS optional'
  },
  tone: [
    'Confident but not arrogant',
    'Helpful and approachable',
    'Clear and concise',
    'Action-oriented'
  ],
  compliance: [
    'No unsubstantiated claims',
    'Include required disclaimers for promotions',
    'Accessibility: WCAG 2.1 AA compliant',
    'No competitor mentions'
  ]
}

// Creative Campaigns Data — Pet Supplies first, then Auto Parts
const creativeCampaigns = [
  // ── Pet Supplies / Pet Rewards Campaigns ──
  {
    id: 'CC-PET-001',
    name: 'Cat Month Rewards — May 2026',
    linkedCampaigns: ['Cat Month $5 Reward', '5X Points Cat Products'],
    linkedPromotions: ['$5 Reward on $40 Cat Spend', '5X Points'],
    category: 'Pet Supplies / Pet Rewards',
    assetTypes: ['Banner', 'Email', 'Push'],
    status: 'Approved',
    lastUpdated: 'May 1, 2026',
    assetCount: 5,
    thumbnail: '/images/banner_assets/cat_month_rewards_banner.png',
    products: [
      { name: 'All Cat Products (Category)' },
      { name: 'Cat Food, Litter & Accessories' },
    ],
  },
  {
    id: 'CC-PET-002',
    name: 'KONG Toys BOGO 40% Off',
    linkedCampaigns: ['BOGO 40% Off KONG Toys'],
    linkedPromotions: ['BOGO 40% Off'],
    category: 'Pet Supplies / Pet Rewards',
    assetTypes: ['Banner', 'Social', 'Email'],
    status: 'Approved',
    lastUpdated: 'Apr 30, 2026',
    assetCount: 4,
    thumbnail: '/images/banner_assets/kong_dog_toys_bogo_banner.png',
    products: [
      { name: 'KONG Classic Dog Toy' },
      { name: 'KONG Treat Dispenser' },
    ],
  },
  {
    id: 'CC-PET-003',
    name: 'Cat Wet Food — Buy 3 Get 1 Free',
    linkedCampaigns: ['Buy 3 Get 1 Free Wet Food'],
    linkedPromotions: ['Buy 3, Get 1 Free'],
    category: 'Pet Supplies / Pet Rewards',
    assetTypes: ['Banner', 'Email'],
    status: 'Approved',
    lastUpdated: 'May 1, 2026',
    assetCount: 3,
    thumbnail: '/images/banner_assets/cat_wet_food_bogo_banner.png',
    products: [
      { name: 'Cat Wet Food & Toppers (Category)' },
    ],
  },
  {
    id: 'CC-PET-004',
    name: 'Cinco De Meow Store Event',
    linkedCampaigns: ['Cinco De Meow Store Event'],
    linkedPromotions: ['Free Samples + Rewards Deals'],
    category: 'Pet Supplies / Pet Rewards',
    assetTypes: ['Banner', 'Social', 'Email', 'Push'],
    status: 'Approved',
    lastUpdated: 'May 7, 2026',
    assetCount: 6,
    thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png',
    products: [
      { name: 'Cat Month Local Store Event' },
    ],
  },
  {
    id: 'CC-PET-005',
    name: 'Premium Dog Food Rewards',
    linkedCampaigns: ['$10 Off Premium Dog Food', '$10 Off PureVita Dog Food'],
    linkedPromotions: ['$10 Off + $10 Reward'],
    category: 'Pet Supplies / Pet Rewards',
    assetTypes: ['Banner', 'Email', 'Push'],
    status: 'Approved',
    lastUpdated: 'May 1, 2026',
    assetCount: 4,
    thumbnail: '/images/banner_assets/premium_dog_food_rewards_banner.png',
    products: [
      { name: 'Badlands Ranch Dog Food' },
      { name: 'PureVita Dog Food' },
    ],
  },
  {
    id: 'CC-PET-006',
    name: 'Dog Grooming Add-ons — 25% Off',
    linkedCampaigns: ['Muddy Dog Grooming Add-ons'],
    linkedPromotions: ['25% Off Grooming Add-ons'],
    category: 'Pet Supplies / Pet Rewards',
    assetTypes: ['Banner', 'Social'],
    status: 'Approved',
    lastUpdated: 'May 1, 2026',
    assetCount: 3,
    thumbnail: '/images/banner_assets/dog_grooming_addons_banner.png',
    products: [
      { name: 'Dog Grooming Services & Add-ons' },
    ],
  },
  // ── Auto Parts Campaigns ──
  { 
    id: 'CC-001', 
    name: 'Purple Power Cleaner/Degreaser',
    linkedCampaigns: ['Purple Power Cleaner/Degreaser'],
    linkedPromotions: ['$4.99 + 300 Bonus Points'],
    category: 'Fluids and Chemicals',
    assetTypes: ['Banner', 'Email'],
    status: 'Draft',
    lastUpdated: 'Mar 17, 2026',
    assetCount: 4,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp',
    products: [
      { name: 'Purple Power Cleaner 40 oz.' },
      { name: 'Purple Power Degreaser Gallon' }
    ]
  },
  { 
    id: 'CC-002', 
    name: 'Armor All Products',
    linkedCampaigns: ['Armor All Products'],
    linkedPromotions: ['$5 Gift Card + 200 Bonus Points'],
    category: 'Appearance and Paint',
    assetTypes: ['Banner', 'Email', 'Push'],
    status: 'Approved',
    lastUpdated: 'Mar 15, 2026',
    assetCount: 6,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp',
    products: [
      { name: 'Armor All Protectant Spray' },
      { name: 'Armor All Cleaning Wipes' }
    ]
  },
  { 
    id: 'CC-003', 
    name: 'Innova Wireless Code Scanner',
    linkedCampaigns: ['Innova Wireless Code Scanner'],
    linkedPromotions: ['Save $10 + 200 Bonus Points'],
    category: 'Tools',
    assetTypes: ['Banner', 'Social'],
    status: 'In Progress',
    lastUpdated: 'Mar 16, 2026',
    assetCount: 3,
    thumbnail: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp',
    products: [
      { name: 'Innova 5610 Wireless Scanner' },
      { name: 'Innova 5210 Code Reader' }
    ]
  },
  { 
    id: 'CC-004', 
    name: 'Chevron Techron Fuel System Cleaner',
    linkedCampaigns: ['Chevron Techron Fuel System Cleaner'],
    linkedPromotions: ['$8.99 + 2X Bonus Points'],
    category: 'Fuel and Emissions System',
    assetTypes: ['Banner', 'Email'],
    status: 'Approved',
    lastUpdated: 'Mar 12, 2026',
    assetCount: 5,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp',
    products: [
      { name: 'Techron Fuel System Cleaner 12 oz.' },
      { name: 'Techron High Mileage 12 oz.' }
    ]
  },
  { 
    id: 'CC-005', 
    name: 'WD-40 Smart Straw, 12 Oz.',
    linkedCampaigns: ['WD-40 Smart Straw, 12 Oz.'],
    linkedPromotions: ['$8.99 + 2X Bonus Points'],
    category: 'Fluids and Chemicals',
    assetTypes: ['Banner', 'Push'],
    status: 'Approved',
    lastUpdated: 'Mar 11, 2026',
    assetCount: 4,
    thumbnail: '/images/banner_assets/AdvanceRewards_460x260_5.webp',
    products: [
      { name: 'WD-40 Smart Straw 12 oz.' },
      { name: 'WD-40 Specialist Penetrant' }
    ]
  },
  { 
    id: 'CC-006', 
    name: 'Valvoline Motorcycle Oil Quarts',
    linkedCampaigns: ['Valvoline Motorcycle Oil Quarts'],
    linkedPromotions: ['50 Bonus Points'],
    category: 'Oil and Lubricants',
    assetTypes: ['Banner', 'Email', 'Social'],
    status: 'Needs Update',
    lastUpdated: 'Mar 10, 2026',
    assetCount: 5,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp',
    products: [
      { name: 'Valvoline 4-Stroke Motorcycle Oil' },
      { name: 'Valvoline 2-Stroke Motorcycle Oil' }
    ]
  },
  { 
    id: 'CC-007', 
    name: 'STP Octane Booster',
    linkedCampaigns: ['STP Octane Booster'],
    linkedPromotions: ['Buy One, Get One FREE + 2X Bonus Points'],
    category: 'Fuel and Emissions System',
    assetTypes: ['Banner', 'Social'],
    status: 'Approved',
    lastUpdated: 'Mar 20, 2026',
    assetCount: 3,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp',
    products: [
      { name: 'STP Octane Booster 5.25 oz.' },
      { name: 'STP Super Concentrated Fuel Injector' }
    ]
  },
  { 
    id: 'CC-008', 
    name: 'TruFuel Premixed Small Engine Fuel',
    linkedCampaigns: ['TruFuel Premixed Small Engine Fuel'],
    linkedPromotions: ['$7.99 + 2X Bonus Points'],
    category: 'Lawn and Garden',
    assetTypes: ['Banner', 'Email'],
    status: 'In Progress',
    lastUpdated: 'Mar 19, 2026',
    assetCount: 3,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp',
    products: [
      { name: 'TruFuel 50:1 Pre-Mixed Fuel' },
      { name: 'TruFuel 40:1 Pre-Mixed Fuel' }
    ]
  },
  { 
    id: 'CC-009', 
    name: 'Lucas Chain Lube Aerosol',
    linkedCampaigns: ['Lucas Chain Lube Aerosol'],
    linkedPromotions: ['Save $2 + 2X Bonus Points'],
    category: 'Oil and Lubricants',
    assetTypes: ['Banner', 'Push', 'Email'],
    status: 'Draft',
    lastUpdated: 'Mar 18, 2026',
    assetCount: 4,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp',
    products: [
      { name: 'Lucas Chain Lube 11 oz. Aerosol' },
      { name: 'Lucas Red "N" Tacky Grease' }
    ]
  },
  { 
    id: 'CC-010', 
    name: 'Garage of Legends Sweepstakes',
    linkedCampaigns: ['Win a $25,000 Legendary Garage Makeover'],
    linkedPromotions: ['Curated by Gears & Gasoline — Ends May 31, 2026'],
    category: 'Accessories',
    assetTypes: ['Banner', 'Social', 'Email'],
    status: 'Approved',
    lastUpdated: 'Mar 21, 2026',
    assetCount: 3,
    thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6_alt.webp',
    products: [
      { name: 'Garage of Legends Decal Kit' },
      { name: 'Gears & Gasoline Merch Pack' }
    ]
  },
]

// Agent update suggestions
const agentUpdateSuggestions = [
  { id: 'color', label: 'Add a new accent color', description: 'Suggest adding a coral accent (#FF6B6B) for seasonal campaigns' },
  { id: 'tone', label: 'Update tone guidelines', description: 'Add "Inclusive and welcoming" to tone of voice' },
  { id: 'typography', label: 'Add mobile typography', description: 'Include mobile-specific font sizes for better readability' },
  { id: 'compliance', label: 'Update compliance rules', description: 'Add GDPR consent language requirements' },
]

// Asset type definition
type CreativeAsset = {
  id: string
  type: string
  format: string
  channel: string
  status: string
  agentNote: string
  thumbnail: string
  headline: string
  subcopy: string
}

// Creative Assets for campaigns - mapped by campaign ID
const campaignAssetsMap: Record<string, CreativeAsset[]> = {
  'CC-001': [ // Purple Power Cleaner/Degreaser
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage hero for Purple Power promo', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', headline: '$4.99 + 300 Bonus Points', subcopy: 'Purple Power Cleaner/Degreaser — ultimate cleaning power' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Square format for social feed', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', headline: 'Purple Power Deal', subcopy: 'Get 300 Bonus Points with purchase' },
    { id: 'asset-3', type: 'Banner', format: '4:5', channel: 'Social', status: 'Needs Update', agentNote: 'Stories format, needs CTA adjustment', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', headline: 'Clean & Save', subcopy: 'Purple Power Degreaser — just $4.99' },
    { id: 'asset-4', type: 'Email', format: '600px', channel: 'Email', status: 'Draft', agentNote: 'Email header banner for rewards members', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_1.webp', headline: 'Rewards Week: Purple Power', subcopy: '300 Bonus Points on Purple Power Cleaner' },
  ],
  'CC-002': [ // Armor All Products
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage hero for Armor All promo', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', headline: '$5 Gift Card + 200 Bonus Points', subcopy: 'Spend $15 on Armor All Products — gift card by mail' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Square format for social', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', headline: 'Armor All Rewards', subcopy: 'Get a $5 gift card when you spend $15' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email campaign for Armor All rebate', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv_Rewards_Week_April_2026_2.webp', headline: 'Armor All Gift Card Offer', subcopy: '200 Bonus Points + $5 gift card by mail' },
  ],
  'CC-003': [ // Innova Wireless Code Scanner
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage hero for Innova scanner promo', thumbnail: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', headline: 'Save $10 + 200 Bonus Points', subcopy: 'Innova Wireless Code Scanner — diagnose like a pro' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'In Progress', agentNote: 'Social media square format', thumbnail: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', headline: 'Scan Smarter', subcopy: 'Innova Wireless Scanner — $10 off + bonus points' },
    { id: 'asset-3', type: 'Banner', format: '4:5', channel: 'Social', status: 'Draft', agentNote: 'Stories format for scanner promo', thumbnail: '/images/banner_assets/Adv-Rewards-Page_Adv-Rewards-Week_April-2026_innova_3.webp', headline: 'DIY Diagnostics', subcopy: 'Bluetooth OBD2 scanner — read & clear codes instantly' },
  ],
  'CC-004': [ // Chevron Techron Fuel System Cleaner
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage hero for Techron promo', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', headline: '$8.99 + 2X Bonus Points', subcopy: 'Chevron Techron Fuel System Cleaner — Regular or High Mileage' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Square format for social', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', headline: 'Techron Fuel Cleaner', subcopy: 'Double points on every bottle — $8.99' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email promo for Techron', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_4.webp', headline: 'Clean Your Engine', subcopy: 'Techron 12 oz. — 2X Bonus Points this week' },
  ],
  'CC-005': [ // WD-40 Smart Straw
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage hero for WD-40 promo', thumbnail: '/images/banner_assets/AdvanceRewards_460x260_5.webp', headline: '$8.99 + 2X Bonus Points', subcopy: 'WD-40 Smart Straw, 12 Oz. — precision spray' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for WD-40', thumbnail: '/images/banner_assets/AdvanceRewards_460x260_5.webp', headline: 'WD-40 Smart Straw', subcopy: 'Double points — the can that does it all' },
    { id: 'asset-3', type: 'Push', format: 'Push', channel: 'Push', status: 'Approved', agentNote: 'Push notification for WD-40 deal', thumbnail: '/images/banner_assets/AdvanceRewards_460x260_5.webp', headline: 'WD-40 Deal Alert', subcopy: '$8.99 + earn 2X Bonus Points today' },
  ],
  'CC-006': [ // Valvoline Motorcycle Oil Quarts
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage banner for Valvoline motorcycle oil', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', headline: '50 Bonus Points', subcopy: 'Valvoline Motorcycle Oil Quarts — ride ready' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Needs Update', agentNote: 'Social format for motorcycle oil', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', headline: 'Ride Season Rewards', subcopy: '50 Bonus Points on Valvoline Motorcycle Oil' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email for motorcycle riders', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6.webp', headline: 'Valvoline Motorcycle Oil', subcopy: 'Earn 50 Bonus Points per quart purchased' },
  ],
  'CC-007': [ // STP Octane Booster
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Homepage hero for STP Octane Booster BOGO', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', headline: 'Buy One, Get One FREE', subcopy: 'STP Octane Booster + 2X Bonus Points' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for STP BOGO', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', headline: 'STP BOGO Deal', subcopy: 'Octane Booster — buy one, get one free' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Draft', agentNote: 'Email blast for STP promo', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_7.webp', headline: 'Double Up on STP', subcopy: 'BOGO + 2X Bonus Points — limited time' },
  ],
  'CC-008': [ // TruFuel Premixed Small Engine Fuel
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'In Progress', agentNote: 'Homepage banner for TruFuel promo', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', headline: '$7.99 + 2X Bonus Points', subcopy: 'TruFuel Premixed Small Engine Fuel — ethanol-free' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social format for TruFuel', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', headline: 'TruFuel Ready-Mix', subcopy: 'Pre-mixed fuel for mowers & trimmers — $7.99' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email for lawn & garden segment', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_8.webp', headline: 'Lawn Season Fuel Up', subcopy: 'TruFuel + 2X Bonus Points — protect your engine' },
  ],
  'CC-009': [ // Lucas Chain Lube Aerosol
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Draft', agentNote: 'Homepage hero for Lucas Chain Lube', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', headline: 'Save $2 + 2X Bonus Points', subcopy: 'Lucas Chain Lube Aerosol — long-lasting protection' },
    { id: 'asset-2', type: 'Push', format: 'Push', channel: 'Push', status: 'Approved', agentNote: 'Push notification for Lucas deal', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', headline: 'Lucas Lube Deal', subcopy: 'Save $2 on Chain Lube + earn double points' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Draft', agentNote: 'Email for motorcycle/ATV riders', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', headline: 'Chain Maintenance Sale', subcopy: 'Lucas Aerosol — $2 off + 2X Bonus Points' },
    { id: 'asset-4', type: 'Banner', format: '4:5', channel: 'Social', status: 'Draft', agentNote: 'Stories format for chain lube', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_9.webp', headline: 'Protect Your Chain', subcopy: 'Lucas Chain Lube — save $2 this week' },
  ],
  'CC-010': [ // Garage of Legends Sweepstakes
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for Garage of Legends sweepstakes', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6_alt.webp', headline: 'Win a $25,000 Garage Makeover', subcopy: 'Garage of Legends Sweepstakes — curated by Gears & Gasoline' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for sweepstakes', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6_alt.webp', headline: 'Garage of Legends', subcopy: 'Enter to win a legendary $25K garage makeover' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email for sweepstakes announcement', thumbnail: '/images/banner_assets/Adv_Rewards_Page_Adv-Rewards_Week_April_2026_6_alt.webp', headline: 'Enter the Sweepstakes', subcopy: 'Ends May 31, 2026 — Gears & Gasoline garage makeover' },
  ],
  // ── Pet Supplies / Pet Rewards ──
  'CC-PET-001': [ // Cat Month Rewards
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for Cat Month $5 Reward & 5X Points', thumbnail: '/images/banner_assets/cat_month_rewards_banner.png', headline: '$5 Reward on $40 Cat Spend', subcopy: 'Cat Month — earn 5X Points on all cat products this week' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Square social post for Cat Month', thumbnail: '/images/banner_assets/cat_month_rewards_banner.png', headline: 'Cat Month Rewards', subcopy: '5X Points + $5 Reward on $40 cat spend' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email to loyalty members about cat month', thumbnail: '/images/banner_assets/cat_month_rewards_banner.png', headline: 'It\'s Cat Month!', subcopy: 'Earn $5 Reward when you spend $40 on cat products' },
    { id: 'asset-4', type: 'Push', format: 'Push', channel: 'Push', status: 'Approved', agentNote: 'Push notification for cat month launch', thumbnail: '/images/banner_assets/cat_month_rewards_banner.png', headline: 'Cat Month is here! 🐱', subcopy: 'Earn 5X Points on all cat food, litter & more today' },
    { id: 'asset-5', type: 'Banner', format: '4:5', channel: 'Social', status: 'Approved', agentNote: 'Stories format for cat month', thumbnail: '/images/banner_assets/cat_month_rewards_banner.png', headline: '5X Points — Cat Month', subcopy: 'Stock up on cat favorites & earn big rewards' },
  ],
  'CC-PET-002': [ // KONG Toys BOGO
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for KONG BOGO 40% off promotion', thumbnail: '/images/banner_assets/kong_dog_toys_bogo_banner.png', headline: 'BOGO 40% Off KONG Toys', subcopy: 'Buy any KONG toy, get a second one 40% off — all KONG Toys & Treats' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for KONG BOGO', thumbnail: '/images/banner_assets/kong_dog_toys_bogo_banner.png', headline: 'KONG BOGO Deal', subcopy: 'Buy one, get one 40% off — limited time' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email campaign for KONG deal', thumbnail: '/images/banner_assets/kong_dog_toys_bogo_banner.png', headline: 'Your Dog Deserves Two', subcopy: 'BOGO 40% Off all KONG Toys & Treats — ends May 13' },
    { id: 'asset-4', type: 'Banner', format: '4:5', channel: 'Social', status: 'Approved', agentNote: 'Stories format for KONG promo', thumbnail: '/images/banner_assets/kong_dog_toys_bogo_banner.png', headline: 'KONG × Bonus Points', subcopy: 'BOGO 40% Off — stuff with treats for double the fun' },
  ],
  'CC-PET-003': [ // Cat Wet Food Buy 3 Get 1
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for cat wet food buy 3 get 1 free', thumbnail: '/images/banner_assets/cat_wet_food_bogo_banner.png', headline: 'Buy 3 Get 1 FREE', subcopy: 'Cat Wet Food & Toppers — mix & match your favorites' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for wet food deal', thumbnail: '/images/banner_assets/cat_wet_food_bogo_banner.png', headline: 'Stock Up & Save', subcopy: 'Cat Wet Food — buy 3, get the 4th free' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email for cat wet food deal to cat owners', thumbnail: '/images/banner_assets/cat_wet_food_bogo_banner.png', headline: 'Wet Food Deal — Buy 3 Get 1', subcopy: 'Mix & match cat wet food and toppers — ends May 20' },
  ],
  'CC-PET-004': [ // Cinco De Meow Event
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for Cinco De Meow store event', thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png', headline: 'Cinco De Meow! 🐾', subcopy: 'Free samples + exclusive rewards deals — Cat Month local store event, May 9' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for event promotion', thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png', headline: 'Join the Purrty', subcopy: 'Cinco De Meow — free samples & deals, May 9 in-store' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email blast for event invite to cat owners', thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png', headline: 'You\'re Invited: Cinco De Meow', subcopy: 'Free cat product samples + exclusive in-store rewards — May 9' },
    { id: 'asset-4', type: 'Push', format: 'Push', channel: 'Push', status: 'Approved', agentNote: 'Push reminder day of event', thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png', headline: 'Cinco De Meow Today! 🎉', subcopy: 'Come in-store for free samples & cat deals — today only' },
    { id: 'asset-5', type: 'Banner', format: '4:5', channel: 'Social', status: 'Approved', agentNote: 'Stories format for event day', thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png', headline: 'Cinco De Meow', subcopy: 'The cat party is here — free samples, rewards & more' },
    { id: 'asset-6', type: 'Banner', format: '9:16', channel: 'Social', status: 'Approved', agentNote: 'Reels/TikTok vertical format for event', thumbnail: '/images/banner_assets/cinco_de_meow_event_banner.png', headline: 'May 9 In-Store Event', subcopy: 'Bring your inner cat parent — Cinco De Meow!' },
  ],
  'CC-PET-005': [ // Premium Dog Food Rewards
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for Badlands Ranch & PureVita $10 off + reward', thumbnail: '/images/banner_assets/premium_dog_food_rewards_banner.png', headline: '$10 Off + $10 Reward', subcopy: 'Badlands Ranch & PureVita Premium Dog Food — nourish what matters most' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for premium dog food promo', thumbnail: '/images/banner_assets/premium_dog_food_rewards_banner.png', headline: 'Premium Dog Food Deal', subcopy: '$10 Off + $10 Loyalty Reward on Badlands Ranch & PureVita' },
    { id: 'asset-3', type: 'Email', format: '600px', channel: 'Email', status: 'Approved', agentNote: 'Email to loyalty members who purchase premium dog food', thumbnail: '/images/banner_assets/premium_dog_food_rewards_banner.png', headline: 'Your Dog Eats Premium', subcopy: 'Save $10 + earn a $10 reward — Badlands Ranch & PureVita' },
    { id: 'asset-4', type: 'Push', format: 'Push', channel: 'Push', status: 'Approved', agentNote: 'Push notification for dog food deal', thumbnail: '/images/banner_assets/premium_dog_food_rewards_banner.png', headline: 'Dog Food Deal Alert 🐕', subcopy: '$10 Off + $10 Reward on Badlands Ranch — limited time' },
  ],
  'CC-PET-006': [ // Dog Grooming Add-ons
    { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Hero banner for dog grooming add-on 25% off', thumbnail: '/images/banner_assets/dog_grooming_addons_banner.png', headline: '25% Off Grooming Add-ons', subcopy: 'Muddy pup? Treat them to premium grooming add-ons this May' },
    { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Social square for grooming discount', thumbnail: '/images/banner_assets/dog_grooming_addons_banner.png', headline: 'Grooming Add-ons 25% Off', subcopy: 'Pamper your pup — save on all dog grooming add-on services' },
    { id: 'asset-3', type: 'Banner', format: '4:5', channel: 'Social', status: 'Approved', agentNote: 'Stories format for grooming promo', thumbnail: '/images/banner_assets/dog_grooming_addons_banner.png', headline: 'Treat Your Dog This May', subcopy: '25% Off all grooming add-ons — book now' },
  ],
}

// Default assets (fallback)
const campaignAssets = campaignAssetsMap['CC-001']

// Regeneration steps
const regenerationSteps = [
  { label: 'Applying brand rules', icon: Shield },
  { label: 'Adjusting tone for selected audience', icon: MessageSquare },
  { label: 'Preserving approved messaging', icon: Check },
  { label: 'Regenerating selected assets', icon: RefreshCw },
]

type ViewMode = 'library' | 'review' | 'compare' | 'create'
type GuidelinesMode = 'view' | 'agent-update' | 'upload-json' | 'review-changes'
type CreateStep = 'details' | 'products' | 'brief' | 'generate' | 'preview'

// AutoZone Auto Parts products for selection
const availableProducts = [
  { id: 'prod-1', name: 'Mobil 1 Full Synthetic 5W-30', category: 'Oil and Lubricants', price: 29.99, image: '/images/oil_change_filter_kits/SKU 10558155.webp' },
  { id: 'prod-2', name: 'Castrol EDGE 5W-30', category: 'Oil and Lubricants', price: 27.99, image: '/images/oil_change_filter_kits/SKU 10693169.webp' },
  { id: 'prod-3', name: 'Duralast Gold Ceramic Brake Pads', category: 'Braking', price: 44.99, image: '/images/brake_battery_essentials/SKU 2-12257635.webp' },
  { id: 'prod-4', name: 'DieHard Gold Battery Group 65', category: 'Battery and Electrical', price: 189.99, image: '/images/fleet_emergency_parts/SKU 4-11089445.webp' },
  { id: 'prod-5', name: 'STP Extended Life Oil Filter', category: 'Filters and PCV', price: 8.99, image: '/images/air_filter_pcv_components/SKU 5-11592885.webp' },
  { id: 'prod-6', name: 'Bosch Icon Beam Wiper Blade 22"', category: 'Wipers and Related', price: 24.99, image: '/images/wiper_visibility_products/SKU 6-11386730.webp' },
  { id: 'prod-7', name: 'Fram Extra Guard Oil Filter', category: 'Filters and PCV', price: 6.99, image: '/images/air_filter_pcv_components/SKU 5-22141637.webp' },
  { id: 'prod-8', name: 'Rain-X Latitude Wiper Blade 18"', category: 'Wipers and Related', price: 19.99, image: '/images/wiper_visibility_products/SKU 6-11688408.webp' },
]

// Available segments for selection - AutoZone Auto Parts specific
const availableSegments = [
  { id: 'seg-1', name: 'DIY Routine Maintenance Buyers', customers: 145000, description: 'Regular oil change & filter buyers' },
  { id: 'seg-2', name: 'DIY Price-Sensitive Promo Buyers', customers: 82000, description: 'Buy when discounted or bundled' },
  { id: 'seg-3', name: 'DIY Urgent Repair Buyers', customers: 105000, description: 'Failure-triggered immediate purchases' },
  { id: 'seg-4', name: 'PRO High-Value Shops', customers: 68000, description: 'Independent repair shops with bulk orders' },
  { id: 'seg-5', name: 'PRO Fleet Operators', customers: 42000, description: 'Fleet maintenance with scheduled deliveries' },
  { id: 'seg-6', name: 'PRO Emergency Restock Buyers', customers: 38000, description: 'Same-day emergency parts restock' },
]

// Available promotions for selection - AutoZone Auto Parts specific
const availablePromos = [
  { id: 'promo-1', name: '15% Off Oil Change Kit', type: 'Percentage', value: '15% OFF' },
  { id: 'promo-2', name: '20% Off Brake Kit', type: 'Percentage', value: '20% OFF' },
  { id: 'promo-3', name: '15% Off + Free Battery Test', type: 'Bundle', value: '15% OFF + Free Test' },
  { id: 'promo-4', name: '15% Off Filter Kit', type: 'Percentage', value: '15% OFF' },
  { id: 'promo-5', name: '25% Off PRO Contract', type: 'Contract', value: '25% OFF' },
  { id: 'promo-6', name: 'Buy 2 Wipers Get Fluid Free', type: 'BOGO', value: 'B2G1' },
]

// Banner generation steps
const bannerGenSteps = [
  { label: 'Analyzing product attributes', icon: Eye },
  { label: 'Applying brand guidelines', icon: Shield },
  { label: 'Generating headline variations', icon: Type },
  { label: 'Composing visual layouts', icon: Image },
  { label: 'Running compliance checks', icon: Check },
]

export function CreativeStudio() {
  const [viewMode, setViewMode] = useState<ViewMode>('library')
  const [selectedCampaign, setSelectedCampaign] = useState<typeof creativeCampaigns[0] | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  
  // Brand guidelines state
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false)
  const [guidelinesMode, setGuidelinesMode] = useState<GuidelinesMode>('view')
  const [brandGuidelines, setBrandGuidelines] = useState(initialBrandGuidelines)
  const [pendingChanges, setPendingChanges] = useState<{field: string, oldValue: string, newValue: string}[]>([])
  const [selectedAgentSuggestion, setSelectedAgentSuggestion] = useState<string | null>(null)
  const [agentThinking, setAgentThinking] = useState(false)
  const [customUpdateInput, setCustomUpdateInput] = useState('')
  const [showWarningConfirm, setShowWarningConfirm] = useState(false)
  const [pendingUpdateAction, setPendingUpdateAction] = useState<{type: 'suggestion' | 'custom', value: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [assetChannelFilter, setAssetChannelFilter] = useState('All')
  const [assetStatusFilter, setAssetStatusFilter] = useState('All')
  
  // Change intent state
  const [showChangeIntent, setShowChangeIntent] = useState(false)
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [additionalDirection, setAdditionalDirection] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentRegenStep, setCurrentRegenStep] = useState(0)
  const [_compareAsset, _setCompareAsset] = useState<typeof campaignAssets[0] | null>(null)
  
  // New Creative Campaign state
  const [createStep, setCreateStep] = useState<CreateStep>('details')
  const [newCampaignName, setNewCampaignName] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [segmentSearch, setSegmentSearch] = useState('')
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState('')
  const [promoSearch, setPromoSearch] = useState('')
  const [showPromoDropdown, setShowPromoDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bannerHeadline, setBannerHeadline] = useState('')
  const [bannerSubcopy, setBannerSubcopy] = useState('')
  const [bannerCta, setBannerCta] = useState('Shop Now')
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['16:9', '1:1'])
  const [isGeneratingBanners, setIsGeneratingBanners] = useState(false)
  const [bannerGenStep, setBannerGenStep] = useState(0)
  const [generatedBanners, setGeneratedBanners] = useState<{id: string, format: string, approved: boolean}[]>([])

  // Refs for click-outside handling
  const segmentDropdownRef = useRef<HTMLDivElement>(null)
  const promoDropdownRef = useRef<HTMLDivElement>(null)

  // Click outside handler for remaining custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (segmentDropdownRef.current && !segmentDropdownRef.current.contains(event.target as Node)) {
        setShowSegmentDropdown(false)
      }
      if (promoDropdownRef.current && !promoDropdownRef.current.contains(event.target as Node)) {
        setShowPromoDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCampaigns = creativeCampaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) || campaign.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Get assets for the selected campaign
  const currentCampaignAssets = selectedCampaign ? (campaignAssetsMap[selectedCampaign.id] || campaignAssets) : campaignAssets
  
  const filteredAssets = currentCampaignAssets.filter((asset: CreativeAsset) => {
    const matchesChannel = assetChannelFilter === 'All' || asset.channel === assetChannelFilter
    const matchesStatus = assetStatusFilter === 'All' || asset.status === assetStatusFilter
    return matchesChannel && matchesStatus
  })

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'Approved': return 'success'
      case 'Needs Update': return 'warning'
      case 'Draft': return 'info'
      default: return 'default'
    }
  }

  const getAssetTypeIcon = (type: string) => {
    switch (type) { case 'Banner': return Image; case 'Email': return Mail; case 'Push': return Bell; default: return Image }
  }

  const initiateUpdate = (type: 'suggestion' | 'custom', value: string) => {
    setPendingUpdateAction({ type, value })
    setShowWarningConfirm(true)
  }

  const confirmAndProcessUpdate = () => {
    if (!pendingUpdateAction) return
    setShowWarningConfirm(false)
    
    if (pendingUpdateAction.type === 'suggestion') {
      setSelectedAgentSuggestion(pendingUpdateAction.value)
    }
    
    setAgentThinking(true)
    setTimeout(() => {
      setAgentThinking(false)
      
      if (pendingUpdateAction.type === 'suggestion') {
        const suggestionId = pendingUpdateAction.value
        if (suggestionId === 'color') {
          setPendingChanges([{ field: 'Color Palette', oldValue: '4 colors defined', newValue: '5 colors (added Coral #FF6B6B)' }])
        } else if (suggestionId === 'tone') {
          setPendingChanges([{ field: 'Tone of Voice', oldValue: '4 guidelines', newValue: '5 guidelines (added "Inclusive and welcoming")' }])
        } else if (suggestionId === 'typography') {
          setPendingChanges([{ field: 'Typography', oldValue: '4 type styles', newValue: '5 type styles (added Mobile Body: 16-18px)' }])
        } else if (suggestionId === 'compliance') {
          setPendingChanges([{ field: 'Compliance', oldValue: '4 rules', newValue: '5 rules (added GDPR consent language)' }])
        }
      } else {
        // Custom input - simulate Alan understanding the request
        setPendingChanges([{ field: 'Custom Update', oldValue: 'Current guidelines', newValue: `Updated based on: "${pendingUpdateAction.value}"` }])
      }
      
      setPendingUpdateAction(null)
      setCustomUpdateInput('')
      setGuidelinesMode('review-changes')
    }, 1500)
  }

  const cancelWarning = () => {
    setShowWarningConfirm(false)
    setPendingUpdateAction(null)
  }

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          JSON.parse(event.target?.result as string) // Validate JSON
          setPendingChanges([
            { field: 'Brand Guidelines', oldValue: 'Current configuration', newValue: 'Uploaded JSON configuration' }
          ])
          setGuidelinesMode('review-changes')
        } catch { alert('Invalid JSON file') }
      }
      reader.readAsText(file)
    }
  }

  const approveChanges = () => {
    // Get current date formatted
    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    
    // Update based on the type of change
    if (selectedAgentSuggestion === 'color') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        colors: [...prev.colors, { name: 'Coral Accent', hex: '#FF6B6B', usage: 'Seasonal highlights' }],
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else if (selectedAgentSuggestion === 'tone') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        tone: [...prev.tone, 'Inclusive and welcoming'],
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else if (selectedAgentSuggestion === 'typography') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        typography: { ...prev.typography, mobile: 'Inter Regular, 16-18px' },
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else if (selectedAgentSuggestion === 'compliance') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        compliance: [...prev.compliance, 'GDPR consent language required'],
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else {
      // Custom update - just update the date
      setBrandGuidelines(prev => ({ 
        ...prev, 
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    }
    
    setPendingChanges([])
    setSelectedAgentSuggestion(null)
    setGuidelinesMode('view')
  }

  const startRegeneration = () => {
    setIsRegenerating(true)
    setCurrentRegenStep(0)
    const interval = setInterval(() => {
      setCurrentRegenStep(prev => {
        if (prev >= regenerationSteps.length - 1) {
          clearInterval(interval)
          setTimeout(() => { setIsRegenerating(false); setShowChangeIntent(false); setSelectedIntents([]); setAdditionalDirection('') }, 800)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  // Reset create form
  const resetCreateForm = () => {
    setNewCampaignName('')
    setSelectedSegment('')
    setSegmentSearch('')
    setShowSegmentDropdown(false)
    setSelectedPromo('')
    setPromoSearch('')
    setShowPromoDropdown(false)
    setSelectedProducts([])
    setBannerHeadline('')
    setBannerSubcopy('')
    setBannerCta('Shop Now')
    setSelectedFormats(['16:9', '1:1'])
    setGeneratedBanners([])
    setBannerGenStep(0)
    setIsGeneratingBanners(false)
  }

  // Start banner generation
  const startBannerGeneration = () => {
    setIsGeneratingBanners(true)
    setBannerGenStep(0)
    const interval = setInterval(() => {
      setBannerGenStep(prev => {
        if (prev >= bannerGenSteps.length - 1) {
          clearInterval(interval)
          setTimeout(() => {
            setIsGeneratingBanners(false)
            setGeneratedBanners(selectedFormats.map((format, i) => ({ id: `gen-${i}`, format, approved: false })))
            setCreateStep('preview')
          }, 800)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  const toggleFormatSelection = (format: string) => {
    setSelectedFormats(prev => prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format])
  }

  const toggleBannerApprovalGen = (bannerId: string) => {
    setGeneratedBanners(prev => prev.map(b => b.id === bannerId ? { ...b, approved: !b.approved } : b))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary">
      {/* Header */}
      <header className="bg-white border-b border-border px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-border">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Creative Studio</h1>
              <p className="text-sm text-text-secondary">All Creative Campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="tertiary" className="border border-border hover:bg-surface-secondary" onClick={() => { setGuidelinesExpanded(!guidelinesExpanded); setGuidelinesMode('view') }}>
              <Settings className="w-4 h-4 mr-2" /> Update Brand Guidelines
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark text-white shadow-lg shadow-border"
              onClick={() => { setViewMode('create'); setCreateStep('details'); resetCreateForm() }}
            >
              <Plus className="w-4 h-4 mr-2" /> New Creative Campaign
            </Button>
          </div>
        </div>
      </header>

      {/* Brand Guidelines Accordion */}
      {guidelinesExpanded && (
        <div className="border-b border-border-light bg-surface-secondary/50 accordions_white">
          <Accordion
            expanded={guidelinesExpanded ? 'guidelines' : ''}
            setExpanded={(val: string) => setGuidelinesExpanded(!!val)}
            data={[{
              value: 'guidelines',
              header: (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-surface-tertiary flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-text-primary">Brand Guidelines</h2>
                      <p className="text-xs text-text-muted">Last updated by {brandGuidelines.lastUpdatedBy} on {brandGuidelines.lastUpdatedAt}</p>
                    </div>
                  </div>
                </div>
              ),
              content: (
                <div>
            <div className="px-8 py-5">
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mb-5">
                  {guidelinesMode === 'view' && (
                    <>
                      <Button variant="tertiary" size="small" className="text-primary hover:bg-primary-subtle" onClick={() => setGuidelinesMode('agent-update')}>
                        <Sparkles className="w-4 h-4 mr-1" /> Ask Alan to Update
                      </Button>
                      <Button variant="tertiary" size="small" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-1" /> Upload JSON
                      </Button>
                      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                    </>
                  )}
                  {guidelinesMode === 'review-changes' && (
                    <>
                      <Button variant="tertiary" size="small" onClick={() => { setGuidelinesMode('view'); setPendingChanges([]) }}>Cancel</Button>
                      <Button size="small" variant="primary" onClick={approveChanges}>
                        <Check className="w-4 h-4 mr-1" /> Approve Changes
                      </Button>
                    </>
                  )}
              </div>

              {/* Agent Update Mode */}
              {guidelinesMode === 'agent-update' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-gradient-to-r from-primary-subtle to-primary-subtle rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">What would you like Alan to update?</h3>
                        <p className="text-sm text-text-secondary">Describe your changes or select a quick suggestion below</p>
                      </div>
                    </div>
                    
                    {agentThinking ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader size="large" />
                        <span className="ml-3 text-text-secondary">Alan is preparing the update...</span>
                      </div>
                    ) : (
                      <>
                        {/* Custom Input Text Area */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-text-primary mb-2">Describe what you want to change</label>
                          <textarea
                            value={customUpdateInput}
                            onChange={(e) => setCustomUpdateInput(e.target.value)}
                            placeholder="e.g., Add a warmer color palette for holiday campaigns, update the tone to be more playful..."
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-text-muted">Be specific about what you want Alan to change</p>
                            <Button 
                              size="sm" 
                              disabled={!customUpdateInput.trim()}
                              onClick={() => initiateUpdate('custom', customUpdateInput)}
                              className="bg-gradient-to-r from-primary to-primary-dark text-white disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Ask Alan
                            </Button>
                          </div>
                        </div>

                        {/* Example Prompts */}
                        <div className="mb-6 p-4 bg-surface/60 rounded-xl border border-primary/20">
                          <p className="text-xs font-medium text-text-secondary mb-3">Example prompts you can try:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Add a coral accent color for seasonal campaigns',
                              'Make the tone more inclusive and welcoming',
                              'Add mobile-specific font sizes',
                              'Include GDPR consent requirements'
                            ].map((example, i) => (
                              <button
                                key={i}
                                onClick={() => setCustomUpdateInput(example)}
                                className="px-3 py-1.5 bg-white rounded-lg border border-border text-xs text-text-secondary hover:border-primary/40 hover:text-primary transition-colors"
                              >
                                "{example}"
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex-1 h-px bg-surface-tertiary" />
                          <span className="text-xs text-text-muted font-medium">OR SELECT A QUICK UPDATE</span>
                          <div className="flex-1 h-px bg-surface-tertiary" />
                        </div>

                        {/* Quick Suggestions */}
                        <div className="grid grid-cols-2 gap-3">
                          {agentUpdateSuggestions.map(suggestion => (
                            <button key={suggestion.id} onClick={() => initiateUpdate('suggestion', suggestion.id)}
                              className="p-4 bg-white rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all text-left group">
                              <p className="font-medium text-text-primary group-hover:text-primary">{suggestion.label}</p>
                              <p className="text-xs text-text-secondary mt-1">{suggestion.description}</p>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <button onClick={() => { setGuidelinesMode('view'); setCustomUpdateInput('') }} className="mt-4 text-sm text-text-secondary hover:text-text-primary">← Back to guidelines</button>
                  </div>
                </motion.div>
              )}

              {/* Warning Confirmation Modal */}
              <Modal
                open={showWarningConfirm}
                onClose={cancelWarning}
                title="Confirm Brand Guidelines Update"
                size="small"
                primaryButtonLabel="Confirm & Proceed"
                onPrimaryButtonClick={confirmAndProcessUpdate}
                secondaryButtonLabel="Cancel"
                onSecondaryButtonClick={cancelWarning}
              >
                <div className="space-y-4">
                  <p className="text-sm text-text-secondary">This will modify your brand guidelines</p>
                  <div className="bg-warning-subtle border border-warning/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-warning-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-warning text-xs font-semibold">!</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-warning-text mb-1">Warning</p>
                        <p className="text-xs text-warning">
                          Updating brand guidelines will affect all future creative assets. 
                          Existing approved assets will not be automatically updated. 
                          Please review the changes carefully before approving.
                        </p>
                      </div>
                    </div>
                  </div>
                  {pendingUpdateAction && (
                    <div className="bg-surface-secondary rounded-xl p-4">
                      <p className="text-xs text-text-secondary mb-2">Requested Update</p>
                      <p className="text-sm text-text-primary">
                        {pendingUpdateAction.type === 'custom' 
                          ? `"${pendingUpdateAction.value}"`
                          : agentUpdateSuggestions.find(s => s.id === pendingUpdateAction.value)?.description
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Modal>

              {/* Review Changes Mode */}
              {guidelinesMode === 'review-changes' && pendingChanges.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-success-subtle rounded-2xl p-6 border border-success/20">
                    <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-success" /> Review Proposed Changes
                    </h3>
                    <div className="space-y-3">
                      {pendingChanges.map((change, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-success/30">
                          <p className="text-sm font-medium text-text-primary mb-2">{change.field}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-danger-subtle rounded-lg border border-danger/20">
                              <p className="text-xs text-danger font-medium mb-1">Before</p>
                              <p className="text-sm text-text-primary">{change.oldValue}</p>
                            </div>
                            <div className="p-3 bg-success-subtle rounded-lg border border-success/20">
                              <p className="text-xs text-success font-medium mb-1">After</p>
                              <p className="text-sm text-text-primary">{change.newValue}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Guidelines Grid */}
              {guidelinesMode === 'view' && (
                <div className="grid grid-cols-5 gap-4">
                  {/* Logo Usage Card */}
                  <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light">
                      <div className="w-6 h-6 rounded-lg bg-primary-subtle flex items-center justify-center">
                        <Image className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <h3 className="text-xs font-semibold text-text-primary">Logo Usage</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {brandGuidelines.logo.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                          <span className="text-primary mt-1 text-xs">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Color Palette Card */}
                  <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light">
                      <div className="w-6 h-6 rounded-lg bg-primary-subtle flex items-center justify-center">
                        <Droplets className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <h3 className="text-xs font-semibold text-text-primary">Color Palette</h3>
                    </div>
                    <div className="space-y-3">
                      {brandGuidelines.colors.map(color => (
                        <div key={color.hex} className="flex items-center gap-2.5">
                          <div 
                            className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white ring-offset-1" 
                            style={{ backgroundColor: color.hex }} 
                          />
                          <span className="text-sm text-text-secondary">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography Card */}
                  <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light">
                      <div className="w-6 h-6 rounded-lg bg-warning-subtle flex items-center justify-center">
                        <Type className="w-3.5 h-3.5 text-warning" />
                      </div>
                      <h3 className="text-xs font-semibold text-text-primary">Typography</h3>
                    </div>
                    <ul className="space-y-2.5">
                      <li className="text-sm">
                        <span className="text-text-muted font-medium">Headline:</span>{' '}
                        <span className="text-text-secondary">{brandGuidelines.typography.headline}</span>
                      </li>
                      <li className="text-sm">
                        <span className="text-text-muted font-medium">Subhead:</span>{' '}
                        <span className="text-text-secondary">{brandGuidelines.typography.subhead}</span>
                      </li>
                      <li className="text-sm">
                        <span className="text-text-muted font-medium">Body:</span>{' '}
                        <span className="text-text-secondary">{brandGuidelines.typography.body}</span>
                      </li>
                      <li className="text-sm">
                        <span className="text-text-muted font-medium">CTA:</span>{' '}
                        <span className="text-text-secondary">{brandGuidelines.typography.cta}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Tone of Voice Card */}
                  <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light">
                      <div className="w-6 h-6 rounded-lg bg-success-subtle flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5 text-success" />
                      </div>
                      <h3 className="text-xs font-semibold text-text-primary">Tone of Voice</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {brandGuidelines.tone.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                          <span className="text-success mt-1 text-xs">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Compliance Card */}
                  <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border-light">
                      <div className="w-6 h-6 rounded-lg bg-danger-subtle flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-danger" />
                      </div>
                      <h3 className="text-xs font-semibold text-text-primary">Compliance</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {brandGuidelines.compliance.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                          <span className="text-danger mt-1 text-xs">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
                </div>
              )
            }]}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="p-8">
        <AnimatePresence mode="wait">
          {/* Library View */}
          {viewMode === 'library' && (
            <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search campaigns..."
                    className="w-64"
                  />
                  <div className="w-44">
                    <Select
                      value={statusFilter === 'All' ? '' : statusFilter}
                      onChange={(val) => setStatusFilter(val || 'All')}
                      options={['Approved', 'Needs Update', 'Draft', 'In Progress']}
                      placeholder="All Status"
                    />
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{filteredCampaigns.length} creative campaigns</p>
              </div>

              {/* Campaigns Grid */}
              <div className="grid grid-cols-4 gap-6">
                {filteredCampaigns.map(campaign => (
                  <motion.div key={campaign.id} whileHover={{ y: -4 }} onClick={() => { setSelectedCampaign(campaign); setViewMode('review') }}
                    className="bg-white rounded-2xl border border-border overflow-hidden cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all group">
                    {/* Thumbnail */}
                    <div className="aspect-[16/9] bg-dark relative overflow-hidden">
                      <img src={campaign.thumbnail} alt={campaign.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                      </div>
                      {/* Product labels */}
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {campaign.products.slice(0, 2).map((product, i) => (
                          <span key={i} className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md border border-white/20 truncate max-w-[120px]">{product.name}</span>
                        ))}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-muted">{campaign.id}</span>
                        <span className="text-xs text-primary bg-primary-subtle px-2 py-0.5 rounded-full">{campaign.category}</span>
                      </div>
                      <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">{campaign.name}</h3>
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-text-secondary"><span className="text-text-muted">Campaign:</span> {campaign.linkedCampaigns[0]}</p>
                        <p className="text-xs text-text-secondary"><span className="text-text-muted">Promo:</span> {campaign.linkedPromotions[0]}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {campaign.assetTypes.map(type => {
                          const Icon = getAssetTypeIcon(type)
                          return (<div key={type} className="flex items-center gap-1 px-2 py-1 bg-surface-secondary rounded-lg text-xs text-text-secondary"><Icon className="w-3 h-3" />{type}</div>)
                        })}
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border-light">
                        <span className="font-medium">{campaign.assetCount} assets</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{campaign.lastUpdated}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Review Mode */}
          {viewMode === 'review' && selectedCampaign && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => { setViewMode('library'); setSelectedCampaign(null) }} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Library
              </button>
              <div className="flex gap-6">
                {/* Left: Context */}
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Creative Context</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Campaign</p>
                        <p className="text-sm font-medium text-text-primary">{selectedCampaign.name}</p>
                        <p className="text-xs text-text-secondary">{selectedCampaign.id}</p>
                      </div>
                      <div className="h-px bg-surface-secondary" />
                      <div>
                        <p className="text-xs text-text-muted mb-1">Category</p>
                        <p className="text-sm text-text-primary">{selectedCampaign.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Products</p>
                        <div className="space-y-1.5 mt-2">
                          {selectedCampaign.products.map((product, i) => (
                            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-secondary rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <p className="text-xs text-text-primary font-medium">{product.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="h-px bg-surface-secondary" />
                      <div>
                        <p className="text-xs text-text-muted mb-1">Linked Campaign</p>
                        <p className="text-sm text-text-primary">{selectedCampaign.linkedCampaigns[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Promotion</p>
                        <p className="text-sm text-text-primary">{selectedCampaign.linkedPromotions[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Status</p>
                        <Badge variant={getStatusVariant(selectedCampaign.status)}>{selectedCampaign.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: Assets */}
                <div className="flex-1">
                  <div className="bg-white rounded-2xl border border-border shadow-sm">
                    <div className="p-6 border-b border-border-light">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary">Creative Assets</h2>
                          <p className="text-sm text-text-secondary">{filteredAssets.length} assets</p>
                        </div>
                        {selectedAssets.length > 0 && (
                          <Button className="bg-gradient-to-r from-primary to-primary-dark text-white" onClick={() => setShowChangeIntent(true)}>
                            <Sparkles className="w-4 h-4 mr-2" /> Request Changes
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <Filter className="w-4 h-4 text-text-muted" />
                        {/* Channel Filter */}
                        <div className="w-36 shrink-0">
                          <Select
                            value={assetChannelFilter === 'All' ? '' : assetChannelFilter}
                            onChange={(val) => setAssetChannelFilter(val || 'All')}
                            options={['Web', 'Social', 'Email', 'Push']}
                            placeholder="All Channels"
                          />
                        </div>
                        {/* Asset Status Filter */}
                        <div className="w-36 shrink-0 ml-1">
                          <Select
                            value={assetStatusFilter === 'All' ? '' : assetStatusFilter}
                            onChange={(val) => setAssetStatusFilter(val || 'All')}
                            options={['Approved', 'Needs Update', 'Draft', 'In Progress']}
                            placeholder="All Status"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-3 gap-4">
                      {filteredAssets.map(asset => {
                        const TypeIcon = getAssetTypeIcon(asset.type)
                        const isSelected = selectedAssets.includes(asset.id)
                        return (
                          <div key={asset.id} className={cn('bg-surface-secondary rounded-xl overflow-hidden border-2 transition-all cursor-pointer', isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-primary/30')}>
                            <div className="relative aspect-video bg-dark">
                              <img src={asset.thumbnail} alt={asset.headline} className="w-full h-full object-contain" />
                              <button onClick={(e) => { e.stopPropagation(); setSelectedAssets(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]) }}
                                className={cn('absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center', isSelected ? 'bg-primary-subtle0 border-primary' : 'bg-white/90 border-border')}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </button>
                              <Badge variant={getStatusVariant(asset.status)} className="absolute top-2 right-2">{asset.status}</Badge>
                              <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">{asset.format}</span>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <TypeIcon className="w-3.5 h-3.5 text-text-muted" />
                                <span className="text-xs text-text-secondary">{asset.type} • {asset.channel}</span>
                              </div>
                              <h4 className="text-sm font-medium text-text-primary mb-1">{asset.headline}</h4>
                              <p className="text-xs text-primary flex items-start gap-1"><Sparkles className="w-3 h-3 mt-0.5" />{asset.agentNote}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Create New Campaign View */}
          {viewMode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => { setViewMode('library'); resetCreateForm() }} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Library
              </button>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {['Details', 'Products', 'Brief', 'Generate', 'Preview'].map((step, i) => {
                  const steps: CreateStep[] = ['details', 'products', 'brief', 'generate', 'preview']
                  const currentIndex = steps.indexOf(createStep)
                  const stepIndex = i
                  const isCompleted = stepIndex < currentIndex
                  const isCurrent = stepIndex === currentIndex
                  return (
                    <div key={step} className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                          isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white' : 'bg-surface-tertiary text-text-secondary')}>
                          {isCompleted ? <Check className="w-4 h-4" /> : stepIndex + 1}
                        </div>
                        <span className={cn('text-sm', isCurrent ? 'text-text-primary font-medium' : 'text-text-secondary')}>{step}</span>
                      </div>
                      {i < 4 && <div className={cn('w-12 h-0.5 mx-3', stepIndex < currentIndex ? 'bg-success-subtle0' : 'bg-surface-tertiary')} />}
                    </div>
                  )
                })}
              </div>

              {/* Step 1: Campaign Details */}
              {createStep === 'details' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-2">Campaign Details</h2>
                    <p className="text-text-secondary mb-6">Enter the basic information for your creative campaign</p>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Campaign Name *</label>
                        <input type="text" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)}
                          placeholder="e.g., Spring Collection Launch" className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      
                      {/* Segment Selection with Search */}
                      <div className="relative" ref={segmentDropdownRef}>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Select Segment</label>
                        <div className="relative">
                          {selectedSegment && !segmentSearch ? (
                            <div 
                              onClick={() => { setSegmentSearch(''); setShowSegmentDropdown(true) }}
                              className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm cursor-pointer hover:border-primary/40 flex items-center gap-2 min-h-[32px]"
                            >
                              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                              <span className="text-text-primary">{availableSegments.find(s => s.id === selectedSegment)?.name}</span>
                            </div>
                          ) : (
                            <SearchBar
                              value={segmentSearch}
                              onChange={(v) => { setSegmentSearch(v); setShowSegmentDropdown(true) }}
                              onFocus={() => setShowSegmentDropdown(true)}
                              placeholder="Search segments..."
                              className="w-full"
                            />
                          )}
                          {selectedSegment && (
                            <button onClick={() => { setSelectedSegment(''); setSegmentSearch('') }} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-surface-tertiary rounded">
                              <X className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary" />
                            </button>
                          )}
                        </div>
                        {showSegmentDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {availableSegments
                              .filter(seg => seg.name.toLowerCase().includes(segmentSearch.toLowerCase()) || seg.description.toLowerCase().includes(segmentSearch.toLowerCase()))
                              .map(segment => (
                                <button
                                  key={segment.id}
                                  onClick={() => { setSelectedSegment(segment.id); setSegmentSearch(''); setShowSegmentDropdown(false) }}
                                  className={cn('w-full px-4 py-3 text-left hover:bg-primary-subtle flex items-center justify-between', selectedSegment === segment.id && 'bg-primary-subtle')}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-text-primary">{segment.name}</p>
                                    <p className="text-xs text-text-secondary">{segment.description}</p>
                                  </div>
                                  <span className="text-xs text-primary font-medium">{segment.customers.toLocaleString()} customers</span>
                                </button>
                              ))}
                            {availableSegments.filter(seg => seg.name.toLowerCase().includes(segmentSearch.toLowerCase())).length === 0 && (
                              <p className="px-4 py-3 text-sm text-text-secondary">No segments found</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Promotion Selection with Search */}
                      <div className="relative" ref={promoDropdownRef}>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Select Promotion</label>
                        <div className="relative">
                          {selectedPromo && !promoSearch ? (
                            <div 
                              onClick={() => { setPromoSearch(''); setShowPromoDropdown(true) }}
                              className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm cursor-pointer hover:border-primary/40 flex items-center gap-2 min-h-[32px]"
                            >
                              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                              <span className="text-text-primary">{availablePromos.find(p => p.id === selectedPromo)?.name}</span>
                            </div>
                          ) : (
                            <SearchBar
                              value={promoSearch}
                              onChange={(v) => { setPromoSearch(v); setShowPromoDropdown(true) }}
                              onFocus={() => setShowPromoDropdown(true)}
                              placeholder="Search promotions..."
                              className="w-full"
                            />
                          )}
                          {selectedPromo && (
                            <button onClick={() => { setSelectedPromo(''); setPromoSearch('') }} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-surface-tertiary rounded">
                              <X className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary" />
                            </button>
                          )}
                        </div>
                        {showPromoDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {availablePromos
                              .filter(promo => promo.name.toLowerCase().includes(promoSearch.toLowerCase()) || promo.type.toLowerCase().includes(promoSearch.toLowerCase()))
                              .map(promo => (
                                <button
                                  key={promo.id}
                                  onClick={() => { setSelectedPromo(promo.id); setPromoSearch(''); setShowPromoDropdown(false) }}
                                  className={cn('w-full px-4 py-3 text-left hover:bg-primary-subtle flex items-center justify-between', selectedPromo === promo.id && 'bg-primary-subtle')}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-text-primary">{promo.name}</p>
                                    <p className="text-xs text-text-secondary">{promo.type}</p>
                                  </div>
                                  <span className="px-2 py-1 bg-success-subtle text-success-text text-xs font-medium rounded">{promo.value}</span>
                                </button>
                              ))}
                            {availablePromos.filter(promo => promo.name.toLowerCase().includes(promoSearch.toLowerCase())).length === 0 && (
                              <p className="px-4 py-3 text-sm text-text-secondary">No promotions found</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button className="bg-gradient-to-r from-primary to-primary-dark text-white" disabled={!newCampaignName.trim()} onClick={() => setCreateStep('products')}>
                        Continue to Products <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Products */}
              {createStep === 'products' && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-2">Select Products</h2>
                    <p className="text-text-secondary mb-6">Choose products to feature in your banners ({selectedProducts.length} selected)</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {availableProducts.map(product => {
                        const isSelected = selectedProducts.includes(product.id)
                        return (
                          <div key={product.id} onClick={() => toggleProductSelection(product.id)}
                            className={cn('p-4 rounded-xl border-2 cursor-pointer transition-all', isSelected ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary/30')}>
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                              <div className="flex-1">
                                <h4 className="font-medium text-text-primary">{product.name}</h4>
                                <p className="text-xs text-text-secondary">{product.category}</p>
                                <p className="text-sm font-medium text-primary">${product.price.toFixed(2)}</p>
                              </div>
                              <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center', isSelected ? 'bg-primary-subtle0 border-primary' : 'border-border')}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="tertiary" onClick={() => setCreateStep('details')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                      <Button className="bg-gradient-to-r from-primary to-primary-dark text-white" disabled={selectedProducts.length === 0} onClick={() => setCreateStep('brief')}>
                        Continue to Brief <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Creative Brief */}
              {createStep === 'brief' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-2">Creative Brief</h2>
                    <p className="text-text-secondary mb-6">Define your banner content and select formats</p>
                    
                    <div className="space-y-5 mb-8">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Headline *</label>
                        <input type="text" value={bannerHeadline} onChange={e => setBannerHeadline(e.target.value)}
                          placeholder="e.g., Spring Sale - 20% OFF!" className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Subcopy</label>
                        <textarea value={bannerSubcopy} onChange={e => setBannerSubcopy(e.target.value)}
                          placeholder="e.g., Limited time offer on selected items" className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm resize-none h-20" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Call to Action</label>
                        <input type="text" value={bannerCta} onChange={e => setBannerCta(e.target.value)}
                          placeholder="Shop Now" className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">Banner Formats</label>
                        <div className="flex flex-wrap gap-3">
                          {['16:9', '1:1', '4:5', '9:16', '728x90'].map(format => (
                            <button key={format} onClick={() => toggleFormatSelection(format)}
                              className={cn('px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                                selectedFormats.includes(format) ? 'border-primary bg-primary-subtle text-primary' : 'border-border text-text-secondary hover:border-primary/30')}>
                              {format}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="tertiary" onClick={() => setCreateStep('products')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                      <Button className="bg-gradient-to-r from-primary to-primary-dark text-white" disabled={!bannerHeadline.trim() || selectedFormats.length === 0} onClick={() => { setCreateStep('generate'); startBannerGeneration() }}>
                        <Sparkles className="w-4 h-4 mr-2" /> Generate Banners
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Generating */}
              {createStep === 'generate' && isGeneratingBanners && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary mb-2">Generating Banners...</h2>
                    <p className="text-text-secondary mb-6">Alan is creating {selectedFormats.length} banner variations</p>
                    
                    <div className="bg-surface-secondary rounded-xl p-5 space-y-4 text-left">
                      {bannerGenSteps.map((step, i) => (
                        <div key={i} className={cn('flex items-center gap-3', i <= bannerGenStep ? 'opacity-100' : 'opacity-40')}>
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', i < bannerGenStep ? 'bg-success-subtle' : i === bannerGenStep ? 'bg-primary-subtle' : 'bg-surface-secondary')}>
                            {i < bannerGenStep ? <Check className="w-4 h-4 text-success" /> : i === bannerGenStep ? <Loader size="small" /> : <step.icon className="w-4 h-4 text-text-muted" />}
                          </div>
                          <span className={cn('text-sm', i < bannerGenStep ? 'text-success' : i === bannerGenStep ? 'text-text-primary' : 'text-text-muted')}>{i < bannerGenStep ? '✓ ' : ''}{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preview & Approve */}
              {createStep === 'preview' && (
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-text-primary">Review Generated Banners</h2>
                        <p className="text-text-secondary">{generatedBanners.filter(b => b.approved).length} of {generatedBanners.length} approved</p>
                      </div>
                      <Button variant="tertiary" onClick={() => setGeneratedBanners(prev => prev.map(b => ({ ...b, approved: true })))}>
                        <Check className="w-4 h-4 mr-2" /> Approve All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {generatedBanners.map(banner => {
                        const product = availableProducts.find(p => p.id === selectedProducts[0])
                        return (
                          <div key={banner.id} className={cn('rounded-xl border-2 overflow-hidden transition-all', banner.approved ? 'border-success' : 'border-border')}>
                            <div className={cn('relative bg-surface-secondary', banner.format === '16:9' ? 'aspect-video' : banner.format === '1:1' ? 'aspect-square' : 'aspect-[4/5]')}>
                              <div className="absolute top-2 left-2"><span className="px-2 py-1 bg-black/70 text-white text-xs rounded">{banner.format}</span></div>
                              <div className="absolute top-2 right-2">
                                {selectedPromo && <span className="px-2 py-1 bg-success text-white text-xs rounded font-medium">{availablePromos.find(p => p.id === selectedPromo)?.value}</span>}
                              </div>
                              <div className="h-full flex flex-col items-center justify-center p-4">
                                {product && <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover mb-3" />}
                                <h3 className="text-sm font-semibold text-text-primary text-center">{bannerHeadline || 'Your Headline'}</h3>
                                <p className="text-xs text-text-secondary text-center mt-1">{bannerSubcopy || 'Your subcopy here'}</p>
                                <button className="mt-3 px-4 py-1.5 bg-dark text-white text-xs rounded-lg">{bannerCta}</button>
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-between">
                              <span className="text-xs text-text-secondary">Banner {banner.format}</span>
                              <Button size="small" variant={banner.approved ? 'primary' : 'tertiary'}
                                onClick={() => toggleBannerApprovalGen(banner.id)}>
                                <Check className="w-3 h-3 mr-1" /> {banner.approved ? 'Approved' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="tertiary" onClick={() => { setCreateStep('brief'); setGeneratedBanners([]) }}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Brief</Button>
                      <Button variant="primary" disabled={generatedBanners.filter(b => b.approved).length === 0} onClick={() => { setViewMode('library'); resetCreateForm() }}>
                        <Check className="w-4 h-4 mr-2" /> Save Campaign
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Change Intent Modal */}
      <Modal
        open={showChangeIntent}
        onClose={() => setShowChangeIntent(false)}
        title={!isRegenerating ? 'What would you like to change?' : 'Regenerating Assets...'}
        size="medium"
        {...(!isRegenerating ? {
          primaryButtonLabel: 'Regenerate',
          onPrimaryButtonClick: startRegeneration,
          primaryButtonProps: { disabled: selectedIntents.length === 0 },
          secondaryButtonLabel: 'Cancel',
          onSecondaryButtonClick: () => setShowChangeIntent(false),
        } : {})}
      >
        {!isRegenerating ? (
          <div className="space-y-5">
            <p className="text-sm text-text-secondary">{selectedAssets.length} assets selected</p>
            <div className="grid grid-cols-3 gap-3">
              {[{id:'headline',label:'Headline / Copy',icon:Type},{id:'visual',label:'Visual Style',icon:Image},{id:'cta',label:'Call to Action',icon:MessageSquare},{id:'tone',label:'Tone',icon:FileText},{id:'offer',label:'Offer Emphasis',icon:Sparkles},{id:'format',label:'Format / Size',icon:Filter}].map(opt => (
                <button key={opt.id} onClick={() => setSelectedIntents(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                  className={cn('p-4 rounded-xl border-2 text-left transition-all', selectedIntents.includes(opt.id) ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary/30')}>
                  <opt.icon className={cn('w-5 h-5 mb-2', selectedIntents.includes(opt.id) ? 'text-primary' : 'text-text-muted')} />
                  <p className={cn('text-sm font-medium', selectedIntents.includes(opt.id) ? 'text-primary' : 'text-text-primary')}>{opt.label}</p>
                </button>
              ))}
            </div>
            <textarea value={additionalDirection} onChange={e => setAdditionalDirection(e.target.value)} placeholder="Add specific direction for Alan..." className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm resize-none h-20" />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="bg-surface-secondary rounded-xl p-5 space-y-4 text-left">
              {regenerationSteps.map((step, i) => (
                <div key={i} className={cn('flex items-center gap-3', i <= currentRegenStep ? 'opacity-100' : 'opacity-40')}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', i < currentRegenStep ? 'bg-success-subtle' : i === currentRegenStep ? 'bg-primary-subtle' : 'bg-surface-secondary')}>
                    {i < currentRegenStep ? <Check className="w-4 h-4 text-success" /> : i === currentRegenStep ? <Loader size="small" /> : <step.icon className="w-4 h-4 text-text-muted" />}
                  </div>
                  <span className={cn('text-sm', i < currentRegenStep ? 'text-success' : i === currentRegenStep ? 'text-text-primary' : 'text-text-muted')}>{i < currentRegenStep ? '✓ ' : ''}{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
