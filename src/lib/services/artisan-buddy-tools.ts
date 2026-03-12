/**
 * Artisan Buddy AI Tools
 * Functions that the AI can call to fetch real-time data
 */

import { salesDataService } from './sales-data-service';

export interface ArtisanBuddyTool {
    name: string;
    description: string;
    parameters: any;
    execute: (params: any) => Promise<any>;
}

/**
 * Tool: Get current sales from all stores
 */
export const getCurrentSalesTool: ArtisanBuddyTool = {
    name: 'get_current_sales',
    description: 'Fetches real-time sales data from all connected stores (Amazon, Instagram, Marketplace)',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'The user ID to fetch sales for',
            },
        },
    },
    execute: async ({ userId }) => {
        const sales = await salesDataService.getCurrentSales(userId);
        return {
            success: true,
            stores: sales,
            timestamp: new Date().toISOString(),
        };
    },
};

/**
 * Tool: Get aggregated sales across all stores
 */
export const getAggregatedSalesTool: ArtisanBuddyTool = {
    name: 'get_aggregated_sales',
    description: 'Fetches aggregated sales data with totals, top products, and store breakdown',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'The user ID to fetch sales for',
            },
        },
    },
    execute: async ({ userId }) => {
        const aggregated = await salesDataService.getAggregatedSales(userId);
        return {
            success: true,
            ...aggregated,
            timestamp: new Date().toISOString(),
        };
    },
};

/**
 * Tool: Format sales data for display
 */
export const formatSalesDataTool: ArtisanBuddyTool = {
    name: 'format_sales_data',
    description: 'Formats sales data into a user-friendly display format',
    parameters: {
        type: 'object',
        properties: {
            data: {
                type: 'object',
                description: 'The sales data to format',
            },
        },
    },
    execute: async ({ data }) => {
        const formatCurrency = (amount: number) => {
            return `₹${amount.toLocaleString('en-IN')}`;
        };

        const formatPercentage = (value: number, total: number) => {
            return `${Math.round((value / total) * 100)}%`;
        };

        if (data.storeBreakdown) {
            // Format aggregated data
            const total = data.totalRevenue;
            const storeBreakdown = data.storeBreakdown
                .map((store: any) => ({
                    name: store.storeName,
                    sales: formatCurrency(store.totalSales),
                    percentage: formatPercentage(store.totalSales, total),
                }));

            const topProducts = data.topProducts
                .slice(0, 5)
                .map((product: any, index: number) => ({
                    rank: index + 1,
                    name: product.productName,
                    quantity: product.quantity,
                    revenue: formatCurrency(product.revenue),
                }));

            return {
                formatted: true,
                overview: {
                    totalRevenue: formatCurrency(data.totalRevenue),
                    todayRevenue: formatCurrency(data.todayRevenue),
                    totalOrders: data.totalOrders,
                },
                stores: storeBreakdown,
                topProducts,
            };
        }

        return { formatted: false, data };
    },
};

/**
 * All available tools for Artisan Buddy
 */
export const artisanBuddyTools: ArtisanBuddyTool[] = [
    getCurrentSalesTool,
    getAggregatedSalesTool,
    formatSalesDataTool,
];

/**
 * Execute a tool by name
 */
export async function executeArtisanBuddyTool(
    toolName: string,
    parameters: any
): Promise<any> {
    const tool = artisanBuddyTools.find(t => t.name === toolName);

    if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
    }

    return await tool.execute(parameters);
}
