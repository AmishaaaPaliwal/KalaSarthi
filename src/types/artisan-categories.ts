/**
 * Artisan Category Types
 * 
 * This file defines the type system for organizing government schemes
 * by artisan income level and digital literacy.
 */

// ============================================================================
// Category Type Definitions
// ============================================================================

/**
 * The five artisan categories based on income level and digital literacy
 */
export type CategoryType =
  | 'low-income-individual'
  | 'family-based'
  | 'cooperative-cluster'
  | 'sme-scale'
  | 'export-oriented';

/**
 * Income level classifications
 */
export type IncomeLevel = 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high';

/**
 * Digital literacy levels
 */
export type DigitalLiteracy = 'digitally-unaware' | 'semi-digital' | 'fully-digital';

// ============================================================================
// Artisan Category Model
// ============================================================================

/**
 * Complete artisan category definition with metadata
 */
export interface ArtisanCategory {
  /** Unique category identifier */
  id: CategoryType;
  
  /** Display name for the category */
  name: string;
  
  /** Income level classification */
  incomeLevel: IncomeLevel;
  
  /** Digital literacy level */
  digitalLiteracy: DigitalLiteracy;
  
  /** Detailed description of the category */
  description: string;
  
  /** Icon name or component identifier */
  icon: string;
  
  /** Color theme for visual distinction */
  color: string;
  
  /** Number of schemes in this category */
  schemeCount: number;
  
  /** Typical loan range for this category (in INR) */
  typicalLoanRange: {
    min: number;
    max: number;
  };
  
  /** Example scheme names for this category */
  exampleSchemes: string[];
}

// ============================================================================
// Scheme Financial Models
// ============================================================================

/**
 * Loan amount details with optional category-specific amounts
 */
export interface LoanAmount {
  /** Minimum loan amount in INR */
  min: number;
  
  /** Maximum loan amount in INR */
  max: number;
  
  /** Currency code (default: INR) */
  currency: string;
  
  /** Category-specific loan amounts (e.g., for PMMY Shishu/Kishor/Tarun) */
  categories?: {
    shishu?: number;
    kishor?: number;
    tarun?: number;
  };
}

/**
 * Interest rate information including subsidies
 */
export interface InterestRate {
  /** Original interest rate (percentage) */
  original: number;
  
  /** Subsidized interest rate after government support (percentage) */
  subsidized?: number;
  
  /** Interest subvention percentage provided by government */
  subventionPercentage?: number;
}

/**
 * Subsidy types and details
 */
export type SubsidyType = 'margin-money' | 'equipment' | 'infrastructure' | 'training';

/**
 * Subsidy information
 */
export interface Subsidy {
  /** Type of subsidy offered */
  type: SubsidyType;
  
  /** Subsidy percentage (0-100) */
  percentage: number;
  
  /** Maximum subsidy amount in INR */
  maxAmount?: number;
  
  /** Specific eligibility criteria for this subsidy */
  eligibility?: string[];
}

/**
 * Complete financial details for a scheme
 */
export interface FinancialDetails {
  /** Loan amount information */
  loanAmount: LoanAmount;
  
  /** Interest rate information */
  interestRate: InterestRate;
  
  /** List of subsidies offered */
  subsidies: Subsidy[];
  
  /** Whether the loan is collateral-free */
  collateralFree: boolean;
  
  /** Repayment terms description */
  repaymentTerms?: string;
}

// ============================================================================
// Scheme Models
// ============================================================================

/**
 * Target audience criteria for a scheme
 */
export interface TargetAudience {
  /** Income level requirements */
  incomeLevel: string[];
  
  /** Business scale requirements */
  businessScale: string[];
  
  /** Digital literacy requirement */
  digitalRequirement: string;
}

/**
 * Basic scheme information
 */
export interface Scheme {
  /** Unique scheme identifier */
  id: string;
  
  /** Scheme title/name */
  title: string;
  
  /** Detailed description */
  description: string;
  
  /** Categories this scheme belongs to */
  categories: CategoryType[];
  
  /** Loan amount details */
  loanAmount: LoanAmount;
  
  /** Interest rate details */
  interestRate: InterestRate;
  
  /** Subsidy percentage (if applicable) */
  subsidyPercentage?: number;
  
  /** Whether collateral is required */
  collateralFree: boolean;
  
  /** Eligibility criteria list */
  eligibility: string[];
  
  /** Official application URL */
  applicationUrl: string;
  
  /** List of benefits provided */
  benefits: string[];
}

/**
 * Extended scheme with category-specific metadata
 */
export interface SchemeWithCategory extends Scheme {
  /** Category relevance scores (0-100) */
  categoryRelevance: Record<CategoryType, number>;
  
  /** Complete financial details */
  financialDetails: FinancialDetails;
  
  /** Target audience criteria */
  targetAudience: TargetAudience;
}

// ============================================================================
// Category Metadata
// ============================================================================

/**
 * Metadata for category configuration
 */
export interface CategoryMetadata {
  /** Income range for this category (in INR per year) */
  incomeRange: {
    min: number;
    max: number;
  };
  
  /** Digital literacy level */
  digitalLiteracy: DigitalLiteracy;
  
  /** Typical business scale description */
  typicalBusinessScale: string;
  
  /** Category description */
  description: string;
}

// ============================================================================
// Offline Cache Models
// ============================================================================

/**
 * Cached category data for offline access
 */
export interface CategoryCache {
  /** Category identifier */
  category: CategoryType;
  
  /** Cached schemes for this category */
  schemes: SchemeWithCategory[];
  
  /** Last sync timestamp (Unix timestamp) */
  lastSyncTimestamp: number;
  
  /** Number of schemes in cache */
  schemeCount: number;
  
  /** Cache version for compatibility */
  version: string;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for CategorySelector component
 */
export interface CategorySelectorProps {
  /** Currently selected categories */
  selectedCategories: CategoryType[];
  
  /** Callback when category selection changes */
  onCategoryChange: (categories: CategoryType[]) => void;
  
  /** Scheme counts per category */
  schemeCounts: Record<CategoryType, number>;
  
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for enhanced SchemeCard component
 */
export interface EnhancedSchemeCardProps {
  /** Scheme data to display */
  scheme: Scheme;
  
  /** Categories this scheme belongs to */
  categories: CategoryType[];
  
  /** AI match score (0-100) */
  aiScore?: number;
  
  /** Callback when Apply button is clicked */
  onApply: () => void;
  
  /** Callback when Compare button is clicked */
  onCompare: () => void;
  
  /** Whether the app is in offline mode */
  isOffline?: boolean;
  
  /** Whether to show the Apply button */
  showApplyButton?: boolean;
}

/**
 * Props for SchemeComparison component
 */
export interface SchemeComparisonProps {
  /** Schemes to compare */
  schemes: Scheme[];
  
  /** Callback when comparison is closed */
  onClose: () => void;
  
  /** Optional category filter */
  category?: CategoryType;
}
