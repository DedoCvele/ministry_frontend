import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/HeroSectionAlt.css';

interface HeroSectionAltProps {
}

export function HeroSectionAlt({}: HeroSectionAltProps = {}) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  return (
    <section className="hero-section-root">
      {/* Large Background Image */}
      <div 
        className="hero-background-image"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1595550510467-930da051f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzYxMDgzMDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
        }}
      />

      {/* Gradient Overlay - lighter */}
      <div 
        className="hero-gradient-overlay"
      />

      {/* Minimal Text - Bottom Left */}
      <div className="hero-content">
        <h1 
          className="hero-title-alt"
        >
          {t.hero.title}
          <br />
          {t.hero.titleSecond}
        </h1>

        <p
          className="hero-subtitle"
        >
          {t.hero.subtitle}
        </p>

        <button
          className="cta-hero-alt"
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