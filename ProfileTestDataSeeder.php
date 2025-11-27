<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ProfileTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder populates test data for user_id = 1 for the /profile page.
     * Run with: php artisan db:seed --class=ProfileTestDataSeeder
     */
    public function run()
    {
        // 1. Update or create user info for user_id = 1
        $user = DB::table('users')->where('id', 1)->first();
        
        if ($user) {
            DB::table('users')
                ->where('id', 1)
                ->update([
                    'name' => 'Sophie Laurent',
                    'email' => 'sophie@example.com',
                    'location' => 'Skopje, North Macedonia',
                    'bio' => 'Vintage lover & sustainable fashion enthusiast.',
                    'avatar' => null,
                    'updated_at' => now(),
                ]);
        } else {
            // Create user if doesn't exist
            DB::table('users')->insert([
                'id' => 1,
                'name' => 'Sophie Laurent',
                'email' => 'sophie@example.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'), // Change this to your desired password
                'location' => 'Skopje, North Macedonia',
                'bio' => 'Vintage lover & sustainable fashion enthusiast.',
                'avatar' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Create test items that belong to user_id = 1 (for their closet)
        // Note: Adjust brand_id and category_id based on your existing data
        // You may need to check what brand_id and category_id values exist in your database
        $items = [
            [
                'user_id' => 1,
                'title' => 'Vintage Chanel Jacket',
                'description' => 'Classic black tweed jacket in excellent condition. Timeless piece from the 90s.',
                'price' => 1250.00,
                'brand_id' => 1, // Adjust based on your brands table
                'category_id' => 1, // Adjust based on your categories table
                'approval_state' => 'approved',
                'created_at' => now()->subDays(30),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'title' => 'Silk Wrap Dress',
                'description' => 'Elegant vintage silk wrap dress in navy blue. Perfect for special occasions.',
                'price' => 180.00,
                'brand_id' => 1,
                'category_id' => 2,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(25),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'title' => 'Designer Sunglasses',
                'description' => 'Vintage designer sunglasses with original case. UV protection.',
                'price' => 95.00,
                'brand_id' => 1,
                'category_id' => 3,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(20),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'title' => 'Leather Blazer',
                'description' => 'Vintage leather blazer in brown. Great condition, classic cut.',
                'price' => 285.00,
                'brand_id' => 1,
                'category_id' => 1,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(15),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'title' => 'Silk Evening Dress',
                'description' => 'Beautiful vintage silk evening dress. Perfect for formal events.',
                'price' => 290.00,
                'brand_id' => 1,
                'category_id' => 2,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(10),
                'updated_at' => now(),
            ],
        ];

        foreach ($items as $item) {
            // Check if item already exists (by title and user_id)
            $existing = DB::table('items')
                ->where('user_id', $item['user_id'])
                ->where('title', $item['title'])
                ->first();

            if (!$existing) {
                DB::table('items')->insert($item);
            }
        }

        // Get item IDs for orders and favourites
        $userItems = DB::table('items')
            ->where('user_id', 1)
            ->pluck('id')
            ->toArray();

        // Get items from OTHER users for favourites
        $otherUserItems = DB::table('items')
            ->where('user_id', '!=', 1)
            ->pluck('id')
            ->take(4)
            ->toArray();

        // If no items from other users exist, create some placeholder items
        if (empty($otherUserItems)) {
            // You may want to create items from user_id = 2 or skip favourites
            $this->command->warn('No items from other users found. Favourites will be skipped.');
        }

        // 3. Create test orders for user_id = 1
        // These are items that user_id = 1 PURCHASED (not items they're selling)
        // Use items from other users or existing items
        $orders = [
            [
                'user_id' => 1,
                'item_id' => $userItems[0] ?? 1, // Use first item or fallback
                'status' => 'delivered',
                'price' => 240.00,
                'created_at' => now()->subDays(45),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'item_id' => $userItems[1] ?? 2,
                'status' => 'shipped',
                'price' => 385.00,
                'created_at' => now()->subDays(30),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'item_id' => $userItems[2] ?? 3,
                'status' => 'delivered',
                'price' => 180.00,
                'created_at' => now()->subDays(20),
                'updated_at' => now(),
            ],
        ];

        foreach ($orders as $order) {
            // Check if order already exists
            $existing = DB::table('orders')
                ->where('user_id', $order['user_id'])
                ->where('item_id', $order['item_id'])
                ->first();

            if (!$existing) {
                DB::table('orders')->insert($order);
            }
        }

        // 4. Create test favourites for user_id = 1
        // These should be items from OTHER users (not user_id = 1's own items)
        if (!empty($otherUserItems)) {
            foreach ($otherUserItems as $itemId) {
                $existing = DB::table('favourites')
                    ->where('user_id', 1)
                    ->where('item_id', $itemId)
                    ->first();

                if (!$existing) {
                    DB::table('favourites')->insert([
                        'user_id' => 1,
                        'item_id' => $itemId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Alternative table names (uncomment if your table is named differently):
        // 'wishlist' or 'saved_items'
        // DB::table('wishlist')->insert([...]);
        // DB::table('saved_items')->insert([...]);

        $this->command->info('Profile test data seeded successfully!');
        $this->command->info('User ID 1: Sophie Laurent');
        $this->command->info('Items created: ' . count($userItems));
        $this->command->info('Orders created: ' . count($orders));
        $this->command->info('Favourites created: ' . (empty($otherUserItems) ? 0 : count($otherUserItems)));
    }
}

