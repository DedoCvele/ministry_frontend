# Profile Test Data Setup Guide

This guide helps you populate test data for the `/profile` page for user_id = 1.

## Option 1: Using SQL File (Quickest)

1. **Run the SQL file directly:**
   ```bash
   mysql -u your_username -p your_database_name < profile_test_data.sql
   ```

   Or if using Laravel's database:
   ```bash
   php artisan db:seed --class=DatabaseSeeder
   # Then manually run the SQL
   ```

2. **Or copy-paste into your database client** (phpMyAdmin, TablePlus, etc.)

## Option 2: Using Laravel Seeder (Recommended)

1. **Copy the seeder file to your Laravel project:**
   ```bash
   cp ProfileTestDataSeeder.php database/seeders/ProfileTestDataSeeder.php
   ```

2. **Run the seeder:**
   ```bash
   php artisan db:seed --class=ProfileTestDataSeeder
   ```

## Option 3: Using Laravel Tinker

Run these commands in `php artisan tinker`:

```php
// 1. Update user info
$user = \App\Models\User::find(1);
$user->update([
    'name' => 'Sophie Laurent',
    'email' => 'sophie@example.com',
    'location' => 'Skopje, North Macedonia',
    'bio' => 'Vintage lover & sustainable fashion enthusiast.',
]);

// 2. Create items for user_id = 1
\App\Models\Item::create([
    'user_id' => 1,
    'title' => 'Vintage Chanel Jacket',
    'description' => 'Classic black tweed jacket in excellent condition.',
    'price' => 1250.00,
    'brand_id' => 1, // Adjust based on your brands
    'category_id' => 1, // Adjust based on your categories
    'approval_state' => 'approved',
]);

\App\Models\Item::create([
    'user_id' => 1,
    'title' => 'Silk Wrap Dress',
    'description' => 'Elegant vintage silk wrap dress in navy blue.',
    'price' => 180.00,
    'brand_id' => 1,
    'category_id' => 2,
    'approval_state' => 'approved',
]);

\App\Models\Item::create([
    'user_id' => 1,
    'title' => 'Designer Sunglasses',
    'description' => 'Vintage designer sunglasses with original case.',
    'price' => 95.00,
    'brand_id' => 1,
    'category_id' => 3,
    'approval_state' => 'approved',
]);

// 3. Create orders (items user_id = 1 purchased)
// Note: You may need items from other users first
\App\Models\Order::create([
    'user_id' => 1,
    'item_id' => 1, // Use existing item ID
    'status' => 'delivered',
    'price' => 240.00,
]);

// 4. Create favourites (items from OTHER users)
\App\Models\Favourite::create([
    'user_id' => 1,
    'item_id' => 10, // Use item ID from another user
]);
```

## Important Notes

### Before Running:

1. **Check your table structure:**
   - Verify column names match (some might be `total_price` instead of `price` in orders)
   - Check if `favourites` table might be named `wishlist` or `saved_items`
   - Ensure `brand_id` and `category_id` values exist in your database

2. **Adjust brand_id and category_id:**
   - The seeder uses `brand_id = 1` and `category_id = 1, 2, 3`
   - Check what values exist in your `brands` and `categories` tables
   - Update the seeder/SQL accordingly

3. **For Orders:**
   - Orders represent items that user_id = 1 **purchased** (not items they're selling)
   - You may need items from other users (user_id != 1) for realistic orders
   - Or use the items created above if your system allows users to order their own items

4. **For Favourites:**
   - Favourites should be items from **other users** (not user_id = 1's own items)
   - If no items from other users exist, create some first or skip this step

### After Running:

1. **Verify the data:**
   ```sql
   SELECT * FROM users WHERE id = 1;
   SELECT * FROM items WHERE user_id = 1;
   SELECT * FROM orders WHERE user_id = 1;
   SELECT * FROM favourites WHERE user_id = 1;
   ```

2. **Test the profile page:**
   - Navigate to `/profile` while logged in as user_id = 1
   - Check that all tabs show data:
     - Overview tab should show user info, orders preview, favourites preview
     - Orders tab should show the 3 orders
     - Favourites tab should show the favourited items
     - My Closet tab (if seller) should show the 5 items

## Troubleshooting

- **"Column not found" errors:** Check your table structure and adjust column names
- **"Foreign key constraint fails":** Ensure brand_id and category_id values exist
- **"Duplicate entry":** Data already exists, the seeder handles this gracefully
- **Empty favourites:** Create items from other users first, or adjust the seeder logic

## Customization

Feel free to modify:
- Item titles, descriptions, prices
- Order statuses and dates
- Number of items/orders/favourites
- User location and bio

All data is test data and safe to modify or delete.

