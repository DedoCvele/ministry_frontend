import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../api/apiClient';
import { 
  Camera, 
  Settings, 
  MapPin, 
  Heart, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  Eye,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  Star,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  LogOut
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { ChatWidget } from './ChatWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { EditProfileModal } from './EditProfileModal';
import './styles/ProfilePage.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_ROOT = `${API_BASE_URL}/api`;
const BACKEND_BASE_URL = API_BASE_URL;

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const getXsrfHeader = () => {
  const token = getCookieValue('XSRF-TOKEN');
  return token ? { 'X-XSRF-TOKEN': token } : {};
};

const extractUserData = (responseData: any) => {
  return responseData?.user || responseData?.data || responseData;
};

const isSvgMarkup = (value?: string) => {
  return typeof value === 'string' && value.trim().startsWith('<svg');
};

const resolveAvatarForModal = (avatar?: string) => {
  if (!avatar) {
    return '';
  }

  if (avatar.startsWith('#') || defaultAvatarSvgs[avatar]) {
    return avatar;
  }

  if (avatar.startsWith('data:image/svg+xml,')) {
    try {
      const svg = decodeURIComponent(avatar.slice('data:image/svg+xml,'.length));
      const match = Object.entries(defaultAvatarSvgs).find(([, s]) => s === svg);
      return match ? match[0] : avatar;
    } catch {
      return avatar;
    }
  }

  if (isSvgMarkup(avatar)) {
    const match = Object.entries(defaultAvatarSvgs).find(([, svg]) => svg === avatar);
    return match ? match[0] : avatar;
  }

  return avatar;
};

// Default avatar SVGs (matching EditProfileModal)
const defaultAvatarSvgs: Record<string, string> = {
  'avatar1': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#F0ECE3"/>
    <circle cx="50" cy="35" r="12" fill="#0A4834"/>
    <path d="M 20 70 Q 50 50 80 70" stroke="#0A4834" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
  'avatar2': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#DCD6C9"/>
    <circle cx="50" cy="35" r="12" fill="#9F8151"/>
    <ellipse cx="50" cy="70" rx="20" ry="15" fill="#0A4834"/>
  </svg>`,
  'avatar3': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#9F8151"/>
    <circle cx="50" cy="35" r="12" fill="#FFFFFF"/>
    <path d="M 25 75 Q 50 55 75 75" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
  'avatar4': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0A4834"/>
    <circle cx="50" cy="35" r="12" fill="#F0ECE3"/>
    <ellipse cx="50" cy="70" rx="20" ry="15" fill="#9F8151"/>
  </svg>`,
  'avatar5': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#3B7059"/>
    <circle cx="50" cy="35" r="12" fill="#DCD6C9"/>
    <path d="M 20 70 Q 50 50 80 70" stroke="#DCD6C9" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
};

interface ProfilePageProps {
  isSeller?: boolean;
  onClose?: () => void;
  onUploadClick?: () => void;
}

interface UserData {
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  memberSince: string;
}

interface Order {
  id: number;
  name: string;
  price: number;
  seller: string;
  image: string;
  status: string;
  date: string;
}

interface FavouriteItem {
  id: number;
  type: 'item' | 'closet';
  name: string;
  price?: number;
  seller?: string;
  image?: string;
  username?: string;
  styleTag?: string;
  coverImage?: string;
}

interface ClosetItem {
  id: number;
  name: string;
  price: number;
  image: string;
  views: number;
  saves: number;
  messages: number;
}

interface Sale {
  id: number;
  item: string;
  buyer: string;
  price: number;
  status: string;
  date: string;
}

interface AnalyticsDataPoint {
  week: string;
  views: number;
}

interface Stats {
  totalSales: number;
  itemsSold: number;
  avgRating: number;
  followers: number;
  followerGrowth: number;
}

export function ProfilePage({ isSeller = false, onClose, onUploadClick }: ProfilePageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const [userId, setUserId] = useState<number>(1); // Will be updated from API
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [mostRecentItem, setMostRecentItem] = useState<ClosetItem | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data and get user_id from API
  useEffect(() => {
    setLoading(true);
    
    // Try multiple endpoints to get user data
    const tryUserEndpoints = async () => {
      const endpoints = [
        `${API_ROOT}/profile`, // Authenticated user's profile (preferred)
        `${API_ROOT}/user`, // Authenticated user's profile (legacy)
        `${API_ROOT}/users/1`, // Fallback
      ];

      for (const endpoint of endpoints) {
        try {
          const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
          const res = await axios.get(endpoint, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : undefined,
              'Accept': 'application/json',
            },
            withCredentials: true,
          });
          const userData = res.data?.user || res.data?.data || res.data;
          
          if (userData) {
            // Extract user_id from response
            if (userData.id) {
              setUserId(userData.id);
            }
            
            // Set user data
            setUser({
              name: userData.name || `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() || authUser?.username || 'User',
              username: userData.username || `@${userData.email?.split('@')[0] || authUser?.username || 'user'}`,
              bio: userData.bio || t.profile.welcomeToMyProfile,
              location: userData.city || '',
              avatar: userData.profile_picture_url || userData.profile_picture || userData.avatar || userData.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjE1ODE1MTl8MA&ixlib=rb-4.1.0&q=80&w=400',
              memberSince: userData.created_at 
                ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            });
            setLoading(false);
            return;
          }
        } catch (err: any) {
          if (endpoint === endpoints[endpoints.length - 1]) {
            // Last endpoint failed, use fallback
            console.error('Error loading user from all endpoints:', err);
            if (authUser) {
              // Map username to user_id (adjust based on your database)
              const userMap: Record<string, number> = {
                'sofi@sofi': 2, // Will be updated when we get real data
                'user@example': 1,
              };
              const mappedUserId = userMap[authUser.username] || 1;
              setUserId(mappedUserId);
              
              setUser({
                name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.username,
                username: `@${authUser.username}`,
                bio: t.profile.welcomeToMyProfile,
                location: '',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjE1ODE1MTl8MA&ixlib=rb-4.1.0&q=80&w=400',
                memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              });
            }
            setLoading(false);
          }
        }
      }
    };

    tryUserEndpoints();
  }, [authUser]);

  // Helper function to get image URL from item (handles different API response formats)
  const getItemImageUrl = (item: any): string => {
    if (!item) return '';
    
    // If item has images array, get first image
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('http') ? firstImage : `${BACKEND_BASE_URL}/${firstImage.replace(/^\//, '')}`;
      }
      if (typeof firstImage === 'object' && firstImage !== null) {
        const url = firstImage.url || firstImage.image_url || firstImage.path || firstImage.image;
        if (url) {
          if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
            return url;
          }
          const cleanPath = url.startsWith('/') ? url.substring(1) : url;
          if (cleanPath.startsWith('storage/')) {
            return `${BACKEND_BASE_URL}/${cleanPath}`;
          }
          return `${BACKEND_BASE_URL}/storage/${cleanPath}`;
        }
      }
    }
    
    // Try direct image fields
    if (item.image_url) {
      return item.image_url.startsWith('http') ? item.image_url : `${BACKEND_BASE_URL}/${item.image_url.replace(/^\//, '')}`;
    }
    if (item.image) {
      if (typeof item.image === 'string') {
        return item.image.startsWith('http') ? item.image : `${BACKEND_BASE_URL}/${item.image.replace(/^\//, '')}`;
      }
    }
    
    return '';
  };

  // Load user orders - DISABLED: Orders are not displayed in the UI, so no need to fetch them
  // useEffect(() => {
  //   // Try multiple endpoint variations
  //   const endpoints = [
  //     `${API_ROOT}/users/${userId}/orders`,
  //     `${API_ROOT}/profile/orders`,
  //     `${API_ROOT}/orders?user_id=${userId}`,
  //     `${API_ROOT}/orders`,
  //   ];

  //   const tryEndpoint = async (index = 0) => {
  //     if (index >= endpoints.length) {
  //       console.warn('No orders endpoint found, using empty array');
  //       setOrders([]);
  //       return;
  //     }

  //     try {
  //       const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
  //       const res = await axios.get(endpoints[index], {
  //         headers: {
  //           'Authorization': token ? `Bearer ${token}` : undefined,
  //           'Accept': 'application/json',
  //         },
  //         withCredentials: true,
  //       });
  //       const data = res.data?.orders || res.data?.data || res.data || [];
  //       if (Array.isArray(data) && data.length > 0) {
  //         // Filter by user_id if needed
  //         const filtered = data.filter((order: any) => 
  //           order.user_id === userId || order.userId === userId || !order.user_id
  //         );
  //         setOrders(filtered);
  //         console.log('Orders loaded:', filtered);
  //       } else if (Array.isArray(data)) {
  //         setOrders(data);
  //       } else {
  //         tryEndpoint(index + 1);
  //       }
  //     } catch (err: any) {
  //       if (err.response?.status === 404 || err.response?.status === 500) {
  //         tryEndpoint(index + 1);
  //       } else {
  //         console.error(`Error loading orders from ${endpoints[index]}:`, err);
  //         tryEndpoint(index + 1);
  //       }
  //     }
  //   };

  //   tryEndpoint();
  // }, [userId]);

  // Load favourites from API
  const loadFavorites = async () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    console.log('📥 Loading favorites, token:', token ? 'exists' : 'missing');
    
    if (!token) {
      setFavourites([]);
      return;
    }

    try {
      const url = `${API_ROOT}/me/favourites`;
      console.log('📡 Fetching favorites from:', url);
      
      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      console.log('✅ Favorites API response:', res.data);
      
      const data = res.data?.favorites || res.data?.favourites || res.data?.data || [];
      if (Array.isArray(data)) {
        // Map API response to FavouriteItem format
        const mappedFavorites: FavouriteItem[] = data.map((item: any) => ({
          id: item.id,
          type: 'item' as const,
          name: item.title || item.name || 'Item',
          price: item.price || 0,
          seller: item.user?.name || item.seller || 'Unknown Seller',
          image: getItemImageUrl(item),
        }));
        setFavourites(mappedFavorites);
        console.log('✅ Favourites loaded:', mappedFavorites);
      } else {
        console.log('⚠️ No favorites array in response');
        setFavourites([]);
      }
    } catch (err: any) {
      console.error('❌ Error loading favourites:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setFavourites([]);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  // Remove item from favorites
  const removeFavorite = async (itemId: number) => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    console.log('🗑️ Removing favorite, itemId:', itemId);
    if (!token) return;

    try {
      await apiClient.delete(`/me/favourites/${itemId}`);
      console.log('✅ Favorite removed');
      // Reload favorites after removal
      loadFavorites();
    } catch (err: any) {
      console.error('❌ Error removing favorite:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  // Load closet items - use /api/me/items
  useEffect(() => {
    // Always load items for the user (for overview and closet tabs)
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    apiClient.get('/me/items')
      .then(res => {
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          // Map items to ClosetItem format
          const mappedItems: ClosetItem[] = data.map((item: any) => ({
            id: item.id,
            name: item.title || item.name || 'Item',
            price: item.price || 0,
            image: getItemImageUrl(item),
            views: item.views || 0,
            saves: item.favorites_count || item.saves || item.likes || 0,
            messages: item.messages || 0,
          }));
          // Sort by created_at to get most recent first
          const sortedItems = mappedItems.sort((a: any, b: any) => {
            const originalA = data.find((i: any) => i.id === a.id);
            const originalB = data.find((i: any) => i.id === b.id);
            const dateA = new Date(originalA?.created_at || originalA?.createdAt || 0).getTime();
            const dateB = new Date(originalB?.created_at || originalB?.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setCloset(sortedItems);
          // Set most recent item (first in sorted array)
          if (sortedItems.length > 0) {
            setMostRecentItem(sortedItems[0]);
          } else {
            setMostRecentItem(null);
          }
          console.log('Closet items loaded:', sortedItems);
        } else {
          setCloset([]);
          setMostRecentItem(null);
        }
      })
      .catch(err => {
        console.error('Error loading closet items:', err);
        setCloset([]);
        setMostRecentItem(null);
      });
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return '#3B7059';
      case 'Shipped':
      case 'Pending':
        return '#9F8151';
      case 'Dispute':
        return '#B75C5C';
      default:
        return '#9F8151';
    }
  };

  const isValidHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value.trim());
  const isSvgDataUri = (value: string) => {
    const trimmed = value.trim();
    return trimmed.startsWith('data:image/svg+xml');
  };
  const isSvgMarkupOrDataUri = (value: string) => isSvgMarkup(value) || isSvgDataUri(value);

  const handleSaveProfile = async (bio: string, profilePicture: string | File | null | undefined) => {
    try {
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      
      try {
        await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
      } catch (csrfError) {
        console.warn('Could not refresh CSRF cookie:', csrfError);
      }

      if (!token) {
        console.error('No authentication token found');
      }

      const xsrfHeader = getXsrfHeader();
      const refreshUserProfile = async () => {
        const endpoints = [
          `${API_ROOT}/profile`,
          `${API_ROOT}/user`,
        ];

        for (const endpoint of endpoints) {
          try {
            const userResponse = await axios.get(endpoint, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : undefined,
                'Accept': 'application/json',
                ...xsrfHeader,
              },
              withCredentials: true,
            });
            return extractUserData(userResponse.data);
          } catch (refreshError: any) {
            const status = refreshError?.response?.status;
            if (status === 404 || status === 405) {
              continue;
            }
            throw refreshError;
          }
        }

        return null;
      };

      // Handle file upload (avatar image) or JSON request (bio and/or color)
      let response;
      const updateEndpoint = `${API_ROOT}/me`;
      
      if (profilePicture instanceof File) {
        if (!profilePicture.type || !profilePicture.type.includes('svg')) {
          alert('Profile picture must be an SVG file.');
          return;
        }
        // Upload avatar image file
        const formData = new FormData();
        formData.append('profile_picture', profilePicture);
        if (bio !== undefined && bio !== null) {
          formData.append('bio', bio);
        }

        response = await axios.patch(updateEndpoint, formData, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Accept': 'application/json',
            ...xsrfHeader,
            // Don't set Content-Type for FormData - browser will set it with boundary
          },
          withCredentials: true,
        });
      } else {
        // PATCH /api/me: "profile_picture" = hex or SVG (markup or data URI)
        const payload: Record<string, unknown> = {};
        if (bio !== undefined && bio !== null) {
          payload.bio = bio; // allow any length including empty
        }
        if (profilePicture !== undefined) {
          if (
            profilePicture !== null &&
            typeof profilePicture === 'string' &&
            !isValidHexColor(profilePicture) &&
            !isSvgMarkupOrDataUri(profilePicture)
          ) {
            alert('Profile picture must be a hex color or SVG.');
            return;
          }
          payload.profile_picture = profilePicture; // hex, inline SVG string, or null to clear
        }
        if (Object.keys(payload).length === 0) {
          return; // nothing to update
        }

        response = await axios.patch(updateEndpoint, payload, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...xsrfHeader,
          },
          withCredentials: true,
        });
      }

      // Reload user data from API
      const userData = await refreshUserProfile();
      if (userData) {
        setUser({
          name: userData.name || user?.name || '',
          username: userData.username || `@${userData.email?.split('@')[0] || ''}` || user?.username || '',
          bio: userData.bio || '',
          location: userData.city || userData.location || user?.location || '',
          avatar: userData.profile_picture_url || userData.profile_picture || user?.avatar || '',
          memberSince: user?.memberSince || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      }

      console.log('Profile updated successfully:', response.data);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error?.response?.status === 500) {
        try {
          const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
          const xsrfHeader = getXsrfHeader();
          const userResponse = await axios.get(`${API_ROOT}/user`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : undefined,
              'Accept': 'application/json',
              ...xsrfHeader,
            },
            withCredentials: true,
          });
          const userData = extractUserData(userResponse.data);
          if (userData) {
            setUser({
              name: userData.name || user?.name || '',
              username: userData.username || `@${userData.email?.split('@')[0] || ''}` || user?.username || '',
              bio: userData.bio || '',
              location: userData.city || userData.location || user?.location || '',
              avatar: userData.profile_picture_url || userData.profile_picture || user?.avatar || '',
              memberSince: user?.memberSince || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            });
            alert('Profile update may have succeeded, but the server returned an error. Please refresh if changes do not appear.');
            return;
          }
        } catch (refreshError) {
          console.warn('Failed to refresh profile after 500 error:', refreshError);
        }
      }

      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
        return;
      }
      alert('Failed to update profile. Please try again.');
    }
  };

  // Show loading state
  if (loading && !user) {
    return (
      <div style={{
        backgroundColor: '#F0ECE3',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <HeaderAlt />
        <div style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '18px',
          color: '#9F8151',
        }}>
          {t.profile.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Grain Texture */}
      <div className="profile-page-grain" />

      {/* Header */}
      <HeaderAlt />

      {/* Profile Summary Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-summary-panel"
      >
        <div className="profile-summary-content">
          {/* Profile Photo */}
          <div className="profile-avatar-container">
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                border: '3px solid #FFFFFF',
                backgroundColor: user?.avatar?.startsWith('#') ? user.avatar : 'transparent',
              }}
            >
              {user?.avatar?.startsWith('#') ? (
                // Color-based avatar
                <div style={{ width: '100%', height: '100%', backgroundColor: user.avatar }} />
              ) : isSvgMarkup(user?.avatar) ? (
                <div
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{ __html: user?.avatar || '' }}
                />
              ) : user?.avatar && defaultAvatarSvgs[user.avatar] ? (
                // Default SVG avatar (legacy support)
                <div 
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{ __html: defaultAvatarSvgs[user.avatar] }}
                />
              ) : (
                // Image-based avatar (URL or storage path)
                <ImageWithFallback
                  src={
                    user?.avatar?.startsWith('http://') || user?.avatar?.startsWith('https://')
                      ? user.avatar // Full URL
                      : user?.avatar?.startsWith('storage/') || user?.avatar?.startsWith('/storage/')
                      ? `${BACKEND_BASE_URL}/${user.avatar.replace(/^\//, '')}` // Storage path
                      : user?.avatar || '' // Fallback
                  }
                  alt={user?.name || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#9F8151' }}
              onClick={() => setEditProfileModalOpen(true)}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#0A4834',
                border: '3px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <Camera size={16} color="#FFFFFF" />
            </motion.button>
          </div>

          {/* Profile Info */}
          <div className="profile-info-section">
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#0A4834',
              margin: '0 0 4px 0',
            }}>
              {user?.name || authUser?.username || 'User'}
            </h1>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#9F8151',
              margin: '0 0 12px 0',
            }}>
              {user?.username || (authUser ? `@${authUser.username}` : '@user')}
            </p>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#666',
              margin: '0 0 8px 0',
              lineHeight: '24px',
            }}>
              {user?.bio || t.profile.welcomeToMyProfile}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              color: '#999',
            }}>
              <MapPin size={14} />
              {user?.location || t.profile.locationNotSet}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {isSeller && onUploadClick && (
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0px 8px 24px rgba(159,129,81,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadClick}
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#9F8151',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0px 4px 12px rgba(159,129,81,0.2)',
                }}
              >
                <Plus size={20} />
                {t.profile.listNewItem}
              </motion.button>
            )}
            <motion.button
              whileHover={{ borderColor: '#9F8151', color: '#9F8151' }}
              onClick={() => setEditProfileModalOpen(true)}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#0A4834',
                backgroundColor: 'transparent',
                border: '2px solid #DCD6C9',
                borderRadius: '12px',
                padding: '12px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {t.profile.editProfile}
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: 'rgba(159,129,81,0.1)' }}
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                border: '2px solid #DCD6C9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <Settings size={20} color="#0A4834" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-container">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="profile-tabs-navigation" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
            display: 'flex',
            gap: '8px',
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('overview')}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'overview' ? '#0A4834' : 'transparent',
                color: activeTab === 'overview' ? '#FFFFFF' : '#0A4834',
                transition: 'all 0.3s ease',
              }}
            >
              {t.profile.overview}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('myitems')}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'myitems' ? '#0A4834' : 'transparent',
                color: activeTab === 'myitems' ? '#FFFFFF' : '#0A4834',
                transition: 'all 0.3s ease',
              }}
            >
              {t.profile.myItems}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('favourites')}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'favourites' ? '#0A4834' : 'transparent',
                color: activeTab === 'favourites' ? '#FFFFFF' : '#0A4834',
                transition: 'all 0.3s ease',
              }}
            >
              {t.profile.favorites}
            </motion.button>
            {isSeller && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('mycloset')}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'mycloset' ? '#0A4834' : 'transparent',
                    color: activeTab === 'mycloset' ? '#FFFFFF' : '#0A4834',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t.profile.myCloset}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('sales')}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'sales' ? '#0A4834' : 'transparent',
                    color: activeTab === 'sales' ? '#FFFFFF' : '#0A4834',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t.profile.sales}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'analytics' ? '#0A4834' : 'transparent',
                    color: activeTab === 'analytics' ? '#FFFFFF' : '#0A4834',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t.profile.analytics}
                </motion.button>
              </>
            )}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="profile-tab-content">
            <div className={isSeller ? 'profile-overview-grid-seller' : 'profile-overview-grid'}>
              {isSeller ? (
                <>
                  {/* Buying Summary */}
                  <div>
                    <h2 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 24px 0',
                    }}>
                      {t.profile.shoppingActivity}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Most Recent Upload Card */}
                      {mostRecentItem && (
                        <motion.div
                          whileHover={{ y: -4 }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px',
                          }}>
                            <h3 style={{
                              fontFamily: 'Cormorant Garamond, serif',
                              fontSize: '20px',
                              fontWeight: 600,
                              color: '#0A4834',
                              margin: 0,
                            }}>
                              {t.profile.mostRecentUpload}
                            </h3>
                            <Package size={20} color="#9F8151" />
                          </div>
                          <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '12px',
                          }}>
                            <ImageWithFallback
                              src={getItemImageUrl(mostRecentItem)}
                              alt={mostRecentItem.name || mostRecentItem.title || 'Item'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <h4 style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#0A4834',
                            margin: '0 0 4px 0',
                          }}>
                            {mostRecentItem.name || mostRecentItem.title || 'Item'}
                          </h4>
                          <p style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#9F8151',
                            margin: 0,
                          }}>
                            €{mostRecentItem.price}
                          </p>
                        </motion.div>
                      )}

                      {/* Favorites Card */}
                      <motion.div
                        whileHover={{ y: -4 }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          padding: '24px',
                          boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                        }}>
                          <h3 style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#0A4834',
                            margin: 0,
                          }}>
                            {t.profile.favorites}
                          </h3>
                          <Heart size={20} color="#9F8151" fill="#9F8151" />
                        </div>
                        <div className="profile-favorites-grid">
                          {(Array.isArray(favourites) ? favourites : []).slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                              }}
                            >
                              <ImageWithFallback
                                src={item.type === 'item' ? item.image : item.coverImage}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              {item.type === 'closet' && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '6px',
                                  right: '6px',
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  borderRadius: '50%',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Users size={12} color="#9F8151" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div style={{
                    width: '1px',
                    height: '100%',
                    backgroundColor: 'rgba(159,129,81,0.2)',
                  }} />

                  {/* Selling Summary */}
                  <div>
                    <h2 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 24px 0',
                    }}>
                      {t.profile.sellingActivity}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Stats Cards */}
                      <div className="profile-stats-grid">
                        <motion.div
                          whileHover={{ y: -4 }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <p style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '32px',
                            fontWeight: 600,
                            color: '#0A4834',
                            margin: '0 0 4px 0',
                          }}>
                            €{stats?.totalSales || 0}
                          </p>
                          <p style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '13px',
                            color: '#999',
                            margin: 0,
                          }}>
                            {t.profile.totalSales}
                          </p>
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -4 }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <p style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '32px',
                            fontWeight: 600,
                            color: '#0A4834',
                            margin: '0 0 4px 0',
                          }}>
                            {stats?.itemsSold || 0}
                          </p>
                          <p style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '13px',
                            color: '#999',
                            margin: 0,
                          }}>
                            {t.profile.itemsSold}
                          </p>
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -4 }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <p style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '32px',
                            fontWeight: 600,
                            color: '#0A4834',
                            margin: '0 0 4px 0',
                          }}>
                            {stats?.avgRating || 0}
                          </p>
                          <p style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '13px',
                            color: '#999',
                            margin: 0,
                          }}>
                            {t.profile.avgRating}
                          </p>
                        </motion.div>
                      </div>

                      {/* My Closet Preview */}
                      <motion.div
                        whileHover={{ y: -4 }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          padding: '24px',
                          boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                        }}>
                          <h3 style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#0A4834',
                            margin: 0,
                          }}>
                            {t.profile.itemsListed}
                          </h3>
                          <Package size={20} color="#9F8151" />
                        </div>
                        <div className="profile-closet-grid">
                          {(Array.isArray(closet) ? closet : []).map((item) => (
                            <div
                              key={item.id}
                              style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '12px',
                                overflow: 'hidden',
                              }}
                            >
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          ))}
                        </div>
                        <p style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '13px',
                          color: '#999',
                          fontStyle: 'italic',
                          margin: '12px 0 0 0',
                        }}>
                          {t.profile.yourPiecesListed}
                        </p>
                      </motion.div>

                      {/* Recent Sales */}
                      <motion.div
                        whileHover={{ y: -4 }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          padding: '24px',
                          boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <h3 style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: '#0A4834',
                          margin: '0 0 16px 0',
                        }}>
                          {t.profile.recentSales}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {[].slice(0, 2).map((sale) => (
                            <div
                              key={sale.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#F0ECE3',
                                borderRadius: '8px',
                              }}
                            >
                              <div>
                                <p style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#0A4834',
                                  margin: '0 0 4px 0',
                                }}>
                                  {sale.item}
                                </p>
                                <p style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '12px',
                                  color: '#999',
                                  margin: 0,
                                }}>
                                  {sale.buyer}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: '#9F8151',
                                  margin: '0 0 4px 0',
                                }}>
                                  €{sale.price}
                                </p>
                                <span style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '11px',
                                  color: getStatusColor(sale.status),
                                  backgroundColor: `${getStatusColor(sale.status)}15`,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}>
                                  {sale.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Most Recent Upload Card */}
                  {mostRecentItem && (
                    <motion.div
                      whileHover={{ y: -4 }}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                      }}>
                        <h3 style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '24px',
                          fontWeight: 600,
                          color: '#0A4834',
                          margin: 0,
                        }}>
                          {t.profile.mostRecentUpload}
                        </h3>
                        <Package size={24} color="#9F8151" />
                      </div>
                      <div style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                      }}>
                        <ImageWithFallback
                          src={getItemImageUrl(mostRecentItem)}
                          alt={mostRecentItem.name || mostRecentItem.title || 'Item'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <h4 style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '18px',
                        fontWeight: 500,
                        color: '#0A4834',
                        margin: '0 0 8px 0',
                      }}>
                        {mostRecentItem.name || mostRecentItem.title || 'Item'}
                      </h4>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '22px',
                        fontWeight: 600,
                        color: '#9F8151',
                        margin: 0,
                      }}>
                        €{mostRecentItem.price}
                      </p>
                    </motion.div>
                  )}

                  {/* Favourites Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '32px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      gridColumn: mostRecentItem ? 'span 2' : 'span 3',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px',
                    }}>
                      <h3 style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#0A4834',
                        margin: 0,
                      }}>
                        {t.profile.favorites}
                      </h3>
                      <Heart size={24} color="#9F8151" fill="#9F8151" />
                    </div>
                    <div className="profile-favorites-grid" style={{ marginBottom: '16px' }}>
                      {favourites.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <ImageWithFallback
                            src={item.type === 'item' ? item.image : item.coverImage}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {item.type === 'closet' && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              right: '8px',
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              borderRadius: '50%',
                              padding: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Users size={14} color="#9F8151" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ color: '#9F8151' }}
                      onClick={() => setActiveTab('favourites')}
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0A4834',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    >
                      {t.profile.viewAllFavourites}
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>
          </TabsContent>

          {/* My Items Tab */}
          <TabsContent value="myitems" className="profile-tab-content">
            <div className="profile-items-header">
              <div>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 8px 0',
                }}>
                  {t.profile.myItems}
                </h2>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  {t.profile.yourPiecesListed}
                </p>
              </div>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0px 8px 24px rgba(159,129,81,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile/upload')}
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#9F8151',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0px 4px 12px rgba(159,129,81,0.2)',
                }}
              >
                <Plus size={20} />
                {t.profile.uploadItem}
              </motion.button>
            </div>

            <div className="profile-items-grid">
              {/* User Items */}
              {closet.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '0.75',
                    overflow: 'hidden',
                  }}>
                    <ImageWithFallback
                      src={getItemImageUrl(item)}
                      alt={item.name || item.title || 'Item'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '8px',
                    }}>
                      <motion.button
                        whileHover={{ backgroundColor: '#9F8151', scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/upload?edit=${item.id}`);
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Edit size={16} color="#0A4834" />
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: '#B75C5C', scale: 1.1 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            try {
                              await apiClient.delete(`/me/items/${item.id}`);
                              setCloset(prev => prev.filter(i => i.id !== item.id));
                            } catch (error) {
                              console.error('Failed to delete item:', error);
                              alert('Failed to delete item. Please try again.');
                            }
                          }
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Trash2 size={16} color="#0A4834" />
                      </motion.button>
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#0A4834',
                      margin: '0 0 8px 0',
                    }}>
                      {item.name || item.title || 'Item'}
                    </h4>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: '#9F8151',
                      margin: '0 0 12px 0',
                    }}>
                      €{item.price}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#999',
                      fontFamily: 'Manrope, sans-serif',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} />
                        {item.views || 0}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={14} />
                        {item.saves || 0}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageCircle size={14} />
                        {item.messages || 0}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {closet.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
              }}>
                <Package size={48} color="#DCD6C9" style={{ marginBottom: '24px' }} />
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '28px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: '0 0 24px 0',
                }}>
                  {t.profile.noListings}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile/upload')}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#9F8151',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Plus size={20} />
                  {t.profile.uploadItem}
                </motion.button>
              </div>
            )}
          </TabsContent>

          {/* Favourites Tab */}
          <TabsContent value="favourites" className="profile-tab-content">
            <div className="profile-favourites-grid">
              {(Array.isArray(favourites) ? favourites : []).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.type === 'item' ? (
                    <>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1',
                        overflow: 'hidden',
                      }}>
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(159,129,81,0.2)', scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(item.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                        >
                          <Heart size={18} color="#9F8151" fill="#9F8151" />
                        </motion.button>
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h4 style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                          margin: '0 0 8px 0',
                        }}>
                          {item.name}
                        </h4>
                        <p style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: '#9F8151',
                          margin: '0 0 8px 0',
                        }}>
                          €{item.price}
                        </p>
                        <p style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '13px',
                          color: '#999',
                          margin: 0,
                        }}>
                          {t.profile.by} {item.seller}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1',
                      overflow: 'hidden',
                    }}>
                      <ImageWithFallback
                        src={item.coverImage}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <motion.div
                        whileHover={{ backgroundColor: 'rgba(159,129,81,0.7)' }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          padding: '20px',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Users size={18} color="#9F8151" />
                        </div>
                        <h3 style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          margin: '0 0 4px 0',
                        }}>
                          {item.name}
                        </h3>
                        <p style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '13px',
                          color: '#F0ECE3',
                          margin: '0 0 8px 0',
                        }}>
                          {item.username}
                        </p>
                        <span style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '11px',
                          color: '#9F8151',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          padding: '4px 10px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          alignSelf: 'flex-start',
                        }}>
                          {item.styleTag}
                        </span>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {(!Array.isArray(favourites) || favourites.length === 0) && (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
              }}>
                <Heart size={48} color="#DCD6C9" style={{ marginBottom: '24px' }} />
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '28px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  {t.profile.favouritesAwait}
                </p>
              </div>
            )}
          </TabsContent>

          {/* My Closet Tab (Seller Only) */}
          {isSeller && (
            <TabsContent value="mycloset" style={{ marginTop: '48px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 8px 0',
                }}>
                  {t.profile.myCloset}
                </h2>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  {t.profile.yourPiecesListed}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}>
                {/* Add New Item Card */}
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: '#9F8151' }}
                  onClick={onUploadClick}
                  style={{
                    aspectRatio: '0.75',
                    borderRadius: '20px',
                    border: '2px dashed #DCD6C9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Plus size={48} color="#9F8151" />
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#9F8151',
                    margin: 0,
                  }}>
                    {t.profile.addNewItem}
                  </p>
                </motion.div>

                {/* Closet Items */}
                {closet.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '0.75',
                      overflow: 'hidden',
                    }}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '8px',
                      }}>
                        <motion.button
                          whileHover={{ backgroundColor: '#9F8151', scale: 1.1 }}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Edit size={16} color="#0A4834" />
                        </motion.button>
                        <motion.button
                          whileHover={{ backgroundColor: '#B75C5C', scale: 1.1 }}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Trash2 size={16} color="#0A4834" />
                        </motion.button>
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#0A4834',
                        margin: '0 0 8px 0',
                      }}>
                        {item.name}
                      </h4>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '22px',
                        fontWeight: 600,
                        color: '#9F8151',
                        margin: '0 0 12px 0',
                      }}>
                        €{item.price}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#999',
                        fontFamily: 'Manrope, sans-serif',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} />
                          {item.views}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={14} />
                          {item.saves}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageCircle size={14} />
                          {item.messages}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Sales Tab (Seller Only) */}
          {isSeller && (
            <TabsContent value="sales" className="profile-tab-content">
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 24px 0',
                }}>
                  {t.profile.salesOverview}
                </h2>

                {/* Summary Stats */}
                <div className="profile-sales-stats-grid">
                  <motion.div
                    whileHover={{ y: -4 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '32px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '48px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 8px 0',
                    }}>
                      €{stats?.totalSales || 0}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      color: '#999',
                      margin: 0,
                    }}>
                      {t.profile.totalSales}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '32px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '48px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 8px 0',
                    }}>
                      {stats?.itemsSold || 0}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      color: '#999',
                      margin: 0,
                    }}>
                      {t.profile.itemsSold}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '32px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '48px',
                        fontWeight: 600,
                        color: '#0A4834',
                        margin: 0,
                      }}>
                        {stats?.avgRating || 0}
                      </p>
                      <Star size={24} color="#9F8151" fill="#9F8151" />
                    </div>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      color: '#999',
                      margin: 0,
                    }}>
                      {t.profile.avgRating}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Sales History Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
              }}>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 24px 0',
                }}>
                  {t.profile.salesHistory}
                </h3>

                <div style={{
                  borderTop: '1px solid #DCD6C9',
                }}>
                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                    gap: '16px',
                    padding: '16px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #F0ECE3',
                  }}>
                    <div>{t.profile.item}</div>
                    <div>{t.profile.buyer}</div>
                    <div>{t.profile.price}</div>
                    <div>{t.profile.status}</div>
                    <div>{t.profile.date}</div>
                  </div>

                  {/* Table Rows */}
                  {[].map((sale) => (
                    <motion.div
                      key={sale.id}
                      whileHover={{ backgroundColor: '#F0ECE3' }}
                      className="profile-sales-table-row"
                    >
                      <div style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#0A4834',
                      }}>
                        {sale.item}
                      </div>
                      <div style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                      }}>
                        {sale.buyer}
                      </div>
                      <div style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#9F8151',
                      }}>
                        €{sale.price}
                      </div>
                      <div>
                        <span style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: getStatusColor(sale.status),
                          backgroundColor: `${getStatusColor(sale.status)}15`,
                          padding: '4px 12px',
                          borderRadius: '12px',
                        }}>
                          {sale.status}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '13px',
                        color: '#999',
                      }}>
                        {sale.date}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Analytics Tab (Seller Only) */}
          {isSeller && (
            <TabsContent value="analytics" style={{ marginTop: '48px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 8px 0',
                }}>
                  {t.profile.analytics}
                </h2>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  {t.profile.seeHowYourStories}
                </p>
              </div>

              <div className="profile-analytics-grid">
                {/* Views Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '32px',
                    boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#0A4834',
                    margin: '0 0 24px 0',
                  }}>
                    {t.profile.weeklyViews}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE3" />
                      <XAxis
                        dataKey="week"
                        stroke="#999"
                        style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#999"
                        style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #DCD6C9',
                          borderRadius: '12px',
                          fontFamily: 'Manrope, sans-serif',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#0A4834"
                        strokeWidth={3}
                        dot={{ fill: '#9F8151', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Side Stats */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}>
                  {/* Most Viewed Item */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <h4 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 16px 0',
                    }}>
                      {t.profile.mostViewed}
                    </h4>
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                    }}>
                      <ImageWithFallback
                        src={closet[0]?.image || ''}
                        alt={closet[0]?.name || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0A4834',
                      margin: '0 0 4px 0',
                    }}>
                      {closet[0]?.name || ''}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#9F8151',
                      margin: 0,
                    }}>
                      {closet[0]?.views || 0} {t.profile.views}
                    </p>
                  </motion.div>

                  {/* Follower Growth */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <h4 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 16px 0',
                    }}>
                      {t.profile.followerGrowth}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '40px',
                        fontWeight: 600,
                        color: '#0A4834',
                        margin: 0,
                      }}>
                        {stats?.followers || 0}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#3B7059',
                      }}>
                        <TrendingUp size={20} />
                        <span style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}>
                          {stats?.followerGrowth ? `+${stats.followerGrowth}` : '+0'}
                        </span>
                      </div>
                    </div>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#999',
                      margin: 0,
                    }}>
                      {t.profile.totalFollowersThisMonth}
                    </p>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Settings Drawer */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="profile-settings-overlay"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="profile-settings-drawer"
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: 0,
                }}>
                  {t.profile.settings}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettingsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={24} color="#0A4834" />
                </motion.button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {[
                  { icon: Users, label: t.profile.profileSettings },
                  { icon: CreditCard, label: t.profile.paymentMethods },
                  { icon: MapPin, label: t.profile.addressBook },
                  { icon: Package, label: t.profile.notifications },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ backgroundColor: 'rgba(159,129,81,0.15)', x: 4 }}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      color: '#0A4834',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <item.icon size={20} color="#9F8151" />
                    {item.label}
                  </motion.button>
                ))}

                <div style={{
                  height: '1px',
                  backgroundColor: 'rgba(159,129,81,0.2)',
                  margin: '16px 0',
                }} />

                <motion.button
                  whileHover={{ backgroundColor: 'rgba(183,92,92,0.15)', x: 4 }}
                  onClick={async () => {
                    await logout();
                    setSettingsOpen(false);
                    navigate('/');
                  }}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    color: '#B75C5C',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <LogOut size={20} />
                  {t.profile.logOut}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Quote */}
      <div className="profile-footer-quote">
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '24px',
          fontStyle: 'italic',
          color: '#9F8151',
          margin: '0 0 24px 0',
          lineHeight: '36px',
        }}>
          {t.profile.styleQuote}
        </p>
        <motion.button
          whileHover={{ color: '#9F8151' }}
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '15px',
            fontWeight: 500,
            color: '#0A4834',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(10,72,52,0.3)',
            transition: 'color 0.3s ease',
          }}
        >
          {t.profile.backToHome}
        </motion.button>
      </div>

      {/* Footer */}
      <FooterAlt onNewsletterClick={() => {}} />

      {/* Chat Widget */}
      <ChatWidget />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        currentBio={user?.bio || ''}
        currentAvatar={resolveAvatarForModal(user?.avatar)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
