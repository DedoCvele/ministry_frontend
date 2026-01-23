# Approval Filter - Quick Reference Guide

## 🎯 Quick Summary

Filter items by approval status using the `approved` query parameter.

---

## ✅ Approval Status Values

| Status | Description | Visible To |
|--------|-------------|------------|
| `0` | Pending | **Admins only** |
| `1` | Approved | Everyone |
| `2` | Special Status | Everyone |
| `3` | Special Status | Everyone |

---

## 📡 API Endpoints

### 1. Public Items (Everyone)

```
GET /api/items?approved={status}
```

**Examples:**
```bash
# Get approved items only
GET /api/items?approved=1

# Get special status items
GET /api/items?approved=2

# Sort by approval status
GET /api/items?sort_by=approved&sort_order=asc

# Combine with other filters
GET /api/items?approved=1&category=5&search=shirt
```

**Who can see what:**
- **Everyone:** Can filter by `1`, `2`, `3`
- **Admins only:** Can also filter by `0` (pending)

**Default:** Returns items with status 1, 2, 3 (non-admins) or all items (admins)

---

### 2. Admin Pending Items (Admin Only)

```
GET /api/admin/pending-items?approved={status}
```

**Authentication Required:** ✅ Yes (Sanctum token)

**Examples:**
```bash
# Get pending items (default)
GET /api/admin/pending-items

# Filter by specific status
GET /api/admin/pending-items?approved=1
```

**Headers:**
```
Authorization: Bearer {your_token}
Accept: application/json
```

---

### 3. Admin All Items (Admin Only)

```
GET /api/admin/items?approved={status}
```

**Authentication Required:** ✅ Yes (Sanctum token)

**Examples:**
```bash
# Get all items
GET /api/admin/items

# Filter by single status
GET /api/admin/items?approved=0

# Filter by multiple statuses
GET /api/admin/items?approved[]=0&approved[]=1

# With sorting and pagination
GET /api/admin/items?approved=1&sort_by=approved&sort_order=desc&per_page=50
```

---

## 🔧 Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `approved` | integer | `approved=1` | Filter by approval status |
| `approved[]` | array | `approved[]=1&approved[]=2` | Multiple statuses (admin only) |
| `sort_by` | string | `sort_by=approved` | Sort field |
| `sort_order` | string | `sort_order=asc` | Sort direction (`asc`/`desc`) |
| `per_page` | integer | `per_page=20` | Items per page |

---

## 💻 JavaScript Examples

### Basic Fetch

```javascript
// Get items by approval status
fetch('/api/items?approved=1')
  .then(res => res.json())
  .then(data => console.log(data.data));

// With authentication (admin)
fetch('/api/admin/pending-items', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### React Hook

```javascript
const [items, setItems] = useState([]);
const [status, setStatus] = useState('');

useEffect(() => {
  fetch(`/api/items?approved=${status}`)
    .then(res => res.json())
    .then(data => setItems(data.data));
}, [status]);
```

### Axios

```javascript
// Single status
axios.get('/api/items', { params: { approved: 1 } });

// Multiple statuses (admin)
axios.get('/api/admin/items', { 
  params: { 'approved[]': [0, 1] } 
});

// With auth
axios.get('/api/admin/pending-items', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📋 Response Format

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
      "brand": {...}
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

## ⚠️ Important Rules

1. **Status 0 (Pending) is admin-only** - Regular users cannot see/filter by it
2. **Default behavior:**
   - Non-admins: See only status 1, 2, 3
   - Admins: See all statuses
3. **Authentication:**
   - `/api/items` - Public (no auth needed, but auth affects results)
   - `/api/admin/*` - Requires authentication + admin role

---

## 🚀 Common Use Cases

### Frontend Filter Dropdown

```html
<select onchange="filterByStatus(this.value)">
  <option value="">All Statuses</option>
  <option value="1">Approved</option>
  <option value="2">Special Status 2</option>
  <option value="3">Special Status 3</option>
  <!-- Show only if admin -->
  <option value="0">Pending</option>
</select>
```

### Sorting Items by Approval

```javascript
// Sort: Pending first, then approved
GET /api/admin/items?sort_by=approved&sort_order=asc

// Sort: Approved first, then pending
GET /api/admin/items?sort_by=approved&sort_order=desc
```

### Get All Pending Items for Admin Review

```javascript
GET /api/admin/pending-items
// or
GET /api/admin/items?approved=0
```

---

## 📞 Need More Details?

See full documentation: `APPROVAL_FILTER_API_DOCUMENTATION.md`

