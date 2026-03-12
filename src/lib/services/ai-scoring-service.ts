/**
 * AI Scoring Service for Category-Based Scheme Recommendations
 * 
 * This service implements the enhanced AI scoring algorithm that factors in:
 * - Artisan income level
 * - Digital literacy match
 * - Category relevance
 * 
 * Validates: Requirements 11.2, 11.3
 */

import {
  CategoryType,
  Scheme,
  SchemeWithCategory,
  CATEGORY_METADATA,
  ARTISAN_CATEGORIES,
  suggestCategory,
} from '@/lib/artisan-categories';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Artisan profile for AI scoring
 */
export interface ArtisanProfile {
  id: string;
  annualIncome: number;
  hasDigitalSkills: boolean;
  isCooperative?: boolean;
  businessScale?: 'individual' | 'family' | 'cluster' | 'sme' | 'export';
  location?: {
    state: string;
    district?: string;
  };
  experience?: number;
  documents?: {
    verified: string[];
    pending: string[];
  };
}

/**
 * AI scoring result with detailed breakdown
 */
export interface AIScoreResult {
  aiScore: number;
  categoryRelevanceScore: number;
  incomeLevelMatchScore: number;
  digitalLiteracyMatchScore: number;
  eligibilityScore: number;
  benefitPotentialScore: number;
  explanation: string;
  matchedCategories: CategoryType[];
}

/**
 * Scheme recommendation with AI scoring
 */
export interface SchemeRecommendation {
  scheme: Scheme;
  aiScore: number;
  eligibilityMatch: number;
  benefitPotential: number;
  urgencyScore: number;
  personalizedReason: string;
  categoryExplanation: string;
  actionPlan: {
    immediateActions: string[];
    documentPreparation: string[];
    timelineEstimate: string;
    successProbability: number;
  };
  riskFactors: string[];
  alternativeSchemes: string[];
}

// ============================================================================
// AI Scoring Service
// ============================================================================

export class AIScoringService {
  /**
   * Calculate comprehensive AI score for a scheme based on artisan profile
   * 
   * The scoring algorithm considers:
   * 1. Category Relevance (40%): How well the scheme's categories match the artisan's profile
   * 2. Income Level Match (25%): How well the scheme's loan range matches the artisan's income
   * 3. Digital Literacy Match (20%): Whether the scheme's digital requirements match artisan's skills
   * 4. Eligibility Score (10%): Basic eligibility criteria match
   * 5. Benefit Potential (5%): Potential financial benefit relative to artisan's income
   * 
   * @param scheme - The scheme to score
   * @param artisan - The artisan profile
   * @returns Detailed AI score result
   */
  static calculateAIScore(
    scheme: Scheme,
    artisan: ArtisanProfile
  ): AIScoreResult {
    // Determine the artisan's primary category based on their profile
    const artisanCategory = suggestCategory(
      artisan.annualIncome,
      artisan.hasDigitalSkills,
      artisan.isCooperative
    );

    // 1. Category Relevance Score (40% weight)
    const categoryRelevanceScore = this.calculateCategoryRelevance(
      scheme.categories,
      artisanCategory,
      artisan
    );

    // 2. Income Level Match Score (25% weight)
    const incomeLevelMatchScore = this.calculateIncomeLevelMatch(
      scheme,
      artisan.annualIncome,
      artisanCategory
    );

    // 3. Digital Literacy Match Score (20% weight)
    const digitalLiteracyMatchScore = this.calculateDigitalLiteracyMatch(
      scheme.categories,
      artisan.hasDigitalSkills
    );

    // 4. Eligibility Score (10% weight)
    const eligibilityScore = this.calculateEligibilityScore(
      scheme,
      artisan
    );

    // 5. Benefit Potential Score (5% weight)
    const benefitPotentialScore = this.calculateBenefitPotential(
      scheme,
      artisan.annualIncome
    );

    // Calculate weighted AI score
    const aiScore = Math.round(
      categoryRelevanceScore * 0.40 +
      incomeLevelMatchScore * 0.25 +
      digitalLiteracyMatchScore * 0.20 +
      eligibilityScore * 0.10 +
      benefitPotentialScore * 0.05
    );

    // Generate explanation
    const explanation = this.generateScoreExplanation(
      aiScore,
      categoryRelevanceScore,
      incomeLevelMatchScore,
      digitalLiteracyMatchScore,
      artisanCategory,
      scheme.categories
    );

    return {
      aiScore,
      categoryRelevanceScore,
      incomeLevelMatchScore,
      digitalLiteracyMatchScore,
      eligibilityScore,
      benefitPotentialScore,
      explanation,
      matchedCategories: scheme.categories,
    };
  }

  /**
   * Calculate category relevance score
   * 
   * Scores how well the scheme's categories match the artisan's profile category.
   * - Direct match: 100 points
   * - Adjacent category: 70 points
   * - Two categories away: 40 points
   * - Three+ categories away: 20 points
   * 
   * @param schemeCategories - Categories the scheme belongs to
   * @param artisanCategory - The artisan's primary category
   * @param artisan - Full artisan profile for additional context
   * @returns Score from 0-100
   */
  private static calculateCategoryRelevance(
    schemeCategories: CategoryType[],
    artisanCategory: CategoryType,
    artisan: ArtisanProfile
  ): number {
    // Define category hierarchy for distance calculation
    const categoryHierarchy: CategoryType[] = [
      'low-income-individual',
      'family-based',
      'cooperative-cluster',
      'sme-scale',
      'export-oriented',
    ];

    const artisanIndex = categoryHierarchy.indexOf(artisanCategory);

    // Find the closest matching category in the scheme
    let bestScore = 0;

    for (const schemeCategory of schemeCategories) {
      const schemeIndex = categoryHierarchy.indexOf(schemeCategory);
      const distance = Math.abs(artisanIndex - schemeIndex);

      let score = 0;
      if (distance === 0) {
        score = 100; // Direct match
      } else if (distance === 1) {
        score = 70; // Adjacent category
      } else if (distance === 2) {
        score = 40; // Two categories away
      } else {
        score = 20; // Three+ categories away
      }

      bestScore = Math.max(bestScore, score);
    }

    // Bonus points if scheme matches multiple categories and artisan is transitioning
    if (schemeCategories.length > 1 && artisan.businessScale) {
      bestScore = Math.min(100, bestScore + 10);
    }

    return bestScore;
  }

  /**
   * Calculate income level match score
   * 
   * Scores how well the scheme's loan amount range matches the artisan's income level.
   * Uses the category metadata to determine appropriate loan ranges.
   * 
   * @param scheme - The scheme with loan amount information
   * @param artisanIncome - The artisan's annual income
   * @param artisanCategory - The artisan's primary category
   * @returns Score from 0-100
   */
  private static calculateIncomeLevelMatch(
    scheme: Scheme,
    artisanIncome: number,
    artisanCategory: CategoryType
  ): number {
    const categoryMetadata = CATEGORY_METADATA[artisanCategory];
    const categoryInfo = ARTISAN_CATEGORIES[artisanCategory];

    // Check if artisan's income falls within the category's income range
    const incomeInRange =
      artisanIncome >= categoryMetadata.incomeRange.min &&
      artisanIncome <= categoryMetadata.incomeRange.max;

    // Check if scheme's loan amount is appropriate for the category
    const loanMin = scheme.loanAmount.min;
    const loanMax = scheme.loanAmount.max;
    const categoryLoanMin = categoryInfo.typicalLoanRange.min;
    const categoryLoanMax = categoryInfo.typicalLoanRange.max;

    // Calculate overlap between scheme loan range and category loan range
    const overlapMin = Math.max(loanMin, categoryLoanMin);
    const overlapMax = Math.min(loanMax, categoryLoanMax);
    const overlap = Math.max(0, overlapMax - overlapMin);
    const categoryRange = categoryLoanMax - categoryLoanMin;
    const overlapPercentage = overlap / categoryRange;

    // Base score from overlap
    let score = overlapPercentage * 100;

    // Bonus if income is in range
    if (incomeInRange) {
      score = Math.min(100, score + 20);
    }

    // Penalty if loan amount is too high for income level
    if (loanMin > artisanIncome * 2) {
      score = Math.max(0, score - 30);
    }

    // Bonus if loan amount is reasonable relative to income (10-50% of annual income)
    const loanToIncomeRatio = loanMin / artisanIncome;
    if (loanToIncomeRatio >= 0.1 && loanToIncomeRatio <= 0.5) {
      score = Math.min(100, score + 15);
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate digital literacy match score
   * 
   * Scores how well the scheme's digital requirements match the artisan's digital skills.
   * 
   * @param schemeCategories - Categories the scheme belongs to
   * @param hasDigitalSkills - Whether the artisan has digital skills
   * @returns Score from 0-100
   */
  private static calculateDigitalLiteracyMatch(
    schemeCategories: CategoryType[],
    hasDigitalSkills: boolean
  ): number {
    // Determine the digital literacy requirement of the scheme
    // based on its categories
    const digitalRequirements = schemeCategories.map(cat => {
      const categoryInfo = ARTISAN_CATEGORIES[cat];
      return categoryInfo.digitalLiteracy;
    });

    // Find the minimum digital literacy required
    const requiresFullyDigital = digitalRequirements.includes('fully-digital');
    const requiresSemiDigital = digitalRequirements.includes('semi-digital');
    const allowsDigitallyUnaware = digitalRequirements.includes('digitally-unaware');

    if (hasDigitalSkills) {
      // Artisan has digital skills - they can access any scheme
      return 100;
    } else {
      // Artisan lacks digital skills
      if (allowsDigitallyUnaware) {
        // Scheme is accessible to digitally unaware artisans
        return 100;
      } else if (requiresSemiDigital && !requiresFullyDigital) {
        // Scheme requires some digital skills - partial match
        return 50;
      } else {
        // Scheme requires full digital skills - poor match
        return 20;
      }
    }
  }

  /**
   * Calculate eligibility score based on basic criteria
   * 
   * @param scheme - The scheme with eligibility criteria
   * @param artisan - The artisan profile
   * @returns Score from 0-100
   */
  private static calculateEligibilityScore(
    scheme: Scheme,
    artisan: ArtisanProfile
  ): number {
    let score = 70; // Base score

    // Check document verification
    if (artisan.documents) {
      const verifiedCount = artisan.documents.verified.length;
      const totalRequired = scheme.eligibility.length;
      const verificationRatio = Math.min(1, verifiedCount / Math.max(1, totalRequired));
      score += verificationRatio * 30;
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate benefit potential score
   * 
   * Scores the potential financial benefit relative to the artisan's income.
   * 
   * @param scheme - The scheme with benefit information
   * @param artisanIncome - The artisan's annual income
   * @returns Score from 0-100
   */
  private static calculateBenefitPotential(
    scheme: Scheme,
    artisanIncome: number
  ): number {
    const maxLoan = scheme.loanAmount.max;
    const subsidyPercentage = scheme.subsidyPercentage || 0;

    // Calculate potential benefit as percentage of income
    const loanBenefit = maxLoan / artisanIncome;
    const subsidyBenefit = (maxLoan * subsidyPercentage) / 100 / artisanIncome;

    // Score based on benefit potential
    let score = 0;

    // Loan benefit scoring
    if (loanBenefit >= 2) {
      score += 50; // Loan is 2x+ annual income - high benefit
    } else if (loanBenefit >= 1) {
      score += 40; // Loan is 1-2x annual income
    } else if (loanBenefit >= 0.5) {
      score += 30; // Loan is 50-100% of annual income
    } else {
      score += 20; // Loan is less than 50% of annual income
    }

    // Subsidy benefit scoring
    if (subsidyBenefit >= 0.3) {
      score += 50; // Subsidy is 30%+ of annual income
    } else if (subsidyBenefit >= 0.15) {
      score += 40; // Subsidy is 15-30% of annual income
    } else if (subsidyBenefit >= 0.05) {
      score += 30; // Subsidy is 5-15% of annual income
    } else {
      score += 10; // Minimal subsidy
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Generate human-readable explanation for the AI score
   * 
   * @param aiScore - The overall AI score
   * @param categoryScore - Category relevance score
   * @param incomeScore - Income level match score
   * @param digitalScore - Digital literacy match score
   * @param artisanCategory - The artisan's primary category
   * @param schemeCategories - The scheme's categories
   * @returns Explanation string
   */
  private static generateScoreExplanation(
    aiScore: number,
    categoryScore: number,
    incomeScore: number,
    digitalScore: number,
    artisanCategory: CategoryType,
    schemeCategories: CategoryType[]
  ): string {
    const artisanCategoryName = ARTISAN_CATEGORIES[artisanCategory].name;
    const matchesCategory = schemeCategories.includes(artisanCategory);

    if (aiScore >= 90) {
      return `Excellent match! This scheme is ${matchesCategory ? 'specifically designed for' : 'highly suitable for'} ${artisanCategoryName} like you, with strong alignment across income level, digital requirements, and benefits.`;
    } else if (aiScore >= 75) {
      return `Strong match. This scheme aligns well with your ${artisanCategoryName} profile, particularly in ${categoryScore >= 80 ? 'category fit' : incomeScore >= 80 ? 'income level' : 'digital accessibility'}.`;
    } else if (aiScore >= 60) {
      return `Good match. This scheme is accessible to ${artisanCategoryName}, though ${digitalScore < 60 ? 'it may require some digital skills' : incomeScore < 60 ? 'the loan amounts may be higher than typical for your income level' : 'it targets a broader audience'}.`;
    } else if (aiScore >= 40) {
      return `Moderate match. While this scheme is available to you, it may be better suited for ${schemeCategories[0] !== artisanCategory ? ARTISAN_CATEGORIES[schemeCategories[0]].name : 'artisans with different profiles'}.`;
    } else {
      return `Limited match. This scheme primarily targets ${ARTISAN_CATEGORIES[schemeCategories[0]].name}, which differs from your current profile.`;
    }
  }

  /**
   * Generate category-specific explanation for why a scheme matches
   * 
   * Validates: Requirements 11.5
   * 
   * @param scheme - The scheme
   * @param artisan - The artisan profile
   * @param scoreResult - The AI score result
   * @returns Category-specific explanation
   */
  static generateCategoryExplanation(
    scheme: Scheme,
    artisan: ArtisanProfile,
    scoreResult: AIScoreResult
  ): string {
    const artisanCategory = suggestCategory(
      artisan.annualIncome,
      artisan.hasDigitalSkills,
      artisan.isCooperative
    );

    const categoryInfo = ARTISAN_CATEGORIES[artisanCategory];
    const categoryMetadata = CATEGORY_METADATA[artisanCategory];

    const explanations: string[] = [];

    // Income level explanation
    if (scoreResult.incomeLevelMatchScore >= 70) {
      explanations.push(
        `Your income level (${this.formatIncome(artisan.annualIncome)}) falls within the ${categoryInfo.incomeLevel} income category, making you eligible for this scheme's loan range of ${this.formatIncome(scheme.loanAmount.min)} - ${this.formatIncome(scheme.loanAmount.max)}.`
      );
    }

    // Digital literacy explanation
    const schemeDigitalReq = scheme.categories.map(cat =>
      ARTISAN_CATEGORIES[cat].digitalLiteracy
    );

    if (artisan.hasDigitalSkills) {
      if (schemeDigitalReq.includes('fully-digital')) {
        explanations.push(
          `Your digital skills match this scheme's fully-digital requirements, enabling you to complete online applications and access digital marketplaces.`
        );
      } else {
        explanations.push(
          `Your digital skills exceed this scheme's requirements, making the application process straightforward for you.`
        );
      }
    } else {
      if (schemeDigitalReq.includes('digitally-unaware')) {
        explanations.push(
          `This scheme is designed for artisans without digital skills, with offline application support and in-person assistance available.`
        );
      } else if (schemeDigitalReq.includes('semi-digital')) {
        explanations.push(
          `This scheme requires basic digital skills. Consider seeking assistance from a digital literacy center or family member for the application process.`
        );
      }
    }

    // Category-specific eligibility factors
    if (scheme.categories.includes(artisanCategory)) {
      explanations.push(
        `This scheme specifically targets ${categoryInfo.name}, with benefits tailored to ${categoryMetadata.typicalBusinessScale}.`
      );
    }

    // Business scale explanation
    if (artisan.isCooperative && scheme.categories.includes('cooperative-cluster')) {
      explanations.push(
        `As a cooperative member, you can access this scheme's cluster development benefits and shared infrastructure support.`
      );
    }

    // Fallback explanation if no specific explanations were added
    if (explanations.length === 0) {
      explanations.push(
        `This scheme is available to ${categoryInfo.name} and may provide benefits relevant to your business needs.`
      );
    }

    return explanations.join(' ');
  }

  /**
   * Format income for display
   */
  private static formatIncome(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${(amount / 1000).toFixed(0)} K`;
    }
  }
}
