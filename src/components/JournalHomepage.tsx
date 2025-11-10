import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
}

interface JournalHomepageProps {
  onArticleClick?: (articleId: number) => void;
  language?: Language;
  onClose?: () => void;
}

export function JournalHomepage({ onArticleClick, onClose, language = 'en' }: JournalHomepageProps) {
  const navigate = useNavigate();
  
  const handleArticleClick = (articleId: number) => {
    if (onArticleClick) {
      onArticleClick(articleId);
    } else {
      navigate(`/blog/${articleId}`);
    }
  };
  const t = getTranslation(language);
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const articles: Article[] = [
    {
      id: 1,
      title: 'The New Era of Conscious Luxury',
      excerpt: 'Why second-hand is the smartest style statement of 2025. Discover how vintage pieces are redefining modern elegance.',
      category: 'Style Stories',
      image: 'https://images.unsplash.com/photo-1628668003003-85488fe78821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmFzaGlvbiUyMGVkaXRvcmlhbHxlbnwxfHx8fDE3NjE1NzE3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Sofia Laurent',
      date: 'Oct 25, 2025',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Building a Timeless Wardrobe',
      excerpt: 'The art of curating pieces that transcend trends and tell your unique story through sustainable choices.',
      category: 'Fashion Education',
      image: 'https://images.unsplash.com/photo-1645550294607-c9955e906ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzYxNTc5MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Emma Rodriguez',
      date: 'Oct 22, 2025',
      readTime: '7 min read',
    },
    {
      id: 3,
      title: 'The Luxury of Less',
      excerpt: 'How minimalist fashion is creating space for what truly matters in your closet and your life.',
      category: 'Circular Living',
      image: 'https://images.unsplash.com/photo-1742540676779-b49c3406be26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXJkcm9iZSUyMHN0eWxpbmd8ZW58MXx8fHwxNzYxNTc5MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Isabella Chen',
      date: 'Oct 20, 2025',
      readTime: '6 min read',
    },
    {
      id: 4,
      title: 'Styling Vintage Silhouettes',
      excerpt: 'Modern ways to wear classic cuts and reimagine heritage pieces for contemporary elegance.',
      category: 'Style Stories',
      image: 'https://images.unsplash.com/photo-1624533523809-3d27d9ea6d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2MTQ4OTQyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Ava Smith',
      date: 'Oct 18, 2025',
      readTime: '5 min read',
    },
    {
      id: 5,
      title: 'The Jewelry Renaissance',
      excerpt: 'Discovering treasures: how vintage accessories are making a powerful comeback in modern wardrobes.',
      category: 'Journal Notes',
      image: 'https://images.unsplash.com/photo-1652816691871-252a93d1e39d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYWNjZXNzb3JpZXMlMjBqZXdlbHJ5fGVufDF8fHx8MTc2MTU1NDgzMnww&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Mia Jones',
      date: 'Oct 15, 2025',
      readTime: '4 min read',
    },
    {
      id: 6,
      title: 'From Fast to Forever Fashion',
      excerpt: 'A personal journey of rediscovering style through conscious consumption and meaningful pieces.',
      category: 'Circular Living',
      image: 'https://images.unsplash.com/photo-1639244151653-7807947de5a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbWFnYXppbmUlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzYxNTAxNzM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Olivia Taylor',
      date: 'Oct 12, 2025',
      readTime: '8 min read',
    },
  ];

  const categories = ['All', 'Style Stories', 'Fashion Education', 'Circular Living', 'Journal Notes'];

  const filteredArticles = selectedCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticle = articles[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <div style={{
      backgroundColor: '#F0ECE3',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Header */}
      <HeaderAlt />

      {/* Grain Texture Overlay */}
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

      {/* Sticky Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(240,236,227,0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(159,129,81,0.1)',
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '32px 64px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '40px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 8px 0',
          }}>
            Ministry Journal
          </h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '18px',
            color: '#9F8151',
            margin: 0,
          }}>
            Stories, style tips, and sustainable inspiration.
          </p>

          {/* Divider */}
          <div style={{
            width: '80px',
            height: '2px',
            backgroundColor: 'rgba(159,129,81,0.3)',
            margin: '24px auto 0',
          }} />
        </div>
      </motion.header>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 64px 120px',
      }}>
        {/* Hero Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => handleArticleClick(featuredArticle.id)}
          style={{
            position: 'relative',
            height: '600px',
            borderRadius: '24px',
            overflow: 'hidden',
            cursor: 'pointer',
            marginBottom: '80px',
          }}
        >
          <ImageWithFallback
            src={featuredArticle.image}
            alt={featuredArticle.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '64px',
          }}>
            <motion.span
              whileHover={{ backgroundColor: '#9F8151' }}
              style={{
                display: 'inline-block',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#000000',
                backgroundColor: 'rgba(159,129,81,0.9)',
                padding: '6px 16px',
                borderRadius: '20px',
                marginBottom: '16px',
                transition: 'all 0.3s ease',
              }}
            >
              {featuredArticle.category}
            </motion.span>

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '56px',
              fontWeight: 600,
              color: '#FFFFFF',
              margin: '0 0 16px 0',
              maxWidth: '700px',
            }}>
              {featuredArticle.title}
            </h2>

            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.9)',
              margin: '0 0 32px 0',
              maxWidth: '600px',
            }}>
              {featuredArticle.excerpt}
            </p>

            <motion.button
              whileHover={{ borderColor: '#9F8151', color: '#9F8151' }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: 'transparent',
                border: '2px solid #FFFFFF',
                borderRadius: '12px',
                padding: '14px 32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Read Article <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Categories Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '64px',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: selectedCategory === category ? '#FFFFFF' : '#0A4834',
                backgroundColor: selectedCategory === category ? '#0A4834' : '#FFFFFF',
                border: '1px solid #DCD6C9',
                borderRadius: '24px',
                padding: '10px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Article Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
          marginBottom: '120px',
        }}>
          {filteredArticles.slice(1).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onClick={() => handleArticleClick(article.id)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              whileHover={{ y: -8, boxShadow: '0px 12px 32px rgba(0,0,0,0.1)' }}
            >
              {/* Image */}
              <div style={{
                width: '100%',
                height: '280px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </motion.div>

                {/* Overlay on hover */}
                <div
                  className="article-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(159,129,81,0)',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ padding: '28px' }}>
                <span style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#9F8151',
                  backgroundColor: 'rgba(159,129,81,0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  marginBottom: '16px',
                }}>
                  {article.category}
                </span>

                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#0A4834',
                  margin: '0 0 12px 0',
                  lineHeight: '1.3',
                }}>
                  {article.title}
                </h3>

                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: 'rgba(0,0,0,0.7)',
                  lineHeight: '1.6',
                  margin: '0 0 20px 0',
                }}>
                  {article.excerpt}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #F0ECE3',
                }}>
                  <div>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#000000',
                      margin: '0 0 4px 0',
                    }}>
                      {article.author}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '12px',
                      color: '#9F8151',
                      margin: 0,
                    }}>
                      {article.date} · {article.readTime}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      color: '#9F8151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    Read <ArrowRight size={16} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            backgroundColor: '#F0ECE3',
            borderRadius: '24px',
            padding: '80px 64px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Fabric texture overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+\')',
          }} />

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 16px 0',
            position: 'relative',
            zIndex: 1,
          }}>
            Join the Ministry Journal
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: '#9F8151',
            margin: '0 0 40px 0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative',
            zIndex: 1,
          }}>
            Get styling tips, stories, and sustainable inspiration in your inbox.
          </p>

          <form onSubmit={handleSubscribe} style={{
            display: 'flex',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              style={{
                flex: 1,
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                color: '#000000',
                backgroundColor: '#FFFFFF',
                border: '1px solid #9F8151',
                borderRadius: '12px',
                padding: '14px 20px',
                outline: 'none',
              }}
            />

            <motion.button
              type="submit"
              whileHover={{ backgroundColor: '#083D2C' }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#0A4834',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Subscribe <ArrowRight size={18} />
            </motion.button>
          </form>
        </motion.div>

        {/* Footer Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '80px 0 40px',
          }}
        >
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '32px',
            color: '#9F8151',
            margin: 0,
          }}>
            "Read. Learn. Rewear."
          </p>
        </motion.div>
      </div>

      <FooterAlt />

      <style>{`
        .article-overlay {
          transition: all 0.3s ease;
        }
        
        div:hover .article-overlay {
          background-color: rgba(159,129,81,0.2) !important;
        }
      `}</style>
    </div>
  );
}
