/**
 * Unit tests for scheme-category assignment API endpoint
 * POST /api/admin/schemes/:id/categories
 * 
 * @jest-environment node
 */

import { POST } from '@/app/api/admin/schemes/[id]/categories/route';
import { NextRequest } from 'next/server';
import { cacheInvalidationService } from '@/lib/services/cache-invalidation-service';

// Mock the cache invalidation service
jest.mock('@/lib/services/cache-invalidation-service', () => ({
  cacheInvalidationService: {
    invalidateCategoriesCache: jest.fn(),
  },
}));

describe('/api/admin/schemes/:id/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST - Category Assignment', () => {
    it('should successfully assign categories to a scheme', async () => {
      const mockInvalidationResult = {
        success: true,
        categoriesCleared: ['low-income-individual', 'family-based'],
        timestamp: Date.now(),
        message: 'Cache invalidated for 2 categories',
      };

      (cacheInvalidationService.invalidateCategoriesCache as jest.Mock).mockResolvedValue(
        mockInvalidationResult
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            categories: ['low-income-individual', 'family-based'],
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Scheme categories updated successfully');
      expect(data.data.id).toBe('pm-vishwakarma');
      expect(data.data.categories).toEqual(['low-income-individual', 'family-based']);
      expect(data.cacheInvalidation).toEqual(mockInvalidationResult);
      expect(cacheInvalidationService.invalidateCategoriesCache).toHaveBeenCalledWith([
        'low-income-individual',
        'family-based',
      ]);
    });

    it('should reject request with missing categories array', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Categories must be provided as an array');
    });

    it('should reject request with empty categories array', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            categories: [],
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Please assign this scheme to at least one artisan category');
    });

    it('should reject request with invalid category types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            categories: ['low-income-individual', 'invalid-category'],
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toContain('Invalid categories: invalid-category');
      expect(data.validCategories).toBeDefined();
    });

    it('should reject request with duplicate categories', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            categories: ['low-income-individual', 'low-income-individual'],
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Duplicate categories are not allowed');
    });

    it('should handle all valid category types', async () => {
      const mockInvalidationResult = {
        success: true,
        categoriesCleared: [
          'low-income-individual',
          'family-based',
          'cooperative-cluster',
          'sme-scale',
          'export-oriented',
        ],
        timestamp: Date.now(),
        message: 'Cache invalidated for 5 categories',
      };

      (cacheInvalidationService.invalidateCategoriesCache as jest.Mock).mockResolvedValue(
        mockInvalidationResult
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/universal-scheme/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            categories: [
              'low-income-individual',
              'family-based',
              'cooperative-cluster',
              'sme-scale',
              'export-oriented',
            ],
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'universal-scheme' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.categories).toHaveLength(5);
    });

    it('should handle cache invalidation errors gracefully', async () => {
      (cacheInvalidationService.invalidateCategoriesCache as jest.Mock).mockResolvedValue({
        success: false,
        categoriesCleared: [],
        timestamp: Date.now(),
        message: 'Cache invalidation failed',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            categories: ['low-income-individual'],
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      // Should still succeed even if cache invalidation fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cacheInvalidation.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/schemes/pm-vishwakarma/categories',
        {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, { params: { id: 'pm-vishwakarma' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
    });
  });
});
