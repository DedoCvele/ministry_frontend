# Backend Sizes API - Checklist for Backend Developers

## Required Endpoint

The frontend needs this endpoint to work:

```
GET /api/sizes?category_id={categoryId}
```

## What the Backend Needs to Support

### 1. Query Parameter Support

The endpoint MUST accept a `category_id` query parameter:

```php
// Laravel Controller Example
public function index(Request $request)
{
    $query = Size::query();
    
    // Filter by category_id if provided
    if ($request->has('category_id')) {
        $categoryId = $request->input('category_id');
        $query->where('category_id', $categoryId);
    }
    
    $sizes = $query->get();
    
    return response()->json([
        'status' => 'success',
        'count' => $sizes->count(),
        'data' => $sizes->map(function($size) {
            return [
                'id' => $size->id,
                'name' => $size->label, // Database uses 'label', API returns 'name'
                'category_id' => $size->category_id,
                'created_at' => $size->created_at,
                'updated_at' => $size->updated_at,
            ];
        })
    ]);
}
```

### 2. Response Format (CRITICAL)

The response MUST follow this exact format:

```json
{
    "status": "success",
    "count": 4,
    "data": [
        {
            "id": 1,
            "name": "S",
            "category_id": 1,
            "created_at": "2026-01-21T14:59:47.000000Z",
            "updated_at": "2026-01-21T14:59:47.000000Z"
        },
        {
            "id": 2,
            "name": "M",
            "category_id": 1,
            "created_at": "2026-01-21T14:59:47.000000Z",
            "updated_at": "2026-01-21T14:59:47.000000Z"
        }
    ]
}
```

**Important Notes:**
- `status` must be exactly `"success"` (string)
- `count` must be a number (integer)
- `data` must be an array
- Each size object must have `id`, `name`, and `category_id`
- Database field is `label` but API should return it as `name`

### 3. Route Configuration

Make sure the route is registered in `routes/api.php`:

```php
Route::get('/sizes', [SizeController::class, 'index']);
```

**Important:** This route should NOT require authentication (it's a public endpoint).

### 4. Database Schema Check

Verify your `sizes` table has:
- `id` (bigint, primary key)
- `category_id` (bigint, foreign key to categories)
- `label` (string) - this is what gets returned as `name` in the API
- `created_at`, `updated_at` (timestamps)

### 5. Model Configuration

Your `Size` model should have:

```php
class Size extends Model
{
    protected $fillable = ['category_id', 'label'];
    
    // Accessor to return 'label' as 'name' in API responses
    public function getNameAttribute()
    {
        return $this->label;
    }
    
    // Or use API Resources
    public function toArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->label,
            'category_id' => $this->category_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### 6. CORS Configuration

Make sure CORS is configured to allow requests from your frontend:

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000', /* your frontend URL */],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['*'],
```

## Testing the Endpoint

### Test 1: Get All Sizes
```bash
curl http://localhost:8000/api/sizes
```

Expected: Returns all sizes with `status: "success"` and `data` array

### Test 2: Get Sizes by Category
```bash
curl http://localhost:8000/api/sizes?category_id=1
```

Expected: Returns only sizes where `category_id = 1`

### Test 3: Check Response Format
```bash
curl http://localhost:8000/api/sizes?category_id=1 | jq
```

Verify:
- ✅ Has `status` field with value `"success"`
- ✅ Has `count` field (number)
- ✅ Has `data` field (array)
- ✅ Each item in `data` has `id`, `name`, `category_id`

## Common Issues and Fixes

### Issue 1: Endpoint Returns 404
**Fix:** Make sure route is registered in `routes/api.php`

### Issue 2: Endpoint Returns Empty Array
**Fix:** Check if:
- Database has sizes with matching `category_id`
- Query is filtering correctly
- Foreign key relationship is set up properly

### Issue 3: Response Format is Wrong
**Fix:** Ensure controller returns the exact format:
```php
return response()->json([
    'status' => 'success',
    'count' => $sizes->count(),
    'data' => $sizes
]);
```

### Issue 4: Field Name Mismatch
**Fix:** Database uses `label`, API should return `name`. Use accessor or API Resource.

### Issue 5: CORS Error
**Fix:** Configure CORS in `config/cors.php` and clear config cache:
```bash
php artisan config:clear
```

### Issue 6: Authentication Required
**Fix:** Remove authentication middleware from the sizes route:
```php
// routes/api.php
Route::get('/sizes', [SizeController::class, 'index']); // No auth middleware
```

## Complete Laravel Controller Example

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    /**
     * Get all sizes, optionally filtered by category_id
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Size::query();
            
            // Filter by category_id if provided
            if ($request->has('category_id') && $request->category_id) {
                $categoryId = $request->input('category_id');
                $query->where('category_id', $categoryId);
            }
            
            $sizes = $query->orderBy('label')->get();
            
            // Transform to API format
            $formattedSizes = $sizes->map(function($size) {
                return [
                    'id' => $size->id,
                    'name' => $size->label, // Database 'label' → API 'name'
                    'category_id' => $size->category_id,
                    'created_at' => $size->created_at?->toISOString(),
                    'updated_at' => $size->updated_at?->toISOString(),
                ];
            });
            
            return response()->json([
                'status' => 'success',
                'count' => $formattedSizes->count(),
                'data' => $formattedSizes
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch sizes: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

## Verification Steps

1. ✅ Route exists: `GET /api/sizes`
2. ✅ Route accepts `category_id` query parameter
3. ✅ Route does NOT require authentication
4. ✅ Response format matches exactly: `{ status, count, data }`
5. ✅ Database field `label` is returned as `name` in API
6. ✅ CORS is configured correctly
7. ✅ Database has sizes with `category_id` values
8. ✅ Query correctly filters by `category_id` when provided

## Frontend Debugging

If the backend is correct but frontend still shows 0 sizes, check browser console for:

1. **Network Tab**: 
   - Is the request being made?
   - What's the response status code?
   - What's the actual response body?

2. **Console Logs**:
   - Look for `🔍 Fetching sizes for category:` log
   - Check `🔍 Sizes API Response:` log
   - Verify `✅ Formatted unique sizes:` shows sizes

3. **Common Frontend Issues**:
   - Category not found in categories array
   - API URL incorrect
   - Response format different than expected
   - CORS blocking the request

## Quick Test Script

Save this as `test-sizes-api.php` and run it:

```php
<?php

$baseUrl = 'http://localhost:8000/api';

// Test 1: Get all sizes
echo "Test 1: Get all sizes\n";
$response = file_get_contents("$baseUrl/sizes");
$data = json_decode($response, true);
echo "Status: " . ($data['status'] ?? 'missing') . "\n";
echo "Count: " . ($data['count'] ?? 'missing') . "\n";
echo "Data items: " . count($data['data'] ?? []) . "\n\n";

// Test 2: Get sizes for category 1
echo "Test 2: Get sizes for category_id=1\n";
$response = file_get_contents("$baseUrl/sizes?category_id=1");
$data = json_decode($response, true);
echo "Status: " . ($data['status'] ?? 'missing') . "\n";
echo "Count: " . ($data['count'] ?? 'missing') . "\n";
echo "Data items: " . count($data['data'] ?? []) . "\n";
if (!empty($data['data'])) {
    echo "First size: " . json_encode($data['data'][0]) . "\n";
}
```

Run: `php test-sizes-api.php`
