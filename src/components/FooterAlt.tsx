import { type Language, getTranslation } from '../translations';

interface FooterAltProps {
  onNewsletterClick?: () => void;
  onBecomeSellerClick?: () => void;
  language?: Language;
}

export function FooterAlt({ onNewsletterClick, onBecomeSellerClick, language = 'en' }: FooterAltProps = {}) {
  const t = getTranslation(language);
  
  return (
    <footer className="py-24 px-8" style={{ backgroundColor: '#0A4834', borderTop: '3px solid #9F8151' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Newsletter Section */}
        <div style={{
          backgroundColor: 'rgba(159, 129, 81, 0.1)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#F0ECE3',
            marginBottom: '12px',
          }}>
            {t.footer.newsletter.title}
          </h3>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: 'rgba(240, 236, 227, 0.8)',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}>
            {t.footer.newsletter.description}
          </p>
          <button
            onClick={onNewsletterClick}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#0A4834',
              backgroundColor: '#9F8151',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0px 4px 12px rgba(159, 129, 81, 0.3)',
            }}
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
        <div style={{
          backgroundColor: 'rgba(159, 129, 81, 0.05)',
          border: '2px solid rgba(159, 129, 81, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '15px',
            color: '#F0ECE3',
            marginBottom: '16px',
          }}>
            Want to sell your pre-loved pieces?
          </p>
          <button
            onClick={onBecomeSellerClick}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: '#9F8151',
              backgroundColor: 'transparent',
              border: '2px solid #9F8151',
              borderRadius: '12px',
              padding: '10px 28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
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
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#F0ECE3',
              marginBottom: '12px',
              letterSpacing: '-0.5px',
            }}>
              MINISTRY
            </h3>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#F0ECE3',
              opacity: 0.7,
              lineHeight: '24px',
            }}>
              Where stories live on.
              <br />
              Second-hand luxury, timeless style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#9F8151',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              Explore
            </h4>
            <div className="flex flex-col gap-3">
              {['Shop', 'Closets', 'Journal', 'About'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="footer-link-alt"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#F0ECE3',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    opacity: 0.8,
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#9F8151',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              Connect
            </h4>
            <div className="flex flex-col gap-3 mb-6">
              {['Instagram', 'TikTok', 'Pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="footer-link-alt"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#F0ECE3',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    opacity: 0.8,
                  }}
                >
                  {social}
                </a>
              ))}
            </div>
            <a
              href="mailto:hello@ministry.com"
              className="footer-link-alt"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: '#9F8151',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              hello@ministry.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#9F8151',
          marginBottom: '24px',
          opacity: 0.3,
        }} />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: '#F0ECE3',
            opacity: 0.6,
          }}>
            {t.footer.copyright}
          </p>
          
          <div className="flex gap-6">
            <a
              href="#"
              className="footer-link-alt"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                color: '#F0ECE3',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                opacity: 0.6,
              }}
            >
              {t.footer.privacy}
            </a>
            <a
              href="#"
              className="footer-link-alt"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                color: '#F0ECE3',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                opacity: 0.6,
              }}
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