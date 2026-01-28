import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/JournalSpread.css';

// Use environment variables for API configuration, consistent with other components
const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;
const BACKEND_BASE_URL = API_ROOT;

interface JournalSpreadProps {
}

interface Blog {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  image_url?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  status?: number; // BlogStatus enum: 1 = Draft, 2 = Published
  created_at: string;
  updated_at: string;
}

interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  image: string;
  alignment: 'left' | 'right';
}

// Helper function to validate and fix URLs
const FALLBACK_BLOG_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNGNUY1RjUiLz4KICA8cGF0aCBkPSJNMjAwIDI4MGw4MC04MCAxMTIgMTEyIDE2MC0xNjAgODAgODAiIHN0cm9rZT0iN0M3QzddIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8Y2lyY2xlIGN4PSI1MjAiIGN5PSIxNzYiIHI9IjMwIiBmaWxsPSIjN0M3QzdDIi8+CiAgPHRleHQgeD0iNDAwIiB5PSIxOTAiIGZvbnQtZmFtaWx5PSJNYW5yb3BlLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBpbWFnZTwvdGV4dD4KPC9zdmc+Cg==';

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
  
  // Otherwise, assume it's a relative path and prepend backend URL
  const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

// Helper function to generate random read time between 5-10 minutes
const generateRandomReadTime = (language: string): string => {
  const minutes = Math.floor(Math.random() * 6) + 5; // Random number between 5-10
  return language === 'en' ? `${minutes} min read` : `${minutes} мин читање`;
};

export function JournalSpread({}: JournalSpreadProps = {}) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = getTranslation(language);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch top 3 most recently added blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_BASE_URL}/blogs`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        // Handle different response structures
        let blogs: Blog[] = [];
        if (Array.isArray(response.data)) {
          blogs = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          blogs = response.data.data;
        }
        
        // Filter only published blogs (status === 2) and sort by created_at (newest first)
        const publishedBlogs = blogs
          .filter(blog => blog.status ? blog.status === 2 : true)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3); // Get top 3 most recent
        
        // Map blogs to articles with alternating alignment
        const mappedArticles: Article[] = publishedBlogs.map((blog, index) => ({
          id: blog.id,
          category: 'Journal',
          title: blog.title,
          excerpt: blog.content ? `${blog.content.slice(0, 140).trim()}...` : '',
          readTime: generateRandomReadTime(language),
          image: validateAndFixUrl(blog.image_url ?? blog.image),
          alignment: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        }));
        
        setArticles(mappedArticles);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        // On error, set empty array (will show nothing instead of crashing)
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [language]);

  return (
    <>
      {/* Divider Banner - Fashion that Cares */}
      <section 
         className="journal-spread-banner"
         style={{
           backgroundImage: `url('https://images.unsplash.com/photo-1583660756881-5b58510d41fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2xvdGhpbmclMjBzdXN0YWluYWJsZXxlbnwxfHx8fDE3NjEwNTg2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
         }}
      >
        {/* Dark overlay for text contrast */}
         <div className="journal-spread-banner-overlay" />
        
        {/* Centered Text */}
         <div className="journal-spread-banner-text">
           <p className="journal-spread-banner-label">
            {t.journal.spread.sustainable}
          </p>
           <h2 className="journal-spread-banner-title">
            {t.journal.spread.fashionThatCares}
          </h2>
           <p className="journal-spread-banner-subtitle">
            {t.journal.spread.luxuryRedefined}
          </p>
        </div>
      </section>

       <section id="stories" className="journal-spread-section">
        <div className="max-w-full">
          {/* Section Title */}
           <div className="journal-spread-title-container">
             <p className="journal-spread-title-label">
              {t.journal.spread.ministryJournal}
            </p>
             <h2 className="journal-spread-title">
              {t.journal.spread.stories}
            </h2>
          </div>

          {/* Decorative Circles - Positioned throughout */}
          <div className="decorative-circles">
            {/* Article 1 - Right side circles */}
            <div className="circle gold-circle circle-1 circle-pos-1" />
            <div className="circle green-circle circle-2 circle-pos-2" />
            <div className="circle gold-circle circle-3 circle-pos-3" />
            
            {/* Article 1 - Near image circles */}
            <div className="circle green-circle circle-10 circle-pos-10" />
            <div className="circle gold-circle circle-11 circle-pos-11" />
            
            {/* Article 2 - Left side circles */}
            <div className="circle green-circle circle-4 circle-pos-4" />
            <div className="circle gold-circle circle-5 circle-pos-5" />
            <div className="circle green-circle circle-6 circle-pos-6" />
            
            {/* Article 2 - Near image circles */}
            <div className="circle gold-circle circle-12 circle-pos-12" />
            <div className="circle green-circle circle-13 circle-pos-13" />
            
            {/* Article 3 - Right side circles */}
            <div className="circle gold-circle circle-7 circle-pos-7" />
            <div className="circle green-circle circle-8 circle-pos-8" />
            <div className="circle gold-circle circle-9 circle-pos-9" />
            
            {/* Article 3 - Near image circles */}
            <div className="circle green-circle circle-14 circle-pos-14" />
            <div className="circle gold-circle circle-15 circle-pos-15" />
          </div>

          {/* Articles - Alternating Layout with Spacing */}
          {loading ? (
            <div className="journal-articles-list" style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', color: '#9F8151' }}>
                {language === 'en' ? 'Loading articles...' : 'Вчитување на статии...'}
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="journal-articles-list" style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', color: '#9F8151' }}>
                {language === 'en' ? 'No articles available at the moment.' : 'Моментално нема достапни статии.'}
              </p>
            </div>
          ) : (
            <div className="journal-articles-list">
              {articles.map((article, index) => (
                <article 
                  key={article.id}
                  className={`article-container article-align-${article.alignment}`}
                  onClick={() => navigate(`/blog/${article.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Background Image - Takes 2/3 of screen with rounded corners */}
                  <div 
                    className="article-background"
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />

                  {/* Text Overlay Box */}
                  <div className={`article-text-box article-text-box-${article.alignment}`}>
                    <div className="article-meta">
                      <p className="article-category">{article.category}</p>
                      <span className="article-dot" />
                      <p className="article-readtime">{article.readTime}</p>
                    </div>

                    <h3 className="article-title">{article.title}</h3>

                    <p className="article-excerpt">{article.excerpt}</p>

                    <a 
                      href={`/blog/${article.id}`}
                      className="article-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/blog/${article.id}`);
                      }}
                    >
                      {t.journal.spread.readArticle}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* View All Stories Link */}
          <div className="journal-spread-view-all">
            <a 
              href="/blog" 
              className="view-all-stories"
              onClick={(e) => {
                e.preventDefault();
                navigate('/blog');
              }}
            >
              {t.journal.spread.viewAllStories}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
