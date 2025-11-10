import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';

interface ArticleDetailProps {
  articleId?: number;
  onBack?: () => void;
  language?: Language;
}

export function ArticleDetail({ articleId: propArticleId, onBack, language = 'en' }: ArticleDetailProps) {
  const { articleId: paramArticleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const articleId = propArticleId || (paramArticleId ? parseInt(paramArticleId, 10) : 1);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/blog');
    }
  };
  const t = getTranslation(language);
  const [liked, setLiked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock article data - in a real app this would be fetched based on articleId
  const article = {
    id: articleId,
    title: 'The New Era of Conscious Luxury',
    subtitle: 'Why second-hand is the smartest style statement of 2025',
    author: 'Sofia Laurent',
    date: 'October 25, 2025',
    readTime: '5 min read',
    category: 'Style Stories',
    heroImage: 'https://images.unsplash.com/photo-1628668003003-85488fe78821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmFzaGlvbiUyMGVkaXRvcmlhbHxlbnwxfHx8fDE3NjE1NzE3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    content: [
      {
        type: 'lead',
        text: 'There was a time when "second-hand" carried a stigma. Today, it\'s the ultimate status symbol — a marker of taste, consciousness, and individuality that new fashion simply cannot replicate.',
      },
      {
        type: 'paragraph',
        text: 'Walking through the ateliers of Paris, the vintage boutiques of Tokyo, or the curated closets of Instagram, one thing becomes abundantly clear: the future of luxury is circular. What was once old is now gold, and the smartest dressers know it.',
      },
      {
        type: 'heading',
        text: 'The Shift in Value',
      },
      {
        type: 'paragraph',
        text: 'For decades, fashion operated on a simple premise: newer was better. Collections changed with the seasons, and last year\'s pieces were forgotten. But something fundamental has changed in how we perceive value.',
      },
      {
        type: 'tip',
        text: '💡 Styling Tip: Pair muted tones with vintage gold accessories for a timeless 70s look that feels fresh in 2025.',
      },
      {
        type: 'paragraph',
        text: 'Today\'s luxury consumer is educated, discerning, and increasingly aware of fashion\'s environmental impact. They understand that a vintage Hermès bag carries more cachet than this season\'s mass-produced "it" bag. They know that a perfectly tailored 1980s blazer tells a better story than something fresh off the runway.',
      },
      {
        type: 'quote',
        text: 'Elegance is not about being noticed, it\'s about being remembered.',
      },
      {
        type: 'heading',
        text: 'Quality Over Quantity',
      },
      {
        type: 'paragraph',
        text: 'Second-hand luxury teaches us to be intentional. Each piece in a curated vintage wardrobe has earned its place through timeless design, exceptional craftsmanship, and personal resonance. This is fashion as curation, not consumption.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1645550294607-c9955e906ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzYxNTc5MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'A thoughtfully curated closet tells a story of style, not trends.',
      },
      {
        type: 'paragraph',
        text: 'When you buy vintage, you\'re not just purchasing an item — you\'re inheriting a legacy. You\'re choosing pieces that have already proven their worth by surviving decades of changing trends. This is fashion with a past, and therefore, a future.',
      },
      {
        type: 'tip',
        text: '💡 Shopping Tip: Look for pieces with classic silhouettes and neutral colors — they integrate seamlessly into modern wardrobes.',
      },
      {
        type: 'heading',
        text: 'The New Status Symbol',
      },
      {
        type: 'paragraph',
        text: 'In an age of overproduction and overconsumption, restraint is radical. Choosing second-hand is no longer about saving money — it\'s about making a statement. It says you value authenticity over trends, quality over quantity, and consciousness over conformity.',
      },
      {
        type: 'paragraph',
        text: 'The most stylish people aren\'t those who can afford the latest collection. They\'re the ones who know how to mix a vintage Chanel jacket with contemporary denim, who can spot a treasure in a sea of clothes, who understand that true luxury is timeless.',
      },
    ],
  };

  return (
    <div style={{
      backgroundColor: '#F0ECE3',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Header */}
      <HeaderAlt />

      {/* Scroll Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: 'rgba(159,129,81,0.2)',
        zIndex: 1000,
      }}>
        <motion.div
          style={{
            height: '100%',
            backgroundColor: '#9F8151',
            width: `${scrollProgress}%`,
            transition: 'width 0.1s ease',
          }}
        />
      </div>

      {/* Grain Texture */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.015,
        backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=\')',
      }} />

      {/* Back Button */}
      <motion.button
        onClick={handleBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '32px',
          left: '32px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #DCD6C9',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'all 0.3s ease',
        }}
      >
        <ArrowLeft size={20} color="#0A4834" />
      </motion.button>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
        }}
      >
        <ImageWithFallback
          src={article.heroImage}
          alt={article.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '0 0 24px 24px',
          }}
        />
      </motion.div>

      {/* Article Content */}
      <div style={{
        maxWidth: '800px',
        margin: '-100px auto 0',
        padding: '0 32px 40px',
        position: 'relative',
      }}>
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '48px',
            marginBottom: '40px',
            boxShadow: '0px 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <span style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#9F8151',
            backgroundColor: 'rgba(159,129,81,0.1)',
            padding: '6px 16px',
            borderRadius: '16px',
            display: 'inline-block',
            marginBottom: '24px',
          }}>
            {article.category}
          </span>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '48px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 16px 0',
            lineHeight: '1.2',
          }}>
            {article.title}
          </h1>

          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px',
            color: '#9F8151',
            margin: '0 0 32px 0',
            lineHeight: '1.4',
          }}>
            {article.subtitle}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #F0ECE3',
          }}>
            <div>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9F8151',
                margin: '0 0 4px 0',
              }}>
                By {article.author}
              </p>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: 'rgba(0,0,0,0.6)',
                margin: 0,
              }}>
                {article.date} · {article.readTime}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                onClick={() => setLiked(!liked)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: liked ? 'rgba(159,129,81,0.1)' : '#F0ECE3',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <Heart size={18} color="#9F8151" fill={liked ? '#9F8151' : 'none'} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#F0ECE3',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={18} color="#9F8151" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Article Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {article.content.map((block, index) => {
            switch (block.type) {
              case 'lead':
                return (
                  <p
                    key={index}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '20px',
                      fontWeight: 500,
                      color: '#0A4834',
                      lineHeight: '1.7',
                      marginBottom: '32px',
                    }}
                  >
                    {block.text}
                  </p>
                );

              case 'paragraph':
                return (
                  <p
                    key={index}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                      color: '#000000',
                      lineHeight: '1.8',
                      marginBottom: '24px',
                    }}
                  >
                    {block.text}
                  </p>
                );

              case 'heading':
                return (
                  <h2
                    key={index}
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '32px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: '48px 0 24px 0',
                    }}
                  >
                    {block.text}
                  </h2>
                );

              case 'quote':
                return (
                  <div
                    key={index}
                    style={{
                      padding: '48px 0',
                      margin: '48px 0',
                      borderTop: '1px solid rgba(159,129,81,0.3)',
                      borderBottom: '1px solid rgba(159,129,81,0.3)',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontStyle: 'italic',
                        fontSize: '24px',
                        color: '#9F8151',
                        margin: 0,
                        lineHeight: '1.5',
                      }}
                    >
                      "{block.text}"
                    </p>
                  </div>
                );

              case 'tip':
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#F0ECE3',
                      borderLeft: '4px solid #9F8151',
                      borderRadius: '12px',
                      padding: '20px 24px',
                      margin: '32px 0',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        color: '#0A4834',
                        margin: 0,
                        lineHeight: '1.6',
                      }}
                    >
                      {block.text}
                    </p>
                  </div>
                );

              case 'image':
                return (
                  <div
                    key={index}
                    style={{
                      margin: '48px 0',
                    }}
                  >
                    <ImageWithFallback
                      src={block.src}
                      alt={block.caption || ''}
                      style={{
                        width: '100%',
                        borderRadius: '16px',
                        marginBottom: '12px',
                      }}
                    />
                    {block.caption && (
                      <p
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontStyle: 'italic',
                          fontSize: '14px',
                          color: '#9F8151',
                          textAlign: 'center',
                          margin: 0,
                        }}
                      >
                        {block.caption}
                      </p>
                    )}
                  </div>
                );

              default:
                return null;
            }
          })}
        </motion.div>


      </div>

      <FooterAlt />
    </div>
  );
}
