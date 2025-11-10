import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';
import './styles/JournalHomepage.css';

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
    <div className="journal-page-root">
      {/* Header */}
      <HeaderAlt />

      {/* Grain Texture Overlay */}
      <div className="journal-grain-overlay" />

      {/* Sticky Header */}
      <motion.header className="journal-header">
        <div className="journal-header-content">
          <h1 className="journal-header-title">
            Ministry Journal
          </h1>
          <p className="journal-header-subtitle">
            Stories, style tips, and sustainable inspiration.
          </p>

          {/* Divider */}
          <div className="journal-header-divider" />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="journal-main-content">
        {/* Hero Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => handleArticleClick(featuredArticle.id)}
          className="journal-featured-article"
        >
          <ImageWithFallback
            src={featuredArticle.image}
            alt={featuredArticle.title}
            className="journal-featured-image"
          />

          {/* Gradient Overlay */}
          <div className="journal-featured-overlay" />

          {/* Content */}
          <div className="journal-featured-content">
            <motion.span
              whileHover={{ backgroundColor: '#9F8151' }}
              className="journal-featured-category"
            >
              {featuredArticle.category}
            </motion.span>

            <h2 className="journal-featured-title">
              {featuredArticle.title}
            </h2>

            <p className="journal-featured-excerpt">
              {featuredArticle.excerpt}
            </p>

            <motion.button
              whileHover={{ borderColor: '#9F8151', color: '#9F8151' }}
              whileTap={{ scale: 0.98 }}
              className="journal-featured-btn"
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
          className="journal-categories"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`journal-category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Article Grid */}
        <div className="journal-article-grid">
          {filteredArticles.slice(1).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onClick={() => handleArticleClick(article.id)}
              className="journal-article-card"
              whileHover={{ y: -8, boxShadow: '0px 12px 32px rgba(0,0,0,0.1)' }}
            >
              {/* Image */}
              <div className="journal-article-image">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="journal-article-image-wrapper"
                >
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="journal-article-img"
                  />
                </motion.div>

                {/* Overlay on hover */}
                <div className="article-overlay" />
              </div>

              {/* Content */}
              <div className="journal-article-content">
                <span className="journal-article-category">
                  {article.category}
                </span>

                <h3 className="journal-article-title">
                  {article.title}
                </h3>

                <p className="journal-article-excerpt">
                  {article.excerpt}
                </p>

                <div className="journal-article-footer">
                  <div className="journal-article-meta">
                    <p className="journal-article-author">
                      {article.author}
                    </p>
                    <p className="journal-article-date">
                      {article.date} · {article.readTime}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="journal-article-read"
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
          className="journal-newsletter-cta"
        >
          {/* Fabric texture overlay */}
          <div className="journal-newsletter-texture" />

          <div className="journal-newsletter-content">
            <h2 className="journal-newsletter-title">
              Join the Ministry Journal
            </h2>

            <p className="journal-newsletter-desc">
              Get styling tips, stories, and sustainable inspiration in your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="journal-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="journal-newsletter-input"
              />

              <motion.button
                type="submit"
                whileHover={{ backgroundColor: '#083D2C' }}
                whileTap={{ scale: 0.98 }}
                className="journal-newsletter-btn"
              >
              Subscribe <ArrowRight size={18} />
            </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Footer Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="journal-footer-tagline"
        >
          "Read. Learn. Rewear."
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
