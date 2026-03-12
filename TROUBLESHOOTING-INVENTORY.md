# 🔧 Troubleshooting: Inventory Showing 0 Products

## Problem

You have 6 products in your inventory dashboard, but Artisan Buddy shows "0 products" when you ask about inventory.

## Root Cause

The products in Firestore likely don't have a `userId` field, or the `userId` doesn't match your current user ID.

## Solution Steps

### Step 1: Check Your User ID

**Option A: Add Debug Component (Recommended)**

1. Open `src/app/artisan-buddy/page.tsx`
2. Import the debug component at the top:
```typescript
import { DebugUserInfo } from '@/components/debug-user-info';
```

3. Add it inside the component (around line 900, before the messages):
```typescript
<div className="container mx-auto px-4 py-4">
  <DebugUserInfo />
  {/* rest of your chat UI */}
</div>
```

4. Refresh the page and you'll see your user ID displayed

**Option B: Check Browser Console**

1. Open browser console (F12)
2. Type:
```javascript
// Check if logged in
console.log('User:', user);
console.log('User ID:', user?.uid);
```

### Step 2: Check Firestore Products

1. Open Firebase Console: https://console.firebase.google.com
2. Go to your project
3. Click "Firestore Database"
4. Navigate to `products` collection
5. Click on one of your products
6. Check if it has a `userId` field
7. If yes, note the value - does it match your user ID from Step 1?

### Step 3: Fix the Products

**Option A: Use the Fix Script (Recommended)**

1. Get your user ID from Step 1
2. Run the fix script:
```bash
node scripts/fix-product-userid.js YOUR_USER_ID_HERE
```

Example:
```bash
node scripts/fix-product-userid.js abc123xyz456
```

This will:
- ✅ Add `userId` field to products that don't have it
- ✅ Update `userId` field if it's different
- ✅ Skip products that already have the correct `userId`

**Option B: Manual Fix in Firestore**

1. Go to Firestore Console
2. For each product:
   - Click on the product
   - Click "Add field" (if userId doesn't exist)
   - Field name: `userId`
   - Field value: Your user ID from Step 1
   - Click "Update"

### Step 4: Verify the Fix

1. Restart your dev server:
```bash
npm run dev
```

2. Open Artisan Buddy:
```
http://localhost:9003/artisan-buddy
```

3. Ask:
```
"Tell me about my inventory"
```

4. You should now see:
```
📦 आपकी इन्वेंट्री का हाल:
कुल उत्पाद: 6
कुल मूल्य: ₹[calculated value]
कम स्टॉक वाले उत्पाद: 1
```

## Common Issues

### Issue 1: "Not logged in"

**Symptoms:**
- Debug component shows "❌ Not logged in"
- User ID is "demo-user"

**Solution:**
1. Make sure you're logged in to the app
2. Check if there's a login page
3. Verify Firebase authentication is working
4. Check browser console for auth errors

### Issue 2: "Products have different userId"

**Symptoms:**
- You're logged in
- Products exist in Firestore
- But userId doesn't match

**Solution:**
Run the fix script with YOUR user ID:
```bash
node scripts/fix-product-userid.js YOUR_ACTUAL_USER_ID
```

### Issue 3: "Products collection doesn't exist"

**Symptoms:**
- Firestore doesn't have a `products` collection
- Or it's named differently

**Solution:**
1. Check if your products are in a different collection
2. Update the query in `src/lib/services/unified-data-service.ts`:
```typescript
// Change this line (around line 209):
.collection('products')  // ← Change to your collection name
```

### Issue 4: "Field name is different"

**Symptoms:**
- Products have user info but field is named differently
- e.g., `user_id`, `ownerId`, `sellerId`

**Solution:**
Update the query in `src/lib/services/unified-data-service.ts`:
```typescript
// Change this line (around line 210):
.where('userId', '==', userId)  // ← Change 'userId' to your field name
```

## Verification Checklist

- [ ] I'm logged in (check debug component or console)
- [ ] I have my user ID
- [ ] Products exist in Firestore
- [ ] Products have `userId` field
- [ ] `userId` matches my user ID
- [ ] Dev server is restarted
- [ ] Artisan Buddy shows my products

## Expected Data Structure

Your Firestore products should look like this:

```
products (collection)
  └─ product-id-1 (document)
      ├─ name: "Wooden Bullock Cart"
      ├─ price: 2016
      ├─ stock: 8
      ├─ userId: "abc123xyz456"  ← This must match your user ID
      └─ ... other fields

  └─ product-id-2 (document)
      ├─ name: "Another Product"
      ├─ price: 1500
      ├─ stock: 10
      ├─ userId: "abc123xyz456"  ← Same user ID
      └─ ... other fields
```

## Quick Test

After fixing, test with these queries:

1. **Inventory:**
   ```
   "Tell me about my inventory"
   ```
   Should show: 6 products, 41 stock, 1 low stock

2. **Sales:**
   ```
   "Show my sales"
   ```
   Should show: Your actual sales data

3. **Business Overview:**
   ```
   "Give me my business overview"
   ```
   Should show: All your data combined

## Still Not Working?

### Check API Logs

1. Open browser console (F12)
2. Look for these logs:
   ```
   🔍 Analyzing query for contextual data needs...
   📦 Fetching inventory data for user: abc123xyz456
   ✅ Contextual data fetched: { hasData: true, features: ['inventory'] }
   ```

3. If you see errors, note them and check:
   - Firestore permissions
   - Network connectivity
   - API endpoint availability

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Ask about inventory
4. Find the `/api/artisan-buddy/chat` request
5. Check:
   - Request payload has `userId`
   - Response has inventory data
   - No 403/404 errors

### Enable Debug Logging

Add this to your chat API to see what's happening:

In `src/app/api/artisan-buddy/chat/route.ts`, add:
```typescript
console.log('📝 Request body:', { message, userId });
console.log('📊 Contextual data:', contextualData);
```

## Need Help?

If you're still stuck:

1. **Check the logs:**
   - Browser console
   - Server terminal
   - Network tab

2. **Verify data:**
   - User is logged in
   - Products exist in Firestore
   - userId fields match

3. **Run the fix script:**
   ```bash
   node scripts/fix-product-userid.js YOUR_USER_ID
   ```

4. **Restart everything:**
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev
   # Refresh browser
   ```

## Success!

Once fixed, you should see:
- ✅ Your 6 products
- ✅ Your 41 items in stock
- ✅ Your 1 low stock item
- ✅ Real product names and prices
- ✅ Accurate inventory value

Your Artisan Buddy will now show YOUR real data! 🎉
