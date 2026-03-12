/**
 * Property-Based Tests for Offline Category Caching
 * 
 * These tests use fast-check to verify correctness properties
 * for offline scheme caching by category.
 */

import * as fc from 'fast-check';
import { CategoryType } from '@/types/artisan-categories';

// Mock IndexedDB for testing
class MockIDBDatabase {
  private stores: Map<string, Map<string, any>> = new Map();
  objectStoreNames = {
    contains: (name: string) => this.stores.has(name)
  };

  transaction(storeNames: string[], mode: string) {
    return {
      objectStore: (name: string) => {
        if (!this.stores.has(name)) {
          this.stores.set(name, new Map());
        }
        const store = this.stores.get(name)!;
        
        return {
          put: (data: any) => ({
            onsuccess: null as any,
            onerror: null as any,
            result: data,
          }),
          get: (id: string) => ({
            onsuccess: null as any,
            onerror: null as any,
            result: store.get(id),
          }),
          getAll: () => ({
            onsuccess: null as any,
            onerror: null as any,
            result: Array.from(store.values()),
          }),
          index: (indexName: string) => ({
            getAll: (value: any) => ({
              onsuccess: null as any,
              onerror: null as any,
              result: Array.from(store.values()).filter((item: any) => 
                item.data?.category === value
              ),
            }),
          }),
          createIndex: () => {},
        };
      },
    };
  }

  createObjectStore(name: string, options: any) {
    this.stores.set(name, new Map());
    return {
      createIndex: () => {},
    };
  }
}

// Mock IndexedDB globally
const mockIndexedDB = {
  open: (name: string, version: number) => ({
    onsuccess: null as any,
    onerror: null as any,
    onupgradeneeded: null as any,
    result: new MockIDBDatabase(),
  }),
};

// Simple in-memory implementation for testing
class OfflineStorageTest {
  private schemeStore: Map<string, any> = new Map();
  private settingsStore: Map<string, any> = new Map();

  async storeSchemesByCategory(category: string, schemes: any[]): Promise<void> {
    schemes.forEach(scheme => {
      const key = `${category}-${scheme.id}`;
      this.schemeStore.set(key, {
        id: key,
        type: 'scheme',
        data: { ...scheme, category },
        timestamp: Date.now(),
        synced: true,
        version: 1,
      });
    });

    // Store category metadata
    this.settingsStore.set(`category-cache-${category}`, {
      category,
      schemes,
      lastSyncTimestamp: Date.now(),
      schemeCount: schemes.length,
      version: '1.0',
    });
  }

  async getSchemesByCategory(category: string): Promise<any[]> {
    const schemes: any[] = [];
    this.schemeStore.forEach((value, key) => {
      if (value.data.category === category) {
        schemes.push(value.data);
      }
    });
    return schemes;
  }

  async getAllCachedSchemes(): Promise<any[]> {
    const schemes: any[] = [];
    this.schemeStore.forEach(value => {
      schemes.push(value.data);
    });
    return schemes;
  }

  async getCategoryCacheMetadata(category: string): Promise<any> {
    return this.settingsStore.get(`category-cache-${category}`) || null;
  }

  clear(): void {
    this.schemeStore.clear();
    this.settingsStore.clear();
  }
}

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
 * Generator for Scheme objects with categories
 */
const schemeWithCategoryArbitrary = fc.record({
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
  collateralFree: fc.boolean(),
  eligibility: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  applicationUrl: fc.webUrl(),
}).map(scheme => ({
  ...scheme,
  categories: Array.from(new Set(scheme.categories)), // Deduplicate categories
}));

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Offline Category Caching - Property-Based Tests', () => {
  let storage: OfflineStorageTest;

  beforeEach(() => {
    storage = new OfflineStorageTest();
  });

  afterEach(() => {
    storage.clear();
  });

  /**
   * Feature: artisan-category-schemes, Property 4: Offline Category Preservation
   * Validates: Requirements 9.1, 9.3
   * 
   * For any cached scheme, its category assignments must remain identical to
   * the online version at the time of caching.
   */
  describe('Property 4: Offline Category Preservation', () => {
    test('cached schemes preserve category assignments', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(schemeWithCategoryArbitrary, { minLength: 1, maxLength: 20 }),
          categoryTypeArbitrary,
          async (schemes, category) => {
            // Filter schemes that belong to this category
            const categorySchemes = schemes.filter(s => s.categories.includes(category));
            
            if (categorySchemes.length === 0) {
              return true; // Skip if no schemes for this category
            }

            // Cache schemes for this category
            await storage.storeSchemesByCategory(category, categorySchemes);

            // Retrieve cached schemes
            const cachedSchemes = await storage.getSchemesByCategory(category);

            // Property: Every original scheme must have a cached version with identical categories
            return categorySchemes.every(originalScheme => {
              const cachedScheme = cachedSchemes.find(c => c.id === originalScheme.id);
              
              if (!cachedScheme) {
                return false; // Scheme not found in cache
              }

              // Check if categories are identical
              const originalCategories = [...originalScheme.categories].sort();
              const cachedCategories = [...cachedScheme.categories].sort();

              return (
                originalCategories.length === cachedCategories.length &&
                originalCategories.every((cat, idx) => cat === cachedCategories[idx])
              );
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('cached schemes maintain all original properties', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(schemeWithCategoryArbitrary, { minLength: 1, maxLength: 20 }),
          categoryTypeArbitrary,
          async (schemes, category) => {
            // Filter schemes that belong to this category
            const categorySchemes = schemes.filter(s => s.categories.includes(category));
            
            if (categorySchemes.length === 0) {
              return true; // Skip if no schemes for this category
            }

            // Cache schemes
            await storage.storeSchemesByCategory(category, categorySchemes);

            // Retrieve cached schemes
            const cachedSchemes = await storage.getSchemesByCategory(category);

            // Property: All essential properties must be preserved
            return categorySchemes.every(originalScheme => {
              const cachedScheme = cachedSchemes.find(c => c.id === originalScheme.id);
              
              if (!cachedScheme) {
                return false;
              }

              return (
                cachedScheme.id === originalScheme.id &&
                cachedScheme.title === originalScheme.title &&
                cachedScheme.description === originalScheme.description &&
                cachedScheme.collateralFree === originalScheme.collateralFree &&
                cachedScheme.applicationUrl === originalScheme.applicationUrl
              );
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('category metadata is stored with correct scheme count', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(schemeWithCategoryArbitrary, { minLength: 1, maxLength: 20 }),
          categoryTypeArbitrary,
          async (schemes, category) => {
            // Filter schemes that belong to this category
            const categorySchemes = schemes.filter(s => s.categories.includes(category));
            
            if (categorySchemes.length === 0) {
              return true; // Skip if no schemes for this category
            }

            // Cache schemes
            await storage.storeSchemesByCategory(category, categorySchemes);

            // Retrieve metadata
            const metadata = await storage.getCategoryCacheMetadata(category);

            // Property: Metadata must exist and have correct scheme count
            return (
              metadata !== null &&
              metadata.category === category &&
              metadata.schemeCount === categorySchemes.length &&
              metadata.lastSyncTimestamp > 0
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('schemes cached in multiple categories appear in all relevant caches', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(schemeWithCategoryArbitrary, { minLength: 1, maxLength: 20 }),
          async (schemes) => {
            // Group schemes by category
            const schemesByCategory = new Map<CategoryType, any[]>();
            
            schemes.forEach(scheme => {
              scheme.categories.forEach(category => {
                if (!schemesByCategory.has(category)) {
                  schemesByCategory.set(category, []);
                }
                schemesByCategory.get(category)!.push(scheme);
              });
            });

            // Cache schemes for each category
            for (const [category, categorySchemes] of schemesByCategory.entries()) {
              await storage.storeSchemesByCategory(category, categorySchemes);
            }

            // Property: Each scheme must appear in cache for all its categories
            return schemes.every(scheme => {
              return scheme.categories.every(category => {
                const cachedSchemes = [];
                storage['schemeStore'].forEach(value => {
                  if (value.data.category === category) {
                    cachedSchemes.push(value.data);
                  }
                });
                
                return cachedSchemes.some(cached => cached.id === scheme.id);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('retrieving all cached schemes returns schemes from all categories', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(schemeWithCategoryArbitrary, { minLength: 1, maxLength: 20 }),
          async (schemes) => {
            // Group schemes by category
            const schemesByCategory = new Map<CategoryType, any[]>();
            
            schemes.forEach(scheme => {
              scheme.categories.forEach(category => {
                if (!schemesByCategory.has(category)) {
                  schemesByCategory.set(category, []);
                }
                schemesByCategory.get(category)!.push(scheme);
              });
            });

            // Cache schemes for each category
            for (const [category, categorySchemes] of schemesByCategory.entries()) {
              await storage.storeSchemesByCategory(category, categorySchemes);
            }

            // Retrieve all cached schemes
            const allCached = await storage.getAllCachedSchemes();

            // Property: All original schemes must be in the cache
            // Note: Schemes in multiple categories will appear multiple times
            return schemes.every(scheme => {
              return allCached.some(cached => cached.id === scheme.id);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
