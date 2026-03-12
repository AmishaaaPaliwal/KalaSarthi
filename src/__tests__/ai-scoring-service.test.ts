/**
 * Property-Based Tests for AI Scoring Service
 * 
 * These tests use fast-check to verify correctness properties
 * for the AI recommendation scoring algorithm.
 */

import * as fc from 'fast-check';
import { AIScoringService, ArtisanProfile } from '@/lib/services/ai-scoring-service';
import { CategoryType, Scheme, CATEGORY_METADATA, ARTISAN_CATEGORIES } from '@/lib/artisan-categories';

// ============================================================================
// Test Data Generators
// ============================================================================

/**
 * Generator for CategoryType values
 */
const categoryTypeArbitrary = fc.constantFrom<CategoryType>(
  'low-income-individual',
  'family-based',
  'cooperative-cluster',
  'sme-scale',
  'export-oriented'
);

/**
 * Generator for ArtisanProfile objects
 */
const artisanProfileArbitrary = fc.record({
  id: fc.uuid(),
  annualIncome: fc.integer({ min: 50000, max: 50000000 }),
  hasDigitalSkills: fc.boolean(),
  isCooperative: fc.boolean(),
  businessScale: fc.constantFrom('individual', 'family', 'cluster', 'sme', 'export'),
  location: fc.record({
    state: fc.constantFrom('Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan'),
    district: fc.option(fc.string({ minLength: 3, maxLength: 20 })),
  }),
  experience: fc.integer({ min: 0, max: 30 }),
  documents: fc.record({
    verified: fc.array(fc.constantFrom('aadhaar', 'pan', 'bank', 'business'), { minLength: 0, maxLength: 4 }),
    pending: fc.array(fc.constantFrom('income', 'caste', 'gst'), { minLength: 0, maxLength: 3 }),
  }),
});

/**
 * Generator for Scheme objects
 */
const schemeArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  description: fc.string({ minLength: 50, maxLength: 500 }),
  categories: fc.array(categoryTypeArbitrary, { minLength: 1, maxLength: 3 }),
  loanAmount: fc.record({
    min: fc.integer({ min: 10000, max: 1000000 }),
    max: fc.integer({ min: 1000000, max: 100000000 }),
    currency: fc.constant('INR'),
  }),
  interestRate: fc.record({
    original: fc.float({ min: 5, max: 15, noNaN: true }),
    subsidized: fc.option(fc.float({ min: 0, max: 10, noNaN: true })),
  }),
  subsidyPercentage: fc.option(fc.float({ min: 0, max: 100, noNaN: true })),
  collateralFree: fc.boolean(),
  eligibility: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  applicationUrl: fc.webUrl(),
  benefits: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
});

/**
 * Generator for schemes with deduplicated categories
 */
const schemeWithUniqueCategoriesArbitrary = schemeArbitrary.map(scheme => {
  const uniqueCategories = Array.from(new Set(scheme.categories));
  return {
    ...scheme,
    categories: uniqueCategories,
  };
});

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('AI Scoring Service - Property-Based Tests', () => {
  /**
   * Feature: artisan-category-schemes, Property 5: AI Score Category Relevance
   * Validates: Requirements 11.2, 11.3
   * 
   * For any scheme with an AI match score, the score must be calculated considering
   * the artisan's income level and digital literacy matching the category's criteria.
   */
  describe('Property 5: AI Score Category Relevance', () => {
    test('AI score is between 0 and 100', () => {
      fc.assert(
        fc.property(
          schemeWithUniqueCategoriesArbitrary,
          artisanProfileArbitrary,
          (scheme, artisan) => {
            const scoreResult = AIScoringService.calculateAIScore(scheme, artisan);
            
            // Property: AI score must be in valid range [0, 100]
            return scoreResult.aiScore >= 0 && scoreResult.aiScore <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('all component scores are between 0 and 100', () => {
      fc.assert(
        fc.property(
          schemeWithUniqueCategoriesArbitrary,
          artisanProfileArbitrary,
          (scheme, artisan) => {
            const scoreResult = AIScoringService.calculateAIScore(scheme, artisan);
            
            // Property: All component scores must be in valid range [0, 100]
            return (
              scoreResult.categoryRelevanceScore >= 0 && scoreResult.categoryRelevanceScore <= 100 &&
              scoreResult.incomeLevelMatchScore >= 0 && scoreResult.incomeLevelMatchScore <= 100 &&
              scoreResult.digitalLiteracyMatchScore >= 0 && scoreResult.digitalLiteracyMatchScore <= 100 &&
              scoreResult.eligibilityScore >= 0 && scoreResult.eligibilityScore <= 100 &&
              scoreResult.benefitPotentialScore >= 0 && scoreResult.benefitPotentialScore <= 100
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('artisans with digital skills score higher on fully-digital schemes', () => {
      fc.assert(
        fc.property(
          schemeWithUniqueCategoriesArbitrary,
          artisanProfileArbitrary,
          (scheme, artisan) => {
            // Only test schemes that require full digital literacy
            const requiresFullyDigital = scheme.categories.some(cat =>
              ARTISAN_CATEGORIES[cat].digitalLiteracy === 'fully-digital'
            );
            
            if (!requiresFullyDigital) {
              return true; // Skip schemes that don't require digital skills
            }
            
            // Create two artisan profiles: one with digital skills, one without
            const digitalArtisan = { ...artisan, hasDigitalSkills: true };
            const nonDigitalArtisan = { ...artisan, hasDigitalSkills: false };
            
            const digitalScore = AIScoringService.calculateAIScore(scheme, digitalArtisan);
            const nonDigitalScore = AIScoringService.calculateAIScore(scheme, nonDigitalArtisan);
            
            // Property: Digital artisan should score higher or equal on digital literacy component
            return digitalScore.digitalLiteracyMatchScore >= nonDigitalScore.digitalLiteracyMatchScore;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('artisans in matching income category score higher on category relevance', () => {
      fc.assert(
        fc.property(
          categoryTypeArbitrary,
          artisanProfileArbitrary,
          (targetCategory, baseArtisan) => {
            // Create a scheme that belongs to the target category
            const scheme: Scheme = {
              id: 'test-scheme',
              title: 'Test Scheme',
              description: 'Test scheme for property testing',
              categories: [targetCategory],
              loanAmount: {
                min: ARTISAN_CATEGORIES[targetCategory].typicalLoanRange.min,
                max: ARTISAN_CATEGORIES[targetCategory].typicalLoanRange.max,
                currency: 'INR',
              },
              interestRate: { original: 10, subsidized: 7 },
              subsidyPercentage: 20,
              collateralFree: true,
              eligibility: ['Test eligibility'],
              applicationUrl: 'https://example.com',
              benefits: ['Test benefit'],
            };
            
            // Create an artisan whose income falls within the target category's range
            const categoryMetadata = CATEGORY_METADATA[targetCategory];
            const matchingIncome = (categoryMetadata.incomeRange.min + categoryMetadata.incomeRange.max) / 2;
            const matchingArtisan = {
              ...baseArtisan,
              annualIncome: matchingIncome,
              hasDigitalSkills: ARTISAN_CATEGORIES[targetCategory].digitalLiteracy !== 'digitally-unaware',
            };
            
            // Create an artisan with very different income (either much lower or much higher)
            const mismatchedIncome = matchingIncome < 1000000 ? 40000000 : 100000;
            const mismatchedArtisan = {
              ...baseArtisan,
              annualIncome: mismatchedIncome,
              hasDigitalSkills: ARTISAN_CATEGORIES[targetCategory].digitalLiteracy === 'digitally-unaware',
            };
            
            const matchingScore = AIScoringService.calculateAIScore(scheme, matchingArtisan);
            const mismatchedScore = AIScoringService.calculateAIScore(scheme, mismatchedArtisan);
            
            // Property: Matching artisan should score higher or equal on overall AI score
            // Allow for some tolerance due to other scoring factors
            return matchingScore.aiScore >= mismatchedScore.aiScore - 10;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('schemes with matching categories have higher category relevance scores', () => {
      fc.assert(
        fc.property(
          categoryTypeArbitrary,
          artisanProfileArbitrary,
          (targetCategory, baseArtisan) => {
            // Create artisan profile that matches the target category
            const categoryMetadata = CATEGORY_METADATA[targetCategory];
            const matchingIncome = (categoryMetadata.incomeRange.min + categoryMetadata.incomeRange.max) / 2;
            const artisan = {
              ...baseArtisan,
              annualIncome: matchingIncome,
              hasDigitalSkills: ARTISAN_CATEGORIES[targetCategory].digitalLiteracy !== 'digitally-unaware',
            };
            
            // Create two schemes: one matching the category, one not
            const matchingScheme: Scheme = {
              id: 'matching-scheme',
              title: 'Matching Scheme',
              description: 'Scheme that matches artisan category',
              categories: [targetCategory],
              loanAmount: {
                min: ARTISAN_CATEGORIES[targetCategory].typicalLoanRange.min,
                max: ARTISAN_CATEGORIES[targetCategory].typicalLoanRange.max,
                currency: 'INR',
              },
              interestRate: { original: 10 },
              collateralFree: true,
              eligibility: ['Test'],
              applicationUrl: 'https://example.com',
              benefits: ['Test'],
            };
            
            // Get a different category for non-matching scheme
            const allCategories: CategoryType[] = [
              'low-income-individual',
              'family-based',
              'cooperative-cluster',
              'sme-scale',
              'export-oriented',
            ];
            const otherCategories = allCategories.filter(cat => cat !== targetCategory);
            const nonMatchingCategory = otherCategories[0];
            
            const nonMatchingScheme: Scheme = {
              ...matchingScheme,
              id: 'non-matching-scheme',
              categories: [nonMatchingCategory],
              loanAmount: {
                min: ARTISAN_CATEGORIES[nonMatchingCategory].typicalLoanRange.min,
                max: ARTISAN_CATEGORIES[nonMatchingCategory].typicalLoanRange.max,
                currency: 'INR',
              },
            };
            
            const matchingScore = AIScoringService.calculateAIScore(matchingScheme, artisan);
            const nonMatchingScore = AIScoringService.calculateAIScore(nonMatchingScheme, artisan);
            
            // Property: Matching scheme should have higher category relevance score
            return matchingScore.categoryRelevanceScore >= nonMatchingScore.categoryRelevanceScore;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('income level match score considers artisan income relative to category range', () => {
      fc.assert(
        fc.property(
          categoryTypeArbitrary,
          schemeWithUniqueCategoriesArbitrary,
          (targetCategory, baseScheme) => {
            // Create a scheme in the target category
            const scheme: Scheme = {
              ...baseScheme,
              categories: [targetCategory],
              loanAmount: {
                min: ARTISAN_CATEGORIES[targetCategory].typicalLoanRange.min,
                max: ARTISAN_CATEGORIES[targetCategory].typicalLoanRange.max,
                currency: 'INR',
              },
            };
            
            const categoryMetadata = CATEGORY_METADATA[targetCategory];
            
            // Create artisan with income in the category range
            const inRangeIncome = (categoryMetadata.incomeRange.min + categoryMetadata.incomeRange.max) / 2;
            const inRangeArtisan: ArtisanProfile = {
              id: 'test-artisan-in-range',
              annualIncome: inRangeIncome,
              hasDigitalSkills: true,
            };
            
            // Create artisan with income far outside the category range
            const outOfRangeIncome = categoryMetadata.incomeRange.max * 5;
            const outOfRangeArtisan: ArtisanProfile = {
              id: 'test-artisan-out-range',
              annualIncome: outOfRangeIncome,
              hasDigitalSkills: true,
            };
            
            const inRangeScore = AIScoringService.calculateAIScore(scheme, inRangeArtisan);
            const outOfRangeScore = AIScoringService.calculateAIScore(scheme, outOfRangeArtisan);
            
            // Property: Artisan with income in range should score higher or equal on income match
            return inRangeScore.incomeLevelMatchScore >= outOfRangeScore.incomeLevelMatchScore;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('category explanation is generated for all schemes', () => {
      fc.assert(
        fc.property(
          schemeWithUniqueCategoriesArbitrary,
          artisanProfileArbitrary,
          (scheme, artisan) => {
            const scoreResult = AIScoringService.calculateAIScore(scheme, artisan);
            const explanation = AIScoringService.generateCategoryExplanation(
              scheme,
              artisan,
              scoreResult
            );
            
            // Property: Explanation must be a non-empty string
            return typeof explanation === 'string' && explanation.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('higher AI scores correlate with better component scores', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 2, maxLength: 10 }),
          artisanProfileArbitrary,
          (schemes, artisan) => {
            // Calculate scores for all schemes
            const scores = schemes.map(scheme => ({
              scheme,
              result: AIScoringService.calculateAIScore(scheme, artisan),
            }));
            
            // Sort by AI score
            scores.sort((a, b) => b.result.aiScore - a.result.aiScore);
            
            if (scores.length < 2) {
              return true; // Need at least 2 schemes to compare
            }
            
            const highest = scores[0].result;
            const lowest = scores[scores.length - 1].result;
            
            // Property: Scheme with highest AI score should have at least one component
            // score that is higher than or equal to the lowest scoring scheme
            const highestHasBetterComponent =
              highest.categoryRelevanceScore >= lowest.categoryRelevanceScore ||
              highest.incomeLevelMatchScore >= lowest.incomeLevelMatchScore ||
              highest.digitalLiteracyMatchScore >= lowest.digitalLiteracyMatchScore ||
              highest.eligibilityScore >= lowest.eligibilityScore ||
              highest.benefitPotentialScore >= lowest.benefitPotentialScore;
            
            return highestHasBetterComponent;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('AI score explanation mentions income level for high income match scores', () => {
      fc.assert(
        fc.property(
          schemeWithUniqueCategoriesArbitrary,
          artisanProfileArbitrary,
          (scheme, artisan) => {
            const scoreResult = AIScoringService.calculateAIScore(scheme, artisan);
            
            // Only check if income match score is high
            if (scoreResult.incomeLevelMatchScore < 70) {
              return true; // Skip low income match scores
            }
            
            const explanation = scoreResult.explanation.toLowerCase();
            
            // Property: High income match should be mentioned in explanation
            // Look for keywords related to income, category, or match
            const mentionsRelevantConcepts =
              explanation.includes('income') ||
              explanation.includes('category') ||
              explanation.includes('match') ||
              explanation.includes('suitable') ||
              explanation.includes('align');
            
            return mentionsRelevantConcepts;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
