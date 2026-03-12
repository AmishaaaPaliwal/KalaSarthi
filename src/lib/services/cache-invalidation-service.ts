/**
 * Cache Invalidation Service
 * 
 * Handles cache invalidation when scheme categories or category metadata
 * are updated by administrators. Clears offline cache and triggers sync
 * for affected users.
 */

import { CategoryType } from '@/types/artisan-categories';
import { offlineStorage } from '@/lib/offline-storage';

export interface CacheInvalidationResult {
  success: boolean;
  categoriesCleared: CategoryType[];
  timestamp: number;
  message: string;
}

/**
 * Cache Invalidation Service
 */
export class CacheInvalidationService {
  /**
   * Invalidate cache for specific categories
   * Called when scheme-category assignments change
   */
  async invalidateCategoriesCache(
    categories: CategoryType[]
  ): Promise<CacheInvalidationResult> {
    try {
      const timestamp = Date.now();
      const categoriesCleared: CategoryType[] = [];

      // Clear cache for each affected category
      for (const category of categories) {
        try {
          // Get schemes for this category
          const schemes = await offlineStorage.getSchemesByCategory(category);
          
          // Delete each scheme from cache
          for (const scheme of schemes) {
            const schemeId = `${category}-${scheme.id}`;
            await offlineStorage.deleteData('scheme', schemeId);
          }

          // Clear category metadata
          await offlineStorage.setSetting(`category-cache-${category}`, null);
          
          categoriesCleared.push(category);
        } catch (error) {
          console.error(`Failed to clear cache for category ${category}:`, error);
        }
      }

      // Set invalidation timestamp for sync tracking
      await offlineStorage.setSetting('cache-invalidation-timestamp', timestamp);

      // Trigger sync notification (in a real app, this would notify all connected clients)
      await this.triggerSyncNotification(categoriesCleared);

      return {
        success: true,
        categoriesCleared,
        timestamp,
        message: `Cache invalidated for ${categoriesCleared.length} categories`,
      };
    } catch (error) {
      console.error('Cache invalidation failed:', error);
      return {
        success: false,
        categoriesCleared: [],
        timestamp: Date.now(),
        message: 'Cache invalidation failed',
      };
    }
  }

  /**
   * Invalidate entire scheme cache
   * Called when category metadata is updated
   */
  async invalidateAllSchemesCache(): Promise<CacheInvalidationResult> {
    try {
      const timestamp = Date.now();

      // Clear all scheme cache
      await offlineStorage.clearSchemeCache();

      // Clear all category metadata
      const categories: CategoryType[] = [
        'low-income-individual',
        'family-based',
        'cooperative-cluster',
        'sme-scale',
        'export-oriented',
      ];

      for (const category of categories) {
        await offlineStorage.setSetting(`category-cache-${category}`, null);
      }

      // Set invalidation timestamp
      await offlineStorage.setSetting('cache-invalidation-timestamp', timestamp);

      // Trigger sync notification
      await this.triggerSyncNotification(categories);

      return {
        success: true,
        categoriesCleared: categories,
        timestamp,
        message: 'All scheme cache invalidated successfully',
      };
    } catch (error) {
      console.error('Full cache invalidation failed:', error);
      return {
        success: false,
        categoriesCleared: [],
        timestamp: Date.now(),
        message: 'Full cache invalidation failed',
      };
    }
  }

  /**
   * Check if cache needs refresh based on invalidation timestamp
   */
  async shouldRefreshCache(category: CategoryType): Promise<boolean> {
    try {
      // Get last invalidation timestamp
      const invalidationTimestamp = await offlineStorage.getSetting(
        'cache-invalidation-timestamp'
      );

      if (!invalidationTimestamp) {
        return false; // No invalidation has occurred
      }

      // Get category cache timestamp
      const cacheTimestamp = await offlineStorage.getCategorySyncTimestamp(category);

      if (!cacheTimestamp) {
        return true; // No cache exists, needs refresh
      }

      // If cache is older than invalidation, needs refresh
      return cacheTimestamp < invalidationTimestamp;
    } catch (error) {
      console.error('Error checking cache refresh status:', error);
      return true; // Default to refresh on error
    }
  }

  /**
   * Trigger sync notification for affected users
   * In a real implementation, this would use WebSockets, Server-Sent Events,
   * or push notifications to notify connected clients
   */
  private async triggerSyncNotification(categories: CategoryType[]): Promise<void> {
    try {
      // Store sync trigger in local storage for current session
      const syncTrigger = {
        categories,
        timestamp: Date.now(),
        message: `${categories.length} categories updated. Please sync to get latest schemes.`,
      };

      await offlineStorage.setSetting('pending-sync-trigger', syncTrigger);

      // In a real implementation, this would:
      // 1. Send WebSocket message to all connected clients
      // 2. Trigger push notification to offline users
      // 3. Update server-side sync queue
      // 4. Log sync trigger for analytics

      console.log('Sync notification triggered for categories:', categories);
    } catch (error) {
      console.error('Failed to trigger sync notification:', error);
    }
  }

  /**
   * Get pending sync trigger (for UI to display notification)
   */
  async getPendingSyncTrigger(): Promise<{
    categories: CategoryType[];
    timestamp: number;
    message: string;
  } | null> {
    try {
      const trigger = await offlineStorage.getSetting('pending-sync-trigger');
      return trigger || null;
    } catch (error) {
      console.error('Error getting pending sync trigger:', error);
      return null;
    }
  }

  /**
   * Clear pending sync trigger (after user acknowledges)
   */
  async clearPendingSyncTrigger(): Promise<void> {
    try {
      await offlineStorage.setSetting('pending-sync-trigger', null);
    } catch (error) {
      console.error('Error clearing pending sync trigger:', error);
    }
  }

  /**
   * Get cache invalidation statistics
   */
  async getCacheStats(): Promise<{
    lastInvalidation: number | null;
    categoryCacheStatus: Record<CategoryType, { exists: boolean; timestamp: number | null }>;
  }> {
    try {
      const lastInvalidation = await offlineStorage.getSetting(
        'cache-invalidation-timestamp'
      );

      const categories: CategoryType[] = [
        'low-income-individual',
        'family-based',
        'cooperative-cluster',
        'sme-scale',
        'export-oriented',
      ];

      const categoryCacheStatus: Record<
        CategoryType,
        { exists: boolean; timestamp: number | null }
      > = {} as any;

      for (const category of categories) {
        const timestamp = await offlineStorage.getCategorySyncTimestamp(category);
        categoryCacheStatus[category] = {
          exists: timestamp !== null,
          timestamp,
        };
      }

      return {
        lastInvalidation,
        categoryCacheStatus,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        lastInvalidation: null,
        categoryCacheStatus: {} as any,
      };
    }
  }
}

// Export singleton instance
export const cacheInvalidationService = new CacheInvalidationService();
