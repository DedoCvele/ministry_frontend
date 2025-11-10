import { type Language, getTranslation } from '../translations';

interface HeroSectionAltProps {
  language?: Language;
}

export function HeroSectionAlt({ language = 'en' }: HeroSectionAltProps = {}) {
  const t = getTranslation(language);
  
  return (
    <section className="relative overflow-hidden" style={{ height: '100vh', minHeight: '800px' }}>
      {/* Large Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1595550510467-930da051f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzYxMDgzMDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient Overlay - lighter */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Minimal Text - Bottom Left */}
      <div className="absolute bottom-20 left-12 max-w-xl z-10">
        <h1 
          className="hero-title-alt"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '72px',
            fontWeight: 600,
            lineHeight: '80px',
            color: '#FFFFFF',
            letterSpacing: '-1px',
            marginBottom: '20px',
          }}
        >
          {t.hero.title}
          <br />
          {t.hero.titleSecond}
        </h1>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '0.5px',
            marginBottom: '32px',
          }}
        >
          {t.hero.subtitle}
        </p>

        <button
          className="cta-hero-alt"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            backgroundColor: '#FFFFFF',
            color: '#0A4834',
            padding: '16px 40px',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {t.hero.shopButton}
        </button>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hero-title-alt {
          animation: slideInLeft 1.2s ease-out forwards;
        }

        .cta-hero-alt:hover {
          background-color: #9F8151 !important;
          color: #FFFFFF !important;
          transform: translateX(5px);
        }
      `}</style>
    </section>
  );
}