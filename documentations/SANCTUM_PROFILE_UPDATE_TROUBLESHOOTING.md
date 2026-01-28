# Sanctum Auth Troubleshooting (Profile & Items)

This document explains why Sanctum blocks requests and what backend changes are needed to fix update/create issues for profile and items.

## Why Sanctum blocks requests

Sanctum blocks or rejects requests for these reasons:

- **Missing or invalid token**: Routes inside `Route::middleware('auth:sanctum')` require a valid API token in the `Authorization` header (`Bearer <token>`). If the token is missing, expired, or revoked, Laravel returns `401 Unauthorized`.
- **Using the wrong endpoint or method**: If the frontend calls an endpoint that does not exist (e.g. `PUT /api/profile` when your backend only defines `PATCH /api/me`), you get `404 Not Found` even if the token is valid.
- **CSRF mismatch for cookie-based auth**: If you are using Sanctum with cookies (SPA mode), Laravel requires a valid CSRF token cookie (`XSRF-TOKEN`) and header (`X-XSRF-TOKEN`). If those are missing or mismatched, you get `419` or `401`.
- **CORS / credentials mismatch**: If the request does not include credentials or your backend does not allow the frontend origin, the browser blocks the call or Laravel rejects it.
- **Guard mismatch**: If Sanctum is not the active guard for API routes or your guard is misconfigured, the token will not be recognized.

## What is happening in this project

Your `api.php` routes show:

- **Update profile**: `PATCH /api/me` (protected by `auth:sanctum`)
- **Fetch user**: `GET /api/user` (protected by `auth:sanctum`)

There is **no `/api/profile`** route in the backend. So calling `PUT /api/profile` returns `404` even when authenticated.

## Backend changes that fix the issue

Choose one of these two paths:

### Option A — Keep the current routes (recommended)

Do not add new routes. Just ensure the frontend calls:

- `PATCH /api/me` for updating profile (including profile picture)
- `GET /api/user` for fetching profile

This is already the backend contract defined in `api.php`.

### Option B — Add `/api/profile` routes (if you want those URLs)

Add routes in `routes/api.php` so the frontend can call `/api/profile` and `/api/profile/picture`:

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [UserController::class, 'show']);
    Route::put('profile', [UserController::class, 'update']); // accepts JSON or multipart
    Route::put('profile/picture', [UserController::class, 'updateProfilePicture']);
});
```

You must also add controller methods (`show`, `updateProfilePicture`) or point them at your existing `update` method if it already handles `profile_picture`.

## Sanctum configuration checklist (backend)

These backend settings must match your frontend:

1. **Sanctum guard**  
   `config/auth.php` should include:
   ```php
   'guards' => [
       'api' => [
           'driver' => 'sanctum',
           'provider' => 'users',
       ],
   ],
   ```

2. **CORS and credentials**  
   `config/cors.php` must allow your frontend origin and credentials:
   ```php
   'paths' => ['api/*', 'sanctum/csrf-cookie'],
   'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
   'allowed_headers' => ['*'],
   'allowed_methods' => ['*'],
   'supports_credentials' => true,
   ```

3. **Stateful domains (if using cookie auth)**  
   `config/sanctum.php` should include your frontend origin:
   ```php
   'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173,localhost:3000')),
   ```

4. **Login response returns token**  
   Ensure `/api/login` returns a valid token and the frontend stores it.

## Frontend request rules (token-based)

If you are using tokens (recommended for your API):

- Always send `Authorization: Bearer <token>` on protected routes.
- No CSRF cookie is required for token-based calls.

For example:

```ts
await axios.patch('/api/me', payload, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});
```

## Common errors and fixes

| Error | Cause | Fix |
|------|-------|-----|
| 404 Not Found | Endpoint doesn’t exist | Use `PATCH /api/me` or add `/api/profile` routes |
| 401 Unauthorized | Missing/invalid token | Ensure login returns token and frontend sends `Authorization` |
| 419/CSRF error | Cookie auth missing CSRF token | Use `/sanctum/csrf-cookie` and send cookies or use token auth |
| CORS error | Origin not allowed | Update `config/cors.php` and `SANCTUM_STATEFUL_DOMAINS` |

## Recommended backend change for this project

If you want the frontend to call `/api/profile`, add the routes from **Option B**.  
If you prefer a smaller backend change, keep the backend as-is and ensure the frontend uses **`PATCH /api/me`** for updates.
