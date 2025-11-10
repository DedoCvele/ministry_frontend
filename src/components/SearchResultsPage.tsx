import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';

interface SearchResultsPageProps {
  initialQuery?: string;
  onBack?: () => void;
  onProductClick?: () => void;
}

export function SearchResultsPage({ initialQuery = '', onBack, onProductClick }: SearchResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  const filterCategories = [
    {
      name: 'Category',
      options: ['Dresses', 'Bags', 'Jackets', 'Shoes', 'Accessories'],
    },
    {
      name: 'Color',
      options: ['Black', 'White', 'Brown', 'Green', 'Blue'],
    },
    {
      name: 'Size',
      options: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      name: 'Condition',
      options: ['New with tags', 'Excellent', 'Good', 'Vintage'],
    },
    {
      name: 'Price',
      options: ['Under €50', '€50-€100', '€100-€200', 'Over €200'],
    },
  ];

  // Mock search results
  const searchResults = [
    {
      id: 1,
      name: 'Vintage Levi\'s Denim Jacket',
      brand: 'Levi\'s',
      price: 85,
      seller: 'Sophie Laurent',
      image: 'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      condition: 'Excellent',
    },
    {
      id: 2,
      name: 'Vintage High-Waisted Jeans',
      brand: 'Levi\'s',
      price: 65,
      seller: 'Emma Archive',
      image: 'https://images.unsplash.com/photo-1542272454315-7f6fabf35d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      condition: 'Good',
    },
    {
      id: 3,
      name: 'Vintage Denim Shirt',
      brand: 'Vintage',
      price: 45,
      seller: 'Marija Finds',
      image: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      condition: 'Vintage',
    },
    {
      id: 4,
      name: 'Classic 501 Jeans',
      brand: 'Levi\'s',
      price: 75,
      seller: 'TanjaVintage',
      image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      condition: 'Excellent',
    },
    {
      id: 5,
      name: 'Vintage Denim Overalls',
      brand: 'Vintage',
      price: 95,
      seller: 'Sofia Closet',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      condition: 'Good',
    },
    {
      id: 6,
      name: 'Vintage Trucker Jacket',
      brand: 'Levi\'s',
      price: 110,
      seller: 'LuxeFinds',
      image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      condition: 'Excellent',
    },
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
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

      <HeaderAlt />

      {/* Sticky Search Bar */}
      <div style={{
        position: 'sticky',
        top: '72px',
        zIndex: 100,
        backgroundColor: '#F0ECE3',
        padding: '24px 0',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}>
            <div style={{
              position: 'relative',
              flex: 1,
            }}>
              <Search
                size={20}
                color="#999"
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                placeholder="Search for styles, brands, or closets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  padding: '16px 20px 16px 52px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '16px',
                  outline: 'none',
                  boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#9F8151' }}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#0A4834',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <SlidersHorizontal size={18} />
              Filters
            </motion.button>
          </div>

          {/* Applied Filters */}
          {selectedFilters.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '16px',
            }}>
              {selectedFilters.map((filter) => (
                <motion.div
                  key={filter}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#9F8151',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {filter}
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    onClick={() => toggleFilter(filter)}
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
                  </motion.button>
                </motion.div>
              ))}
              <motion.button
                whileHover={{ textDecoration: 'underline' }}
                onClick={() => setSelectedFilters([])}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#9F8151',
                  cursor: 'pointer',
                  padding: '8px 12px',
                }}
              >
                Clear all
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '24px 32px',
            }}
          >
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0px 6px 24px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '32px',
              }}>
                {filterCategories.map((category) => (
                  <div key={category.name}>
                    <h4 style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0A4834',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: '0 0 12px 0',
                    }}>
                      {category.name}
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {category.options.map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ x: 4 }}
                          onClick={() => toggleFilter(option)}
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            color: selectedFilters.includes(option) ? '#9F8151' : '#666',
                            fontWeight: selectedFilters.includes(option) ? 600 : 400,
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            padding: '4px 0',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 32px 80px',
      }}>
        {/* Results Header */}
        <div style={{
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '40px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 8px 0',
          }}>
            Results for "{searchQuery || 'vintage jeans'}"
          </h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: '#9F8151',
            margin: 0,
          }}>
            {searchResults.length} items found
          </p>
        </div>

        {/* Results Grid */}
        {searchResults.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {searchResults.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={onProductClick}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '0.75',
                  overflow: 'hidden',
                }}>
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Heart size={18} color="#0A4834" />
                  </motion.button>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(159,129,81,0.9)',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    backdropFilter: 'blur(10px)',
                  }}>
                    {item.condition}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#9F8151',
                    margin: '0 0 6px 0',
                  }}>
                    {item.brand}
                  </p>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#0A4834',
                    margin: '0 0 12px 0',
                  }}>
                    {item.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#0A4834',
                      margin: 0,
                    }}>
                      €{item.price}
                    </p>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#999',
                      margin: 0,
                    }}>
                      by {item.seller}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '80px 32px',
          }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '28px',
              fontStyle: 'italic',
              color: '#9F8151',
              margin: 0,
            }}>
              No pieces found — check another era.
            </p>
          </div>
        )}
      </div>

      <FooterAlt onNewsletterClick={() => {}} />
    </div>
  );
}
