# Frontend Guide: Profile Update (Sanctum + /api/me)

This guide explains how the frontend should call the profile update endpoints and what improvements will make frontend ↔ backend communication more reliable.

## Required endpoint contract

- **Update current user**: `PATCH /api/me`
- **Delete current user**: `DELETE /api/me`
- **Fetch current user**: `GET /api/user`

The backend now uses the authenticated user directly for `/api/me` (no user id in the URL).

## Authentication modes (pick one and be consistent)

### Option A — Cookie-based (Sanctum SPA mode)

Use this if the app runs in a browser and your backend is configured with `EnsureFrontendRequestsAreStateful`.

1. **Fetch CSRF cookie once per session**  
   `GET /sanctum/csrf-cookie` (send credentials)

2. **Login**  
   `POST /api/login` (send credentials)

3. **Authenticated requests**  
   - Send `credentials: 'include'` (fetch) or `withCredentials: true` (axios)
   - Send `X-XSRF-TOKEN` header if your client doesn’t do it automatically

### Option B — Token-based (API clients / mobile)

Use this if you are not relying on browser cookies.

1. **Login**  
   `POST /api/login` → store the returned token

2. **Authenticated requests**  
   `Authorization: Bearer <token>`

## Profile update request

### JSON update (no file)

- **Method**: `PATCH`
- **URL**: `/api/me`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - Auth headers as per chosen mode
- **Body**: any subset of allowed fields

Allowed fields:
- `name` (string, min 3, max 255)
- `password` (string, must match backend password rules)
- `phone` (string, nullable, matches phone regex)
- `city` (string, nullable, min 3)
- `bio` (string, nullable, min 20, max 5000)
- `profile_picture` (string, **hex** or **SVG** only)
  - Hex: `#RRGGBB`
  - SVG data URI: `data:image/svg+xml;base64,...`
  - SVG markup: `<svg ...>...</svg>`
- `role` (only if backend allows; typically admin-only)

### Multipart update (SVG file upload)

Use this only if `profile_picture` is a **file**.

- **Method**: `PATCH`
- **URL**: `/api/me`
- **Headers**:
  - `Accept: application/json`
  - Auth headers as per chosen mode
  - **Do not set** `Content-Type` manually when using `FormData`
- **Body**: `FormData` with any of the fields above

**Important:** The backend only accepts **SVG** files for `profile_picture`.

## Example: Axios (cookie-based)

```ts
await axios.patch(
  '/api/me',
  { name, city, bio, profile_picture },
  {
    withCredentials: true,
    headers: { Accept: 'application/json' },
  }
);
```

## Example: Fetch (token-based)

```ts
await fetch('/api/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ name, city, bio, profile_picture }),
});
```

## Recommended frontend improvements

- **Standardize auth flow**: pick cookie-based or token-based and keep it consistent across all requests.
- **Centralize API client**: one HTTP client that always sets `Accept: application/json` and auth headers.
- **Always send JSON for non-file updates**: avoid `FormData` unless uploading a file.
- **Validate before sending**:
  - Hex color must match `#RRGGBB`
  - SVG data URI must be valid base64
  - Strip/guard user input that isn’t valid SVG or hex
- **Handle error responses**:
  - `401`: unauthenticated (re-login)
  - `419`: CSRF mismatch (refresh `/sanctum/csrf-cookie`)
  - `422`: validation errors (show field-level errors)
- **Log and inspect request body on failure**: if the backend sees an empty payload, check `Content-Type` and whether you are actually sending a body.

## Quick checklist

- [ ] Request uses `PATCH /api/me`
- [ ] Body is present (JSON or FormData)
- [ ] `Content-Type: application/json` for JSON bodies
- [ ] `Accept: application/json`
- [ ] Auth headers/cookies are attached
- [ ] `profile_picture` is **hex or SVG only**
