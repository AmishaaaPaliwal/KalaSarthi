/**
 * Unit tests for Cache Invalidation Service
 */

import { CacheInvalidationService } from '@/lib/services/cache-invalidation-service';
import { offlineStorage } from '@/lib/offline-storage';
import { CategoryType } from '@/types/artisan-categories';

// Mock the offline storage
jest.mock('@/lib/offline-storage', () => ({
  offlineStorage: {
    getSchemesByCategory: jest.fn(),
    deleteData: jest.fn(),
    setSetting: jest.fn(),
    getSetting: jest.fn(),
    clearSchemeCache: jest.fn(),
    getCategorySyncTimestamp: jest.fn(),
  },
}));

describe('CacheInvalidationService', () => {
  let service: CacheInvalidationService;

  beforeEach(() => {
    service = new CacheInvalidationService();
    jest.clearAllMocks();
  });

  describe('invalidateCategoriesCache', () => {
    it('should invalidate cache for specified categories', async () => {
      const mockSchemes = [
        { id: 'scheme-1', title: 'Scheme 1' },
        { id: 'scheme-2', title: 'Scheme 2' },
      ];

      (offlineStorage.getSchemesByCategory as jest.Mock).mockResolvedValue(mockSchemes);
      (offlineStorage.deleteData as jest.Mock).mockResolvedValue(undefined);
      (offlineStorage.setSetting as jest.Mock).mockResolvedValue(undefined);

      const categories: CategoryType[] = ['low-income-individual', 'family-based'];
      const result = await service.invalidateCategoriesCache(categories);

      expect(result.success).toBe(true);
      expect(result.categoriesCleared).toEqual(categories);
      expect(result.message).toContain('2 categories');

      // Should get schemes for each category
      expect(offlineStorage.getSchemesByCategory).toHaveBeenCalledTimes(2);
      expect(offlineStorage.getSchemesByCategory).toHaveBeenCalledWith('low-income-individual');
      expect(offlineStorage.getSchemesByCategory).toHaveBeenCalledWith('family-based');

      // Should delete each scheme (2 schemes × 2 categories = 4 deletes)
      expect(offlineStorage.deleteData).toHaveBeenCalledTimes(4);

      // Should clear category metadata for each category
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'category-cache-low-income-individual',
        null
      );
      expect(offlineStorage.setSetting).toHaveBeenCalledWith('category-cache-family-based', null);

      // Should set invalidation timestamp
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'cache-invalidation-timestamp',
        expect.any(Number)
      );

      // Should set pending sync trigger
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'pending-sync-trigger',
        expect.objectContaining({
          categories,
          timestamp: expect.any(Number),
          message: expect.any(String),
        })
      );
    });

    it('should handle empty categories array', async () => {
      const result = await service.invalidateCategoriesCache([]);

      expect(result.success).toBe(true);
      expect(result.categoriesCleared).toEqual([]);
      expect(offlineStorage.getSchemesByCategory).not.toHaveBeenCalled();
    });

    it('should continue on individual category errors', async () => {
      (offlineStorage.getSchemesByCategory as jest.Mock)
        .mockResolvedValueOnce([{ id: 'scheme-1' }])
        .mockRejectedValueOnce(new Error('Category error'));

      (offlineStorage.deleteData as jest.Mock).mockResolvedValue(undefined);
      (offlineStorage.setSetting as jest.Mock).mockResolvedValue(undefined);

      const categories: CategoryType[] = ['low-income-individual', 'family-based'];
      const result = await service.invalidateCategoriesCache(categories);

      expect(result.success).toBe(true);
      expect(result.categoriesCleared).toEqual(['low-income-individual']);
      // Should only clear the successful category
    });

    it('should handle storage errors gracefully', async () => {
      (offlineStorage.getSchemesByCategory as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const categories: CategoryType[] = ['low-income-individual'];
      const result = await service.invalidateCategoriesCache(categories);

      expect(result.success).toBe(true);
      expect(result.categoriesCleared).toEqual([]);
    });
  });

  describe('invalidateAllSchemesCache', () => {
    it('should clear all scheme cache and category metadata', async () => {
      (offlineStorage.clearSchemeCache as jest.Mock).mockResolvedValue(undefined);
      (offlineStorage.setSetting as jest.Mock).mockResolvedValue(undefined);

      const result = await service.invalidateAllSchemesCache();

      expect(result.success).toBe(true);
      expect(result.categoriesCleared).toHaveLength(5);
      expect(result.message).toBe('All scheme cache invalidated successfully');

      // Should clear all scheme cache
      expect(offlineStorage.clearSchemeCache).toHaveBeenCalled();

      // Should clear metadata for all 5 categories
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'category-cache-low-income-individual',
        null
      );
      expect(offlineStorage.setSetting).toHaveBeenCalledWith('category-cache-family-based', null);
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'category-cache-cooperative-cluster',
        null
      );
      expect(offlineStorage.setSetting).toHaveBeenCalledWith('category-cache-sme-scale', null);
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'category-cache-export-oriented',
        null
      );

      // Should set invalidation timestamp
      expect(offlineStorage.setSetting).toHaveBeenCalledWith(
        'cache-invalidation-timestamp',
        expect.any(Number)
      );
    });

    it('should handle cache clear errors', async () => {
      (offlineStorage.clearSchemeCache as jest.Mock).mockRejectedValue(
        new Error('Clear error')
      );

      const result = await service.invalidateAllSchemesCache();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Full cache invalidation failed');
    });
  });

  describe('shouldRefreshCache', () => {
    it('should return false when no invalidation has occurred', async () => {
      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(null);

      const result = await service.shouldRefreshCache('low-income-individual');

      expect(result).toBe(false);
    });

    it('should return true when no cache exists', async () => {
      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(Date.now());
      (offlineStorage.getCategorySyncTimestamp as jest.Mock).mockResolvedValue(null);

      const result = await service.shouldRefreshCache('low-income-individual');

      expect(result).toBe(true);
    });

    it('should return true when cache is older than invalidation', async () => {
      const invalidationTime = Date.now();
      const cacheTime = invalidationTime - 10000; // 10 seconds older

      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(invalidationTime);
      (offlineStorage.getCategorySyncTimestamp as jest.Mock).mockResolvedValue(cacheTime);

      const result = await service.shouldRefreshCache('low-income-individual');

      expect(result).toBe(true);
    });

    it('should return false when cache is newer than invalidation', async () => {
      const invalidationTime = Date.now() - 10000;
      const cacheTime = Date.now(); // Newer

      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(invalidationTime);
      (offlineStorage.getCategorySyncTimestamp as jest.Mock).mockResolvedValue(cacheTime);

      const result = await service.shouldRefreshCache('low-income-individual');

      expect(result).toBe(false);
    });

    it('should return true on error', async () => {
      (offlineStorage.getSetting as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await service.shouldRefreshCache('low-income-individual');

      expect(result).toBe(true);
    });
  });

  describe('getPendingSyncTrigger', () => {
    it('should return pending sync trigger', async () => {
      const mockTrigger = {
        categories: ['low-income-individual'],
        timestamp: Date.now(),
        message: 'Test message',
      };

      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(mockTrigger);

      const result = await service.getPendingSyncTrigger();

      expect(result).toEqual(mockTrigger);
      expect(offlineStorage.getSetting).toHaveBeenCalledWith('pending-sync-trigger');
    });

    it('should return null when no trigger exists', async () => {
      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(null);

      const result = await service.getPendingSyncTrigger();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (offlineStorage.getSetting as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await service.getPendingSyncTrigger();

      expect(result).toBeNull();
    });
  });

  describe('clearPendingSyncTrigger', () => {
    it('should clear pending sync trigger', async () => {
      (offlineStorage.setSetting as jest.Mock).mockResolvedValue(undefined);

      await service.clearPendingSyncTrigger();

      expect(offlineStorage.setSetting).toHaveBeenCalledWith('pending-sync-trigger', null);
    });

    it('should handle errors gracefully', async () => {
      (offlineStorage.setSetting as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(service.clearPendingSyncTrigger()).resolves.toBeUndefined();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const invalidationTime = Date.now();
      const categoryTimestamps = {
        'low-income-individual': Date.now() - 1000,
        'family-based': Date.now() - 2000,
        'cooperative-cluster': null,
        'sme-scale': Date.now() - 3000,
        'export-oriented': Date.now() - 4000,
      };

      (offlineStorage.getSetting as jest.Mock).mockResolvedValue(invalidationTime);
      (offlineStorage.getCategorySyncTimestamp as jest.Mock).mockImplementation(
        (category: CategoryType) => Promise.resolve(categoryTimestamps[category])
      );

      const result = await service.getCacheStats();

      expect(result.lastInvalidation).toBe(invalidationTime);
      expect(result.categoryCacheStatus['low-income-individual'].exists).toBe(true);
      expect(result.categoryCacheStatus['cooperative-cluster'].exists).toBe(false);
      expect(result.categoryCacheStatus['cooperative-cluster'].timestamp).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (offlineStorage.getSetting as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await service.getCacheStats();

      expect(result.lastInvalidation).toBeNull();
      expect(result.categoryCacheStatus).toEqual({});
    });
  });
});
