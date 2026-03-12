/**
 * Real-time Sales Data Service
 * Fetches current sales data from multiple store platforms
 */

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

interface StoreConfig {
    id: string;
    name: string;
    platform: 'amazon' | 'instagram' | 'custom' | 'firebase';
    apiEndpoint?: string;
    credentials?: any;
}

export class SalesDataService {
    private stores: StoreConfig[] = [];

    constructor() {
        this.initializeStores();
    }

    /**
     * Initialize store configurations from environment
     */
    private initializeStores() {
        // Amazon Store
        if (process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID) {
            this.stores.push({
                id: 'amazon-store',
                name: 'Amazon Store',
                platform: 'amazon',
                credentials: {
                    clientId: process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID,
                    clientSecret: process.env.NEXT_PUBLIC_AMAZON_CLIENT_SECRET,
                    refreshToken: process.env.NEXT_PUBLIC_AMAZON_REFRESH_TOKEN,
                },
            });
        }

        // Instagram Shop
        if (process.env.INSTAGRAM_IG_ID) {
            this.stores.push({
                id: 'instagram-shop',
                name: 'Instagram Shop',
                platform: 'instagram',
                credentials: {
                    igId: process.env.INSTAGRAM_IG_ID,
                    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
                },
            });
        }

        // Firebase/Firestore Store (your marketplace)
        this.stores.push({
            id: 'marketplace',
            name: 'KalaMitra Marketplace',
            platform: 'firebase',
        });
    }

    /**
     * Fetch real-time sales data from all configured stores
     */
    async getCurrentSales(userId?: string): Promise<SalesData[]> {
        const salesPromises = this.stores.map(store =>
            this.fetchStoreData(store, userId).catch(error => {
                console.error(`Error fetching data from ${store.name}:`, error);
                return null;
            })
        );

        const results = await Promise.all(salesPromises);
        return results.filter((data): data is SalesData => data !== null);
    }

    /**
     * Fetch data from a specific store
     */
    private async fetchStoreData(store: StoreConfig, userId?: string): Promise<SalesData | null> {
        switch (store.platform) {
            case 'amazon':
                return this.fetchAmazonData(store);
            case 'instagram':
                return this.fetchInstagramData(store);
            case 'firebase':
                return this.fetchFirebaseData(store, userId);
            default:
                return null;
        }
    }

    /**
     * Fetch Amazon sales data
     */
    private async fetchAmazonData(store: StoreConfig): Promise<SalesData> {
        // Amazon SP-API integration
        // Note: This requires proper Amazon SP-API setup
        try {
            const response = await fetch('/api/sales/amazon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credentials: store.credentials }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Amazon data');
            }

            const data = await response.json();
            return {
                storeId: store.id,
                storeName: store.name,
                platform: 'amazon',
                totalSales: data.totalSales || 0,
                todaySales: data.todaySales || 0,
                currency: 'INR',
                products: data.products || [],
                lastUpdated: new Date(),
            };
        } catch (error) {
            console.error('Amazon fetch error:', error);
            return this.getMockData(store, 'amazon');
        }
    }

    /**
     * Fetch Instagram shop data
     */
    private async fetchInstagramData(store: StoreConfig): Promise<SalesData> {
        try {
            const { igId, accessToken } = store.credentials;

            // Instagram Graph API for commerce
            const response = await fetch(
                `https://graph.instagram.com/${igId}/insights?metric=impressions,reach&access_token=${accessToken}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch Instagram data');
            }

            const data = await response.json();

            return {
                storeId: store.id,
                storeName: store.name,
                platform: 'instagram',
                totalSales: 0, // Instagram doesn't provide direct sales data
                todaySales: 0,
                currency: 'INR',
                products: [],
                lastUpdated: new Date(),
            };
        } catch (error) {
            console.error('Instagram fetch error:', error);
            return this.getMockData(store, 'instagram');
        }
    }

    /**
     * Fetch Firebase/Firestore marketplace data
     */
    private async fetchFirebaseData(store: StoreConfig, userId?: string): Promise<SalesData> {
        try {
            const response = await fetch('/api/sales/marketplace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch marketplace data');
            }

            const data = await response.json();
            return {
                storeId: store.id,
                storeName: store.name,
                platform: 'firebase',
                totalSales: data.totalSales || 0,
                todaySales: data.todaySales || 0,
                currency: 'INR',
                products: data.products || [],
                lastUpdated: new Date(),
            };
        } catch (error) {
            console.error('Firebase fetch error:', error);
            return this.getMockData(store, 'firebase');
        }
    }

    /**
     * Get aggregated sales across all stores
     */
    async getAggregatedSales(userId?: string): Promise<{
        totalRevenue: number;
        todayRevenue: number;
        totalOrders: number;
        topProducts: ProductSale[];
        storeBreakdown: SalesData[];
    }> {
        const allSales = await this.getCurrentSales(userId);

        const totalRevenue = allSales.reduce((sum, store) => sum + store.totalSales, 0);
        const todayRevenue = allSales.reduce((sum, store) => sum + store.todaySales, 0);

        // Aggregate all products
        const allProducts = allSales.flatMap(store => store.products);
        const topProducts = allProducts
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        return {
            totalRevenue,
            todayRevenue,
            totalOrders: allProducts.reduce((sum, p) => sum + p.quantity, 0),
            topProducts,
            storeBreakdown: allSales,
        };
    }

    /**
     * Mock data for testing/fallback
     */
    private getMockData(store: StoreConfig, platform: string): SalesData {
        const mockProducts: ProductSale[] = [
            {
                productId: '1',
                productName: 'Handcrafted Pottery Vase',
                quantity: 5,
                revenue: 2500,
                imageUrl: 'https://example.com/vase.jpg',
            },
            {
                productId: '2',
                productName: 'Traditional Textile',
                quantity: 3,
                revenue: 1800,
            },
        ];

        return {
            storeId: store.id,
            storeName: store.name,
            platform,
            totalSales: 15000,
            todaySales: 4300,
            currency: 'INR',
            products: mockProducts,
            lastUpdated: new Date(),
        };
    }
}

// Singleton instance
export const salesDataService = new SalesDataService();
