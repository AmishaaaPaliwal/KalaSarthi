/**
 * Admin API endpoint for scheme-category assignment
 * POST /api/admin/schemes/:id/categories
 * 
 * Allows administrators to assign schemes to one or more artisan categories.
 * Validates that at least one category is assigned and updates scheme metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CategoryType } from '@/types/artisan-categories';
import { cacheInvalidationService } from '@/lib/services/cache-invalidation-service';

// Valid category types
const VALID_CATEGORIES: CategoryType[] = [
  'low-income-individual',
  'family-based',
  'cooperative-cluster',
  'sme-scale',
  'export-oriented',
];

interface AssignCategoriesRequest {
  categories: CategoryType[];
}

/**
 * POST /api/admin/schemes/:id/categories
 * Assign categories to a scheme
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schemeId = params.id;

    // Parse request body
    const body: AssignCategoriesRequest = await request.json();
    const { categories } = body;

    // Validation: Check if categories array exists
    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Categories must be provided as an array',
        },
        { status: 400 }
      );
    }

    // Validation: At least one category must be assigned
    if (categories.length === 0) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Please assign this scheme to at least one artisan category',
        },
        { status: 400 }
      );
    }

    // Validation: All categories must be valid
    const invalidCategories = categories.filter(
      (cat) => !VALID_CATEGORIES.includes(cat)
    );

    if (invalidCategories.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `Invalid categories: ${invalidCategories.join(', ')}`,
          validCategories: VALID_CATEGORIES,
        },
        { status: 400 }
      );
    }

    // Validation: Check for duplicate categories
    const uniqueCategories = Array.from(new Set(categories));
    if (uniqueCategories.length !== categories.length) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Duplicate categories are not allowed',
        },
        { status: 400 }
      );
    }

    // TODO: In a real implementation, this would:
    // 1. Verify the scheme exists in the database
    // 2. Update the scheme's categories field
    // 4. Log the change for audit purposes
    
    // For now, we'll simulate a successful update
    const updatedScheme = {
      id: schemeId,
      categories: uniqueCategories,
      updatedAt: new Date().toISOString(),
    };

    // Trigger cache invalidation for affected categories
    const invalidationResult = await cacheInvalidationService.invalidateCategoriesCache(
      uniqueCategories
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Scheme categories updated successfully',
        data: updatedScheme,
        cacheInvalidation: invalidationResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating scheme categories:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update scheme categories',
      },
      { status: 500 }
    );
  }
}
