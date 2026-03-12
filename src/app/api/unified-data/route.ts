import { NextRequest, NextResponse } from 'next/server';
import { unifiedDataService } from '@/lib/services/unified-data-service';

/**
 * API Route: Get unified contextual data
 * POST /api/unified-data
 */
export async function POST(request: NextRequest) {
    try {
        const { query, userId } = await request.json();

        if (!query || !userId) {
            return NextResponse.json(
                { error: 'Query and userId are required' },
                { status: 400 }
            );
        }

        const data = await unifiedDataService.fetchContextualData(query, userId);

        return NextResponse.json({
            success: true,
            ...data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching unified data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch data',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * GET: Test endpoint
 */
export async function GET() {
    return NextResponse.json({
        message: 'Unified Data API',
        features: [
            'Sales Data',
            'Scheme Sahayak',
            'Buyer Connect',
            'Inventory Management',
            'Marketplace',
            'Profile & Portfolio',
        ],
        usage: 'POST with { query, userId }',
    });
}
