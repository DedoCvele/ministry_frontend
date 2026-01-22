# SecondHand API Documentation

Complete API documentation for frontend integration.

**Base URL**: `http://your-api-url/api`  
**Authentication**: Bearer Token (Sanctum)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Items API](#items-api)
4. [Profile API](#profile-api)
5. [Users API](#users-api)
6. [Blogs API](#blogs-api)
7. [Categories API](#categories-api)
8. [Brands API](#brands-api)
9. [Sizes API](#sizes-api)
10. [Favorites API](#favorites-api)
11. [Admin API](#admin-api)
12. [Closets API](#closets-api)
13. [Error Handling](#error-handling)
14. [Code Examples](#code-examples)

---

## Quick Start

### 1. Authentication Flow

```javascript
// 1. Register or Login to get token
const response = await fetch('http://your-api-url/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});

const { token } = await response.json();

// 2. Store token
localStorage.setItem('auth_token', token);

// 3. Use token in subsequent requests
const itemsResponse = await fetch('http://your-api-url/api/items', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
});
```

### 2. User Roles

The API uses integer enum values for roles:
- `1` = Admin
- `2` = Buyer
- `3` = Seller

---

## Authentication

### Register User

**POST** `/api/register`

**Authentication**: Not required

**Request Body**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response** (201 Created):
```json
{
    "status": "success",
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": 2,
        "created_at": "2025-01-22T00:00:00.000000Z"
    },
    "token": "1|abcdef1234567890...",
    "token_type": "Bearer"
}
```

### Login

**POST** `/api/login`

**Authentication**: Not required

**Request Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": 2,
        "profile_picture_url": null
    },
    "token": "2|xyz789abcdef...",
    "token_type": "Bearer"
}
```

### Logout

**POST** `/api/logout`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/api/me`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": 2,
        "phone": "+1234567890",
        "city": "Skopje",
        "bio": "Fashion enthusiast",
        "profile_picture_url": "https://example.com/profile.jpg"
    }
}
```

---

## Items API

### Get All Items

**GET** `/api/items`

**Authentication**: Not required

**Query Parameters**:
- `approved` (integer|array) - Filter by approval status (0, 1, 2, 3). Admins can filter by any status, non-admins only see approved items (1, 2, 3)
- `brand` (integer) - Filter by brand ID
- `category` (integer) - Filter by category ID
- `condition` (string) - Filter by condition
- `search` (string) - Search by item name
- `sort_by` (string) - Sort field: `created_at`, `name`, `price`, `approved` (default: `created_at`)
- `sort_order` (string) - Sort direction: `asc` or `desc` (default: `desc`)
- `per_page` (integer) - Items per page (default: 15)

**Example**:
```
GET /api/items?approved=1&category=5&sort_by=price&sort_order=asc&per_page=20
```

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 150,
    "data": [
        {
            "id": 1,
            "name": "Vintage Leather Jacket",
            "description": "Beautiful vintage leather jacket",
            "price": "150.00",
            "condition": "Excellent",
            "material": "100% Leather",
            "size": "M",
            "tags": "vintage, leather, jacket",
            "approved": 1,
            "image": "items/abc123.jpg",
            "image_url": "http://your-api-url/storage/items/abc123.jpg",
            "category": {
                "id": 1,
                "name": "Clothing",
                "slug": "clothing"
            },
            "brand": {
                "id": 2,
                "name": "Zara",
                "slug": "zara"
            },
            "user": {
                "id": 5,
                "name": "John Doe",
                "email": "john@example.com"
            },
            "images": [
                {
                    "id": 1,
                    "item_id": 1,
                    "path": "items/def456.jpg",
                    "is_main": true,
                    "url": "http://your-api-url/storage/items/def456.jpg"
                }
            ],
            "created_at": "2025-01-22T00:00:00.000000Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 10,
        "per_page": 15,
        "total": 150
    },
    "filters": {
        "approved": 1,
        "sort_by": "price",
        "sort_order": "asc"
    }
}
```

**Note**: 
- Non-admins only see items with `approved` status 1, 2, or 3 by default
- Admins can see all items including `approved = 0` (pending)
- Use `approved` query parameter to filter: `?approved=0` or `?approved[]=0&approved[]=1`

### Get Single Item

**GET** `/api/items/{id}`

**Authentication**: Not required (but authenticated users can see their own unapproved items)

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Vintage Leather Jacket",
        "description": "Beautiful vintage leather jacket",
        "price": "150.00",
        "condition": "Excellent",
        "material": "100% Leather",
        "size": "M",
        "tags": "vintage, leather, jacket",
        "approved": 1,
        "image": "items/abc123.jpg",
        "image_url": "http://your-api-url/storage/items/abc123.jpg",
        "category": {
            "id": 1,
            "name": "Clothing"
        },
        "brand": {
            "id": 2,
            "name": "Zara"
        },
        "user": {
            "id": 5,
            "name": "John Doe"
        },
        "images": [
            {
                "id": 1,
                "item_id": 1,
                "path": "items/def456.jpg",
                "is_main": true,
                "url": "http://your-api-url/storage/items/def456.jpg"
            }
        ]
    }
}
```

### Get Available Conditions

**GET** `/api/conditions`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 5,
    "data": [
        "New with tags",
        "Excellent",
        "Very good",
        "Good",
        "Fair"
    ]
}
```

### Create Item

**POST** `/api/items`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data`

**Required Fields**:
- `title` OR `name` (string) - Item name/title
- `category_id` (integer|string) - Category ID or name
- `price` (number) - Item price (>= 0)

**Optional Fields**:
- `description` (string) - Item description
- `material` (string) - Material composition
- `size` (string) - Item size (max 255 chars)
- `tags` (string|array) - Tags (comma-separated string or array)
- `condition` (string) - Must be one of: `"New with tags"`, `"Excellent"`, `"Very good"`, `"Good"`, `"Fair"` (default: `"Good"`)
- `status` (string) - Item status (default: `"available"`)
- `location` (string) - Item location
- `brand_id` (integer|string) - Brand ID or name (optional)
- `stock` (integer) - Stock quantity (default: 1, min: 1)
- `image` (file) - Main image (single file, max 2MB)
- `images[]` (array[file]) - **Multiple images (recommended)** - Array of image files, each max 2MB

**Important Notes**:
- You can send either `title` OR `name` field - both are accepted
- `category_id` and `brand_id` can be numeric IDs or names (if name doesn't exist, it will be created)
- Use `images[]` array for multiple images - **this is the recommended way**
- First image in `images[]` array is automatically set as main image
- All items are auto-approved (`approved = 1`) and appear immediately

**Example Request (JavaScript)**:
```javascript
const formData = new FormData();

// Required fields
formData.append('title', 'Vintage Leather Jacket');
formData.append('category_id', 1); // or 'Clothing'
formData.append('price', 150.00);

// Optional fields
formData.append('description', 'Beautiful vintage leather jacket');
formData.append('material', '100% Genuine Leather');
formData.append('condition', 'Excellent');
formData.append('brand_id', 2); // or 'Zara'
formData.append('tags', 'vintage, leather, jacket');

// Multiple images (recommended)
const imageFiles = [file1, file2, file3]; // File objects
imageFiles.forEach((file) => {
    formData.append('images[]', file);
});

// Send request
const response = await fetch('http://your-api-url/api/items', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    },
    body: formData
});
```

**Response** (201 Created):
```json
{
    "status": "success",
    "message": "Item created successfully",
    "data": {
        "id": 123,
        "name": "Vintage Leather Jacket",
        "description": "Beautiful vintage leather jacket",
        "price": "150.00",
        "approved": 1,
        "image": "items/abc123.jpg",
        "image_url": "http://your-api-url/storage/items/abc123.jpg",
        "category": {
            "id": 1,
            "name": "Clothing"
        },
        "brand": {
            "id": 2,
            "name": "Zara"
        },
        "user": {
            "id": 5,
            "name": "John Doe"
        },
        "images": [
            {
                "id": 1,
                "item_id": 123,
                "path": "items/def456.jpg",
                "is_main": true,
                "url": "http://your-api-url/storage/items/def456.jpg"
            },
            {
                "id": 2,
                "item_id": 123,
                "path": "items/ghi789.jpg",
                "is_main": false,
                "url": "http://your-api-url/storage/items/ghi789.jpg"
            }
        ],
        "created_at": "2025-01-22T00:00:00.000000Z"
    }
}
```

### Update Item

**PUT** `/api/items/{id}`

**Authentication**: Required (Bearer Token)

**Request Body**: Same fields as Create Item (all optional)

**Response** (200 OK):
```json
{
    "id": 123,
    "name": "Updated Item Name",
    ...
}
```

### Delete Item

**DELETE** `/api/items/{id}`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "message": "Item deleted successfully"
}
```

---

## Profile API

### Get Profile

**GET** `/api/profile`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": 2,
        "phone": "+1234567890",
        "city": "Skopje",
        "bio": "Fashion enthusiast",
        "profile_picture": "profile-pictures/abc123.jpg",
        "profile_picture_url": "http://your-api-url/storage/profile-pictures/abc123.jpg",
        "created_at": "2025-01-22T00:00:00.000000Z"
    }
}
```

### Update Profile

**PUT** `/api/profile`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data` (if uploading image) or `application/json`

**Request Body**:
- `name` (optional, string)
- `email` (optional, string, must be unique)
- `phone` (optional, string)
- `city` (optional, string)
- `bio` (optional, string, max 1000 chars)
- `profile_picture` (optional, file) - Image file

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Profile updated successfully",
    "user": {
        "id": 1,
        "name": "John Doe Updated",
        "email": "john@example.com",
        ...
    }
}
```

### Update Bio Only

**PUT** `/api/profile/bio`

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
    "bio": "My updated bio text"
}
```

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Bio updated successfully",
    "user": {
        "id": 1,
        "bio": "My updated bio text",
        ...
    }
}
```

### Update Profile Picture

**PUT** `/api/profile/picture`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data` or `application/json`

**Request Body**:
- `profile_picture` (file|string|null) - Can be:
  - Image file (uploaded to ImageKit)
  - Hex color code (e.g., `"#FF5733"`)
  - SVG string (e.g., `"<svg>...</svg>"`)
  - URL string
  - `null` or empty string to remove

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Profile picture updated successfully",
    "user": {
        "id": 1,
        "profile_picture": "https://ik.imagekit.io/...",
        "profile_picture_url": "https://ik.imagekit.io/...",
        ...
    }
}
```

### Get Profile Favorites

**GET** `/api/profile/favorites`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 5,
    "favorites": [
        {
            "id": 1,
            "name": "Vintage Leather Jacket",
            "price": "150.00",
            "category": { "id": 1, "name": "Clothing" },
            "brand": { "id": 2, "name": "Zara" },
            "user": { "id": 5, "name": "John Doe" },
            "images": [...]
        }
    ]
}
```

### Delete Profile

**DELETE** `/api/profile`

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
    "password": "current_password"
}
```

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Account deleted successfully"
}
```

---

## Users API

### Get User

**GET** `/api/users/{id}`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "user": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "role": 2,
        "phone": "+1234567890",
        "city": "Skopje",
        "bio": "Fashion enthusiast",
        "profile_picture_url": "http://your-api-url/storage/profile-pictures/abc123.jpg"
    }
}
```

### Get User Closet

**GET** `/api/users/{id}/closet`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 10,
    "items": [
        {
            "id": 1,
            "name": "Vintage Leather Jacket",
            "price": "150.00",
            "category": { "id": 1, "name": "Clothing" },
            "brand": { "id": 2, "name": "Zara" },
            ...
        }
    ]
}
```

**Note**: Only returns approved items (status 1 or 2)

### Get User Orders

**GET** `/api/users/{id}/orders`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 3,
    "orders": [
        {
            "id": 1,
            "item": { "id": 1, "name": "Vintage Leather Jacket" },
            "seller": { "id": 5, "name": "John Doe" },
            "created_at": "2025-01-22T00:00:00.000000Z"
        }
    ]
}
```

### Get User Favorites

**GET** `/api/users/{id}/favorites`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 5,
    "favorites": [
        {
            "id": 1,
            "name": "Vintage Leather Jacket",
            "price": "150.00",
            "category": { "id": 1, "name": "Clothing" },
            "brand": { "id": 2, "name": "Zara" },
            "images": [...]
        }
    ]
}
```

**Note**: Only returns approved items (status 1 or 2)

### Get User Stats

**GET** `/api/users/{id}/stats`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "totalItems": 15,
    "approvedItems": 12,
    "favourites": 5,
    "orders": 3
}
```

---

## Blogs API

### Get All Blogs

**GET** `/api/blogs`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 5,
    "data": [
        {
            "id": 1,
            "title": "Blog Title",
            "content": "Blog content...",
            "image": "blogs/abc123.jpg",
            "image_url": "http://your-api-url/storage/blogs/abc123.jpg",
            "status": "published",
            "user": {
                "id": 1,
                "name": "John Doe"
            },
            "created_at": "2025-01-22T00:00:00.000000Z"
        }
    ]
}
```

### Get Single Blog

**GET** `/api/blogs/{id}`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "title": "Blog Title",
        "content": "Blog content...",
        "image": "blogs/abc123.jpg",
        "image_url": "http://your-api-url/storage/blogs/abc123.jpg",
        "status": "published",
        "user": {
            "id": 1,
            "name": "John Doe"
        }
    }
}
```

### Create Blog

**POST** `/api/blogs`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data`

**Request Body**:
- `title` (required, string)
- `content` (required, string)
- `image` (optional, file) - Image file

**Response** (201 Created):
```json
{
    "status": "success",
    "message": "Blog created successfully",
    "data": {
        "id": 1,
        "title": "Blog Title",
        "content": "Blog content...",
        "image": "blogs/abc123.jpg",
        "status": "published"
    }
}
```

### Update Blog

**PUT** `/api/blogs/{id}`

**Authentication**: Required (Bearer Token) - Must be blog owner or admin

**Content-Type**: `multipart/form-data`

**Request Body**:
- `title` (optional, string)
- `content` (optional, string)
- `image` (optional, file) - Image file

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Blog updated successfully",
    "data": {
        "id": 1,
        "title": "Updated Blog Title",
        ...
    }
}
```

### Delete Blog

**DELETE** `/api/blogs/{id}`

**Authentication**: Required (Bearer Token) - Must be blog owner or admin

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Blog deleted successfully"
}
```

---

## Categories API

### Get All Categories

**GET** `/api/categories`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 5,
    "data": [
        {
            "id": 1,
            "name": "Clothing",
            "slug": "clothing"
        },
        {
            "id": 2,
            "name": "Shoes",
            "slug": "shoes"
        }
    ]
}
```

### Get Single Category

**GET** `/api/categories/{id}`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Clothing",
        "slug": "clothing"
    }
}
```

---

## Brands API

### Get All Brands

**GET** `/api/brands`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 10,
    "data": [
        {
            "id": 1,
            "name": "Nike",
            "slug": "nike"
        },
        {
            "id": 2,
            "name": "Zara",
            "slug": "zara"
        }
    ]
}
```

### Get Single Brand

**GET** `/api/brands/{id}`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Nike",
        "slug": "nike"
    }
}
```

---

## Sizes API

### Get All Sizes

**GET** `/api/sizes`

**Authentication**: Not required

**Response** (200 OK):
```json
[
    {
        "id": 1,
        "name": "S",
        "created_at": "2025-01-22T00:00:00.000000Z",
        "updated_at": "2025-01-22T00:00:00.000000Z"
    },
    {
        "id": 2,
        "name": "M",
        "created_at": "2025-01-22T00:00:00.000000Z",
        "updated_at": "2025-01-22T00:00:00.000000Z"
    }
]
```

### Get Single Size

**GET** `/api/sizes/{id}`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "id": 1,
    "name": "S",
    "created_at": "2025-01-22T00:00:00.000000Z",
    "updated_at": "2025-01-22T00:00:00.000000Z"
}
```

---

## Favorites API

### Toggle Favorite

**POST** `/api/items/{id}/favorite`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Item added to favorites",
    "is_favorited": true,
    "favorites_count": 5
}
```

**Note**: If item is already favorited, it will be removed and `is_favorited` will be `false`.

### Get Favorite Status

**GET** `/api/items/{id}/favorite-status`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "is_favorited": true,
    "favorites_count": 5
}
```

---

## Admin API

**Note**: All admin endpoints require authentication AND admin role (role = 1).

### Get Pending Items

**GET** `/api/admin/pending-items`

**Authentication**: Required (Bearer Token) + Admin role

**Query Parameters**:
- `approved` (integer) - Filter by approval status (0, 1, 2, 3) - default: 0
- `sort_by` (string) - Sort field: `created_at`, `approved`, `name`, `price` (default: `created_at`)
- `sort_order` (string) - Sort direction: `asc` or `desc` (default: `desc`)

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 2,
    "data": [
        {
            "id": 1,
            "name": "Item Name",
            "price": "150.00",
            "approved": 0,
            "user": {
                "id": 5,
                "name": "John Doe"
            },
            "category": {
                "id": 1,
                "name": "Clothing"
            },
            "brand": {
                "id": 2,
                "name": "Zara"
            }
        }
    ],
    "filters": {
        "approved": 0,
        "sort_by": "created_at",
        "sort_order": "desc"
    }
}
```

### Get All Items (Admin)

**GET** `/api/admin/items`

**Authentication**: Required (Bearer Token) + Admin role

**Query Parameters**:
- `approved` (integer|array) - Filter by approval status (0, 1, 2, 3) or array of statuses
- `sort_by` (string) - Sort field (default: `created_at`)
- `sort_order` (string) - Sort direction (default: `desc`)
- `per_page` (integer) - Items per page (default: 15)

**Example**:
```
GET /api/admin/items?approved[]=0&approved[]=1&sort_by=approved&per_page=20
```

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 150,
    "data": [...],
    "pagination": {
        "current_page": 1,
        "last_page": 10,
        "per_page": 15,
        "total": 150
    },
    "filters": {
        "approved": [0, 1],
        "sort_by": "approved",
        "sort_order": "desc"
    }
}
```

### Approve Item

**PUT** `/api/admin/approve/{id}`

**Authentication**: Required (Bearer Token) + Admin role

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Item approved successfully",
    "item": {
        "id": 1,
        "name": "Item Name",
        "approved": 1
    }
}
```

**Note**: Sets `approved = 1`

### Decline Item (Mark Special Status)

**PUT** `/api/admin/decline/{id}`

**Authentication**: Required (Bearer Token) + Admin role

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Item marked with special status",
    "item": {
        "id": 1,
        "name": "Item Name",
        "approved": 2
    }
}
```

**Note**: Sets `approved = 2` (special status)

---

## Closets API

### Get All Closets

**GET** `/api/closets`

**Authentication**: Not required

**Response**: Returns all user closets

### Get User Closet

**GET** `/api/closets/{userId}`

**Authentication**: Not required

**Response**: Returns items for specific user

---

## Error Handling

### Common Error Responses

#### Validation Error (422)
```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": {
        "title": ["The title field is required."],
        "email": ["The email has already been taken."]
    }
}
```

#### Authentication Error (401)
```json
{
    "message": "Unauthenticated."
}
```

#### Authorization Error (403)
```json
{
    "status": "error",
    "message": "Unauthorized action"
}
```

#### Not Found (404)
```json
{
    "status": "error",
    "message": "Item not found"
}
```

#### Server Error (500)
```json
{
    "status": "error",
    "message": "An unexpected error occurred",
    "error": "Error details..."
}
```

---

## Code Examples

### Complete React Example

```javascript
// api.js - API service
const API_BASE_URL = 'http://your-api-url/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Accept': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }

        return data;
    }

    // Authentication
    async login(email, password) {
        const data = await this.request('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async register(userData) {
        const data = await this.request('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async logout() {
        try {
            await this.request('/logout', { method: 'POST' });
        } finally {
            this.removeToken();
        }
    }

    async getCurrentUser() {
        return await this.request('/me');
    }

    // Items
    async getItems(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/items?${params}`);
    }

    async getItem(id) {
        return await this.request(`/items/${id}`);
    }

    async createItem(itemData) {
        const formData = new FormData();
        
        // Required fields
        formData.append('title', itemData.title);
        formData.append('category_id', itemData.category_id);
        formData.append('price', itemData.price);

        // Optional fields
        if (itemData.description) formData.append('description', itemData.description);
        if (itemData.brand_id) formData.append('brand_id', itemData.brand_id);
        if (itemData.condition) formData.append('condition', itemData.condition);
        if (itemData.tags) formData.append('tags', itemData.tags);

        // Multiple images
        if (itemData.images) {
            itemData.images.forEach(file => {
                formData.append('images[]', file);
            });
        }

        return await this.request('/items', {
            method: 'POST',
            body: formData
        });
    }

    async updateItem(id, itemData) {
        return await this.request(`/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        });
    }

    async deleteItem(id) {
        return await this.request(`/items/${id}`, {
            method: 'DELETE'
        });
    }

    // Favorites
    async toggleFavorite(itemId) {
        return await this.request(`/items/${itemId}/favorite`, {
            method: 'POST'
        });
    }

    async getFavoriteStatus(itemId) {
        return await this.request(`/items/${itemId}/favorite-status`);
    }

    // Profile
    async getProfile() {
        return await this.request('/profile');
    }

    async updateProfile(profileData) {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== null && profileData[key] !== undefined) {
                formData.append(key, profileData[key]);
            }
        });

        return await this.request('/profile', {
            method: 'PUT',
            body: formData
        });
    }

    // Admin
    async getPendingItems(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/pending-items?${params}`);
    }

    async approveItem(id) {
        return await this.request(`/admin/approve/${id}`, {
            method: 'PUT'
        });
    }

    async declineItem(id) {
        return await this.request(`/admin/decline/${id}`, {
            method: 'PUT'
        });
    }
}

export default new ApiService();
```

### Usage Example

```javascript
import api from './api';

// Login
const loginData = await api.login('user@example.com', 'password123');

// Get items with filters
const items = await api.getItems({
    approved: 1,
    category: 5,
    sort_by: 'price',
    sort_order: 'asc',
    per_page: 20
});

// Create item with images
const fileInput = document.querySelector('input[type="file"]');
const files = Array.from(fileInput.files);

const newItem = await api.createItem({
    title: 'Vintage Leather Jacket',
    category_id: 1,
    price: 150.00,
    description: 'Beautiful vintage jacket',
    condition: 'Excellent',
    images: files
});

// Toggle favorite
const favoriteData = await api.toggleFavorite(123);
console.log(favoriteData.is_favorited); // true or false
```

---

## Important Notes

### 1. Authentication
- All protected routes require `Authorization: Bearer {token}` header
- Token is obtained from `/api/login` or `/api/register`
- Store token securely (localStorage for web apps)

### 2. User Roles
- Roles are integers: `1` = Admin, `2` = Buyer, `3` = Seller
- Admin endpoints require both authentication AND admin role

### 3. Image Uploads
- Use `multipart/form-data` for file uploads
- Multiple images: Use `images[]` array (recommended)
- Single image: Use `image` field
- Max file size: 2MB per image
- Supported formats: JPEG, PNG, JPG, GIF

### 4. Category & Brand IDs
- Can send numeric ID or name string
- If name doesn't exist, it will be created automatically

### 5. Item Approval Status
- `0` = Pending (only admins can see)
- `1` = Approved (default, visible to all)
- `2` = Special status
- `3` = Special status
- Items are auto-approved on creation (`approved = 1`)

### 6. Pagination
- Use `per_page` query parameter
- Response includes `pagination` object with page info

### 7. Filtering & Sorting
- Use query parameters for filtering
- `sort_by` and `sort_order` for sorting
- Multiple values: Use array format `?approved[]=0&approved[]=1`

---

## Support

For questions or issues, contact the backend team or refer to:
- `FRONTEND_API_DOCUMENTATION.md` - Additional details
- `SANCTUM_AUTHENTICATION_DOCUMENTATION.md` - Authentication guide
- `APPROVAL_FILTER_API_DOCUMENTATION.md` - Approval filtering details

---

**Last Updated**: January 2025
