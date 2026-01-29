# Ministry of Second Hand - API Routes & Database Operations Documentation

This document provides a detailed breakdown of every API route, explaining what each endpoint does to the database including **CREATE**, **READ**, **UPDATE**, and **DELETE** operations.

---

## Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [Authentication Routes](#authentication-routes)
3. [User Routes](#user-routes)
4. [Item Routes](#item-routes)
5. [Blog Routes](#blog-routes)
6. [Brand Routes (Admin)](#brand-routes-admin)
7. [Category Routes (Admin)](#category-routes-admin)
8. [Size Routes (Admin)](#size-routes-admin)
9. [Follower Routes](#follower-routes)
10. [Favorite Routes](#favorite-routes)
11. [Tag Routes](#tag-routes)
12. [Item Image Routes](#item-image-routes)

---

## Database Schema Overview

### Main Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (buyers, sellers, admins) |
| `items` | Second-hand items for sale |
| `item_images` | Images associated with items |
| `blogs` | Blog posts created by users |
| `brands` | Clothing/item brands |
| `categories` | Item categories |
| `sizes` | Sizes per category |
| `tags` | Tags for categorizing items |
| `personal_access_tokens` | Sanctum API tokens |

### Pivot Tables (Many-to-Many Relationships)

| Table | Description |
|-------|-------------|
| `item_user` | User's favorite items |
| `user_user` | User followers (follower_id follows user_id) |
| `item_size` | Items with sizes and quantities |
| `item_tag` | Tags associated with items |

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | 1=Admin, 2=Buyer, 3=Seller |
| `ItemCondition` | 1=New, 2=Excellent, 3=VeryGood, 4=Good, 5=Fair |
| `ItemApprovalStatus` | 1=Pending, 2=Approved, 3=SpecialistApproved (special/featured on main page) |
| `BlogStatus` | 1=Draft, 2=Published |

---

## Authentication Routes

### POST `/api/register`
**Middleware:** `guest`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `users` | Creates a new user record with `name`, `email`, and hashed `password` |

**Fields Created:**
```
users:
  - id (auto-generated)
  - name (from request)
  - email (from request)
  - password (bcrypt hashed)
  - role (default: 2 = Buyer)
  - created_at
  - updated_at
```

---

### POST `/api/login`
**Middleware:** `guest`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Finds user by email and verifies password |
| **CREATE** | `personal_access_tokens` | Creates a new Sanctum API token for the user |

**Fields Created:**
```
personal_access_tokens:
  - id (auto-generated)
  - tokenable_type ('App\Models\User')
  - tokenable_id (user's ID)
  - name ('main')
  - token (hashed token)
  - abilities (['*'])
  - last_used_at (null initially)
  - expires_at (null)
  - created_at
  - updated_at
```

---

### POST `/api/logout`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `sessions` | Removes the user's web session |

---

### POST `/api/forgot-password`
**Middleware:** `guest`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Looks up user by email |
| **CREATE/UPDATE** | `password_reset_tokens` | Creates or updates password reset token |

**Fields Affected:**
```
password_reset_tokens:
  - email (primary key)
  - token (hashed reset token)
  - created_at
```

---

### POST `/api/reset-password`
**Middleware:** `guest`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `password_reset_tokens` | Validates the reset token |
| **UPDATE** | `users` | Updates `password` and `remember_token` |
| **DELETE** | `password_reset_tokens` | Removes the used token |

**Fields Updated:**
```
users:
  - password (new bcrypt hash)
  - remember_token (new random string)
  - updated_at
```

---

### GET `/api/verify-email/{id}/{hash}`
**Middleware:** `auth:sanctum`, `signed`, `throttle:6,1`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `users` | Sets `email_verified_at` timestamp |

**Fields Updated:**
```
users:
  - email_verified_at (current timestamp)
  - updated_at
```

---

### POST `/api/email/verification-notification`
**Middleware:** `auth:sanctum`, `throttle:6,1`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Gets current authenticated user |

*Note: No database changes - only sends email*

---

## User Routes

### GET `/api/user`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Returns the currently authenticated user |

---

### GET `/api/users`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Returns paginated list of non-admin users |
| **READ** | `items` | Eager loads user's items with relations |
| **READ** | `categories`, `sizes`, `item_images`, `brands` | Eager loads item relationships |
| **READ** | `user_user` | Counts followers and following |

**Query Parameters:**
- `per-page` (default: 15)

---

### GET `/api/users/{user}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Returns specific user by ID |
| **READ** | `items`, `categories`, `sizes`, `item_images`, `brands`, `tags` | Eager loads relationships |
| **READ** | `user_user` | Counts followers and following |

---

### PATCH `/api/me`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `users` | Updates authenticated user's profile |

**Updatable Fields:**
```
users:
  - name (min:3, max:255)
  - password (hashed)
  - phone (nullable, phone format regex)
  - city (nullable, min:3)
  - bio (nullable, min:20, max:5000)
  - profile_picture (SVG file/markup or hex color)
  - role (UserRole enum)
  - updated_at
```

---

### DELETE `/api/me`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `users` | Deletes the authenticated user's account |
| **CASCADE DELETE** | `items` | All user's items are deleted |
| **CASCADE DELETE** | `blogs` | All user's blogs are deleted |
| **CASCADE DELETE** | `item_user` | All favorite relationships removed |
| **CASCADE DELETE** | `user_user` | All follower/following relationships removed |
| **CASCADE DELETE** | `personal_access_tokens` | All API tokens revoked |

---

### GET `/api/closets`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Returns sellers (role=3) who have items |
| **READ** | `items` | Counts and loads items per user |

---

### GET `/api/closets/{id}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `users` | Returns specific user's closet by ID |
| **READ** | `items` | Eager loads user's items |

---

## Item Routes

### GET `/api/items`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `items` | Returns paginated list of all items (or only specialist-approved when `special=1`) |
| **READ** | `users`, `tags`, `item_images`, `brands`, `categories`, `sizes` | Eager loads relationships |

**Query Parameters:**
- `per-page` (default: 15)
- `special` (optional): set to `1` or `true` to return only items with `approval_status = 3` (Specialist Approved) for the main-page “special” / featured section

---

### GET `/api/items/{item}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `items` | Returns specific item by ID |
| **READ** | `tags`, `item_images`, `brands`, `categories`, `users` | Eager loads relationships |

---

### GET `/api/me/items`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `items` | Returns paginated list of authenticated user's items |
| **READ** | `tags`, `item_images`, `brands`, `categories`, `sizes` | Eager loads relationships |

---

### POST `/api/me/items`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `items` | Creates a new item for the authenticated user |
| **CREATE** | `item_size` | Creates size-quantity pivot records |
| **CREATE/READ** | `tags` | Creates new tags or finds existing by slug |
| **CREATE** | `item_tag` | Associates tags with the item |
| **CREATE** | `item_images` | Queued job creates image records via ImageKit |

**Fields Created:**
```
items:
  - id (auto-generated)
  - name (required, min:3, max:255)
  - description (nullable, max:4000)
  - material (nullable, max:300)
  - price (required, decimal)
  - condition (required, 1-5)
  - approval_status (required, 1-3)
  - location (nullable, max:255)
  - category_id (required, FK)
  - brand_id (required, FK)
  - user_id (authenticated user)
  - created_at
  - updated_at

item_size (pivot):
  - item_id
  - size_id
  - quantity

item_tag (pivot):
  - item_id
  - tag_id

tags (if new):
  - id
  - name
  - slug (auto-generated from name)
  - created_at
  - updated_at

item_images (async via job):
  - id
  - item_id
  - url (ImageKit URL)
  - image_kit_id
  - position
  - created_at
  - updated_at
```

---

### PUT `/api/me/items/{item}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `items` | Updates the item's attributes |
| **SYNC** | `item_size` | Replaces all size-quantity relationships |
| **CREATE/READ** | `tags` | Creates new or finds existing tags |
| **SYNC** | `item_tag` | Replaces all tag relationships |
| **CREATE** | `item_images` | Queued job adds new images |

**Updatable Fields:** Same as POST, all fields optional

---

### DELETE `/api/me/items/{item}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `items` | Deletes the item |
| **CASCADE DELETE** | `item_images` | All associated images deleted |
| **CASCADE DELETE** | `item_size` | All size relationships removed |
| **CASCADE DELETE** | `item_tag` | All tag relationships removed |
| **CASCADE DELETE** | `item_user` | All favorite relationships removed |

---

## Blog Routes

### GET `/api/blogs`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `blogs` | Returns paginated list of all blogs |
| **READ** | `users` | Eager loads blog authors |

**Query Parameters:**
- `per-page` (default: 15)

---

### GET `/api/blogs/{blog}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `blogs` | Returns specific blog by ID |
| **READ** | `users` | Eager loads the author |

---

### GET `/api/me/blogs`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `blogs` | Returns paginated list of authenticated user's blogs |

---

### POST `/api/me/blogs`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `blogs` | Creates a new blog post |

**Fields Created:**
```
blogs:
  - id (auto-generated)
  - title (required, min:4, max:255)
  - content (required, min:30, max:5000)
  - status (required, 1=Draft or 2=Published)
  - user_id (authenticated user)
  - image (nullable, via async job)
  - image_kit_id (nullable, via async job)
  - created_at
  - updated_at
```

---

### PUT `/api/me/blogs/{blog}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `blogs` | Updates blog attributes |
| **ASYNC UPDATE** | `blogs` | Job updates `image` and `image_kit_id` if new image uploaded |

**Updatable Fields:**
```
blogs:
  - title
  - content
  - status
  - image (async via job)
  - image_kit_id (async via job)
  - updated_at
```

---

### DELETE `/api/me/blogs/{blog}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `blogs` | Deletes the blog post |
| **EXTERNAL DELETE** | ImageKit | Queued job deletes image from ImageKit CDN |

---

## Brand Routes (Admin)

### GET `/api/brands`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `brands` | Returns all brands with item counts |
| **COUNT** | `items` | Counts items per brand |

---

### GET `/api/brands/{brand}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `brands` | Returns specific brand by ID |
| **READ** | `items`, `item_images`, `categories`, `sizes` | Eager loads brand's items and relations |
| **COUNT** | `items` | Counts items for this brand |

---

### POST `/api/brands`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `brands` | Creates a new brand (admin only) |

**Fields Created:**
```
brands:
  - id (auto-generated)
  - name (required, unique, max:255)
  - slug (auto-generated from name)
  - description (nullable, max:5000)
  - logo (nullable, via async job)
  - image_kit_id (nullable, via async job)
  - created_at
  - updated_at
```

---

### PUT `/api/brands/{brand}`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `brands` | Updates brand attributes |
| **ASYNC UPDATE** | `brands` | Job updates logo/image_kit_id if new logo uploaded |

---

### DELETE `/api/brands/{brand}`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `brands` | Deletes the brand |
| **EXTERNAL DELETE** | ImageKit | Queued job deletes logo from ImageKit CDN |
| **CASCADE DELETE** | `items` | All items with this brand are deleted |

---

## Category Routes (Admin)

### GET `/api/categories`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `categories` | Returns all categories |
| **READ** | `sizes` | Eager loads sizes per category |

---

### GET `/api/categories/{category}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `categories` | Returns specific category by ID |
| **READ** | `sizes` | Eager loads category's sizes |

---

### GET `/api/categories/{category}/sizes`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `sizes` | Returns sizes for a specific category |

---

### POST `/api/categories`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `categories` | Creates a new category (admin only) |

**Fields Created:**
```
categories:
  - id (auto-generated)
  - name (required, unique, min:3, max:255)
  - slug (auto-generated from name)
  - image (nullable, via async job)
  - image_kit_id (nullable, via async job)
  - created_at
  - updated_at
```

---

### PUT `/api/categories/{category}`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `categories` | Updates category attributes |

---

### DELETE `/api/categories/{category}`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `categories` | Deletes the category |
| **EXTERNAL DELETE** | ImageKit | Queued job deletes image from ImageKit CDN |
| **CASCADE DELETE** | `items` | All items in this category are deleted |
| **CASCADE DELETE** | `sizes` | All sizes for this category are deleted |

---

## Size Routes (Admin)

### GET `/api/sizes`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `sizes` | Returns all sizes |
| **READ** | `categories` | Eager loads the category for each size |

---

### GET `/api/sizes/{size}`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `sizes` | Returns specific size by ID |
| **READ** | `categories` | Eager loads the category |

---

### POST `/api/sizes`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `sizes` | Creates a new size (admin only) |

**Fields Created:**
```
sizes:
  - id (auto-generated)
  - category_id (required, FK)
  - label (required, unique, max:255)
  - created_at
  - updated_at
```

---

### PUT `/api/sizes/{size}`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **UPDATE** | `sizes` | Updates size attributes |

---

### DELETE `/api/sizes/{size}`
**Middleware:** `auth:sanctum`, `admin`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `sizes` | Deletes the size |
| **CASCADE DELETE** | `item_size` | All item-size relationships removed |

---

## Follower Routes

### GET `/api/me/followers`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `user_user` | Returns paginated list of users following the authenticated user |
| **COUNT** | `user_user` | Counts following/followers for each returned user |

**Pivot Table Query:**
```sql
SELECT users.* FROM users
INNER JOIN user_user ON users.id = user_user.follower_id
WHERE user_user.user_id = {authenticated_user_id}
```

---

### GET `/api/me/following`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `user_user` | Returns paginated list of users the authenticated user follows |
| **COUNT** | `user_user` | Counts following/followers for each returned user |

**Pivot Table Query:**
```sql
SELECT users.* FROM users
INNER JOIN user_user ON users.id = user_user.user_id
WHERE user_user.follower_id = {authenticated_user_id}
```

---

### POST `/api/me/users/{user}/follow`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `user_user` | Creates a follow relationship (if not exists) |

**Fields Created:**
```
user_user:
  - id (auto-generated)
  - user_id (the user being followed)
  - follower_id (authenticated user)
  - created_at
  - updated_at
```

**Validation:** Cannot follow yourself

---

### DELETE `/api/me/users/{user}/unfollow`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `user_user` | Removes the follow relationship |

**Validation:** Must be currently following the user

---

## Favorite Routes

### GET `/api/me/favourites`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `item_user` | Returns paginated list of authenticated user's favorite items |
| **READ** | `items` | Returns the favorited items |

**Pivot Table Query:**
```sql
SELECT items.* FROM items
INNER JOIN item_user ON items.id = item_user.item_id
WHERE item_user.user_id = {authenticated_user_id}
```

---

### POST `/api/me/favourites/{item}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `item_user` | Adds item to favorites (if not exists) |

**Fields Created:**
```
item_user:
  - id (auto-generated)
  - user_id (authenticated user)
  - item_id (the favorited item)
  - created_at
  - updated_at
```

**Validation:** Cannot favorite your own item

---

### DELETE `/api/me/favourites/{item}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `item_user` | Removes item from favorites |

---

## Tag Routes

### GET `/api/tags/{tag:slug}/items`
**Public Route**

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **READ** | `tags` | Finds tag by slug |
| **READ** | `item_tag` | Gets items associated with the tag |
| **READ** | `items`, `users`, `item_images`, `categories`, `sizes` | Eager loads item relationships |

**Query Parameters:**
- `per-page` (default: 15)

---

## Item Image Routes

### POST `/api/me/items/{item}/images`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **CREATE** | `item_images` | Queued job creates image records via ImageKit |

**Fields Created (async via job):**
```
item_images:
  - id (auto-generated)
  - item_id (from URL parameter)
  - url (ImageKit CDN URL)
  - image_kit_id (ImageKit file ID)
  - position (auto-assigned)
  - created_at
  - updated_at
```

---

### DELETE `/api/me/items/{item}/images/{image}`
**Middleware:** `auth:sanctum`

**Database Operations:**
| Operation | Table | Description |
|-----------|-------|-------------|
| **DELETE** | `item_images` | Deletes the image record |
| **EXTERNAL DELETE** | ImageKit | Queued job deletes file from ImageKit CDN |

---

## Database Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │    items    │       │   brands    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │──┐    │ id          │    ┌──│ id          │
│ name        │  │    │ name        │    │  │ name        │
│ email       │  │    │ description │    │  │ slug        │
│ password    │  │    │ price       │    │  │ description │
│ phone       │  │    │ condition   │    │  │ logo        │
│ city        │  ├───>│ user_id     │<───┤  └─────────────┘
│ bio         │  │    │ category_id │<───┤
│ profile_pic │  │    │ brand_id    │<───┘  ┌─────────────┐
│ role        │  │    │ approval_   │       │ categories  │
└─────────────┘  │    │   status    │       ├─────────────┤
                 │    └─────────────┘       │ id          │
                 │           │              │ name        │
                 │           │              │ slug        │
                 │           ▼              │ image       │
                 │    ┌─────────────┐       └─────────────┘
                 │    │ item_images │              │
                 │    ├─────────────┤              │
                 │    │ id          │              ▼
                 │    │ item_id     │       ┌─────────────┐
                 │    │ url         │       │   sizes     │
                 │    │ image_kit_id│       ├─────────────┤
                 │    │ position    │       │ id          │
                 │    └─────────────┘       │ category_id │
                 │                          │ label       │
                 │    ┌─────────────┐       └─────────────┘
                 │    │   blogs     │
                 │    ├─────────────┤
                 │    │ id          │
                 └───>│ user_id     │
                      │ title       │
                      │ content     │
                      │ image       │
                      │ status      │
                      └─────────────┘

PIVOT TABLES:

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  item_user  │       │  user_user  │       │  item_size  │
│ (favorites) │       │ (followers) │       │             │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ user_id     │       │ user_id     │       │ item_id     │
│ item_id     │       │ follower_id │       │ size_id     │
└─────────────┘       └─────────────┘       │ quantity    │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐
│  item_tag   │       │    tags     │
│             │       │             │
├─────────────┤       ├─────────────┤
│ item_id     │──────>│ id          │
│ tag_id      │       │ name        │
└─────────────┘       │ slug        │
                      └─────────────┘
```

---

## Summary: HTTP Methods and Database Operations

| HTTP Method | Database Operation | Description |
|-------------|-------------------|-------------|
| `GET` | **READ** | Retrieves data without modification |
| `POST` | **CREATE** | Inserts new records |
| `PUT/PATCH` | **UPDATE** | Modifies existing records |
| `DELETE` | **DELETE** | Removes records |

### Cascade Delete Behavior

When parent records are deleted, the following cascades occur:

| Parent Deleted | Child Records Deleted |
|----------------|----------------------|
| User | Items, Blogs, Favorites, Followers/Following, Tokens |
| Item | ItemImages, ItemSizes, ItemTags, Favorites |
| Category | Items, Sizes |
| Brand | Items |
| Size | ItemSizes |
| Tag | ItemTags |

---

## External Services

### ImageKit CDN
Used for storing and serving images for:
- Item images
- Blog images
- Brand logos
- Category images

**Jobs that interact with ImageKit:**
- `StoreItemImage` - Uploads item images
- `StoreBlogImage` - Uploads blog images
- `StoreBrandImage` - Uploads brand logos
- `StoreCategoryImage` - Uploads category images
- `DeleteImageKitImage` - Deletes images from ImageKit

---

*Last updated: January 28, 2026*
