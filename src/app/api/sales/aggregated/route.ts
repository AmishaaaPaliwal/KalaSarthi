import { NextRequest, NextResponse } from 'next/server';
import { salesDataService } from '@/lib/services/sales-data-service';

/**
 * API Route: Get aggregated sales data across all stores
 * GET /api/sales/aggregated
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch aggregated sales data
        const aggregatedData = await salesDataService.getAggregatedSales(userId || undefined);

        return NextResponse.json({
            success: true,
            data: aggregatedData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching aggregated sales:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch aggregated sales data',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
