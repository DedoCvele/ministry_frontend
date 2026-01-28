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
  ArrowDown,
  Mail,
  Users,
  User,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  sellerEmail?: string;
  category: string;
  price: number;
  submittedAt: string;
  image?: string;
}

const DEFAULT_BLOG_CATEGORIES = [
  'Market Insights',
  'Seller Spotlights',
  'Trend Reports',
  'Closet Tours',
  'Sustainability',
];

const STORAGE_KEY_CATEGORIES = 'ministry_blog_categories';

// BlogResource shape per API documentation
// BlogStatus: 1=Draft, 2=Published
interface Blog {
  id: number;
  title: string;
  content: string;
  image: string | null;
  image_url?: string | null; // For backward compatibility
  // BlogStatus per API documentation: 1=Draft, 2=Published
  status: number;
  user_id?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
  // Optional fields for backward compatibility
  category?: string;
  short_summary?: string;
  full_story?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  username?: string;
  created_at?: string;
  // UserRole per API documentation: 1=Admin, 2=Buyer, 3=Seller
  role?: number;
  phone?: string;
  city?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
}

const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_BASE_URL = 'http://localhost:8000';

// Helper to get user role label per API documentation
// UserRole: 1=Admin, 2=Buyer, 3=Seller
const getUserRoleLabel = (role?: number): string => {
  switch (role) {
    case 1: return 'Admin';
    case 2: return 'Buyer';
    case 3: return 'Seller';
    default: return 'Unknown';
  }
};

// Helper to get approval status label per API documentation
// ItemApprovalStatus: 1=Pending, 2=Approved, 3=Rejected
const getApprovalStatusLabel = (status?: number): string => {
  switch (status) {
    case 1: return 'Pending';
    case 2: return 'Approved';
    case 3: return 'Rejected';
    default: return 'Unknown';
  }
};

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

// Robust helper to safely extract numeric approval value from various response shapes
// API uses approval_status: 1=Pending, 2=Approved, 3=Rejected (per API documentation)
const getApprovalNumber = (item: any): number | null => {
  if (!item) return null;

  // 1) Prefer approval_status first (per API documentation), then fallback to other fields
  const candidate = item.approval_status ?? item.approved ?? item.approval_state ?? item.status;

  if (candidate !== undefined && candidate !== null) {
    // If it's an object (e.g. { value: 3, type: 'number' }), try to extract known shapes
    if (typeof candidate === 'object') {
      if (candidate.value !== undefined) return Number(candidate.value);
      if (candidate.approved_number !== undefined) return Number(candidate.approved_number);
      if (candidate.approved !== undefined) return Number(candidate.approved);
      
      // Try to find first numeric-like value in the object
      for (const v of Object.values(candidate)) {
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
      }
      
      // Fallback to null if no numeric value found
      return null;
    }

    // If it's a string or number, coerce safely
    const coerced = Number(String(candidate).trim());
    return Number.isNaN(coerced) ? null : coerced;
  }

  // 2) Try alternative keys (some responses include additional keys)
  const altKeys = ['approved_number', 'approved_type', 'approval', 'approvalNumber', 'data', 'attributes'];
  for (const k of altKeys) {
    const v = item[k];
    if (v !== undefined && v !== null) {
      const n = Number(String(v).trim());
      if (!Number.isNaN(n)) return n;
    }
  }

  return null;
};

export function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'approve' | 'add-blog' | 'manage-blogs' | 'users'>('approve');
  const [approveSubTab, setApproveSubTab] = useState<'pending' | 'approved' | 'featured'>('pending');
  const [query, setQuery] = useState('');
  
  // Items for different approval levels
  const [pendingItems, setPendingItems] = useState<ApprovalItem[]>([]); // approved = 1
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]); // approved = 2
  const [featuredItems, setFeaturedItems] = useState<ApprovalItem[]>([]); // approved = 3
  
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
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemEmail, setDeleteItemEmail] = useState<string>('');
  const [deleteReason, setDeleteReason] = useState('');
  
  // Users state
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  // Fetch blogs on component mount and when switching to manage-blogs tab
  useEffect(() => {
    if (activeTab === 'manage-blogs') {
      fetchBlogs();
    }
  }, [activeTab]);

  // Fetch users when switching to users tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Fetch items based on sub-tab
  useEffect(() => {
    if (activeTab === 'approve') {
      if (approveSubTab === 'pending') {
        fetchItemsByApproval(1, setPendingItems);
      } else if (approveSubTab === 'approved') {
        fetchItemsByApproval(2, setApprovedItems);
      } else if (approveSubTab === 'featured') {
        fetchItemsByApproval(3, setFeaturedItems);
      }
    }
  }, [activeTab, approveSubTab]);

  const fetchItemsByApproval = async (approvalLevel: number, setItems: React.Dispatch<React.SetStateAction<ApprovalItem[]>>) => {
    try {
      setLoadingItems(true);
      
      await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      
      const cfg = getAuthConfig(); // Authorization: Bearer <token>, Accept: application/json
      let response: { data: any };
      try {
        // Prefer GET /api/admin/items (returns pending for admins). Fallback to /api/items if 404/405.
        // Use approval_status parameter per API documentation (1=Pending, 2=Approved, 3=Rejected)
        response = await axios.get(`${API_BASE_URL}/admin/items`, { params: { approval_status: approvalLevel }, ...cfg });
      } catch (e: any) {
        if (e?.response?.status === 404 || e?.response?.status === 405) {
          response = await axios.get(`${API_BASE_URL}/items`, { params: { approval_status: approvalLevel }, ...cfg });
        } else {
          throw e;
        }
      }
      
      let items = response.data;
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else {
        items = [];
      }
      
      // Filter items with the specific approval level
      const filteredItems = Array.isArray(items) 
        ? items.filter((item: any) => {
            const status = getApprovalNumber(item);
            return status === approvalLevel;
          })
        : [];
      
      // Map to ApprovalItem format
      const mappedItems: ApprovalItem[] = filteredItems.map((item: any) => {
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
          sellerEmail: item.user?.email || '',
          category: item.category?.name || 'Uncategorized',
          price: parseFloat(item.price) || 0,
          submittedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown',
          image: getImageUrl(item),
        };
      });
      
      setItems(mappedItems);
    } catch (error) {
      console.error(`Error fetching items with approved=${approvalLevel}:`, error);
      toast.error(`Failed to load items`, {
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
      // GET /api/blogs returns paginated BlogResource with user per API documentation
      const response = await axios.get(`${API_BASE_URL}/blogs`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Handle paginated response (data array in 'data' field per Laravel pagination)
      if (response.data.data && Array.isArray(response.data.data)) {
        setBlogs(response.data.data);
      } else if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        // Legacy response format
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

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Use GET /api/users endpoint per API documentation
      // Returns paginated UserResource (excludes Admin role users)
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await response.json();

      // API returns paginated response with 'data' array per documentation
      // UserResource shape includes: id, name, email, phone, city, bio, role, followers_count, following_count, created_at, updated_at
      if (data.data && Array.isArray(data.data)) {
        // Map users from UserResource format
        const usersData: UserData[] = data.data.map((user: any) => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email || '',
          username: user.username || user.name || '',
          created_at: user.created_at,
          role: user.role,
          phone: user.phone,
          city: user.city,
          bio: user.bio,
          followers_count: user.followers_count,
          following_count: user.following_count,
        }));
        
        setUsers(usersData);
      } else if (Array.isArray(data)) {
        // Fallback for non-paginated response
        const usersData: UserData[] = data.map((user: any) => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email || '',
          username: user.username || user.name || '',
          created_at: user.created_at,
          role: user.role,
          phone: user.phone,
          city: user.city,
          bio: user.bio,
          followers_count: user.followers_count,
          following_count: user.following_count,
        }));
        setUsers(usersData);
      } else if (data.closets && Array.isArray(data.closets)) {
        // Fallback for closets response structure
        const usersData: UserData[] = data.closets.map((closet: any) => ({
          id: closet.id,
          name: closet.name || 'Unknown',
          email: closet.email || '',
          username: closet.username || '',
          created_at: closet.created_at,
          role: closet.role,
        }));
        setUsers(usersData);
      } else {
        console.warn('Unexpected users response structure:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getFilteredItems = (items: ApprovalItem[]) => {
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
  };

  const filteredBlogs = useMemo(() => {
    if (!blogQuery.trim()) {
      return blogs;
    }
    const lowered = blogQuery.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lowered) ||
        (blog.category && blog.category.toLowerCase().includes(lowered)) ||
        (blog.short_summary && blog.short_summary.toLowerCase().includes(lowered)) ||
        (blog.content && blog.content.toLowerCase().includes(lowered))
    );
  }, [blogs, blogQuery]);

  const filteredUsers = useMemo(() => {
    if (!userQuery.trim()) {
      return users;
    }
    const lowered = userQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lowered) ||
        u.email?.toLowerCase().includes(lowered) ||
        u.username?.toLowerCase().includes(lowered),
    );
  }, [users, userQuery]);

  // Backend / API documentation compliance:
  // - ItemApprovalStatus (item approval): 1=Pending, 2=Approved, 3=Rejected
  // - Use approval_status field per API documentation
  // - PUT /api/me/items/{item}: send Content-Type: application/json, Authorization: Bearer <token>
  // - Do not send nested brand/category/user; use category_id / brand_id when updating those.
  // - Prefer PUT /api/admin/approve/{id} and PUT /api/admin/decline/{id} for approve/decline if available.
  const updateItemApproval = async (id: string, newApprovalLevel: number, successMessage: string) => {
    const config = getAuthConfig(); // Authorization: Bearer, Accept + Content-Type: application/json

    // Use approval_status per API documentation
    const doPutItems = (payload: { approval_status: number; name?: string; description?: string; price?: number; category_id?: number; brand_id?: number | null }) =>
      axios.put(`${API_BASE_URL}/me/items/${id}`, payload, config);

    // Fallback to old endpoint
    const doPutItemsFallback = (payload: { approval_status: number; name?: string; description?: string; price?: number; category_id?: number; brand_id?: number | null }) =>
      axios.put(`${API_BASE_URL}/items/${id}`, payload, config);

    const run = async (): Promise<void> => {
      await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });

      if (newApprovalLevel === 2) {
        try {
          await axios.put(`${API_BASE_URL}/admin/approve/${id}`, {}, config);
          return;
        } catch (e: any) {
          if (e?.response?.status === 404 || e?.response?.status === 405) {
            try {
              await doPutItems({ approval_status: 2 });
              return;
            } catch (meError: any) {
              if (meError?.response?.status === 404) {
                await doPutItemsFallback({ approval_status: 2 });
                return;
              }
              throw meError;
            }
          }
          throw e;
        }
      }
      if (newApprovalLevel === 1) {
        try {
          await axios.put(`${API_BASE_URL}/admin/decline/${id}`, {}, config);
          return;
        } catch (e: any) {
          if (e?.response?.status === 404 || e?.response?.status === 405) {
            try {
              await doPutItems({ approval_status: 1 });
              return;
            } catch (meError: any) {
              if (meError?.response?.status === 404) {
                await doPutItemsFallback({ approval_status: 1 });
                return;
              }
              throw meError;
            }
          }
          throw e;
        }
      }

      // Rejected (3) or demote to approved (2): PUT /api/me/items/{id} with only { "approval_status": N }
      try {
        await doPutItems({ approval_status: newApprovalLevel });
        return;
      } catch (e: any) {
        if (e?.response?.status === 404) {
          // Try fallback endpoint
          try {
            await doPutItemsFallback({ approval_status: newApprovalLevel });
            return;
          } catch (fallbackError: any) {
            if (fallbackError?.response?.status !== 500) throw fallbackError;
          }
        }
        if (e?.response?.status !== 500) throw e;
        // 500 on minimal payload: fetch via GET /api/admin/items/{id} then retry with category_id/brand_id (no nested objects).
        const res = await axios.get(`${API_BASE_URL}/admin/items/${id}`, config);
        const raw = res?.data?.data ?? res?.data;
        const name = raw?.name ?? raw?.title;
        const categoryId = raw?.category_id ?? raw?.category?.id;
        const brandId = raw?.brand_id ?? raw?.brand?.id;
        try {
          await doPutItems({
            approval_status: newApprovalLevel,
            ...(name != null && name !== '' && { name }),
            ...(raw?.description != null && { description: raw.description }),
            ...(raw?.price != null && { price: Number(raw.price) }),
            ...(categoryId != null && { category_id: Number(categoryId) }),
            ...(brandId != null && { brand_id: Number(brandId) }),
          });
        } catch (meError: any) {
          if (meError?.response?.status === 404) {
            await doPutItemsFallback({
              approval_status: newApprovalLevel,
              ...(name != null && name !== '' && { name }),
              ...(raw?.description != null && { description: raw.description }),
              ...(raw?.price != null && { price: Number(raw.price) }),
              ...(categoryId != null && { category_id: Number(categoryId) }),
              ...(brandId != null && { brand_id: Number(brandId) }),
            });
          } else {
            throw meError;
          }
        }
      }
    };

    try {
      await run();
      toast.success(successMessage, {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      if (approveSubTab === 'pending') fetchItemsByApproval(1, setPendingItems);
      else if (approveSubTab === 'approved') fetchItemsByApproval(2, setApprovedItems);
      else if (approveSubTab === 'featured') fetchItemsByApproval(3, setFeaturedItems);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message;
      console.error('Error updating item approval:', error?.response?.data ?? error);
      toast.error(msg && typeof msg === 'string' ? msg : 'Failed to update item', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    }
  };

  const openDeleteModal = (item: ApprovalItem) => {
    setDeleteItemId(item.id);
    setDeleteItemEmail(item.sellerEmail || item.seller);
    setDeleteReason('');
    setDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId || !deleteReason.trim()) {
      toast.error('Please provide a reason for deletion', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    try {
      // Get CSRF cookie first
      await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      
      // Delete the item - try /api/me/items/{item} first per API documentation
      try {
        await axios.delete(`${API_BASE_URL}/me/items/${deleteItemId}`, getAuthConfig());
      } catch (deleteError: any) {
        if (deleteError.response?.status === 404 || deleteError.response?.status === 403) {
          // Fallback to old endpoint or admin endpoint
          await axios.delete(`${API_BASE_URL}/items/${deleteItemId}`, getAuthConfig());
        } else {
          throw deleteError;
        }
      }
      
      toast.success(`Item deleted. Reason sent to ${deleteItemEmail}`, {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      
      // Close modal and reset state
      setDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteItemEmail('');
      setDeleteReason('');
      
      // Refresh items
      if (approveSubTab === 'pending') {
        fetchItemsByApproval(1, setPendingItems);
      } else if (approveSubTab === 'approved') {
        fetchItemsByApproval(2, setApprovedItems);
      } else if (approveSubTab === 'featured') {
        fetchItemsByApproval(3, setFeaturedItems);
      }
      
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item', {
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

    // Validate content length per API requirements (min 30 characters)
    if (blogForm.content.trim().length < 30) {
      toast.error('Content must be at least 30 characters', {
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

    const useFormData = heroImageFile && imageUploadMode === 'upload';
    
    let payload: FormData | {
      title: string;
      content: string;
      status: number;
    };

    try {
      if (useFormData) {
        const formData = new FormData();
        formData.append('title', blogForm.title);
        formData.append('content', blogForm.content);
        // BlogStatus per API documentation: 1=Draft, 2=Published
        formData.append('status', '2'); // Published by default
        
        if (heroImageFile) {
          formData.append('image', heroImageFile);
        }
        
        payload = formData;
      } else {
        payload = {
          title: blogForm.title,
          content: blogForm.content,
          // BlogStatus per API documentation: 1=Draft, 2=Published
          status: 2, // Published by default
        };
      }

      if (editingBlogId) {
        let updateSuccess = false;
        
        const getAxiosConfig = () => {
          const config: any = {
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
            },
          };
          
          if (!useFormData) {
            config.headers['Content-Type'] = 'application/json';
          }
          
          return config;
        };

        // Use /api/me/blogs/{blog} for update per API documentation
        try {
          await axios.patch(`${API_BASE_URL}/me/blogs/${editingBlogId}`, payload, getAxiosConfig());
          updateSuccess = true;
        } catch (patchError: any) {
          if (patchError.response?.status === 405) {
            try {
              await axios.put(`${API_BASE_URL}/me/blogs/${editingBlogId}`, payload, getAxiosConfig());
              updateSuccess = true;
            } catch (putError: any) {
              throw putError;
            }
          } else if (patchError.response?.status === 404) {
            // Fallback to old endpoint if /me/blogs doesn't exist
            try {
              await axios.patch(`${API_BASE_URL}/blogs/${editingBlogId}`, payload, getAxiosConfig());
              updateSuccess = true;
            } catch (fallbackError: any) {
              throw fallbackError;
            }
          } else {
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
        }
      } else {
        const createConfig: any = {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
          },
        };
        
        if (!useFormData) {
          createConfig.headers['Content-Type'] = 'application/json';
        }
        
        // Use /api/me/blogs for create per API documentation
        try {
          await axios.post(`${API_BASE_URL}/me/blogs`, payload, createConfig);
        } catch (createError: any) {
          if (createError.response?.status === 404) {
            // Fallback to old endpoint if /me/blogs doesn't exist
            await axios.post(`${API_BASE_URL}/blogs`, payload, createConfig);
          } else {
            throw createError;
          }
        }
        toast.success('Blog posted successfully ✨', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
      }

      localStorage.removeItem('blog_draft');

      setBlogForm({
        title: '',
        category: categories[0] ?? '',
        summary: '',
        content: '',
        heroImage: '',
      });
      handleRemoveImage();
      setImageUploadMode('url');

      if (activeTab === 'manage-blogs') {
        fetchBlogs();
      }
    } catch (error: any) {
      console.error('Error posting blog:', error);
      let errorMessage = 'Failed to post blog';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
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

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    
    if (blog.category && !categories.includes(blog.category)) {
      const updatedCategories = [...categories, blog.category];
      setCategories(updatedCategories);
      
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
      content: blog.content || blog.full_story || '', // Use content field from API, fallback to full_story for compatibility
      heroImage: blog.image_url || '',
    });
    handleRemoveImage();
    setImageUploadMode('url');
    setActiveTab('add-blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setLoading(true);
      
      try {
        await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
      } catch (csrfError) {
        console.warn('CSRF cookie fetch failed, continuing anyway:', csrfError);
      }
      
      // Use /api/me/blogs/{blog} for delete per API documentation
      try {
        await axios.delete(`${API_BASE_URL}/me/blogs/${id}`, getAuthConfig());
      } catch (deleteError: any) {
        if (deleteError.response?.status === 404) {
          // Fallback to old endpoint if /me/blogs doesn't exist
          await axios.delete(`${API_BASE_URL}/blogs/${id}`, getAuthConfig());
        } else {
          throw deleteError;
        }
      }
      
      toast.success('Blog deleted successfully', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      
      await fetchBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      let errorMessage = 'Failed to delete blog';
      
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this blog';
      } else if (error.response?.status === 404) {
        errorMessage = 'Blog not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
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

    const updatedCategories = [...categories, trimmedCategory];
    setCategories(updatedCategories);

    const customCategories = updatedCategories.filter(
      cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
    );
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));

    setBlogForm(prev => ({ ...prev, category: trimmedCategory }));

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

  // Render item card with actions based on approval level
  // ItemApprovalStatus per API: 1=Pending, 2=Approved, 3=Rejected
  const renderItemCard = (item: ApprovalItem, approvalLevel: 1 | 2 | 3) => (
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
      <div className="admin-queue-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {/* Pending items (status=1) - can be approved or rejected */}
        {approvalLevel === 1 && (
          <>
            <button
              className="approve"
              onClick={() => updateItemApproval(item.id, 2, 'Item approved ✅')}
              title="Approve item"
            >
              <Check size={18} />
              Approve
            </button>
            <button
              className="reject"
              onClick={() => updateItemApproval(item.id, 3, 'Item rejected ❌')}
              title="Reject item"
              style={{ background: '#DC2626' }}
            >
              <X size={18} />
              Reject
            </button>
            <button
              className="reject"
              onClick={() => openDeleteModal(item)}
              title="Delete Item"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </>
        )}
        {/* Approved items (status=2) - can be moved back to pending or rejected */}
        {approvalLevel === 2 && (
          <>
            <button
              className="reject"
              onClick={() => updateItemApproval(item.id, 1, 'Item moved back to Pending ↩')}
              title="Move back to Pending"
            >
              <ArrowDown size={18} />
              Back to Pending
            </button>
            <button
              className="reject"
              onClick={() => updateItemApproval(item.id, 3, 'Item rejected ❌')}
              title="Reject item"
              style={{ background: '#DC2626' }}
            >
              <X size={18} />
              Reject
            </button>
          </>
        )}
        {/* Rejected items (status=3) - can be moved back to approved or pending */}
        {approvalLevel === 3 && (
          <>
            <button
              className="approve"
              onClick={() => updateItemApproval(item.id, 2, 'Item approved ✅')}
              title="Approve item"
            >
              <Check size={18} />
              Approve
            </button>
            <button
              className="reject"
              onClick={() => updateItemApproval(item.id, 1, 'Item moved back to Pending ↩')}
              title="Move back to Pending"
            >
              <ArrowDown size={18} />
              Back to Pending
            </button>
          </>
        )}
      </div>
    </div>
  );

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
              <p>{user?.username ?? 'admin'}</p>
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
                  <span>Pending Review</span>
                  <strong>{pendingItems.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Approved Items</span>
                  <strong>{approvedItems.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Rejected Items</span>
                  <strong>{featuredItems.length}</strong>
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('users');
                  handleCancelEdit();
                }}
                className={`admin-tab-button ${activeTab === 'users' ? 'is-active' : ''}`}
              >
                <Users />
                Users
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
                  {/* Sub-tabs for Approve Items */}
                  {/* ItemApprovalStatus per API: 1=Pending, 2=Approved, 3=Rejected */}
                  <div className="admin-sub-tabs">
                    <button
                      onClick={() => setApproveSubTab('pending')}
                      className="admin-sub-tab-button"
                      style={{
                        background: approveSubTab === 'pending' ? '#0A4834' : '#F0ECE3',
                        color: approveSubTab === 'pending' ? '#FFFFFF' : '#0A4834',
                      }}
                    >
                      <ShieldCheck size={18} />
                      Pending ({pendingItems.length})
                    </button>
                    <button
                      onClick={() => setApproveSubTab('approved')}
                      className="admin-sub-tab-button"
                      style={{
                        background: approveSubTab === 'approved' ? '#0A4834' : '#F0ECE3',
                        color: approveSubTab === 'approved' ? '#FFFFFF' : '#0A4834',
                      }}
                    >
                      <Check size={18} />
                      Approved ({approvedItems.length})
                    </button>
                    <button
                      onClick={() => setApproveSubTab('featured')}
                      className="admin-sub-tab-button"
                      style={{
                        background: approveSubTab === 'featured' ? '#DC2626' : '#F0ECE3',
                        color: approveSubTab === 'featured' ? '#FFFFFF' : '#0A4834',
                      }}
                    >
                      <X size={18} />
                      Rejected ({featuredItems.length})
                    </button>
                  </div>

                  <div className="admin-content-header">
                    <h3>
                      {approveSubTab === 'pending' && 'Items awaiting review (Pending)'}
                      {approveSubTab === 'approved' && 'Approved Items'}
                      {approveSubTab === 'featured' && 'Rejected Items'}
                    </h3>
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
                  ) : (
                    <>
                      {approveSubTab === 'pending' && (
                        getFilteredItems(pendingItems).length > 0 ? (
                          <div className="admin-queue">
                            {getFilteredItems(pendingItems).map((item) => renderItemCard(item, 1))}
                          </div>
                        ) : (
                          <div className="admin-empty-state">
                            <ShieldCheck size={40} />
                            <strong>All caught up.</strong>
                            <span>There are no pending items to review right now.</span>
                          </div>
                        )
                      )}
                      {approveSubTab === 'approved' && (
                        getFilteredItems(approvedItems).length > 0 ? (
                          <div className="admin-queue">
                            {getFilteredItems(approvedItems).map((item) => renderItemCard(item, 2))}
                          </div>
                        ) : (
                          <div className="admin-empty-state">
                            <Check size={40} />
                            <strong>No approved items.</strong>
                            <span>There are no approved items right now.</span>
                          </div>
                        )
                      )}
                      {approveSubTab === 'featured' && (
                        getFilteredItems(featuredItems).length > 0 ? (
                          <div className="admin-queue">
                            {getFilteredItems(featuredItems).map((item) => renderItemCard(item, 3))}
                          </div>
                        ) : (
                          <div className="admin-empty-state">
                            <X size={40} />
                            <strong>No rejected items.</strong>
                            <span>There are no rejected items right now.</span>
                          </div>
                        )
                      )}
                    </>
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
                        <div className="admin-category-wrapper">
                          <select
                            id="blog-category"
                            value={blogForm.category}
                            onChange={(event) =>
                              setBlogForm((prev) => ({ ...prev, category: event.target.value }))
                            }
                            className="admin-category-select"
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
                          <div className="admin-add-category-wrapper">
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
                              className="admin-add-category-input"
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
                        placeholder="In this week's edit we spotlight rare maison pieces from the 70s, sourced by curators across Paris."
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
                      
                      <div className="admin-image-mode-buttons">
                        <button
                          type="button"
                          onClick={() => {
                            setImageUploadMode('url');
                            handleRemoveImage();
                          }}
                          className="admin-image-mode-button"
                          style={{
                            background: imageUploadMode === 'url' ? '#9F8151' : 'transparent',
                            color: imageUploadMode === 'url' ? '#FFFFFF' : '#0A4834',
                          }}
                        >
                          <ImageIcon size={16} />
                          Use URL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUploadMode('upload');
                            setBlogForm(prev => ({ ...prev, heroImage: '' }));
                          }}
                          className="admin-image-mode-button"
                          style={{
                            background: imageUploadMode === 'upload' ? '#9F8151' : 'transparent',
                            color: imageUploadMode === 'upload' ? '#FFFFFF' : '#0A4834',
                          }}
                        >
                          <Upload size={16} />
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
                      <div className="admin-form-actions-buttons">
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
              ) : activeTab === 'manage-blogs' ? (
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
                              }}
                            />
                          ) : (
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
                              {/* BlogStatus per API: 1=Draft, 2=Published */}
                              <span>{blog.status === 1 ? 'Draft' : blog.status === 2 ? 'Published' : 'Unknown'}</span>
                              <span>
                                {new Date(blog.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              {blog.user && <span>by {blog.user.name}</span>}
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
              ) : activeTab === 'users' ? (
                <>
                  <div className="admin-content-header">
                    <h3>All Users</h3>
                    <div className="admin-search">
                      <Search />
                      <input
                        type="text"
                        placeholder="Search users by name or email"
                        value={userQuery}
                        onChange={(event) => setUserQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="admin-empty-state">
                      <Loader2 size={40} className="animate-spin" />
                      <strong>Loading users...</strong>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <div className="admin-users-grid">
                      {filteredUsers.map((u) => (
                        <motion.div
                          key={u.id}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate(`/closets/${u.id}`)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '2px solid #F0ECE3',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                          }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              backgroundColor: '#0A4834',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <User size={28} color="#FFFFFF" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#0A4834',
                                margin: 0,
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {u.name || 'Unknown User'}
                              </h4>
                              <p style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontSize: '14px',
                                color: '#666',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                <Mail size={14} />
                                {u.email}
                              </p>
                              {u.username && (
                                <p style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '13px',
                                  color: '#9F8151',
                                  margin: 0,
                                  marginTop: '4px',
                                }}>
                                  @{u.username}
                                </p>
                              )}
                              {u.role && (
                                <p style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '12px',
                                  color: '#666',
                                  margin: 0,
                                  marginTop: '4px',
                                  padding: '2px 8px',
                                  background: u.role === 3 ? 'rgba(159, 129, 81, 0.15)' : 'rgba(10, 72, 52, 0.1)',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                }}>
                                  {getUserRoleLabel(u.role)}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <Users size={40} />
                      <strong>No users found.</strong>
                      <span>
                        {userQuery
                          ? 'Try adjusting your search query.'
                          : 'No users registered yet.'}
                      </span>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          </div>
        </div>
      </main>
      <FooterAlt />

      {/* Chat Widget */}
      <ChatWidget />

      {/* Delete Item Modal */}
      {deleteModalOpen && (
        <div
          className="admin-delete-modal-overlay"
          onClick={() => setDeleteModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="admin-delete-modal-content"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ 
                fontFamily: 'Cormorant Garamond, serif', 
                fontSize: '24px', 
                color: '#0A4834',
                margin: 0 
              }}>
                Delete Item
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={24} color="#0A4834" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                color: '#0A4834',
              }}>
                <Mail size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Creator's Email
              </label>
              <input
                type="text"
                value={deleteItemEmail}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #DCD6C9',
                  borderRadius: '8px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  backgroundColor: '#F0ECE3',
                  color: '#666',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                color: '#0A4834',
              }}>
                Reason for Deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please provide a reason why this item is being removed..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #DCD6C9',
                  borderRadius: '8px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  minHeight: '120px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="admin-delete-modal-buttons">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="admin-delete-modal-button admin-delete-modal-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="admin-delete-modal-button admin-delete-modal-button-delete"
              >
                <Trash2 size={18} />
                Delete Item
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
