import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type Language, getTranslation } from '../translations';

interface ProfilePageProps {
  isSeller?: boolean;
  onClose?: () => void;
  language?: Language;
  onUploadClick?: () => void;
}

export function ProfilePage({ isSeller = false, onClose, onUploadClick, language = 'en' }: ProfilePageProps) {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mock user data
  const userData = {
    name: 'Isabella Chen',
    username: '@isabella.style',
    bio: 'Curator of timeless pieces. Vintage lover. Sustainable fashion advocate.',
    location: 'Paris, France',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjE1ODE1MTl8MA&ixlib=rb-4.1.0&q=80&w=400',
    memberSince: 'January 2024',
  };

  // Mock orders
  const recentOrders = [
    {
      id: 1,
      name: 'Vintage Hermès Silk Scarf',
      price: 240,
      seller: 'Sophie Laurent',
      image: 'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZHJlc3MlMjBlbGVnYW50fGVufDF8fHx8MTc2MTU4MTUxOXww&ixlib=rb-4.1.0&q=80&w=400',
      status: 'Delivered',
      date: 'Oct 24, 2025',
    },
    {
      id: 2,
      name: 'Classic Burberry Trench',
      price: 385,
      seller: 'Marija Vintage',
      image: 'https://images.unsplash.com/photo-1565532070333-43edd7d75c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZGVzaWduZXIlMjBjb2F0fGVufDF8fHx8MTc2MTU3MDM4NXww&ixlib=rb-4.1.0&q=80&w=400',
      status: 'Shipped',
      date: 'Oct 26, 2025',
    },
    {
      id: 3,
      name: 'Designer Leather Loafers',
      price: 180,
      seller: 'Emma Archive',
      image: 'https://images.unsplash.com/photo-1759563874692-d556321d7c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwaXRlbXN8ZW58MXx8fHwxNzYxNTgxNTE4fDA&ixlib=rb-4.1.0&q=80&w=400',
      status: 'Delivered',
      date: 'Oct 20, 2025',
    },
  ];

  // Mock favourites (merged wishlist items and saved closets)
  const favouriteItems = [
    {
      id: 1,
      type: 'item' as const,
      name: 'Vintage Gucci Marmont Bag',
      price: 890,
      seller: 'LuxeFinds',
      image: 'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwaGFuZGJhZ3xlbnwxfHx8fDE3NjE1NzAzODR8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 2,
      type: 'closet' as const,
      name: 'Sofia Laurent',
      username: '@sofia.closet',
      styleTag: 'Parisian Minimalist',
      coverImage: 'https://images.unsplash.com/photo-1598798918315-e954298ef4cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHlsaXNoJTIwcGVyc29uJTIwb3V0Zml0fGVufDF8fHx8MTc2MTU4MTUyMHww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 3,
      type: 'item' as const,
      name: 'Silk Evening Dress',
      price: 290,
      seller: 'Sofia Closet',
      image: 'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZHJlc3MlMjBlbGVnYW50fGVufDF8fHx8MTc2MTU4MTUxOXww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 4,
      type: 'closet' as const,
      name: 'Tanja Petrović',
      username: '@tanja.vintage',
      styleTag: '70s Glamour',
      coverImage: 'https://images.unsplash.com/photo-1696659958441-fd72cc30db89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjB3b21hbnxlbnwxfHx8fDE3NjE1MTc4MzR8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 5,
      type: 'item' as const,
      name: 'Leather Blazer',
      price: 285,
      seller: 'TanjaVintage',
      image: 'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGVhdGhlciUyMGphY2tldHxlbnwxfHx8fDE3NjE1NzgwOTZ8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 6,
      type: 'closet' as const,
      name: 'Emma Rodriguez',
      username: '@emma.archive',
      styleTag: 'Vintage Street',
      coverImage: 'https://images.unsplash.com/photo-1716307961085-6a7006f28685?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZGVzaWduZXIlMjBjbG90aGluZ3xlbnwxfHx8fDE3NjE1ODE1MTh8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 7,
      type: 'item' as const,
      name: 'Statement Leather Boots',
      price: 225,
      seller: 'IsabellaStyle',
      image: 'https://images.unsplash.com/photo-1759563874692-d556321d7c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwaXRlbXN8ZW58MXx8fHwxNzYxNTgxNTE4fDA&ixlib=rb-4.1.0&q=80&w=400',
    },
  ];

  // Mock seller data (if seller)
  const myClosetItems = [
    {
      id: 1,
      name: 'Vintage Chanel Jacket',
      price: 1250,
      image: 'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGVhdGhlciUyMGphY2tldHxlbnwxfHx8fDE3NjE1NzgwOTZ8MA&ixlib=rb-4.1.0&q=80&w=400',
      views: 342,
      saves: 28,
      messages: 5,
    },
    {
      id: 2,
      name: 'Silk Wrap Dress',
      price: 180,
      image: 'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZHJlc3MlMjBlbGVnYW50fGVufDF8fHx8MTc2MTU4MTUxOXww&ixlib=rb-4.1.0&q=80&w=400',
      views: 189,
      saves: 15,
      messages: 3,
    },
    {
      id: 3,
      name: 'Designer Sunglasses',
      price: 95,
      image: 'https://images.unsplash.com/photo-1759563876826-30481c505545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwaXRlbXxlbnwxfHx8fDE3NjE1NzAzODZ8MA&ixlib=rb-4.1.0&q=80&w=400',
      views: 256,
      saves: 42,
      messages: 8,
    },
  ];

  const salesHistory = [
    {
      id: 1,
      item: 'Vintage Leather Jacket',
      buyer: '@sophia.laurent',
      price: 385,
      status: 'Completed',
      date: 'Oct 24, 2025',
    },
    {
      id: 2,
      item: 'Silk Evening Dress',
      buyer: '@emma.r',
      price: 290,
      status: 'Completed',
      date: 'Oct 22, 2025',
    },
    {
      id: 3,
      item: 'Designer Loafers',
      buyer: '@mia.jones',
      price: 180,
      status: 'Pending',
      date: 'Oct 26, 2025',
    },
  ];

  const analyticsData = [
    { week: 'Week 1', views: 120 },
    { week: 'Week 2', views: 280 },
    { week: 'Week 3', views: 190 },
    { week: 'Week 4', views: 340 },
  ];

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
                src={userData.avatar}
                alt={userData.name}
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
              {userData.name}
            </h1>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#9F8151',
              margin: '0 0 12px 0',
            }}>
              {userData.username}
            </p>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#666',
              margin: '0 0 8px 0',
              lineHeight: '24px',
            }}>
              {userData.bio}
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
              {userData.location}
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
                          {recentOrders.slice(0, 3).map((order) => (
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
                          {favouriteItems.slice(0, 4).map((item) => (
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
                            €855
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
                            3
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
                            4.8
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
                          {myClosetItems.map((item) => (
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
                          {salesHistory.slice(0, 2).map((sale) => (
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
                      {recentOrders.slice(0, 3).map((order) => (
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
                      {favouriteItems.slice(0, 4).map((item) => (
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
              {recentOrders.map((order, index) => (
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
              {favouriteItems.map((item, index) => (
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
            {favouriteItems.length === 0 && (
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
                {myClosetItems.map((item, index) => (
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
                      €855
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
                      3
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
                        4.8
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
                  {salesHistory.map((sale) => (
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
                    <LineChart data={analyticsData}>
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
                        src={myClosetItems[0].image}
                        alt={myClosetItems[0].name}
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
                      {myClosetItems[0].name}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#9F8151',
                      margin: 0,
                    }}>
                      {myClosetItems[0].views} views
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
                        127
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
                          +12
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
    </div>
  );
}
