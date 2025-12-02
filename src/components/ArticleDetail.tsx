import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';
import './styles/ArticleDetail.css';

const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_BASE_URL = 'http://localhost:8000';

interface ArticleDetailProps {
  articleId?: number;
  onBack?: () => void;
  language?: Language;
}

interface Blog {
  id: number;
  title: string;
  category: string;
  short_summary: string;
  content: string;
  image_url: string;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ContentBlock {
  type: 'lead' | 'paragraph' | 'heading' | 'quote' | 'tip' | 'image';
  text?: string;
  src?: string;
  caption?: string;
}

export function ArticleDetail({ articleId: propArticleId, onBack, language = 'en' }: ArticleDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = propArticleId || (id ? parseInt(id, 10) : undefined);
  
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
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
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
      return 'https://via.placeholder.com/1200x500?text=No+Image';
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
      return `${BACKEND_BASE_URL}${cleanPath}`;
    }
  };

  // Helper function to parse content into content blocks
  const parseContent = (fullStory: string): ContentBlock[] => {
    if (!fullStory || typeof fullStory !== 'string' || fullStory.trim() === '') {
      return [];
    }
    
    const trimmedStory = fullStory.trim();
    
    // First, try to split by double newlines
    let paragraphs = trimmedStory.split(/\n\n+/).filter(p => p.trim());
    
    // If that doesn't work, try single newlines
    if (paragraphs.length === 0 || (paragraphs.length === 1 && paragraphs[0].length > 500)) {
      paragraphs = trimmedStory.split(/\n+/).filter(p => p.trim());
    }
    
    // If still no paragraphs, treat the whole thing as one paragraph
    if (paragraphs.length === 0) {
      paragraphs = [trimmedStory];
    }
    
    const content: ContentBlock[] = [];
    
    paragraphs.forEach((para, index) => {
      const trimmed = para.trim();
      
      if (!trimmed || trimmed.length === 0) return; // Skip empty paragraphs
      
      // Check if it's a heading (starts with #)
      if (trimmed.startsWith('#')) {
        const headingText = trimmed.replace(/^#+\s*/, '').trim();
        if (headingText) {
          content.push({
            type: 'heading',
            text: headingText
          });
        }
      }
      // Check if it's a quote (starts and ends with quotes, and is relatively short)
      else if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
               (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        if (trimmed.length < 300) {
          const quoteText = trimmed.replace(/^["']|["']$/g, '').trim();
          if (quoteText) {
            content.push({
              type: 'quote',
              text: quoteText
            });
          }
        } else {
          // Long quoted text, treat as paragraph
          content.push({
            type: index === 0 ? 'lead' : 'paragraph',
            text: trimmed
          });
        }
      }
      // Check if it's a tip (contains 💡 or starts with "Tip:")
      else if (trimmed.includes('💡') || trimmed.toLowerCase().startsWith('tip:')) {
        content.push({
          type: 'tip',
          text: trimmed
        });
      }
      // First paragraph is usually the lead (if it's substantial)
      else if (index === 0 && trimmed.length > 50) {
        content.push({
          type: 'lead',
          text: trimmed
        });
      }
      // Regular paragraph
      else {
        content.push({
          type: 'paragraph',
          text: trimmed
        });
      }
    });
    
    return content;
  };

  // Fetch blog data from API when page opens
  useEffect(() => {
    const fetchBlog = async () => {
      if (!articleId) {
        setError('Article ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/blogs/${articleId}`);
        
        if (response.data.status === 'success' && response.data.data) {
          const blogData = response.data.data;
          // Debug: Check if content exists
          if (!blogData.content || blogData.content.trim() === '') {
            console.warn('Blog fetched but content is empty:', blogData);
          }
          setBlog(blogData);
        } else {
          setError('Blog not found');
        }
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        if (err.response?.status === 404) {
          setError('Blog not found');
        } else {
          setError('Failed to load blog. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoize parsed content to prevent re-parsing on every render
  const parsedContent = useMemo(() => {
    if (!blog || !blog.content) return [];
    const content = parseContent(blog.content);
    return content;
  }, [blog?.id, blog?.content]);

  // Map blog data to article format - memoized to prevent re-renders
  const article = useMemo(() => {
    if (!blog) return null;
    
    return {
      id: blog.id,
      title: blog.title,
      subtitle: blog.short_summary || '',
      author: 'Ministry Journal',
      date: formatDate(blog.created_at),
      readTime: calculateReadTime(blog.content || ''),
      category: blog.category || 'Uncategorized',
      heroImage: validateAndFixUrl(blog.image_url),
      content: parsedContent
    };
  }, [blog, parsedContent]);

  // Loading state
  if (loading) {
    return (
      <div className="article-detail-root">
        <HeaderAlt />
        <div className="article-container" style={{ paddingTop: '200px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#9F8151' }}>Loading article...</p>
        </div>
        <FooterAlt />
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="article-detail-root">
        <HeaderAlt />
        <div className="article-container" style={{ paddingTop: '200px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#9F8151', marginBottom: '16px' }}>{error || 'Article not found'}</p>
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#9F8151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif'
            }}
          >
            Back to Blog
          </motion.button>
        </div>
        <FooterAlt />
      </div>
    );
  }

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

      {/* Article Content - Two Column Layout */}
      <div className="article-container">
        <div className="article-content-wrapper">
          {/* Left Column - Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="article-header-card"
          >
            <span className="article-category">{article.category}</span>

            <h1 className="article-title">{article.title}</h1>

            {article.subtitle && (
              <p className="article-subtitle">{article.subtitle}</p>
            )}

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

          {/* Right Column - Article Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="article-body"
          >
            {(() => {
              // First, check if we have blog data with content
              if (!blog || !blog.content) {
                return <p className="article-paragraph">No content available.</p>;
              }

              // Try to use parsed content first
              if (article && article.content && article.content.length > 0) {
                return article.content.map((block, index) => {
                  if (!block || (!block.text && !block.src)) return null;
                  
                  switch (block.type) {
                    case 'lead':
                      return block.text ? (
                        <p key={`lead-${index}`} className="lead-paragraph">{block.text}</p>
                      ) : null;

                    case 'paragraph':
                      return block.text ? (
                        <p key={`para-${index}`} className="article-paragraph">{block.text}</p>
                      ) : null;

                    case 'heading':
                      return block.text ? (
                        <h2 key={`heading-${index}`} className="article-heading">{block.text}</h2>
                      ) : null;

                    case 'quote':
                      return block.text ? (
                        <div key={`quote-${index}`} className="quote-block">
                          <p className="quote-text">"{block.text}"</p>
                        </div>
                      ) : null;

                    case 'tip':
                      return block.text ? (
                        <div key={`tip-${index}`} className="tip-block">
                          <p className="tip-text">{block.text}</p>
                        </div>
                      ) : null;

                    case 'image':
                      return block.src ? (
                        <div key={`image-${index}`} className="image-block">
                          <ImageWithFallback src={block.src} alt={block.caption || ''} className="article-image" />
                          {block.caption && <p className="image-caption">{block.caption}</p>}
                        </div>
                      ) : null;

                    default:
                      return block.text ? (
                        <p key={`unknown-${index}`} className="article-paragraph">{block.text}</p>
                      ) : null;
                  }
                }).filter(Boolean);
              }
              
              // Fallback: display raw content as paragraphs
              const fullStory = blog.content.trim();
              if (fullStory) {
                const paragraphs = fullStory.split(/\n\n+/).filter(p => p.trim());
                if (paragraphs.length === 0) {
                  // If no double newlines, try single newlines
                  const singleLineParas = fullStory.split(/\n+/).filter(p => p.trim());
                  if (singleLineParas.length > 0) {
                    return singleLineParas.map((para, index) => (
                      <p key={`fallback-${index}`} className={index === 0 ? 'lead-paragraph' : 'article-paragraph'}>
                        {para.trim()}
                      </p>
                    ));
                  }
                  // If still no paragraphs, treat entire content as one paragraph
                  return (
                    <p key="fallback-single" className="lead-paragraph">
                      {fullStory}
                    </p>
                  );
                }
                return paragraphs.map((para, index) => (
                  <p key={`fallback-${index}`} className={index === 0 ? 'lead-paragraph' : 'article-paragraph'}>
                    {para.trim()}
                  </p>
                ));
              }
              
              return <p className="article-paragraph">No content available.</p>;
            })()}
          </motion.div>
        </div>
      </div>

      <FooterAlt />
    </div>
  );
}
