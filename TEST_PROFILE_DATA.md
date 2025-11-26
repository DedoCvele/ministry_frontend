# Testing Profile Data - Quick Guide

## Step 1: Verify Data Was Inserted

Run this SQL to check if data exists:

```sql
-- Check user
SELECT id, name, email, location, bio FROM users WHERE id = 1;

-- Check items (closet)
SELECT id, title, price, user_id, approval_state FROM items WHERE user_id = 1;

-- Check orders
SELECT id, user_id, item_id, status, price FROM orders WHERE user_id = 1;

-- Check favourites
SELECT id, user_id, item_id FROM favourites WHERE user_id = 1;
```

## Step 2: Check Browser Console

Open your browser's Developer Console (F12) and look for:
- ✅ "Orders loaded: [...]" - means orders endpoint worked
- ✅ "Favourites loaded: [...]" - means favourites endpoint worked  
- ✅ "Closet items loaded: [...]" - means items loaded
- ❌ "Error loading orders: ..." - means endpoint doesn't exist
- ❌ "No orders endpoint found" - means all endpoint attempts failed

## Step 3: Test API Endpoints Directly

Open these URLs in your browser or use curl:

```bash
# Test if these endpoints exist:
curl http://127.0.0.1:8000/api/users/1/orders
curl http://127.0.0.1:8000/api/users/1/favourites
curl http://127.0.0.1:8000/api/items
```

## Step 4: Quick Fix Options

### Option A: Create Backend Endpoints (Recommended)
See `BACKEND_ENDPOINTS_NEEDED.md` for controller code.

### Option B: Use Existing Endpoints
The frontend now tries multiple endpoint variations automatically. If your backend uses different endpoint names, update the `endpoints` array in ProfilePage.tsx.

### Option C: Temporary Mock Data (For Testing)
If endpoints don't exist yet, you can temporarily add mock data in the frontend for testing the UI.

## Common Issues

1. **"404 Not Found"** - Endpoint doesn't exist, need to create it
2. **"401 Unauthorized"** - Need to be logged in, check authentication
3. **"Empty array []"** - Data might not be in database, run the seeder
4. **"CORS error"** - Backend CORS not configured for frontend origin

## Next Steps

1. ✅ Run the seeder: `php artisan db:seed --class=ProfileTestDataSeeder`
2. ✅ Check database has data (Step 1 above)
3. ✅ Check browser console for errors (Step 2)
4. ✅ Create missing API endpoints (see BACKEND_ENDPOINTS_NEEDED.md)
5. ✅ Test endpoints directly (Step 3)

