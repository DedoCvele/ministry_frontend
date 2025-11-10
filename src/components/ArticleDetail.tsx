import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';
import './styles/ArticleDetail.css';

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
    <div className="article-detail-root">
      {/* Header */}
      <HeaderAlt />

      {/* Scroll Progress Bar */}
      <div className="article-progress-wrap">
        <motion.div
          className="article-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Grain Texture */}
      <div className="article-grain-texture" />

      {/* Back Button */}
      <motion.button
        onClick={handleBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="article-back-button"
      >
        <ArrowLeft size={20} color="#0A4834" />
      </motion.button>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="article-hero"
      >
        <ImageWithFallback
          src={article.heroImage}
          alt={article.title}
          className="article-hero-image"
        />
      </motion.div>

      {/* Article Content */}
      <div className="article-container">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="article-header-card"
        >
          <span className="article-category">{article.category}</span>

          <h1 className="article-title">{article.title}</h1>

          <p className="article-subtitle">{article.subtitle}</p>

          <div className="article-meta-row">
            <div className="article-meta">
              <p className="article-author">By {article.author}</p>
              <p className="article-date">{article.date} · {article.readTime}</p>
            </div>

            <div className="article-actions">
              <motion.button
                onClick={() => setLiked(!liked)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`like-button ${liked ? 'liked' : ''}`}
              >
                <Heart size={18} color="#9F8151" fill={liked ? '#9F8151' : 'none'} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="share-button"
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
          className="article-body"
        >
          {article.content.map((block, index) => {
            switch (block.type) {
              case 'lead':
                return (
                  <p key={index} className="lead-paragraph">{block.text}</p>
                );

              case 'paragraph':
                return (
                  <p key={index} className="article-paragraph">{block.text}</p>
                );

              case 'heading':
                return (
                  <h2 key={index} className="article-heading">{block.text}</h2>
                );

              case 'quote':
                return (
                  <div key={index} className="quote-block">
                    <p className="quote-text">"{block.text}"</p>
                  </div>
                );

              case 'tip':
                return (
                  <div key={index} className="tip-block">
                    <p className="tip-text">{block.text}</p>
                  </div>
                );

              case 'image':
                return (
                  <div key={index} className="image-block">
                    <ImageWithFallback src={block.src} alt={block.caption || ''} className="article-image" />
                    {block.caption && <p className="image-caption">{block.caption}</p>}
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
