# Ministry of Second Hand — API & Database Documentation

**Audience:** Frontend implementation (including AI-driven frontends).  
**Base URL:** All API routes are under `/api`. Prepend your backend origin, e.g. `https://your-api.example.com/api`.

**Authentication:** Laravel Sanctum. Send the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

**Content type:** Use `Content-Type: application/json` for JSON bodies. For create/update with files, use `multipart/form-data` (see relevant routes).

**CORS:** Backend allows origins from `FRONTEND_URL` (default `http://localhost:3000`), `supports_credentials: true`, and `allowed_headers: ['*']`. Use `credentials: 'include'` when calling from the browser if using cookies; for token-only auth, just send the Bearer header.

### Quick route list (method + path)

```
POST   /api/register
POST   /api/login
POST   /api/forgot-password
POST   /api/reset-password
GET    /api/verify-email/{id}/{hash}
POST   /api/email/verification-notification
POST   /api/logout
GET    /api/user

# Me (auth)
PATCH  /api/me
DELETE /api/me
GET    /api/me/items
POST   /api/me/items
PUT    /api/me/items/{item}
PATCH  /api/me/items/{item}
DELETE /api/me/items/{item}
POST   /api/me/items/{item}/images
DELETE /api/me/items/{item}/images/{image}
GET    /api/me/blogs
POST   /api/me/blogs
GET    /api/me/blogs/{blog}
PUT    /api/me/blogs/{blog}
PATCH  /api/me/blogs/{blog}
DELETE /api/me/blogs/{blog}
GET    /api/me/followers
GET    /api/me/following
POST   /api/me/users/{user}/follow
DELETE /api/me/users/{user}/unfollow
GET    /api/me/favourites
POST   /api/me/favourites/{item}
DELETE /api/me/favourites/{item}

# Closets (auth)
GET    /api/closets
GET    /api/closets/{id}

# Public read
GET    /api/items
GET    /api/items/{item}
GET    /api/blogs
GET    /api/blogs/{blog}
GET    /api/brands
GET    /api/brands/{brand}
GET    /api/categories
GET    /api/categories/{category}
GET    /api/categories/{category}/sizes
GET    /api/users
GET    /api/users/{user}
GET    /api/sizes
GET    /api/sizes/{size}
GET    /api/tags/{tag:slug}/items

# Admin (auth + role Admin)
POST   /api/brands
PUT    /api/brands/{brand}
DELETE /api/brands/{brand}
POST   /api/categories
PUT    /api/categories/{category}
DELETE /api/categories/{category}
POST   /api/sizes
PUT    /api/sizes/{size}
DELETE /api/sizes/{size}
```

---

## Table of contents

1. [Authentication & user identity](#1-authentication--user-identity)
2. [Enums (use these exact values)](#2-enums-use-these-exact-values)
3. [Routes reference](#3-routes-reference)
4. [Database schema and relations](#4-database-schema-and-relations)
5. [ImageKit (images and files)](#5-imagekit-images-and-files)

---

## 1. Authentication & user identity

### How it works

- **Register** and **Login** return or establish the session; **Login** returns a **token**.
- Use that token as `Authorization: Bearer <token>` for all routes that require auth.
- **Logout** does not revoke the token on the backend; the frontend should discard the token and, if applicable, call logout for consistency (e.g. clearing cookies).

### Auth routes (no auth required unless noted)

All under `/api` (e.g. `/api/register`, `/api/login`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | `/register` | No  | Register a new user |
| POST   | `/login`    | No  | Log in; returns `user` + `token` |
| POST   | `/forgot-password` | No | Request password reset email |
| POST   | `/reset-password`  | No | Set new password with token from email |
| GET    | `/verify-email/{id}/{hash}` | Yes (Sanctum) | Verify email (signed link) |
| POST   | `/email/verification-notification` | Yes (Sanctum) | Resend verification email |
| POST   | `/logout`   | Yes (Sanctum) | Log out (session); frontend should drop token |

### Register — POST `/api/register`

**Request (JSON):**

- `name` (string, required, max 255)
- `email` (string, required, lowercase, email, max 255, unique)
- `password` (string, required, must satisfy default password rules)
- `password_confirmation` (string, required, must match `password`)

**Response:** `204 No Content` on success.  
**On validation error:** `422` with `message` and `errors` object.

---

### Login — POST `/api/login`

**Request (JSON):**

- `email` (string, required)
- `password` (string, required)
- `remember` (boolean, optional)

**Response (200):**

```json
{
  "user": { ... },   // UserResource shape, see below
  "token": "1|..."
}
```

Store `token` and send it as `Authorization: Bearer <token>` on subsequent requests.  
**On failure:** `422` with `errors.email` (e.g. "These credentials do not match our records.").  
**Rate limit:** 5 attempts per email per IP; then throttle with `errors.email` and `seconds`/`minutes`.

---

### Forgot password — POST `/api/forgot-password`

**Request (JSON):** `email` (required, email).

**Response (200):** `{ "status": "..." }` (translated message, e.g. "We have emailed your password reset link.").  
**On error:** `422` with `errors.email` (e.g. invalid email or "We can't find a user with that email address.").

---

### Reset password — POST `/api/reset-password`

**Request (JSON):**

- `token` (string, required) — from the reset link
- `email` (string, required, email)
- `password` (string, required, confirmed, same rules as registration)
- `password_confirmation` (string, required)

**Response (200):** `{ "status": "..." }`.  
**On error:** `422` with `errors.email`.

---

### Verify email — GET `/api/verify-email/{id}/{hash}`

**Auth:** Required (Sanctum).  
**Query:** Signed URL from the verification email (`id`, `hash` and signature).  
**Response:** Redirect to `frontend_url/dashboard?verified=1` (or similar). For a SPA, the frontend typically uses this as a success signal and then loads the app.

---

### Resend verification — POST `/api/email/verification-notification`

**Auth:** Required (Sanctum).  
**Request:** No body required.  
**Response (200):** `{ "status": "verification-link-sent" }` or redirect if already verified.

---

### Logout — POST `/api/logout`

**Auth:** Required (Sanctum).  
**Response:** `204 No Content`. Frontend should clear the stored token and any “logged-in” state.

---

### Current user — GET `/api/user`

**Auth:** Required (Sanctum).  
**Response (200):** Single object in **UserResource** shape (see “UserResource” below). Use this to restore the logged-in user (e.g. on app load) when you have a valid token.

---

## 2. Enums (use these exact values)

Send and compare using the **integer** values in the API and in your types.

**ItemCondition** (item condition):

- `1` — New  
- `2` — Excellent  
- `3` — Very Good  
- `4` — Good  
- `5` — Fair  

**ItemApprovalStatus** (item approval):

- `1` — Pending  
- `2` — Approved  
- `3` — Rejected  

**BlogStatus** (blog post):

- `1` — Draft  
- `2` — Published  

**UserRole** (user role):

- `1` — Admin  
- `2` — Buyer  
- `3` — Seller  

---

## 3. Routes reference

Unless stated otherwise, assume:

- **Auth:** “Auth” = `Authorization: Bearer <token>` required.
- **JSON:** Request/response are JSON when no files are involved.
- **Pagination:** List routes that support it accept query `per-page` (default 15). Responses use Laravel’s default pagination structure: `data`, `links`, `meta` (e.g. `current_page`, `last_page`, `per_page`, `total`).

---

### 3.1 Me (current user) — prefix `/api/me`

All require **Auth**.

| Method | Path | Description |
|--------|------|-------------|
| PATCH  | `/api/me`        | Update current user |
| DELETE | `/api/me`        | Delete current user account |
| GET    | `/api/me/items`  | Paginated list of current user’s items |
| POST   | `/api/me/items`  | Create item |
| PUT    | `/api/me/items/{item}` | Update item (must own it) |
| PATCH  | `/api/me/items/{item}` | Same as PUT for this API |
| DELETE | `/api/me/items/{item}` | Delete item (must own it) |
| GET    | `/api/me/blogs`  | Paginated list of current user’s blogs |
| POST   | `/api/me/blogs`  | Create blog |
| GET    | `/api/me/blogs/{blog}` | Get one blog (must own it) |
| PUT    | `/api/me/blogs/{blog}` | Update blog |
| PATCH  | `/api/me/blogs/{blog}` | Same as PUT |
| DELETE | `/api/me/blogs/{blog}` | Delete blog |
| POST   | `/api/me/items/{item}/images` | Add images to item |
| DELETE | `/api/me/items/{item}/images/{image}` | Delete one item image |
| GET    | `/api/me/followers` | Paginated list of followers |
| GET    | `/api/me/following` | Paginated list of users the current user follows |
| POST   | `/api/me/users/{user}/follow`   | Follow a user |
| DELETE | `/api/me/users/{user}/unfollow` | Unfollow a user |
| GET    | `/api/me/favourites` | Paginated list of favorited items |
| POST   | `/api/me/favourites/{item}` | Add item to favourites |
| DELETE | `/api/me/favourites/{item}` | Remove item from favourites |

---

#### PATCH `/api/me` — Update current user

**Request (JSON or multipart if `profile_picture` is a file):**

- `name` (string, optional, min 3, max 255)
- `password` (string, optional; must satisfy password rules; use with `password_confirmation` if your backend expects it)
- `phone` (string, optional, nullable; format like `+1 234 567 8900` or similar)
- `city` (string, optional, nullable, min 3)
- `bio` (string, optional, nullable, no minimum length, max 5000)
- `profile_picture`: either  
  - a **file** (image; SVG only if your backend validates that), or  
  - **string**: hex color `#RRGGBB`, a valid URL, or inline SVG markup (e.g. `<svg>…</svg>`) if the backend supports it  
- `role` (optional; only if allowed; use UserRole enum values)

**Response (200):** UserResource of the updated user.

---

#### DELETE `/api/me` — Delete account

**Response:** `204 No Content`.

---

#### GET `/api/me/items` — My items (paginated)

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated collection of **ItemResource** with `tags`, `mainImage`, `brand`, `category.sizes` loaded.

---

#### POST `/api/me/items` — Create item

**Content-Type:** `multipart/form-data` if you send `images` as files (recommended when creating with images).

**Body (form or JSON where applicable):**

- `name` (string, required, min 3, max 255)
- `description` (string, optional, max 4000)
- `material` (string, optional, max 300)
- `price` (number, required, min 1)
- `condition` (required) — ItemCondition enum value: `1|2|3|4|5`
- `approval_status` (required) — ItemApprovalStatus: `1|2|3`
- `location` (string, optional, max 255)
- `category_id` (integer, required, must exist in `categories`)
- `brand_id` (integer, required, must exist in `brands`)
- `sizes` (array, required, min 1 item). Each element:
  - `id` (integer, required) — size id; must belong to `category_id`
  - `quantity` (integer, required, min 1)
- `images` (array of files, required). Each file: image, `mimes: jpg, webp, jpeg, png`
- `tags` (array of strings, optional). Each element is a tag name (e.g. `"vintage"`); backend creates/finds tags by slug.

**Response (200):** Single **ItemResource** with `images`, `tags`, `brand`, `category`, `sizes` loaded.  
**Note:** Images are processed asynchronously via ImageKit. The item is returned immediately; image URLs may appear after a short delay (see [ImageKit](#5-imagekit-images-and-files)).

---

#### PUT/PATCH `/api/me/items/{item}` — Update item

Same fields as create; all except noted are optional when using `sometimes` rules:

- `name`, `price`, `condition`, `approval_status`, `category_id`, `brand_id` — if present, same rules as create
- `sizes` — if present, full array of `{ id, quantity }`; must belong to the (new or current) category
- `images` — optional array of image files (additional images; same mimes as create)
- `tags` — optional array of tag names; replaces item’s tags

**Response (200):** Single **ItemResource** with relations loaded.

---

#### DELETE `/api/me/items/{item}` — Delete item

**Response:** `204 No Content`. Must be the item owner.

---

#### POST `/api/me/items/{item}/images` — Add images to item

**Content-Type:** `multipart/form-data`.

**Body:**

- `images` (array of files, required). Each: image, `mimes: jpg, jpeg, png, webp`

**Response (200):** Collection of **ItemImageResource** for that item’s images (includes newly queued ones; new URLs may appear after ImageKit job runs).

---

#### DELETE `/api/me/items/{item}/images/{image}` — Delete one item image

`{image}` is the **ItemImage** id (not the ImageKit id).

**Response:** `204 No Content`. Image is removed from DB and delete is queued on ImageKit.

---

#### GET `/api/me/followers` — My followers

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **UserResource** collection of followers, with `following_count` and `followers_count`.

---

#### GET `/api/me/following` — Users I follow

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **UserResource** collection, with counts.

---

#### POST `/api/me/users/{user}/follow` — Follow user

**Response (201):**

```json
{
  "user": { ... },   // UserResource
  "message": "You are now following {name}"
}
```

**Error (422):** Cannot follow yourself (`user` id equals current user).

---

#### DELETE `/api/me/users/{user}/unfollow` — Unfollow

**Response:** `204 No Content`.  
**Error (422):** If you don’t follow that user.

---

#### GET `/api/me/favourites` — My favourites

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **ItemResource** collection of favourited items.

---

#### POST `/api/me/favourites/{item}` — Add favourite

**Response (200):** Single **ItemResource** for that item.  
**Error (422):** Cannot favourite your own item.

---

#### DELETE `/api/me/favourites/{item}` — Remove favourite

**Response (200):** `{ "message": "Item successfully unfavorited" }`.  
**Response (404):** `{ "message": "Item not found in favorites" }` if it wasn’t in favourites.

---

#### GET `/api/me/blogs` — My blogs (paginated)

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **BlogResource** collection.

---

#### POST `/api/me/blogs` — Create blog

**Content-Type:** `multipart/form-data` if you send `image`.

**Body:**

- `title` (string, required, min 4, max 255)
- `content` (string, required, min 30, max 5000)
- `image` (file, optional) — image, `mimes: png, jpg, jpeg, webp`
- `status` (required) — BlogStatus: `1` (Draft) or `2` (Published)

**Response (200):** Single **BlogResource**. If an image was sent, it is processed asynchronously (ImageKit); `image` URL may appear shortly after.

---

#### GET `/api/me/blogs/{blog}` — Get my blog

**Response (200):** Single **BlogResource** with `user` loaded.

---

#### PUT/PATCH `/api/me/blogs/{blog}` — Update blog

Same fields as create; all optional with `sometimes`.  
`image` (file, optional): if sent, replaces the previous blog image (ImageKit handled in job).

**Response (200):** Single **BlogResource** with `user`.

---

#### DELETE `/api/me/blogs/{blog}` — Delete blog

**Response:** `204 No Content`. If the blog had an ImageKit image, deletion is queued.

---

### 3.2 Closets (auth required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/closets` | Users with role Seller (3) that have items |
| GET | `/api/closets/{id}` | One “closet” (user) by id with items |

**GET `/api/closets`**  
**Response (200):** Collection of **UserResource** for users with `role === 3` and at least one item; includes `items` and `items_count`.

**GET `/api/closets/{id}`**  
**Response (200):** Single **UserResource** with `items` loaded. `{id}` is the user id.

---

### 3.3 Public read-only routes (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | All items (paginated) |
| GET | `/api/items/{item}` | One item by id |
| GET | `/api/blogs` | All blogs (paginated) |
| GET | `/api/blogs/{blog}` | One blog |
| GET | `/api/brands` | All brands |
| GET | `/api/brands/{brand}` | One brand (with items, etc.) |
| GET | `/api/categories` | All categories with sizes |
| GET | `/api/categories/{category}` | One category with sizes |
| GET | `/api/categories/{category}/sizes` | Sizes for a category |
| GET | `/api/users` | All users (paginated; excludes Admin role) |
| GET | `/api/users/{user}` | One user by id |
| GET | `/api/sizes` | All sizes — **note:** in code this is currently wired to `UserController::index` by mistake; treat as “all sizes” and use **SizeController** semantics: list of sizes with category. If you get users instead, use **GET `/api/categories/{category}/sizes`** or fix the backend route. |
| GET | `/api/sizes/{size}` | One size by id |
| GET | `/api/tags/{tag:slug}/items` | Items for a tag; `{tag}` is the tag **slug** (e.g. `/api/tags/vintage/items`) |

---

#### GET `/api/items` — All items

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **ItemResource** with `user`, `tags`, `mainImage`, `brand`, `category`, `sizes`.

---

#### GET `/api/items/{item}` — One item

**Response (200):** Single **ItemResource** with `tags`, `images`, `brand`, `category`, `user`.

---

#### GET `/api/blogs` — All blogs

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **BlogResource** with `user`.

---

#### GET `/api/blogs/{blog}` — One blog

**Response (200):** Single **BlogResource** with `user`.

---

#### GET `/api/brands` — All brands

**Response (200):** Collection of **BrandResource** with `items_count` (no pagination).

---

#### GET `/api/brands/{brand}` — One brand

**Response (200):** Single **BrandResource** with `items` (with `images`, `category`, `sizes`) and `items_count`.

---

#### GET `/api/categories` — All categories

**Response (200):** Collection of **CategoryResource** with `sizes` (no pagination).

---

#### GET `/api/categories/{category}` — One category

**Response (200):** Single **CategoryResource** with `sizes`.

---

#### GET `/api/categories/{category}/sizes` — Sizes for category

**Response (200):** Collection of **SizeResource** (each with `category` when loaded). Use this to show size options when creating/editing items in that category.

---

#### GET `/api/users` — All users

**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **UserResource**. Users have `items` (with category, sizes, images, brand). Counts `following_count`, `followers_count` are present. Excludes role Admin (1).

---

#### GET `/api/users/{user}` — One user

**Response (200):** Single **UserResource** with `items` and counts.

---

#### GET `/api/sizes/{size}` — One size

**Response (200):** Single **SizeResource** with `category`.

---

#### GET `/api/tags/{tag:slug}/items` — Items by tag slug

**URL:** Use the tag’s **slug**, e.g. `/api/tags/vintage/items`.  
**Query:** `per-page` (optional, default 15).

**Response (200):** Paginated **ItemResource** with `user`, `mainImage`, `images`, `category`, `sizes`.

---

### 3.4 Admin-only routes (Auth + Admin role)

Require **Auth** and user `role === 1` (Admin).  
Base path `/api`.

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/brands` | Create brand |
| PUT    | `/api/brands/{brand}` | Update brand |
| DELETE | `/api/brands/{brand}` | Delete brand |
| POST   | `/api/categories` | Create category |
| PUT    | `/api/categories/{category}` | Update category |
| DELETE | `/api/categories/{category}` | Delete category |
| POST   | `/api/sizes` | Create size |
| PUT    | `/api/sizes/{size}` | Update size |
| DELETE | `/api/sizes/{size}` | Delete size |

---

#### POST `/api/brands` — Create brand (admin)

**Request (JSON or multipart if logo):**

- `name` (string, required, unique among brands)
- `description` (string, optional, max 5000)
- `logo` (file, optional) — image, `mimes: jpg, jpeg, webp, png`

**Response (200):** Single **BrandResource**. Logo is processed asynchronously (ImageKit).

---

#### PUT `/api/brands/{brand}` — Update brand (admin)

- `name` (optional, unique when provided)
- `description` (optional, max 5000)
- `logo` (file, optional) — replaces previous; queued to ImageKit  
  (Backend bug: code uses `$request->file('image')` instead of `'logo'`; may need backend fix.)

**Response (200):** Single **BrandResource**.

---

#### DELETE `/api/brands/{brand}` — Delete brand (admin)

**Response:** `204 No Content`. ImageKit delete is queued if `image_kit_id` exists.

---

#### POST `/api/categories` — Create category (admin)

**Request:**

- `name` (string, required, unique, min 3, max 255)
- `image` (file, optional) — `mimes: png, jpg, jpeg, webp`

**Response (200):** Single **CategoryResource**. Image is uploaded via ImageKit job.

---

#### PUT `/api/categories/{category}` — Update category (admin)

- `name` (optional, unique when provided)
- `image` (file, optional)

**Response:** No JSON body in current implementation; expect 200 and potentially empty or legacy behaviour. Prefer **GET** `/api/categories/{category}` to read updated data.

---

#### DELETE `/api/categories/{category}` — Delete category (admin)

**Response:** `204 No Content`. ImageKit delete is queued when `image_kit_id` is set. (Code has typo `image_kit_it` in one place; may need backend fix.)

---

#### POST `/api/sizes` — Create size (admin)

**Request (JSON):**

- `category_id` (integer, required, must exist)
- `label` (string, required, max 255, unique among sizes)

**Response (200):** Single **SizeResource** with `category`.

---

#### PUT `/api/sizes/{size}` — Update size (admin)

**Request (JSON):**

- `category_id` (integer, required)
- `label` (string, required, max 255, unique per category excluding current size)

**Response (200):** Single **SizeResource** with `category`.

---

#### DELETE `/api/sizes/{size}` — Delete size (admin)

**Response:** `204 No Content`.

---

## 4. Database schema and relations

Use this to understand IDs and how to combine responses (e.g. `category_id` on items, `user_id` on items, etc.) and to drive types and validation on the frontend.

### 4.1 Tables and columns

**users**

- `id` (PK)
- `name`, `email` (unique), `password`
- `email_verified_at`, `remember_token`
- `phone`, `city`, `bio`, `profile_picture` (nullable)
- `role` (tinyint, default 2 — Buyer): 1 Admin, 2 Buyer, 3 Seller
- `timestamps`

**items**

- `id` (PK)
- `name`, `description`, `material`, `price`, `condition`, `location`
- `user_id` (FK → users), `category_id` (FK → categories), `brand_id` (FK → brands)
- `approval_status` (tinyint, default 1)
- `timestamps`

**item_images**

- `id` (PK)
- `url`, `image_kit_id`, `position`
- `item_id` (FK → items)
- Unique `(item_id, position)`
- `timestamps`

**blogs**

- `id` (PK)
- `title`, `content`
- `user_id` (FK → users)
- `image`, `image_kit_id` (nullable)
- `status` (tinyint, default 1)
- `timestamps`

**brands**

- `id` (PK)
- `name`, `slug`, `description`, `logo`, `image_kit_id` (nullable)
- `timestamps`

**categories**

- `id` (PK)
- `name` (unique), `slug` (unique), `image`, `image_kit_id` (nullable)
- `timestamps`

**sizes**

- `id` (PK)
- `category_id` (FK → categories)
- `label`
- Unique `(category_id, label)`
- `timestamps`

**tags**

- `id` (PK)
- `name`, `slug`
- `timestamps`

**item_size** (pivot)

- `id`
- `item_id` (FK → items), `size_id` (FK → sizes)
- `quantity` (tinyint unsigned)
- `timestamps`

**item_tag** (pivot)

- `id`
- `item_id` (FK → items), `tag_id` (FK → tags)
- `timestamps`

**item_user** (favourites)

- `id`
- `user_id` (FK → users), `item_id` (FK → items)
- Unique `(user_id, item_id)`
- `timestamps`

**user_user** (follows)

- `id`
- `user_id` (the user who is followed), `follower_id` (the user who follows)
- `timestamps`

---

### 4.2 Entity relations (for frontend logic)

**User**

- **items** — one-to-many (user has many items)
- **blogs** — one-to-many
- **followers** — many-to-many via `user_user`: “users who follow this user” (`user_id` = this user, `follower_id` = follower)
- **following** — many-to-many via `user_user`: “users this user follows” (`follower_id` = this user, `user_id` = followed)
- **favorites** — many-to-many with Item via `item_user` (favourite items)

**Item**

- **user** — many-to-one (owner)
- **category** — many-to-one
- **brand** — many-to-one
- **tags** — many-to-many via `item_tag`
- **images** — one-to-many ItemImage; order by `position`
- **mainImage** — first image (`position === 1`) if you expose it
- **sizes** — many-to-many via `item_size` with pivot **quantity**

**ItemImage**

- **item** — many-to-one

**Blog**

- **user** — many-to-one

**Brand**

- **(items)** — one-to-many (Brand has many Items; not always loaded in list response)

**Category**

- **sizes** — one-to-many (Size belongs to Category)

**Size**

- **category** — many-to-one
- **items** — many-to-many via `item_size` with pivot **quantity**

**Tag**

- **items** — many-to-many via `item_tag`

---

### 4.3 How to use relations in the frontend

- **Creating/editing an item**
  - Load **categories** (`GET /api/categories`), then for the chosen category load **sizes** (`GET /api/categories/{id}/sizes`).
  - Send `sizes` as `[{ id: sizeId, quantity: number }]` with `id` from that category.
  - Use **brands** from `GET /api/brands` for `brand_id`.
  - Tags: send an array of strings; backend resolves slug/name.

- **Displaying an item**
  - Use `item.category`, `item.brand`, `item.tags`, `item.images` (or `mainImage` when the API exposes it), `item.user` when loaded.
  - Sizes in **ItemResource** are an array of Size objects; **quantity** lives in the `item_size` pivot. If the API does not expose `quantity` on each size in the item payload, you may need to ask the backend to add it (e.g. `sizes[].quantity` or a custom resource when in item context).

- **Follow/followers**
  - Follow: `POST /api/me/users/{user}/follow`.
  - Unfollow: `DELETE /api/me/users/{user}/unfollow`.
  - List followers: `GET /api/me/followers`; list following: `GET /api/me/following`.
  - `UserResource` can include `is_followed` and counts when loaded in a context where the backend checks the current user.

- **Favourites**
  - Add: `POST /api/me/favourites/{item}`.
  - Remove: `DELETE /api/me/favourites/{item}`.
  - List: `GET /api/me/favourites`.

- **Tag → items**
  - Use slug: `GET /api/tags/{slug}/items` (e.g. `/api/tags/vintage/items`).

---

## 5. ImageKit (images and files)

### 5.1 What ImageKit does in this backend

ImageKit is used to store and serve images for:

- **Items** — multiple images per item (`item_images.url`, `item_images.image_kit_id`)
- **Blogs** — one image per blog (`blogs.image`, `blogs.image_kit_id`)
- **Brands** — logo (`brands.logo`, `brands.image_kit_id`)
- **Categories** — one image per category (`categories.image`, `categories.image_kit_id`)

The backend never returns raw files; it returns **URLs** that point to ImageKit (or your ImageKit CDN). The frontend should use these URLs as `src` for `<img>` or equivalent.

### 5.2 What the frontend must do

1. **Upload**
   - Send image **files** in the request bodies described above (e.g. `images[]` for items, `image` for blog, `logo` for brand, `image` for category).
   - Use `multipart/form-data` for those requests.
   - Do **not** upload directly to ImageKit from the browser in the current design; the backend receives the file and queues a job to upload to ImageKit.

2. **Display**
   - Use the **url** fields from the API:
     - **ItemResource** → `images[].url` (or `mainImage.url` if exposed)
     - **BlogResource** → `image`
     - **BrandResource** → `logo`
     - **CategoryResource** → `image`

3. **Timing**
   - Create/update responses are returned **before** the ImageKit job runs. New or updated image URLs may be empty or old for a short period (seconds). Options:
     - Poll the resource (e.g. `GET /api/me/items/{id}`) until `images`/`image`/`logo` look updated, or
     - Use a “pending”/placeholder state and refetch after a short delay or after a “media ready” webhook if you add one later.

### 5.3 What the backend needs (env and config)

The backend uses these environment variables (see `config/image-kit.php`):

- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT` (e.g. `https://ik.imagekit.io/your-id`)

ImageKit folders used in jobs:

- Items: `ministry-of-second-hand/images/items`
- Blogs: `ministry-of-second-hand/images/blogs`
- Brands: `ministry-of-second-hand/images/brands`
- Categories: `ministry-of-second-hand/images/categories`

The frontend does **not** need these keys or paths; it only needs to send files to the API and use the returned URLs.

### 5.4 Allowed file types

- Items / Item images: `jpg`, `jpeg`, `png`, `webp`
- Blog image: `png`, `jpg`, `jpeg`, `webp`
- Brand logo: `jpg`, `jpeg`, `webp`, `png`
- Category image: `png`, `jpg`, `jpeg`, `webp`

---

## 6. Resource shapes (response types)

Use these to type your frontend models and API clients.

**UserResource**

- `id`, `name`, `email`
- `is_followed` (boolean, when in a context where the backend checks the current user)
- `followers_count`, `following_count` (when loaded with counts)
- `created_at`, `updated_at` (formatted strings in the current API)
- `items` (array of ItemResource when relation loaded)

**ItemResource**

- `id`, `name`, `description`, `material`, `price`, `condition`, `location`, `approval_status`
- `category` (CategoryResource or null)
- `brand` (BrandResource or null)
- `tags` (array of TagResource)
- `user` (UserResource or null)
- `images` (array of ItemImageResource)
- `sizes` (array of SizeResource; pivot `quantity` may or may not be included—see above)

**ItemImageResource**

- `id`, `url`, `position`

**BlogResource**

- `id`, `title`, `content`, `image`, `status`
- `user` (UserResource or null)

**CategoryResource**

- `id`, `name`, `slug`, `image`
- `sizes` (array of SizeResource when loaded)

**BrandResource**

- `id`, `name`, `slug`, `description`, `logo`
- `items` (array of ItemResource when loaded)
- `items_count` (when loaded with count)

**SizeResource**

- `id`, `label`
- `category` (CategoryResource or null when loaded)

**TagResource**

- `id`, `name`, `slug`
- `items` (array of ItemResource when loaded)

---

## 7. Pagination

List endpoints that support pagination use Laravel’s default paginated JSON:

- `data` — array of resources
- `links` — `first`, `last`, `prev`, `next` URLs
- `meta` — e.g. `current_page`, `from`, `last_page`, `path`, `per_page`, `to`, `total`

Use query `per-page` to set page size (default 15).

---

## 8. Errors

- **401 Unauthorized** — missing or invalid token on protected routes.
- **403 Forbidden** — e.g. non-admin calling admin routes.
- **404 Not Found** — no resource for given id/slug.
- **422 Unprocessable Entity** — validation errors; body has `message` and `errors` (object of field → array of messages).
- **429 Too Many Requests** — rate limit (e.g. login); often includes retry-after or message.

---

This document reflects the codebase as of the latest review. If you discover mismatches (e.g. wrong controller for `/api/sizes`, or missing pivot `quantity` in item sizes), treat the backend as the source of truth and adjust the doc or the backend as appropriate.
