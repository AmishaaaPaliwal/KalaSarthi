# Complete Agentic RAG System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                    │
│                    (Artisan/Seller)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Natural Language Query
                         │ (Hindi or English)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ARTISAN BUDDY AI                              │
│              (Gemini 2.0 Flash)                                 │
│                                                                 │
│  • Understands natural language                                │
│  • Reads RAG context                                           │
│  • Decides: Fetch data or generic advice?                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Reads context from
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         .kiro/steering/sales-context.md                         │
│              (COMPREHENSIVE RAG CONTEXT)                        │
│                                                                 │
│  Guidelines for:                                                │
│  • Sales Data                                                   │
│  • Scheme Sahayak                                              │
│  • Buyer Connect                                               │
│  • Inventory Management                                        │
│  • Marketplace                                                 │
│  • Profile & Portfolio                                         │
│  • Decision Logic (when to fetch vs generic)                   │
│  • Response Formatting                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Triggers API call
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         /api/artisan-buddy/chat                                 │
│              (CHAT API ROUTE)                                   │
│                                                                 │
│  1. Receives user message                                       │
│  2. Calls Unified Data Service                                 │
│  3. Injects data into AI prompt                                │
│  4. Gets AI response                                           │
│  5. Returns formatted response                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         Unified Data Service                                    │
│    (src/lib/services/unified-data-service.ts)                   │
│                                                                 │
│  INTELLIGENT DETECTION:                                         │
│  • Analyzes query for keywords                                 │
│  • Detects relevant features                                   │
│  • Fetches data in parallel                                    │
│  • Returns structured context                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Fetches from multiple sources
                         ▼
        ┌────────────────┼────────────────┬────────────────┐
        │                │                │                │
        ▼                ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   SALES      │  │   SCHEMES    │  │BUYER CONNECT │  │  INVENTORY   │
│              │  │              │  │              │  │              │
│ • Revenue    │  │ • Eligible   │  │ • Messages   │  │ • Stock      │
│ • Orders     │  │ • Applied    │  │ • Connections│  │ • Low Stock  │
│ • Products   │  │ • Recommend  │  │ • Opportun.  │  │ • Value      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        │                │                │                │
        └────────────────┼────────────────┴────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ MARKETPLACE  │  │   PROFILE    │  │  FIRESTORE   │
│              │  │              │  │   DATABASE   │
│ • Listings   │  │ • Skills     │  │              │
│ • Orders     │  │ • Certs      │  │ All data     │
│ • Reviews    │  │ • Portfolio  │  │ stored here  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Query Flow Examples

### Example 1: Sales Query

```
User: "Tell me about my sales"
    ↓
Chat API receives message
    ↓
Unified Service analyzes: "sales" keyword detected
    ↓
Fetches: Sales data only
    ↓
Returns: {
  hasData: true,
  features: ['sales'],
  data: { sales: {...} }
}
    ↓
Chat API injects into prompt:
"[REAL-TIME SALES DATA]
Total Revenue: ₹40,300
..."
    ↓
Gemini AI formats response
    ↓
User sees: Beautiful sales report with ₹, emojis, breakdown
```

### Example 2: Multi-Feature Query

```
User: "Give me my business overview"
    ↓
Chat API receives message
    ↓
Unified Service analyzes: Multiple keywords detected
    ↓
Fetches in parallel:
├─ Sales data
├─ Inventory data
├─ Marketplace data
└─ Buyer Connect data
    ↓
Returns: {
  hasData: true,
  features: ['sales', 'inventory', 'marketplace', 'buyerConnect'],
  data: { sales: {...}, inventory: {...}, ... }
}
    ↓
Chat API injects comprehensive context
    ↓
Gemini AI creates dashboard view
    ↓
User sees: Complete business overview
```

### Example 3: Generic Query (No Data Fetch)

```
User: "What is GST?"
    ↓
Chat API receives message
    ↓
Unified Service analyzes: No feature keywords detected
    ↓
Returns: {
  hasData: false,
  features: [],
  data: {}
}
    ↓
Chat API sends query without data context
    ↓
Gemini AI provides general knowledge
    ↓
User sees: Explanation of GST
```

### Example 4: Hybrid Query (Data + Advice)

```
User: "How can I improve my sales?"
    ↓
Chat API receives message
    ↓
Unified Service analyzes: "sales" + "improve" detected
    ↓
Fetches: Sales data (for context)
    ↓
Returns: {
  hasData: true,
  features: ['sales'],
  data: { sales: {...} }
}
    ↓
Chat API injects sales data + advice request
    ↓
Gemini AI analyzes data + provides personalized advice
    ↓
User sees: Current sales + specific recommendations
```

## Detection Logic

### Keyword Detection Matrix

```
┌─────────────────┬──────────────────────────────────────────┐
│ Feature         │ Keywords (English + Hindi)               │
├─────────────────┼──────────────────────────────────────────┤
│ Sales           │ sales, revenue, sell, बिक्री, आय        │
│ Schemes         │ scheme, yojana, योजना, subsidy          │
│ Buyer Connect   │ buyer, customer, खरीदार, ग्राहक         │
│ Inventory       │ inventory, stock, स्टॉक, सामान          │
│ Marketplace     │ marketplace, listing, बाजार, लिस्टिंग   │
│ Profile         │ profile, skill, प्रोफाइल, कौशल         │
└─────────────────┴──────────────────────────────────────────┘
```

### Decision Tree

```
Query Received
    ↓
Contains feature keywords?
    ├─ YES → Fetch relevant data
    │         ↓
    │    Contains "how to" or "tips"?
    │         ├─ YES → Fetch data + Provide advice
    │         └─ NO → Fetch data + Present data
    │
    └─ NO → Generic knowledge question
              ↓
         Provide general advice
```

## Data Flow Architecture

### Parallel Fetching

```
Unified Service receives query
    ↓
Analyzes and detects: [sales, inventory, marketplace]
    ↓
Creates parallel promises:
    ├─ Promise 1: Fetch sales data
    ├─ Promise 2: Fetch inventory data
    └─ Promise 3: Fetch marketplace data
    ↓
Promise.all() - Wait for all to complete
    ↓
Aggregate results
    ↓
Return unified context
```

### Error Handling

```
Fetch Feature A
    ├─ Success → Include in results
    └─ Error → Log error, continue with others

Fetch Feature B
    ├─ Success → Include in results
    └─ Error → Log error, continue with others

Result: Return successful features only
(Graceful degradation - no blocking)
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Artisan Buddy Chat Component                            │  │
│  │  (src/app/artisan-buddy/page.tsx)                        │  │
│  │                                                           │  │
│  │  • User input                                            │  │
│  │  • Message display                                       │  │
│  │  • Voice input                                           │  │
│  │  • TTS output                                            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ POST /api/artisan-buddy/chat
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js API)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat API Route                                          │  │
│  │  (src/app/api/artisan-buddy/chat/route.ts)              │  │
│  │                                                           │  │
│  │  1. Receive message                                      │  │
│  │  2. Call Unified Data Service                           │  │
│  │  3. Build prompt with context                           │  │
│  │  4. Call Gemini AI                                      │  │
│  │  5. Return response                                     │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │  Unified Data Service                                    │  │
│  │  (src/lib/services/unified-data-service.ts)             │  │
│  │                                                           │  │
│  │  • Query analysis                                        │  │
│  │  • Feature detection                                     │  │
│  │  • Parallel data fetching                               │  │
│  │  • Context building                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## RAG Context Structure

```
.kiro/steering/sales-context.md
│
├─ Overview
│  └─ System description
│
├─ Sales Data Context
│  ├─ When to fetch
│  ├─ Available data
│  └─ Response format
│
├─ Scheme Sahayak Context
│  ├─ When to fetch
│  ├─ Available data
│  └─ Response format
│
├─ Buyer Connect Context
│  ├─ When to fetch
│  ├─ Available data
│  └─ Response format
│
├─ Inventory Context
│  ├─ When to fetch
│  ├─ Available data
│  └─ Response format
│
├─ Marketplace Context
│  ├─ When to fetch
│  ├─ Available data
│  └─ Response format
│
├─ Profile Context
│  ├─ When to fetch
│  ├─ Available data
│  └─ Response format
│
├─ Decision Logic
│  ├─ When to fetch data
│  ├─ When to provide generic advice
│  └─ When to do both (hybrid)
│
├─ Multi-Feature Queries
│  └─ How to handle complex queries
│
├─ Response Guidelines
│  ├─ Formatting rules
│  ├─ Language handling
│  └─ Tone guidelines
│
└─ Error Handling
   ├─ Data fetch failures
   └─ No data scenarios
```

## Performance Optimization

### Parallel Fetching
```
Sequential (Slow):
Fetch Sales (500ms)
    ↓
Fetch Inventory (500ms)
    ↓
Fetch Marketplace (500ms)
    ↓
Total: 1500ms

Parallel (Fast):
Fetch Sales (500ms)    ┐
Fetch Inventory (500ms)├─ Promise.all()
Fetch Marketplace (500ms)┘
    ↓
Total: 500ms (3x faster!)
```

### Caching Strategy (Future)
```
Request comes in
    ↓
Check Redis cache
    ├─ Hit → Return cached data (< 50ms)
    └─ Miss → Fetch from Firestore (500ms)
              ↓
         Store in cache (TTL: 5 min)
              ↓
         Return fresh data
```

## Security Architecture

```
User Request
    ↓
Authentication Check
    ├─ Valid → Continue
    └─ Invalid → Reject (401)
    ↓
Authorization Check
    ├─ User owns data? → Continue
    └─ No → Reject (403)
    ↓
Fetch user's data only
    ↓
Sanitize response
    ↓
Return to user
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vercel / Firebase Hosting                               │  │
│  │  • Next.js App                                           │  │
│  │  • Serverless Functions                                  │  │
│  │  • Edge Network                                          │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │  External Services                                       │  │
│  │  • Gemini AI API                                         │  │
│  │  • Firebase/Firestore                                    │  │
│  │  • Google Cloud TTS                                      │  │
│  │  • Redis (optional)                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Monitoring & Logging

```
Request Flow:
    ↓
Log: "Analyzing query for contextual data needs"
    ↓
Log: "Features detected: [sales, inventory]"
    ↓
Log: "Fetching sales data..."
Log: "Fetching inventory data..."
    ↓
Log: "Sales data fetched: { totalRevenue: 40300, ... }"
Log: "Inventory data fetched: { totalProducts: 45, ... }"
    ↓
Log: "Contextual data fetched: { hasData: true, features: [...] }"
    ↓
Log: "Sending to Gemini with context"
    ↓
Log: "Response received (duration: 1234ms)"
    ↓
Return to user
```

## Key Design Decisions

1. **Parallel Fetching** - All data sources fetched simultaneously
2. **Graceful Degradation** - Failed sources don't block others
3. **Smart Detection** - Only fetch what's needed
4. **Unified Service** - Single source of truth
5. **RAG Context** - Comprehensive guidelines for AI
6. **Bilingual** - Hindi and English support
7. **Type Safety** - Full TypeScript implementation
8. **Error Handling** - Comprehensive error management
9. **Logging** - Detailed logging for debugging
10. **Scalable** - Easy to add new features

## Summary

This architecture provides:
- ✅ Intelligent context detection
- ✅ Multi-feature support
- ✅ Fast parallel fetching
- ✅ Graceful error handling
- ✅ Comprehensive RAG context
- ✅ Bilingual support
- ✅ Production-ready code
- ✅ Scalable design

**Result**: A truly intelligent AI assistant that knows when to fetch data and when to share knowledge!
