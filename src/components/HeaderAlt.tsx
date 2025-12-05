import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { type Language, getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
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
  language = 'en'
}: HeaderAltProps = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const t = getTranslation(language);
  
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
          className={`header-root header-blur-alt collapsible-header ${!isVisible ? 'hidden' : ''}`}
        >
          <div className="container mx-auto px-8" style={{ height: '80px' }}>
            <nav className="flex items-center justify-between h-full relative z-10">
              {/* Logo - Far Left */}
              <div className="flex items-center">
                <Link 
                  to="/"
                  className="header-logo"
                >
                  MINISTRY
                </Link>
              </div>

              {/* Navigation Links - Right Side with 40px margin */}
              <div className="flex items-center gap-12" style={{ marginRight: '40px' }}>
                <ul className="flex items-center gap-8">
                  <li>
                    <Link
                      to="/shop"
                      className="nav-link-alt"
                    >
                      {t.nav.shop}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/closets"
                      className="nav-link-alt"
                    >
                      {t.nav.closets}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className="nav-link-alt"
                    >
                      {t.nav.journal}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/become-seller"
                      className="nav-link-alt-becomeseller"
                    >
                      {t.nav.becomeSeller}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account Icon - Far Right */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Account Icon */}
                <button
                  onClick={handleAccountClick}
                  className="account-icon-button"
                  aria-label="Account"
                >
                  <User size={22} strokeWidth={1.5} />
                </button>
              </div>
            </nav>
          </div>
        </header>
        {/* Spacer to prevent content overlap */}
        <div className="header-spacer" />
      </>
    </>
  );
}