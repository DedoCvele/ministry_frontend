# Blog Backend Fix Guide

## Error Description

When creating a blog via POST `/api/blogs`, the backend throws this error:

```
App\Enums\BlogStatus::from(): Argument #1 ($value) must be of type int, string given
```

## Root Cause

The `BlogStatus` enum's `from()` method expects an integer value, but it's receiving a string. This typically happens when:

1. The backend tries to set a default status using a string value (e.g., "published", "draft")
2. The backend reads a status from the request that's a string
3. The enum is defined to use integer backing values but the code is passing strings

## Backend Fix Instructions

### Option 1: Fix the Blog Controller (Recommended)

In your `BlogController.php` (or wherever you handle blog creation), find the `store()` method and ensure the status is set as an integer:

**Before (incorrect):**
```php
$blog = Blog::create([
    'title' => $request->title,
    'full_story' => $request->full_story,
    'category' => $request->category,
    'short_summary' => $request->short_summary,
    'image_url' => $request->image_url,
    'status' => BlogStatus::from('published'), // ❌ Wrong - passing string
    // or
    'status' => 'published', // ❌ Wrong - passing string directly
]);
```

**After (correct):**
```php
$blog = Blog::create([
    'title' => $request->title,
    'full_story' => $request->full_story,
    'category' => $request->category,
    'short_summary' => $request->short_summary,
    'image_url' => $request->image_url,
    'status' => BlogStatus::Published->value, // ✅ Correct - using enum value
    // or
    'status' => BlogStatus::Published, // ✅ Correct - if using enum casting
]);
```

### Option 2: Check Your BlogStatus Enum Definition

Ensure your `BlogStatus` enum is properly defined with integer backing:

**Example BlogStatus Enum:**
```php
<?php

namespace App\Enums;

enum BlogStatus: int
{
    case Draft = 0;
    case Published = 1;
    case Archived = 2;
    
    // Optional: Helper method to get string representation
    public function label(): string
    {
        return match($this) {
            self::Draft => 'draft',
            self::Published => 'published',
            self::Archived => 'archived',
        };
    }
}
```

### Option 3: Use tryFrom() with Default Value

If you need to handle string inputs, use `tryFrom()` with a default:

```php
$status = BlogStatus::tryFrom($request->status ?? 'published');
if (!$status) {
    // Map string to enum
    $status = match(strtolower($request->status ?? 'published')) {
        'draft' => BlogStatus::Draft,
        'published' => BlogStatus::Published,
        'archived' => BlogStatus::Archived,
        default => BlogStatus::Published,
    };
}

$blog = Blog::create([
    // ... other fields
    'status' => $status->value, // or just $status if using enum casting
]);
```

### Option 4: Update Blog Model Casting

If your `Blog` model uses enum casting, ensure it's set up correctly:

```php
use App\Enums\BlogStatus;

class Blog extends Model
{
    protected $casts = [
        'status' => BlogStatus::class, // This will automatically cast to/from enum
    ];
    
    // Then in controller, you can use:
    // 'status' => BlogStatus::Published, // Direct enum case
}
```

## Common Issues and Solutions

### Issue 1: Default Status Assignment

**Problem:** Setting default status as string
```php
'status' => $request->status ?? 'published' // ❌ Wrong
```

**Solution:** Use enum case or value
```php
'status' => BlogStatus::Published->value, // ✅ Correct
// or
'status' => BlogStatus::Published, // ✅ Correct if using enum casting
```

### Issue 2: Reading from Request

**Problem:** Reading status from request without conversion
```php
'status' => BlogStatus::from($request->status) // ❌ Wrong if $request->status is string
```

**Solution:** Convert string to enum first
```php
$statusValue = match(strtolower($request->status ?? 'published')) {
    'draft' => 0,
    'published' => 1,
    'archived' => 2,
    default => 1,
};
'status' => BlogStatus::from($statusValue) // ✅ Correct
```

## Testing the Fix

After implementing the fix, test blog creation:

```bash
curl -X POST http://localhost:8000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Test Blog",
    "full_story": "This is a test blog post",
    "category": "Technology",
    "short_summary": "A test summary"
  }'
```

Expected response: `201 Created` with blog data including status as integer or enum.

## Frontend Changes Made

The frontend has been updated to:
- ✅ Remove the redundant `content` field from the payload
- ✅ Only send `full_story` as required by the API
- ✅ Match the API documentation exactly

The frontend now sends:
```json
{
  "title": "Blog Title",
  "full_story": "Blog content here",
  "category": "Technology",
  "short_summary": "Summary",
  "image_url": "https://example.com/image.jpg"
}
```

## Summary

The main issue is in the backend where `BlogStatus::from()` is being called with a string instead of an integer. Fix by:

1. Using `BlogStatus::Published->value` or `BlogStatus::Published` (if using enum casting)
2. Converting string status values to integers before calling `from()`
3. Using `tryFrom()` with proper error handling
4. Ensuring the Blog model uses proper enum casting

Once the backend is fixed, blog creation should work correctly.
