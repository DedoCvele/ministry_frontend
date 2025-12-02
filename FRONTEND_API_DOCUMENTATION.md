# Frontend API Documentation - Item Creation

## Important Updates
- **Items are now auto-approved**: All new items default to `approved = 1` and will show up immediately
- **Main image field added**: Items now have a direct `image` field for the main/primary image
- **Multiple images supported**: You can still upload multiple additional images via the `images` array

---

## API Endpoint: Create Item

**POST** `/api/items`

**Authentication**: Required (Bearer Token via Sanctum)

**Content-Type**: `multipart/form-data` (required for file uploads)

---

## Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `title` OR `name` | string | Item name/title | **Required** - You can send either `title` or `name` field (max 255 characters) |
| `category_id` | integer/string | Category ID or name | Required (can be ID number or category name) |
| `price` | number | Item price | Required, must be >= 0 |

---

## Optional Fields

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
| `images` | array[file] | **Additional images** (multiple files) | Optional, array of image files, each max 2MB |

---

## Image Upload

### Option 1: Main Image Only
Upload a single main image using the `image` field:
```javascript
formData.append('image', imageFile);
```

### Option 2: Multiple Images
Upload a main image AND additional images:
```javascript
formData.append('image', mainImageFile);
formData.append('images[]', additionalImage1);
formData.append('images[]', additionalImage2);
formData.append('images[]', additionalImage3);
```

### Option 3: Additional Images Only
Upload only additional images (no main image):
```javascript
formData.append('images[]', image1);
formData.append('images[]', image2);
```

**Note**: The first image in the `images[]` array will automatically be marked as the main image (`is_main = true`) if no main `image` field is provided.

---

## Example Request (JavaScript/Fetch)

### Basic Example with Main Image

```javascript
const formData = new FormData();

// Required fields
// Note: You can use either 'title' OR 'name' field
formData.append('title', 'Vintage Leather Jacket'); // or use 'name' instead
formData.append('category_id', 1); // or 'Clothing' (category name)
formData.append('price', 150.00);

// Optional fields
formData.append('description', 'Beautiful vintage leather jacket in excellent condition');
formData.append('material', '100% Genuine Leather');
formData.append('size', 'M');
formData.append('condition', 'Excellent');
formData.append('brand_id', 2); // or 'Zara' (brand name)
formData.append('location', 'Skopje');
formData.append('stock', 1);

// Tags (can be string or array)
formData.append('tags', 'vintage, leather, jacket');

// Main image
if (mainImageFile) {
    formData.append('image', mainImageFile);
}

// Additional images (optional)
if (additionalImages && additionalImages.length > 0) {
    additionalImages.forEach((img) => {
        formData.append('images[]', img);
    });
}

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

### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('title', 'Vintage Leather Jacket');
formData.append('category_id', 1);
formData.append('price', 150.00);
formData.append('description', 'Beautiful vintage leather jacket');
formData.append('image', imageFile);
formData.append('images[]', image1);
formData.append('images[]', image2);

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

---

## Response Format

### Success Response (201 Created)

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
            }
        ],
        "created_at": "2025-12-02T22:00:00.000000Z",
        "updated_at": "2025-12-02T22:00:00.000000Z"
    }
}
```

### Error Response (422 Validation Error)

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

### Error Response (401 Unauthenticated)

```json
{
    "message": "Unauthenticated"
}
```

---

## Response Fields

The response includes these important fields:

- `image`: Path to the main image (e.g., `"items/abc123.jpg"`)
- `image_url`: Full URL to access the main image (e.g., `"http://your-api-url/storage/items/abc123.jpg"`)
- `approved`: Always `1` for new items (items are auto-approved)
- `images`: Array of additional images with `url` field for each

---

## Important Notes

### 1. Title/Name Field
- **You can send either `title` OR `name` field** - both are accepted
- If you send both, `title` takes priority
- Example: `formData.append('title', 'Item Name')` OR `formData.append('name', 'Item Name')`

### 2. Authentication
- You MUST include the Bearer token in the Authorization header
- Get the token from the login endpoint: `POST /api/login`

### 3. Category & Brand IDs
- You can send either the numeric ID (e.g., `1`) or the name (e.g., `"Clothing"`)
- If you send a name that doesn't exist, it will be created automatically

### 4. Tags Format
- Can be sent as a string: `"vintage, leather, jacket"`
- Or as an array: `["vintage", "leather", "jacket"]`
- Both will be converted to a comma-separated string in the database

### 5. Image URLs
- Always use the `image_url` field from the response to display images
- The `url` field in `images[]` array is also available for additional images
- URLs are automatically generated and point to the storage directory

### 6. Auto-Approval
- All new items are automatically approved (`approved = 1`)
- Items will appear immediately in public listings
- No admin approval needed!

### 7. File Size Limits
- Maximum file size per image: 2MB
- Supported formats: JPEG, PNG, JPG, GIF

---

## Example: Getting Categories & Brands First

Before creating an item, you might want to get available categories and brands:

```javascript
// Get categories
const categoriesResponse = await fetch('http://your-api-url/api/categories');
const categories = await categoriesResponse.json();

// Get brands
const brandsResponse = await fetch('http://your-api-url/api/brands');
const brands = await brandsResponse.json();
```

---

## Complete Example: React Component

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function CreateItemForm({ token }) {
    const [formData, setFormData] = useState({
        title: '', // You can use 'name' instead of 'title' if you prefer
        description: '',
        price: '',
        category_id: '',
        brand_id: '',
        condition: 'Good',
        image: null,
        images: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category_id', formData.category_id);
        data.append('brand_id', formData.brand_id);
        data.append('condition', formData.condition);
        
        if (formData.image) {
            data.append('image', formData.image);
        }
        
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
            {/* Your form fields here */}
        </form>
    );
}
```

---

## Questions?

- **Base URL**: Replace `http://your-api-url` with your actual API URL
- **Token**: Get from `/api/login` endpoint
- **Image storage**: Images are stored in `storage/app/public/items/` directory
- **Public access**: Make sure `php artisan storage:link` has been run to enable public image access

