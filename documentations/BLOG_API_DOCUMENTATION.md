# Blog API Documentation

Complete guide for the Blog API endpoints, including request/response formats, authentication, and frontend integration examples.

---

## Table of Contents

1. [Overview](#overview)
2. [BlogStatus Enum](#blogstatus-enum)
3. [Data Model](#data-model)
4. [API Endpoints](#api-endpoints)
   - [Get All Blogs](#get-all-blogs)
   - [Get Single Blog](#get-single-blog)
   - [Create Blog](#create-blog)
   - [Update Blog](#update-blog)
   - [Delete Blog](#delete-blog)
5. [Frontend Integration](#frontend-integration)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

The Blog API allows you to manage blog posts in the application. Blogs can be created, read, updated, and deleted. Only published blogs are visible to public users.

**Base URL**: `/api/blogs`

**Authentication**: 
- **Public endpoints** (GET): No authentication required
- **Protected endpoints** (POST, PUT, DELETE): Bearer token authentication required

---

## BlogStatus Enum

The `BlogStatus` enum is an integer-backed enum used to track blog publication status.

### Enum Values

```php
enum BlogStatus: int
{
    case Draft = 1;      // Blog is in draft state
    case Published = 2;  // Blog is published and visible
}
```

### Important Notes

⚠️ **CRITICAL**: Always use the enum case (`BlogStatus::Published`) or its value (`BlogStatus::Published->value`) when working with blog status. **Never use strings** like `'published'` or `'draft'` as this will cause type errors.

**Backend Usage**:
```php
// ✅ Correct
'status' => BlogStatus::Published
'status' => BlogStatus::Published->value  // Returns 2

// ❌ Wrong - Will cause error
'status' => 'published'
'status' => BlogStatus::from('published')  // Error: expects int, string given
```

---

## Data Model

### Blog Schema

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | integer | Unique blog identifier | Auto-generated |
| `title` | string | Blog post title | Yes |
| `content` | text | Blog post content (HTML tags are stripped) | Yes |
| `image` | string | Image path or URL | Optional |
| `image_url` | string | Full URL to the blog image (computed) | Auto-generated |
| `status` | BlogStatus enum | Publication status (1=Draft, 2=Published) | Auto-set to Published |
| `user_id` | integer | ID of the user who created the blog | Auto-set |
| `created_at` | datetime | Creation timestamp | Auto-generated |
| `updated_at` | datetime | Last update timestamp | Auto-generated |

### Response Format

All blog responses include an `image_url` attribute that provides the full URL to the blog image, handling both stored files and external URLs.

---

## API Endpoints

### Get All Blogs

Retrieve all published blogs.

**Endpoint**: `GET /api/blogs`

**Authentication**: Not required

**Response** (200 OK):
```json
{
    "status": "success",
    "count": 3,
    "data": [
        {
            "id": 1,
            "title": "Welcome to Our Blog",
            "content": "This is the blog content...",
            "image": "blogs/abc123.jpg",
            "image_url": "http://localhost:8000/storage/blogs/abc123.jpg",
            "status": 2,
            "user_id": 1,
            "created_at": "2026-01-21T14:30:00.000000Z",
            "updated_at": "2026-01-21T14:30:00.000000Z"
        },
        {
            "id": 2,
            "title": "Second Blog Post",
            "content": "More content here...",
            "image": "https://example.com/image.jpg",
            "image_url": "https://example.com/image.jpg",
            "status": 2,
            "user_id": 1,
            "created_at": "2026-01-22T10:15:00.000000Z",
            "updated_at": "2026-01-22T10:15:00.000000Z"
        }
    ]
}
```

**Notes**:
- Only returns blogs with `status = BlogStatus::Published` (value: 2)
- Results are sorted by creation date (newest first)
- `image_url` is automatically included in the response

---

### Get Single Blog

Retrieve a specific published blog by ID.

**Endpoint**: `GET /api/blogs/{id}`

**Authentication**: Not required

**URL Parameters**:
- `id` (integer, required): Blog ID

**Response** (200 OK):
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "title": "Welcome to Our Blog",
        "content": "This is the blog content...",
        "image": "blogs/abc123.jpg",
        "image_url": "http://localhost:8000/storage/blogs/abc123.jpg",
        "status": 2,
        "user_id": 1,
        "created_at": "2026-01-21T14:30:00.000000Z",
        "updated_at": "2026-01-21T14:30:00.000000Z"
    }
}
```

**Error Response** (404 Not Found):
```json
{
    "message": "Blog not found"
}
```

**Notes**:
- Returns 404 if blog doesn't exist or is not published
- Only published blogs are accessible via this endpoint

---

### Create Blog

Create a new blog post.

**Endpoint**: `POST /api/blogs`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data` (for file uploads) or `application/json` (for text-only)

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Blog post title |
| `content` | string | Yes | Blog post content (HTML tags will be stripped) |
| `image` | file | No | Image file to upload |

**Example Request** (multipart/form-data):
```
POST /api/blogs
Content-Type: multipart/form-data
Authorization: Bearer {token}

title: "My New Blog Post"
content: "This is the content of my blog post..."
image: [binary file data]
```

**Example Request** (JSON - no image):
```json
{
    "title": "My New Blog Post",
    "content": "This is the content of my blog post..."
}
```

**Response** (201 Created):
```json
{
    "status": "success",
    "message": "Blog created successfully",
    "data": {
        "id": 3,
        "title": "My New Blog Post",
        "content": "This is the content of my blog post...",
        "image": "blogs/xyz789.jpg",
        "image_url": "http://localhost:8000/storage/blogs/xyz789.jpg",
        "status": 2,
        "user_id": 1,
        "created_at": "2026-01-23T12:00:00.000000Z",
        "updated_at": "2026-01-23T12:00:00.000000Z"
    }
}
```

**Error Response** (422 Validation Error):
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "title": ["The title field is required."],
        "content": ["The content field is required."]
    }
}
```

**Error Response** (401 Unauthorized):
```json
{
    "message": "Unauthenticated."
}
```

**Notes**:
- Blog is automatically set to `Published` status (status = 2)
- HTML tags in content are automatically stripped for security
- Image is stored in `storage/app/public/blogs/` directory
- If no image is provided, `image` and `image_url` will be `null`
- `user_id` is automatically set from the authenticated user

---

### Update Blog

Update an existing blog post.

**Endpoint**: `PUT /api/blogs/{id}`

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data` (if updating image) or `application/json`

**URL Parameters**:
- `id` (integer, required): Blog ID

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Blog post title |
| `content` | string | No | Blog post content (HTML tags will be stripped) |
| `image` | file | No | New image file to upload |

**Example Request**:
```
PUT /api/blogs/1
Content-Type: multipart/form-data
Authorization: Bearer {token}

title: "Updated Blog Title"
content: "Updated content..."
image: [binary file data]
```

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Blog updated successfully",
    "data": {
        "id": 1,
        "title": "Updated Blog Title",
        "content": "Updated content...",
        "image": "blogs/new-image.jpg",
        "image_url": "http://localhost:8000/storage/blogs/new-image.jpg",
        "status": 2,
        "user_id": 1,
        "created_at": "2026-01-21T14:30:00.000000Z",
        "updated_at": "2026-01-23T15:00:00.000000Z"
    }
}
```

**Error Response** (404 Not Found):
```json
{
    "status": "error",
    "message": "Blog not found"
}
```

**Error Response** (422 Validation Error):
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "title": ["The title field is required."]
    }
}
```

**Notes**:
- Only provided fields are updated (partial updates supported)
- If a new image is uploaded, the old image is automatically deleted
- HTML tags in content are automatically stripped
- Status cannot be changed via this endpoint (always remains Published)

---

### Delete Blog

Delete a blog post.

**Endpoint**: `DELETE /api/blogs/{id}`

**Authentication**: Required (Bearer Token)

**URL Parameters**:
- `id` (integer, required): Blog ID

**Authorization**:
- Users can only delete their own blogs
- Admins can delete any blog

**Response** (200 OK):
```json
{
    "status": "success",
    "message": "Blog deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
    "status": "error",
    "message": "Blog not found"
}
```

**Error Response** (401 Unauthenticated):
```json
{
    "status": "error",
    "message": "Unauthenticated"
}
```

**Error Response** (403 Forbidden):
```json
{
    "status": "error",
    "message": "Unauthorized action"
}
```

**Notes**:
- Associated image file is automatically deleted from storage
- Only the blog owner or an admin can delete a blog

---

## Frontend Integration

### React/TypeScript Example

#### Get All Blogs

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

interface Blog {
  id: number;
  title: string;
  content: string;
  image: string | null;
  image_url: string | null;
  status: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Get all blogs
const fetchBlogs = async (): Promise<Blog[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/blogs`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};
```

#### Get Single Blog

```typescript
const fetchBlog = async (id: number): Promise<Blog> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/blogs/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};
```

#### Create Blog

```typescript
interface CreateBlogData {
  title: string;
  content: string;
  image?: File | null;
}

const createBlog = async (
  data: CreateBlogData,
  token: string
): Promise<Blog> => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await axios.post(`${API_BASE_URL}/blogs`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};
```

#### Update Blog

```typescript
interface UpdateBlogData {
  title?: string;
  content?: string;
  image?: File | null;
}

const updateBlog = async (
  id: number,
  data: UpdateBlogData,
  token: string
): Promise<Blog> => {
  try {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.image) formData.append('image', data.image);

    const response = await axios.put(
      `${API_BASE_URL}/blogs/${id}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};
```

#### Delete Blog

```typescript
const deleteBlog = async (id: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};
```

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/blogs');
        setBlogs(response.data.data);
      } catch (error) {
        console.error('Failed to load blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Blog Posts</h1>
      {blogs.map((blog) => (
        <div key={blog.id} className="blog-card">
          {blog.image_url && (
            <img src={blog.image_url} alt={blog.title} />
          )}
          <h2>{blog.title}</h2>
          <p>{blog.content}</p>
          <small>{new Date(blog.created_at).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
};

export default BlogList;
```

---

## Common Issues & Solutions

### Issue 1: BlogStatus Enum Type Error

**Error**: `App\Enums\BlogStatus::from(): Argument #1 ($value) must be of type int, string given`

**Cause**: Trying to use a string value instead of the enum case.

**Solution**: Always use `BlogStatus::Published` or `BlogStatus::Published->value` instead of `'published'`.

**Backend Fix**:
```php
// ❌ Wrong
'status' => 'published'
'status' => BlogStatus::from('published')

// ✅ Correct
'status' => BlogStatus::Published
'status' => BlogStatus::Published->value  // Returns 2
```

### Issue 2: Image Not Displaying

**Problem**: `image_url` is null or incorrect.

**Solutions**:
1. Check if image was uploaded correctly
2. Verify storage link exists: `php artisan storage:link`
3. Check file permissions on `storage/app/public/blogs/`
4. Ensure image path is correct in database

### Issue 3: 401 Unauthenticated Error

**Problem**: Getting 401 when creating/updating/deleting blogs.

**Solutions**:
1. Ensure Bearer token is included in request headers
2. Verify token is valid and not expired
3. Check token format: `Authorization: Bearer {token}`
4. Ensure user is logged in

### Issue 4: 403 Forbidden on Delete

**Problem**: Cannot delete blog even with valid token.

**Cause**: User is trying to delete a blog they don't own and is not an admin.

**Solution**: Only blog owners and admins can delete blogs. Verify user permissions.

### Issue 5: HTML Tags in Content

**Problem**: HTML tags are being stripped from content.

**Cause**: This is intentional for security (XSS prevention).

**Solution**: If you need HTML content, consider:
1. Using a rich text editor that sanitizes HTML
2. Storing HTML in a separate field
3. Implementing server-side HTML sanitization (e.g., using HTMLPurifier)

### Issue 6: Image Upload Fails

**Problem**: Image upload returns error or image is null.

**Solutions**:
1. Check file size limits in PHP configuration
2. Verify `storage/app/public/blogs/` directory exists and is writable
3. Ensure `multipart/form-data` content type is used
4. Check file extension is allowed (jpg, jpeg, png, gif, webp)
5. Verify Laravel storage link: `php artisan storage:link`

---

## Testing Examples

### cURL Examples

#### Get All Blogs
```bash
curl -X GET http://localhost:8000/api/blogs
```

#### Get Single Blog
```bash
curl -X GET http://localhost:8000/api/blogs/1
```

#### Create Blog (with image)
```bash
curl -X POST http://localhost:8000/api/blogs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=My Blog Post" \
  -F "content=This is my blog content" \
  -F "image=@/path/to/image.jpg"
```

#### Create Blog (without image)
```bash
curl -X POST http://localhost:8000/api/blogs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Blog Post",
    "content": "This is my blog content"
  }'
```

#### Update Blog
```bash
curl -X PUT http://localhost:8000/api/blogs/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Updated Title" \
  -F "content=Updated content"
```

#### Delete Blog
```bash
curl -X DELETE http://localhost:8000/api/blogs/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Summary

- **Public Endpoints**: GET `/api/blogs`, GET `/api/blogs/{id}`
- **Protected Endpoints**: POST `/api/blogs`, PUT `/api/blogs/{id}`, DELETE `/api/blogs/{id}`
- **Status**: Blogs are automatically published (status = 2) when created
- **Images**: Optional, stored in `storage/app/public/blogs/`
- **Security**: HTML tags are stripped from content, only owners/admins can delete
- **Important**: Always use `BlogStatus::Published` enum case, never strings

For authentication setup, see `SANCTUM_AUTHENTICATION_DOCUMENTATION.md`.
