import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MoreVertical, ArrowLeft, Check, X, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChatWidget } from './ChatWidget';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations';
import './styles/ClosetPage.css';

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;

// Social platform enum (matches backend)
const SocialLinkPlatform = {
  INSTAGRAM: 1,
  FACEBOOK: 2,
  TIKTOK: 3,
  X: 4,
} as const;

interface SocialLink {
  id: number;
  platform: number;
  url: string;
}

interface ClosetItem {
  id: number;
  name: string;
  price: string;
  image?: string | null;
  category?: string;
}

interface ClosetUser {
  id: number;
  name: string;
  username: string;
  location: string;
  bio: string;
  avatar: string | null;
  phone?: string | null;
  socialLinks: SocialLink[];
}

export default function ClosetPage({
  userId: propUserId,
  onBack,
  onContactSeller,
  onItemClick,
  onAvatarClick,
  language: languageProp,
}: {
  userId?: string;
  onBack?: () => void;
  onContactSeller?: () => void;
  onItemClick?: (id: string) => void;
  onAvatarClick?: () => void;
  language?: 'en' | 'mk';
}) {
  const { closetId } = useParams<{ closetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language: contextLanguage } = useLanguage();
  
  // Use language from context if available, otherwise use prop, otherwise default to 'en'
  const language = contextLanguage || languageProp || 'en';
  const t = getTranslation(language);
  
  const userId = propUserId || closetId || user?.id?.toString() || '1';

  
  // Check if user is viewing their own closet
  // For now, we'll check if the user is logged in and the closetId matches their username or ID
  // This is a simplified check - in a real app, you'd compare with actual user ID from API
  const isOwnCloset = user && (closetId === user.username || propUserId === user.username || !closetId);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/closets');
    }
  };

  const handleItemClick = (itemId: number) => {
    if (onItemClick) {
      onItemClick(String(itemId));
    } else {
      navigate(`/product/${itemId}`);
    }
  };


  const [userProfile, setUserProfile] = useState<ClosetUser | null>(null);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);

  const [selectedFilter, setSelectedFilter] = useState(t.closet.filters.all);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const resolveImageUrl = (value?: string | null): string | null => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/storage') || value.startsWith('storage/')) {
      return `${API_ROOT}${value.startsWith('/') ? value : `/${value}`}`;
    }
    return value;
  };

  // Update selectedFilter when language changes
  useEffect(() => {
    setSelectedFilter(t.closet.filters.all);
  }, [language, t.closet.filters.all]);

  // DEFAULT fallback image (fastest option)
  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  // FETCH DATA
  useEffect(() => {
    const fetchCloset = async () => {
      try {
        // Fetch closet data (user + items)
        const response = await fetch(`${API_BASE_URL}/closets/${userId}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const fallbackText = await response.text();
          throw new Error(
            `Unexpected response (${response.status}). ${fallbackText.slice(0, 120)}`
          );
        }

        const data = await response.json();
        const payload = data?.data || data?.user || data;
        const items = data?.items || payload?.items || [];

        // Try to get social links from closet response first
        let rawSocialLinks = payload?.social_links || payload?.socialLinks || [];
        
        // If no social links in closet response, try fetching from users endpoint
        if (!rawSocialLinks || rawSocialLinks.length === 0) {
          try {
            const userResponse = await fetch(`${API_BASE_URL}/users/${payload?.id || userId}`, {
              headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
              credentials: 'include',
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              const userPayload = userData?.data || userData;
              rawSocialLinks = userPayload?.social_links || userPayload?.socialLinks || [];
            }
          } catch (userErr) {
            // Users endpoint not available, continue without social links
          }
        }

        const normalizedSocialLinks: SocialLink[] = Array.isArray(rawSocialLinks)
          ? rawSocialLinks.map((link: any) => ({
              id: Number(link?.id ?? 0),
              platform: Number(link?.platform ?? 0),
              url: link?.url || '',
            }))
          : [];

        const normalizedUser: ClosetUser = {
          id: Number(payload?.id ?? 0),
          name: payload?.name || payload?.username || 'Closet',
          username: payload?.username || String(payload?.id ?? ''),
          location: payload?.location || payload?.city || '',
          bio: payload?.bio || payload?.tagline || '',
          avatar: resolveImageUrl(payload?.avatar || payload?.profile_photo_url) || null,
          phone: payload?.phone || null,
          socialLinks: normalizedSocialLinks,
        };

        const normalizedItems: ClosetItem[] = Array.isArray(items)
          ? items.map((item: any) => ({
              id: Number(item?.id ?? 0),
              name: item?.name || item?.title || 'Item',
              price: String(item?.price ?? ''),
              image:
                resolveImageUrl(item?.mainImage?.url) ||
                resolveImageUrl(item?.images?.[0]?.url) ||
                resolveImageUrl(item?.image_url) ||
                resolveImageUrl(item?.image) ||
                null,
              category: item?.category?.name || item?.category || '',
            }))
          : [];

        setUserProfile(normalizedUser);
        setClosetItems(normalizedItems);
      } catch (err) {
        console.error('Closet fetch error:', err);
      }
    };

    fetchCloset();
  }, [userId]);

  const filterCategories = [
    t.closet.filters.all,
    t.closet.filters.tops,
    t.closet.filters.bottoms,
    t.closet.filters.outerwear,
    t.closet.filters.accessories,
  ];

  const filteredItems =
    selectedFilter === t.closet.filters.all
      ? closetItems
      : closetItems.filter((item) => item.category === selectedFilter);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const y = container.scrollTop;
      setHeaderCollapsed(y > 120);
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  const formatCount = (num: number) =>
    num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

  if (!userProfile) {
    return (
      <div className="closet-page-root">
        <HeaderAlt />
        <div style={{ padding: 20 }}>{t.closet.loading}</div>
        <FooterAlt />
      </div>
    );
  }

  return (
    <div className="closet-page-root">
      <HeaderAlt />
      <div ref={scrollContainerRef} className="scroll-container">
        {/* HEADER */}
        <header
          className={`sticky top-0 z-40 closet-header ${
            headerCollapsed ? 'closet-header-shadow' : ''
          }`}
        >
          {/* Collapsed */}
          {headerCollapsed && (
            <div className="h-16 px-6 flex items-center justify-between closet-header-collapsed-wrapper">
              <div className="flex items-center height-240px gap-3">
                <ImageWithFallback
                  src={userProfile.avatar || fallbackImage}
                  fallback={fallbackImage}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="closet-font-cormorant text-[#0A4834]">
                  {userProfile.name}
                </span>
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-[#0A4834]/5 rounded-full"
              >
                <MoreVertical className="w-5 h-5 text-[#9F8151]" />
              </button>
            </div>
          )}

          {/* EXPANDED */}
          {!headerCollapsed && (
            <div className="px-6 pt-8 pb-6 closet-header-expanded-wrapper">
              <button
                onClick={handleBack}
                className="mb-6 p-2 hover:bg-[#0A4834]/5 rounded-full inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> {t.closet.back}
              </button>

              <div className="flex gap-6 items-start closet-header-content">
                <button onClick={onAvatarClick} className="relative group">
                  <ImageWithFallback
                    src={userProfile.avatar || fallbackImage}
                    fallback={fallbackImage}
                    alt={userProfile.name}
                    className="w-[100px] h-[100px] rounded-full object-cover closet-avatar-image"
                  />
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h1 className="closet-font-cormorant closet-name">
                      {userProfile.name}
                    </h1>

                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-[#0A4834]/5 rounded-full"
                      >
                        <MoreVertical className="w-5 h-5 text-[#9F8151]" />
                      </button>

                      {showMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-md py-2 min-w-[180px] z-50">
                          <button className="w-full px-4 py-2 text-left hover:bg-[#F0ECE3]">
                            {t.closet.shareCloset}
                          </button>
                          <button className="w-full px-4 py-2 text-left text-red-500 hover:bg-[#F0ECE3]">
                            {t.closet.report}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="closet-font-manrope-xl closet-stats">
                    <span className="font-semibold">{closetItems.length}</span>{' '}
                    {t.closet.items} • {formatCount(1200)} {t.closet.followers} • 342 {t.closet.following}
                  </p>

                  <p className="closet-font-manrope closet-location">
                    📍 {userProfile.location}
                  </p>
                  <p className="closet-font-manrope closet-bio">
                    {userProfile.bio}
                  </p>

                  <div className="flex gap-3 mt-4 closet-action-buttons items-center flex-wrap">
                    <Button
                      onClick={handleFollowToggle}
                      className={`rounded-xl px-6 ${
                        isFollowing
                          ? 'bg-white text-[#9F8151] border-[#9F8151] border-2'
                          : 'bg-[#9F8151] text-white'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {t.closet.following}
                        </>
                      ) : (
                        t.closet.follow
                      )}
                    </Button>

                    {/* Social Media Links */}
                    {userProfile.socialLinks && userProfile.socialLinks.length > 0 && (
                      <div className="flex gap-2 items-center">
                        {userProfile.socialLinks.map((link) => {
                          let icon = null;
                          let label = '';
                          
                          switch (link.platform) {
                            case SocialLinkPlatform.INSTAGRAM:
                              icon = (
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              );
                              label = 'Instagram';
                              break;
                            case SocialLinkPlatform.FACEBOOK:
                              icon = (
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              );
                              label = 'Facebook';
                              break;
                            case SocialLinkPlatform.TIKTOK:
                              icon = (
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                </svg>
                              );
                              label = 'TikTok';
                              break;
                            case SocialLinkPlatform.X:
                              icon = (
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              );
                              label = 'X';
                              break;
                          }
                          
                          if (!icon) return null;
                          
                          return (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full hover:bg-[#0A4834]/10 transition-colors text-[#9F8151] hover:text-[#0A4834]"
                              title={label}
                            >
                              {icon}
                            </a>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      onClick={() => setShowContactPopup(true)}
                      variant="outline"
                      className="rounded-xl px-6 border-2 border-[#9F8151] text-[#9F8151]"
                    >
                      {t.closet.contactSeller}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-px bg-[#9F8151] opacity-20" />
            </div>
          )}
        </header>

        {/* FILTERS */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide closet-filters">
          {filterCategories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedFilter(c)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap closet-filter-btn ${
                selectedFilter === c
                  ? 'bg-[#9F8151] text-white'
                  : 'bg-white text-[#9F8151] border border-[#9F8151]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ITEMS GRID */}
        <div className="px-6 pb-12 closet-items-wrapper">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 closet-items-grid">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer closet-item-card"
              >
                <div className="aspect-square overflow-hidden relative">
                  <ImageWithFallback
                    src={item.image || fallbackImage}
                    fallback={fallbackImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-4 closet-item-content">
                  <h3 className="item-title">{item.name}</h3>
                  <p className="item-price">€{item.price}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="curated-by">
              {t.closet.curatedBy.replace('{username}', userProfile.username)}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Widget - Only show on user's own closet */}
      {isOwnCloset && <ChatWidget />}
      <FooterAlt />

      {/* Contact Seller Popup */}
      {showContactPopup && (
        <div
          onClick={() => setShowContactPopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 72, 52, 0.3)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowContactPopup(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0ECE3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} color="#000000" />
            </button>

            {/* Title */}
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '28px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '8px',
                marginTop: 0,
              }}
            >
              {t.closet.contactSeller}
            </h2>

            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#000000',
                opacity: 0.7,
                marginBottom: '24px',
                marginTop: 0,
              }}
            >
              {language === 'mk' 
                ? `Изберете како сакате да контактирате со ${userProfile.name}`
                : `Choose how you'd like to contact ${userProfile.name}`
              }
            </p>

            {/* Contact Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* WhatsApp Button */}
              <button
                onClick={() => {
                  const phone = userProfile.phone?.replace(/\D/g, '') || '';
                  const message = encodeURIComponent(
                    language === 'mk' 
                      ? `Здраво! Ве контактирам преку Ministry of Second Hand.`
                      : `Hi! I'm contacting you through Ministry of Second Hand.`
                  );
                  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                  setShowContactPopup(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1da851';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </button>

              {/* Viber Button */}
              <button
                onClick={() => {
                  const phone = userProfile.phone?.replace(/\D/g, '') || '';
                  window.open(`viber://chat?number=${phone}`, '_blank');
                  setShowContactPopup(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  backgroundColor: '#7360F2',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a4bc7';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7360F2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.182.518 6.795.358 10.013c-.161 3.218-.26 9.254 5.648 10.929h.006l-.004 2.51s-.037.986.626 1.188c.803.248 1.274-.517 2.042-1.347.42-.455.998-1.121 1.434-1.63 3.953.327 6.99-.427 7.337-.54.801-.257 5.342-.837 6.084-6.834.765-6.187-.367-10.09-2.412-11.861l-.004-.001C19.558.675 15.823-.076 11.398.002zM11.6 1.2c3.977-.058 7.325.476 8.725 1.722l.002.001c1.632 1.411 2.604 4.928 1.921 10.432-.613 4.972-4.248 5.648-4.932 5.87-.289.094-2.986.76-6.412.514 0 0-2.541 3.025-3.334 3.818-.124.124-.27.175-.368.152-.138-.033-.176-.189-.175-.417l.024-4.147c-4.908-1.4-4.628-6.321-4.49-9.073.138-2.751.79-5.029 2.263-6.495 1.933-1.771 5.345-2.322 8.776-2.377zm-.056 3.048c-.166.002-.32.137-.326.398-.007.27.195.463.403.466 1.61.022 2.876.495 3.793 1.366.922.876 1.427 2.089 1.505 3.637.007.172.149.363.399.361.26-.002.433-.2.425-.465-.09-1.78-.678-3.22-1.796-4.282-1.112-1.057-2.62-1.612-4.403-1.481zm.042 1.58c-.158.002-.31.124-.33.373-.02.26.166.458.367.482.99.116 1.648.482 2.099 1.012.454.533.695 1.23.756 2.015.015.19.169.374.424.358.264-.016.413-.214.398-.49-.076-.971-.378-1.857-.976-2.559-.594-.698-1.457-1.136-2.59-1.27a.496.496 0 00-.148.079zm.078 1.556c-.17-.014-.365.114-.384.364-.037.51.165.894.446 1.155.286.265.676.434 1.073.467.202.016.396-.134.41-.384.014-.262-.165-.428-.35-.445-.244-.021-.452-.12-.597-.255-.148-.137-.24-.322-.219-.533.014-.182-.147-.342-.32-.366a.425.425 0 00-.059-.003z"/>
                </svg>
                <span>Viber</span>
              </button>
            </div>

            {/* Note */}
            {!userProfile.phone && (
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '12px',
                  color: '#000000',
                  opacity: 0.5,
                  marginTop: '20px',
                  marginBottom: 0,
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  textAlign: 'center',
                }}
              >
                {language === 'mk' 
                  ? 'Продавачот сеуште нема додадено телефонски број'
                  : 'Seller has not added a phone number yet'
                }
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
