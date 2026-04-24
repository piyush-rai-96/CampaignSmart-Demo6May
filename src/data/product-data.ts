/**
 * GLOBAL DATA STANDARDIZATION — AUTO PARTS DOMAIN
 * =================================================
 * This file serves as the SINGLE SOURCE OF TRUTH for all product categories and SKUs.
 * 
 * Design Principle: One category model, one SKU model, one image source — everywhere.
 * 
 * Rules:
 * - Categories must be rendered only from these standardized definitions
 * - SKU pickers, tables, and mappings must source SKUs only from this list
 * - All SKU images resolve via the imageUrl field
 * - Any new SKU/category must be added here to propagate across the tool
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SKU {
  sku: string           // Unique identifier
  name: string          // Display name
  visualDescription: string  // For accessibility and context
  imageUrl: string      // For rendering images - SINGLE SOURCE
  price?: number        // Optional price
  discountedPrice?: number  // Optional discounted price
  offerPercent?: number // Optional offer percentage
}

export interface Category {
  id: string
  name: string
  items: SKU[]
  client?: 'autoparts'  // Client identifier
}

export interface ProductData {
  categories: Category[]
}

// ============================================================================
// PLACEHOLDER IMAGE (Fallback when SKU image fails to load)
// ============================================================================

export const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg'

// ============================================================================
// AUTO PARTS PRODUCT DATA (Inline — no external JSON dependency)
// ============================================================================

const autoPartsCategories: Category[] = [
  {
    id: 'oil_and_lubricants',
    name: 'Oil and Lubricants',
    client: 'autoparts',
    items: [
      { sku: 'OIL-SYN-5W30', name: 'Mobil 1 Full Synthetic 5W-30 (5 Qt)', visualDescription: 'Full synthetic motor oil 5 quart jug', imageUrl: '/images/oil_change_filter_kits/SKU 10558155.webp', price: 28.99 },
      { sku: 'OIL-SYN-0W20', name: 'Castrol Edge 0W-20 Full Synthetic (5 Qt)', visualDescription: 'Castrol Edge synthetic motor oil', imageUrl: '/images/oil_change_filter_kits/SKU 10693169.webp', price: 27.49 },
      { sku: 'OIL-CONV-10W30', name: 'Valvoline Daily Protection 10W-30 (5 Qt)', visualDescription: 'Conventional motor oil 5 quart', imageUrl: '/images/oil_change_filter_kits/SKU 106931690.webp', price: 19.99 },
      { sku: 'OIL-HDIESEL', name: 'Shell Rotella T6 15W-40 Diesel (1 Gal)', visualDescription: 'Heavy duty diesel motor oil gallon', imageUrl: '/images/oil_change_filter_kits/SKU 50065372.webp', price: 24.99 },
      { sku: 'OIL-TRANS', name: 'Valvoline MaxLife ATF (1 Qt)', visualDescription: 'Automatic transmission fluid quart', imageUrl: PLACEHOLDER_IMAGE, price: 9.99 },
      { sku: 'OIL-2CYCLE', name: 'Lucas Oil 2-Cycle Oil (16 Oz)', visualDescription: '2-cycle engine oil bottle', imageUrl: PLACEHOLDER_IMAGE, price: 7.49 },
    ]
  },
  {
    id: 'braking',
    name: 'Braking',
    client: 'autoparts',
    items: [
      { sku: 'BRK-PAD-CER', name: 'Wagner ThermoQuiet Ceramic Brake Pads', visualDescription: 'Ceramic front brake pads set', imageUrl: '/images/brake_battery_essentials/SKU 2-12257635.webp', price: 42.99 },
      { sku: 'BRK-PAD-SEMI', name: 'Duralast Gold Semi-Metallic Brake Pads', visualDescription: 'Semi-metallic front brake pads', imageUrl: '/images/brake_battery_essentials/SKU 2-12257833.webp', price: 34.99 },
      { sku: 'BRK-ROTOR-FR', name: 'Bosch QuietCast Front Rotor', visualDescription: 'Front disc brake rotor', imageUrl: '/images/brake_battery_essentials/SKU 2-12257842.webp', price: 58.99 },
      { sku: 'BRK-ROTOR-RR', name: 'ACDelco Advantage Rear Rotor', visualDescription: 'Rear disc brake rotor', imageUrl: '/images/brake_battery_essentials/SKU 2-12257867.webp', price: 49.99 },
      { sku: 'BRK-FLUID', name: 'Prestone DOT 3 Brake Fluid (32 Oz)', visualDescription: 'Brake fluid bottle 32oz', imageUrl: PLACEHOLDER_IMAGE, price: 8.99 },
      { sku: 'BRK-KIT', name: 'Complete Brake Kit (Pads + Rotors + Fluid)', visualDescription: 'Complete front brake kit', imageUrl: PLACEHOLDER_IMAGE, price: 129.99 },
    ]
  },
  {
    id: 'filters_and_pcv',
    name: 'Filters and PCV',
    client: 'autoparts',
    items: [
      { sku: 'FLT-OIL-STP', name: 'STP Extended Life Oil Filter', visualDescription: 'Engine oil filter', imageUrl: '/images/air_filter_pcv_components/SKU 5-11592885.webp', price: 8.99 },
      { sku: 'FLT-OIL-FRM', name: 'Fram Extra Guard Oil Filter', visualDescription: 'Fram oil filter', imageUrl: '/images/air_filter_pcv_components/SKU 5-22141637.webp', price: 6.99 },
      { sku: 'FLT-AIR-ENG', name: 'K&N Engine Air Filter', visualDescription: 'Reusable engine air filter', imageUrl: '/images/air_filter_pcv_components/SKU 5-50065817.webp', price: 24.99 },
      { sku: 'FLT-AIR-CAB', name: 'Bosch HEPA Cabin Air Filter', visualDescription: 'Cabin air filter', imageUrl: '/images/air_filter_pcv_components/SKU 5-50257773.webp', price: 18.99 },
      { sku: 'FLT-FUEL', name: 'ACDelco Professional Fuel Filter', visualDescription: 'Inline fuel filter', imageUrl: PLACEHOLDER_IMAGE, price: 14.99 },
      { sku: 'FLT-PCV', name: 'Dorman PCV Valve', visualDescription: 'PCV valve', imageUrl: PLACEHOLDER_IMAGE, price: 6.49 },
    ]
  },
  {
    id: 'wipers_and_related',
    name: 'Wipers and Related',
    client: 'autoparts',
    items: [
      { sku: 'WPR-BEAM-22', name: 'Bosch Icon Beam Wiper Blade 22"', visualDescription: 'Premium beam wiper blade 22 inch', imageUrl: '/images/wiper_visibility_products/SKU 6-11386730.webp', price: 24.99 },
      { sku: 'WPR-BEAM-18', name: 'Rain-X Latitude Wiper Blade 18"', visualDescription: 'Beam wiper blade 18 inch', imageUrl: '/images/wiper_visibility_products/SKU 6-11688408.webp', price: 19.99 },
      { sku: 'WPR-CONV-20', name: 'Duralast Conventional Wiper 20"', visualDescription: 'Standard wiper blade 20 inch', imageUrl: '/images/wiper_visibility_products/SKU 6-50014524.webp', price: 12.99 },
      { sku: 'WPR-REAR', name: 'Trico Exact Fit Rear Wiper', visualDescription: 'Rear wiper blade', imageUrl: '/images/wiper_visibility_products/SKU 6-7070036.webp', price: 14.99 },
      { sku: 'WPR-FLUID', name: 'Prestone All-Season Washer Fluid (1 Gal)', visualDescription: 'Windshield washer fluid gallon', imageUrl: PLACEHOLDER_IMAGE, price: 4.99 },
      { sku: 'WPR-DEICER', name: 'Rain-X De-Icer Washer Fluid (1 Gal)', visualDescription: 'De-icer washer fluid gallon', imageUrl: PLACEHOLDER_IMAGE, price: 6.99 },
    ]
  },
  {
    id: 'battery_and_electrical',
    name: 'Battery and Electrical',
    client: 'autoparts',
    items: [
      { sku: 'BAT-LEAD-65', name: 'DieHard Gold Battery Group 65', visualDescription: 'Automotive lead-acid battery', imageUrl: '/images/fleet_emergency_parts/SKU 4-11089445.webp', price: 189.99 },
      { sku: 'BAT-AGM-48', name: 'Optima RedTop AGM Battery Group 48', visualDescription: 'AGM performance battery', imageUrl: '/images/fleet_emergency_parts/SKU 4-12071147.webp', price: 249.99 },
      { sku: 'BAT-ECON-35', name: 'Duralast Battery Group 35', visualDescription: 'Economy automotive battery', imageUrl: '/images/fleet_emergency_parts/SKU 4-12430241.webp', price: 139.99 },
      { sku: 'ALT-REMAN', name: 'Duralast Remanufactured Alternator', visualDescription: 'Remanufactured alternator', imageUrl: '/images/fleet_emergency_parts/SKU 4-50175300.webp', price: 179.99 },
      { sku: 'STR-REMAN', name: 'Duralast Remanufactured Starter', visualDescription: 'Remanufactured starter motor', imageUrl: PLACEHOLDER_IMAGE, price: 159.99 },
      { sku: 'BAT-CABLE', name: 'Dorman Battery Cable Set', visualDescription: 'Battery cable set positive and negative', imageUrl: PLACEHOLDER_IMAGE, price: 29.99 },
    ]
  },
  {
    id: 'cooling_and_heating',
    name: 'Cooling and Heating',
    client: 'autoparts',
    items: [
      { sku: 'CLT-ANTIFR', name: 'Prestone 50/50 Antifreeze/Coolant (1 Gal)', visualDescription: 'Pre-mixed antifreeze coolant gallon', imageUrl: PLACEHOLDER_IMAGE, price: 16.99 },
      { sku: 'CLT-THERMO', name: 'Gates Thermostat Assembly', visualDescription: 'Engine thermostat with housing', imageUrl: PLACEHOLDER_IMAGE, price: 22.99 },
      { sku: 'CLT-RADCAP', name: 'Stant Radiator Cap', visualDescription: 'Radiator pressure cap', imageUrl: PLACEHOLDER_IMAGE, price: 8.99 },
      { sku: 'CLT-HOSE-UP', name: 'Gates Upper Radiator Hose', visualDescription: 'Upper radiator hose', imageUrl: PLACEHOLDER_IMAGE, price: 18.99 },
      { sku: 'CLT-WPUMP', name: 'ACDelco Professional Water Pump', visualDescription: 'Engine water pump', imageUrl: PLACEHOLDER_IMAGE, price: 89.99 },
      { sku: 'CLT-FAN', name: 'Dorman Radiator Fan Assembly', visualDescription: 'Radiator cooling fan assembly', imageUrl: PLACEHOLDER_IMAGE, price: 119.99 },
    ]
  },
  {
    id: 'ignition_and_tune_up',
    name: 'Ignition and Tune Up',
    client: 'autoparts',
    items: [
      { sku: 'IGN-PLUG-IR', name: 'NGK Iridium IX Spark Plug', visualDescription: 'Iridium spark plug', imageUrl: PLACEHOLDER_IMAGE, price: 9.99 },
      { sku: 'IGN-PLUG-PT', name: 'Bosch Platinum Spark Plug', visualDescription: 'Platinum spark plug', imageUrl: PLACEHOLDER_IMAGE, price: 7.99 },
      { sku: 'IGN-WIRE', name: 'ACDelco Professional Spark Plug Wire Set', visualDescription: 'Spark plug wire set', imageUrl: PLACEHOLDER_IMAGE, price: 34.99 },
      { sku: 'IGN-COIL', name: 'Delphi Ignition Coil', visualDescription: 'Direct ignition coil', imageUrl: PLACEHOLDER_IMAGE, price: 44.99 },
      { sku: 'IGN-DIST', name: 'Spectra Premium Distributor Cap', visualDescription: 'Distributor cap', imageUrl: PLACEHOLDER_IMAGE, price: 19.99 },
      { sku: 'IGN-ROTOR', name: 'Standard Motor Distributor Rotor', visualDescription: 'Distributor rotor', imageUrl: PLACEHOLDER_IMAGE, price: 8.99 },
    ]
  },
  {
    id: 'exhaust_and_emissions',
    name: 'Exhaust and Emissions',
    client: 'autoparts',
    items: [
      { sku: 'EXH-MUFFLER', name: 'Walker Quiet-Flow SS Muffler', visualDescription: 'Stainless steel muffler', imageUrl: PLACEHOLDER_IMAGE, price: 89.99 },
      { sku: 'EXH-CATCONV', name: 'MagnaFlow Catalytic Converter', visualDescription: 'Direct-fit catalytic converter', imageUrl: PLACEHOLDER_IMAGE, price: 249.99 },
      { sku: 'EXH-PIPE', name: 'Walker Exhaust Pipe', visualDescription: 'Exhaust pipe section', imageUrl: PLACEHOLDER_IMAGE, price: 42.99 },
      { sku: 'EXH-GASKET', name: 'Fel-Pro Exhaust Manifold Gasket', visualDescription: 'Exhaust manifold gasket set', imageUrl: PLACEHOLDER_IMAGE, price: 12.99 },
      { sku: 'EXH-O2SENS', name: 'Bosch Oxygen Sensor', visualDescription: 'O2 sensor', imageUrl: PLACEHOLDER_IMAGE, price: 54.99 },
      { sku: 'EXH-CLAMP', name: 'Walker Exhaust Clamp', visualDescription: 'Exhaust pipe clamp', imageUrl: PLACEHOLDER_IMAGE, price: 6.99 },
    ]
  },
  {
    id: 'steering_and_suspension',
    name: 'Steering and Suspension',
    client: 'autoparts',
    items: [
      { sku: 'SUS-STRUT', name: 'Monroe Quick-Strut Assembly', visualDescription: 'Complete strut assembly', imageUrl: PLACEHOLDER_IMAGE, price: 149.99 },
      { sku: 'SUS-SHOCK', name: 'KYB Excel-G Shock Absorber', visualDescription: 'Gas shock absorber', imageUrl: PLACEHOLDER_IMAGE, price: 59.99 },
      { sku: 'STR-TIEROD', name: 'Moog Outer Tie Rod End', visualDescription: 'Outer tie rod end', imageUrl: PLACEHOLDER_IMAGE, price: 32.99 },
      { sku: 'STR-BALLJT', name: 'Moog Lower Ball Joint', visualDescription: 'Lower ball joint', imageUrl: PLACEHOLDER_IMAGE, price: 44.99 },
      { sku: 'SUS-SWAY', name: 'Moog Sway Bar Link', visualDescription: 'Stabilizer bar link', imageUrl: PLACEHOLDER_IMAGE, price: 24.99 },
      { sku: 'STR-RACK', name: 'ACDelco Steering Rack Assembly', visualDescription: 'Power steering rack and pinion', imageUrl: PLACEHOLDER_IMAGE, price: 299.99 },
    ]
  },
  {
    id: 'lighting',
    name: 'Lighting',
    client: 'autoparts',
    items: [
      { sku: 'LGT-H11-LED', name: 'Sylvania LED H11 Headlight Bulb', visualDescription: 'LED headlight bulb H11', imageUrl: PLACEHOLDER_IMAGE, price: 39.99 },
      { sku: 'LGT-9005-HAL', name: 'Philips 9005 Halogen Headlight Bulb', visualDescription: 'Halogen headlight bulb 9005', imageUrl: PLACEHOLDER_IMAGE, price: 14.99 },
      { sku: 'LGT-H7-XTR', name: 'Sylvania SilverStar Ultra H7', visualDescription: 'High performance halogen H7', imageUrl: PLACEHOLDER_IMAGE, price: 29.99 },
      { sku: 'LGT-TAIL', name: 'Dorman Tail Light Assembly', visualDescription: 'Replacement tail light assembly', imageUrl: PLACEHOLDER_IMAGE, price: 64.99 },
      { sku: 'LGT-FOG', name: 'TYC Fog Light Assembly', visualDescription: 'Fog light assembly', imageUrl: PLACEHOLDER_IMAGE, price: 44.99 },
      { sku: 'LGT-BULB-194', name: 'Sylvania 194 LED Interior Bulb (2pk)', visualDescription: 'LED interior bulb pair', imageUrl: PLACEHOLDER_IMAGE, price: 12.99 },
    ]
  },
]

// ============================================================================
// EXPORTED DATA & HELPERS
// ============================================================================

/**
 * All Auto Parts categories
 */
export const CATEGORIES: Category[] = autoPartsCategories

/**
 * Get categories by client
 */
export const getCategoriesByClient = (_client: 'autoparts'): Category[] => {
  return CATEGORIES
}

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(c => c.id === id)
}

/**
 * Get category by name
 */
export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all category names
 */
export const getCategoryNames = (): string[] => {
  return CATEGORIES.map(c => c.name)
}

/**
 * Get all category IDs
 */
export const getCategoryIds = (): string[] => {
  return CATEGORIES.map(c => c.id)
}

/**
 * Get all SKUs across all categories
 */
export const getAllSKUs = (): SKU[] => {
  return CATEGORIES.flatMap(c => c.items)
}

/**
 * Get SKUs for a specific category
 */
export const getSKUsByCategory = (categoryId: string): SKU[] => {
  const category = getCategoryById(categoryId)
  return category?.items || []
}

/**
 * Get a specific SKU by its ID
 */
export const getSKUById = (skuId: string): SKU | undefined => {
  return getAllSKUs().find(s => s.sku === skuId)
}

/**
 * Get SKU image URL with fallback
 */
export const getSKUImageUrl = (skuId: string): string => {
  const sku = getSKUById(skuId)
  return sku?.imageUrl || PLACEHOLDER_IMAGE
}

/**
 * Handle image load error - returns placeholder
 */
export const handleImageError = (e: { target: EventTarget | null }): void => {
  const target = e.target as HTMLImageElement
  target.src = PLACEHOLDER_IMAGE
  target.onerror = null // Prevent infinite loop
}

// ============================================================================
// CATEGORY-TO-SEGMENT MAPPING (Auto Parts PRO/DIY MECE Structure)
// ============================================================================

export interface SegmentProductMapping {
  segmentId: string
  segmentName: string
  group: string
  categoryIds: string[]
  rationale: string
  color: string
}

/**
 * Category-to-product-group metadata
 * Maps each Auto Parts category to its display properties for the ProductStep
 */
const CATEGORY_GROUP_META: Record<string, { group: string; rationale: string; color: string }> = {
  'Oil and Lubricants':    { group: 'Oil Change & Filter Kits',       rationale: 'High-frequency maintenance items with bundle upsell potential — oil + filter combos', color: 'from-blue-500 to-cyan-500' },
  'Braking':               { group: 'Brake & Battery Essentials',     rationale: 'Failure-triggered and price-sensitive buyers — brake kits and emergency batteries', color: 'from-orange-500 to-amber-500' },
  'Filters and PCV':       { group: 'Air Filter & PCV Components',   rationale: 'Regular filter replacements and PCV maintenance — high repurchase frequency', color: 'from-teal-500 to-emerald-500' },
  'Wipers and Related':    { group: 'Wiper & Visibility Products',   rationale: 'Seasonal wiper replacements and washer fluid — weather-driven demand', color: 'from-sky-500 to-blue-500' },
  'Battery and Electrical': { group: 'Battery & Electrical Parts',   rationale: 'Failure-triggered battery replacements and electrical components', color: 'from-yellow-500 to-amber-500' },
  'Cooling and Heating':   { group: 'Cooling & Heating Systems',     rationale: 'Seasonal cooling/heating maintenance — thermostat, coolant, hoses', color: 'from-red-500 to-rose-500' },
  'Ignition and Tune Up':  { group: 'Ignition & Tune-Up Parts',     rationale: 'Spark plugs, wires, and coils for scheduled tune-ups', color: 'from-purple-500 to-indigo-500' },
  'Exhaust and Emissions': { group: 'Exhaust & Emissions Parts',    rationale: 'Mufflers, catalytic converters, and emissions compliance parts', color: 'from-gray-500 to-slate-500' },
  'Steering and Suspension': { group: 'Steering & Suspension',      rationale: 'Struts, shocks, and steering components for ride quality', color: 'from-green-500 to-emerald-500' },
  'Lighting':              { group: 'Lighting & Bulbs',              rationale: 'Headlights, tail lights, and interior bulbs — safety and visibility', color: 'from-amber-500 to-yellow-500' },
  // Playbook category name aliases
  'Brake and Battery Essentials':  { group: 'Brake & Battery Essentials',   rationale: 'Failure-triggered and price-sensitive buyers — brake kits and emergency batteries', color: 'from-orange-500 to-amber-500' },
  'Wiper and Visibility Products': { group: 'Wiper & Visibility Products',  rationale: 'Seasonal wiper replacements and washer fluid — weather-driven demand', color: 'from-sky-500 to-blue-500' },
  'Air Filter & PCV Components':   { group: 'Air Filter & PCV Components', rationale: 'Regular filter replacements and PCV maintenance — high repurchase frequency', color: 'from-teal-500 to-emerald-500' },
  'Oil Change & Filter Kits':      { group: 'Oil Change & Filter Kits',    rationale: 'High-frequency maintenance items with bundle upsell potential — oil + filter combos', color: 'from-blue-500 to-cyan-500' },
  'Bulk Maintenance Components':   { group: 'Bulk Maintenance Components', rationale: 'Volume-based bulk purchasing for PRO and fleet operators — margin protection', color: 'from-purple-500 to-indigo-500' },
}

/**
 * Map category name to category ID used in the data
 */
const CATEGORY_NAME_TO_ID: Record<string, string> = {
  'Oil and Lubricants': 'oil_and_lubricants',
  'Braking': 'braking',
  'Filters and PCV': 'filters_and_pcv',
  'Wipers and Related': 'wipers_and_related',
  'Battery and Electrical': 'battery_and_electrical',
  'Cooling and Heating': 'cooling_and_heating',
  'Ignition and Tune Up': 'ignition_and_tune_up',
  'Exhaust and Emissions': 'exhaust_and_emissions',
  'Steering and Suspension': 'steering_and_suspension',
  'Lighting': 'lighting',
  // Playbook category name aliases
  'Brake and Battery Essentials': 'braking',
  'Wiper and Visibility Products': 'wipers_and_related',
  'Air Filter & PCV Components': 'filters_and_pcv',
  'Oil Change & Filter Kits': 'oil_and_lubricants',
  'Bulk Maintenance Components': 'braking',
}

/**
 * Default segment mappings (used when no specific categories are detected)
 */
export const SEGMENT_PRODUCT_MAPPINGS: SegmentProductMapping[] = [
  {
    segmentId: 'seg-diy-1',
    segmentName: 'DIY Routine Maintenance Buyers',
    group: 'Oil Change & Filter Kits',
    categoryIds: ['oil_and_lubricants', 'filters_and_pcv'],
    rationale: 'High-frequency maintenance items with bundle upsell potential — oil + filter combos',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    segmentId: 'seg-diy-2',
    segmentName: 'DIY Urgent/Promo Buyers',
    group: 'Brake & Battery Essentials',
    categoryIds: ['braking', 'battery_and_electrical'],
    rationale: 'Failure-triggered and price-sensitive buyers — brake kits and emergency batteries',
    color: 'from-orange-500 to-amber-500'
  },
  {
    segmentId: 'seg-pro-1',
    segmentName: 'PRO High-Value Shops',
    group: 'Bulk Maintenance Components',
    categoryIds: ['oil_and_lubricants', 'braking', 'filters_and_pcv', 'ignition_and_tune_up'],
    rationale: 'Volume parts for independent repair shops — high-margin bulk orders across categories',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    segmentId: 'seg-pro-2',
    segmentName: 'PRO Fleet/Emergency Buyers',
    group: 'Fleet & Emergency Parts',
    categoryIds: ['battery_and_electrical', 'cooling_and_heating', 'wipers_and_related', 'lighting'],
    rationale: 'Fleet maintenance programs and emergency restock — scheduled deliveries and fast-ship SKUs',
    color: 'from-red-500 to-rose-500'
  }
]

/**
 * Get segment mappings (always auto parts)
 */
export const getSegmentMappingsByClient = (_client: 'autoparts'): SegmentProductMapping[] => {
  return SEGMENT_PRODUCT_MAPPINGS
}

/**
 * Get SKUs for a segment based on its category mappings
 */
export const getSKUsForSegment = (segmentId: string): SKU[] => {
  const mapping = SEGMENT_PRODUCT_MAPPINGS.find(m => m.segmentId === segmentId)
  if (!mapping) return []
  
  return mapping.categoryIds.flatMap(catId => getSKUsByCategory(catId))
}

/**
 * Build product groups dynamically from a list of detected category names.
 * Each detected category becomes its own product group with appropriate SKUs.
 */
export const getProductGroupsByCategories = (detectedCategories: string[], segmentNames?: string[]) => {
  return detectedCategories.map((catName, index) => {
    const catId = CATEGORY_NAME_TO_ID[catName]
    const meta = CATEGORY_GROUP_META[catName] || { group: catName, rationale: 'Category-specific products', color: 'from-gray-500 to-slate-500' }
    const skus = catId ? getSKUsByCategory(catId) : []
    
    return {
      segmentId: `seg-cat-${index + 1}`,
      segmentName: segmentNames?.[index] || catName,
      group: meta.group,
      baseSkuCount: skus.length * 50,
      rationale: meta.rationale,
      color: meta.color,
      skus: skus.map(s => ({
        id: s.sku,
        name: s.name,
        price: s.price || Math.floor(Math.random() * 50) + 10,
        image: s.imageUrl,
        visualDescription: s.visualDescription
      }))
    }
  })
}

/**
 * Get product groups for campaign ProductStep (fallback: uses default 4 segment groups)
 */
export const getProductGroupsForCampaign = (segmentNames?: string[]) => {
  return SEGMENT_PRODUCT_MAPPINGS.map((mapping, index) => {
    const skus = getSKUsForSegment(mapping.segmentId)
    return {
      segmentId: mapping.segmentId,
      segmentName: segmentNames?.[index] || mapping.segmentName,
      group: mapping.group,
      baseSkuCount: skus.length * 50,
      rationale: mapping.rationale,
      color: mapping.color,
      skus: skus.map(s => ({
        id: s.sku,
        name: s.name,
        price: s.price || Math.floor(Math.random() * 50) + 10,
        image: s.imageUrl,
        visualDescription: s.visualDescription
      }))
    }
  })
}

/**
 * Get product groups by client — uses detected categories if provided, otherwise falls back to default groups
 */
export const getProductGroupsByClient = (_client: 'autoparts' | string, segmentNames?: string[], detectedCategories?: string[]) => {
  if (detectedCategories && detectedCategories.length > 0) {
    return getProductGroupsByCategories(detectedCategories, segmentNames)
  }
  return getProductGroupsForCampaign(segmentNames)
}

// ============================================================================
// SUMMARY STATS
// ============================================================================

export const getProductStats = () => ({
  totalCategories: CATEGORIES.length,
  totalSKUs: getAllSKUs().length,
  categorySummary: CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    client: c.client,
    skuCount: c.items.length
  }))
})

// Log stats on load (development only)
if (import.meta.env.DEV) {
  console.log('📦 Auto Parts Products Loaded:', getProductStats())
}
