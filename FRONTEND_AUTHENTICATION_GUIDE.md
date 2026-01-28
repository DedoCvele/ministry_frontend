# Frontend Authentication Guide - Ministry of Second Hand API

## Table of Contents
1. [Understanding the Authentication System](#understanding-the-authentication-system)
2. [CSRF Token vs Bearer Token - The Key Difference](#csrf-token-vs-bearer-token---the-key-difference)
3. [Database Structure](#database-structure)
4. [Authentication Flow](#authentication-flow)
5. [Making Authenticated Requests](#making-authenticated-requests)
6. [Complete Examples](#complete-examples)
7. [Common Errors and Solutions](#common-errors-and-solutions)

---

## Understanding the Authentication System

This API uses **Laravel Sanctum** with **Token-Based Authentication** (Bearer Tokens).

### What This Means for Frontend:
- ✅ You get a **token** after login
- ✅ You send this token with **every protected request**
- ✅ **NO CSRF token needed** for API requests
- ✅ Works for mobile apps, SPAs, and any frontend

---

## CSRF Token vs Bearer Token - The Key Difference

### ❌ CSRF Token (NOT what you need)
CSRF tokens are used for **cookie-based session authentication** when your frontend and backend are on the **same domain**. This is typically for traditional web apps.

### ✅ Bearer Token (WHAT YOU NEED)
Bearer tokens are used for **stateless API authentication**. This is what your API uses.

| Feature | CSRF Token | Bearer Token (Your API) |
|---------|------------|------------------------|
| Storage | Cookies | localStorage / memory |
| Sent via | Hidden form field or header | `Authorization` header |
| Use case | Same-domain web apps | APIs, SPAs, Mobile apps |
| Stateful | Yes (requires session) | No (stateless) |

**Bottom line**: Forget about CSRF tokens. You only need the Bearer token returned after login.

---

## Database Structure

### `personal_access_tokens` Table
This table stores all active tokens:

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tokenable_type VARCHAR(255),      -- Always 'App\Models\User'
    tokenable_id BIGINT,              -- The user's ID
    name VARCHAR(255),                -- Token name (e.g., 'main')
    token VARCHAR(64) UNIQUE,         -- Hashed token (stored securely)
    abilities TEXT,                   -- Token permissions (usually ['*'])
    last_used_at TIMESTAMP,           -- When token was last used
    expires_at TIMESTAMP,             -- Token expiration (null = never)
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### How It Works:
1. User logs in → API creates a token record in `personal_access_tokens`
2. API returns the **plain text token** (only shown once!)
3. Frontend stores and sends this token with requests
4. API validates token by hashing the received token and comparing with stored hash
5. If valid, request proceeds; if invalid, returns 401 Unauthorized

---

## Authentication Flow

### Step 1: User Registration

**Endpoint:** `POST /api/register`

```json
// Request Headers
Content-Type: application/json
Accept: application/json

// Request Body
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}

// Response (200 OK)
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": null,
        "city": null,
        "bio": null,
        "profile_picture": null,
        "role": "user",
        "created_at": "2026-01-28T10:00:00.000000Z"
    },
    "token": "1|abc123xyz456..."  // <-- SAVE THIS TOKEN!
}
```

> ✅ **Note**: Registration returns a token immediately, so users can be logged in automatically after registering.

---

### Step 2: User Login

**Endpoint:** `POST /api/login`

```json
// Request Headers
Content-Type: application/json
Accept: application/json

// Request Body
{
    "email": "john@example.com",
    "password": "password123"
}

// Response (200 OK)
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": null,
        "city": null,
        "bio": null,
        "profile_picture": null,
        "role": "user",
        "created_at": "2026-01-28T10:00:00.000000Z"
    },
    "token": "1|abc123xyz456..."  // <-- SAVE THIS TOKEN!
}
```

### Step 3: Store the Token

```javascript
// After successful login
const response = await fetch('/api/login', { ... });
const data = await response.json();

// Store the token (choose one method)
localStorage.setItem('auth_token', data.token);  // Persistent
// OR
sessionStorage.setItem('auth_token', data.token);  // Session only
```

---

## Making Authenticated Requests

### The Magic Header

For ALL protected routes, add this header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Protected Routes (Require Token)

All routes under `/api/me/` require authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get logged-in user info |
| PATCH | `/api/me` | Update profile |
| DELETE | `/api/me` | Delete account |
| GET | `/api/me/items` | Get user's items |
| POST | `/api/me/items` | Create new item |
| PUT | `/api/me/items/{id}` | Update item |
| DELETE | `/api/me/items/{id}` | Delete item |
| POST | `/api/me/items/{item}/images` | Add images to item |
| DELETE | `/api/me/items/{item}/images/{image}` | Delete item image |
| GET | `/api/me/followers` | Get followers |
| GET | `/api/me/following` | Get following |
| POST | `/api/me/users/{user}/follow` | Follow a user |
| DELETE | `/api/me/users/{user}/unfollow` | Unfollow a user |
| GET | `/api/me/favourites` | Get favorites |
| POST | `/api/me/favourites/{item}` | Add to favorites |
| DELETE | `/api/me/favourites/{item}` | Remove from favorites |
| POST | `/api/logout` | Logout (invalidate token) |

### Public Routes (NO Token Needed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items |
| GET | `/api/items/{id}` | Get single item |
| GET | `/api/brands` | List brands |
| GET | `/api/categories` | List categories |
| GET | `/api/users` | List users |
| GET | `/api/users/{id}` | Get user profile |
| GET | `/api/closets` | List closets |
| POST | `/api/register` | Register |
| POST | `/api/login` | Login |

---

## Complete Examples

### JavaScript/Fetch API Setup

```javascript
// api.js - Create a reusable API client

const API_BASE_URL = 'http://localhost:8000/api';

// Get token from storage
function getToken() {
    return localStorage.getItem('auth_token');
}

// Save token to storage
function saveToken(token) {
    localStorage.setItem('auth_token', token);
}

// Remove token (logout)
function removeToken() {
    localStorage.removeItem('auth_token');
}

// Make authenticated request
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };
    
    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    
    // Handle 401 Unauthorized (token expired/invalid)
    if (response.status === 401) {
        removeToken();
        // Redirect to login or handle as needed
        window.location.href = '/login';
        throw new Error('Unauthorized - Please login again');
    }
    
    return response;
}
```

---

### Example 1: Register and Get Token

```javascript
async function register(name, email, password, passwordConfirmation) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ 
            name, 
            email, 
            password, 
            password_confirmation: passwordConfirmation 
        }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // IMPORTANT: Save the token!
    saveToken(data.token);
    
    return data.user;
}

// Usage
try {
    const user = await register('John Doe', 'john@example.com', 'password123', 'password123');
    console.log('Registered and logged in as:', user.name);
} catch (error) {
    console.error('Registration failed:', error.message);
}
```

---

### Example 2: Login and Get Token

```javascript
async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // IMPORTANT: Save the token!
    saveToken(data.token);
    
    return data.user;
}

// Usage
try {
    const user = await login('john@example.com', 'password123');
    console.log('Logged in as:', user.name);
} catch (error) {
    console.error('Login failed:', error.message);
}
```

---

### Example 3: Create an Item (POST with Token)

```javascript
async function createItem(itemData) {
    // For file uploads, use FormData instead of JSON
    const formData = new FormData();
    
    formData.append('name', itemData.name);
    formData.append('description', itemData.description || '');
    formData.append('price', itemData.price);
    formData.append('condition', itemData.condition); // 'new', 'like_new', 'good', 'fair'
    formData.append('approval_status', 'pending'); // 'pending', 'approved', 'rejected'
    formData.append('category_id', itemData.categoryId);
    formData.append('brand_id', itemData.brandId);
    
    // Add sizes (array)
    itemData.sizes.forEach((size, index) => {
        formData.append(`sizes[${index}][id]`, size.id);
        formData.append(`sizes[${index}][quantity]`, size.quantity);
    });
    
    // Add images (files)
    itemData.images.forEach((file) => {
        formData.append('images[]', file);
    });
    
    // Add tags (optional)
    if (itemData.tags) {
        itemData.tags.forEach((tag) => {
            formData.append('tags[]', tag);
        });
    }
    
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/me/items`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            // DON'T set Content-Type for FormData - browser sets it automatically
        },
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create item');
    }
    
    return await response.json();
}

// Usage
const newItem = await createItem({
    name: 'Vintage Jacket',
    description: 'Beautiful vintage denim jacket from the 90s',
    price: 45.99,
    condition: 'good',
    categoryId: 1,
    brandId: 2,
    sizes: [
        { id: 1, quantity: 1 },
        { id: 2, quantity: 2 }
    ],
    images: [file1, file2], // File objects from input[type="file"]
    tags: ['vintage', 'denim', '90s']
});
```

---

### Example 4: Update an Item (PUT with Token)

```javascript
async function updateItem(itemId, updateData) {
    const formData = new FormData();
    
    // Only append fields that are being updated
    if (updateData.name) formData.append('name', updateData.name);
    if (updateData.description) formData.append('description', updateData.description);
    if (updateData.price) formData.append('price', updateData.price);
    if (updateData.condition) formData.append('condition', updateData.condition);
    
    // Note: For PUT with FormData, you might need to use POST with _method
    formData.append('_method', 'PUT');
    
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/me/items/${itemId}`, {
        method: 'POST', // Use POST with _method for FormData
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update item');
    }
    
    return await response.json();
}

// Usage
const updated = await updateItem(123, {
    name: 'Updated Jacket Name',
    price: 39.99
});
```

---

### Example 5: Delete an Item (DELETE with Token)

```javascript
async function deleteItem(itemId) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/me/items/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete item');
    }
    
    // 204 No Content = success
    return true;
}

// Usage
await deleteItem(123);
console.log('Item deleted!');
```

---

### Example 6: Update User Profile

```javascript
async function updateProfile(profileData) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: profileData.name,
            phone: profileData.phone,
            city: profileData.city,
            bio: profileData.bio,
        }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
    }
    
    return await response.json();
}
```

---

### Example 7: Logout

```javascript
async function logout() {
    const token = getToken();
    
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    } finally {
        // Always remove local token, even if API call fails
        removeToken();
    }
}
```

---

## React/Next.js Example with Context

```jsx
// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    async function fetchUser(authToken) {
        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('auth_token');
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    }

    async function register(name, email, password, passwordConfirmation) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                password_confirmation: passwordConfirmation 
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        return data.user;
    }

    async function login(email, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        return data.user;
    }

    async function logout() {
        if (token) {
            try {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    }

    // Helper function for authenticated requests
    async function authFetch(endpoint, options = {}) {
        const headers = {
            'Accept': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Only set Content-Type for non-FormData requests
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expired or invalid
            await logout();
            throw new Error('Session expired. Please login again.');
        }

        return response;
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!token,
            register,
            login,
            logout,
            authFetch,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
```

### Using the Auth Context

```jsx
// CreateItemPage.jsx
import { useAuth } from './AuthContext';

function CreateItemPage() {
    const { authFetch, isAuthenticated } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!isAuthenticated) {
            alert('Please login first');
            return;
        }

        const formData = new FormData(e.target);

        try {
            const response = await authFetch('/me/items', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const item = await response.json();
                console.log('Item created:', item);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* form fields */}
        </form>
    );
}
```

---

## Axios Setup (Alternative)

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Add token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Usage
import api from './api';

// Login
const { data } = await api.post('/login', { email, password });
localStorage.setItem('auth_token', data.token);

// Create item
const formData = new FormData();
// ... append data
const { data: item } = await api.post('/me/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Delete item
await api.delete(`/me/items/${itemId}`);
```

---

## Common Errors and Solutions

### Error: "Unauthenticated" (401)

**Cause**: Missing or invalid token

**Solution**:
```javascript
// Check if token exists
const token = localStorage.getItem('auth_token');
if (!token) {
    // Redirect to login
    window.location.href = '/login';
}

// Make sure header is correct
headers: {
    'Authorization': `Bearer ${token}`,  // Note the space after "Bearer"
}
```

### Error: "CSRF token mismatch" (419)

**Cause**: You're making a request to a web route instead of API route, OR you're using cookie-based auth instead of token-based.

**Solution**:
1. Make sure your URL starts with `/api/` not just `/`
2. Make sure you're sending the `Authorization: Bearer {token}` header
3. DO NOT send any CSRF tokens for API requests

```javascript
// ❌ WRONG - This is a web route
fetch('http://localhost:8000/login', ...)

// ✅ CORRECT - This is an API route
fetch('http://localhost:8000/api/login', ...)
```

### Error: "The given data was invalid" (422)

**Cause**: Validation error

**Solution**: Check the response body for details:
```javascript
const response = await fetch(...);
if (response.status === 422) {
    const data = await response.json();
    console.log('Validation errors:', data.errors);
    // { "email": ["The email field is required."], ... }
}
```

### Error: "Method not allowed" (405)

**Cause**: Wrong HTTP method

**Solution**: Check the correct method in the routes table above.

### Error: CORS errors

**Cause**: Backend doesn't allow your frontend origin

**Solution**: Add your frontend URL to the backend's CORS configuration.

---

## Quick Reference

```javascript
// 1. LOGIN - Get your token
POST /api/login
Body: { "email": "...", "password": "..." }
Headers: { "Content-Type": "application/json", "Accept": "application/json" }

// 2. SAVE TOKEN
localStorage.setItem('auth_token', response.token);

// 3. USE TOKEN in all protected requests
Headers: { 
    "Authorization": "Bearer YOUR_TOKEN_HERE",
    "Accept": "application/json"
}

// 4. LOGOUT - Clear token
POST /api/logout
Headers: { "Authorization": "Bearer YOUR_TOKEN_HERE" }
localStorage.removeItem('auth_token');
```

---

## Summary

1. **Login** → Get token → **Save it** to localStorage
2. **Every protected request** → Add `Authorization: Bearer {token}` header
3. **401 error** → Token expired → **Redirect to login**
4. **Logout** → Call API → **Remove token** from localStorage
5. **NO CSRF tokens needed** for API routes
