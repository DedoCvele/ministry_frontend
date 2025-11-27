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
}

interface ClosetsPageProps {
  onClosetClick?: (id: number) => void;
  language?: Language;
}

export function ClosetsPage({ onClosetClick, language = 'en' }: ClosetsPageProps) {
  const navigate = useNavigate();
  const t = getTranslation(language);

  const [closets, setClosets] = useState<Closet[]>([]);
  const [loading, setLoading] = useState(true);

  const [following, setFollowing] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('All Closets');
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCloset, setSelectedCloset] = useState<Closet | null>(null);

  // ----------------------------
  // FETCH closets from backend
  // ----------------------------
  useEffect(() => {
    const fetchClosets = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/closets");
        const data = await response.json();

        if (data.closets) {
          setClosets(data.closets);
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
    'All Closets',
    'Most Followed',
    'Newest',
    'Vintage Lovers',
    'Minimalist',
    'Designer Finds',
    'Street Style'
  ];

  const filteredClosets =
    activeFilter === 'All Closets'
      ? closets
      : closets.filter(closet => closet.category === activeFilter);

  const featuredCloset = closets[0] ?? null;

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
          <h2>Loading closets...</h2>
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
          <h1 className="closets-h1">Discover Closets</h1>
          <p className="closets-sub">Explore unique wardrobes curated by our community.</p>
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
                    <div className="closet-stat"><Package size={16} color="#9F8151" /><span>{closet.pieces} Pieces</span></div>
                    <div className="closet-stat"><Users size={16} color="#9F8151" /><span>{closet.followers} Followers</span></div>
                  </div>

                  <div className="closet-actions">
                    <motion.button onClick={() => handleClosetClick(closet.id)} className="closet-action-primary">
                      View Closet <ArrowRight size={16} />
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
                      {following.includes(closet.id) ? 'Following' : 'Follow'}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Featured Closet Spotlight AFTER 3rd card */}
              {index === 2 && featuredCloset && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    gridColumn: '1 / -1',
                    marginTop: '32px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '32px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <ImageWithFallback
                        src={featuredCloset.coverImage}
                        alt={featuredCloset.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#9F8151',
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                        display: 'block',
                      }}>
                        Featured Closet
                      </span>

                      <h3 style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontStyle: 'italic',
                        fontSize: '24px',
                        color: '#9F8151',
                        margin: '0 0 16px 0',
                      }}>
                        "Clothes carry memories — I just help them find new ones."
                      </h3>

                      <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.7)', margin: '0 0 20px 0' }}>
                        — {featuredCloset.name}
                      </p>

                      <motion.button
                        onClick={() => handleClosetClick(featuredCloset.id)}
                        whileHover={{ backgroundColor: '#0A4834', color: '#FFFFFF' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#9F8151',
                          backgroundColor: 'transparent',
                          border: '1px solid #9F8151',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        Explore @{featuredCloset.username}'s Closet <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

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
            Open Your Closet to the World
          </h2>

          <p style={{ maxWidth: '600px', margin: '0 auto 32px', color: 'rgba(0,0,0,0.7)' }}>
            Sell, share, and connect with conscious fashion lovers.
          </p>

          <motion.button style={{ backgroundColor: '#9F8151', color: '#FFF', padding: '16px 48px', borderRadius: '16px' }}>
            Start Selling
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
