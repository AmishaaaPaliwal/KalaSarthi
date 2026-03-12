/**
 * Admin API endpoint for category metadata updates
 * PUT /api/admin/categories/:id
 * 
 * Allows administrators to update category metadata including
 * income range, digital literacy level, and description.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CategoryType, DigitalLiteracy } from '@/types/artisan-categories';
import { cacheInvalidationService } from '@/lib/services/cache-invalidation-service';

// Valid category types
const VALID_CATEGORIES: CategoryType[] = [
  'low-income-individual',
  'family-based',
  'cooperative-cluster',
  'sme-scale',
  'export-oriented',
];

// Valid digital literacy levels
const VALID_DIGITAL_LITERACY: DigitalLiteracy[] = [
  'digitally-unaware',
  'semi-digital',
  'fully-digital',
];

interface UpdateCategoryMetadataRequest {
  incomeRange?: {
    min: number;
    max: number;
  };
  digitalLiteracy?: DigitalLiteracy;
  description?: string;
  typicalBusinessScale?: string;
}

/**
 * PUT /api/admin/categories/:id
 * Update category metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id as CategoryType;

    // Validation: Check if category ID is valid
    if (!VALID_CATEGORIES.includes(categoryId)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `Invalid category ID: ${categoryId}`,
          validCategories: VALID_CATEGORIES,
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateCategoryMetadataRequest = await request.json();
    const { incomeRange, digitalLiteracy, description, typicalBusinessScale } = body;

    // Validation: At least one field must be provided
    if (!incomeRange && !digitalLiteracy && !description && !typicalBusinessScale) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'At least one field must be provided for update',
        },
        { status: 400 }
      );
    }

    // Validation: Income range
    if (incomeRange) {
      if (typeof incomeRange.min !== 'number' || typeof incomeRange.max !== 'number') {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Income range min and max must be numbers',
          },
          { status: 400 }
        );
      }

      if (incomeRange.min < 0) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Income range minimum cannot be negative',
          },
          { status: 400 }
        );
      }

      if (incomeRange.max < incomeRange.min) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Income range maximum must be greater than or equal to minimum',
          },
          { status: 400 }
        );
      }
    }

    // Validation: Digital literacy
    if (digitalLiteracy && !VALID_DIGITAL_LITERACY.includes(digitalLiteracy)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `Invalid digital literacy level: ${digitalLiteracy}`,
          validLevels: VALID_DIGITAL_LITERACY,
        },
        { status: 400 }
      );
    }

    // Validation: Description
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Description must be a string',
          },
          { status: 400 }
        );
      }

      if (description.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Description cannot be empty',
          },
          { status: 400 }
        );
      }

      if (description.length > 1000) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Description cannot exceed 1000 characters',
          },
          { status: 400 }
        );
      }
    }

    // Validation: Typical business scale
    if (typicalBusinessScale !== undefined) {
      if (typeof typicalBusinessScale !== 'string') {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Typical business scale must be a string',
          },
          { status: 400 }
        );
      }

      if (typicalBusinessScale.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Typical business scale cannot be empty',
          },
          { status: 400 }
        );
      }
    }

    // TODO: In a real implementation, this would:
    // 1. Fetch current category metadata from database
    // 2. Update the specified fields
    // 3. Validate business rules (e.g., income ranges don't overlap incorrectly)
    // 4. Save to database
    // 6. Log the change for audit purposes

    // For now, we'll simulate a successful update
    const updatedMetadata = {
      categoryId,
      ...(incomeRange && { incomeRange }),
      ...(digitalLiteracy && { digitalLiteracy }),
      ...(description && { description }),
      ...(typicalBusinessScale && { typicalBusinessScale }),
      updatedAt: new Date().toISOString(),
    };

    // Trigger cache invalidation for this category
    // When category metadata changes, we invalidate all schemes cache
    // to ensure consistency
    const invalidationResult = await cacheInvalidationService.invalidateAllSchemesCache();

    return NextResponse.json(
      {
        success: true,
        message: 'Category metadata updated successfully',
        data: updatedMetadata,
        cacheInvalidation: invalidationResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category metadata:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update category metadata',
      },
      { status: 500 }
    );
  }
}
