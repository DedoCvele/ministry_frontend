<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SofiUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates a complete test user "sofi@sofi" with:
     * - User profile info
     * - 5 items in their closet
     * - 3 orders (purchases)
     * - 4 favourites
     * 
     * Run with: php artisan db:seed --class=SofiUserSeeder
     */
    public function run()
    {
        // 1. Create or update Sofi user
        $sofiUser = DB::table('users')->where('email', 'sofi@sofi')->first();
        
        if ($sofiUser) {
            DB::table('users')
                ->where('email', 'sofi@sofi')
                ->update([
                    'name' => 'Sofi Laurent',
                    'location' => 'Skopje, North Macedonia',
                    'bio' => 'Vintage lover & sustainable fashion enthusiast. Curator of timeless pieces.',
                    'avatar' => null,
                    'updated_at' => now(),
                ]);
            $sofiUserId = $sofiUser->id;
        } else {
            $sofiUserId = DB::table('users')->insertGetId([
                'name' => 'Sofi Laurent',
                'email' => 'sofi@sofi',
                'email_verified_at' => now(),
                'password' => Hash::make('123123123'),
                'location' => 'Skopje, North Macedonia',
                'bio' => 'Vintage lover & sustainable fashion enthusiast. Curator of timeless pieces.',
                'avatar' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info("Sofi user ID: {$sofiUserId}");

        // 2. Create items that belong to Sofi (for her closet)
        $sofiItems = [
            [
                'user_id' => $sofiUserId,
                'title' => 'Vintage Chanel Jacket',
                'description' => 'Classic black tweed jacket in excellent condition. Timeless piece from the 90s.',
                'price' => 1250.00,
                'brand_id' => 1, // Adjust based on your brands
                'category_id' => 1, // Adjust based on your categories
                'approval_state' => 'approved',
                'created_at' => now()->subDays(30),
                'updated_at' => now(),
            ],
            [
                'user_id' => $sofiUserId,
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
                'user_id' => $sofiUserId,
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
                'user_id' => $sofiUserId,
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
                'user_id' => $sofiUserId,
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

        foreach ($sofiItems as $item) {
            $existing = DB::table('items')
                ->where('user_id', $sofiUserId)
                ->where('title', $item['title'])
                ->first();

            if (!$existing) {
                DB::table('items')->insert($item);
            }
        }

        // 3. Ensure we have another user to create items for orders/favourites
        $otherUser = DB::table('users')->where('email', '!=', 'sofi@sofi')->first();
        
        if (!$otherUser) {
            $otherUserId = DB::table('users')->insertGetId([
                'name' => 'Other Seller',
                'email' => 'seller@example.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $otherUserId = $otherUser->id;
        }

        // 4. Create items from other user (for Sofi to order and favourite)
        $otherUserItems = [
            [
                'user_id' => $otherUserId,
                'title' => 'Vintage Hermès Silk Scarf',
                'description' => 'Beautiful vintage Hermès silk scarf in excellent condition.',
                'price' => 240.00,
                'brand_id' => 1,
                'category_id' => 1,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(50),
                'updated_at' => now(),
            ],
            [
                'user_id' => $otherUserId,
                'title' => 'Classic Burberry Trench',
                'description' => 'Timeless Burberry trench coat, perfect condition.',
                'price' => 385.00,
                'brand_id' => 1,
                'category_id' => 1,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(45),
                'updated_at' => now(),
            ],
            [
                'user_id' => $otherUserId,
                'title' => 'Designer Leather Loafers',
                'description' => 'Vintage designer leather loafers, barely worn.',
                'price' => 180.00,
                'brand_id' => 1,
                'category_id' => 1,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(40),
                'updated_at' => now(),
            ],
            [
                'user_id' => $otherUserId,
                'title' => 'Vintage Gucci Marmont Bag',
                'description' => 'Classic Gucci Marmont bag in black leather.',
                'price' => 890.00,
                'brand_id' => 1,
                'category_id' => 1,
                'approval_state' => 'approved',
                'created_at' => now()->subDays(35),
                'updated_at' => now(),
            ],
        ];

        $otherItemIds = [];
        foreach ($otherUserItems as $item) {
            $existing = DB::table('items')
                ->where('user_id', $otherUserId)
                ->where('title', $item['title'])
                ->first();

            if (!$existing) {
                $itemId = DB::table('items')->insertGetId($item);
                $otherItemIds[] = $itemId;
            } else {
                $otherItemIds[] = $existing->id;
            }
        }

        // 5. Create orders for Sofi (items she purchased)
        $orders = [
            [
                'user_id' => $sofiUserId,
                'item_id' => $otherItemIds[0] ?? 1,
                'status' => 'delivered',
                'price' => 240.00,
                'created_at' => now()->subDays(45),
                'updated_at' => now(),
            ],
            [
                'user_id' => $sofiUserId,
                'item_id' => $otherItemIds[1] ?? 2,
                'status' => 'shipped',
                'price' => 385.00,
                'created_at' => now()->subDays(30),
                'updated_at' => now(),
            ],
            [
                'user_id' => $sofiUserId,
                'item_id' => $otherItemIds[2] ?? 3,
                'status' => 'delivered',
                'price' => 180.00,
                'created_at' => now()->subDays(20),
                'updated_at' => now(),
            ],
        ];

        foreach ($orders as $order) {
            $existing = DB::table('orders')
                ->where('user_id', $sofiUserId)
                ->where('item_id', $order['item_id'])
                ->first();

            if (!$existing) {
                DB::table('orders')->insert($order);
            }
        }

        // 6. Create favourites for Sofi (items from other users)
        $favouriteItemIds = array_slice($otherItemIds, 0, 4);
        
        foreach ($favouriteItemIds as $itemId) {
            $existing = DB::table('favourites')
                ->where('user_id', $sofiUserId)
                ->where('item_id', $itemId)
                ->first();

            if (!$existing) {
                DB::table('favourites')->insert([
                    'user_id' => $sofiUserId,
                    'item_id' => $itemId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Alternative table names (uncomment if needed):
        // DB::table('wishlist')->insert([...]);
        // DB::table('saved_items')->insert([...]);

        $this->command->info('✅ Sofi user seeded successfully!');
        $this->command->info("📧 Email: sofi@sofi");
        $this->command->info("🔑 Password: 123123123");
        $this->command->info("👤 User ID: {$sofiUserId}");
        $this->command->info("📦 Items in closet: " . DB::table('items')->where('user_id', $sofiUserId)->count());
        $this->command->info("🛒 Orders: " . DB::table('orders')->where('user_id', $sofiUserId)->count());
        $this->command->info("❤️  Favourites: " . DB::table('favourites')->where('user_id', $sofiUserId)->count());
    }
}

