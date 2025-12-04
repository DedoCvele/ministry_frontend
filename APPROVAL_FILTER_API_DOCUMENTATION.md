# Approval Filter API Documentation

This document explains how to filter items by approval status in the API.

## Approval Status Values

Items can have the following approval statuses:

| Value | Status | Description | Who Can See |
|-------|--------|-------------|-------------|
| `0` | Pending | Item is waiting for admin approval | **Admins only** |
| `1` | Approved | Item is approved and visible | Everyone |
| `2` | Special Status | Item has special status (e.g., declined) | Everyone |
| `3` | Special Status | Item has special status (reserved for future use) | Everyone |

---

## API Endpoints

### 1. **Public Items Endpoint** (Available to All Users)

**Endpoint:** `GET /api/items`

**Authentication:** Optional (public endpoint, but authentication affects filtering)

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `approved` | integer or array | No | Filter by approval status | `approved=1` or `approved[]=1&approved[]=2` |
| `sort_by` | string | No | Field to sort by (`approved`, `name`, `price`, `created_at`, `updated_at`) | `sort_by=approved` |
| `sort_order` | string | No | Sort order (`asc` or `desc`) | `sort_order=asc` |
| `per_page` | integer | No | Items per page (default: 15) | `per_page=20` |

**Behavior:**

- **Non-authenticated users:**
  - Default: Only see approved items (status 1, 2, 3)
  - Can filter by: `approved=1`, `approved=2`, `approved=3`
  - Cannot see pending items (status 0)

- **Authenticated regular users:**
  - Default: Only see approved items (status 1, 2, 3)
  - Can filter by: `approved=1`, `approved=2`, `approved=3`
  - Cannot see pending items (status 0)

- **Authenticated admin users:**
  - Default: See ALL items (all statuses)
  - Can filter by: `approved=0`, `approved=1`, `approved=2`, `approved=3`
  - Can use array format: `approved[]=0&approved[]=1` (multiple statuses)

**Example Requests:**

```bash
# Get all approved items (default for non-admins)
GET /api/items

# Filter by approved status 1 only
GET /api/items?approved=1

# Filter by multiple approval statuses (admin only)
GET /api/items?approved[]=1&approved[]=2

# Sort by approval status
GET /api/items?sort_by=approved&sort_order=asc

# Combine filters
GET /api/items?approved=1&sort_by=price&sort_order=desc&per_page=20
```

**Example Response:**

```json
{
  "status": "success",
  "count": 25,
  "data": [
    {
      "id": 1,
      "name": "Item Name",
      "price": "99.99",
      "approved": 1,
      "category": {...},
      "brand": {...},
      "user": {...}
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 25
  },
  "filters": {
    "approved": "1",
    "sort_by": "approved",
    "sort_order": "asc"
  }
}
```

---

### 2. **Admin Pending Items Endpoint** (Admin Only)

**Endpoint:** `GET /api/admin/pending-items`

**Authentication:** Required (Sanctum) + Admin role

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `approved` | integer | No | Filter by approval status (default: 0 for pending) | `approved=0` |
| `sort_by` | string | No | Field to sort by | `sort_by=approved` |
| `sort_order` | string | No | Sort order (`asc` or `desc`) | `sort_order=desc` |

**Example Requests:**

```bash
# Get pending items (default)
GET /api/admin/pending-items
Authorization: Bearer {token}

# Filter by specific approval status
GET /api/admin/pending-items?approved=1
Authorization: Bearer {token}

# Sort by approval status
GET /api/admin/pending-items?sort_by=approved&sort_order=asc
Authorization: Bearer {token}
```

**Example Response:**

```json
{
  "status": "success",
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Pending Item",
      "approved": 0,
      "user": {...},
      "brand": {...},
      "category": {...}
    }
  ],
  "filters": {
    "approved": null,
    "sort_by": "created_at",
    "sort_order": "desc"
  }
}
```

---

### 3. **Admin All Items Endpoint** (Admin Only)

**Endpoint:** `GET /api/admin/items`

**Authentication:** Required (Sanctum) + Admin role

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `approved` | integer or array | No | Filter by approval status(es) | `approved=1` or `approved[]=0&approved[]=1` |
| `sort_by` | string | No | Field to sort by | `sort_by=approved` |
| `sort_order` | string | No | Sort order (`asc` or `desc`) | `sort_order=asc` |
| `per_page` | integer | No | Items per page (default: 15) | `per_page=20` |

**Example Requests:**

```bash
# Get all items (any status)
GET /api/admin/items
Authorization: Bearer {token}

# Filter by single approval status
GET /api/admin/items?approved=0
Authorization: Bearer {token}

# Filter by multiple approval statuses
GET /api/admin/items?approved[]=0&approved[]=1
Authorization: Bearer {token}

# Sort and paginate
GET /api/admin/items?approved=1&sort_by=approved&sort_order=desc&per_page=50
Authorization: Bearer {token}
```

**Example Response:**

```json
{
  "status": "success",
  "count": 100,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "last_page": 7,
    "per_page": 15,
    "total": 100
  },
  "filters": {
    "approved": "1",
    "sort_by": "approved",
    "sort_order": "desc"
  }
}
```

---

## Frontend Implementation Examples

### JavaScript/Fetch Example

```javascript
// Get items filtered by approval status
async function getItemsByApprovalStatus(status) {
  const token = localStorage.getItem('auth_token'); // For authenticated requests
  
  const url = new URL('/api/items', window.location.origin);
  url.searchParams.append('approved', status);
  url.searchParams.append('sort_by', 'approved');
  url.searchParams.append('sort_order', 'asc');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  const data = await response.json();
  
  return data;
}

// Get pending items (admin only)
async function getPendingItems() {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('/api/admin/pending-items', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  return await response.json();
}

// Filter by multiple approval statuses (admin only)
async function getItemsByMultipleStatuses(statuses) {
  const token = localStorage.getItem('auth_token');
  
  const url = new URL('/api/admin/items', window.location.origin);
  statuses.forEach(status => {
    url.searchParams.append('approved[]', status);
  });
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  return await response.json();
}
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function ItemsList() {
  const [items, setItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchItems();
  }, [selectedStatus]);
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = new URL('/api/items', window.location.origin);
      
      if (selectedStatus) {
        url.searchParams.append('approved', selectedStatus);
      }
      
      const headers = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data.status === 'success') {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <select 
        value={selectedStatus} 
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="1">Approved (1)</option>
        <option value="2">Special Status (2)</option>
        <option value="3">Special Status (3)</option>
        {/* Show pending option only for admins */}
        {isAdmin && <option value="0">Pending (0)</option>}
      </select>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.name} - Status: {item.approved}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Axios Example

```javascript
import axios from 'axios';

// Setup axios instance with auth token
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  }
});

// Add auth token interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get items with approval filter
export const getItems = async (approvedStatus = null, sortBy = 'created_at', sortOrder = 'desc') => {
  const params = {};
  
  if (approvedStatus !== null) {
    params.approved = approvedStatus;
  }
  
  params.sort_by = sortBy;
  params.sort_order = sortOrder;
  
  const response = await api.get('/items', { params });
  return response.data;
};

// Get pending items (admin only)
export const getPendingItems = async () => {
  const response = await api.get('/admin/pending-items');
  return response.data;
};

// Get items with multiple approval statuses (admin only)
export const getItemsByStatuses = async (statuses = []) => {
  const params = {};
  statuses.forEach(status => {
    if (!params.approved) {
      params.approved = [];
    }
    params.approved.push(status);
  });
  
  const response = await api.get('/admin/items', { params });
  return response.data;
};
```

---

## Important Notes

### 1. **Default Behavior**
- **Non-authenticated users:** See only approved items (status 1, 2, 3)
- **Authenticated regular users:** See only approved items (status 1, 2, 3)
- **Authenticated admin users:** See ALL items by default (all statuses)

### 2. **Security Considerations**
- Pending items (status 0) are only visible to admins
- Regular users cannot filter by status 0 even if they try
- Admin endpoints require authentication + admin role

### 3. **Sorting**
- You can sort by `approved` field to group items by status
- Sort order: `asc` (0, 1, 2, 3) or `desc` (3, 2, 1, 0)

### 4. **Pagination**
- All endpoints support pagination via `per_page` parameter
- Response includes pagination metadata

### 5. **Array Format for Multiple Statuses**
- Admins can filter by multiple statuses using array format
- Example: `approved[]=0&approved[]=1` (items with status 0 OR 1)

---

## Web Routes (Server-Side)

For server-side rendered pages, the same filtering applies:

**Endpoint:** `GET /items`

**Query Parameters:**
- `approved`: Filter by approval status
- `brand`: Filter by brand ID
- `category`: Filter by category ID
- `condition`: Filter by condition
- `search`: Search by name

**Example:**
```
/items?approved=1&category=5&search=shirt
```

---

## Error Handling

If an invalid approval status is provided:

- **Non-admins requesting status 0:** Filter is ignored, returns default approved items
- **Invalid status values (e.g., 4, 5, etc.):** Filter is ignored
- **No items found:** Returns empty array with count 0

---

## Testing Examples

### cURL Examples

```bash
# Get all approved items (public)
curl -X GET "http://your-domain.com/api/items?approved=1"

# Get items sorted by approval status (public)
curl -X GET "http://your-domain.com/api/items?sort_by=approved&sort_order=asc"

# Get pending items (admin only)
curl -X GET "http://your-domain.com/api/admin/pending-items" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Get items with multiple statuses (admin only)
curl -X GET "http://your-domain.com/api/admin/items?approved[]=0&approved[]=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## Summary

| Endpoint | Public Access | Admin Access | Can Filter by Status 0 |
|----------|---------------|--------------|------------------------|
| `GET /api/items` | ✅ (approved only) | ✅ (all statuses) | ❌ No (admins can) |
| `GET /api/admin/pending-items` | ❌ | ✅ | ✅ Yes |
| `GET /api/admin/items` | ❌ | ✅ | ✅ Yes |

**Quick Reference:**
- Use `/api/items` for public item listings with approval filtering
- Use `/api/admin/pending-items` to get items pending approval
- Use `/api/admin/items` for comprehensive admin item management with filtering

