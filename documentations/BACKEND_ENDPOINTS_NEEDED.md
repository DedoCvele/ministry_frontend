# Backend API Endpoints Needed for Profile Page

The frontend ProfilePage component is trying to call these endpoints that may not exist yet:

## Required Endpoints

### 1. Get User Orders
**Endpoint:** `GET /api/users/{id}/orders`  
**OR:** `GET /api/profile/orders` (for authenticated user)  
**OR:** `GET /api/orders?user_id={id}`

**Expected Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "item_id": 5,
      "name": "Vintage Hermès Silk Scarf",
      "price": 240.00,
      "seller": "Sophie Laurent",
      "image": "https://...",
      "status": "delivered",
      "date": "2025-10-24"
    }
  ]
}
```

### 2. Get User Favourites
**Endpoint:** `GET /api/users/{id}/favourites`  
**OR:** `GET /api/profile/favourites` (for authenticated user)  
**OR:** `GET /api/favourites?user_id={id}`

**Expected Response:**
```json
{
  "favourites": [
    {
      "id": 1,
      "type": "item",
      "name": "Vintage Gucci Marmont Bag",
      "price": 890.00,
      "seller": "LuxeFinds",
      "image": "https://..."
    }
  ]
}
```

### 3. Get User Closet Items
**Currently using:** `GET /api/items` (filters by user_id on frontend)  
**OR:** `GET /api/users/{id}/closet`  
**OR:** `GET /api/profile/closet`

**Expected Response:**
```json
{
  "closet": [
    {
      "id": 1,
      "name": "Vintage Chanel Jacket",
      "price": 1250.00,
      "image": "https://...",
      "views": 342,
      "saves": 28,
      "messages": 5
    }
  ]
}
```

## Quick Laravel Controller Example

If you need to create these endpoints quickly, here's a basic controller:

```php
// In routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/{id}/orders', [ProfileController::class, 'getOrders']);
    Route::get('/users/{id}/favourites', [ProfileController::class, 'getFavourites']);
    Route::get('/users/{id}/closet', [ProfileController::class, 'getCloset']);
});

// In ProfileController.php
public function getOrders($id) {
    $orders = Order::where('user_id', $id)
        ->with('item')
        ->get()
        ->map(function($order) {
            return [
                'id' => $order->id,
                'name' => $order->item->title ?? 'Unknown',
                'price' => $order->price ?? $order->item->price ?? 0,
                'seller' => $order->item->user->name ?? 'Unknown',
                'image' => $order->item->images->first()->url ?? '',
                'status' => $order->status,
                'date' => $order->created_at->format('M d, Y'),
            ];
        });
    
    return response()->json(['orders' => $orders]);
}

public function getFavourites($id) {
    $favourites = Favourite::where('user_id', $id)
        ->with('item')
        ->get()
        ->map(function($fav) {
            return [
                'id' => $fav->id,
                'type' => 'item',
                'name' => $fav->item->title ?? 'Unknown',
                'price' => $fav->item->price ?? 0,
                'seller' => $fav->item->user->name ?? 'Unknown',
                'image' => $fav->item->images->first()->url ?? '',
            ];
        });
    
    return response()->json(['favourites' => $favourites]);
}

public function getCloset($id) {
    $items = Item::where('user_id', $id)
        ->where('approval_state', 'approved')
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->id,
                'name' => $item->title,
                'price' => $item->price,
                'image' => $item->images->first()->url ?? '',
                'views' => $item->views ?? 0,
                'saves' => $item->saves ?? 0,
                'messages' => $item->messages ?? 0,
            ];
        });
    
    return response()->json(['closet' => $items]);
}
```

## Current Status

- ✅ `/api/items` - EXISTS (used for closet items)
- ❌ `/api/users/{id}/orders` - NEEDS TO BE CREATED
- ❌ `/api/users/{id}/favourites` - NEEDS TO BE CREATED
- ⚠️ `/api/users/{id}/closet` - OPTIONAL (currently using `/api/items` with filtering)

## Testing

After creating the endpoints, test them:

```bash
# Test orders
curl http://127.0.0.1:8000/api/users/1/orders

# Test favourites  
curl http://127.0.0.1:8000/api/users/1/favourites

# Test closet
curl http://127.0.0.1:8000/api/users/1/closet
```

Make sure to include authentication if the endpoints require it!

