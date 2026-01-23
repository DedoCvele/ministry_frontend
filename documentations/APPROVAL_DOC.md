# Approval API — Frontend Integration (Approval Doc)

This document describes what the **frontend** must send and what the **backend** returns for item approval and admin item operations. Use it to fix 404/500 errors on the Admin page (e.g. `GET /api/items/25`, `PUT /api/items/25`).

---

## 1. Authentication

All **admin** and **item update** endpoints require:

- **Header:** `Authorization: Bearer <token>`
- **Header:** `Accept: application/json`
- **Header:** `Content-Type: application/json` (for PUT/POST with JSON body)

The user must be **logged in**. For admin-only endpoints, the user must have **admin** role.

**Example (Axios):**

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add token (e.g. from login)
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## 2. Fetching a Single Item (Admin Context)

When the Admin page needs to load **one** item (including **pending**), use the **admin** endpoint.  
**Do not** use `GET /api/items/{id}` for pending items — that returns **404** for unauthenticated or non‑owner/non‑admin users.

### Endpoint

```
GET /api/admin/items/{id}
```

- **Auth:** Required (`Bearer` token).
- **Access:** Admin only.

### Request

| Method | URL example | Headers |
|--------|-------------|---------|
| GET | `http://localhost:8000/api/admin/items/25` | `Authorization: Bearer <token>`, `Accept: application/json` |

No request body.

### Success response (200)

```json
{
  "status": "success",
  "data": {
    "id": 25,
    "name": "Item name",
    "description": "...",
    "price": "19.99",
    "approved": 1,
    "user_id": 1,
    "category_id": 1,
    "brand_id": 1,
    "category": { "id": 1, "name": "..." },
    "brand": { "id": 1, "name": "..." },
    "user": { "id": 1, "name": "...", "email": "..." },
    "images": []
  }
}
```

### Error responses

| Status | Body | Meaning |
|--------|------|---------|
| 401 | `{ "message": "Unauthenticated." }` | Missing or invalid token |
| 403 | — | User is not admin |
| 404 | `{ "status": "error", "message": "Item not found" }` | No item with that `id` |

### Frontend usage (Admin page)

- Use **`GET /api/admin/items/{id}`** (with admin token) to fetch the current item before editing or updating approval.
- Do **not** use `GET /api/items/{id}` for admin flows; it returns 404 for pending items when not allowed.

---

## 3. Updating Item (Including Approval)

Use **`PUT /api/items/{id}`** to update an item. Only **admins** may change **`approved`**.

### Endpoint

```
PUT /api/items/{id}
```

- **Auth:** Required (`Bearer` token).
- **Access:** Item **owner** or **admin**. Only **admin** can update `approved`.

### Request

| Method | URL example | Headers |
|--------|-------------|---------|
| PUT | `http://localhost:8000/api/items/25` | `Authorization: Bearer <token>`, `Accept: application/json`, `Content-Type: application/json` |

**Body (JSON):** only include fields you want to change.

#### Approval-only update (Admin)

Send **only** `approved`:

```json
{
  "approved": 2
}
```

**`approved` values:**

| Value | Meaning |
|-------|---------|
| `1` | Pending (admin only) |
| `2` | Approved (visible to all) |
| `3` | Featured (visible + main page) |

#### Full or partial item update

Allowed fields (all optional except when updating):

- `name` or `title` (string)
- `description` (string)
- `material`, `size`, `tags` (string; `tags` can be array, stored as comma‑separated)
- `price` (number ≥ 0)
- `condition` (int 1–5; see conditions)
- `status`, `location` (string)
- `category_id`, `brand_id` (int; `brand_id` can be `null`)
- `stock` (int)
- `approved` (int 1–3; **admin only**)

Example:

```json
{
  "name": "Updated name",
  "price": 29.99,
  "approved": 2
}
```

Send **`category_id`** and **`brand_id`** as **integers**. If your frontend stores `category` / `brand` as objects (e.g. `{ "id": 1, "name": "..." }`), send **`category_id`** and **`brand_id`** (the `id` values). The backend also accepts `category_id` / `brand_id` as objects with an `id` property and will normalize them to integers.

### Success response (200)

```json
{
  "status": "success",
  "message": "Item updated successfully",
  "data": {
    "id": 25,
    "name": "...",
    "approved": 2,
    ...
  }
}
```

### Error responses

| Status | Meaning |
|--------|---------|
| 401 | Unauthenticated |
| 403 | Not owner and not admin |
| 404 | Item not found |
| 422 | Validation error (e.g. invalid `approved`, `price`, `category_id`) |
| 500 | Server error (see logs) |

---

## 4. Dedicated Approval Endpoints (Alternative)

Instead of `PUT /api/items/{id}` with `approved`, you can use:

### Approve

```
PUT /api/admin/approve/{id}
```

- **Auth:** Required. **Admin** only.
- **Body:** None (or empty JSON).
- **Effect:** Sets `approved = 2`.

**Success (200):**

```json
{
  "status": "success",
  "message": "Item approved successfully",
  "item": { ... }
}
```

### Decline

```
PUT /api/admin/decline/{id}
```

- **Auth:** Required. **Admin** only.
- **Body:** None (or empty JSON).
- **Effect:** Sets `approved = 1` (pending).

**Success (200):**

```json
{
  "status": "success",
  "message": "Item declined and set back to pending",
  "item": { ... }
}
```

---

## 5. What to Send from the Frontend — Summary

| Action | Method | URL | Headers | Body |
|--------|--------|-----|---------|------|
| Fetch single item (admin, including pending) | GET | `/api/admin/items/{id}` | `Authorization: Bearer <token>`, `Accept: application/json` | — |
| Update approval only | PUT | `/api/items/{id}` | `Authorization: Bearer <token>`, `Accept: application/json`, `Content-Type: application/json` | `{ "approved": 2 }` or `3` |
| Update full/partial item | PUT | `/api/items/{id}` | Same | `{ "name": "...", "price": 29.99, ... }` |
| Approve (alternative) | PUT | `/api/admin/approve/{id}` | `Authorization: Bearer <token>`, `Accept: application/json` | — |
| Decline (alternative) | PUT | `/api/admin/decline/{id}` | Same | — |

**Fix for your current errors:**

1. **`GET /api/items/25` 404**  
   - Use **`GET /api/admin/items/25`** with **`Authorization: Bearer <admin_token>`** when loading an item in the Admin page (including pending).

2. **`PUT /api/items/25` 500**  
   - Send **only** allowed fields (see §3).  
   - For approval-only: **`{ "approved": 2 }`** with **`Content-Type: application/json`** and **`Authorization: Bearer <admin_token>`**.  
   - Do **not** send nested `brand` / `category` objects as top-level keys; use `brand_id` / `category_id` or the normalized format above.

---

## 6. Condition values (reference)

When updating `condition`, use **integers**:

| Value | Condition |
|-------|-----------|
| 1 | New |
| 2 | Excellent |
| 3 | Very good |
| 4 | Good |
| 5 | Fair |

---

**Last updated:** 2025
