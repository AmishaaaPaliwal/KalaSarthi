/**
 * Property-Based Tests for Artisan Category Filtering
 * 
 * These tests use fast-check to verify correctness properties
 * across many randomly generated inputs.
 */

import * as fc from 'fast-check';
import {
  filterSchemesByCategory,
  calculateCategoryCounts,
  CATEGORY_TYPES,
} from '@/lib/artisan-categories';
import { CategoryType, Scheme } from '@/types/artisan-categories';

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

describe('Artisan Category Filtering - Property-Based Tests', () => {
  /**
   * Feature: artisan-category-schemes, Property 6: Multi-Category Deduplication
   * Validates: Requirements 7.3
   * 
   * For any scheme that appears in multiple categories, when multiple categories
   * are selected, the scheme must appear exactly once with all applicable category tags.
   */
  describe('Property 6: Multi-Category Deduplication', () => {
    test('schemes appear exactly once when multiple categories selected', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 1, maxLength: 50 }),
          fc.array(categoryTypeArbitrary, { minLength: 2, maxLength: 5 }),
          (schemes, selectedCategories) => {
            // Deduplicate selected categories
            const uniqueSelectedCategories = Array.from(new Set(selectedCategories));
            
            // Filter schemes
            const filtered = filterSchemesByCategory(schemes, uniqueSelectedCategories);
            
            // Extract IDs from filtered schemes
            const filteredIds = filtered.map(s => s.id);
            
            // Check for duplicates
            const uniqueIds = new Set(filteredIds);
            
            // Property: No duplicate scheme IDs in filtered results
            return uniqueIds.size === filtered.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtered schemes belong to at least one selected category', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 1, maxLength: 50 }),
          fc.array(categoryTypeArbitrary, { minLength: 1, maxLength: 5 }),
          (schemes, selectedCategories) => {
            // Deduplicate selected categories
            const uniqueSelectedCategories = Array.from(new Set(selectedCategories));
            
            if (uniqueSelectedCategories.length === 0) {
              return true; // Skip empty category selections
            }
            
            // Filter schemes
            const filtered = filterSchemesByCategory(schemes, uniqueSelectedCategories);
            
            // Property: Every filtered scheme must belong to at least one selected category
            return filtered.every(scheme =>
              scheme.categories.some(cat => uniqueSelectedCategories.includes(cat))
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('no schemes from unselected categories appear in results', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 1, maxLength: 50 }),
          fc.array(categoryTypeArbitrary, { minLength: 1, maxLength: 3 }),
          (schemes, selectedCategories) => {
            // Deduplicate selected categories
            const uniqueSelectedCategories = Array.from(new Set(selectedCategories));
            
            if (uniqueSelectedCategories.length === 0) {
              return true; // Skip empty category selections
            }
            
            // Filter schemes
            const filtered = filterSchemesByCategory(schemes, uniqueSelectedCategories);
            
            // Property: No scheme should appear if it only has categories NOT in the selection
            return filtered.every(scheme => {
              const hasSelectedCategory = scheme.categories.some(cat =>
                uniqueSelectedCategories.includes(cat)
              );
              return hasSelectedCategory;
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: artisan-category-schemes, Property 8: Category Count Accuracy
   * Validates: Requirements 7.5
   * 
   * For any category, the displayed scheme count badge must equal the actual
   * number of schemes assigned to that category.
   */
  describe('Property 8: Category Count Accuracy', () => {
    test('category count badges match actual scheme counts', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 0, maxLength: 100 }),
          (schemes) => {
            // Calculate counts using the function
            const counts = calculateCategoryCounts(schemes);
            
            // Manually count schemes per category
            const expectedCounts: Record<CategoryType, number> = {
              'low-income-individual': 0,
              'family-based': 0,
              'cooperative-cluster': 0,
              'sme-scale': 0,
              'export-oriented': 0,
            };
            
            schemes.forEach(scheme => {
              scheme.categories.forEach(category => {
                expectedCounts[category]++;
              });
            });
            
            // Property: Calculated counts must match expected counts for all categories
            return CATEGORY_TYPES.every(category =>
              counts[category] === expectedCounts[category]
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('scheme counts are non-negative', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 0, maxLength: 100 }),
          (schemes) => {
            const counts = calculateCategoryCounts(schemes);
            
            // Property: All counts must be non-negative
            return CATEGORY_TYPES.every(category => counts[category] >= 0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('total count equals sum of individual category counts for multi-category schemes', () => {
      fc.assert(
        fc.property(
          fc.array(schemeWithUniqueCategoriesArbitrary, { minLength: 0, maxLength: 100 }),
          (schemes) => {
            const counts = calculateCategoryCounts(schemes);
            
            // Calculate total category assignments
            const totalCategoryAssignments = schemes.reduce(
              (sum, scheme) => sum + scheme.categories.length,
              0
            );
            
            // Sum of all category counts
            const sumOfCounts = CATEGORY_TYPES.reduce(
              (sum, category) => sum + counts[category],
              0
            );
            
            // Property: Sum of counts must equal total category assignments
            return sumOfCounts === totalCategoryAssignments;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
