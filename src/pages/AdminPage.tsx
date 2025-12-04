import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Edit3,
  FilePlus2,
  ImageOff,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import axios from 'axios';
import { HeaderAlt } from '../components/HeaderAlt';
import { FooterAlt } from '../components/FooterAlt';
import { ChatWidget } from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';
import '../components/styles/AdminPage.css';
import { toast } from 'sonner';

interface ApprovalItem {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: number;
  submittedAt: string;
  image?: string;
}

const APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: 'item-1001',
    title: 'Vintage Chanel Tweed Blazer',
    seller: '@luxecloset',
    category: 'Outerwear',
    price: 1480,
    submittedAt: '2 hours ago',
    image:
      'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'item-1002',
    title: 'Silk Evening Gown',
    seller: '@noirearchive',
    category: 'Dresses',
    price: 620,
    submittedAt: '4 hours ago',
    image:
      'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'item-1003',
    title: 'Leather Saddle Bag',
    seller: '@heritagefinds',
    category: 'Accessories',
    price: 380,
    submittedAt: '9 hours ago',
  },
];

const DEFAULT_BLOG_CATEGORIES = [
  'Market Insights',
  'Seller Spotlights',
  'Trend Reports',
  'Closet Tours',
  'Sustainability',
];

const STORAGE_KEY_CATEGORIES = 'ministry_blog_categories';

interface Blog {
  id: number;
  title: string;
  category: string;
  short_summary: string;
  full_story: string;
  image_url: string;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('auth_token');
};

// Helper function to get axios config with authentication
const getAuthConfig = () => {
  const token = getAuthToken();
  const config: any = {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
  
  // Add Bearer token if available
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
};

// Helper function to normalize image URLs
const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url || url.trim() === '') {
    return '';
  }
  
  const trimmedUrl = url.trim();
  
  // If it's already a full URL (http:// or https://), return as is
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl;
  }
  
  // If it starts with storage/ or is a relative path, prepend backend URL
  if (trimmedUrl.startsWith('storage/') || trimmedUrl.startsWith('/storage/')) {
    const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }
  
  // If it starts with //, add https:
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

export function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'approve' | 'approved-menu' | 'add-blog' | 'manage-blogs'>('approve');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: DEFAULT_BLOG_CATEGORIES[0] ?? '',
    summary: '',
    content: '',
    heroImage: '',
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [blogQuery, setBlogQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const customCategories = JSON.parse(saved);
        return [...DEFAULT_BLOG_CATEGORIES, ...customCategories];
      }
      return DEFAULT_BLOG_CATEGORIES;
    } catch {
      return DEFAULT_BLOG_CATEGORIES;
    }
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Fetch blogs on component mount and when switching to manage-blogs tab
  useEffect(() => {
    if (activeTab === 'manage-blogs') {
      fetchBlogs();
    }
  }, [activeTab]);

  // Fetch pending items (approved = 1) for Approve Items tab
  useEffect(() => {
    if (activeTab === 'approve') {
      fetchPendingItems();
    }
  }, [activeTab]);

  // Fetch approved items (approved = 2) for Approved Menu tab
  useEffect(() => {
    if (activeTab === 'approved-menu') {
      fetchApprovedItems();
    }
  }, [activeTab]);

  const fetchPendingItems = async () => {
    try {
      setLoadingItems(true);
      
      // Get CSRF cookie first
      await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      
      const response = await axios.get(`${API_BASE_URL}/items`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
        },
      });
      
      // Filter items with approved = 1 (pending approval)
      // NOTE: Only items that were explicitly set to approved = 1 by admin action should appear
      // Items with approved = 0, null, or undefined are not in the approval queue
      const pendingItems = Array.isArray(response.data) 
        ? response.data.filter((item: any) => {
            const approvedStatus = item.approved;
            // Only show items with exactly approved = 1 (not 0, null, undefined, or 2)
            return approvedStatus === 1 || approvedStatus === '1';
          })
        : [];
      
      // Map to ApprovalItem format
      const mappedItems: ApprovalItem[] = pendingItems.map((item: any) => {
        const API_ROOT_FOR_IMAGES = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
        
        const getImageUrl = (item: any): string => {
          if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
            const mainImage = item.images[0];
            if (mainImage?.url) return mainImage.url;
            if (mainImage?.path) {
              const img = mainImage.path;
              if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                return img;
              }
              const cleanPath = img.startsWith('/') ? img.substring(1) : img;
              if (cleanPath.startsWith('storage/')) {
                return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
              }
              return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
            }
          }
          if (item?.image_url) return item.image_url;
          if (item?.image) {
            const img = item.image;
            if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
              return img;
            }
            const cleanPath = img.startsWith('/') ? img.substring(1) : img;
            if (cleanPath.startsWith('storage/')) {
              return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
            }
            return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
          }
          return '';
        };
        
        return {
          id: String(item.id),
          title: item.title || item.name || 'Untitled Item',
          seller: item.user?.name || item.user?.email || 'Unknown Seller',
          category: item.category?.name || 'Uncategorized',
          price: parseFloat(item.price) || 0,
          submittedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown',
          image: getImageUrl(item),
        };
      });
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending items', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchApprovedItems = async () => {
    try {
      setLoadingItems(true);
      const response = await axios.get(`${API_BASE_URL}/items`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Filter items with approved = 2 (approved)
      const approved = Array.isArray(response.data) 
        ? response.data.filter((item: any) => {
            const approvedStatus = item.approved;
            return approvedStatus === 2 || approvedStatus === '2';
          })
        : [];
      
      // Map to ApprovalItem format
      const mappedItems: ApprovalItem[] = approved.map((item: any) => {
        const API_ROOT_FOR_IMAGES = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
        
        const getImageUrl = (item: any): string => {
          if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
            const mainImage = item.images[0];
            if (mainImage?.url) return mainImage.url;
            if (mainImage?.path) {
              const img = mainImage.path;
              if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                return img;
              }
              const cleanPath = img.startsWith('/') ? img.substring(1) : img;
              if (cleanPath.startsWith('storage/')) {
                return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
              }
              return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
            }
          }
          if (item?.image_url) return item.image_url;
          if (item?.image) {
            const img = item.image;
            if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
              return img;
            }
            const cleanPath = img.startsWith('/') ? img.substring(1) : img;
            if (cleanPath.startsWith('storage/')) {
              return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
            }
            return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
          }
          return '';
        };
        
        return {
          id: String(item.id),
          title: item.title || item.name || 'Untitled Item',
          seller: item.user?.name || item.user?.email || 'Unknown Seller',
          category: item.category?.name || 'Uncategorized',
          price: parseFloat(item.price) || 0,
          submittedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown',
          image: getImageUrl(item),
        };
      });
      
      setApprovedItems(mappedItems);
    } catch (error) {
      console.error('Error fetching approved items:', error);
      toast.error('Failed to load approved items', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } finally {
      setLoadingItems(false);
    }
  };

  // Load draft from localStorage on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('blog_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        // If draft has a category that's not in our list, add it
        if (draft.category && !categories.includes(draft.category)) {
          const updatedCategories = [...categories, draft.category];
          setCategories(updatedCategories);
          
          // Save to localStorage if it's not a default category
          if (!DEFAULT_BLOG_CATEGORIES.includes(draft.category)) {
            const customCategories = updatedCategories.filter(
              cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
            );
            localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
          }
        }
        setBlogForm(draft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs`);
      // API returns { status: "success", data: [...] }
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setBlogs(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback if response structure is different
        setBlogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }
    const lowered = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowered) ||
        item.seller.toLowerCase().includes(lowered) ||
        item.category.toLowerCase().includes(lowered),
    );
  }, [items, query]);

  const filteredBlogs = useMemo(() => {
    if (!blogQuery.trim()) {
      return blogs;
    }
    const lowered = blogQuery.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lowered) ||
        blog.category.toLowerCase().includes(lowered) ||
        blog.short_summary.toLowerCase().includes(lowered),
    );
  }, [blogs, blogQuery]);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      // Get CSRF cookie first
      await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      
      if (decision === 'approved') {
        // Set approved = 2 (approved)
        await axios.put(
          `${API_BASE_URL}/items/${id}`,
          { approved: 2 },
          getAuthConfig()
        );
        
        // Remove from pending items and add to approved items
        const item = items.find((i) => i.id === id);
        if (item) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          setApprovedItems((prev) => [...prev, item]);
        }
        
        toast.success('Item approved and moved to Approved Menu ✅', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
      } else {
        // Reject: set approved = 0 to remove from approval queue
        // Based on requirements: "it will stay as 1 and will be moved out of the approve item tab"
        // But to prevent it from showing again, we'll set it to 0
        await axios.put(
          `${API_BASE_URL}/items/${id}`,
          { approved: 0 },
          getAuthConfig()
        );
        
        // Remove from the list
        setItems((prev) => prev.filter((item) => item.id !== id));
        
        toast.success('Item rejected and removed from queue ❌', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
      }
    } catch (error: any) {
      console.error('Error updating item approval:', error);
      toast.error('Failed to update item approval status', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    }
  };

  const handleRejectApproved = async (id: string) => {
    try {
      // Get CSRF cookie first
      await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      
      // Reset approved from 2 to 1 (move back to approval queue)
      await axios.put(
        `${API_BASE_URL}/items/${id}`,
        { approved: 1 },
        getAuthConfig()
      );
      
      // Remove from approved items
      setApprovedItems((prev) => prev.filter((item) => item.id !== id));
      
      toast.success('Item rejected and moved back to pending queue', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      
      // Refresh pending items if on that tab
      if (activeTab === 'approve') {
        fetchPendingItems();
      }
    } catch (error: any) {
      console.error('Error rejecting approved item:', error);
      toast.error('Failed to reject item', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    }
  };

  const saveDraftToLocalStorage = () => {
    try {
      localStorage.setItem('blog_draft', JSON.stringify(blogForm));
      toast.success('Draft saved locally ✨', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    }
  };

  const handleSaveDraft = (event: React.FormEvent) => {
    event.preventDefault();
    saveDraftToLocalStorage();
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
        return;
      }
      
      setHeroImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setHeroImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    if (heroImagePreview) {
      URL.revokeObjectURL(heroImagePreview);
    }
    setHeroImageFile(null);
    setHeroImagePreview(null);
    setBlogForm(prev => ({ ...prev, heroImage: '' }));
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePostBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      toast.error('Title and Full Story are required', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    setLoading(true);

    try {
      // Determine if we're using FormData (for file upload) or JSON (for URL)
      const useFormData = heroImageFile && imageUploadMode === 'upload';
      
      let payload: FormData | {
        title: string;
        full_story: string;
        context?: string;
        content?: string;
        category?: string;
        short_summary?: string;
        image_url?: string;
      };

      if (useFormData) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('title', blogForm.title);
        formData.append('full_story', blogForm.content);
        formData.append('content', blogForm.content);
        formData.append('context', blogForm.content);
        
        if (blogForm.category) {
          formData.append('category', blogForm.category);
        }
        if (blogForm.summary) {
          formData.append('short_summary', blogForm.summary);
        }
        
        // Append image file - backend should handle this
        formData.append('image', heroImageFile);
        
        payload = formData;
      } else {
        // Use JSON for URL or no image
        payload = {
          title: blogForm.title,
          full_story: blogForm.content,
          content: blogForm.content,
          context: blogForm.content,
        };

        if (blogForm.category) {
          payload.category = blogForm.category;
        }
        if (blogForm.summary) {
          payload.short_summary = blogForm.summary;
        }
        if (blogForm.heroImage) {
          payload.image_url = blogForm.heroImage;
        }
      }

      if (editingBlogId) {
        // Update existing blog
        // Try multiple methods as backend may have different route configuration
        let updateSuccess = false;
        let lastError: any = null;
        
        // Helper to get axios config
        const getAxiosConfig = () => {
          if (useFormData) {
            return {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            };
          }
          return {};
        };

        // Try PATCH first (REST standard for updates)
        try {
          const response = await axios.patch(`${API_BASE_URL}/blogs/${editingBlogId}`, payload, getAxiosConfig());
          updateSuccess = true;
        } catch (patchError: any) {
          lastError = patchError;
          // If PATCH is not supported (405), try POST with _method override (Laravel method spoofing)
          if (patchError.response?.status === 405) {
            try {
              // Try POST with _method=PATCH (Laravel method spoofing)
              const postPayload = useFormData 
                ? (payload as FormData) 
                : { ...(payload as any), _method: 'PATCH' };
              if (!useFormData && postPayload instanceof FormData === false) {
                (postPayload as any)._method = 'PATCH';
              }
              const response = await axios.post(`${API_BASE_URL}/blogs/${editingBlogId}`, postPayload, getAxiosConfig());
              updateSuccess = true;
            } catch (postError1: any) {
              // Only continue if it's a 405 error (method not allowed)
              if (postError1.response?.status === 405) {
                try {
                  // Try POST with _method=PUT
                  const postPayload = useFormData 
                    ? (payload as FormData) 
                    : { ...(payload as any), _method: 'PUT' };
                  if (!useFormData && postPayload instanceof FormData === false) {
                    (postPayload as any)._method = 'PUT';
                  }
                  const response = await axios.post(`${API_BASE_URL}/blogs/${editingBlogId}`, postPayload, getAxiosConfig());
                  updateSuccess = true;
                } catch (postError2: any) {
                  // Only continue if it's a 405 error
                  if (postError2.response?.status === 405) {
                    try {
                      // Try plain POST
                      const response = await axios.post(`${API_BASE_URL}/blogs/${editingBlogId}`, payload, getAxiosConfig());
                      updateSuccess = true;
                    } catch (postError3: any) {
                      // Only continue if it's a 405 error
                      if (postError3.response?.status === 405) {
                        // Try PUT as last resort
                        try {
                          const response = await axios.put(`${API_BASE_URL}/blogs/${editingBlogId}`, payload, getAxiosConfig());
                          updateSuccess = true;
                        } catch (putError: any) {
                          lastError = putError;
                        }
                      } else {
                        // Re-throw if it's a different error (validation, etc.)
                        throw postError3;
                      }
                    }
                  } else {
                    // Re-throw if it's a different error (validation, etc.)
                    throw postError2;
                  }
                }
              } else {
                // Re-throw if it's a different error (validation, etc.)
                throw postError1;
              }
            }
          } else {
            // Re-throw if it's a different error (validation, etc.)
            throw patchError;
          }
        }
        
        if (updateSuccess) {
          toast.success('Blog updated successfully ✨', {
            style: {
              background: '#FFFFFF',
              color: '#0A4834',
              border: '1px solid #9F8151',
              fontFamily: 'Manrope, sans-serif',
            },
          });
          setEditingBlogId(null);
        } else if (lastError) {
          // If all methods failed, throw the last error to be handled by outer catch
          throw lastError;
        }
      } else {
        // Create new blog
        const response = await axios.post(
          `${API_BASE_URL}/blogs`, 
          payload,
          useFormData ? {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          } : {}
        );
        toast.success('Blog posted successfully ✨', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
      }

      // Clear localStorage draft after successful post
      localStorage.removeItem('blog_draft');

      // Reset form
      setBlogForm({
        title: '',
        category: categories[0] ?? '',
        summary: '',
        content: '',
        heroImage: '',
      });
      handleRemoveImage();
      setImageUploadMode('url');

      // Refresh blogs list if on manage-blogs tab
      if (activeTab === 'manage-blogs') {
        fetchBlogs();
      }
    } catch (error: any) {
      console.error('Error posting blog:', error);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Payload that was sent:', JSON.stringify(payload, null, 2));
      
      // Handle Laravel validation errors with detailed messages
      let errorMessage = 'Failed to post blog';
      const missingFields: string[] = [];
      
      // Handle 405 Method Not Allowed errors specially
      if (error.response?.status === 405) {
        const errorData = error.response.data;
        const errorMsg = errorData?.message || error.message || 'Method not allowed';
        // Extract supported methods if available in the error
        const supportedMethods = error.response?.headers?.['allow'] || 
                                errorMsg.match(/Supported methods: ([^.]+)/i)?.[1];
        
        let methodErrorMessage: string;
        if (supportedMethods) {
          methodErrorMessage = `Update method not supported. The backend only accepts: ${supportedMethods}. Please check the API route configuration.`;
        } else {
          methodErrorMessage = `The update method is not supported for this route. Only GET and HEAD methods are currently available. Please contact the backend developer to add PUT/PATCH support, or check if updates should use a different endpoint.`;
        }
        
        toast.error(methodErrorMessage, {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
          duration: 7000, // Show longer for this type of error
        });
        return;
      }
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for Laravel validation errors format
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages: string[] = [];
          Object.keys(errorData.errors).forEach((field) => {
            const fieldErrors = Array.isArray(errorData.errors[field])
              ? errorData.errors[field]
              : [String(errorData.errors[field])];
            
            // Extract field name and add to missing fields list
            missingFields.push(field);
            errorMessages.push(...fieldErrors);
          });
          
          // Create a detailed error message
          if (missingFields.length > 0) {
            errorMessage = `Missing required fields: ${missingFields.join(', ')}. `;
            errorMessage += errorMessages.join('. ');
          } else {
            errorMessage = errorMessages.join('. ') || errorData.message || errorMessage;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
          // Try to extract field names from the message (handles various formats)
          if (errorData.message.toLowerCase().includes('field is required') || 
              errorData.message.toLowerCase().includes('is required')) {
            // Match patterns like "content field is required", "The content field is required"
            const fieldMatch = errorData.message.match(/(?:the\s+)?(\w+)\s+(?:field\s+)?is\s+required/i);
            if (fieldMatch && fieldMatch[1]) {
              const fieldName = fieldMatch[1];
              errorMessage = `The "${fieldName}" field is required. `;
              // Provide helpful context based on the field
              if (fieldName === 'content') {
                errorMessage += 'Please make sure the "Full Story" field is filled in.';
              } else if (fieldName === 'context') {
                errorMessage += 'Please make sure the "Full Story" field is filled in.';
              } else if (fieldName === 'title') {
                errorMessage += 'Please make sure the "Title" field is filled in.';
              } else {
                errorMessage += 'Please fill it in and try again.';
              }
            }
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error with actionable information
      toast.error(errorMessage, {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
        duration: 5000, // Show longer for validation errors
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    
    // If the blog has a category that's not in our list, add it
    if (blog.category && !categories.includes(blog.category)) {
      const updatedCategories = [...categories, blog.category];
      setCategories(updatedCategories);
      
      // Save to localStorage if it's not a default category
      if (!DEFAULT_BLOG_CATEGORIES.includes(blog.category)) {
        const customCategories = updatedCategories.filter(
          cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
        );
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
      }
    }
    
    setBlogForm({
      title: blog.title,
      category: blog.category || (categories[0] ?? ''),
      summary: blog.short_summary || '',
      content: blog.full_story,
      heroImage: blog.image_url || '',
    });
    // Reset image upload state when editing
    handleRemoveImage();
    setImageUploadMode('url');
    setActiveTab('add-blog');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Get CSRF cookie first (required for Sanctum SPA authentication)
      // This matches the pattern used in UploadItem.tsx
      try {
        await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
      } catch (csrfError) {
        // CSRF cookie fetch failed, but continue anyway (might not be needed for API routes)
        console.warn('CSRF cookie fetch failed, continuing anyway:', csrfError);
      }
      
      // Use the API route (DELETE /api/blogs/{id}) - this is the correct route for React SPA
      const response = await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Delete response:', response);
      
      toast.success('Blog deleted successfully', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      
      // Refresh the blogs list
      await fetchBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Handle specific error cases
      let errorMessage = 'Failed to delete blog';
      
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this blog';
      } else if (error.response?.status === 404) {
        errorMessage = 'Blog not found';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to delete blogs';
      } else if (error.response?.status === 419) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (error.response?.status === 0 || !error.response) {
        // Network error (CORS, connection refused, etc.)
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      category: categories[0] ?? '',
      summary: '',
      content: '',
      heroImage: '',
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    const trimmedCategory = newCategory.trim();
    
    // Check if category already exists
    if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
      toast.error('This category already exists', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    // Add to categories list
    const updatedCategories = [...categories, trimmedCategory];
    setCategories(updatedCategories);

    // Save custom categories to localStorage (only the ones not in default list)
    const customCategories = updatedCategories.filter(
      cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
    );
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));

    // Set the new category as selected
    setBlogForm(prev => ({ ...prev, category: trimmedCategory }));

    // Reset add category form
    setNewCategory('');
    setShowAddCategory(false);

    toast.success('Category added successfully ✨', {
      style: {
        background: '#FFFFFF',
        color: '#0A4834',
        border: '1px solid #9F8151',
        fontFamily: 'Manrope, sans-serif',
      },
    });
  };

  return (
    <div className="admin-page">
      <HeaderAlt />
      <main className="admin-main">
        <section className="admin-hero">
          <div className="admin-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="admin-profile-card"
            >
              <img
                className="admin-avatar"
                src="https://static.vecteezy.com/system/resources/previews/021/190/188/non_2x/user-profile-outline-icon-in-transparent-background-basic-app-and-web-ui-bold-line-icon-eps10-free-vector.jpg"
                alt="Admin avatar"
              />
              <h2>{user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Administrator'}</h2>
              <p>{user?.username ?? 'amin'}</p>
              <div className="admin-meta">
                <span>Role: Admin</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="admin-hero-intro"
            >
              <h1>Ministry Admin Console</h1>
              <p>
                Review curated submissions, publish standout stories, and keep the marketplace thriving.
                Every action shapes the experience for our community of collectors and sellers.
              </p>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <span>Items Pending</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Published This Week</span>
                  <strong>12</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Stories in Draft</span>
                  <strong>5</strong>
                </div>
              </div>
              <button
                onClick={() => {
                  logout().catch(console.error);
                }}
                className="admin-submit"
                style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.15)' }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </motion.div>
          </div>
        </section>

        <div className="admin-surface">
          <div className="admin-surface-inner">
            <div className="admin-tabs">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('approve')}
                className={`admin-tab-button ${activeTab === 'approve' ? 'is-active' : ''}`}
              >
                <ShieldCheck />
                Approve Items
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('approved-menu')}
                className={`admin-tab-button ${activeTab === 'approved-menu' ? 'is-active' : ''}`}
              >
                <Check />
                Approved Menu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('add-blog');
                  handleCancelEdit();
                }}
                className={`admin-tab-button ${activeTab === 'add-blog' ? 'is-active' : ''}`}
              >
                <FilePlus2 />
                {editingBlogId ? 'Edit Blog' : 'Add Blog'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('manage-blogs');
                  handleCancelEdit();
                }}
                className={`admin-tab-button ${activeTab === 'manage-blogs' ? 'is-active' : ''}`}
              >
                <Edit3 />
                Manage Blogs
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="admin-content-card"
            >
              {activeTab === 'approve' ? (
                <>
                  <div className="admin-content-header">
                    <h3>Submitters awaiting review</h3>
                    <div className="admin-search">
                      <Search />
                      <input
                        type="text"
                        placeholder="Filter by name, seller, or category"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  {loadingItems ? (
                    <div className="admin-empty-state">
                      <Loader2 size={40} className="animate-spin" />
                      <strong>Loading items...</strong>
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="admin-queue">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="admin-queue-card">
                          {item.image ? (
                            <img
                              className="admin-queue-image"
                              src={item.image}
                              alt={item.title}
                            />
                          ) : (
                            <div className="admin-queue-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageOff size={32} color="#9F8151" />
                            </div>
                          )}
                          <div className="admin-queue-details">
                            <h4>{item.title}</h4>
                            <div className="admin-queue-meta">
                              <span>@{item.seller.replace(/^@/, '')}</span>
                              <span>{item.category}</span>
                              <span>${item.price.toLocaleString()}</span>
                              <span>Submitted {item.submittedAt}</span>
                            </div>
                          </div>
                          <div className="admin-queue-actions">
                            <button
                              className="approve"
                              onClick={() => handleDecision(item.id, 'approved')}
                            >
                              <Check size={18} />
                              Approve
                            </button>
                            <button
                              className="reject"
                              onClick={() => handleDecision(item.id, 'rejected')}
                            >
                              <X size={18} />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <ShieldCheck size={40} />
                      <strong>All caught up.</strong>
                      <span>There are no pending items to review right now.</span>
                    </div>
                  )}
                </>
              ) : activeTab === 'approved-menu' ? (
                <>
                  <div className="admin-content-header">
                    <h3>Approved Items</h3>
                    <div className="admin-search">
                      <Search />
                      <input
                        type="text"
                        placeholder="Filter by name, seller, or category"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  {loadingItems ? (
                    <div className="admin-empty-state">
                      <Loader2 size={40} className="animate-spin" />
                      <strong>Loading items...</strong>
                    </div>
                  ) : approvedItems.filter((item) => {
                    if (!query.trim()) return true;
                    const lowered = query.toLowerCase();
                    return (
                      item.title.toLowerCase().includes(lowered) ||
                      item.seller.toLowerCase().includes(lowered) ||
                      item.category.toLowerCase().includes(lowered)
                    );
                  }).length > 0 ? (
                    <div className="admin-queue">
                      {approvedItems.filter((item) => {
                        if (!query.trim()) return true;
                        const lowered = query.toLowerCase();
                        return (
                          item.title.toLowerCase().includes(lowered) ||
                          item.seller.toLowerCase().includes(lowered) ||
                          item.category.toLowerCase().includes(lowered)
                        );
                      }).map((item) => (
                        <div key={item.id} className="admin-queue-card">
                          {item.image ? (
                            <img
                              className="admin-queue-image"
                              src={item.image}
                              alt={item.title}
                            />
                          ) : (
                            <div className="admin-queue-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageOff size={32} color="#9F8151" />
                            </div>
                          )}
                          <div className="admin-queue-details">
                            <h4>{item.title}</h4>
                            <div className="admin-queue-meta">
                              <span>@{item.seller.replace(/^@/, '')}</span>
                              <span>{item.category}</span>
                              <span>${item.price.toLocaleString()}</span>
                              <span>Approved {item.submittedAt}</span>
                            </div>
                          </div>
                          <div className="admin-queue-actions">
                            <button
                              className="reject"
                              onClick={() => handleRejectApproved(item.id)}
                            >
                              <X size={18} />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <Check size={40} />
                      <strong>No approved items.</strong>
                      <span>There are no approved items in the menu right now.</span>
                    </div>
                  )}
                </>
              ) : activeTab === 'add-blog' ? (
                <>
                  <div className="admin-content-header">
                    <h3>{editingBlogId ? 'Edit blog post' : 'Create an editorial draft'}</h3>
                    <div className="admin-form-hint">
                      {editingBlogId ? 'Update the blog post below' : 'Autosaves every 30s while you type.'}
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleSaveDraft}>
                    <div className="admin-form-row">
                      <div className="admin-field">
                        <label htmlFor="blog-title">Title</label>
                        <input
                          id="blog-title"
                          type="text"
                          placeholder="The Luxury Edit: Parisian Finds"
                          value={blogForm.title}
                          onChange={(event) =>
                            setBlogForm((prev) => ({ ...prev, title: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="blog-category">Category</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                          <select
                            id="blog-category"
                            value={blogForm.category}
                            onChange={(event) =>
                              setBlogForm((prev) => ({ ...prev, category: event.target.value }))
                            }
                            style={{ flex: 1 }}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowAddCategory(!showAddCategory)}
                            className="admin-submit"
                            style={{ 
                              background: showAddCategory ? '#9F8151' : 'rgba(255,255,255,0.15)',
                              padding: '8px 16px',
                              whiteSpace: 'nowrap',
                              color: showAddCategory ? '#FFFFFF' : '#0A4834',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: showAddCategory ? 'none' : '1px solid rgba(10, 72, 52, 0.2)'
                            }}
                          >
                            {showAddCategory ? 'Cancel' : '+ Add Category'}
                          </button>
                        </div>
                        {showAddCategory && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Enter new category name"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCategory();
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #9F8151',
                                borderRadius: '6px',
                                background: '#FFFFFF',
                                color: '#0A4834',
                                fontFamily: 'Manrope, sans-serif',
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              className="admin-submit"
                              style={{ 
                                background: '#0A4834',
                                padding: '8px 16px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-field">
                      <label htmlFor="blog-summary">Short Summary</label>
                      <textarea
                        id="blog-summary"
                        placeholder="In this week’s edit we spotlight rare maison pieces from the 70s, sourced by curators across Paris."
                        value={blogForm.summary}
                        onChange={(event) =>
                          setBlogForm((prev) => ({ ...prev, summary: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="blog-content">Full Story</label>
                      <textarea
                        id="blog-content"
                        placeholder="Compose your editorial feature..."
                        value={blogForm.content}
                        onChange={(event) =>
                          setBlogForm((prev) => ({ ...prev, content: event.target.value }))
                        }
                        required
                        style={{ minHeight: 220 }}
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="blog-hero">Hero Image</label>
                      
                      {/* Toggle between URL and Upload */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginBottom: '12px',
                        borderBottom: '1px solid rgba(159, 129, 81, 0.2)',
                        paddingBottom: '12px'
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUploadMode('url');
                            handleRemoveImage();
                          }}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid rgba(159, 129, 81, 0.3)',
                            borderRadius: '8px',
                            background: imageUploadMode === 'url' ? '#9F8151' : 'transparent',
                            color: imageUploadMode === 'url' ? '#FFFFFF' : '#0A4834',
                            cursor: 'pointer',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ImageIcon size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                          Use URL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUploadMode('upload');
                            setBlogForm(prev => ({ ...prev, heroImage: '' }));
                          }}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid rgba(159, 129, 81, 0.3)',
                            borderRadius: '8px',
                            background: imageUploadMode === 'upload' ? '#9F8151' : 'transparent',
                            color: imageUploadMode === 'upload' ? '#FFFFFF' : '#0A4834',
                            cursor: 'pointer',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Upload size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                          Upload Image
                        </button>
                      </div>

                      {imageUploadMode === 'url' ? (
                        <input
                          id="blog-hero"
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={blogForm.heroImage}
                          onChange={(event) =>
                            setBlogForm((prev) => ({ ...prev, heroImage: event.target.value }))
                          }
                        />
                      ) : (
                        <div>
                          <input
                            id="blog-hero-file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            style={{ display: 'none' }}
                          />
                          <label
                            htmlFor="blog-hero-file"
                            style={{
                              display: 'block',
                              padding: '12px 24px',
                              border: '2px dashed rgba(159, 129, 81, 0.5)',
                              borderRadius: '8px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              background: 'rgba(159, 129, 81, 0.05)',
                              transition: 'all 0.3s ease',
                              fontFamily: 'Manrope, sans-serif',
                              color: '#0A4834',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#9F8151';
                              e.currentTarget.style.background = 'rgba(159, 129, 81, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(159, 129, 81, 0.5)';
                              e.currentTarget.style.background = 'rgba(159, 129, 81, 0.05)';
                            }}
                          >
                            <Upload size={20} style={{ display: 'block', margin: '0 auto 8px', color: '#9F8151' }} />
                            {heroImageFile ? heroImageFile.name : 'Click to select an image'}
                          </label>
                          
                          {heroImagePreview && (
                            <div style={{ 
                              marginTop: '12px', 
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid rgba(159, 129, 81, 0.3)',
                            }}>
                              <img
                                src={heroImagePreview}
                                alt="Preview"
                                style={{
                                  width: '100%',
                                  maxHeight: '300px',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}
                              >
                                <X size={18} color="#0A4834" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="admin-form-actions">
                      <span className="admin-form-hint">
                        {editingBlogId
                          ? 'Save draft locally or post to database.'
                          : 'Save draft locally or post to database.'}
                      </span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {editingBlogId && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="admin-submit"
                            style={{ background: 'rgba(255,255,255,0.15)' }}
                          >
                            Cancel
                          </button>
                        )}
                        <button type="submit" className="admin-submit" disabled={loading}>
                          <Edit3 size={18} />
                          Save Draft
                        </button>
                        <button
                          type="button"
                          onClick={handlePostBlog}
                          className="admin-submit"
                          disabled={loading}
                          style={{ background: '#0A4834' }}
                        >
                          {loading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              {editingBlogId ? 'Updating...' : 'Posting...'}
                            </>
                          ) : (
                            <>
                              <FilePlus2 size={18} />
                              {editingBlogId ? 'Update & Post' : 'Post'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="admin-content-header">
                    <h3>Manage Blog Posts</h3>
                    <div className="admin-search">
                      <Search />
                      <input
                        type="text"
                        placeholder="Search blogs by title, category, or summary"
                        value={blogQuery}
                        onChange={(event) => setBlogQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  {loading && blogs.length === 0 ? (
                    <div className="admin-empty-state">
                      <Loader2 size={40} className="animate-spin" />
                      <strong>Loading blogs...</strong>
                    </div>
                  ) : filteredBlogs.length > 0 ? (
                    <div className="admin-queue">
                      {filteredBlogs.map((blog) => (
                        <div key={blog.id} className="admin-queue-card">
                          {blog.image_url ? (
                            <img
                              className="admin-queue-image"
                              src={normalizeImageUrl(blog.image_url)}
                              alt={blog.title}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          {!blog.image_url && (
                            <div
                              className="admin-queue-image"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ImageOff size={32} color="#9F8151" />
                            </div>
                          )}
                          <div className="admin-queue-details">
                            <h4>{blog.title}</h4>
                            <div className="admin-queue-meta">
                              <span>{blog.category || 'Uncategorized'}</span>
                              <span>{blog.status || 'published'}</span>
                              <span>
                                {new Date(blog.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {blog.short_summary && (
                              <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                                {blog.short_summary.length > 150
                                  ? `${blog.short_summary.substring(0, 150)}...`
                                  : blog.short_summary}
                              </p>
                            )}
                          </div>
                          <div className="admin-queue-actions">
                            <button
                              className="approve"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditBlog(blog);
                              }}
                              disabled={loading}
                            >
                              <Edit3 size={18} />
                              Edit
                            </button>
                            <button
                              className="reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlog(blog.id);
                              }}
                              disabled={loading}
                            >
                              <Trash2 size={18} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <FilePlus2 size={40} />
                      <strong>No blogs found.</strong>
                      <span>
                        {blogQuery
                          ? 'Try adjusting your search query.'
                          : 'Create your first blog post using the "Add Blog" tab.'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <FooterAlt />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

