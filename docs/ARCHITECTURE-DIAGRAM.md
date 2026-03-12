# Sales Data Integration - Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                    │
│                    (Artisan/Seller)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Asks: "Show me my current sales"
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ARTISAN BUDDY AI                              │
│              (Gemini/Google AI Model)                           │
│                                                                 │
│  • Understands natural language                                │
│  • Reads RAG context from steering file                        │
│  • Decides which API to call                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Reads context from
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              .kiro/steering/sales-context.md                    │
│                   (RAG CONTEXT)                                 │
│                                                                 │
│  Instructions:                                                  │
│  • When to fetch sales data                                    │
│  • Which API endpoint to use                                   │
│  • How to format the response                                  │
│  • Example queries and responses                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Triggers API call
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER                                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ GET /api/sales/current?userId={id}                       │  │
│  │ → Returns sales from all stores                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ GET /api/sales/aggregated?userId={id}                    │  │
│  │ → Returns totals + top products + breakdown              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/sales/marketplace                              │  │
│  │ → Returns marketplace-only sales                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SalesDataService                                   │
│         (src/lib/services/sales-data-service.ts)                │
│                                                                 │
│  • Manages store configurations                                │
│  • Fetches from multiple platforms in parallel                 │
│  • Aggregates and formats data                                 │
│  • Handles errors gracefully                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Fetches from
                         ▼
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   AMAZON     │  │  INSTAGRAM   │  │  FIRESTORE   │
│   SP-API     │  │  Graph API   │  │  Database    │
│              │  │              │  │              │
│ • Orders     │  │ • Insights   │  │ • Orders     │
│ • Products   │  │ • Commerce   │  │ • Products   │
│ • Revenue    │  │ • Metrics    │  │ • Users      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

```
1. User Query
   ↓
2. AI reads RAG context (.kiro/steering/sales-context.md)
   ↓
3. AI determines: "Need to fetch sales data"
   ↓
4. AI calls: GET /api/sales/aggregated?userId=123
   ↓
5. API route calls: salesDataService.getAggregatedSales()
   ↓
6. Service fetches from all stores in parallel:
   ├─→ Amazon API (or mock)
   ├─→ Instagram API
   └─→ Firestore DB
   ↓
7. Service aggregates results:
   • Total revenue
   • Today's sales
   • Top products
   • Store breakdown
   ↓
8. API returns formatted JSON
   ↓
9. AI formats response with:
   • Currency symbols (₹)
   • Percentages
   • Emojis
   • Clear breakdown
   ↓
10. User sees beautiful, real-time sales data!
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ArtisanBuddySalesIntegration Component                  │  │
│  │  (src/components/artisan-buddy-sales-integration.tsx)    │  │
│  │                                                           │  │
│  │  • Displays sales data                                   │  │
│  │  • Shows store breakdown                                 │  │
│  │  • Lists top products                                    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│                       │ Uses                                    │
│                       ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useSalesData Hook                                       │  │
│  │  (src/hooks/use-sales-data.ts)                           │  │
│  │                                                           │  │
│  │  • getCurrentSales()                                     │  │
│  │  • getAggregatedSales()                                  │  │
│  │  • getMarketplaceSales()                                 │  │
│  │  • Handles loading/error states                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ Calls
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js API)                        │
│                                                                 │
│  API Routes:                                                    │
│  • /api/sales/current                                          │
│  • /api/sales/aggregated                                       │
│  • /api/sales/marketplace                                      │
│  • /api/sales/amazon                                           │
│  • /api/artisan-buddy/tools                                    │
└─────────────────────────────────────────────────────────────────┘
```

## AI Tool System

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI TOOLS                                     │
│         (src/lib/services/artisan-buddy-tools.ts)               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: get_current_sales                                 │  │
│  │  • Fetches from all stores                               │  │
│  │  • Returns raw sales data                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: get_aggregated_sales                              │  │
│  │  • Fetches and aggregates                                │  │
│  │  • Returns totals + breakdown                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: format_sales_data                                 │  │
│  │  • Formats currency                                      │  │
│  │  • Calculates percentages                                │  │
│  │  • Structures for display                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Store Detection Logic

```
┌─────────────────────────────────────────────────────────────────┐
│              SalesDataService.initializeStores()                │
│                                                                 │
│  Check environment variables:                                   │
│                                                                 │
│  if (NEXT_PUBLIC_AMAZON_CLIENT_ID exists)                      │
│    ✅ Add Amazon Store                                          │
│                                                                 │
│  if (INSTAGRAM_IG_ID exists)                                   │
│    ✅ Add Instagram Shop                                        │
│                                                                 │
│  Always:                                                        │
│    ✅ Add KalaMitra Marketplace (Firestore)                     │
│                                                                 │
│  Result: Array of configured stores                            │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              Fetch from Store A                                 │
│                   ↓                                             │
│              Success? ────→ Yes ──→ Return data                 │
│                   ↓                                             │
│                  No                                             │
│                   ↓                                             │
│         Log error to console                                    │
│                   ↓                                             │
│         Return null (don't block)                               │
│                   ↓                                             │
│    Continue with other stores                                   │
│                   ↓                                             │
│    Filter out null results                                      │
│                   ↓                                             │
│    Return successful stores only                                │
└─────────────────────────────────────────────────────────────────┘

Graceful Degradation:
• If Amazon fails → Still show Instagram + Marketplace
• If all fail → Return empty array with error message
• Never block the entire request
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Request with userId                          │
│                           ↓                                     │
│              Verify authentication                              │
│                           ↓                                     │
│         Check user owns the requested data                      │
│                           ↓                                     │
│              Fetch only user's data                             │
│                           ↓                                     │
│         Never expose API credentials                            │
│                           ↓                                     │
│              Return sanitized data                              │
└─────────────────────────────────────────────────────────────────┘
```

## Caching Strategy (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Request comes in                             │
│                           ↓                                     │
│              Check Redis cache                                  │
│                           ↓                                     │
│                    Cache hit?                                   │
│                    ↙         ↘                                  │
│                  Yes          No                                │
│                   ↓            ↓                                │
│         Return cached    Fetch from stores                      │
│              data              ↓                                │
│                           Store in cache                        │
│                                ↓                                │
│                         Return fresh data                       │
│                                                                 │
│  Cache TTL: 5 minutes for sales data                           │
│  Invalidate on: New order, manual refresh                      │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js App (Vercel/Firebase Hosting)                   │  │
│  │  • Frontend React components                             │  │
│  │  • API routes                                            │  │
│  │  • Serverless functions                                  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│                       │ Connects to                             │
│                       ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  External Services                                       │  │
│  │  • Amazon SP-API                                         │  │
│  │  • Instagram Graph API                                   │  │
│  │  • Firebase/Firestore                                    │  │
│  │  • Redis (optional caching)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Parallel Fetching**: All stores fetched simultaneously for speed
2. **Graceful Degradation**: Failed stores don't block others
3. **No Caching**: Always real-time data (can add later)
4. **TypeScript**: Full type safety
5. **Modular**: Easy to add new platforms
6. **Secure**: User data isolation
7. **RAG Context**: AI knows when/how to fetch data
8. **Developer-Friendly**: Clean APIs and hooks
