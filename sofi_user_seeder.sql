-- Complete Seeder for Sofi User (sofi@sofi)
-- This creates a user with ID that has items, orders, and favourites
-- Run this SQL file to populate all test data

-- 1. Create or update Sofi user
-- First, find the user_id for sofi@sofi (or create if doesn't exist)
SET @sofi_user_id = (SELECT id FROM users WHERE email = 'sofi@sofi' LIMIT 1);

-- If user doesn't exist, create it
INSERT INTO users (name, email, email_verified_at, password, location, bio, avatar, created_at, updated_at)
VALUES (
    'Sofi Laurent',
    'sofi@sofi',
    NOW(),
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 123123123
    'Skopje, North Macedonia',
    'Vintage lover & sustainable fashion enthusiast. Curator of timeless pieces.',
    NULL,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    name = 'Sofi Laurent',
    location = 'Skopje, North Macedonia',
    bio = 'Vintage lover & sustainable fashion enthusiast. Curator of timeless pieces.',
    updated_at = NOW();

-- Get the user_id (use existing or newly created)
SET @sofi_user_id = COALESCE(@sofi_user_id, (SELECT id FROM users WHERE email = 'sofi@sofi' LIMIT 1));

-- 2. Create items that belong to Sofi (for her closet)
INSERT INTO items (user_id, title, description, price, brand_id, category_id, approval_state, created_at, updated_at)
VALUES
    (@sofi_user_id, 'Vintage Chanel Jacket', 'Classic black tweed jacket in excellent condition. Timeless piece from the 90s.', 1250.00, 1, 1, 'approved', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
    (@sofi_user_id, 'Silk Wrap Dress', 'Elegant vintage silk wrap dress in navy blue. Perfect for special occasions.', 180.00, 1, 2, 'approved', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
    (@sofi_user_id, 'Designer Sunglasses', 'Vintage designer sunglasses with original case. UV protection.', 95.00, 1, 3, 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
    (@sofi_user_id, 'Leather Blazer', 'Vintage leather blazer in brown. Great condition, classic cut.', 285.00, 1, 1, 'approved', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
    (@sofi_user_id, 'Silk Evening Dress', 'Beautiful vintage silk evening dress. Perfect for formal events.', 290.00, 1, 2, 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Get item IDs for Sofi's items
SET @sofi_item1 = (SELECT id FROM items WHERE user_id = @sofi_user_id AND title = 'Vintage Chanel Jacket' LIMIT 1);
SET @sofi_item2 = (SELECT id FROM items WHERE user_id = @sofi_user_id AND title = 'Silk Wrap Dress' LIMIT 1);
SET @sofi_item3 = (SELECT id FROM items WHERE user_id = @sofi_user_id AND title = 'Designer Sunglasses' LIMIT 1);

-- 3. Create items from OTHER users (for Sofi to order and favourite)
-- First, ensure we have at least one other user
SET @other_user_id = (SELECT id FROM users WHERE email != 'sofi@sofi' LIMIT 1);

-- If no other user exists, create one
INSERT INTO users (name, email, email_verified_at, password, created_at, updated_at)
SELECT 'Other Seller', 'seller@example.com', NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'seller@example.com');

SET @other_user_id = COALESCE(@other_user_id, (SELECT id FROM users WHERE email = 'seller@example.com' LIMIT 1));

-- Create items from other user for Sofi to purchase/favourite
INSERT INTO items (user_id, title, description, price, brand_id, category_id, approval_state, created_at, updated_at)
VALUES
    (@other_user_id, 'Vintage Hermès Silk Scarf', 'Beautiful vintage Hermès silk scarf in excellent condition.', 240.00, 1, 4, 'approved', DATE_SUB(NOW(), INTERVAL 50 DAY), NOW()),
    (@other_user_id, 'Classic Burberry Trench', 'Timeless Burberry trench coat, perfect condition.', 385.00, 1, 1, 'approved', DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
    (@other_user_id, 'Designer Leather Loafers', 'Vintage designer leather loafers, barely worn.', 180.00, 1, 5, 'approved', DATE_SUB(NOW(), INTERVAL 40 DAY), NOW()),
    (@other_user_id, 'Vintage Gucci Marmont Bag', 'Classic Gucci Marmont bag in black leather.', 890.00, 1, 6, 'approved', DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),
    (@other_user_id, 'Silk Evening Dress', 'Elegant silk evening dress, perfect for special occasions.', 290.00, 1, 2, 'approved', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Get other user's item IDs
SET @other_item1 = (SELECT id FROM items WHERE user_id = @other_user_id AND title = 'Vintage Hermès Silk Scarf' LIMIT 1);
SET @other_item2 = (SELECT id FROM items WHERE user_id = @other_user_id AND title = 'Classic Burberry Trench' LIMIT 1);
SET @other_item3 = (SELECT id FROM items WHERE user_id = @other_user_id AND title = 'Designer Leather Loafers' LIMIT 1);
SET @other_item4 = (SELECT id FROM items WHERE user_id = @other_user_id AND title = 'Vintage Gucci Marmont Bag' LIMIT 1);
SET @other_item5 = (SELECT id FROM items WHERE user_id = @other_user_id AND title = 'Silk Evening Dress' LIMIT 1);

-- 4. Create orders for Sofi (items she purchased from other users)
INSERT INTO orders (user_id, item_id, status, price, created_at, updated_at)
VALUES
    (@sofi_user_id, COALESCE(@other_item1, (SELECT id FROM items WHERE user_id != @sofi_user_id LIMIT 1)), 'delivered', 240.00, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
    (@sofi_user_id, COALESCE(@other_item2, (SELECT id FROM items WHERE user_id != @sofi_user_id LIMIT 1 OFFSET 1)), 'shipped', 385.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
    (@sofi_user_id, COALESCE(@other_item3, (SELECT id FROM items WHERE user_id != @sofi_user_id LIMIT 1 OFFSET 2)), 'delivered', 180.00, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 5. Create favourites for Sofi (items from other users she favourited)
INSERT INTO favourites (user_id, item_id, created_at, updated_at)
SELECT @sofi_user_id, id, NOW(), NOW()
FROM items
WHERE user_id != @sofi_user_id
  AND id NOT IN (SELECT item_id FROM favourites WHERE user_id = @sofi_user_id)
LIMIT 4;

-- If favourites table doesn't exist or has different name, try these alternatives:
-- INSERT INTO wishlist (user_id, item_id, created_at, updated_at) ...
-- INSERT INTO saved_items (user_id, item_id, created_at, updated_at) ...

-- 6. Verify the data
SELECT 'Sofi User Info:' as info;
SELECT id, name, email, location, bio FROM users WHERE email = 'sofi@sofi';

SELECT 'Sofi Items (Closet):' as info;
SELECT id, title, price, approval_state FROM items WHERE user_id = @sofi_user_id;

SELECT 'Sofi Orders:' as info;
SELECT id, item_id, status, price, created_at FROM orders WHERE user_id = @sofi_user_id;

SELECT 'Sofi Favourites:' as info;
SELECT id, item_id, created_at FROM favourites WHERE user_id = @sofi_user_id;

