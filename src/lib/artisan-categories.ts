/**
 * Artisan Category Constants and Metadata
 * 
 * This file contains the constant definitions for the five artisan categories
 * based on income level and digital literacy.
 */

import {
  CategoryType,
  ArtisanCategory,
  CategoryMetadata,
  IncomeLevel,
  DigitalLiteracy,
} from '@/types/artisan-categories';

// ============================================================================
// Category Type Constants
// ============================================================================

/**
 * All available category types
 */
export const CATEGORY_TYPES: CategoryType[] = [
  'low-income-individual',
  'family-based',
  'cooperative-cluster',
  'sme-scale',
  'export-oriented',
];

// ============================================================================
// Category Metadata Definitions
// ============================================================================

/**
 * Complete metadata for all artisan categories
 */
export const ARTISAN_CATEGORIES: Record<CategoryType, ArtisanCategory> = {
  'low-income-individual': {
    id: 'low-income-individual',
    name: 'Low-Income Individual Artisans',
    incomeLevel: 'low',
    digitalLiteracy: 'digitally-unaware',
    description: 'Very small, cash-poor artisans who are digitally unaware. Includes traditional craftsmen working in trades like blacksmithing, pottery, carpentry, weaving, etc.',
    icon: 'User',
    color: 'blue',
    schemeCount: 0, // Will be updated dynamically
    typicalLoanRange: {
      min: 50000,
      max: 1000000,
    },
    exampleSchemes: [
      'PM Vishwakarma Yojana',
      'Pradhan Mantri Mudra Yojana (Shishu)',
      'Stand-Up India Scheme',
      'DAY-NRLM',
      'TREAD',
    ],
  },
  
  'family-based': {
    id: 'family-based',
    name: 'Family-Based Artisans',
    incomeLevel: 'low-medium',
    digitalLiteracy: 'semi-digital',
    description: 'Family-run craft units with low to medium income and basic digital skills. Includes small weaving units, carpentry workshops, and handicraft families.',
    icon: 'Users',
    color: 'green',
    schemeCount: 0,
    typicalLoanRange: {
      min: 100000,
      max: 2500000,
    },
    exampleSchemes: [
      'PMEGP',
      'National Handloom Development Programme',
      'Mahila Coir Yojana',
      'MYUVA',
      'MSME EDP',
    ],
  },
  
  'cooperative-cluster': {
    id: 'cooperative-cluster',
    name: 'Cooperative/Cluster Artisans',
    incomeLevel: 'medium',
    digitalLiteracy: 'semi-digital',
    description: 'Artisan groups and clusters with medium income and semi-digital capabilities. Includes village cooperatives, craft clusters, and producer companies.',
    icon: 'Building2',
    color: 'purple',
    schemeCount: 0,
    typicalLoanRange: {
      min: 500000,
      max: 10000000,
    },
    exampleSchemes: [
      'Ambedkar Hastshilp Vikas Yojana',
      'SFURTI',
      'Khadi & Gramodyog Vikas Yojana',
      'Kumhar Sashaktikaran Programme',
      'MSME CDP',
    ],
  },
  
  'sme-scale': {
    id: 'sme-scale',
    name: 'SME-Scale Artisans',
    incomeLevel: 'medium-high',
    digitalLiteracy: 'fully-digital',
    description: 'Digital-ready craft businesses with medium to high income. Includes established workshops, online sellers, and tech-savvy artisan enterprises.',
    icon: 'Store',
    color: 'orange',
    schemeCount: 0,
    typicalLoanRange: {
      min: 1000000,
      max: 50000000,
    },
    exampleSchemes: [
      'ONDC',
      'CGTMSE',
      'MSME Champions Scheme',
      'GeM',
      'Digital India Programs',
    ],
  },
  
  'export-oriented': {
    id: 'export-oriented',
    name: 'Export-Oriented Enterprises',
    incomeLevel: 'high',
    digitalLiteracy: 'fully-digital',
    description: 'High-income artisan enterprises focused on international markets. Includes exporters, GI-certified producers, and global craft businesses.',
    icon: 'Globe',
    color: 'red',
    schemeCount: 0,
    typicalLoanRange: {
      min: 5000000,
      max: 100000000,
    },
    exampleSchemes: [
      'Market Access Initiative (MAI)',
      'Marketing Development Assistance (MDA)',
      'Bharat TULIP',
      'GI Support',
      'ECGC/EXIM Programs',
    ],
  },
};

/**
 * Category metadata for admin configuration
 */
export const CATEGORY_METADATA: Record<CategoryType, CategoryMetadata> = {
  'low-income-individual': {
    incomeRange: {
      min: 0,
      max: 300000, // Up to ₹3 lakh per year
    },
    digitalLiteracy: 'digitally-unaware',
    typicalBusinessScale: 'Individual artisan, no employees',
    description: 'Cash-poor traditional craftsmen needing basic support',
  },
  
  'family-based': {
    incomeRange: {
      min: 300000,
      max: 1000000, // ₹3-10 lakh per year
    },
    digitalLiteracy: 'semi-digital',
    typicalBusinessScale: 'Family-run unit, 2-5 members',
    description: 'Small family businesses with basic digital presence',
  },
  
  'cooperative-cluster': {
    incomeRange: {
      min: 1000000,
      max: 5000000, // ₹10-50 lakh per year
    },
    digitalLiteracy: 'semi-digital',
    typicalBusinessScale: 'Cluster of 50+ artisans, cooperative structure',
    description: 'Organized artisan groups with shared infrastructure',
  },
  
  'sme-scale': {
    incomeRange: {
      min: 5000000,
      max: 50000000, // ₹50 lakh - ₹5 crore per year
    },
    digitalLiteracy: 'fully-digital',
    typicalBusinessScale: 'Registered MSME, 10-50 employees',
    description: 'Established businesses with online presence',
  },
  
  'export-oriented': {
    incomeRange: {
      min: 50000000,
      max: 300000000, // ₹5-30 crore per year
    },
    digitalLiteracy: 'fully-digital',
    typicalBusinessScale: 'Export enterprise, 50+ employees',
    description: 'International market-focused businesses',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category by ID
 */
export function getCategoryById(id: CategoryType): ArtisanCategory {
  return ARTISAN_CATEGORIES[id];
}

/**
 * Get all categories as an array
 */
export function getAllCategories(): ArtisanCategory[] {
  return CATEGORY_TYPES.map(id => ARTISAN_CATEGORIES[id]);
}

/**
 * Get category metadata
 */
export function getCategoryMetadata(id: CategoryType): CategoryMetadata {
  return CATEGORY_METADATA[id];
}

/**
 * Get category by income level
 */
export function getCategoriesByIncomeLevel(incomeLevel: IncomeLevel): ArtisanCategory[] {
  return getAllCategories().filter(cat => cat.incomeLevel === incomeLevel);
}

/**
 * Get category by digital literacy
 */
export function getCategoriesByDigitalLiteracy(literacy: DigitalLiteracy): ArtisanCategory[] {
  return getAllCategories().filter(cat => cat.digitalLiteracy === literacy);
}

/**
 * Determine appropriate category based on income and digital literacy
 * 
 * This function implements a decision tree that matches artisans to the most
 * appropriate category based on their annual income, digital capabilities,
 * and organizational structure.
 * 
 * The algorithm prioritizes:
 * 1. High income + digital skills → Export-oriented or SME-scale
 * 2. Medium income + cooperative structure → Cooperative/Cluster
 * 3. Low-medium income → Family-based
 * 4. Low income → Low-income individual (default)
 * 
 * @param annualIncome - Annual income in INR
 * @param hasDigitalSkills - Whether the artisan has digital capabilities
 * @param isCooperative - Whether the artisan is part of a cooperative/cluster
 * @returns The most appropriate CategoryType
 */
export function suggestCategory(
  annualIncome: number,
  hasDigitalSkills: boolean,
  isCooperative: boolean = false
): CategoryType {
  // Export-oriented (₹5+ crore)
  // High-income enterprises with digital skills focused on international markets
  if (annualIncome >= 50000000 && hasDigitalSkills) {
    return 'export-oriented';
  }
  
  // SME-scale (₹50 lakh - ₹5 crore)
  // Established digital-ready businesses with medium-high income
  if (annualIncome >= 5000000 && hasDigitalSkills) {
    return 'sme-scale';
  }
  
  // Cooperative/Cluster (₹10-50 lakh)
  // Organized artisan groups with shared infrastructure
  // Note: Cooperative structure takes precedence over individual income level
  if (annualIncome >= 1000000 && isCooperative) {
    return 'cooperative-cluster';
  }
  
  // Family-based (₹3-10 lakh)
  // Small family-run units with basic income
  if (annualIncome >= 300000) {
    return 'family-based';
  }
  
  // Low-income individual (< ₹3 lakh)
  // Default category for cash-poor individual artisans
  return 'low-income-individual';
}

/**
 * Format currency in Indian Rupees with appropriate suffixes
 * 
 * Converts large numbers to readable format using Indian numbering system:
 * - Crore (Cr): 10,000,000 (1 crore = 100 lakh)
 * - Lakh (L): 100,000 (1 lakh = 100 thousand)
 * - Thousand (K): 1,000
 * 
 * @param amount - Amount in INR to format
 * @returns Formatted string with ₹ symbol and appropriate suffix
 * 
 * @example
 * formatINR(50000) // "₹50.00 K"
 * formatINR(1000000) // "₹10.00 L"
 * formatINR(10000000) // "₹1.00 Cr"
 */
export function formatINR(amount: number): string {
  // Amounts >= 1 crore (10 million)
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } 
  // Amounts >= 1 lakh (100 thousand)
  else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } 
  // Amounts >= 1 thousand
  else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  // Small amounts - use locale formatting with commas
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Get category color class for Tailwind
 */
export function getCategoryColorClass(category: CategoryType): string {
  const colorMap: Record<CategoryType, string> = {
    'low-income-individual': 'bg-blue-100 text-blue-800 border-blue-200',
    'family-based': 'bg-green-100 text-green-800 border-green-200',
    'cooperative-cluster': 'bg-purple-100 text-purple-800 border-purple-200',
    'sme-scale': 'bg-orange-100 text-orange-800 border-orange-200',
    'export-oriented': 'bg-red-100 text-red-800 border-red-200',
  };
  return colorMap[category];
}

/**
 * Get category icon color class
 */
export function getCategoryIconColor(category: CategoryType): string {
  const colorMap: Record<CategoryType, string> = {
    'low-income-individual': 'text-blue-600',
    'family-based': 'text-green-600',
    'cooperative-cluster': 'text-purple-600',
    'sme-scale': 'text-orange-600',
    'export-oriented': 'text-red-600',
  };
  return colorMap[category];
}

// ============================================================================
// Scheme Filtering Functions
// ============================================================================

/**
 * Filter schemes by single or multiple categories
 * Deduplicates schemes that appear in multiple selected categories
 * 
 * This function implements the core filtering logic for category-based scheme discovery.
 * It handles three scenarios:
 * 1. No categories selected → return all schemes
 * 2. Single category selected → return schemes in that category
 * 3. Multiple categories selected → return schemes in ANY of the categories (OR logic)
 * 
 * Deduplication ensures that schemes appearing in multiple selected categories
 * are only shown once in the results.
 * 
 * @param schemes - Array of schemes to filter (must have id and categories properties)
 * @param selectedCategories - Array of category IDs to filter by
 * @returns Filtered and deduplicated array of schemes
 * 
 * @example
 * // Scheme appears in both selected categories but returned only once
 * const schemes = [
 *   { id: '1', categories: ['low-income-individual', 'family-based'] },
 *   { id: '2', categories: ['sme-scale'] }
 * ];
 * filterSchemesByCategory(schemes, ['low-income-individual', 'family-based']);
 * // Returns: [{ id: '1', ... }] (not duplicated)
 */
export function filterSchemesByCategory<T extends { id: string; categories: CategoryType[] }>(
  schemes: T[],
  selectedCategories: CategoryType[]
): T[] {
  // If no categories selected, return all schemes (no filtering)
  if (selectedCategories.length === 0) {
    return schemes;
  }
  
  // Filter schemes that belong to at least one selected category
  // Uses .some() to implement OR logic: scheme matches if ANY of its categories are selected
  const filteredSchemes = schemes.filter(scheme =>
    scheme.categories.some(cat => selectedCategories.includes(cat))
  );
  
  // Deduplicate by scheme ID using Map
  // Map ensures each scheme ID appears only once, even if the scheme
  // matches multiple selected categories
  const uniqueSchemes = new Map<string, T>();
  filteredSchemes.forEach(scheme => {
    // Only add if not already in the map (first occurrence wins)
    if (!uniqueSchemes.has(scheme.id)) {
      uniqueSchemes.set(scheme.id, scheme);
    }
  });
  
  // Convert Map values back to array
  return Array.from(uniqueSchemes.values());
}

/**
 * Calculate scheme counts per category
 * 
 * Counts how many schemes belong to each category. Since schemes can belong
 * to multiple categories, a single scheme may increment multiple counters.
 * 
 * This is used to display scheme count badges in the CategorySelector component.
 * 
 * @param schemes - Array of schemes to count (must have categories property)
 * @returns Record mapping category IDs to scheme counts
 * 
 * @example
 * const schemes = [
 *   { categories: ['low-income-individual', 'family-based'] },
 *   { categories: ['family-based'] }
 * ];
 * calculateCategoryCounts(schemes);
 * // Returns: { 'low-income-individual': 1, 'family-based': 2, ... }
 */
export function calculateCategoryCounts<T extends { categories: CategoryType[] }>(
  schemes: T[]
): Record<CategoryType, number> {
  // Initialize all counts to 0
  const counts: Record<CategoryType, number> = {
    'low-income-individual': 0,
    'family-based': 0,
    'cooperative-cluster': 0,
    'sme-scale': 0,
    'export-oriented': 0,
  };
  
  // Iterate through all schemes
  schemes.forEach(scheme => {
    // For each category the scheme belongs to, increment that category's count
    // Note: A scheme can belong to multiple categories, so it may increment multiple counters
    scheme.categories.forEach(category => {
      counts[category]++;
    });
  });
  
  return counts;
}

/**
 * Update category scheme counts in the ARTISAN_CATEGORIES object
 * 
 * This function mutates the global ARTISAN_CATEGORIES object to update
 * the schemeCount property for each category based on the current scheme data.
 * 
 * Call this function whenever the scheme data changes (e.g., after loading
 * schemes from API, after offline sync, or when schemes are added/removed).
 * 
 * @param schemes - Array of schemes to count (must have categories property)
 * 
 * @example
 * // After loading schemes from API
 * const schemes = await fetchSchemes();
 * updateCategoryCounts(schemes);
 * // Now ARTISAN_CATEGORIES['low-income-individual'].schemeCount is updated
 */
export function updateCategoryCounts<T extends { categories: CategoryType[] }>(
  schemes: T[]
): void {
  // Calculate counts for all categories
  const counts = calculateCategoryCounts(schemes);
  
  // Update the schemeCount property in ARTISAN_CATEGORIES for each category
  CATEGORY_TYPES.forEach(categoryType => {
    ARTISAN_CATEGORIES[categoryType].schemeCount = counts[categoryType];
  });
}
