# Sanctum Authentication Documentation

## Table of Contents
1. [Overview](#overview)
2. [How Sanctum Works in This Project](#how-sanctum-works-in-this-project)
3. [Backend Implementation](#backend-implementation)
4. [API Routes](#api-routes)
5. [Frontend Implementation Guide](#frontend-implementation-guide)
6. [Error Handling](#error-handling)
7. [Security Best Practices](#security-best-practices)

---

## Overview

This project uses **Laravel Sanctum** for API authentication. Sanctum provides a simple way to authenticate single-page applications (SPAs) and mobile applications using token-based authentication.

### Key Features:
- **Token-based authentication** for API requests
- **Bearer token** authentication
- **Stateless authentication** (no sessions required for API)
- **Secure token management** with automatic expiration support

---

## How Sanctum Works in This Project

### Authentication Flow

1. **Registration/Login**: User submits credentials → Server validates → Server creates a token → Token returned to client
2. **Authenticated Requests**: Client includes token in Authorization header → Server validates token → Request processed
3. **Logout**: Client sends logout request → Server deletes token → User logged out

### Token Structure

When a user registers or logs in, Sanctum generates a **personal access token**:
- **Token**: A long, random string (e.g., `1|abcdef123456...`)
- **Token Type**: `Bearer`
- **Storage**: Stored in `personal_access_tokens` table
- **Expiration**: Configurable (default: never expires)

### Database Schema

Sanctum uses the `personal_access_tokens` table (created via migration) to store:
- `tokenable_id`: User ID
- `tokenable_type`: User model class
- `name`: Token name (e.g., "auth_token")
- `token`: Hashed token
- `abilities`: Token permissions (JSON)
- `last_used_at`: Last usage timestamp
- `expires_at`: Expiration date (nullable)

---

## Backend Implementation

### 1. User Model Configuration

The `User` model uses the `HasApiTokens` trait:

```php
// app/Models/User.php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;
    // ...
}
```

This trait provides methods like:
- `createToken()`: Creates a new personal access token
- `tokens()`: Relationship to user's tokens
- `currentAccessToken()`: Gets the current token being used

### 2. Authentication Controller

Located at `app/Http/Controllers/Api/AuthController.php`:

#### Register Method
```php
public function register(Request $request)
{
    // Validates: name, email (unique), password (confirmed)
    // Creates user with hashed password
    // Generates token: $user->createToken('auth_token')
    // Returns: user data + token
}
```

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response (201):**
```json
{
    "status": "success",
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": null,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    },
    "token": "1|abcdef1234567890...",
    "token_type": "Bearer"
}
```

#### Login Method
```php
public function login(Request $request)
{
    // Validates: email, password
    // Attempts authentication: Auth::attempt()
    // Generates token if successful
    // Returns: user data + token
}
```

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "status": "success",
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": null
    },
    "token": "2|xyz789abcdef...",
    "token_type": "Bearer"
}
```

#### Logout Method
```php
public function logout(Request $request)
{
    // Deletes current token: $request->user()->currentAccessToken()->delete()
    // Returns success message
}
```

**Response (200):**
```json
{
    "status": "success",
    "message": "Logged out successfully"
}
```

#### Me Method (Get Current User)
```php
public function me(Request $request)
{
    // Returns authenticated user data
}
```

**Response (200):**
```json
{
    "status": "success",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": null
    }
}
```

### 3. Route Protection

Routes are protected using the `auth:sanctum` middleware:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Protected routes here
});
```

This middleware:
1. Checks for `Authorization: Bearer {token}` header
2. Validates the token against the database
3. Loads the associated user
4. Makes user available via `$request->user()`

---

## API Routes

### Public Routes (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login user |
| GET | `/api/items` | Get all items |
| GET | `/api/items/{id}` | Get single item |
| GET | `/api/blogs` | Get all blogs |
| GET | `/api/blogs/{id}` | Get single blog |
| GET | `/api/users/{id}` | Get user profile |
| GET | `/api/closets` | Get all closets |

### Protected Routes (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logout` | Logout user |
| GET | `/api/me` | Get current user |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |
| DELETE | `/api/profile` | Delete user account |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/{id}` | Update item |
| DELETE | `/api/items/{id}` | Delete item |
| POST | `/api/blogs` | Create new blog |
| PUT | `/api/blogs/{id}` | Update blog |
| DELETE | `/api/blogs/{id}` | Delete blog |
| GET | `/api/admin/pending-items` | Get pending items (admin) |
| PUT | `/api/admin/approve/{id}` | Approve item (admin) |
| PUT | `/api/admin/decline/{id}` | Decline item (admin) |

---

## Frontend Implementation Guide

### Step 1: Setup API Base URL

Create a configuration file or constant:

```javascript
// config/api.js or constants/api.js
export const API_BASE_URL = 'http://localhost:8000/api';
// For production: 'https://yourdomain.com/api'
```

### Step 2: Create API Service/Utility

Create a utility file for API calls:

```javascript
// services/api.js or utils/api.js

const API_BASE_URL = 'http://localhost:8000/api';

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('auth_token');
};

// Set token in localStorage
const setToken = (token) => {
    localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
const removeToken = () => {
    localStorage.removeItem('auth_token');
};

// Create headers with authentication
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Authentication methods
export const authAPI = {
    register: async (userData) => {
        const response = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        
        if (response.token) {
            setToken(response.token);
        }
        
        return response;
    },

    login: async (credentials) => {
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        
        if (response.token) {
            setToken(response.token);
        }
        
        return response;
    },

    logout: async () => {
        try {
            await apiRequest('/logout', {
                method: 'POST',
            });
        } finally {
            removeToken();
        }
    },

    getCurrentUser: async () => {
        return await apiRequest('/me');
    },
};

// Export utility functions
export { getToken, setToken, removeToken, apiRequest };
```

### Step 3: React Implementation Example

#### Auth Context/Provider

```javascript
// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = getToken();
        if (token) {
            try {
                const response = await authAPI.getCurrentUser();
                setUser(response.user);
            } catch (error) {
                console.error('Auth check failed:', error);
                // Token might be invalid, clear it
                localStorage.removeItem('auth_token');
            }
        }
        setLoading(false);
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

#### Register Component

```javascript
// components/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await register(formData);
            navigate('/dashboard'); // Redirect after successful registration
        } catch (error) {
            if (error.message) {
                setErrors({ general: error.message });
            }
            // Handle validation errors if returned from API
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div>
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div>
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div>
                <label>Confirm Password</label>
                <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                />
            </div>

            {errors.general && <div className="error">{errors.general}</div>}

            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default Register;
```

#### Login Component

```javascript
// components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await login(formData);
            navigate('/dashboard');
        } catch (error) {
            setErrors({ general: error.message || 'Invalid credentials' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>

            {errors.general && <div className="error">{errors.general}</div>}

            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default Login;
```

#### Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

#### Usage in App.jsx

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
```

### Step 4: Vue.js Implementation Example

```javascript
// composables/useAuth.js
import { ref, computed } from 'vue';
import { authAPI, getToken } from '../services/api';

const user = ref(null);
const loading = ref(false);

export const useAuth = () => {
    const isAuthenticated = computed(() => !!user.value);

    const checkAuth = async () => {
        const token = getToken();
        if (token) {
            try {
                const response = await authAPI.getCurrentUser();
                user.value = response.user;
            } catch (error) {
                localStorage.removeItem('auth_token');
            }
        }
    };

    const register = async (userData) => {
        loading.value = true;
        try {
            const response = await authAPI.register(userData);
            user.value = response.user;
            return response;
        } finally {
            loading.value = false;
        }
    };

    const login = async (credentials) => {
        loading.value = true;
        try {
            const response = await authAPI.login(credentials);
            user.value = response.user;
            return response;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } finally {
            user.value = null;
        }
    };

    return {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        checkAuth,
    };
};
```

### Step 5: Axios Implementation (Alternative)

If you prefer Axios over fetch:

```javascript
// services/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Usage:
// import api from './services/axios';
// const response = await api.post('/login', { email, password });
```

---

## Error Handling

### Common Error Responses

#### Validation Errors (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password confirmation does not match."]
    }
}
```

#### Authentication Errors (401)
```json
{
    "message": "Unauthenticated."
}
```

#### Not Found (404)
```json
{
    "message": "Item not found"
}
```

### Frontend Error Handling

```javascript
try {
    const response = await authAPI.login(credentials);
    // Success handling
} catch (error) {
    if (error.response?.status === 422) {
        // Validation errors
        const errors = error.response.data.errors;
        // Display field-specific errors
    } else if (error.response?.status === 401) {
        // Authentication failed
        // Show login error message
    } else {
        // Generic error
        console.error('An error occurred:', error.message);
    }
}
```

---

## Security Best Practices

### 1. Token Storage
- ✅ **DO**: Store tokens in `localStorage` or `sessionStorage` for web apps
- ✅ **DO**: Use secure storage (Keychain/Keystore) for mobile apps
- ❌ **DON'T**: Store tokens in cookies (unless using SPA with same domain)
- ❌ **DON'T**: Log tokens to console or expose in URLs

### 2. Token Transmission
- ✅ **DO**: Always use HTTPS in production
- ✅ **DO**: Send token in `Authorization: Bearer {token}` header
- ❌ **DON'T**: Send tokens in query parameters or request body

### 3. Token Management
- ✅ **DO**: Clear token on logout
- ✅ **DO**: Check token validity on app startup
- ✅ **DO**: Implement token refresh if using expiration
- ✅ **DO**: Handle 401 errors by redirecting to login

### 4. CORS Configuration
Ensure your `config/cors.php` includes your frontend domain:
```php
'allowed_origins' => [
    'http://localhost:3000',
    'https://yourdomain.com',
],
'supports_credentials' => true,
```

### 5. Environment Variables
Use environment variables for API URLs:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

---

## Testing the API

### Using cURL

#### Register
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get Current User (with token)
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

#### Logout
```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Using Postman

1. **Register/Login**: Create POST request, add JSON body, get token from response
2. **Authenticated Requests**: 
   - Go to "Authorization" tab
   - Select "Bearer Token"
   - Paste token from login/register response
3. **Save Token**: Use Postman variables to store token for reuse

---

## Troubleshooting

### Issue: "Unauthenticated" error
- **Solution**: Check if token is being sent in Authorization header
- **Solution**: Verify token hasn't expired (if expiration is set)
- **Solution**: Ensure token format is `Bearer {token}`

### Issue: CORS errors
- **Solution**: Check `config/cors.php` includes your frontend origin
- **Solution**: Verify `supports_credentials` is true
- **Solution**: Check browser console for specific CORS error

### Issue: Token not persisting
- **Solution**: Check localStorage is available (not in incognito/private mode)
- **Solution**: Verify token is being saved after login/register
- **Solution**: Check for errors in browser console

### Issue: 422 Validation errors
- **Solution**: Check all required fields are included
- **Solution**: Verify email format is correct
- **Solution**: Ensure password confirmation matches password

---

## Additional Resources

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Laravel API Authentication](https://laravel.com/docs/authentication#api-authentication)
- [Bearer Token Authentication](https://oauth.net/2/bearer-tokens/)

---

## Summary

This project implements token-based authentication using Laravel Sanctum:

1. **Registration**: Creates user and returns token
2. **Login**: Validates credentials and returns token
3. **Authenticated Requests**: Include token in `Authorization: Bearer {token}` header
4. **Logout**: Deletes current token
5. **Token Storage**: Store in localStorage/sessionStorage on frontend
6. **Protected Routes**: Use `auth:sanctum` middleware

The frontend should:
- Store token after login/register
- Include token in all authenticated requests
- Clear token on logout
- Handle 401 errors by redirecting to login
- Check authentication status on app load

