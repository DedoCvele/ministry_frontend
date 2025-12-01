import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';
import './styles/JournalHomepage.css';

const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_BASE_URL = 'http://localhost:8000';

interface Blog {
  id: number;
  title: string;
  category: string;
  short_summary: string;
  full_story: string;
  image_url: string;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

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

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Helper function to calculate read time
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

// Helper function to validate and fix URLs
const validateAndFixUrl = (url: string | null | undefined): string => {
  if (!url || url.trim() === '') {
    return 'https://via.placeholder.com/400x280?text=No+Image';
  }
  
  const trimmedUrl = url.trim();
  
  // If it's already a full URL (http:// or https://), return as is
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl;
  }
  
  // If it starts with storage/ or is a relative path, prepend backend URL
  if (trimmedUrl.startsWith('storage/') || trimmedUrl.startsWith('/storage/')) {
    const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }
  
  // If it starts with //, add https:
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }
  
  // Try to validate as URL
  try {
    new URL(trimmedUrl);
    return trimmedUrl;
  } catch {
    // If it doesn't start with http:// or https://, try prepending backend URL first
    const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    const backendUrl = `${BACKEND_BASE_URL}${cleanPath}`;
    
    // If that doesn't work, try adding https://
    if (!trimmedUrl.match(/^https?:\/\//i)) {
      // Try backend URL first (for storage paths)
      return backendUrl;
    }
    // If still not valid, return placeholder
    return 'https://via.placeholder.com/400x280?text=Invalid+URL';
  }
};

// Helper function to map blog to article
const mapBlogToArticle = (blog: Blog): Article => {
  return {
    id: blog.id,
    title: blog.title,
    excerpt: blog.short_summary || '',
    category: blog.category || 'Uncategorized',
    image: validateAndFixUrl(blog.image_url),
    author: 'Ministry Journal',
    date: formatDate(blog.created_at),
    readTime: calculateReadTime(blog.full_story || ''),
  };
};

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/blogs`);
        
        if (response.data.status === 'success' && response.data.data) {
          const blogs: Blog[] = response.data.data;
          // Filter only published blogs
          const publishedBlogs = blogs.filter(blog => blog.status === 'published');
          const mappedArticles = publishedBlogs.map(mapBlogToArticle);
          setArticles(mappedArticles);
        } else {
          setError('Failed to load blogs');
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Extract unique categories from articles
  const categories = ['All', ...Array.from(new Set(articles.map(article => article.category).filter(Boolean)))];

  const filteredArticles = selectedCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticle = articles.length > 0 ? articles[0] : null;

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', color: '#9F8151' }}>
              Loading blogs...
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', color: '#9F8151' }}>
              {error}
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', color: '#9F8151' }}>
              No blogs available at the moment.
            </p>
          </div>
        ) : (
          <>
            {/* Hero Featured Article */}
            {featuredArticle && (
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
            )}

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
              {filteredArticles.slice(featuredArticle ? 1 : 0).map((article, index) => (
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
          </>
        )}

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
