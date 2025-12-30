import { useState, useEffect } from "react";
import { User, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { type Language, getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './styles/HeaderAlt.css';

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
  language: languageProp
}: HeaderAltProps = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { language: contextLanguage, toggleLanguage } = useLanguage();
  
  // Always use context language for translations so navbar updates when language changes
  const t = getTranslation(contextLanguage);
  
  // Use React Router navigation if callbacks are not provided
  const handleShopClick = () => {
    if (onShopClick) {
      onShopClick();
    } else {
      navigate('/shop');
    }
  };
  
  const handleClosetsClick = () => {
    if (onClosetsClick) {
      onClosetsClick();
    } else {
      navigate('/closets');
    }
  };
  
  const handleJournalClick = () => {
    if (onJournalClick) {
      onJournalClick();
    } else {
      navigate('/blog');
    }
  };
  
  const handleBecomeSellerClick = () => {
    if (onBecomeSellerClick) {
      onBecomeSellerClick();
    } else {
      navigate('/become-seller');
    }
  };
  
  const handleAccountClick = () => {
    if (onAccountClick) {
      onAccountClick();
      return;
    }

    if (!user) {
      navigate('/login');
    } else if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
  };

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.header-root') && !target.closest('.mobile-menu-overlay')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

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
          className={`header-root header-blur-alt collapsible-header ${!isVisible ? 'hidden' : ''}`}
        >
          <div className="container mx-auto px-8 header-container">
            <nav className="flex items-center justify-between h-full relative z-10">
              {/* Logo - Far Left */}
              <div className="flex items-center">
                <Link 
                  to="/"
                  className="header-logo"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  MINISTRY
                </Link>
              </div>

              {/* Navigation Links - Desktop Only */}
              <div className="hidden md:flex items-center gap-12" style={{ marginRight: '40px' }}>
                <ul className="flex items-center gap-8">
                  <li>
                    <Link
                      to="/shop"
                      className="nav-link-alt"
                      onClick={handleShopClick}
                    >
                      {t.nav.shop}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/closets"
                      className="nav-link-alt"
                      onClick={handleClosetsClick}
                    >
                      {t.nav.closets}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className="nav-link-alt"
                      onClick={handleJournalClick}
                    >
                      {t.nav.journal}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/become-seller"
                      className="nav-link-alt-becomeseller"
                      onClick={handleBecomeSellerClick}
                    >
                      {t.nav.becomeSeller}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account Icon & Mobile Menu Button - Far Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Language Switcher - Desktop Only */}
                <button
                  onClick={handleLanguageToggle}
                  className="header-language-btn hidden md:block"
                  aria-label="Switch language"
                  type="button"
                >
                  {contextLanguage === 'en' ? 'MKD' : 'ENG'}
                </button>
                
                {/* Account Icon */}
                <button
                  onClick={handleAccountClick}
                  className="account-icon-button"
                  aria-label="Account"
                >
                  <User size={22} strokeWidth={1.5} />
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="mobile-menu-button md:hidden"
                  aria-label="Toggle menu"
                  type="button"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </nav>
          </div>
        </header>
        
        {/* Mobile Menu Backdrop */}
        <div 
          className={`mobile-menu-backdrop md:hidden ${mobileMenuOpen ? 'show' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Mobile Menu Overlay - Outside header for proper z-index */}
        <div className={`mobile-menu-overlay md:hidden ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <Link
              to="/shop"
              className="nav-link-alt"
              onClick={() => {
                handleShopClick();
                setMobileMenuOpen(false);
              }}
            >
              {t.nav.shop}
            </Link>
            <Link
              to="/closets"
              className="nav-link-alt"
              onClick={() => {
                handleClosetsClick();
                setMobileMenuOpen(false);
              }}
            >
              {t.nav.closets}
            </Link>
            <Link
              to="/blog"
              className="nav-link-alt"
              onClick={() => {
                handleJournalClick();
                setMobileMenuOpen(false);
              }}
            >
              {t.nav.journal}
            </Link>
            <Link
              to="/become-seller"
              className="nav-link-alt-becomeseller"
              onClick={() => {
                handleBecomeSellerClick();
                setMobileMenuOpen(false);
              }}
            >
              {t.nav.becomeSeller}
            </Link>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(10, 72, 52, 0.1)' }}>
              <button
                onClick={() => {
                  handleLanguageToggle();
                  setMobileMenuOpen(false);
                }}
                className="header-language-btn"
                aria-label="Switch language"
                type="button"
                style={{ width: '100%', textAlign: 'left' }}
              >
                {contextLanguage === 'en' ? 'MKD' : 'ENG'}
              </button>
            </div>
          </div>
        </div>
        {/* Spacer to prevent content overlap */}
        <div className="header-spacer" />
      </>
    </>
  );
}