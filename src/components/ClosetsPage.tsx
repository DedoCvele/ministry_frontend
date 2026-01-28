import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight, Users, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FooterAlt } from './FooterAlt';
import { NewsletterPopup } from './NewsletterPopup';
import { HeaderAlt } from './HeaderAlt';
import { ShareModal } from './ShareModal';
import { type Language, getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/ClosetsPage.css';

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;

interface Closet {
  id: number;
  name: string;
  username: string;
  tagline: string;
  coverImage: string;
  profilePhoto: string;
  pieces: number;
  followers: number;
  category: string;
  avatar: string;
  user?: {
    role?: string;
    user_role?: string;
  };
  role?: string;
  user_role?: string;
}

interface ClosetsPageProps {
  onClosetClick?: (id: number) => void;
  language?: Language;
}

export function ClosetsPage({ onClosetClick, language: languageProp }: ClosetsPageProps) {
  const navigate = useNavigate();
  const { language: contextLanguage } = useLanguage();
  
  // Use language from context if available, otherwise use prop, otherwise default to 'en'
  const language = contextLanguage || languageProp || 'en';
  const t = getTranslation(language);

  const [closets, setClosets] = useState<Closet[]>([]);
  const [loading, setLoading] = useState(true);

  const [following, setFollowing] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState(t.closets.filters.allClosets);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCloset, setSelectedCloset] = useState<Closet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const resolveImageUrl = (value?: string | null): string => {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/storage') || value.startsWith('storage/')) {
      return `${API_ROOT}${value.startsWith('/') ? value : `/${value}`}`;
    }
    return value;
  };

  const getPrimaryImage = (closet: any): string => {
    const firstItem = Array.isArray(closet?.items) ? closet.items[0] : undefined;
    return (
      resolveImageUrl(closet?.coverImage) ||
      resolveImageUrl(closet?.cover_image) ||
      resolveImageUrl(firstItem?.mainImage?.url) ||
      resolveImageUrl(firstItem?.images?.[0]?.url) ||
      resolveImageUrl(firstItem?.image_url) ||
      resolveImageUrl(firstItem?.image) ||
      ''
    );
  };

  const normalizeCloset = (closet: any): Closet => {
    const name = closet?.name || closet?.username || 'Closet';
    const username = closet?.username || String(closet?.id ?? '');
    const profilePhoto =
      closet?.profilePhoto ||
      closet?.profile_photo ||
      closet?.avatar ||
      closet?.profile_photo_url ||
      (typeof name === 'string' && name.length > 0 ? name[0].toUpperCase() : 'C');

    return {
      id: Number(closet?.id ?? 0),
      name,
      username,
      tagline: closet?.tagline || closet?.bio || '',
      coverImage: getPrimaryImage(closet),
      profilePhoto,
      pieces: closet?.items_count ?? closet?.pieces ?? (Array.isArray(closet?.items) ? closet.items.length : 0),
      followers: closet?.followers_count ?? closet?.followers ?? 0,
      category: closet?.category || '',
      avatar: closet?.avatar || closet?.profile_photo_url || '',
      user: closet?.user,
      role: closet?.role,
      user_role: closet?.user_role,
    };
  };

  // Update activeFilter when language changes
  useEffect(() => {
    setActiveFilter(t.closets.filters.allClosets);
  }, [language, t.closets.filters.allClosets]);

  // Detect screen size for pagination
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Reset to page 1 when screen size changes
      setCurrentPage(1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ----------------------------
  // FETCH closets from backend
  // ----------------------------
  useEffect(() => {
    const fetchClosets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/closets`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'omit',
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const fallbackText = await response.text();
          throw new Error(
            `Unexpected response (${response.status}). ${fallbackText.slice(0, 120)}`
          );
        }

        const data = await response.json();

        const rawClosets =
          data?.data?.data ||
          data?.data ||
          data?.closets ||
          data?.data?.closets ||
          [];

        if (Array.isArray(rawClosets)) {
          const normalizedClosets = rawClosets.map(normalizeCloset);
          // Filter out admin profiles - only show users with user profiles
          const userClosets = normalizedClosets.filter((closet: Closet) => {
            // Check if username is 'admin' (exclude admin profile)
            if (closet.username?.toLowerCase() === 'admin') {
              return false;
            }
            
            // Check if there's a role field indicating admin
            const role = closet.user?.role || closet.user?.user_role || closet.role || closet.user_role;
            if (role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator')) {
              return false;
            }
            
            // Include all other closets (user profiles)
            return true;
          });
          
          setClosets(userClosets);
        }
      } catch (error) {
        console.error("Failed to load closets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClosets();
  }, []);

  const handleClosetClick = (closetId: number) => {
    if (onClosetClick) {
      onClosetClick(closetId);
    } else {
      const closet = closets.find((item) => item.id === closetId);
      const routeId = closet?.username || String(closetId);
      navigate(`/closets/${routeId}`);
    }
  };

  const filters = [
    t.closets.filters.allClosets,
    t.closets.filters.mostFollowed,
    t.closets.filters.newest,
    t.closets.filters.vintageLovers,
    t.closets.filters.minimalist,
    t.closets.filters.designerFinds,
    t.closets.filters.streetStyle
  ];

  const filteredClosets =
    activeFilter === t.closets.filters.allClosets
      ? closets
      : closets.filter(closet => closet.category === activeFilter);

  // Pagination logic
  const itemsPerPage = isMobile ? 6 : 12;
  const totalPages = Math.ceil(filteredClosets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClosets = filteredClosets.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFollow = (closetId: number) => {
    setFollowing(prev =>
      prev.includes(closetId)
        ? prev.filter(i => i !== closetId)
        : [...prev, closetId]
    );
  };

  const handleShareCloset = (closet: Closet) => {
    setSelectedCloset(closet);
    setShareModalOpen(true);
  };

  // ------------------------
  // Loading skeleton simple
  // ------------------------
  if (loading) {
    return (
      <div className="closets-root">
        <HeaderAlt />
        <div style={{ padding: 40, textAlign: 'center', color: '#0A4834' }}>
          <h2>{t.closets.loading}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="closets-root">
      {/* Grain */}
      <div className="closet-grain" />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeaderAlt />
      </div>

      <div className="closets-page-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="closets-header-inner"
        >
          <h1 className="closets-h1">{t.closets.title}</h1>
          <p className="closets-sub">{t.closets.subtitle}</p>
          <div className="closets-hr" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="closets-content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="closets-filters"
        >
          {filters.map(filter => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`closets-filter-btn ${activeFilter === filter ? 'active' : ''}`}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* CLOSET GRID */}
        <div className="closets-grid-container">
          {paginatedClosets.map((closet, index) => (
            <motion.div
              key={closet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Closet Card */}
              <div className="closet-card">
                <div onClick={() => handleClosetClick(closet.id)} className="closet-cover">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ImageWithFallback src={closet.coverImage} alt={closet.name} className="closet-cover-img" />
                  </motion.div>

                  <div className="closet-cover-overlay">
                    <div className="closet-profile-bubble">{closet.profilePhoto}</div>
                    <div style={{ flex: 1 }}>
                      <h3 className="closet-featured-quote">{closet.name}</h3>
                      <p>@{closet.username}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom */}
                <div className="closet-card-content">
                  <p className="closet-tagline">{closet.tagline}</p>

                  <div className="closet-stats-row">
                    <div className="closet-stat"><Package size={16} color="#9F8151" /><span>{closet.pieces} {t.closets.pieces}</span></div>
                    <div className="closet-stat"><Users size={16} color="#9F8151" /><span>{closet.followers} {t.closets.followers}</span></div>
                  </div>

                  <div className="closet-actions">
                    <motion.button onClick={() => handleClosetClick(closet.id)} className="closet-action-primary">
                      {t.closets.viewCloset} <ArrowRight size={16} />
                    </motion.button>

                    <motion.button
                      onClick={(e) => { e.stopPropagation(); toggleFollow(closet.id); }}
                      className="closet-action-follow"
                      style={{
                        border: following.includes(closet.id) ? '1px solid #0A4834' : '1px solid #9F8151',
                        background: following.includes(closet.id) ? '#0A4834' : 'transparent',
                        color: following.includes(closet.id) ? '#fff' : '#9F8151'
                      }}
                    >
                      <Heart size={16} fill={following.includes(closet.id) ? '#FFFFFF' : 'none'} />
                      {following.includes(closet.id) ? t.closets.following : t.closets.follow}
                    </motion.button>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="closets-pagination">
            <motion.button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="closets-pagination-btn closets-pagination-prev"
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </motion.button>

            <div className="closets-pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="closets-pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <motion.button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`closets-pagination-page ${currentPage === page ? 'active' : ''}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {page}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="closets-pagination-btn closets-pagination-next"
              whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </motion.button>
          </div>
        )}

        {/* Community CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="closets-cta"
        >
          <h2 className="closets-cta-title">
            {t.closets.cta.title}
          </h2>

          <p className="closets-cta-description">
            {t.closets.cta.description}
          </p>

          <motion.button 
            onClick={() => navigate('/become-seller')}
            whileHover={{ backgroundColor: '#0A4834' }}
            whileTap={{ scale: 0.98 }}
            className="closets-cta-btn"
          >
            {t.closets.cta.button}
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <FooterAlt onNewsletterClick={() => setNewsletterOpen(true)} />

      {/* Newsletter Popup */}
      <NewsletterPopup isOpen={newsletterOpen} onClose={() => setNewsletterOpen(false)} />

      {/* Share Modal */}
      {selectedCloset && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          closetName={selectedCloset.name}
          closetUrl={`https://ministryofsecondhand.com/closets/${selectedCloset.username || selectedCloset.id}`}
        />
      )}
    </div>
  );
}
