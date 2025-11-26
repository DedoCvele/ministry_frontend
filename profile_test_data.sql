-- Profile Test Data for User ID = 1
-- Run this SQL file to populate test data for the /profile page

-- 1. Update user info for user_id = 1
UPDATE users 
SET 
    name = 'Sophie Laurent',
    email = 'sophie@example.com',
    location = 'Skopje, North Macedonia',
    bio = 'Vintage lover & sustainable fashion enthusiast.',
    avatar = NULL,
    updated_at = NOW()
WHERE id = 1;

-- If user_id = 1 doesn't exist, create it first:
-- INSERT INTO users (id, name, email, email_verified_at, password, location, bio, avatar, created_at, updated_at)
-- VALUES (1, 'Sophie Laurent', 'sophie@example.com', NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Skopje, North Macedonia', 'Vintage lover & sustainable fashion enthusiast.', NULL, NOW(), NOW())
-- ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), location = VALUES(location), bio = VALUES(bio);

-- 2. Create test items that belong to user_id = 1 (for their closet)
-- Note: Adjust brand_id and category_id based on your existing data
INSERT INTO items (user_id, title, description, price, brand_id, category_id, approval_state, created_at, updated_at)
VALUES
    (1, 'Vintage Chanel Jacket', 'Classic black tweed jacket in excellent condition. Timeless piece from the 90s.', 1250.00, 1, 1, 'approved', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
    (1, 'Silk Wrap Dress', 'Elegant vintage silk wrap dress in navy blue. Perfect for special occasions.', 180.00, 2, 2, 'approved', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
    (1, 'Designer Sunglasses', 'Vintage designer sunglasses with original case. UV protection.', 95.00, 3, 3, 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
    (1, 'Leather Blazer', 'Vintage leather blazer in brown. Great condition, classic cut.', 285.00, 4, 1, 'approved', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
    (1, 'Silk Evening Dress', 'Beautiful vintage silk evening dress. Perfect for formal events.', 290.00, 2, 2, 'approved', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Get the item IDs we just created (adjust if items already exist)
SET @item1 = (SELECT id FROM items WHERE user_id = 1 AND title = 'Vintage Chanel Jacket' LIMIT 1);
SET @item2 = (SELECT id FROM items WHERE user_id = 1 AND title = 'Silk Wrap Dress' LIMIT 1);
SET @item3 = (SELECT id FROM items WHERE user_id = 1 AND title = 'Designer Sunglasses' LIMIT 1);
SET @item4 = (SELECT id FROM items WHERE user_id = 1 AND title = 'Leather Blazer' LIMIT 1);
SET @item5 = (SELECT id FROM items WHERE user_id = 1 AND title = 'Silk Evening Dress' LIMIT 1);

-- If items table doesn't have these, use these IDs (adjust based on your existing items):
-- SET @item1 = 1;
-- SET @item2 = 2;
-- SET @item3 = 3;
-- SET @item4 = 4;
-- SET @item5 = 5;

-- 3. Create test orders for user_id = 1
-- Note: These orders are items that user_id = 1 PURCHASED (not sold)
-- You may need to create items from other users first, or use existing items
INSERT INTO orders (user_id, item_id, status, price, created_at, updated_at)
VALUES
    (1, COALESCE(@item1, 1), 'delivered', 240.00, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
    (1, COALESCE(@item2, 2), 'shipped', 385.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
    (1, COALESCE(@item3, 3), 'delivered', 180.00, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Alternative: If orders table structure is different, use this:
-- INSERT INTO orders (user_id, item_id, status, total_price, created_at, updated_at)
-- VALUES
--     (1, COALESCE(@item1, 1), 'delivered', 240.00, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
--     (1, COALESCE(@item2, 2), 'shipped', 385.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
--     (1, COALESCE(@item3, 3), 'delivered', 180.00, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW());

-- 4. Create test favourites for user_id = 1
-- Note: These should be items from OTHER users (not user_id = 1's own items)
-- Adjust item_ids based on items that exist in your database from other users
INSERT INTO favourites (user_id, item_id, created_at, updated_at)
VALUES
    (1, COALESCE((SELECT id FROM items WHERE user_id != 1 LIMIT 1), 10), NOW(), NOW()),
    (1, COALESCE((SELECT id FROM items WHERE user_id != 1 LIMIT 1 OFFSET 1), 11), NOW(), NOW()),
    (1, COALESCE((SELECT id FROM items WHERE user_id != 1 LIMIT 1 OFFSET 2), 12), NOW(), NOW()),
    (1, COALESCE((SELECT id FROM items WHERE user_id != 1 LIMIT 1 OFFSET 3), 13), NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Alternative table name might be 'wishlist' or 'saved_items':
-- INSERT INTO wishlist (user_id, item_id, created_at, updated_at) VALUES ...
-- INSERT INTO saved_items (user_id, item_id, created_at, updated_at) VALUES ...

-- 5. Verify the data
SELECT 'User Info:' as info;
SELECT id, name, email, location, bio FROM users WHERE id = 1;

SELECT 'User Items (Closet):' as info;
SELECT id, title, price, approval_state FROM items WHERE user_id = 1;

SELECT 'User Orders:' as info;
SELECT id, item_id, status, price, created_at FROM orders WHERE user_id = 1;

SELECT 'User Favourites:' as info;
SELECT id, item_id, created_at FROM favourites WHERE user_id = 1;

