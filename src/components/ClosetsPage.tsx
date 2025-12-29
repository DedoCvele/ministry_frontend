import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FooterAlt } from './FooterAlt';
import { NewsletterPopup } from './NewsletterPopup';
import { HeaderAlt } from './HeaderAlt';
import { ShareModal } from './ShareModal';
import { type Language, getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/ClosetsPage.css';

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

  // Update activeFilter when language changes
  useEffect(() => {
    setActiveFilter(t.closets.filters.allClosets);
  }, [language, t.closets.filters.allClosets]);

  // ----------------------------
  // FETCH closets from backend
  // ----------------------------
  useEffect(() => {
    const fetchClosets = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/closets");
        const data = await response.json();

        if (data.closets) {
          // Filter out admin profiles - only show users with user profiles
          const userClosets = data.closets.filter((closet: Closet) => {
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
      navigate(`/closets/${closetId}`);
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 120px' }}>

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

        {/* CLOSET GRID (fixed version) */}
        <div
          className="closets-grid-container"
          style={{
            marginBottom: '48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
        >
          {filteredClosets.map((closet, index) => (
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

        {/* Community CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '80px',
            padding: '64px 40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', color: '#0A4834' }}>
            {t.closets.cta.title}
          </h2>

          <p style={{ maxWidth: '600px', margin: '0 auto 32px', color: 'rgba(0,0,0,0.7)' }}>
            {t.closets.cta.description}
          </p>

          <motion.button 
            onClick={() => navigate('/become-seller')}
            whileHover={{ backgroundColor: '#0A4834' }}
            whileTap={{ scale: 0.98 }}
            style={{ backgroundColor: '#9F8151', color: '#FFF', padding: '16px 48px', borderRadius: '16px', cursor: 'pointer' }}
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
          closetUrl={`https://ministryofsecondhand.com/closets/${selectedCloset.username}`}
        />
      )}
    </div>
  );
}
