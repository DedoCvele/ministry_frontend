import { useState } from 'react';
import { Search, SlidersHorizontal, X, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { NewsletterPopup } from './NewsletterPopup';
import { type Language, getTranslation } from '../translations';

interface Product {
  id: number;
  title: string;
  price: number;
  seller: string;
  sellerAvatar: string;
  image: string;
  tags: string[];
  category: string;
  brand: string;
  size: string;
  condition: string;
}

interface ShopPageProps {
  onProductClick?: (id: number) => void;
  language?: Language;
}

export function ShopPage({ onProductClick, language = 'en' }: ShopPageProps) {
  const t = getTranslation(language);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{[key: string]: string}>({});
  const [sortBy, setSortBy] = useState('Newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  const products: Product[] = [
    {
      id: 1,
      title: 'Vintage Leather Blazer',
      price: 285,
      seller: 'TanjaVintage',
      sellerAvatar: 'T',
      image: 'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGVhdGhlciUyMGphY2tldHxlbnwxfHx8fDE3NjE1NzgwOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['StreetStyle', 'Vintage'],
      category: 'Outerwear',
      brand: 'Unknown',
      size: 'M',
      condition: 'Excellent',
    },
    {
      id: 2,
      title: 'Designer Silk Dress',
      price: 395,
      seller: 'SofiaCloset',
      sellerAvatar: 'S',
      image: 'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZHJlc3MlMjBlbGVnYW50fGVufDF8fHx8MTc2MTU4MTUxOXww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Evening', 'Designer'],
      category: 'Dresses',
      brand: 'Dior',
      size: 'S',
      condition: 'Like New',
    },
    {
      id: 3,
      title: 'Classic Structured Bag',
      price: 445,
      seller: 'LuxeFinds',
      sellerAvatar: 'L',
      image: 'https://images.unsplash.com/photo-1758171692659-024183c2c272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWclMjBsdXh1cnl8ZW58MXx8fHwxNzYxNTc1MjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Timeless', 'Investment'],
      category: 'Bags',
      brand: 'Hermès',
      size: 'One Size',
      condition: 'Very Good',
    },
    {
      id: 4,
      title: 'Vintage Denim Jacket',
      price: 165,
      seller: 'EmmaArchive',
      sellerAvatar: 'E',
      image: 'https://images.unsplash.com/photo-1716307961085-6a7006f28685?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZGVzaWduZXIlMjBjbG90aGluZ3xlbnwxfHx8fDE3NjE1ODE1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['90sVintage', 'Casual'],
      category: 'Outerwear',
      brand: "Levi's",
      size: 'L',
      condition: 'Good',
    },
    {
      id: 5,
      title: 'Statement Leather Boots',
      price: 225,
      seller: 'IsabellaStyle',
      sellerAvatar: 'I',
      image: 'https://images.unsplash.com/photo-1759563874692-d556321d7c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwaXRlbXN8ZW58MXx8fHwxNzYxNTgxNTE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['EdgyLuxe', 'Vintage'],
      category: 'Shoes',
      brand: 'YSL',
      size: '38',
      condition: 'Excellent',
    },
    {
      id: 6,
      title: 'Tailored Wool Trousers',
      price: 145,
      seller: 'MinimalWardrobe',
      sellerAvatar: 'M',
      image: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2FyZHJvYmUlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2MTU4MTUyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Minimalist', 'Professional'],
      category: 'Bottoms',
      brand: 'MaxMara',
      size: 'M',
      condition: 'Excellent',
    },
  ];

  const filterOptions = {
    Category: ['All', 'Outerwear', 'Dresses', 'Bags', 'Shoes', 'Bottoms', 'Tops'],
    Brand: ['All', 'Hermès', 'Dior', "Levi's", 'YSL', 'MaxMara'],
    Size: ['All', 'XS', 'S', 'M', 'L', 'XL'],
    Condition: ['All', 'Like New', 'Excellent', 'Very Good', 'Good'],
    Price: ['All', 'Under €200', '€200-€400', 'Over €400'],
    Color: ['All', 'Black', 'White', 'Beige', 'Brown', 'Green', 'Blue'],
    Style: ['All', 'Vintage', 'Minimalist', 'Designer', 'Casual', 'Evening'],
  };

  const sortOptions = ['Newest', 'Trending', 'Lowest Price', 'Highest Price', 'Highest Rated'];

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    setActiveFilters(newFilters);
  };

  return (
    <div style={{
      backgroundColor: '#F0ECE3',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Grain Texture */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.02,
        backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=\')',
      }} />

      {/* Header */}
      <HeaderAlt />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#F0ECE3',
          borderBottom: '1px solid rgba(159,129,81,0.1)',
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '32px 64px 24px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '48px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 12px 0',
          }}>
            {t.shop.title}
          </h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '18px',
            color: '#9F8151',
            margin: '0 0 24px 0',
          }}>
            {t.shop.subtitle}
          </p>
          <div style={{
            width: '80px',
            height: '2px',
            backgroundColor: 'rgba(159,129,81,0.3)',
            margin: '0 auto',
          }} />
        </div>

        {/* Filter & Sort Bar */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 64px 24px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.05)',
          }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              maxWidth: '500px',
              margin: '0 auto 24px',
              width: '100%',
            }}>
              <Search size={18} color="#9F8151" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.shop.searchPlaceholder}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  backgroundColor: '#F0ECE3',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 48px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filter Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {Object.entries(filterOptions).map(([filterName, options]) => (
                <div key={filterName} style={{ position: 'relative' }}>
                  <motion.button
                    onClick={() => setShowFilterDropdown(showFilterDropdown === filterName ? null : filterName)}
                    whileHover={{ backgroundColor: 'rgba(159,129,81,0.1)' }}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0A4834',
                      backgroundColor: 'transparent',
                      border: '1px solid #DCD6C9',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      width: '100%',
                    }}
                  >
                    {filterName} <ChevronDown size={16} />
                  </motion.button>

                  <AnimatePresence>
                    {showFilterDropdown === filterName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '8px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          padding: '8px',
                          boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                          minWidth: '150px',
                          zIndex: 200,
                        }}
                      >
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              if (option === 'All') {
                                removeFilter(filterName);
                              } else {
                                setActiveFilters({ ...activeFilters, [filterName]: option });
                              }
                              setShowFilterDropdown(null);
                            }}
                            style={{
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '14px',
                              color: '#000000',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0ECE3'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Sort Dropdown - Separate Row */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '8px',
            }}>
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <motion.button
                  onClick={() => setShowFilterDropdown(showFilterDropdown === 'sort' ? null : 'sort')}
                  whileHover={{ backgroundColor: 'rgba(159,129,81,0.1)' }}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#9F8151',
                    backgroundColor: 'transparent',
                    border: '1px solid #9F8151',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    width: '100%',
                  }}
                >
                  {sortBy} <ChevronDown size={16} />
                </motion.button>

                <AnimatePresence>
                  {showFilterDropdown === 'sort' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                        minWidth: '180px',
                        zIndex: 200,
                      }}
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowFilterDropdown(null);
                          }}
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            color: '#000000',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0ECE3'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {Object.keys(activeFilters).length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              flexWrap: 'wrap',
            }}>
              {Object.entries(activeFilters).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    backgroundColor: '#9F8151',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {value}
                  <button
                    onClick={() => removeFilter(key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} color="#FFFFFF" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Product Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '48px 64px 120px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
        }}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{
                position: 'relative',
              }}
            >
              {/* Product Card */}
              <div
                onClick={() => onProductClick?.(product.id)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Image Container */}
                <div
                  className="product-image-container"
                  style={{
                    width: '100%',
                    aspectRatio: '4/5',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '16px',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ImageWithFallback
                      src={product.image}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </motion.div>

                  {/* Gold overlay on hover */}
                  <div
                    className="product-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(159,129,81,0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      className="view-details-text"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#FFFFFF',
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      View Details →
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Heart
                      size={18}
                      color="#9F8151"
                      fill={wishlist.includes(product.id) ? '#9F8151' : 'none'}
                    />
                  </motion.button>
                </div>

                {/* Product Info */}
                <div>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#0A4834',
                    margin: '0 0 8px 0',
                  }}>
                    {product.title}
                  </h3>

                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0A4834',
                    margin: '0 0 12px 0',
                  }}>
                    €{product.price}
                  </p>

                  {/* Seller Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#9F8151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}>
                      {product.sellerAvatar}
                    </div>
                    <span style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#9F8151',
                    }}>
                      @{product.seller}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(159,129,81,0.2)',
                    margin: '12px 0',
                  }} />

                  {/* Tags */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}>
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '11px',
                          color: 'rgba(0,0,0,0.6)',
                          backgroundColor: 'rgba(159,129,81,0.1)',
                          borderRadius: '10px',
                          padding: '4px 10px',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center',
            marginTop: '64px',
          }}
        >
          <motion.button
            whileHover={{ backgroundColor: '#0A4834', color: '#FFFFFF' }}
            whileTap={{ scale: 0.98 }}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: '#9F8151',
              backgroundColor: '#F0ECE3',
              border: '1px solid #9F8151',
              borderRadius: '16px',
              padding: '14px 40px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {t.shop.loadMore}
          </motion.button>
        </motion.div>

        {/* Bottom CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: '120px',
            padding: '80px 64px',
            backgroundColor: '#F0ECE3',
            borderRadius: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Texture overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+\')',
          }} />

          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontStyle: 'italic',
            color: '#0A4834',
            margin: 0,
            position: 'relative',
            zIndex: 1,
          }}>
            "Not old. Not new. Just you."
          </p>
        </motion.div>
      </div>

      <style>{`
        .product-image-container:hover .product-overlay {
          background-color: rgba(159,129,81,0.3) !important;
        }

        .product-image-container:hover .view-details-text {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>

      {/* Footer */}
      <FooterAlt onNewsletterClick={() => setNewsletterOpen(true)} />

      {/* Newsletter Popup */}
      <NewsletterPopup
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />
    </div>
  );
}