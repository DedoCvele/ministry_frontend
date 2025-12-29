import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/FooterAlt.css';

interface FooterAltProps {
  onNewsletterClick?: () => void;
  onBecomeSellerClick?: () => void;
  hideNewsletter?: boolean;
  hideSellerSection?: boolean;
}

export function FooterAlt({ onNewsletterClick, onBecomeSellerClick, hideNewsletter = false, hideSellerSection = false }: FooterAltProps = {}) {
  const { language, toggleLanguage } = useLanguage();
  const t = getTranslation(language);
  
  return (
    <footer className="py-24 px-8 footer-root">
      <div className="container mx-auto max-w-7xl">
        {/* Newsletter Section */}
        {!hideNewsletter && (
          <div className="footer-newsletter-box">
            <h3 className="footer-newsletter-title">
              {t.footer.newsletter.title}
            </h3>
            <p className="footer-newsletter-desc">
              {t.footer.newsletter.description}
            </p>
            <button
              onClick={onNewsletterClick}
              className="footer-newsletter-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8A6F46';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9F8151';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t.footer.newsletter.button}
            </button>
          </div>
        )}

        {/* Seller CTA Section */}
        {!hideSellerSection && (
          <div className="footer-seller-box">
            <p className="footer-seller-text">
              {t.footer.seller.text}
            </p>
            <button
              onClick={onBecomeSellerClick}
              className="footer-seller-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#9F8151';
                e.currentTarget.style.color = '#0A4834';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9F8151';
              }}
            >
              {t.footer.seller.button}
            </button>
          </div>
        )}

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <h3 className="footer-brand-title">
              MINISTRY
            </h3>
            <p className="footer-brand-desc">
              {t.footer.brand.tagline}
              <br />
              {t.footer.brand.subtitle}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-section-header">
              {t.footer.explore}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="#shop"
                className="footer-link-alt"
              >
                {t.footer.links.shop}
              </a>
              <a
                href="#closets"
                className="footer-link-alt"
              >
                {t.footer.links.closets}
              </a>
              <a
                href="#journal"
                className="footer-link-alt"
              >
                {t.footer.links.journal}
              </a>
              <a
                href="#about"
                className="footer-link-alt"
              >
                {t.footer.links.about}
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="footer-section-header">
              {t.footer.connect}
            </h4>
            <div className="flex flex-col gap-3 mb-6">
              <a
                href="#"
                className="footer-link-alt"
              >
                {t.footer.social.instagram}
              </a>
              <a
                href="#"
                className="footer-link-alt"
              >
                {t.footer.social.tiktok}
              </a>
              <a
                href="#"
                className="footer-link-alt"
              >
                {t.footer.social.pinterest}
              </a>
            </div>
            <a
              href="mailto:hello@ministry.com"
              className="footer-email"
            >
              hello@ministry.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="footer-copyright">
            {t.footer.copyright}
          </p>
          
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="footer-bottom-link"
            >
              {t.footer.privacy}
            </a>
            <a
              href="#"
              className="footer-bottom-link"
            >
              {t.footer.terms}
            </a>
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="header-language-btn"
              aria-label="Switch language"
              type="button"
            >
              {language === 'en' ? 'MKD' : 'ENG'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link-alt:hover {
          color: #9F8151 !important;
          opacity: 1 !important;
          transform: translateX(2px);
        }
      `}</style>
    </footer>
  );
}