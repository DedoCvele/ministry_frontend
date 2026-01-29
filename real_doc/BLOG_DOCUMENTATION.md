# Blog API — Documentation

This document describes how blogs are processed, how images are stored, which API routes to use, request/response formats, and how to create, list, edit, and delete blogs. It also explains common frontend issues (placeholder errors, images saved as temp paths) and how to fix them.

---

## 1. Overview

- **Model:** `Blog` — `title`, `content`, `image`, `image_kit_id`, `status`, `user_id`, timestamps.
- **Image storage:** Blog images are uploaded as files, stored temporarily on the server, then uploaded to **ImageKit** by a queued job. The `image` column holds the ImageKit CDN URL; `image_kit_id` holds the ImageKit file ID for updates/deletes.
- **Status:** `BlogStatus::Draft` = `1`, `BlogStatus::Published` = `2`.

---

## 2. How blog images are processed

### 2.1 Flow (create/update with image)

1. **Request:** Client sends `multipart/form-data` with `image` as a **file** (not a URL or base64 string).
2. **Validation:** `image` is optional, must be `file`, `image`, and `mimes: png, jpg, jpeg, webp`.
3. **Temp storage:** The file is saved under `storage/app/private/tmp/` (local disk) via `store('tmp', 'local')`. The returned path (e.g. `tmp/abc123.jpg`) is passed to the job.
4. **Blog record:** The blog is created/updated **without** writing anything to `image` or `image_kit_id` from the request. Those fields are updated only by the job.
5. **Job `StoreBlogImage`:**  
   - Reads the file from `storage/app/private/` + temp path.  
   - Uploads it to ImageKit (`ministry-of-second-hand/images/blogs`).  
   - Updates the blog: `image` = ImageKit URL, `image_kit_id` = ImageKit file ID.  
   - Deletes the temp file.  
   - On **update**, deletes the previous ImageKit file before saving the new one.

### 2.2 Important points

- **`image` must be a real file upload** in `multipart/form-data`. Never send a URL string, base64, or a local path (e.g. `C:\xampp\tmp\...`).
- **`image` in the API response** is either `null` (no image or not yet processed) or the **ImageKit CDN URL**.
- Processing is **asynchronous**. Right after create/update with an image, `image` may still be `null` until the job runs. The frontend should handle `null` and optionally refetch or poll.

---

## 3. API routes

All blog routes are under `/api`. Auth uses **Sanctum** (`Authorization: Bearer <token>`).

### 3.1 Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/blogs` | Paginated list of all blogs |
| `GET` | `/api/blogs/{blog}` | Single blog by id |

### 3.2 Authenticated (`/api/me/blogs`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me/blogs` | Paginated list of **current user’s** blogs |
| `POST` | `/api/me/blogs` | Create blog |
| `GET` | `/api/me/blogs/{blog}` | Get one blog (must own it) |
| `PUT` | `/api/me/blogs/{blog}` | Update blog |
| `PATCH` | `/api/me/blogs/{blog}` | Same as PUT |
| `DELETE` | `/api/me/blogs/{blog}` | Delete blog |

---

## 4. Request / response details

### 4.1 GET `/api/blogs` (all blogs)

- **Query:** `per-page` (optional, default `15`).
- **Response (200):** Paginated collection of **BlogResource** with `user` loaded.

### 4.2 GET `/api/blogs/{blog}` (one blog)

- **Response (200):** Single **BlogResource** with `user` loaded.

### 4.3 GET `/api/me/blogs` (my blogs)

- **Query:** `per-page` (optional, default `15`).
- **Response (200):** Paginated **BlogResource** collection for the authenticated user.

### 4.4 POST `/api/me/blogs` — Create blog

- **Content-Type:** `multipart/form-data` if you send `image`; otherwise `application/json` is fine.
- **Body:**
  - `title` (string, **required**, min 4, max 255)
  - `content` (string, **required**, min 30, max 5000)
  - `image` (file, **optional**) — `png`, `jpg`, `jpeg`, `webp`
  - `status` (**required**) — `1` (Draft) or `2` (Published)

**Response (200):** Single **BlogResource**. If an image was sent, it is processed async; `image` may be `null` initially, then become the ImageKit URL after the job runs.

### 4.5 GET `/api/me/blogs/{blog}` — Get my blog

- **Response (200):** Single **BlogResource** with `user`.

### 4.6 PUT / PATCH `/api/me/blogs/{blog}` — Update blog

- **Content-Type:** `multipart/form-data` if you send `image`; otherwise `application/json`.
- **Body:** Same as create; all fields optional (`sometimes`):
  - `title`, `content`, `status`, `image` (file).

If `image` is sent, it replaces the previous image (old one deleted from ImageKit, new one uploaded via job).

**Response (200):** Single **BlogResource** with `user`.

### 4.7 DELETE `/api/me/blogs/{blog}` — Delete blog

- **Response:** `204 No Content`.  
- If the blog had an ImageKit image, `DeleteImageKitImage` is queued to remove it from ImageKit.

---

## 5. BlogResource structure

```json
{
  "id": 1,
  "title": "Blog title",
  "content": "Blog content...",
  "image": "https://ik.imagekit.io/.../blogs/...",
  "status": 1,
  "user": { ... }
}
```

- `image`: `null` when there is no image or it is not yet processed; otherwise the **ImageKit CDN URL**.
- `status`: `1` = Draft, `2` = Published.
- `user`: **UserResource** when loaded (e.g. on single blog or list).

---

## 6. Pagination

List endpoints return Laravel’s default paginated JSON:

- `data` — array of **BlogResource**
- `links` — `first`, `last`, `prev`, `next`
- `meta` — `current_page`, `from`, `last_page`, `path`, `per_page`, `to`, `total`

Use query `per-page` to change page size (default 15).

---

## 7. Errors

- **401 Unauthorized** — missing or invalid token on `/api/me/blogs` routes.
- **403 Forbidden** — e.g. updating/deleting another user’s blog.
- **404 Not Found** — blog not found.
- **422 Unprocessable Entity** — validation errors; body includes `message` and `errors` (field → messages).

---

## 8. Frontend: common issues and fixes

### 8.1 `via.placeholder.com` — `ERR_NAME_NOT_RESOLVED`

**What happens:** The frontend uses `blog.image` as `<img src="...">`. If the backend ever stored `https://via.placeholder.com/800x400?text=Blog+1` (e.g. from old seed data), the browser requests that URL. The error means the domain cannot be resolved (DNS/network or blocking).

**Fix:**

- **Backend:** Do **not** store external placeholder URLs in `image`. The seeder now uses `image: null`, `image_kit_id: null` for new seed data.
- **Frontend:**  
  - Never hardcode `via.placeholder.com` or similar external URLs for blog images.  
  - Use `blog.image` only when it is a non‑empty string (ImageKit URL).  
  - When `blog.image` is `null` or empty, either hide the image, or use a **local** placeholder (e.g. `/placeholder-blog.svg`) or inline SVG/data URI.  
  - Ensure the backend never returns external placeholder URLs for `image`.

### 8.2 Image “saved” as `C:\xampp\tmp\phpB69.tmp` (or similar temp path)

**What happens:** The `image` column contained a **server-side temp path** (e.g. `C:\xampp\tmp\phpB69.tmp`) instead of an ImageKit URL. The backend was wrongly persisting the uploaded file’s temp path into `image` on **create**.

**Why:**

- On create, the controller used to pass `$validated` (including `image` = `UploadedFile`) into `create()`. Laravel then cast the file to string when saving to the `image` column, which produced the temp path.
- On update, `image` was correctly unset before `update()`, so the bug only affected **create**.

**Fix (backend, already applied):**

- **Before** creating the blog: `unset($validated['image'])` so the file is never written to `image`.
- Store the upload under `tmp` and dispatch `StoreBlogImage`. The job updates `image` and `image_kit_id` with the ImageKit URL and file ID.

**Frontend:**

- **Never** send `image` as a path string (e.g. `C:\...` or any local path).  
- **Always** send `image` as a **file** in `multipart/form-data` (e.g. from `<input type="file">` or `FormData`).
- Use `Content-Type: multipart/form-data` when the request includes a file; do not use `application/json` for that payload.

### 8.3 Checklist for frontend

1. **Create blog (with image):** `POST /api/me/blogs` with `FormData`: `title`, `content`, `status`, and `image` as a **File**.
2. **Update blog (with new image):** `PUT` or `PATCH /api/me/blogs/{id}` with `FormData` including `image` as a **File** when changing the image.
3. **Display:** Use `blog.image` as `src` only when it’s a non‑empty string; otherwise use a local placeholder or no image.
4. **No external placeholders:** Do not use `via.placeholder.com` or similar for blog images.
5. **Handling async:** Right after create/update with image, `image` may be `null`. Refetch the blog or poll until `image` is set if you need to show it immediately.

---

## 9. Edit and delete (summary)

- **Edit:** `PUT` or `PATCH /api/me/blogs/{blog}` with the fields to change. Send `image` as a file only when replacing the image. Response: **BlogResource** with `user`.
- **Delete:** `DELETE /api/me/blogs/{blog}`. Response: `204 No Content`. ImageKit cleanup is done via a queued job.

---

## 10. Database and jobs

- **Table:** `blogs` — `id`, `title`, `content`, `user_id`, `image`, `image_kit_id`, `status`, `created_at`, `updated_at`.
- **Jobs:**  
  - `StoreBlogImage` — uploads temp file to ImageKit, updates `image` and `image_kit_id`, deletes temp file.  
  - `DeleteImageKitImage` — deletes the file from ImageKit when a blog with an image is deleted.

Ensure the queue worker is running so `StoreBlogImage` and `DeleteImageKitImage` run (e.g. `php artisan queue:work`).
