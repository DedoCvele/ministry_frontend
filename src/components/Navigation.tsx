import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../translations';
import './styles/Navigation.css';

interface NavigationProps {
  onProfileClick: () => void;
}

export function Navigation({ onProfileClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);
  const ticking = useRef(false);
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { isAdmin } = useAuth();
  const t = getTranslation(language);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > 80 && !isScrolled) {
            setIsScrolled(true);
          } else if (currentScrollY <= 80 && isScrolled) {
            setIsScrolled(false);
          }
          
          lastScrollYRef.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  const navItems = [
    { id: 'home', labelKey: 'home' as const },
    { id: 'shop', labelKey: 'shop' as const },
    { id: 'closets', labelKey: 'closets' as const },
    { id: 'blog', labelKey: 'journal' as const },
    ...(!isAdmin ? [{ id: 'become-seller' as const, labelKey: 'becomeSeller' as const }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'nav-scrolled' : 'nav-default'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="nav-logo"
          >
            Ministry of Second Hand
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={`/${item.id === 'home' ? '' : item.id}`}
                className={`nav-links ${
                  (location.pathname === '/' && item.id === 'home') || 
                  location.pathname === `/${item.id}` ||
                  (item.id === 'blog' && location.pathname.startsWith('/blog/'))
                    ? 'nav-active'
                    : ''
                }`}
              >
                {t.nav[item.labelKey]}
                {((location.pathname === '/' && item.id === 'home') || 
                  location.pathname === `/${item.id}` ||
                  (item.id === 'blog' && location.pathname.startsWith('/blog/'))) && (
                  <div 
                    className="nav-active-indicator"
                  />
                )}
              </Link>
            ))}

            {/* Language Switcher */}
            <button
              onClick={() => toggleLanguage()}
              className="nav-language-btn"
              aria-label="Switch language"
              type="button"
            >
              {language === 'en' ? 'ENG' : 'MKD'}
            </button>

            {/* Profile Icon */}
            <button
              onClick={onProfileClick}
              className="nav-profile-btn"
            >
              <User className="nav-profile-icon" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
          >
            <div className="hamburger-menu">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </nav>
  );
}
