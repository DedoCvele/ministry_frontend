import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MoreVertical, ArrowLeft, Check, MessageCircle } from 'lucide-react';
import { ContactOptionsPopup } from './ContactOptionsPopup';
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

      {/* Contact Seller Popup (Viber/WhatsApp - same as product page) */}
      <ContactOptionsPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        sellerName={userProfile?.name ?? ''}
        phone={userProfile?.phone}
        language={language}
      />
    </div>
  );
}
