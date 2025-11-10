import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onProfileClick: () => void;
}

export function Navigation({ currentPage, onNavigate, onProfileClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);
  const ticking = useRef(false);

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
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'closets', label: 'Closets' },
    { id: 'blog', label: 'Journal' },
    { id: 'become-seller', label: 'Become a Seller' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? 'rgba(240, 236, 227, 0.92)' : 'rgba(240, 236, 227, 0.0)',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        boxShadow: isScrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-[#0A4834] text-[24px] hover:text-[#9F8151] transition-colors"
          >
            Ministry of Second Hand
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{ fontFamily: 'Manrope, sans-serif' }}
                className={`text-[14px] transition-all relative ${
                  currentPage === item.id || 
                  (item.id === 'blog' && currentPage === 'article')
                    ? 'text-[#0A4834]'
                    : 'text-[#0A4834]/70 hover:text-[#0A4834]'
                }`}
              >
                {item.label}
                {(currentPage === item.id || (item.id === 'blog' && currentPage === 'article')) && (
                  <div 
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#9F8151]"
                    style={{
                      animation: 'slideIn 0.3s ease-out',
                    }}
                  />
                )}
              </button>
            ))}

            {/* Profile Icon */}
            <button
              onClick={onProfileClick}
              className="p-2 rounded-full hover:bg-[#9F8151]/10 transition-all"
            >
              <User className="w-5 h-5 text-[#9F8151]" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-[#0A4834]"></span>
              <span className="w-full h-0.5 bg-[#0A4834]"></span>
              <span className="w-full h-0.5 bg-[#0A4834]"></span>
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
