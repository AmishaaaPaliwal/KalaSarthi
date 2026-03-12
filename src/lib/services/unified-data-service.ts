/**
 * Unified Data Service - Agentic RAG Pipeline
 * Fetches real-time data from all application features
 */

import { salesDataService } from './sales-data-service';
import { db } from '@/lib/firebase-admin';

export interface UnifiedDataContext {
    userId: string;
    feature?: string;
    language?: string;
}

export interface SchemeData {
    eligibleSchemes: any[];
    appliedSchemes: any[];
    recommendations: any[];
}

export interface BuyerConnectData {
    connections: any[];
    messages: any[];
    opportunities: any[];
    stats: {
        totalConnections: number;
        activeChats: number;
        pendingRequests: number;
    };
}

export interface InventoryData {
    products: any[];
    lowStock: any[];
    outOfStock: any[];
    stats: {
        totalProducts: number;
        totalValue: number;
        lowStockCount: number;
    };
}

export interface MarketplaceData {
    listings: any[];
    orders: any[];
    reviews: any[];
    stats: {
        totalListings: number;
        activeOrders: number;
        averageRating: number;
    };
}

export interface ProfileData {
    artisan: any;
    skills: string[];
    certifications: any[];
    portfolio: any[];
}

export class UnifiedDataService {
    /**
     * Fetch scheme-related data
     */
    static async getSchemeData(userId: string): Promise<SchemeData> {
        try {
            console.log('📋 Fetching scheme data for user:', userId);

            // Fetch user profile for eligibility
            const profileDoc = await db.collection('artisan_profiles').doc(userId).get();
            const profile = profileDoc.data();

            // Fetch applied schemes
            const appliedSnapshot = await db
                .collection('scheme_applications')
                .where('userId', '==', userId)
                .get();

            const appliedSchemes = appliedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch all available schemes
            const schemesSnapshot = await db.collection('government_schemes').get();
            const allSchemes = schemesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Filter eligible schemes based on profile
            const eligibleSchemes = allSchemes.filter(scheme => {
                if (!profile) return false;

                // Check eligibility criteria
                const meetsAge = !scheme.ageLimit || (profile.age && profile.age <= scheme.ageLimit);
                const meetsIncome = !scheme.incomeLimit || (profile.annualIncome && profile.annualIncome <= scheme.incomeLimit);
                const meetsCategory = !scheme.category || profile.category === scheme.category;

                return meetsAge && meetsIncome && meetsCategory;
            });

            // Generate recommendations
            const recommendations = eligibleSchemes
                .filter(scheme => !appliedSchemes.find(app => app.schemeId === scheme.id))
                .slice(0, 5);

            return {
                eligibleSchemes,
                appliedSchemes,
                recommendations,
            };
        } catch (error) {
            console.error('❌ Error fetching scheme data:', error);
            return {
                eligibleSchemes: [],
                appliedSchemes: [],
                recommendations: [],
            };
        }
    }

    /**
     * Fetch buyer connect data
     */
    static async getBuyerConnectData(userId: string): Promise<BuyerConnectData> {
        try {
            console.log('🤝 Fetching buyer connect data for user:', userId);

            // Fetch connections
            const connectionsSnapshot = await db
                .collection('buyer_connections')
                .where('artisanId', '==', userId)
                .get();

            const connections = connectionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch messages
            const messagesSnapshot = await db
                .collection('buyer_messages')
                .where('artisanId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();

            const messages = messagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch opportunities
            const opportunitiesSnapshot = await db
                .collection('buyer_opportunities')
                .where('status', '==', 'open')
                .limit(10)
                .get();

            const opportunities = opportunitiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Calculate stats
            const activeChats = messages.filter(m =>
                m.status === 'active' && !m.read
            ).length;

            const pendingRequests = connections.filter(c =>
                c.status === 'pending'
            ).length;

            return {
                connections,
                messages,
                opportunities,
                stats: {
                    totalConnections: connections.length,
                    activeChats,
                    pendingRequests,
                },
            };
        } catch (error) {
            console.error('❌ Error fetching buyer connect data:', error);
            return {
                connections: [],
                messages: [],
                opportunities: [],
                stats: {
                    totalConnections: 0,
                    activeChats: 0,
                    pendingRequests: 0,
                },
            };
        }
    }

    /**
     * Fetch inventory data
     */
    static async getInventoryData(userId: string): Promise<InventoryData> {
        try {
            console.log('📦 Fetching inventory data for user:', userId);

            // Fetch all products
            const productsSnapshot = await db
                .collection('products')
                .where('userId', '==', userId)
                .get();

            const products = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Filter low stock and out of stock
            const lowStock = products.filter(p =>
                p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)
            );

            const outOfStock = products.filter(p => p.stock === 0);

            // Calculate total value
            const totalValue = products.reduce((sum, p) =>
                sum + (p.price * p.stock), 0
            );

            return {
                products,
                lowStock,
                outOfStock,
                stats: {
                    totalProducts: products.length,
                    totalValue,
                    lowStockCount: lowStock.length,
                },
            };
        } catch (error) {
            console.error('❌ Error fetching inventory data:', error);
            return {
                products: [],
                lowStock: [],
                outOfStock: [],
                stats: {
                    totalProducts: 0,
                    totalValue: 0,
                    lowStockCount: 0,
                },
            };
        }
    }

    /**
     * Fetch marketplace data
     */
    static async getMarketplaceData(userId: string): Promise<MarketplaceData> {
        try {
            console.log('🛍️ Fetching marketplace data for user:', userId);

            // Fetch listings
            const listingsSnapshot = await db
                .collection('marketplace_listings')
                .where('sellerId', '==', userId)
                .get();

            const listings = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch orders
            const ordersSnapshot = await db
                .collection('orders')
                .where('sellerId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            const orders = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch reviews
            const reviewsSnapshot = await db
                .collection('reviews')
                .where('sellerId', '==', userId)
                .get();

            const reviews = reviewsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Calculate average rating
            const averageRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
                : 0;

            const activeOrders = orders.filter(o =>
                o.status === 'pending' || o.status === 'processing'
            ).length;

            return {
                listings,
                orders,
                reviews,
                stats: {
                    totalListings: listings.length,
                    activeOrders,
                    averageRating,
                },
            };
        } catch (error) {
            console.error('❌ Error fetching marketplace data:', error);
            return {
                listings: [],
                orders: [],
                reviews: [],
                stats: {
                    totalListings: 0,
                    activeOrders: 0,
                    averageRating: 0,
                },
            };
        }
    }

    /**
     * Fetch profile data
     */
    static async getProfileData(userId: string): Promise<ProfileData> {
        try {
            console.log('👤 Fetching profile data for user:', userId);

            const profileDoc = await db.collection('artisan_profiles').doc(userId).get();
            const artisan = profileDoc.exists ? profileDoc.data() : null;

            // Fetch skills
            const skillsSnapshot = await db
                .collection('artisan_skills')
                .where('userId', '==', userId)
                .get();

            const skills = skillsSnapshot.docs.map(doc => doc.data().skill);

            // Fetch certifications
            const certsSnapshot = await db
                .collection('certifications')
                .where('userId', '==', userId)
                .get();

            const certifications = certsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch portfolio
            const portfolioSnapshot = await db
                .collection('portfolio')
                .where('userId', '==', userId)
                .get();

            const portfolio = portfolioSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return {
                artisan,
                skills,
                certifications,
                portfolio,
            };
        } catch (error) {
            console.error('❌ Error fetching profile data:', error);
            return {
                artisan: null,
                skills: [],
                certifications: [],
                portfolio: [],
            };
        }
    }

    /**
     * Main method: Fetch all relevant data based on query context
     */
    static async fetchContextualData(
        query: string,
        userId: string
    ): Promise<any> {
        const lowerQuery = query.toLowerCase();
        const data: any = {};

        // Detect which features are relevant to the query
        const needsSales = this.detectSalesQuery(lowerQuery);
        const needsSchemes = this.detectSchemeQuery(lowerQuery);
        const needsBuyerConnect = this.detectBuyerConnectQuery(lowerQuery);
        const needsInventory = this.detectInventoryQuery(lowerQuery);
        const needsMarketplace = this.detectMarketplaceQuery(lowerQuery);
        const needsProfile = this.detectProfileQuery(lowerQuery);

        // Fetch data in parallel for better performance
        const promises: Promise<any>[] = [];

        if (needsSales) {
            promises.push(
                salesDataService.getAggregatedSales(userId)
                    .then(result => { data.sales = result; })
                    .catch(err => console.error('Sales fetch error:', err))
            );
        }

        if (needsSchemes) {
            promises.push(
                this.getSchemeData(userId)
                    .then(result => { data.schemes = result; })
                    .catch(err => console.error('Schemes fetch error:', err))
            );
        }

        if (needsBuyerConnect) {
            promises.push(
                this.getBuyerConnectData(userId)
                    .then(result => { data.buyerConnect = result; })
                    .catch(err => console.error('Buyer connect fetch error:', err))
            );
        }

        if (needsInventory) {
            promises.push(
                this.getInventoryData(userId)
                    .then(result => { data.inventory = result; })
                    .catch(err => console.error('Inventory fetch error:', err))
            );
        }

        if (needsMarketplace) {
            promises.push(
                this.getMarketplaceData(userId)
                    .then(result => { data.marketplace = result; })
                    .catch(err => console.error('Marketplace fetch error:', err))
            );
        }

        if (needsProfile) {
            promises.push(
                this.getProfileData(userId)
                    .then(result => { data.profile = result; })
                    .catch(err => console.error('Profile fetch error:', err))
            );
        }

        // Wait for all data to be fetched
        await Promise.all(promises);

        return {
            hasData: Object.keys(data).length > 0,
            features: Object.keys(data),
            data,
        };
    }

    // Detection methods
    private static detectSalesQuery(query: string): boolean {
        const keywords = [
            'sales', 'revenue', 'sell', 'sold', 'earning', 'income',
            'profit', 'order', 'बिक्री', 'आय', 'कमाई'
        ];
        return keywords.some(k => query.includes(k));
    }

    private static detectSchemeQuery(query: string): boolean {
        const keywords = [
            'scheme', 'yojana', 'योजना', 'government', 'सरकार',
            'subsidy', 'grant', 'loan', 'ऋण', 'सब्सिडी'
        ];
        return keywords.some(k => query.includes(k));
    }

    private static detectBuyerConnectQuery(query: string): boolean {
        const keywords = [
            'buyer', 'customer', 'connection', 'message', 'chat',
            'खरीदार', 'ग्राहक', 'संपर्क', 'मैसेज'
        ];
        return keywords.some(k => query.includes(k));
    }

    private static detectInventoryQuery(query: string): boolean {
        const keywords = [
            'inventory', 'stock', 'product', 'item', 'इन्वेंटरी',
            'स्टॉक', 'उत्पाद', 'सामान', 'माल'
        ];
        return keywords.some(k => query.includes(k));
    }

    private static detectMarketplaceQuery(query: string): boolean {
        const keywords = [
            'marketplace', 'listing', 'review', 'rating',
            'बाजार', 'लिस्टिंग', 'समीक्षा', 'रेटिंग'
        ];
        return keywords.some(k => query.includes(k));
    }

    private static detectProfileQuery(query: string): boolean {
        const keywords = [
            'profile', 'skill', 'certification', 'portfolio',
            'प्रोफाइल', 'कौशल', 'प्रमाणपत्र', 'पोर्टफोलियो'
        ];
        return keywords.some(k => query.includes(k));
    }
}

export const unifiedDataService = UnifiedDataService;
