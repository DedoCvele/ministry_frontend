import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MoreVertical, ArrowLeft, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChatWidget } from './ChatWidget';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations';
import './styles/ClosetPage.css';

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
  
  const userId = propUserId || closetId || '1';

  
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update selectedFilter when language changes
  useEffect(() => {
    setSelectedFilter(t.closet.filters.all);
  }, [language, t.closet.filters.all]);

  // DEFAULT fallback image (fastest option)
  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  // FETCH DATA
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/closets/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data.user);
        setClosetItems(data.items);
      })
      .catch((err) => console.error('Closet fetch error:', err));
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
            <div className="h-16 px-6 flex items-center justify-between">
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
            <div className="px-6 pt-8 pb-6">
              <button
                onClick={handleBack}
                className="mb-6 p-2 hover:bg-[#0A4834]/5 rounded-full inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> {t.closet.back}
              </button>

              <div className="flex gap-6 items-start">
                <button onClick={onAvatarClick} className="relative group">
                  <ImageWithFallback
                    src={userProfile.avatar || fallbackImage}
                    fallback={fallbackImage}
                    alt={userProfile.name}
                    className="w-[100px] h-[100px] rounded-full object-cover"
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

                  <div className="flex gap-3 mt-4">
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

                    <Button
                      onClick={onContactSeller}
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
        <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {filterCategories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedFilter(c)}
              className={`px-4 py-2 rounded-xl ${
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
        <div className="px-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-square overflow-hidden relative">
                  <ImageWithFallback
                    src={item.image || fallbackImage}
                    fallback={fallbackImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-4">
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
    </div>
  );
}
