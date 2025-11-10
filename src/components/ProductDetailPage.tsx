import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';

interface ProductDetailPageProps {
  onBack?: () => void;
  onCheckout?: () => void;
  onContactSeller?: () => void;
  language?: Language;
}

export function ProductDetailPage({ onBack, onCheckout, onContactSeller, language = 'en' }: ProductDetailPageProps) {
  const t = getTranslation(language);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data
  const product = {
    id: 1,
    name: 'Vintage Hermès Silk Scarf',
    brand: 'Hermès',
    price: 240,
    originalPrice: 450,
    condition: 'Excellent',
    size: 'One Size',
    description: 'A timeless Hermès silk scarf featuring an intricate equestrian pattern in rich burgundy and gold tones. This piece has been carefully preserved and shows minimal signs of wear. The silk is soft and lustrous, perfect for adding a touch of Parisian elegance to any outfit. Purchased in the early 2000s and lovingly worn on special occasions.',
    tags: ['#Vintage', '#Hermès', '#Luxury', '#Silk', '#Parisian'],
    images: [
      'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1565532070333-43edd7d75c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1544441893-675973e31985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    ],
    seller: {
      name: 'Sophie Laurent',
      username: '@sophie.vintage',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      rating: 4.9,
      sales: 142,
      responseTime: '< 2 hours',
    },
    shipping: {
      estimated: '3-5 business days',
      cost: 'Free',
      location: 'Paris, France',
    },
  };

  // Similar items
  const similarItems = [
    {
      id: 2,
      name: 'Vintage Silk Evening Dress',
      price: 290,
      seller: 'Emma Archive',
      image: 'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    },
    {
      id: 3,
      name: 'Designer Leather Bag',
      price: 485,
      seller: 'LuxeFinds',
      image: 'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    },
    {
      id: 4,
      name: 'Classic Pearl Necklace',
      price: 165,
      seller: 'Sofia Closet',
      image: 'https://images.unsplash.com/photo-1759563874692-d556321d7c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
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

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '100px 32px 80px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          marginBottom: '80px',
        }}>
          {/* Left Side - Image Gallery */}
          <div>
            {/* Main Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '0.75',
              borderRadius: '24px',
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 8px 32px rgba(0,0,0,0.08)',
            }}>
              <ImageWithFallback
                src={product.images[currentImageIndex]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.95)' }}
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ChevronLeft size={24} color="#0A4834" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.95)' }}
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ChevronRight size={24} color="#0A4834" />
                  </motion.button>
                </>
              )}

              {/* Image Counter */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 16px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: '20px',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                color: '#FFFFFF',
                backdropFilter: 'blur(10px)',
              }}>
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}>
              {product.images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: currentImageIndex === index ? '3px solid #9F8151' : '3px solid transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div>
            {/* Brand & Title */}
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#9F8151',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 8px 0',
            }}>
              {product.brand}
            </p>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '40px',
              fontWeight: 600,
              color: '#0A4834',
              margin: '0 0 24px 0',
              lineHeight: '48px',
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '36px',
                fontWeight: 600,
                color: '#0A4834',
                margin: 0,
              }}>
                €{product.price}
              </p>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '20px',
                color: '#999',
                textDecoration: 'line-through',
                margin: 0,
              }}>
                €{product.originalPrice}
              </p>
            </div>

            {/* Product Info */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: '0 0 4px 0',
                }}>
                  Condition
                </p>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0A4834',
                  margin: 0,
                }}>
                  {product.condition}
                </p>
              </div>
              <div>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: '0 0 4px 0',
                }}>
                  Size
                </p>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0A4834',
                  margin: 0,
                }}>
                  {product.size}
                </p>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0A4834',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 12px 0',
              }}>
                Description
              </h3>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                color: '#666',
                lineHeight: '28px',
                margin: 0,
              }}>
                {product.description}
              </p>
            </div>

            {/* Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '32px',
            }}>
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(159,129,81,0.1)',
                    color: '#9F8151',
                    borderRadius: '20px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
            }}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#083826' }}
                whileTap={{ scale: 0.98 }}
                onClick={onContactSeller}
                style={{
                  flex: 1,
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#0A4834',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
              >
                <MessageCircle size={20} />
                Contact Seller
              </motion.button>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  borderColor: '#9F8151',
                  backgroundColor: isWishlisted ? '#9F8151' : 'transparent',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: isWishlisted ? '#9F8151' : 'transparent',
                  border: '2px solid #DCD6C9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <Heart size={22} color={isWishlisted ? '#FFFFFF' : '#0A4834'} fill={isWishlisted ? '#FFFFFF' : 'none'} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#9F8151' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  border: '2px solid #DCD6C9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <Share2 size={20} color="#0A4834" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#9F8151' }}
              whileTap={{ scale: 0.98 }}
              onClick={onCheckout}
              style={{
                width: '100%',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#9F8151',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                cursor: 'pointer',
                marginBottom: '32px',
                transition: 'all 0.3s ease',
              }}
            >
              Buy Now
            </motion.button>

            {/* Seller Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <ImageWithFallback
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#0A4834',
                    margin: '0 0 4px 0',
                  }}>
                    {product.seller.name}
                  </h4>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#9F8151',
                    margin: '0 0 8px 0',
                  }}>
                    {product.seller.username}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color="#9F8151"
                          fill={star <= Math.floor(product.seller.rating) ? '#9F8151' : 'none'}
                        />
                      ))}
                    </div>
                    <span style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0A4834',
                    }}>
                      {product.seller.rating}
                    </span>
                    <span style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#999',
                    }}>
                      • {product.seller.sales} sales
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '12px',
                    color: '#999',
                    margin: 0,
                  }}>
                    Responds in {product.seller.responseTime}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ borderColor: '#9F8151', color: '#9F8151' }}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A4834',
                  backgroundColor: 'transparent',
                  border: '2px solid #DCD6C9',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                View Closet →
              </motion.button>
            </div>

            {/* Delivery Info */}
            <div style={{
              backgroundColor: 'rgba(159,129,81,0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <h4 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0A4834',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 16px 0',
              }}>
                Delivery Information
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Truck size={18} color="#9F8151" />
                  <span style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    {product.shipping.estimated} • {product.shipping.cost}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={18} color="#9F8151" />
                  <span style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    Ships from {product.shipping.location}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={18} color="#9F8151" />
                  <span style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    Buyer protection included
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RotateCcw size={18} color="#9F8151" />
                  <span style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    14-day return policy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        <div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 32px 0',
          }}>
            You might also love...
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {similarItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
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
                  width: '100%',
                  aspectRatio: '0.75',
                  overflow: 'hidden',
                }}>
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '20px' }}>
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
        </div>
      </div>

      <FooterAlt onNewsletterClick={() => {}} />
    </div>
  );
}