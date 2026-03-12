# Real-Time Sales Data Integration for Artisan Buddy

## Overview

This implementation provides real-time sales data fetching from multiple store platforms (Amazon, Instagram, KalaMitra Marketplace) with agentic RAG context for the Artisan Buddy AI assistant.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Artisan Buddy AI                        │
│                  (with RAG Context)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Reads steering context
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          .kiro/steering/sales-context.md                    │
│     (Instructions for when/how to fetch sales data)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Triggers API calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Endpoints                            │
│  • /api/sales/current      - All stores                     │
│  • /api/sales/aggregated   - Combined totals                │
│  • /api/sales/marketplace  - Marketplace only               │
│  • /api/sales/amazon       - Amazon only                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SalesDataService                               │
│     (Fetches from multiple platforms)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌──────────┐  ┌──────────┐
   │ Amazon │  │Instagram │  │Firestore │
   │   API  │  │   API    │  │   DB     │
   └────────┘  └──────────┘  └──────────┘
```

## Files Created

### 1. Core Service
- **`src/lib/services/sales-data-service.ts`**
  - Main service that fetches data from all platforms
  - Handles Amazon, Instagram, and Firestore marketplace
  - Provides aggregation and formatting

### 2. API Routes
- **`src/app/api/sales/current/route.ts`**
  - GET endpoint for current sales from all stores
  - Query param: `userId` (optional)

- **`src/app/api/sales/aggregated/route.ts`**
  - GET endpoint for aggregated sales data
  - Returns totals, top products, store breakdown

- **`src/app/api/sales/marketplace/route.ts`**
  - POST endpoint for marketplace-only sales
  - Queries Firestore orders collection

- **`src/app/api/sales/amazon/route.ts`**
  - POST endpoint for Amazon sales
  - Currently returns mock data (SP-API integration pending)

### 3. AI Tools
- **`src/lib/services/artisan-buddy-tools.ts`**
  - Defines tools the AI can call
  - Includes formatting utilities
  - Provides structured function calling interface

- **`src/app/api/artisan-buddy/tools/route.ts`**
  - API endpoint for executing AI tools
  - GET: List available tools
  - POST: Execute a specific tool

### 4. React Integration
- **`src/hooks/use-sales-data.ts`**
  - React hook for fetching sales data
  - Handles loading and error states
  - Provides clean API for components

- **`src/components/artisan-buddy-sales-integration.tsx`**
  - Example component showing integration
  - Demonstrates real-time data fetching
  - Shows formatted sales display

### 5. RAG Context
- **`.kiro/steering/sales-context.md`**
  - Steering file for AI context
  - Defines when to fetch sales data
  - Provides response formatting guidelines
  - Includes example queries and responses

## Usage

### For AI Assistant (Artisan Buddy)

The AI automatically reads the steering context and knows to fetch sales data when users ask questions like:

- "Show me my current sales"
- "What are my sales today?"
- "Which products are selling best?"
- "How much revenue did I make?"
- "Show sales breakdown by store"

The AI will:
1. Recognize the query requires sales data
2. Call the appropriate API endpoint
3. Format the response in a user-friendly way
4. Include currency symbols, percentages, and visual formatting

### For Developers

#### Fetch Current Sales
```typescript
import { useSalesData } from '@/hooks/use-sales-data';

const { getCurrentSales } = useSalesData();
const sales = await getCurrentSales(userId);
```

#### Fetch Aggregated Sales
```typescript
const { getAggregatedSales } = useSalesData();
const aggregated = await getAggregatedSales(userId);

console.log(aggregated.totalRevenue);
console.log(aggregated.topProducts);
console.log(aggregated.storeBreakdown);
```

#### Direct API Calls
```typescript
// Get current sales
const response = await fetch('/api/sales/current?userId=123');
const data = await response.json();

// Get aggregated sales
const response = await fetch('/api/sales/aggregated?userId=123');
const data = await response.json();
```

## Data Structure

### SalesData
```typescript
{
  storeId: string;
  storeName: string;
  platform: 'amazon' | 'instagram' | 'firebase';
  totalSales: number;
  todaySales: number;
  currency: string;
  products: ProductSale[];
  lastUpdated: Date;
}
```

### AggregatedSales
```typescript
{
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  topProducts: ProductSale[];
  storeBreakdown: SalesData[];
}
```

## Configuration

### Environment Variables

The system automatically detects configured stores from environment variables:

```env
# Amazon Store
NEXT_PUBLIC_AMAZON_CLIENT_ID=your_client_id
NEXT_PUBLIC_AMAZON_CLIENT_SECRET=your_secret
NEXT_PUBLIC_AMAZON_REFRESH_TOKEN=your_token

# Instagram Shop
INSTAGRAM_IG_ID=your_ig_id
INSTAGRAM_ACCESS_TOKEN=your_access_token

# Firebase (always available)
FIREBASE_PROJECT_ID=your_project_id
```

## Next Steps

### 1. Amazon SP-API Integration
Currently using mock data. To integrate:
- Set up Amazon SP-API credentials
- Implement OAuth token refresh
- Call Orders API or Sales API
- Parse and aggregate order data

Update `src/app/api/sales/amazon/route.ts` with real implementation.

### 2. Instagram Commerce API
Currently limited to insights. To get sales:
- Enable Instagram Shopping
- Use Commerce API endpoints
- Track product tags and checkouts

### 3. Additional Platforms
To add more platforms (Shopify, Etsy, etc.):
1. Add platform config to `SalesDataService`
2. Implement fetch method
3. Create API route if needed
4. Update steering context

### 4. Caching
Consider adding Redis caching for:
- Frequently accessed sales data
- Rate limiting API calls
- Reducing external API costs

### 5. Real-time Updates
Implement WebSocket or Server-Sent Events for:
- Live sales notifications
- Real-time dashboard updates
- Instant order alerts

## Testing

### Test the API Endpoints
```bash
# Current sales
curl http://localhost:9003/api/sales/current

# Aggregated sales
curl http://localhost:9003/api/sales/aggregated

# Marketplace sales
curl -X POST http://localhost:9003/api/sales/marketplace \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-id"}'
```

### Test in Artisan Buddy
1. Start the dev server: `npm run dev`
2. Navigate to artisan buddy interface
3. Ask: "Show me my current sales"
4. Verify the AI fetches and displays real-time data

## Security Considerations

1. **Authentication**: Always verify user identity before showing sales data
2. **Authorization**: Only show data for the authenticated user
3. **API Keys**: Never expose credentials in client-side code
4. **Rate Limiting**: Implement rate limits on API endpoints
5. **Data Privacy**: Comply with data protection regulations

## Performance

- API calls are made on-demand (not cached by default)
- Multiple stores fetched in parallel using `Promise.all()`
- Failed stores don't block others (graceful degradation)
- Consider implementing caching for high-traffic scenarios

## Troubleshooting

### "Failed to fetch sales data"
- Check internet connection
- Verify API credentials in `.env`
- Check browser console for detailed errors
- Ensure Firebase/Firestore is properly configured

### "No data returned"
- Verify orders exist in Firestore
- Check userId is correct
- Ensure orders have `status: 'completed'`
- Check date filters (today's sales resets at midnight)

### Amazon/Instagram not showing
- Verify credentials are set in `.env`
- Check API permissions and scopes
- Review platform-specific API documentation
- Check for rate limiting or quota issues

## Support

For issues or questions:
1. Check the steering context: `.kiro/steering/sales-context.md`
2. Review API logs in browser console
3. Test API endpoints directly with curl
4. Verify environment variables are set correctly
