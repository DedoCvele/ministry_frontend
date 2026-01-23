# Categories & Sizes API Documentation

Complete documentation for the Categories and Sizes API endpoints and database structure.

---

## Table of Contents

1. [Database Structure](#database-structure)
2. [Model Structure](#model-structure)
3. [API Endpoints](#api-endpoints)
4. [Response Formats](#response-formats)
5. [Frontend Integration](#frontend-integration)
6. [Database Retrieval](#database-retrieval)
7. [Sizes API](#sizes-api)

---

## Database Structure

### Table: `categories`

The categories table stores all product categories in the system.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint (unsigned) | No | Primary key, auto-increment |
| `name` | string(255) | No | Category name (e.g., "Маичка", "Панталони") |
| `slug` | string(255) | No | URL-friendly slug (e.g., "maicka", "pantaloni") |
| `image` | string(255) | Yes | Image URL (nullable) |
| `image_kit_id` | string(255) | Yes | ImageKit ID for image management (nullable) |
| `created_at` | timestamp | Yes | Record creation timestamp |
| `updated_at` | timestamp | Yes | Record last update timestamp |

### Table: `sizes`

The sizes table stores all available sizes, each associated with a specific category.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | bigint (unsigned) | No | Primary key, auto-increment |
| `category_id` | bigint (unsigned) | No | Foreign key to `categories.id` |
| `label` | string(255) | No | Size label (e.g., "S", "M", "L", "42", "EU 38") |
| `created_at` | timestamp | Yes | Record creation timestamp |
| `updated_at` | timestamp | Yes | Record last update timestamp |

**Note**: The `label` field is stored in the database, but the API returns it as `name` for compatibility (handled by model accessor).

### Relationships

**Categories**:
- **Has Many**: `items` - A category can have many items
- **Has Many**: `sizes` - A category can have many sizes

**Sizes**:
- **Belongs To**: `category` - Each size belongs to one category
- **Belongs To Many**: `items` - Sizes can be associated with many items through `item_size` pivot table

### Indexes

- Primary key on `id`
- Foreign key constraints on related tables (items, sizes)

---

## Model Structure

### Model: `App\Models\Category`

**Location**: `app/Models/Category.php`

```php
class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'image',
    ];

    // Relationship: Category has many Items
    public function items() 
    { 
        return $this->hasMany(\App\Models\Item::class); 
    }
}
```

### Model Methods

- `items()` - Returns all items belonging to this category

### Model: `App\Models\Size`

**Location**: `app/Models/Size.php`

```php
class Size extends Model
{
    protected $fillable = ['label', 'category_id'];

    // Accessor: Maps 'label' to 'name' for API compatibility
    public function getNameAttribute()
    {
        return $this->attributes['label'] ?? null;
    }

    // Mutator: Sets 'label' when 'name' is provided
    public function setNameAttribute($value)
    {
        $this->attributes['label'] = $value;
    }

    // Relationship: Size belongs to Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship: Size belongs to many Items
    public function items()
    {
        return $this->belongsToMany(Item::class, 'item_size')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
```

### Model Methods

- `category()` - Returns the category this size belongs to
- `items()` - Returns all items associated with this size (many-to-many relationship)
- `name` - Accessor that returns the `label` field (for API compatibility)

**Important**: The database stores sizes in the `label` field, but the API returns it as `name` for consistency with other models.

---

## API Endpoints

### Base URL

All endpoints are prefixed with `/api`

### Authentication

**All category endpoints are public** - No authentication required.

---

### 1. Get All Categories

Retrieves all categories from the database.

**Endpoint**: `GET /api/categories`

**Controller Method**: `CategoryController@index`

**Database Query**:
```php
$categories = Category::all();
```

**How it works**:
1. Executes `SELECT * FROM categories` query
2. Retrieves all records from the `categories` table
3. Returns them as a JSON response with status, count, and data

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 21,
    "data": [
        {
            "id": 1,
            "name": "Маичка",
            "slug": "maicka",
            "image": null,
            "image_kit_id": null,
            "created_at": null,
            "updated_at": null
        },
        {
            "id": 2,
            "name": "Маичка со кратки ракави",
            "slug": "maicka-so-kratki-rakavi",
            "image": null,
            "image_kit_id": null,
            "created_at": null,
            "updated_at": null
        }
        // ... more categories
    ]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Response status, always `"success"` |
| `count` | integer | Total number of categories returned |
| `data` | array | Array of category objects |

**Category Object Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique category identifier |
| `name` | string | Category display name |
| `slug` | string | URL-friendly identifier |
| `image` | string\|null | Image URL if available |
| `image_kit_id` | string\|null | ImageKit ID if available |
| `created_at` | string\|null | ISO 8601 timestamp |
| `updated_at` | string\|null | ISO 8601 timestamp |

---

### 2. Get Single Category

Retrieves a specific category by ID.

**Endpoint**: `GET /api/categories/{id}`

**Controller Method**: `CategoryController@show`

**Database Query**:
```php
$category = Category::find($id);
```

**How it works**:
1. Executes `SELECT * FROM categories WHERE id = ?` query
2. Retrieves the category record with the specified ID
3. Returns it as JSON, or 404 if not found

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID |

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Маичка",
        "slug": "maicka",
        "image": null,
        "image_kit_id": null,
        "created_at": null,
        "updated_at": null
    }
}
```

**Error Response** (404 Not Found):
```json
{
    "status": "error",
    "message": "Category not found"
}
```

---

## Response Formats

### Success Response Structure

All successful responses follow this structure:

```json
{
    "status": "success",
    "count": <number>,  // Only in list endpoints
    "data": <array|object>
}
```

### Error Response Structure

Error responses follow this structure:

```json
{
    "status": "error",
    "message": "<error message>"
}
```

---

## Frontend Integration

### Using Axios (React/Vue)

```javascript
import axios from 'axios';

// Fetch all categories
const fetchCategories = async () => {
    try {
        const response = await axios.get('/api/categories');
        
        if (response.data.status === 'success') {
            const categories = response.data.data; // Array of categories
            return categories;
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Fetch single category
const fetchCategory = async (id) => {
    try {
        const response = await axios.get(`/api/categories/${id}`);
        
        if (response.data.status === 'success') {
            return response.data.data; // Single category object
        } else {
            throw new Error('Category not found');
        }
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Category not found');
        }
        throw error;
    }
};
```

### Using Fetch API

```javascript
// Fetch all categories
const fetchCategories = async () => {
    try {
        const response = await fetch('/api/categories');
        const json = await response.json();
        
        if (json.status === 'success') {
            return json.data; // Array of categories
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Fetch single category
const fetchCategory = async (id) => {
    try {
        const response = await fetch(`/api/categories/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Category not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.status === 'success') {
            return json.data; // Single category object
        } else {
            throw new Error(json.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
    }
};
```

### React Component Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function CategorySelect({ onCategoryChange }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('/api/categories');
            
            if (response.data.status === 'success') {
                setCategories(response.data.data);
            } else {
                setError('Failed to load categories');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading categories...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <select onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">Select a category</option>
            {categories.map(category => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
    );
}

export default CategorySelect;
```

### Vue.js Component Example

```vue
<template>
  <div>
    <select v-model="selectedCategory" @change="handleChange">
      <option value="">Select a category</option>
      <option 
        v-for="category in categories" 
        :key="category.id" 
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
    
    <div v-if="loading">Loading categories...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CategorySelect',
  data() {
    return {
      categories: [],
      selectedCategory: '',
      loading: false,
      error: null
    };
  },
  async mounted() {
    await this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await axios.get('/api/categories');
        
        if (response.data.status === 'success') {
          this.categories = response.data.data;
        } else {
          this.error = 'Failed to load categories';
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    handleChange() {
      this.$emit('category-changed', this.selectedCategory);
    }
  }
};
</script>
```

---

## Database Retrieval

### How Categories are Retrieved from the Database

#### 1. Get All Categories (`index` method)

**Controller**: `app/Http/Controllers/API/CategoryController.php`

**Method**:
```php
public function index()
{
    $categories = Category::all();
    
    return response()->json([
        'status' => 'success',
        'count' => $categories->count(),
        'data' => $categories
    ]);
}
```

**SQL Query Generated**:
```sql
SELECT * FROM categories;
```

**Process**:
1. Laravel's Eloquent ORM executes `Category::all()`
2. This translates to `SELECT * FROM categories`
3. All rows are retrieved and converted to Category model instances
4. The collection is counted and returned as JSON

**Performance Notes**:
- Retrieves all categories in a single query
- No pagination (returns all records)
- Suitable for small to medium category lists (typically 20-50 categories)

#### 2. Get Single Category (`show` method)

**Controller**: `app/Http/Controllers/API/CategoryController.php`

**Method**:
```php
public function show(string $id)
{
    $category = Category::find($id);
    
    if (!$category) {
        return response()->json([
            'status' => 'error',
            'message' => 'Category not found'
        ], 404);
    }
    
    return response()->json([
        'status' => 'success',
        'data' => $category
    ]);
}
```

**SQL Query Generated**:
```sql
SELECT * FROM categories WHERE id = ? LIMIT 1;
```

**Process**:
1. Laravel's Eloquent ORM executes `Category::find($id)`
2. This translates to `SELECT * FROM categories WHERE id = ? LIMIT 1`
3. If found, returns the category as JSON
4. If not found, returns 404 error response

### Direct Database Access

If you need to access categories directly in Laravel:

```php
use App\Models\Category;

// Get all categories
$categories = Category::all();

// Get single category by ID
$category = Category::find(1);

// Get category by slug
$category = Category::where('slug', 'maicka')->first();

// Get categories with their items
$categories = Category::with('items')->get();

// Get category with item count
$categories = Category::withCount('items')->get();
```

### Seeding Categories

Categories are seeded using `CategorySeeder`:

**Location**: `database/seeders/CategorySeeder.php`

**Run seeder**:
```bash
php artisan db:seed --class=CategorySeeder
```

The seeder creates 21+ categories including:
- Маичка (T-shirts)
- Панталони (Pants)
- Фармерки (Jeans)
- Обувки (Shoes)
- And more...

---

## Common Use Cases

### 1. Populate Dropdown Menu

```javascript
// Fetch categories and populate select dropdown
const categories = await fetchCategories();
categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    selectElement.appendChild(option);
});
```

### 2. Filter Items by Category

```javascript
// Get category ID from URL or selection
const categoryId = 1;

// Fetch items filtered by category (if your API supports it)
const items = await fetch(`/api/items?category_id=${categoryId}`);
```

### 3. Display Category Name

```javascript
// Fetch category details to display name
const category = await fetchCategory(categoryId);
console.log(category.name); // "Маичка"
```

### 4. Build Category Navigation

```javascript
// Fetch all categories and build navigation menu
const categories = await fetchCategories();
const navItems = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    url: `/category/${cat.slug}`
}));
```

---

## Error Handling

### Common Errors

1. **404 Not Found** - Category doesn't exist
   ```json
   {
       "status": "error",
       "message": "Category not found"
   }
   ```

2. **500 Internal Server Error** - Database connection issue
   - Check database connection
   - Check Laravel logs: `storage/logs/laravel.log`

3. **CORS Error** - Frontend origin not allowed
   - Configure CORS in `config/cors.php`
   - Add frontend origin to allowed origins

### Debugging Tips

1. **Check Network Tab**: Inspect the actual HTTP response
2. **Check Console**: Look for JavaScript errors
3. **Test API Directly**: Visit `http://localhost:8000/api/categories` in browser
4. **Check Laravel Logs**: `storage/logs/laravel.log` for backend errors

---

## Summary

### Categories

- **Endpoint**: `GET /api/categories` - Returns all categories
- **Endpoint**: `GET /api/categories/{id}` - Returns single category
- **Authentication**: Not required (public endpoints)
- **Response Format**: `{ status, count?, data }`
- **Database Table**: `categories`
- **Model**: `App\Models\Category`
- **Key Fields**: `id`, `name`, `slug`, `image`, `image_kit_id`

The categories are retrieved directly from the `categories` table using Laravel's Eloquent ORM, which translates to standard SQL queries. All endpoints are public and require no authentication.

### Sizes

- **Endpoint**: `GET /api/sizes` - Returns all sizes (optionally filtered by `category_id`)
- **Endpoint**: `GET /api/sizes/{id}` - Returns single size
- **Authentication**: Not required (public endpoints)
- **Response Format**: `{ status, count?, data }`
- **Database Table**: `sizes`
- **Model**: `App\Models\Size`
- **Key Fields**: `id`, `category_id`, `label` (returned as `name` in API)
- **Relationship**: Each size belongs to one category (`category_id`)

The sizes are retrieved directly from the `sizes` table using Laravel's Eloquent ORM. The `label` field is stored in the database but returned as `name` in the API response for consistency. Sizes can be filtered by category using the `category_id` query parameter.

---

## Sizes API

### Base URL

All endpoints are prefixed with `/api`

### Authentication

**All size endpoints are public** - No authentication required.

---

### 1. Get All Sizes

Retrieves all sizes from the database. Optionally filtered by category.

**Endpoint**: `GET /api/sizes`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category_id` | integer | No | Filter sizes by category ID |

**Controller Method**: `SizeController@index`

**Database Query**:
```php
$query = Size::query();

if ($request->has('category_id') && $request->category_id) {
    $query->where('category_id', $request->category_id);
}

$sizes = $query->get();
```

**How it works**:
1. If `category_id` is provided, executes `SELECT * FROM sizes WHERE category_id = ?`
2. Otherwise, executes `SELECT * FROM sizes`
3. Retrieves all matching records from the `sizes` table
4. Returns them as a JSON response with status, count, and data

**Response** (200 OK) - All sizes:
```json
{
    "status": "success",
    "count": 150,
    "data": [
        {
            "id": 1,
            "category_id": 1,
            "name": "S",
            "label": "S",
            "created_at": "2026-01-21T14:59:47.000000Z",
            "updated_at": "2026-01-21T14:59:47.000000Z"
        },
        {
            "id": 2,
            "category_id": 1,
            "name": "M",
            "label": "M",
            "created_at": "2026-01-21T14:59:47.000000Z",
            "updated_at": "2026-01-21T14:59:47.000000Z"
        }
        // ... more sizes
    ]
}
```

**Response** (200 OK) - Filtered by category (`/api/sizes?category_id=1`):
```json
{
    "status": "success",
    "count": 5,
    "data": [
        {
            "id": 1,
            "category_id": 1,
            "name": "S",
            "label": "S",
            "created_at": "2026-01-21T14:59:47.000000Z",
            "updated_at": "2026-01-21T14:59:47.000000Z"
        },
        {
            "id": 2,
            "category_id": 1,
            "name": "M",
            "label": "M",
            "created_at": "2026-01-21T14:59:47.000000Z",
            "updated_at": "2026-01-21T14:59:47.000000Z"
        }
        // ... sizes for category 1 only
    ]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Response status, always `"success"` |
| `count` | integer | Total number of sizes returned |
| `data` | array | Array of size objects |

**Size Object Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique size identifier |
| `category_id` | integer | ID of the category this size belongs to |
| `name` | string | Size name (same as `label`, provided for API compatibility) |
| `label` | string | Size label stored in database (e.g., "S", "M", "L", "42") |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp |

---

### 2. Get Single Size

Retrieves a specific size by ID.

**Endpoint**: `GET /api/sizes/{id}`

**Controller Method**: `SizeController@show`

**Database Query**:
```php
$size = Size::find($id);
```

**How it works**:
1. Executes `SELECT * FROM sizes WHERE id = ? LIMIT 1` query
2. Retrieves the size record with the specified ID
3. Returns it as JSON, or 404 if not found

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Size ID |

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "category_id": 1,
        "name": "S",
        "label": "S",
        "created_at": "2026-01-21T14:59:47.000000Z",
        "updated_at": "2026-01-21T14:59:47.000000Z"
    }
}
```

**Error Response** (404 Not Found):
```json
{
    "status": "error",
    "message": "Size not found"
}
```

---

## Sizes Frontend Integration

### Using Axios (React/Vue)

```javascript
import axios from 'axios';

// Fetch all sizes
const fetchSizes = async (categoryId = null) => {
    try {
        const url = categoryId 
            ? `/api/sizes?category_id=${categoryId}`
            : '/api/sizes';
            
        const response = await axios.get(url);
        
        if (response.data.status === 'success') {
            const sizes = response.data.data; // Array of sizes
            return sizes;
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('Error fetching sizes:', error);
        throw error;
    }
};

// Fetch single size
const fetchSize = async (id) => {
    try {
        const response = await axios.get(`/api/sizes/${id}`);
        
        if (response.data.status === 'success') {
            return response.data.data; // Single size object
        } else {
            throw new Error('Size not found');
        }
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Size not found');
        }
        throw error;
    }
};
```

### Using Fetch API

```javascript
// Fetch all sizes (optionally filtered by category)
const fetchSizes = async (categoryId = null) => {
    try {
        const url = categoryId 
            ? `/api/sizes?category_id=${categoryId}`
            : '/api/sizes';
            
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.status === 'success') {
            return json.data; // Array of sizes
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('Error fetching sizes:', error);
        throw error;
    }
};

// Fetch single size
const fetchSize = async (id) => {
    try {
        const response = await fetch(`/api/sizes/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Size not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.status === 'success') {
            return json.data; // Single size object
        } else {
            throw new Error(json.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error fetching size:', error);
        throw error;
    }
};
```

### React Component Example - Size Select with Category Filter

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function SizeSelect({ categoryId, onSizeChange }) {
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (categoryId) {
            fetchSizes(categoryId);
        } else {
            setSizes([]);
            setLoading(false);
        }
    }, [categoryId]);

    const fetchSizes = async (catId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/api/sizes?category_id=${catId}`);
            
            if (response.data.status === 'success') {
                setSizes(response.data.data);
            } else {
                setError('Failed to load sizes');
            }
        } catch (err) {
            console.error('Error fetching sizes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!categoryId) {
        return <select disabled><option>Select a category first</option></select>;
    }

    if (loading) return <div>Loading sizes...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <select onChange={(e) => onSizeChange(e.target.value)}>
            <option value="">Select a size</option>
            {sizes.map(size => (
                <option key={size.id} value={size.id}>
                    {size.name}
                </option>
            ))}
        </select>
    );
}

export default SizeSelect;
```

### React Component Example - Category and Size Selection

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function CategorySizeSelector() {
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchSizesForCategory(selectedCategory);
        } else {
            setSizes([]);
            setSelectedSize('');
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            if (response.data.status === 'success') {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSizesForCategory = async (categoryId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/sizes?category_id=${categoryId}`);
            if (response.data.status === 'success') {
                setSizes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sizes:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="">Select a category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>

            <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={!selectedCategory || loading}
            >
                <option value="">Select a size</option>
                {sizes.map(size => (
                    <option key={size.id} value={size.id}>
                        {size.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CategorySizeSelector;
```

---

## How Sizes are Retrieved from the Database

### 1. Get All Sizes (`index` method)

**Controller**: `app/Http/Controllers/API/SizeController.php`

**Method**:
```php
public function index(Request $request)
{
    $query = Size::query();

    // Filter by category if provided
    if ($request->has('category_id') && $request->category_id) {
        $query->where('category_id', $request->category_id);
    }

    $sizes = $query->get();

    return response()->json([
        'status' => 'success',
        'count' => $sizes->count(),
        'data' => $sizes
    ]);
}
```

**SQL Query Generated** (without filter):
```sql
SELECT * FROM sizes;
```

**SQL Query Generated** (with category filter):
```sql
SELECT * FROM sizes WHERE category_id = ?;
```

**Process**:
1. Laravel's Eloquent ORM builds a query using `Size::query()`
2. If `category_id` is provided, adds `where('category_id', $categoryId)` clause
3. Executes the query and retrieves matching size records
4. The model accessor converts `label` to `name` in the response
5. Returns the collection as JSON with status, count, and data

**Performance Notes**:
- Retrieves all sizes in a single query (or filtered by category)
- No pagination (returns all records)
- Suitable for category-specific size lists (typically 5-20 sizes per category)

### 2. Get Single Size (`show` method)

**Controller**: `app/Http/Controllers/API/SizeController.php`

**Method**:
```php
public function show(string $id)
{
    $size = Size::find($id);
    
    if (!$size) {
        return response()->json([
            'status' => 'error',
            'message' => 'Size not found'
        ], 404);
    }
    
    return response()->json([
        'status' => 'success',
        'data' => $size
    ]);
}
```

**SQL Query Generated**:
```sql
SELECT * FROM sizes WHERE id = ? LIMIT 1;
```

**Process**:
1. Laravel's Eloquent ORM executes `Size::find($id)`
2. This translates to `SELECT * FROM sizes WHERE id = ? LIMIT 1`
3. If found, the model accessor converts `label` to `name`
4. Returns the size as JSON
5. If not found, returns 404 error response

### Direct Database Access

If you need to access sizes directly in Laravel:

```php
use App\Models\Size;

// Get all sizes
$sizes = Size::all();

// Get sizes for a specific category
$sizes = Size::where('category_id', 1)->get();

// Get single size by ID
$size = Size::find(1);

// Get size with category relationship
$size = Size::with('category')->find(1);

// Get sizes with their items
$sizes = Size::with('items')->get();

// Get sizes for multiple categories
$sizes = Size::whereIn('category_id', [1, 2, 3])->get();
```

### Seeding Sizes

Sizes are seeded using `SizeSeeder`:

**Location**: `database/seeders/SizeSeeder.php`

**Run seeder**:
```bash
php artisan db:seed --class=SizeSeeder
```

The seeder creates sizes for each category, including:
- Clothing sizes: S, M, L, XL, XXL
- Shoe sizes: EU 38, EU 39, EU 40, etc.
- Numeric sizes: 28, 30, 32, etc.

---

## Common Use Cases - Sizes

### 1. Populate Size Dropdown Based on Category

```javascript
// When user selects a category, fetch sizes for that category
const handleCategoryChange = async (categoryId) => {
    if (!categoryId) {
        setSizes([]);
        return;
    }
    
    const sizes = await fetchSizes(categoryId);
    setSizes(sizes);
};
```

### 2. Display Available Sizes for an Item

```javascript
// Fetch sizes for a specific category
const categoryId = item.category_id;
const availableSizes = await fetchSizes(categoryId);

// Display sizes in a select dropdown
availableSizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size.id;
    option.textContent = size.name;
    sizeSelect.appendChild(option);
});
```

### 3. Filter Items by Size

```javascript
// Get size ID from selection
const sizeId = 5;

// Fetch items filtered by size (if your API supports it)
const items = await fetch(`/api/items?size_id=${sizeId}`);
```

### 4. Get Size Information

```javascript
// Fetch size details to display name
const size = await fetchSize(sizeId);
console.log(size.name); // "M"
console.log(size.category_id); // 1
```

---

## Summary - Sizes

- **Endpoint**: `GET /api/sizes` - Returns all sizes (optionally filtered by `category_id`)
- **Endpoint**: `GET /api/sizes/{id}` - Returns single size
- **Authentication**: Not required (public endpoints)
- **Response Format**: `{ status, count?, data }`
- **Database Table**: `sizes`
- **Model**: `App\Models\Size`
- **Key Fields**: `id`, `category_id`, `label` (returned as `name` in API)
- **Relationship**: Each size belongs to one category (`category_id`)

The sizes are retrieved directly from the `sizes` table using Laravel's Eloquent ORM. The `label` field is stored in the database but returned as `name` in the API response for consistency. Sizes can be filtered by category using the `category_id` query parameter.
