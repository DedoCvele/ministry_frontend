import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
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
  CreditCard
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { ChatWidget } from './ChatWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type Language, getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';

interface ProfilePageProps {
  isSeller?: boolean;
  onClose?: () => void;
  language?: Language;
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

export function ProfilePage({ isSeller = false, onClose, onUploadClick, language = 'en' }: ProfilePageProps) {
  const t = getTranslation(language);
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [userId, setUserId] = useState<number>(1); // Will be updated from API
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data and get user_id from API
  useEffect(() => {
    setLoading(true);
    
    // Try multiple endpoints to get user data
    const tryUserEndpoints = async () => {
      const endpoints = [
        '/api/profile', // Authenticated user's profile
        `/api/users/1`, // Fallback
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get(endpoint);
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
              bio: userData.bio || 'Welcome to your profile! Start building your style story.',
              location: userData.location || 'Location not set',
              avatar: userData.avatar || userData.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjE1ODE1MTl8MA&ixlib=rb-4.1.0&q=80&w=400',
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
                bio: 'Welcome to your profile! Start building your style story.',
                location: 'Location not set',
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

  // Load user orders
  useEffect(() => {
    // Try multiple endpoint variations
    const endpoints = [
      `/api/users/${userId}/orders`,
      `/api/profile/orders`,
      `/api/orders?user_id=${userId}`,
      `/api/orders`,
    ];

    const tryEndpoint = async (index = 0) => {
      if (index >= endpoints.length) {
        console.warn('No orders endpoint found, using empty array');
        setOrders([]);
        return;
      }

      try {
        const res = await axios.get(endpoints[index]);
        const data = res.data?.orders || res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          // Filter by user_id if needed
          const filtered = data.filter((order: any) => 
            order.user_id === userId || order.userId === userId || !order.user_id
          );
          setOrders(filtered);
          console.log('Orders loaded:', filtered);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          tryEndpoint(index + 1);
        }
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          tryEndpoint(index + 1);
        } else {
          console.error(`Error loading orders from ${endpoints[index]}:`, err);
          tryEndpoint(index + 1);
        }
      }
    };

    tryEndpoint();
  }, [userId]);

  // Load favourites
  useEffect(() => {
    // Try multiple endpoint variations
    const endpoints = [
      `/api/users/${userId}/favourites`,
      `/api/profile/favourites`,
      `/api/favourites?user_id=${userId}`,
      `/api/favourites`,
      `/api/wishlist?user_id=${userId}`,
    ];

    const tryEndpoint = async (index = 0) => {
      if (index >= endpoints.length) {
        console.warn('No favourites endpoint found, using empty array');
        setFavourites([]);
        return;
      }

      try {
        const res = await axios.get(endpoints[index]);
        const data = res.data?.favourites || res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          // Filter by user_id if needed
          const filtered = data.filter((fav: any) => 
            fav.user_id === userId || fav.userId === userId || !fav.user_id
          );
          setFavourites(filtered);
          console.log('Favourites loaded:', filtered);
        } else if (Array.isArray(data)) {
          setFavourites(data);
        } else {
          tryEndpoint(index + 1);
        }
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          tryEndpoint(index + 1);
        } else {
          console.error(`Error loading favourites from ${endpoints[index]}:`, err);
          tryEndpoint(index + 1);
        }
      }
    };

    tryEndpoint();
  }, [userId]);

  // Load closet items - use /api/items and filter by user_id
  useEffect(() => {
    // Always load items for the user (for overview and closet tabs)
    axios.get('/api/items')
      .then(res => {
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          // Filter items that belong to this user
          const userItems = data.filter((item: any) => 
            item.user_id === userId || item.user?.id === userId
          );
          setCloset(userItems);
          console.log('Closet items loaded:', userItems);
        } else {
          setCloset([]);
        }
      })
      .catch(err => {
        console.error('Error loading closet items:', err);
        setCloset([]);
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
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#F0ECE3',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Grain Texture */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.02,
        backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=\')',
      }} />

      {/* Header */}
      <HeaderAlt />

      {/* Profile Summary Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(to bottom, #F0ECE3, #FFFFFF)',
          borderRadius: '0 0 32px 32px',
          padding: '80px 64px 48px',
          marginBottom: '48px',
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '48px',
        }}>
          {/* Profile Photo */}
          <div style={{ position: 'relative' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                border: '3px solid #FFFFFF',
              }}
            >
              <ImageWithFallback
                src={user?.avatar || ''}
                alt={user?.name || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#9F8151' }}
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
          <div style={{ flex: 1 }}>
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
              {user?.bio || 'Welcome to your profile! Start building your style story.'}
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
              {user?.location || 'Location not set'}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
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
                List New Item
              </motion.button>
            )}
            <motion.button
              whileHover={{ borderColor: '#9F8151', color: '#9F8151' }}
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
              Edit Profile
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 48px',
        padding: '0 64px',
      }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
            display: 'grid',
            gridTemplateColumns: isSeller ? 'repeat(6, 1fr)' : 'repeat(3, 1fr)',
            gap: '12px',
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
              Overview
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('orders')}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'orders' ? '#0A4834' : 'transparent',
                color: activeTab === 'orders' ? '#FFFFFF' : '#0A4834',
                transition: 'all 0.3s ease',
              }}
            >
              Orders
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
              Favourites
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
                  My Closet
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
                  Sales
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
                  Analytics
                </motion.button>
              </>
            )}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" style={{ marginTop: '48px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isSeller ? '1fr 1px 1fr' : 'repeat(3, 1fr)',
              gap: isSeller ? '48px' : '24px',
            }}>
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
                      Shopping Activity
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Recent Orders Card */}
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
                            Recent Orders
                          </h3>
                          <ChevronRight size={20} color="#9F8151" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          {(Array.isArray(orders) ? orders : []).slice(0, 3).map((order) => (
                            <div
                              key={order.id}
                              style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '12px',
                                overflow: 'hidden',
                              }}
                            >
                              <ImageWithFallback
                                src={order.image}
                                alt={order.name}
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
                          Your pieces, re-loved and restyled.
                        </p>
                      </motion.div>

                      {/* Wishlist Card */}
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
                            Favourites
                          </h3>
                          <Heart size={20} color="#9F8151" fill="#9F8151" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {(Array.isArray(favourites) ? favourites : []).slice(0, 4).map((item) => (
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
                      Selling Activity
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Stats Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
                            Total Sales
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
                            Items Sold
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
                            Avg. Rating
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
                            Items Listed
                          </h3>
                          <Package size={20} color="#9F8151" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
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
                          Your pieces currently listed.
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
                          Recent Sales
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
                  {/* Recent Orders Card */}
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
                        Recent Orders
                      </h3>
                      <ChevronRight size={24} color="#9F8151" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '16px',
                            overflow: 'hidden',
                          }}
                        >
                          <ImageWithFallback
                            src={order.image}
                            alt={order.name}
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
                      textAlign: 'center',
                      margin: 0,
                    }}>
                      Your pieces, re-loved and restyled.
                    </p>
                  </motion.div>

                  {/* Favourites Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '32px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      gridColumn: 'span 2',
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
                        Favourites
                      </h3>
                      <Heart size={24} color="#9F8151" fill="#9F8151" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      {favourites.slice(0, 4).map((item) => (
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
                      View All Favourites →
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" style={{ marginTop: '48px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {(Array.isArray(orders) ? orders : []).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F0ECE3',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <ImageWithFallback
                      src={order.image}
                      alt={order.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '0 0 8px 0',
                    }}>
                      {order.name}
                    </h3>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      color: '#666',
                      margin: '0 0 4px 0',
                    }}>
                      Seller: {order.seller}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#999',
                      margin: 0,
                    }}>
                      Ordered: {order.date}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '12px',
                  }}>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#9F8151',
                      margin: 0,
                    }}>
                      €{order.price}
                    </p>
                    <span style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: getStatusColor(order.status),
                      backgroundColor: `${getStatusColor(order.status)}15`,
                      padding: '6px 16px',
                      borderRadius: '20px',
                    }}>
                      {order.status}
                    </span>
                    {order.status === 'Delivered' && (
                      <motion.button
                        whileHover={{ color: '#9F8151' }}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#0A4834',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Rate this Item <ChevronRight size={16} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Favourites Tab */}
          <TabsContent value="favourites" style={{ marginTop: '48px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
            }}>
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
                        <motion.div
                          whileHover={{ backgroundColor: 'rgba(159,129,81,0.2)' }}
                          style={{
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
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                          }}
                        >
                          <Heart size={18} color="#9F8151" fill="#9F8151" />
                        </motion.div>
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
                          by {item.seller}
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
                  Your favourites await discovery.
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
                  My Closet
                </h2>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  Your pieces currently listed.
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
                    Add New Item
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
            <TabsContent value="sales" style={{ marginTop: '48px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 24px 0',
                }}>
                  Sales Overview
                </h2>

                {/* Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '24px',
                  marginBottom: '48px',
                }}>
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
                      Total Sales
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
                      Items Sold
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
                      Avg. Rating
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
                  Sales History
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
                    <div>Item</div>
                    <div>Buyer</div>
                    <div>Price</div>
                    <div>Status</div>
                    <div>Date</div>
                  </div>

                  {/* Table Rows */}
                  {[].map((sale) => (
                    <motion.div
                      key={sale.id}
                      whileHover={{ backgroundColor: '#F0ECE3' }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                        gap: '16px',
                        padding: '16px',
                        alignItems: 'center',
                        borderBottom: '1px solid #F0ECE3',
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer',
                      }}
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
                  Analytics
                </h2>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#9F8151',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  See how your stories connect through style.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
              }}>
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
                    Weekly Views
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
                      Most Viewed
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
                      {closet[0]?.views || 0} views
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
                      Follower Growth
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
                      Total followers this month
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
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '400px',
                backgroundColor: 'rgba(240,236,227,0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '24px 0 0 24px',
                padding: '48px 32px',
                zIndex: 1000,
                boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
              }}
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
                  Settings
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
                  { icon: Users, label: 'Profile Settings' },
                  { icon: CreditCard, label: 'Payment Methods' },
                  { icon: MapPin, label: 'Address Book' },
                  { icon: Package, label: 'Notifications' },
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
                  <ArrowLeft size={20} />
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Quote */}
      <div style={{
        maxWidth: '1200px',
        margin: '80px auto 0',
        padding: '0 64px 48px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '24px',
          fontStyle: 'italic',
          color: '#9F8151',
          margin: '0 0 24px 0',
          lineHeight: '36px',
        }}>
          "Style is what you keep — and what you choose to let go."
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
          Back to Home →
        </motion.button>
      </div>

      {/* Footer */}
      <FooterAlt onNewsletterClick={() => {}} />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
