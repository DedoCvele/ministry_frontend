# Profile Enhancements Guide

This document explains the new profile features that have been added to the database and provides complete API route documentation for frontend implementation.

## Quick Reference - API Routes

### Profile Routes (Protected - Requires Authentication)
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile (supports profile_picture and bio)
- `PUT /api/profile/bio` - Update bio only
- `PUT /api/profile/picture` - Update profile picture only (supports file, color, or URL)
- `DELETE /api/profile` - Delete account
- `GET /api/profile/favorites` - Get current user's favorite items

### Favorites Routes
- `POST /api/items/{itemId}/favorite` - Toggle favorite (add/remove) - **Protected**
- `GET /api/items/{itemId}/favorite-status` - Check if item is favorited - **Protected**
- `GET /api/profile/favorites` - Get current user's favorites - **Protected**
- `GET /api/users/{userId}/favorites` - Get user's favorites (public profile) - **Public**

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer {your_sanctum_token}
```

---

## New Features

### 1. Profile Picture
Users can now have a profile picture that can be:
- **Image file**: Uploaded image stored in `storage/app/public`
- **Hex color code**: A 6-digit hex color (e.g., `#FF5733`)
- **External URL**: A full URL to an external image

**Database Field**: `users.profile_picture` (nullable string)

**Usage in Code**:
```php
// Set profile picture as color
$user->profile_picture = '#FF5733';
$user->save();

// Set profile picture as image path
$user->profile_picture = 'profile-pictures/user-123.jpg';
$user->save();

// Get profile picture URL (automatically handles all types)
$url = $user->profile_picture_url; // Returns URL, color code, or null

// Check if it's a color
if ($user->isProfilePictureColor()) {
    // Display as background color
}
```

### 2. Bio Description
Users can add a bio/description to their profile.

**Database Field**: `users.bio` (nullable text)

**Usage in Code**:
```php
$user->bio = 'This is my bio description';
$user->save();
```

### 3. Favorites/Likes System
Users can favorite items, and items can be favorited by multiple users.

**Database Table**: `favorites` (pivot table)
- `user_id` - Foreign key to users
- `item_id` - Foreign key to items
- Unique constraint on `(user_id, item_id)` to prevent duplicates

**Usage in Code**:

```php
// Get user's favorite items
$favorites = $user->favorites; // Collection of Item models

// Get items favorited by a specific user
$userFavorites = User::find(1)->favorites;

// Get users who favorited an item
$favoritedBy = $item->favoritedBy; // Collection of User models

// Get favorites count for an item
$count = $item->favorites_count; // Accessor attribute

// Check if user has favorited an item
if ($user->hasFavorited($item)) {
    // User has already favorited this item
}

// Add item to favorites
$user->favorites()->attach($item->id);
// Or
$user->favorites()->syncWithoutDetaching([$item->id]);

// Remove item from favorites
$user->favorites()->detach($item->id);

// Toggle favorite (add if not exists, remove if exists)
if ($user->hasFavorited($item)) {
    $user->favorites()->detach($item->id);
} else {
    $user->favorites()->attach($item->id);
}
```

## Database Structure

### Users Table (New Fields)
```sql
ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN bio TEXT NULL;
```

### Favorites Table
```sql
CREATE TABLE favorites (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, item_id)
);
```

## API Routes Documentation

### Base URL
All API routes are prefixed with `/api`

### Authentication
Most routes require authentication using Laravel Sanctum. Include the token in the Authorization header:
```
Authorization: Bearer {your_token}
```

---

## Profile Routes

### 1. Get Current User Profile
**GET** `/api/profile`

**Authentication**: Required (Sanctum)

**Response**:
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123456789",
    "city": "New York",
    "role": "seller",
    "profile_picture": "#FF5733",
    "profile_picture_url": "#FF5733",
    "bio": "This is my bio",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

### 2. Update Profile
**PUT** `/api/profile`

**Authentication**: Required (Sanctum)

**Request Body** (all fields optional):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Updated bio description",
  "profile_picture": "#FF5733"
}
```

**OR** for file upload (multipart/form-data):
- `profile_picture`: File (image) OR string (hex color like `#FF5733`) OR URL

**Response**:
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Updated bio description",
    "profile_picture": "profile-pictures/user-1.jpg",
    "profile_picture_url": "http://yourdomain.com/storage/profile-pictures/user-1.jpg"
  }
}
```

**Frontend Example**:
```javascript
// Update profile with color
const updateProfile = async (data) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      bio: data.bio,
      profile_picture: '#FF5733' // or image URL
    })
  });
  return await response.json();
};

// Update profile with image file
const updateProfileWithImage = async (formData) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData
    },
    body: formData // FormData with 'profile_picture' file
  });
  return await response.json();
};
```

### 3. Update Bio Only
**PUT** `/api/profile/bio`

**Authentication**: Required (Sanctum)

**Request Body**:
```json
{
  "bio": "This is my updated bio description"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Bio updated successfully",
  "user": {
    "id": 1,
    "bio": "This is my updated bio description",
    ...
  }
}
```

**Frontend Example**:
```javascript
const updateBio = async (bio) => {
  const response = await fetch('/api/profile/bio', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bio })
  });
  return await response.json();
};
```

### 4. Update Profile Picture Only
**PUT** `/api/profile/picture`

**Authentication**: Required (Sanctum)

**Request Options**:

**Option 1: Upload Image File** (multipart/form-data):
- `profile_picture`: File (image)

**Option 2: Set Color Code** (application/json):
```json
{
  "profile_picture": "#FF5733"
}
```

**Option 3: Set URL** (application/json):
```json
{
  "profile_picture": "https://example.com/image.jpg"
}
```

**Option 4: Remove Picture** (application/json):
```json
{
  "profile_picture": null
}
```
or
```json
{
  "profile_picture": ""
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Profile picture updated successfully",
  "user": {
    "id": 1,
    "profile_picture": "profile-pictures/user-1.jpg",
    "profile_picture_url": "http://yourdomain.com/storage/profile-pictures/user-1.jpg",
    ...
  },
  "profile_picture_url": "http://yourdomain.com/storage/profile-pictures/user-1.jpg"
}
```

**Frontend Examples**:
```javascript
// Update with image file
const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('profile_picture', imageFile);
  
  const response = await fetch('/api/profile/picture', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData
    },
    body: formData
  });
  return await response.json();
};

// Update with color
const updateProfilePictureColor = async (color) => {
  const response = await fetch('/api/profile/picture', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profile_picture: color })
  });
  return await response.json();
};

// Remove profile picture
const removeProfilePicture = async () => {
  const response = await fetch('/api/profile/picture', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profile_picture: null })
  });
  return await response.json();
};
```

---

## Favorites Routes

### 1. Toggle Favorite Item
**POST** `/api/items/{itemId}/favorite`

**Authentication**: Required (Sanctum)

**Response**:
```json
{
  "status": "success",
  "message": "Item added to favorites",
  "is_favorited": true,
  "favorites_count": 5
}
```

**Frontend Example**:
```javascript
const toggleFavorite = async (itemId) => {
  const response = await fetch(`/api/items/${itemId}/favorite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  // Update UI: data.is_favorited, data.favorites_count
  return data;
};
```

### 2. Get Current User's Favorites
**GET** `/api/profile/favorites`

**Authentication**: Required (Sanctum)

**Response**:
```json
{
  "status": "success",
  "count": 10,
  "favorites": [
    {
      "id": 1,
      "name": "Item Name",
      "price": "99.99",
      "image_url": "...",
      "category": {...},
      "brand": {...},
      "pivot": {
        "user_id": 1,
        "item_id": 1,
        "created_at": "2025-01-01T00:00:00.000000Z"
      }
    }
  ]
}
```

**Frontend Example**:
```javascript
const getMyFavorites = async () => {
  const response = await fetch('/api/profile/favorites', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### 3. Get User's Favorites (Public)
**GET** `/api/users/{userId}/favorites`

**Authentication**: Not required (public route)

**Response**: Same as above

**Frontend Example**:
```javascript
const getUserFavorites = async (userId) => {
  const response = await fetch(`/api/users/${userId}/favorites`);
  return await response.json();
};
```

### 4. Check if Item is Favorited
**GET** `/api/items/{itemId}/favorite-status`

**Authentication**: Required (Sanctum)

**Response**:
```json
{
  "status": "success",
  "is_favorited": true,
  "favorites_count": 5
}
```

---

## Complete Route List

### Profile Routes (Protected)
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile (supports profile_picture and bio)
- `PUT /api/profile/bio` - Update bio only
- `PUT /api/profile/picture` - Update profile picture only
- `DELETE /api/profile` - Delete account

### Favorites Routes
- `POST /api/items/{itemId}/favorite` - Toggle favorite (protected)
- `GET /api/profile/favorites` - Get current user's favorites (protected)
- `GET /api/users/{userId}/favorites` - Get user's favorites (public)
- `GET /api/items/{itemId}/favorite-status` - Check favorite status (protected)

---

## API Implementation Examples (Backend)

### Update Profile Controller Method
```php
// In ProfileController
public function update(Request $request)
{
    $user = $request->user();
    
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|email|unique:users,email,' . $user->id,
        'bio' => 'nullable|string|max:1000',
        'profile_picture' => 'nullable|string', // Can be color, URL, or path
    ]);
    
    // Handle file upload if profile_picture is a file
    if ($request->hasFile('profile_picture')) {
        $path = $request->file('profile_picture')->store('profile-pictures', 'public');
        $validated['profile_picture'] = $path;
    }
    
    $user->update($validated);
    
    return response()->json([
        'status' => 'success',
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
}
```

### Favorite Controller Methods
```php
// In ItemController or FavoritesController
public function toggleFavorite(Request $request, $itemId)
{
    $user = $request->user();
    $item = Item::findOrFail($itemId);
    
    if ($user->hasFavorited($item)) {
        $user->favorites()->detach($item->id);
        $message = 'Item removed from favorites';
    } else {
        $user->favorites()->attach($item->id);
        $message = 'Item added to favorites';
    }
    
    // Refresh to get updated count
    $item->refresh();
    
    return response()->json([
        'status' => 'success',
        'message' => $message,
        'is_favorited' => $user->hasFavorited($item),
        'favorites_count' => $item->favorites_count
    ]);
}

// Get current user's favorites
public function getMyFavorites(Request $request)
{
    $user = $request->user();
    $favorites = $user->favorites()->with(['category', 'brand', 'user'])->get();
    
    return response()->json([
        'status' => 'success',
        'count' => $favorites->count(),
        'favorites' => $favorites
    ]);
}

// Get user's favorites (public)
public function getUserFavorites($userId)
{
    $user = User::findOrFail($userId);
    $favorites = $user->favorites()
        ->whereIn('approved', [1, 2]) // Only approved items
        ->with(['category', 'brand', 'user'])
        ->get();
    
    return response()->json([
        'status' => 'success',
        'count' => $favorites->count(),
        'favorites' => $favorites
    ]);
}

// Check favorite status
public function favoriteStatus(Request $request, $itemId)
{
    $user = $request->user();
    $item = Item::findOrFail($itemId);
    
    return response()->json([
        'status' => 'success',
        'is_favorited' => $user->hasFavorited($item),
        'favorites_count' => $item->favorites_count
    ]);
}
```

## Frontend Considerations

### Profile Picture Display
```javascript
// Check if profile picture is a color
function displayProfilePicture(user) {
    if (user.profile_picture_url && user.profile_picture_url.startsWith('#')) {
        // Display as background color
        return {
            backgroundColor: user.profile_picture_url,
            width: '100px',
            height: '100px',
            borderRadius: '50%'
        };
    } else if (user.profile_picture_url) {
        // Display as image
        return <img src={user.profile_picture_url} alt="Profile" />;
    } else {
        // Default avatar
        return <DefaultAvatar />;
    }
}
```

### Favorite Button
```javascript
async function toggleFavorite(itemId) {
    const response = await fetch(`/api/items/${itemId}/favorite`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    // Update UI with data.is_favorited and data.favorites_count
}
```

## Migration Commands

To apply these changes to your database:

```bash
php artisan migrate
```

To rollback if needed:

```bash
php artisan migrate:rollback --step=2
```

## Notes

- The favorites system uses a many-to-many relationship, which is the standard approach for this type of feature
- The unique constraint on `(user_id, item_id)` prevents duplicate favorites
- When a user or item is deleted, their favorites are automatically removed (CASCADE)
- The `profile_picture_url` accessor automatically handles all three types (image, color, URL)
- The `favorites_count` accessor on Item model provides an easy way to get the number of favorites

