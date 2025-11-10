import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowRight, Users, Package, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FooterAlt } from './FooterAlt';
import { NewsletterPopup } from './NewsletterPopup';
import { HeaderAlt } from './HeaderAlt';
import { ShareModal } from './ShareModal';
import { type Language, getTranslation } from '../translations';

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
}

interface ClosetsPageProps {
  onClosetClick: () => void;
  language?: Language;
}

export function ClosetsPage({ onClosetClick, language = 'en' }: ClosetsPageProps) {
  const t = getTranslation(language);
  const [following, setFollowing] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('All Closets');
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCloset, setSelectedCloset] = useState<Closet | null>(null);

  const closets: Closet[] = [
    {
      id: 1,
      name: 'Tanja Petrović',
      username: 'TanjaVintage',
      tagline: 'Vintage curator with a love for 70s glamour and timeless pieces.',
      coverImage: 'https://images.unsplash.com/photo-1696659958441-fd72cc30db89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjB3b21hbnxlbnwxfHx8fDE3NjE1MTc4MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      profilePhoto: 'T',
      pieces: 42,
      followers: 389,
      category: 'Vintage Lovers',
    },
    {
      id: 2,
      name: 'Sofia Laurent',
      username: 'SofiaCloset',
      tagline: 'Minimalist aesthetic meets Parisian elegance. Less is more.',
      coverImage: 'https://images.unsplash.com/photo-1598798918315-e954298ef4cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHlsaXNoJTIwcGVyc29uJTIwb3V0Zml0fGVufDF8fHx8MTc2MTU4MTUyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      profilePhoto: 'S',
      pieces: 58,
      followers: 527,
      category: 'Minimalist',
    },
    {
      id: 3,
      name: 'Isabella Chen',
      username: 'IsabellaStyle',
      tagline: 'Modern classics with an edge. Designer finds and statement pieces.',
      coverImage: 'https://images.unsplash.com/photo-1628668003003-85488fe78821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmFzaGlvbiUyMGVkaXRvcmlhbHxlbnwxfHx8fDE3NjE1NzE3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      profilePhoto: 'I',
      pieces: 67,
      followers: 612,
      category: 'Designer Finds',
    },
    {
      id: 4,
      name: 'Emma Rodriguez',
      username: 'EmmaArchive',
      tagline: 'Sustainable style enthusiast. Vintage denim and bohemian treasures.',
      coverImage: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2FyZHJvYmUlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2MTU4MTUyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      profilePhoto: 'E',
      pieces: 35,
      followers: 294,
      category: 'Boho Mood',
    },
    {
      id: 5,
      name: 'Mia Johnson',
      username: 'LuxeFinds',
      tagline: 'Investment pieces and heritage brands. Quality over quantity.',
      coverImage: 'https://images.unsplash.com/photo-1645550294607-c9955e906ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzYxNTc5MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      profilePhoto: 'M',
      pieces: 51,
      followers: 445,
      category: 'Designer Finds',
    },
    {
      id: 6,
      name: 'Ava Martinez',
      username: 'MinimalWardrobe',
      tagline: 'Capsule wardrobe advocate. Timeless neutrals and clean lines.',
      coverImage: 'https://images.unsplash.com/photo-1624533523809-3d27d9ea6d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2MTQ4OTQyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      profilePhoto: 'A',
      pieces: 29,
      followers: 318,
      category: 'Minimalist',
    },
  ];

  const filters = ['All Closets', 'Most Followed', 'Newest', 'Vintage', 'Street Style', 'Boho'];

  const toggleFollow = (closetId: number) => {
    setFollowing(prev =>
      prev.includes(closetId)
        ? prev.filter(id => id !== closetId)
        : [...prev, closetId]
    );
  };

  const handleShareCloset = (closet: Closet) => {
    setSelectedCloset(closet);
    setShareModalOpen(true);
  };

  const filteredClosets = activeFilter === 'All Closets'
    ? closets
    : closets.filter(closet => closet.category === activeFilter || activeFilter === 'Most Followed' || activeFilter === 'Newest');

  const featuredCloset = closets[0];

  return (
    <div style={{
      backgroundColor: '#F0ECE3',
      minHeight: '100vh',
    }}>
      {/* Grain Texture */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        opacity: 0.02,
        backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')`,
      }} />

      {/* Header */}
      <HeaderAlt />

      {/* Page Header */}
      <div style={{
        backgroundColor: '#F0ECE3',
        borderBottom: '1px solid rgba(159,129,81,0.1)',
        padding: '48px 24px 32px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '48px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 12px 0',
          }}>
            Discover Closets
          </h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '18px',
            color: '#9F8151',
            margin: '0 0 24px 0',
          }}>
            Explore unique wardrobes curated by our community.
          </p>
          <div style={{
            width: '80px',
            height: '2px',
            backgroundColor: 'rgba(159,129,81,0.3)',
            margin: '0 auto',
          }} />
        </motion.div>
      </div>

      {/* Content Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px 120px',
      }}>
        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '64px',
            flexWrap: 'wrap',
          }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: activeFilter === filter ? '#FFFFFF' : '#0A4834',
                backgroundColor: activeFilter === filter ? '#9F8151' : '#F0ECE3',
                border: '1px solid #DCD6C9',
                borderRadius: '24px',
                padding: '10px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeFilter === filter ? '0px 4px 12px rgba(159,129,81,0.2)' : 'none',
              }}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* Closet Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          marginBottom: '48px',
        }}>
          {filteredClosets.map((closet, index) => (
            <motion.div
              key={closet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Closet Card */}
              <div
                className="closet-card"
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 8px 24px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Cover Image */}
                <div
                  onClick={onClosetClick}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ImageWithFallback
                      src={closet.coverImage}
                      alt={closet.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </motion.div>

                  {/* Bottom Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  }} />

                  {/* Profile Info Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    right: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    {/* Profile Photo */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#9F8151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                      flexShrink: 0,
                    }}>
                      {closet.profilePhoto}
                    </div>

                    {/* Name & Username */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        margin: '0 0 4px 0',
                        textShadow: '0px 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        {closet.name}
                      </h3>
                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.9)',
                        margin: 0,
                        textShadow: '0px 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        @{closet.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '24px' }}>
                  {/* Tagline */}
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: 'rgba(0,0,0,0.7)',
                    lineHeight: '1.6',
                    margin: '0 0 20px 0',
                  }}>
                    {closet.tagline}
                  </p>

                  {/* Stats Row */}
                  <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginBottom: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #F0ECE3',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <Package size={16} color="#9F8151" />
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                      }}>
                        {closet.pieces} Pieces
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <Users size={16} color="#9F8151" />
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                      }}>
                        {closet.followers} Followers
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                  }}>
                    <motion.button
                      onClick={onClosetClick}
                      whileHover={{ backgroundColor: '#083D2C' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#0A4834',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      View Closet <ArrowRight size={16} />
                    </motion.button>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow(closet.id);
                      }}
                      whileHover={{ borderColor: '#0A4834' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: following.includes(closet.id) ? '#FFFFFF' : '#9F8151',
                        backgroundColor: following.includes(closet.id) ? '#0A4834' : 'transparent',
                        border: `1px solid ${following.includes(closet.id) ? '#0A4834' : '#9F8151'}`,
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Heart
                        size={16}
                        fill={following.includes(closet.id) ? '#FFFFFF' : 'none'}
                      />
                      {following.includes(closet.id) ? 'Following' : 'Follow'}
                    </motion.button>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareCloset(closet);
                      }}
                      whileHover={{ borderColor: '#9F8151', color: '#9F8151' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'transparent',
                        border: '1px solid #DCD6C9',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Share2 size={16} color="#0A4834" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Featured Closet Spotlight (after 3rd card) */}
              {index === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
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
                    {/* Featured Image */}
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
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#9F8151',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
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
                        lineHeight: '1.4',
                      }}>
                        "Clothes carry memories — I just help them find new ones."
                      </h3>

                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '16px',
                        color: 'rgba(0,0,0,0.7)',
                        margin: '0 0 20px 0',
                      }}>
                        — {featuredCloset.name}
                      </p>

                      <motion.button
                        onClick={onClosetClick}
                        whileHover={{ backgroundColor: '#0A4834', color: '#FFFFFF' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#9F8151',
                          backgroundColor: 'transparent',
                          border: '1px solid #9F8151',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
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
          transition={{ delay: 0.8 }}
          style={{
            marginTop: '80px',
            padding: '64px 40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '40px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 16px 0',
          }}>
            Open Your Closet to the World
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '18px',
            color: 'rgba(0,0,0,0.7)',
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Sell, share, and connect with conscious fashion lovers.
          </p>

          <motion.button
            whileHover={{ backgroundColor: '#0A4834' }}
            whileTap={{ scale: 0.98 }}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#9F8151',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 48px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Start Selling
          </motion.button>
        </motion.div>

        {/* Footer Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            textAlign: 'center',
            padding: '64px 0 0',
          }}
        >
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '28px',
            color: '#9F8151',
            margin: 0,
          }}>
            "Where every piece has a past, and every closet has a voice."
          </p>
        </motion.div>
      </div>

      <style>{`
        .closet-card:hover {
          transform: translateY(-4px);
          box-shadow: 0px 12px 32px rgba(0,0,0,0.12) !important;
        }
      `}</style>

      {/* Footer */}
      <FooterAlt onNewsletterClick={() => setNewsletterOpen(true)} />

      {/* Newsletter Popup */}
      <NewsletterPopup
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />

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
