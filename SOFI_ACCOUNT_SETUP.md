# Sofi Account Setup Guide

## New Test Account Created

**Username:** `sofi@sofi`  
**Password:** `123123123`

This account is pre-configured with:
- ✅ User profile info (name, location, bio)
- ✅ 5 items in closet (approved items)
- ✅ 3 orders (purchases from other sellers)
- ✅ 4 favourites (items from other users)

## Step 1: Add Account to Frontend (Already Done)

The account has been added to `AuthContext.tsx`. You can now log in with:
- Email: `sofi@sofi`
- Password: `123123123`

## Step 2: Populate Database

### Option A: Using Laravel Seeder (Recommended)

```bash
# Copy the seeder to your Laravel project
cp SofiUserSeeder.php database/seeders/SofiUserSeeder.php

# Run the seeder
php artisan db:seed --class=SofiUserSeeder
```

### Option B: Using SQL File

```bash
# Run the SQL file
mysql -u your_username -p your_database < sofi_user_seeder.sql
```

Or copy-paste the SQL into your database client.

## Step 3: Find the User ID

After running the seeder, find the user_id for sofi@sofi:

```sql
SELECT id, name, email FROM users WHERE email = 'sofi@sofi';
```

Note the `id` value (might be 2, 3, or another number depending on your database).

## Step 4: Update ProfilePage.tsx User ID Mapping

Open `src/components/ProfilePage.tsx` and find this section (around line 108):

```typescript
const userMap: Record<string, number> = {
  'sofi@sofi': 2, // ← UPDATE THIS NUMBER to match the ID from Step 3
  'user@example': 1,
};
```

Update the number `2` to match the actual user_id from your database.

## Step 5: Verify Data

Run these SQL queries to verify everything was created:

```sql
-- Check user
SELECT * FROM users WHERE email = 'sofi@sofi';

-- Check items (should show 5 items)
SELECT id, title, price FROM items WHERE user_id = (SELECT id FROM users WHERE email = 'sofi@sofi');

-- Check orders (should show 3 orders)
SELECT id, item_id, status, price FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'sofi@sofi');

-- Check favourites (should show 4 favourites)
SELECT id, item_id FROM favourites WHERE user_id = (SELECT id FROM users WHERE email = 'sofi@sofi');
```

## Step 6: Test Login

1. Log out if you're currently logged in
2. Log in with:
   - Email: `sofi@sofi`
   - Password: `123123123`
3. Navigate to `/profile`
4. Check browser console (F12) for any errors

## Troubleshooting

### Profile page still blank?

1. **Check browser console** - Look for API errors
2. **Verify user_id mapping** - Make sure the number in ProfilePage.tsx matches the database user_id
3. **Check API endpoints exist** - See `BACKEND_ENDPOINTS_NEEDED.md`
4. **Verify data exists** - Run the SQL queries from Step 5

### "User not found" errors?

- Make sure you ran the seeder/SQL
- Check that the user was created: `SELECT * FROM users WHERE email = 'sofi@sofi';`

### Orders/Favourites still empty?

- The API endpoints `/api/users/{id}/orders` and `/api/users/{id}/favourites` need to exist
- See `BACKEND_ENDPOINTS_NEEDED.md` for how to create them
- Or check browser console to see which endpoints are being tried

## What Gets Created

### User Profile
- Name: "Sofi Laurent"
- Email: "sofi@sofi"
- Location: "Skopje, North Macedonia"
- Bio: "Vintage lover & sustainable fashion enthusiast. Curator of timeless pieces."

### Items (5 items in closet)
1. Vintage Chanel Jacket - €1,250
2. Silk Wrap Dress - €180
3. Designer Sunglasses - €95
4. Leather Blazer - €285
5. Silk Evening Dress - €290

### Orders (3 orders)
1. Vintage Hermès Silk Scarf - €240 (delivered)
2. Classic Burberry Trench - €385 (shipped)
3. Designer Leather Loafers - €180 (delivered)

### Favourites (4 items)
- Items from other sellers that Sofi has favourited

## Next Steps

Once the data is in the database and the API endpoints exist, the profile page should automatically display:
- ✅ User info in the header
- ✅ Orders in the Orders tab
- ✅ Favourites in the Favourites tab
- ✅ Closet items in the My Closet tab (if seller mode)

