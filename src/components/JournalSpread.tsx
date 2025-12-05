import { ImageWithFallback } from './figma/ImageWithFallback';
import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/JournalSpread.css';

interface JournalSpreadProps {
}

export function JournalSpread({}: JournalSpreadProps = {}) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const articles = language === 'en' ? [
    {
      category: 'Style Guide',
      title: 'Five ways to style a vintage blazer',
      excerpt: 'From office elegance to weekend casual, discover how one timeless piece transforms your entire wardrobe.',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1611331827787-109e62126722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYmxhemVyJTIwc3R5bGV8ZW58MXx8fHwxNzYxMDc5Nzk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      alignment: 'left' as const,
    },
    {
      category: 'Culture',
      title: 'From closets to culture',
      excerpt: 'How our community is redefining luxury through the art of pre-loved fashion.',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1728626506957-a0bc718078dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwc3R5bGUlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjEwODMwMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      alignment: 'right' as const,
    },
    {
      category: 'Philosophy',
      title: 'Sustainability is the new luxury',
      excerpt: 'Why choosing second-hand fashion is the most elegant statement you can make.',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1583660756881-5b58510d41fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2xvdGhpbmclMjBzdXN0YWluYWJsZXxlbnwxfHx8fDE3NjEwNTg2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      alignment: 'left' as const,
    },
  ] : [
    {
      category: 'Стилски Водич',
      title: 'Пет начини да стилизирате винтиџ блејзер',
      excerpt: 'Од канцелариска елеганција до викенд кежуал, откријте како едно невремено парче ја трансформира целата гардероба.',
      readTime: '5 мин читање',
      image: 'https://images.unsplash.com/photo-1611331827787-109e62126722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYmxhemVyJTIwc3R5bGV8ZW58MXx8fHwxNzYxMDc5Nzk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      alignment: 'left' as const,
    },
    {
      category: 'Култура',
      title: 'Од плакари до култура',
      excerpt: 'Како нашата заедница ја редефинира луксузната мода преку уметноста на претходно носени парчиња.',
      readTime: '7 мин читање',
      image: 'https://images.unsplash.com/photo-1728626506957-a0bc718078dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwc3R5bGUlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjEwODMwMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      alignment: 'right' as const,
    },
    {
      category: 'Филозофија',
      title: 'Одржливоста е новиот луксуз',
      excerpt: 'Зошто изборот на втора рака мода е најелегантната изјава што може да ја дадете.',
      readTime: '6 мин читање',
      image: 'https://images.unsplash.com/photo-1583660756881-5b58510d41fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2xvdGhpbmclMjBzdXN0YWluYWJsZXxlbnwxfHx8fDE3NjEwNTg2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      alignment: 'left' as const,
    },
  ];

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
          <div className="journal-articles-list">
            {articles.map((article, index) => (
              <article 
                key={index}
                className={`article-container article-align-${article.alignment}`}
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

                  <a href="#" className="article-link">{t.journal.spread.readArticle}</a>
                </div>
              </article>
            ))}
          </div>

          {/* View All Stories Link */}
          <div className="journal-spread-view-all">
            <a href="#stories" className="view-all-stories">{t.journal.spread.viewAllStories}</a>
          </div>
        </div>
      </section>
    </>
  );
}