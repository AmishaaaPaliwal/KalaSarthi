import { useState, useCallback } from 'react';

interface SalesData {
    storeId: string;
    storeName: string;
    platform: string;
    totalSales: number;
    todaySales: number;
    currency: string;
    products: ProductSale[];
    lastUpdated: Date;
}

interface ProductSale {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    imageUrl?: string;
}

interface AggregatedSales {
    totalRevenue: number;
    todayRevenue: number;
    totalOrders: number;
    topProducts: ProductSale[];
    storeBreakdown: SalesData[];
}

export function useSalesData() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrentSales = useCallback(async (userId?: string): Promise<SalesData[]> => {
        setLoading(true);
        setError(null);

        try {
            const url = userId
                ? `/api/sales/current?userId=${userId}`
                : '/api/sales/current';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }

            const result = await response.json();
            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAggregatedSales = useCallback(async (userId?: string): Promise<AggregatedSales> => {
        setLoading(true);
        setError(null);

        try {
            const url = userId
                ? `/api/sales/aggregated?userId=${userId}`
                : '/api/sales/aggregated';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch aggregated sales');
            }

            const result = await response.json();
            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMarketplaceSales = useCallback(async (userId?: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/sales/marketplace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch marketplace sales');
            }

            return await response.json();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getCurrentSales,
        getAggregatedSales,
        getMarketplaceSales,
    };
}
