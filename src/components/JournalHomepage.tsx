import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import { useIsMobile } from './ui/use-mobile';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';
import './styles/JournalHomepage.css';

// Use environment variables for API configuration, consistent with other components
const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;
const BACKEND_BASE_URL = API_ROOT;

interface Blog {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  image_url?: string | null;
  category?: string | null;
  user_id?: number;
  status?: number; // BlogStatus enum: 1 = Draft, 2 = Published
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
const FALLBACK_BLOG_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDQwMCAyODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyODAiIGZpbGw9IiNGNUY1RjUiLz4KICA8cGF0aCBkPSJNOTIgMTg0bDQwLTQwIDU2IDU2IDgwLTgwIDQwIDQwIiBzdHJva2U9IiNDRUNFQ0UiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDxjaXJjbGUgY3g9IjI2MCIgY3k9IjExNiIgcj0iMjAiIGZpbGw9IiNDRUNFQ0UiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9Ik1hbnJvcGUsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNCOEI4QjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIGltYWdlPC90ZXh0Pgo8L3N2Zz4K';

const validateAndFixUrl = (url: string | null | undefined): string => {
  if (!url || url.trim() === '') {
    return FALLBACK_BLOG_IMAGE;
  }
  
  const trimmedUrl = url.trim();

  if (trimmedUrl.includes('via.placeholder.com')) {
    return FALLBACK_BLOG_IMAGE;
  }
  
  // If it's already a full URL (http:// or https://), return as is
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl;
  }
  
  // If it starts with storage/ or is a relative path, prepend backend URL
  if (trimmedUrl.startsWith('storage/') || trimmedUrl.startsWith('/storage/')) {
    const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }

  // If backend returns a blog image path without /storage, normalize it
  if (trimmedUrl.startsWith('blogs/') || trimmedUrl.startsWith('/blogs/')) {
    const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `${BACKEND_BASE_URL}/storage${cleanPath}`;
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
    // If still not valid, return fallback image
    return FALLBACK_BLOG_IMAGE;
  }
};

// Helper function to map blog to article
const getExcerpt = (content: string, maxLength: number = 160): string => {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}...`;
};

const mapBlogToArticle = (blog: Blog): Article => {
  const content = blog.content || '';
  return {
    id: blog.id,
    title: blog.title,
    excerpt: getExcerpt(content),
    category: blog.category || 'Journal',
    image: validateAndFixUrl(blog.image_url ?? blog.image),
    author: 'Ministry Journal',
    date: formatDate(blog.created_at),
    readTime: calculateReadTime(content),
  };
};

export function JournalHomepage({ onArticleClick, onClose, language: languageProp }: JournalHomepageProps) {
  const navigate = useNavigate();
  const { language: contextLanguage } = useLanguage();
  const isMobile = useIsMobile();
  
  // Use language from context if available, otherwise use prop, otherwise default to 'en'
  const language = contextLanguage || languageProp || 'en';
  const t = getTranslation(language);
  
  const handleArticleClick = (articleId: number) => {
    if (onArticleClick) {
      onArticleClick(articleId);
    } else {
      navigate(`/blog/${articleId}`);
    }
  };
  
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(t.journal.homepage.all);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Update selectedCategory when language changes
  useEffect(() => {
    setSelectedCategory(t.journal.homepage.all);
  }, [language, t.journal.homepage.all]);
  
  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Items per page: 6 for desktop, 4 for mobile
  const itemsPerPage = isMobile ? 4 : 6;

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/blogs`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const payload = response.data;
        const blogs: Blog[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.data)
              ? payload.data.data
              : [];

        if (blogs.length === 0) {
          if (payload?.data || payload?.status) {
            setArticles([]);
          } else {
            console.warn('Unexpected API response structure:', payload);
            setError(t.journal.homepage.failedToLoad);
          }
          return;
        }

        // Filter only published blogs when status is present (BlogStatus::Published = 2)
        const publishedBlogs = blogs.filter(blog => blog.status ? blog.status === 2 : true);
        const mappedArticles = publishedBlogs.map(mapBlogToArticle);
        setArticles(mappedArticles);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        if (err.response) {
          // API responded with error status
          console.error('API Error:', err.response.status, err.response.data);
          setError(t.journal.homepage.failedToLoadDesc);
        } else if (err.request) {
          // Request was made but no response received
          console.error('Network Error: No response from server');
          setError('Unable to connect to server. Please check your connection.');
        } else {
          // Something else happened
          setError(t.journal.homepage.failedToLoadDesc);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [t.journal.homepage.failedToLoad, t.journal.homepage.failedToLoadDesc]);

  // Extract unique categories from articles
  const categories = [t.journal.homepage.all, ...Array.from(new Set(articles.map(article => article.category).filter(Boolean)))];

  const filteredArticles = useMemo(() => {
    const filtered = selectedCategory === t.journal.homepage.all
      ? articles 
      : articles.filter(article => article.category === selectedCategory);
    return filtered;
  }, [articles, selectedCategory, t.journal.homepage.all]);

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  
  // Pagination logic
  const articlesToDisplay = useMemo(() => {
    // Skip featured article if it exists
    const articlesWithoutFeatured = featuredArticle 
      ? filteredArticles.slice(1)
      : filteredArticles;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return articlesWithoutFeatured.slice(startIndex, endIndex);
  }, [filteredArticles, featuredArticle, currentPage, itemsPerPage]);
  
  const totalPages = useMemo(() => {
    const articlesWithoutFeatured = featuredArticle 
      ? filteredArticles.slice(1)
      : filteredArticles;
    return Math.ceil(articlesWithoutFeatured.length / itemsPerPage);
  }, [filteredArticles, featuredArticle, itemsPerPage]);

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
            {t.journal.homepage.title}
          </h1>
          <p className="journal-header-subtitle">
            {t.journal.homepage.subtitle}
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
              {t.journal.homepage.loading}
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
              {t.journal.homepage.noBlogs}
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
                    {t.journal.homepage.readArticle} <ArrowRight size={18} />
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
              {articlesToDisplay.map((article, index) => (
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
                    {t.journal.homepage.read} <ArrowRight size={16} />
                  </motion.div>
                </div>
              </div>
              </motion.div>
            ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="journal-pagination-wrapper">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(prev => prev - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                      />
                    </PaginationItem>
                    
                    {(() => {
                      const pages: (number | 'ellipsis')[] = [];
                      const showEllipsis = totalPages > 7;
                      
                      if (!showEllipsis) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Always show first page
                        pages.push(1);
                        
                        if (currentPage <= 4) {
                          // Near the start: show 1, 2, 3, 4, 5, ..., last
                          for (let i = 2; i <= 5; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 3) {
                          // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
                          pages.push('ellipsis');
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // In the middle: show 1, ..., current-1, current, current+1, ..., last
                          pages.push('ellipsis');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis');
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((item, index) => {
                        if (item === 'ellipsis') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={item}>
                            <PaginationLink
                              isActive={currentPage === item}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(item);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="cursor-pointer"
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      });
                    })()}
                    
                    <PaginationItem>
                      <PaginationNext
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage(prev => prev + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
              {t.journal.homepage.joinTitle}
            </h2>

            <p className="journal-newsletter-desc">
              {t.journal.homepage.joinDesc}
            </p>

            <form onSubmit={handleSubscribe} className="journal-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.journal.homepage.emailPlaceholder}
                required
                className="journal-newsletter-input"
              />

              <motion.button
                type="submit"
                whileHover={{ backgroundColor: '#083D2C' }}
                whileTap={{ scale: 0.98 }}
                className="journal-newsletter-btn"
              >
              {t.journal.homepage.subscribe} <ArrowRight size={18} />
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
          "{t.journal.homepage.tagline}"
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
