'use client';

import { useState } from 'react';
import { useSalesData } from '@/hooks/use-sales-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component showing how to integrate sales data into Artisan Buddy
 * This demonstrates the real-time sales fetching capability
 */
export function ArtisanBuddySalesIntegration() {
    const { loading, error, getAggregatedSales } = useSalesData();
    const [salesData, setSalesData] = useState<any>(null);

    const handleFetchSales = async () => {
        try {
            // In production, get userId from auth context
            const data = await getAggregatedSales();
            setSalesData(data);
        } catch (err) {
            console.error('Failed to fetch sales:', err);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Real-Time Sales Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={handleFetchSales}
                        disabled={loading}
                    >
                        {loading ? 'Fetching...' : 'Get Current Sales'}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-md">
                            Error: {error}
                        </div>
                    )}

                    {salesData && (
                        <div className="space-y-4">
                            {/* Overview */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(salesData.totalRevenue)}
                                        </div>
                                        <div className="text-sm text-gray-500">Total Revenue</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(salesData.todayRevenue)}
                                        </div>
                                        <div className="text-sm text-gray-500">Today's Sales</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Store Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">🏪 Store Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {salesData.storeBreakdown?.map((store: any) => (
                                            <div key={store.storeId} className="flex justify-between items-center">
                                                <span className="font-medium">{store.storeName}</span>
                                                <div className="text-right">
                                                    <div className="font-bold">{formatCurrency(store.totalSales)}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {Math.round((store.totalSales / salesData.totalRevenue) * 100)}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Products */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">🔥 Top Products</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {salesData.topProducts?.slice(0, 5).map((product: any, index: number) => (
                                            <div key={product.productId} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{product.productName}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.quantity} sold
                                                    </div>
                                                </div>
                                                <div className="font-bold">
                                                    {formatCurrency(product.revenue)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Integration Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use in Artisan Buddy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>The AI can now respond to queries like:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>"Show me my current sales"</li>
                        <li>"What are my sales today?"</li>
                        <li>"Which products are selling best?"</li>
                        <li>"How much revenue did I make?"</li>
                        <li>"Show sales breakdown by store"</li>
                    </ul>
                    <p className="mt-4 text-gray-600">
                        The steering file at <code className="bg-gray-100 px-1 rounded">.kiro/steering/sales-context.md</code>
                        {' '}provides context to the AI about when and how to fetch this data.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
