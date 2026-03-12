# How to Test Sales Integration with Artisan Buddy

## ✅ Integration Complete!

Your Artisan Buddy AI now automatically fetches real-time sales data when you ask about sales!

## 🚀 Quick Test

### 1. Start the Dev Server
```bash
npm run dev
```

### 2. Open Artisan Buddy
Navigate to: `http://localhost:9003/artisan-buddy`

### 3. Ask About Sales

Try these queries in the chat:

**English:**
- "Tell me about my sales"
- "Show me my current sales"
- "What are my sales today?"
- "How much revenue did I make?"
- "Which products are selling best?"
- "Show sales breakdown by store"

**Hindi:**
- "मेरी बिक्री के बारे में बताएं"
- "आज की बिक्री दिखाएं"
- "कुल कमाई कितनी है?"
- "कौन से उत्पाद सबसे ज्यादा बिक रहे हैं?"

## 🎯 What Happens

1. **AI Detects Sales Query** - Automatically recognizes you're asking about sales
2. **Fetches Real-Time Data** - Calls the sales API to get current data
3. **Formats Response** - Presents data beautifully with:
   - Currency symbols (₹)
   - Emojis for visual appeal
   - Store breakdown
   - Top products
   - Clear sections

## 📊 Example Response

When you ask "Tell me about my sales", you'll get:

```
📊 Your Current Sales Overview

Total Revenue: ₹40,300
Today's Sales: ₹7,800

🏪 Store Breakdown:
• Amazon Store: ₹25,000 (62%)
• Instagram Shop: ₹0 (0%)
• KalaMitra Marketplace: ₹15,300 (38%)

🔥 Top Products:
1. Handcrafted Pottery Vase - 5 sold, ₹2,500
2. Traditional Textile - 3 sold, ₹1,800
3. Wooden Sculpture - 2 sold, ₹1,200

📈 Total Orders: 15

Last updated: Just now
```

## 🔧 How It Works

### Behind the Scenes:

1. **User asks**: "Tell me about my sales"

2. **Chat API** (`src/app/api/artisan-buddy/chat/route.ts`):
   - Detects sales keywords
   - Calls `salesDataService.getAggregatedSales()`
   - Adds sales data to AI prompt

3. **Sales Service** (`src/lib/services/sales-data-service.ts`):
   - Fetches from Amazon, Instagram, Marketplace
   - Aggregates data
   - Returns structured JSON

4. **Gemini AI**:
   - Receives sales data in prompt
   - Formats it beautifully
   - Responds in user's language

5. **User sees**: Beautiful, formatted sales report!

## 🎨 Features

✅ **Automatic Detection** - No special commands needed
✅ **Real-Time Data** - Always fresh, never cached
✅ **Multi-Store** - Shows all connected platforms
✅ **Bilingual** - Works in Hindi and English
✅ **Smart Formatting** - Emojis, currency, percentages
✅ **Context Aware** - Understands follow-up questions

## 🧪 Test Different Queries

### General Sales
- "Tell me about my sales"
- "Show my sales data"

### Today's Sales
- "What did I sell today?"
- "Today's revenue"

### Top Products
- "Which products are selling best?"
- "Show top sellers"

### Store Comparison
- "Compare sales by store"
- "Which platform is performing better?"

### Follow-up Questions
After getting sales data, try:
- "How can I improve these numbers?"
- "What should I focus on?"
- "Give me marketing tips"

## 📱 Mobile Test

The integration works on mobile too!
- Open on your phone
- Use voice input (mic button)
- Ask about sales in Hindi or English

## 🐛 Troubleshooting

### No Sales Data Showing?

**Check:**
1. Dev server is running (`npm run dev`)
2. Browser console for errors (F12)
3. Firestore has orders with `status: 'completed'`
4. Environment variables are set in `.env`

**View Console Logs:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for:
  - `💰 Sales query detected...`
  - `✅ Sales data fetched...`

### AI Not Detecting Sales Query?

Try more explicit queries:
- "Show me my sales data"
- "What are my current sales?"
- "Display sales report"

### API Errors?

Check the Network tab in DevTools:
- Look for `/api/artisan-buddy/chat` request
- Check response status
- View error messages

## 📊 Test with Mock Data

Currently using mock data for Amazon/Instagram. You'll see:
- Amazon Store: ₹25,000
- Marketplace: Real data from Firestore
- Instagram: ₹0 (pending integration)

## 🎯 Success Indicators

You know it's working when:
- ✅ AI responds with formatted sales data
- ✅ Shows currency symbols (₹)
- ✅ Lists multiple stores
- ✅ Displays top products
- ✅ Includes today's sales
- ✅ Console shows "Sales query detected"

## 🚀 Next Steps

1. **Test Now**: Ask about sales in Artisan Buddy
2. **Try Different Queries**: Test various phrasings
3. **Check Console**: Verify data is being fetched
4. **Add Real Data**: Set up Amazon SP-API for real data
5. **Customize**: Adjust formatting in the chat route

## 💡 Pro Tips

1. **Natural Language**: Ask naturally, no special syntax needed
2. **Follow-ups**: Ask follow-up questions for deeper insights
3. **Mix Languages**: Switch between Hindi and English freely
4. **Voice Input**: Use the mic button for hands-free queries
5. **Context**: The AI remembers previous messages

## 📚 Related Files

- **Chat API**: `src/app/api/artisan-buddy/chat/route.ts`
- **Sales Service**: `src/lib/services/sales-data-service.ts`
- **Sales APIs**: `src/app/api/sales/`
- **Steering Context**: `.kiro/steering/sales-context.md`

## 🎉 You're Ready!

Your Artisan Buddy now has real-time sales intelligence! Just ask about sales and watch the magic happen. 🚀

---

**Need Help?**
- Check browser console for logs
- Review `SALES-INTEGRATION-QUICKSTART.md`
- See `docs/SALES-DATA-INTEGRATION.md` for details
