import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { type Language, getTranslation } from '../translations';

interface HeaderAltProps {
  onAccountClick?: () => void;
  onShopClick?: () => void;
  onClosetsClick?: () => void;
  onJournalClick?: () => void;
  onBecomeSellerClick?: () => void;
  language?: Language;
}

export function HeaderAlt({ 
  onAccountClick,
  onShopClick,
  onClosetsClick,
  onJournalClick,
  onBecomeSellerClick,
  language = 'en'
}: HeaderAltProps = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const t = getTranslation(language);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <style>{`
        .nav-link-alt {
          position: relative;
          transition: color 0.3s ease;
        }
        
        .nav-link-alt:hover {
          color: #9F8151;
        }

        .header-blur-alt {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .account-icon-button {
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .account-icon-button:hover {
          color: #9F8151;
        }

        .collapsible-header {
          transition: transform 0.3s ease-in-out;
        }

        .collapsible-header.hidden {
          transform: translateY(-100%);
        }
      `}</style>
      
      <>
        <header 
          className={`fixed top-0 left-0 right-0 z-50 header-blur-alt collapsible-header ${!isVisible ? 'hidden' : ''}`}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.70)', 
            boxShadow: '0px 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div className="container mx-auto px-8" style={{ height: '80px' }}>
            <nav className="flex items-center justify-between h-full relative z-10">
              {/* Logo - Far Left */}
              <div className="flex items-center">
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 600, color: '#0A4834', letterSpacing: '-0.3px' }}>
                  MINISTRY
                </span>
              </div>

              {/* Navigation Links - Right Side with 40px margin */}
              <div className="flex items-center gap-12" style={{ marginRight: '40px' }}>
                <ul className="flex items-center gap-8">
                  <li>
                    <button
                      onClick={onShopClick}
                      className="nav-link-alt"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none',
                        letterSpacing: '0.5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {t.nav.shop}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onClosetsClick}
                      className="nav-link-alt"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none',
                        letterSpacing: '0.5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {t.nav.closets}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onJournalClick}
                      className="nav-link-alt"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none',
                        letterSpacing: '0.5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {t.nav.journal}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onBecomeSellerClick}
                      className="nav-link-alt"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0A4834',
                        textDecoration: 'none',
                        letterSpacing: '0.5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {t.nav.becomeSeller}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Account Icon - Far Right */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Account Icon */}
                <button
                  onClick={onAccountClick}
                  className="account-icon-button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#0A4834',
                    padding: '8px',
                  }}
                  aria-label="Account"
                >
                  <User size={22} strokeWidth={1.5} />
                </button>
              </div>
            </nav>
          </div>
        </header>
        {/* Spacer to prevent content overlap */}
        <div style={{ height: '80px' }} />
      </>
    </>
  );
}