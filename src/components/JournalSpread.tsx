import { ImageWithFallback } from './figma/ImageWithFallback';
import { type Language, getTranslation } from '../translations';

interface JournalSpreadProps {
  language?: Language;
}

export function JournalSpread({ language = 'en' }: JournalSpreadProps = {}) {
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
        className="relative flex items-center justify-center"
        style={{
          height: '400px',
          backgroundImage: `url('https://images.unsplash.com/photo-1583660756881-5b58510d41fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2xvdGhpbmclMjBzdXN0YWluYWJsZXxlbnwxfHx8fDE3NjEwNTg2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text contrast */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        
        {/* Centered Text */}
        <div className="relative z-10 text-center px-8 max-w-md">
          <p 
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#9F8151',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Sustainable
          </p>
          <h2 
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '48px',
              fontWeight: 600,
              lineHeight: '56px',
              color: '#FFFFFF',
              marginBottom: '16px',
              letterSpacing: '-1px',
            }}
          >
            Fashion that cares
          </h2>
          <p 
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '24px',
              color: '#FFFFFF',
              opacity: 0.9,
            }}
          >
            Luxury redefined through conscious choices.
          </p>
        </div>
      </section>

      <section id="stories" className="py-32 relative" style={{ backgroundColor: '#F0ECE3' }}>
        <div className="max-w-full">
          {/* Section Title */}
          <div className="px-8 mb-20 max-w-7xl mx-auto">
            <p 
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: '#9F8151',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Ministry Journal
            </p>
            <h2 
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '64px',
                fontWeight: 600,
                lineHeight: '72px',
                color: '#0A4834',
                letterSpacing: '-1px',
              }}
            >
              Stories
            </h2>
          </div>

          {/* Decorative Circles - Positioned throughout */}
          <div className="decorative-circles" style={{ position: 'absolute', top: '200px', left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5 }}>
            {/* Article 1 - Right side circles */}
            <div className="circle gold-circle circle-1" style={{ position: 'absolute', top: '150px', right: '10%', width: '150px', height: '150px' }} />
            <div className="circle green-circle circle-2" style={{ position: 'absolute', top: '280px', right: '15%', width: '80px', height: '80px' }} />
            <div className="circle gold-circle circle-3" style={{ position: 'absolute', top: '450px', right: '6%', width: '60px', height: '60px' }} />
            
            {/* Article 1 - Near image circles */}
            <div className="circle green-circle circle-10" style={{ position: 'absolute', top: '100px', left: '30%', width: '100px', height: '100px' }} />
            <div className="circle gold-circle circle-11" style={{ position: 'absolute', top: '500px', left: '15%', width: '70px', height: '70px' }} />
            
            {/* Article 2 - Left side circles */}
            <div className="circle green-circle circle-4" style={{ position: 'absolute', top: '900px', left: '8%', width: '130px', height: '130px' }} />
            <div className="circle gold-circle circle-5" style={{ position: 'absolute', top: '1100px', left: '14%', width: '70px', height: '70px' }} />
            <div className="circle green-circle circle-6" style={{ position: 'absolute', top: '1250px', left: '5%', width: '90px', height: '90px' }} />
            
            {/* Article 2 - Near image circles */}
            <div className="circle gold-circle circle-12" style={{ position: 'absolute', top: '950px', right: '25%', width: '85px', height: '85px' }} />
            <div className="circle green-circle circle-13" style={{ position: 'absolute', top: '1280px', right: '18%', width: '65px', height: '65px' }} />
            
            {/* Article 3 - Right side circles */}
            <div className="circle gold-circle circle-7" style={{ position: 'absolute', top: '1800px', right: '12%', width: '110px', height: '110px' }} />
            <div className="circle green-circle circle-8" style={{ position: 'absolute', top: '2050px', right: '8%', width: '75px', height: '75px' }} />
            <div className="circle gold-circle circle-9" style={{ position: 'absolute', top: '1920px', right: '18%', width: '55px', height: '55px' }} />
            
            {/* Article 3 - Near image circles */}
            <div className="circle green-circle circle-14" style={{ position: 'absolute', top: '1750px', left: '22%', width: '95px', height: '95px' }} />
            <div className="circle gold-circle circle-15" style={{ position: 'absolute', top: '2100px', left: '12%', width: '60px', height: '60px' }} />
          </div>

          {/* Articles - Alternating Layout with Spacing */}
          <div className="space-y-24 relative" style={{ zIndex: 10 }}>
            {articles.map((article, index) => (
              <article 
                key={index}
                className="article-container"
                style={{
                  position: 'relative',
                  minHeight: '85vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: article.alignment === 'left' ? 'flex-start' : 'flex-end',
                }}
              >
                {/* Background Image - Takes 2/3 of screen with rounded corners */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: article.alignment === 'left' ? 0 : '33.333%',
                    right: article.alignment === 'left' ? '33.333%' : 0,
                    backgroundImage: `url('${article.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '16px',
                  }}
                />

                {/* Text Overlay Box */}
                <div 
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '520px',
                    margin: article.alignment === 'left' ? '0 0 0 8%' : '0 8% 0 0',
                    padding: '56px',
                    backgroundColor: 'rgba(255, 255, 255, 0.93)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#9F8151',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                    }}>
                      {article.category}
                    </p>
                    <span style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#9F8151',
                      opacity: 0.4,
                    }} />
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '11px',
                      fontWeight: 400,
                      color: '#000000',
                      opacity: 0.5,
                      letterSpacing: '0.5px',
                    }}>
                      {article.readTime}
                    </p>
                  </div>

                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '42px',
                    fontWeight: 600,
                    lineHeight: '50px',
                    color: '#0A4834',
                    marginBottom: '20px',
                    letterSpacing: '-0.5px',
                  }}>
                    {article.title}
                  </h3>

                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: '26px',
                    color: '#000000',
                    opacity: 0.7,
                    marginBottom: '28px',
                  }}>
                    {article.excerpt}
                  </p>

                  <a 
                    href="#"
                    className="article-link"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0A4834',
                      textDecoration: 'none',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid #0A4834',
                      paddingBottom: '4px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Read Article →
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* View All Stories Link */}
          <div className="text-center px-8 mt-32 relative" style={{ zIndex: 10 }}>
            <a
              href="#stories"
              className="view-all-stories"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0A4834',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #0A4834',
                paddingBottom: '4px',
                transition: 'all 0.3s ease',
              }}
            >
              View All Stories
            </a>
          </div>
        </div>

        <style>{`
          .article-link:hover,
          .view-all-stories:hover {
            color: #9F8151 !important;
            border-bottom-color: #9F8151 !important;
          }

          .circle {
            border-radius: 50%;
            position: absolute;
            opacity: 0;
          }

          .gold-circle {
            background-color: rgba(159, 129, 81, 0.15);
          }

          .green-circle {
            background-color: rgba(10, 72, 52, 0.12);
          }

          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes floatMove {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(10px, -15px) scale(1.05);
            }
            50% {
              transform: translate(-8px, -25px) scale(0.95);
            }
            75% {
              transform: translate(12px, -10px) scale(1.02);
            }
          }

          @keyframes pulseScale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
          }

          .circle-1 {
            animation: fadeInScale 1.2s ease-out forwards, floatMove 15s ease-in-out infinite;
            animation-delay: 0.1s, 1.5s;
          }
          
          .circle-2 {
            animation: fadeInScale 1s ease-out forwards, pulseScale 8s ease-in-out infinite;
            animation-delay: 0.3s, 1.8s;
          }
          
          .circle-3 {
            animation: fadeInScale 1.4s ease-out forwards, floatMove 12s ease-in-out infinite;
            animation-delay: 0.5s, 2s;
          }
          
          .circle-4 {
            animation: fadeInScale 1.1s ease-out forwards, pulseScale 10s ease-in-out infinite;
            animation-delay: 0.7s, 2.2s;
          }
          
          .circle-5 {
            animation: fadeInScale 1.3s ease-out forwards, floatMove 18s ease-in-out infinite;
            animation-delay: 0.9s, 2.5s;
          }
          
          .circle-6 {
            animation: fadeInScale 1s ease-out forwards, pulseScale 14s ease-in-out infinite;
            animation-delay: 1.1s, 2.8s;
          }
          
          .circle-7 {
            animation: fadeInScale 1.2s ease-out forwards, floatMove 16s ease-in-out infinite;
            animation-delay: 1.3s, 3s;
          }
          
          .circle-8 {
            animation: fadeInScale 1.4s ease-out forwards, pulseScale 11s ease-in-out infinite;
            animation-delay: 1.5s, 3.3s;
          }
          
          .circle-9 {
            animation: fadeInScale 1.1s ease-out forwards, floatMove 13s ease-in-out infinite;
            animation-delay: 1.7s, 3.5s;
          }
          
          .circle-10 {
            animation: fadeInScale 1.3s ease-out forwards, pulseScale 9s ease-in-out infinite;
            animation-delay: 0.4s, 1.7s;
          }
          
          .circle-11 {
            animation: fadeInScale 1s ease-out forwards, floatMove 14s ease-in-out infinite;
            animation-delay: 0.8s, 2.1s;
          }
          
          .circle-12 {
            animation: fadeInScale 1.2s ease-out forwards, pulseScale 12s ease-in-out infinite;
            animation-delay: 1s, 2.4s;
          }
          
          .circle-13 {
            animation: fadeInScale 1.4s ease-out forwards, floatMove 17s ease-in-out infinite;
            animation-delay: 1.2s, 2.7s;
          }
          
          .circle-14 {
            animation: fadeInScale 1.1s ease-out forwards, pulseScale 13s ease-in-out infinite;
            animation-delay: 1.4s, 3.1s;
          }
          
          .circle-15 {
            animation: fadeInScale 1.3s ease-out forwards, floatMove 19s ease-in-out infinite;
            animation-delay: 1.6s, 3.4s;
          }
        `}</style>
      </section>
    </>
  );
}