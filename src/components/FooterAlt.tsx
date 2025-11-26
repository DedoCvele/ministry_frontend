import { type Language, getTranslation } from '../translations';
import './styles/FooterAlt.css';

interface FooterAltProps {
  onNewsletterClick?: () => void;
  onBecomeSellerClick?: () => void;
  language?: Language;
}

export function FooterAlt({ onNewsletterClick, onBecomeSellerClick, language = 'en' }: FooterAltProps = {}) {
  const t = getTranslation(language);
  
  return (
    <footer className="py-24 px-8 footer-root">
      <div className="container mx-auto max-w-7xl">
        {/* Newsletter Section */}
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

        {/* Seller CTA Section */}
        <div className="footer-seller-box">
          <p className="footer-seller-text">
            Want to sell your pre-loved pieces?
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
            Become a Seller →
          </button>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <h3 className="footer-brand-title">
              MINISTRY
            </h3>
            <p className="footer-brand-desc">
              Where stories live on.
              <br />
              Second-hand luxury, timeless style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-section-header">
              Explore
            </h4>
            <div className="flex flex-col gap-3">
              {['Shop', 'Closets', 'Journal', 'About'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="footer-link-alt"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="footer-section-header">
              Connect
            </h4>
            <div className="flex flex-col gap-3 mb-6">
              {['Instagram', 'TikTok', 'Pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="footer-link-alt"
                >
                  {social}
                </a>
              ))}
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
          
          <div className="flex gap-6">
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