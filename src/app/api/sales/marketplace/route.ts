import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * API Route: Get marketplace sales data from Firestore
 * POST /api/sales/marketplace
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        // Query Firestore for orders/sales
        const ordersRef = db.collection('orders');
        let query = ordersRef.where('status', '==', 'completed');

        if (userId) {
            query = query.where('sellerId', '==', userId);
        }

        const snapshot = await query.get();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalSales = 0;
        let todaySales = 0;
        const productMap = new Map<string, any>();

        snapshot.forEach(doc => {
            const order = doc.data();
            const orderDate = order.createdAt?.toDate() || new Date();
            const orderTotal = order.total || 0;

            totalSales += orderTotal;

            if (orderDate >= today) {
                todaySales += orderTotal;
            }

            // Aggregate products
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const key = item.productId;
                    if (productMap.has(key)) {
                        const existing = productMap.get(key);
                        existing.quantity += item.quantity || 1;
                        existing.revenue += item.price * (item.quantity || 1);
                    } else {
                        productMap.set(key, {
                            productId: item.productId,
                            productName: item.productName || item.name,
                            quantity: item.quantity || 1,
                            revenue: item.price * (item.quantity || 1),
                            imageUrl: item.imageUrl,
                        });
                    }
                });
            }
        });

        const products = Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 20);

        return NextResponse.json({
            success: true,
            totalSales,
            todaySales,
            products,
            orderCount: snapshot.size,
        });
    } catch (error) {
        console.error('Error fetching marketplace sales:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch marketplace sales',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
