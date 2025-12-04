# Frontend API Documentation

Complete API documentation for the SecondHand application.

## Table of Contents

1. [Authentication](#authentication)
2. [Items API](#items-api)
3. [Categories API](#categories-api)
4. [Brands API](#brands-api)
5. [Sizes API](#sizes-api)
6. [Blogs API](#blogs-api)
7. [Users API](#users-api)
8. [Profile API](#profile-api)
9. [Admin API](#admin-api)
10. [Closets API](#closets-api)

---

## Important Updates

- **Items are now auto-approved**: All new items default to `approved = 1` and will show up immediately
- **Multiple images supported**: You can upload multiple images using the `images[]` array - **this is now the recommended way**
- **First image is main**: The first image in the `images[]` array is automatically set as the main image
- **Main image field**: Items also have a direct `image` field for backward compatibility

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
        "email": "john@example.com"
    },
    "token": "1|abc123...",
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
        "email": "john@example.com"
    },
    "token": "1|abc123...",
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

### Get Authenticated User

**GET** `/api/me`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

---

## Items API

### Get All Items

**GET** `/api/items`

**Authentication**: Not required

**Response** (200 OK):
```json
[
    {
        "id": 1,
        "name": "Vintage Leather Jacket",
        "description": "...",
        "price": "150.00",
        "image": "items/abc123.jpg",
        "image_url": "http://your-api-url/storage/items/abc123.jpg",
        "approved": 1,
        "category": { "id": 1, "name": "Clothing" },
        "brand": { "id": 2, "name": "Zara" },
        "user": { "id": 5, "name": "John Doe" }
    }
]
```

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
        "description": "...",
        "price": "150.00",
        "image": "items/abc123.jpg",
        "image_url": "http://your-api-url/storage/items/abc123.jpg",
        "approved": 1,
        "category": { "id": 1, "name": "Clothing" },
        "brand": { "id": 2, "name": "Zara" },
        "user": { "id": 5, "name": "John Doe" },
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

**Content-Type**: `multipart/form-data` (required for file uploads)

#### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `title` OR `name` | string | Item name/title | **Required** - You can send either `title` or `name` field (max 255 characters) |
| `category_id` | integer/string | Category ID or name | Required (can be ID number or category name) |
| `price` | number | Item price | Required, must be >= 0 |

#### Optional Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `description` | string | Item description | Optional, text |
| `material` | string | Material composition | Optional, text |
| `size` | string | Item size | Optional, max 255 characters |
| `tags` | string/array | Item tags | Optional (can be string or array) |
| `condition` | string | Item condition | Optional, must be one of: `"New with tags"`, `"Excellent"`, `"Very good"`, `"Good"`, `"Fair"` (default: "Good") |
| `status` | string | Item status | Optional, default: "available" |
| `location` | string | Item location | Optional, max 255 characters |
| `brand_id` | integer/string | Brand ID or name | Optional (can be ID number or brand name) |
| `stock` | integer | Stock quantity | Optional, default: 1, min: 1 |
| `image` | file | **Main image** (single file) | Optional, image file (jpeg, png, jpg, gif), max 2MB |
| `images[]` | array[file] | **Multiple images** (recommended) | Optional, array of image files, each max 2MB |

#### Image Upload - Multiple Images (Recommended)

**The recommended way to upload images is using the `images[]` array:**

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

// Upload multiple images - RECOMMENDED WAY
const imageFiles = [image1, image2, image3]; // File objects from input
imageFiles.forEach((file) => {
    formData.append('images[]', file);
});

// The first image in the array will automatically be set as the main image
```

**Alternative: Using single main image + additional images:**

```javascript
// Main image (optional)
if (mainImageFile) {
    formData.append('image', mainImageFile);
}

// Additional images
additionalImages.forEach((img) => {
    formData.append('images[]', img);
});
```

**Note**: 
- The first image in the `images[]` array is automatically marked as the main image (`is_main = true`)
- If you provide both `image` and `images[]`, both will be saved
- All images are stored in the `item_images` table
- Maximum file size per image: 2MB
- Supported formats: JPEG, PNG, JPG, GIF

#### Complete Example (JavaScript/Fetch)

```javascript
const formData = new FormData();

// Required fields
formData.append('title', 'Vintage Leather Jacket');
formData.append('category_id', 1);
formData.append('price', 150.00);

// Optional fields
formData.append('description', 'Beautiful vintage leather jacket in excellent condition');
formData.append('material', '100% Genuine Leather');
formData.append('size', 'M');
formData.append('condition', 'Excellent');
formData.append('brand_id', 2);
formData.append('location', 'Skopje');
formData.append('stock', 1);
formData.append('tags', 'vintage, leather, jacket');

// Multiple images (recommended)
const imageFiles = document.querySelector('input[type="file"][multiple]').files;
Array.from(imageFiles).forEach((file) => {
    formData.append('images[]', file);
});

// Send request
const response = await fetch('http://your-api-url/api/items', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${yourAuthToken}`,
        'Accept': 'application/json',
    },
    body: formData
});

const data = await response.json();
console.log(data);
```

#### Example Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('title', 'Vintage Leather Jacket');
formData.append('category_id', 1);
formData.append('price', 150.00);
formData.append('description', 'Beautiful vintage leather jacket');

// Multiple images
const imageFiles = [image1, image2, image3];
imageFiles.forEach((file) => {
    formData.append('images[]', file);
});

try {
    const response = await axios.post('http://your-api-url/api/items', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        }
    });
    console.log('Item created:', response.data);
} catch (error) {
    console.error('Error creating item:', error.response?.data);
}
```

#### Success Response (201 Created)

```json
{
    "status": "success",
    "message": "Item created successfully",
    "data": {
        "id": 123,
        "name": "Vintage Leather Jacket",
        "title": "Vintage Leather Jacket",
        "description": "Beautiful vintage leather jacket in excellent condition",
        "price": "150.00",
        "image": "items/abc123.jpg",
        "image_url": "http://your-api-url/storage/items/abc123.jpg",
        "approved": 1,
        "user_id": 5,
        "category_id": 1,
        "brand_id": 2,
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
        "created_at": "2025-12-02T22:00:00.000000Z",
        "updated_at": "2025-12-02T22:00:00.000000Z"
    }
}
```

#### Error Response (422 Validation Error)

```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": {
        "title": ["The title field is required."],
        "category_id": ["The category id field is required."],
        "price": ["The price field is required."]
    }
}
```

### Update Item

**PUT** `/api/items/{id}`

**Authentication**: Required (Bearer Token)

**Note**: Currently accepts all fields. Full validation may be added in the future.

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
        "created_at": "...",
        "updated_at": "..."
    }
]
```

### Get Single Size

**GET** `/api/sizes/{id}`

**Authentication**: Not required

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
            "status": "published",
            "created_at": "..."
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
        "status": "published"
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
- `image` (optional, file)

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

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data`

**Request Body**:
- `title` (optional, string)
- `content` (optional, string)
- `image` (optional, file)

### Delete Blog

**DELETE** `/api/blogs/{id}`

**Authentication**: Required (Bearer Token)

---

## Users API

### Get User

**GET** `/api/users/{id}`

**Authentication**: Not required

### Get User Closet

**GET** `/api/users/{id}/closet`

**Authentication**: Not required

### Get User Orders

**GET** `/api/users/{id}/orders`

**Authentication**: Not required

### Get User Favourites

**GET** `/api/users/{id}/favourites`

**Authentication**: Not required

### Get User Stats

**GET** `/api/users/{id}/stats`

**Authentication**: Not required

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
        "email": "john@example.com"
    }
}
```

### Update Profile

**PUT** `/api/profile`

**Authentication**: Required (Bearer Token)

**Request Body**:
- `name` (optional, string)
- `email` (optional, string, must be unique)

### Delete Profile

**DELETE** `/api/profile`

**Authentication**: Required (Bearer Token)

**Request Body**:
- `password` (required, string) - current password for confirmation

---

## Admin API

### Get Pending Items

**GET** `/api/admin/pending-items`

**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 2,
    "data": [
        {
            "id": 1,
            "name": "Item Name",
            "approved": 2,
            "user": { "id": 5, "name": "John Doe" },
            "category": { "id": 1, "name": "Clothing" }
        }
    ]
}
```

**Note**: Returns items with `approved = 2` (special status)

### Approve Item

**PUT** `/api/admin/approve/{id}`

**Authentication**: Required (Bearer Token)

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

### Decline Item (Mark Special Status)

**PUT** `/api/admin/decline/{id}`

**Authentication**: Required (Bearer Token)

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

---

## Closets API

### Get All Closets

**GET** `/api/closets`

**Authentication**: Not required

### Get User Closet

**GET** `/api/closets/{userId}`

**Authentication**: Not required

---

## Important Notes

### 1. Title/Name Field
- **You can send either `title` OR `name` field** - both are accepted
- If you send both, `title` takes priority
- Example: `formData.append('title', 'Item Name')` OR `formData.append('name', 'Item Name')`

### 2. Authentication
- You MUST include the Bearer token in the Authorization header for protected routes
- Get the token from the login endpoint: `POST /api/login`
- Format: `Authorization: Bearer {token}`

### 3. Category & Brand IDs
- You can send either the numeric ID (e.g., `1`) or the name (e.g., `"Clothing"`)
- If you send a name that doesn't exist, it will be created automatically
- Example: `formData.append('category_id', 1)` OR `formData.append('category_id', 'Clothing')`

### 4. Tags Format
- Can be sent as a string: `"vintage, leather, jacket"`
- Or as an array: `["vintage", "leather", "jacket"]`
- Both will be converted to a comma-separated string in the database

### 5. Image URLs
- Always use the `image_url` field from the response to display images
- The `url` field in `images[]` array is also available for additional images
- URLs are automatically generated and point to the storage directory
- Format: `http://your-api-url/storage/{path}`

### 6. Auto-Approval
- All new items are automatically approved (`approved = 1`)
- Items will appear immediately in public listings
- No admin approval needed!

### 7. File Size Limits
- Maximum file size per image: 2MB
- Supported formats: JPEG, PNG, JPG, GIF

### 8. Multiple Images (Recommended)
- **Use `images[]` array for uploading multiple images** - this is the recommended way
- The first image in the array is automatically set as the main image
- All images are stored in the `item_images` table
- Each image can be up to 2MB
- You can upload as many images as needed

---

## Complete Example: React Component with Multiple Images

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function CreateItemForm({ token }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        brand_id: '',
        condition: 'Good',
        images: []
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, images: files });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category_id', formData.category_id);
        data.append('brand_id', formData.brand_id);
        data.append('condition', formData.condition);
        
        // Upload multiple images
        formData.images.forEach((img) => {
            data.append('images[]', img);
        });

        try {
            const response = await axios.post('http://your-api-url/api/items', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            console.log('Item created:', response.data);
            // Handle success (redirect, show message, etc.)
        } catch (error) {
            console.error('Error:', error.response?.data);
            // Handle error
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Item Title"
                required
            />
            
            <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description"
            />
            
            <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="Price"
                required
            />
            
            {/* Multiple image upload */}
            <input 
                type="file" 
                multiple
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleImageChange}
            />
            
            <button type="submit">Create Item</button>
        </form>
    );
}
```

---

## Getting Started

### 1. Get Categories & Brands First

Before creating an item, you might want to get available categories and brands:

```javascript
// Get categories
const categoriesResponse = await fetch('http://your-api-url/api/categories');
const categories = await categoriesResponse.json();

// Get brands
const brandsResponse = await fetch('http://your-api-url/api/brands');
const brands = await brandsResponse.json();

// Get available conditions
const conditionsResponse = await fetch('http://your-api-url/api/conditions');
const conditions = await conditionsResponse.json();
```

### 2. Authenticate

```javascript
// Login
const loginResponse = await fetch('http://your-api-url/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});

const { token } = await loginResponse.json();
// Store token for subsequent requests
```

### 3. Create Item with Multiple Images

```javascript
const formData = new FormData();
formData.append('title', 'My Item');
formData.append('category_id', 1);
formData.append('price', 100);

// Add multiple images
const imageFiles = [file1, file2, file3];
imageFiles.forEach(file => {
    formData.append('images[]', file);
});

const response = await fetch('http://your-api-url/api/items', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    },
    body: formData
});
```

---

## Questions?

- **Base URL**: Replace `http://your-api-url` with your actual API URL
- **Token**: Get from `/api/login` endpoint
- **Image storage**: Images are stored in `storage/app/public/items/` directory
- **Public access**: Make sure `php artisan storage:link` has been run to enable public image access
- **Multiple images**: Use `images[]` array - the first image will be the main image automatically
