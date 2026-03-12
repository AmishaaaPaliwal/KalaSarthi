import { NextRequest, NextResponse } from 'next/server';
import { salesDataService } from '@/lib/services/sales-data-service';

/**
 * API Route: Get current sales data from all stores
 * GET /api/sales/current
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch real-time sales data
        const salesData = await salesDataService.getCurrentSales(userId || undefined);

        return NextResponse.json({
            success: true,
            data: salesData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching current sales:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch sales data',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
