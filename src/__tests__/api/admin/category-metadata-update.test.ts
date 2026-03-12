/**
 * Unit tests for category metadata update API endpoint
 * PUT /api/admin/categories/:id
 * 
 * @jest-environment node
 */

import { PUT } from '@/app/api/admin/categories/[id]/route';
import { NextRequest } from 'next/server';
import { cacheInvalidationService } from '@/lib/services/cache-invalidation-service';

// Mock the cache invalidation service
jest.mock('@/lib/services/cache-invalidation-service', () => ({
  cacheInvalidationService: {
    invalidateAllSchemesCache: jest.fn(),
  },
}));

describe('/api/admin/categories/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT - Category Metadata Update', () => {
    it('should successfully update income range', async () => {
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
        message: 'All scheme cache invalidated successfully',
      };

      (cacheInvalidationService.invalidateAllSchemesCache as jest.Mock).mockResolvedValue(
        mockInvalidationResult
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: JSON.stringify({
            incomeRange: { min: 0, max: 300000 },
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Category metadata updated successfully');
      expect(data.data.categoryId).toBe('low-income-individual');
      expect(data.data.incomeRange).toEqual({ min: 0, max: 300000 });
      expect(cacheInvalidationService.invalidateAllSchemesCache).toHaveBeenCalled();
    });

    it('should successfully update digital literacy', async () => {
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
        message: 'All scheme cache invalidated successfully',
      };

      (cacheInvalidationService.invalidateAllSchemesCache as jest.Mock).mockResolvedValue(
        mockInvalidationResult
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/sme-scale',
        {
          method: 'PUT',
          body: JSON.stringify({
            digitalLiteracy: 'fully-digital',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'sme-scale' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.digitalLiteracy).toBe('fully-digital');
    });

    it('should successfully update description', async () => {
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
        message: 'All scheme cache invalidated successfully',
      };

      (cacheInvalidationService.invalidateAllSchemesCache as jest.Mock).mockResolvedValue(
        mockInvalidationResult
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/family-based',
        {
          method: 'PUT',
          body: JSON.stringify({
            description: 'Updated description for family-based artisans',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'family-based' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.description).toBe('Updated description for family-based artisans');
    });

    it('should successfully update multiple fields', async () => {
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
        message: 'All scheme cache invalidated successfully',
      };

      (cacheInvalidationService.invalidateAllSchemesCache as jest.Mock).mockResolvedValue(
        mockInvalidationResult
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/cooperative-cluster',
        {
          method: 'PUT',
          body: JSON.stringify({
            incomeRange: { min: 1000000, max: 5000000 },
            digitalLiteracy: 'semi-digital',
            description: 'Cooperative and cluster artisans',
            typicalBusinessScale: 'Cluster of 50+ artisans',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'cooperative-cluster' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.incomeRange).toEqual({ min: 1000000, max: 5000000 });
      expect(data.data.digitalLiteracy).toBe('semi-digital');
      expect(data.data.description).toBe('Cooperative and cluster artisans');
      expect(data.data.typicalBusinessScale).toBe('Cluster of 50+ artisans');
    });

    it('should reject invalid category ID', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/invalid-category',
        {
          method: 'PUT',
          body: JSON.stringify({
            description: 'Test',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'invalid-category' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toContain('Invalid category ID');
      expect(data.validCategories).toBeDefined();
    });

    it('should reject request with no fields to update', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('At least one field must be provided for update');
    });

    it('should reject invalid income range (non-numeric)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: JSON.stringify({
            incomeRange: { min: 'invalid', max: 300000 },
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Income range min and max must be numbers');
    });

    it('should reject negative income range minimum', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: JSON.stringify({
            incomeRange: { min: -1000, max: 300000 },
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Income range minimum cannot be negative');
    });

    it('should reject income range where max < min', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: JSON.stringify({
            incomeRange: { min: 500000, max: 300000 },
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe(
        'Income range maximum must be greater than or equal to minimum'
      );
    });

    it('should reject invalid digital literacy level', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/sme-scale',
        {
          method: 'PUT',
          body: JSON.stringify({
            digitalLiteracy: 'invalid-level',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'sme-scale' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toContain('Invalid digital literacy level');
      expect(data.validLevels).toBeDefined();
    });

    it('should reject empty description', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/family-based',
        {
          method: 'PUT',
          body: JSON.stringify({
            description: '   ',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'family-based' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Description cannot be empty');
    });

    it('should reject description exceeding 1000 characters', async () => {
      const longDescription = 'a'.repeat(1001);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/family-based',
        {
          method: 'PUT',
          body: JSON.stringify({
            description: longDescription,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'family-based' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Description cannot exceed 1000 characters');
    });

    it('should reject non-string description', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/family-based',
        {
          method: 'PUT',
          body: JSON.stringify({
            description: 12345,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'family-based' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Description must be a string');
    });

    it('should reject empty typical business scale', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/cooperative-cluster',
        {
          method: 'PUT',
          body: JSON.stringify({
            typicalBusinessScale: '   ',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'cooperative-cluster' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Typical business scale cannot be empty');
    });

    it('should handle cache invalidation errors gracefully', async () => {
      (cacheInvalidationService.invalidateAllSchemesCache as jest.Mock).mockResolvedValue({
        success: false,
        categoriesCleared: [],
        timestamp: Date.now(),
        message: 'Cache invalidation failed',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: JSON.stringify({
            description: 'Updated description',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      // Should still succeed even if cache invalidation fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cacheInvalidation.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories/low-income-individual',
        {
          method: 'PUT',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request, { params: { id: 'low-income-individual' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
    });
  });
});
