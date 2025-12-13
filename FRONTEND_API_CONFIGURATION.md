# Frontend API Configuration Fix

## Problem
Your frontend is making requests to `http://localhost:3000/api/profile` but your Laravel API is running on a different port (typically `http://localhost:8000`).

## Solutions

### Solution 1: Configure Axios Base URL (Recommended)

Create or update your axios configuration file:

**Create `src/config/axios.js` (or `src/api/axios.js`):**
```javascript
import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Sanctum
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token'); // or wherever you store the token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**In your ProfilePage.tsx, use the configured axios:**
```typescript
import apiClient from '../config/axios'; // or wherever you put it

// Instead of:
// axios.put('http://localhost:3000/api/profile', data)

// Use:
apiClient.put('/profile', data)
```

### Solution 2: Use Environment Variables

**Create `.env` file in your React project root:**
```env
VITE_API_URL=http://localhost:8000
```

**In your ProfilePage.tsx:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Then use:
axios.put(`${API_URL}/api/profile`, data, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
```

### Solution 3: Vite Proxy (If using Vite)

**Update `vite.config.js` in your React project:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

Then in your code, you can use relative URLs:
```typescript
axios.put('/api/profile', data) // Will proxy to http://localhost:8000/api/profile
```

### Solution 4: Quick Fix - Direct URL Update

**In ProfilePage.tsx, change:**
```typescript
// ❌ Wrong
axios.put('http://localhost:3000/api/profile', data)

// ✅ Correct (assuming Laravel runs on port 8000)
axios.put('http://localhost:8000/api/profile', data, {
  headers: {
    'Authorization': `Bearer ${yourToken}`,
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
```

## Important Notes

1. **Check Laravel Port**: Make sure you know what port your Laravel server is running on:
   ```bash
   php artisan serve
   # Usually runs on http://localhost:8000
   ```

2. **CORS Configuration**: Your Laravel CORS config already allows `http://localhost:3000`, so that's good.

3. **Authentication**: Make sure you're including the Bearer token:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`,
   }
   ```

4. **Credentials**: Include `withCredentials: true` for Sanctum to work properly.

## Recommended Approach

Use **Solution 1** (Axios configuration) as it:
- Centralizes API configuration
- Handles authentication automatically
- Makes it easy to change API URL
- Provides consistent error handling

## Example ProfilePage.tsx Update

```typescript
import apiClient from '../config/axios';
import { useState } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const response = await apiClient.put('/profile', data);
      setProfile(response.data.user);
      console.log('Profile updated:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component
};
```

