import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MoreVertical, ArrowLeft, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import './styles/ClosetPage.css';

interface ClosetItem {
  id: string;
  title: string;
  price: string;
  image: string;
  category: string;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  location: string;
  bio: string;
  avatar: string;
  itemsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface ClosetPageProps {
  userId?: string;
  onBack?: () => void;
  onContactSeller?: () => void;
  onItemClick?: (itemId: string) => void;
  onAvatarClick?: () => void;
  language?: 'en' | 'mk';
}

export default function ClosetPage({
  userId: propUserId,
  onBack,
  onContactSeller,
  onItemClick,
  onAvatarClick,
  language = 'en',
}: ClosetPageProps) {
  const { closetId } = useParams<{ closetId: string }>();
  const navigate = useNavigate();
  const userId = propUserId || closetId || '1';
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/closets');
    }
  };
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const ticking = useRef(false);

  // Mock user data
  const userProfile: UserProfile = {
    id: userId || '1',
    name: 'Elena Marković',
    username: 'elenamarković',
    location: 'Belgrade, Serbia',
    bio: 'Curator of timeless pieces • Vintage lover • Sustainable fashion advocate',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    itemsCount: 24,
    followersCount: 1247,
    followingCount: 342,
    isFollowing: false,
  };

  // Mock closet items
  const closetItems: ClosetItem[] = [
    {
      id: '1',
      title: 'Vintage Silk Blouse',
      price: '€85',
      image: 'https://images.unsplash.com/photo-1758986264626-150b25dd8114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwZmFzaGlvbiUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MjY4NTI2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Tops',
    },
    {
      id: '2',
      title: 'Designer Leather Bag',
      price: '€320',
      image: 'https://images.unsplash.com/photo-1758171692659-024183c2c272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWclMjBsdXh1cnl8ZW58MXx8fHwxNzYyNjc2MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Accessories',
    },
    {
      id: '3',
      title: 'Wool Trench Coat',
      price: '€195',
      image: 'https://images.unsplash.com/photo-1634078989934-47817b4a5a1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY29hdCUyMGZhc2hpb258ZW58MXx8fHwxNzYyNjg1MjY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Outerwear',
    },
    {
      id: '4',
      title: 'Gold Statement Necklace',
      price: '€68',
      image: 'https://images.unsplash.com/photo-1725368844213-c167fe556f98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhY2Nlc3NvcmllcyUyMGpld2Vscnl8ZW58MXx8fHwxNzYyNjg1MjY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Accessories',
    },
    {
      id: '5',
      title: 'Leather Heels',
      price: '€145',
      image: 'https://images.unsplash.com/photo-1761110583261-3ea6f09f0699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNob2VzJTIwaGVlbHN8ZW58MXx8fHwxNzYyNjEyNTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Accessories',
    },
    {
      id: '6',
      title: 'Silk Scarf - Hermès Inspired',
      price: '€52',
      image: 'https://images.unsplash.com/photo-1761660450845-6c3aa8aaf43f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWxrJTIwc2NhcmYlMjBsdXh1cnl8ZW58MXx8fHwxNzYyNjg1MjY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Accessories',
    },
  ];

  const filterCategories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'];

  const filteredItems =
    selectedFilter === 'All'
      ? closetItems
      : closetItems.filter((item) => item.category === selectedFilter);

  useEffect(() => {
    setIsFollowing(userProfile.isFollowing);
  }, [userProfile.isFollowing]);

  // Simplified scroll behavior - no more glitches!
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (!scrollContainerRef.current) {
            ticking.current = false;
            return;
          }
          
          const currentScrollY = scrollContainerRef.current.scrollTop;
          const scrollThreshold = 120;
          
          if (currentScrollY > scrollThreshold && !headerCollapsed) {
            setHeaderCollapsed(true);
          } else if (currentScrollY <= scrollThreshold && headerCollapsed) {
            setHeaderCollapsed(false);
          }
          
          lastScrollYRef.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [headerCollapsed]);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  // Format follower count
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="closet-page-root">
      {/* Main scroll container */}
      <div 
        ref={scrollContainerRef}
        className="scroll-container"
      >
        {/* Header - Simplified for smooth transitions */}
        <header className={`sticky top-0 z-40 closet-header ${headerCollapsed ? 'closet-header-shadow' : ''}`}>
          {/* Collapsed Header State */}
          <div className={headerCollapsed ? 'closet-header-collapsed' : 'closet-header-collapsed hidden'}>
            <div className="h-16 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className="closet-font-cormorant text-[#0A4834]"
                >
                  {userProfile.name}
                </span>
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-[#0A4834]/5 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[#9F8151]" />
              </button>
            </div>
          </div>
          {/* Expanded Header State */}
          <div className={headerCollapsed ? 'closet-header-expanded hidden' : 'closet-header-expanded'}>
            <div className="px-6 pt-8 pb-6">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="mb-6 p-2 hover:bg-[#0A4834]/5 rounded-full transition-colors inline-flex items-center gap-2 text-[#0A4834]"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              {/* Profile Section - Redesigned */}
              <div className="flex gap-6 items-start">
                {/* Avatar */}
                <button
                  onClick={onAvatarClick}
                  className="relative group flex-shrink-0"
                >
                  <ImageWithFallback
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-[100px] h-[100px] rounded-full object-cover ring-2 ring-[#9F8151]/30 group-hover:ring-[#9F8151] transition-all"
                  />
                  {onAvatarClick && (
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Change
                      </span>
                    </div>
                  )}
                </button>

                {/* Profile Info - Clean Vertical Stack */}
                <div className="flex-1 min-w-0">
                  {/* Name + Menu */}
                  <div className="flex items-center justify-between mb-3">
                    <h1
                      className="closet-font-cormorant closet-name"
                    >
                      {userProfile.name}
                    </h1>
                    {/* Menu Button - Restructured to avoid nested buttons */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-[#0A4834]/5 rounded-full transition-colors flex-shrink-0"
                      >
                        <MoreVertical className="w-5 h-5 text-[#9F8151]" />
                      </button>
                      
                      {/* Dropdown Menu - Now a sibling, not a child */}
                      {showMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] py-2 min-w-[180px] z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-[#F0ECE3] transition-colors text-sm closet-action-font"
                          >
                            Share Closet
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-[#F0ECE3] transition-colors text-[#d4183d] text-sm closet-action-font"
                          >
                            Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats - Inline like Instagram */}
                  <div className="mb-3">
                    <p
                      className="closet-font-manrope closet-stats"
                    >
                      <span className="font-semibold">{userProfile.itemsCount}</span> items
                      <span className="mx-1 text-[#9F8151]">•</span>
                      <span className="font-semibold">{formatCount(userProfile.followersCount)}</span> followers
                      <span className="mx-1 text-[#9F8151]">•</span>
                      <span className="font-semibold">{userProfile.followingCount}</span> following
                    </p>
                  </div>

                  {/* Location + Bio */}
                  <div className="mb-4">
                    <p
                      className="closet-font-manrope closet-location"
                    >
                      📍 {userProfile.location}
                    </p>
                    <p
                      className="closet-font-manrope closet-bio"
                    >
                      {userProfile.bio}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleFollowToggle}
                      className={`rounded-xl px-6 transition-all ${
                        isFollowing
                          ? 'bg-white text-[#9F8151] border-2 border-[#9F8151] hover:bg-[#9F8151]/5'
                          : 'bg-[#9F8151] text-white hover:bg-[#9F8151]/90'
                      }`}
                      // keep font via CSS class
                      style={undefined as any}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        'Follow'
                      )}
                    </Button>
                    <Button
                      onClick={onContactSeller}
                      variant="outline"
                      className="rounded-xl px-6 border-2 border-[#9F8151] text-[#9F8151] hover:bg-[#9F8151]/5"
                      style={undefined as any}
                    >
                      Contact Seller
                    </Button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-6 h-px bg-[#9F8151] opacity-20" />
            </div>
          </div>
        </header>

        {/* Filter Chips */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedFilter === category
                  ? 'bg-[#9F8151] text-white'
                  : 'bg-white text-[#9F8151] border border-[#9F8151]'
              } closet-filter-btn`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Closet Grid */}
        <div className="px-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1"
                style={{ 
                  animation: 'fadeIn 0.5s ease-in-out',
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden relative">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 view-item-overlay">
                    <span className="view-item-text">View Item →</span>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-4">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">{item.price}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Curated By Section */}
          <div className="mt-12 text-center">
            <p className="curated-by">Curated by {userProfile.username} — a collection of timeless vintage finds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}