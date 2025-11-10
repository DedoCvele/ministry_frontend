import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, ChevronDown, Package, RotateCcw, Leaf, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { HeaderAlt } from './HeaderAlt';
import { ContactSellerPopup } from './ContactSellerPopup';
import { type Language, getTranslation } from '../translations';

interface ProductPageProps {
  onBack?: () => void;
  onCheckout?: () => void;
  language?: Language;
}

export function ProductPage({ onBack, onCheckout, language = 'en' }: ProductPageProps) {
  const t = getTranslation(language);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isHoveringPrev, setIsHoveringPrev] = useState(false);
  const [isHoveringNext, setIsHoveringNext] = useState(false);

  // Product images
  const productImages = [
    'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwaGFuZGJhZ3xlbnwxfHx8fDE3NjE1NzAzODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1761345880123-c7c3b160c1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGxlYXRoZXIlMjBiYWclMjBkZXRhaWx8ZW58MXx8fHwxNzYxNTcwMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1761058530177-5b9466decb93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYmFnJTIwdGV4dHVyZXxlbnwxfHx8fDE3NjE1NzAzODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1758171692659-024183c2c272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaGFuZGJhZyUyMHN0eWxlfGVufDF8fHx8MTc2MTU3MDM4NXww&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  // Similar items
  const similarItems = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1565532070333-43edd7d75c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZGVzaWduZXIlMjBjb2F0fGVufDF8fHx8MTc2MTU3MDM4NXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Vintage Burberry Trench',
      price: '€385',
      seller: 'Sophie M.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1759563876826-30481c505545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwaXRlbXxlbnwxfHx8fDE3NjE1NzAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Hermès Silk Scarf',
      price: '€240',
      seller: 'Claire D.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwaGFuZGJhZ3xlbnwxfHx8fDE3NjE1NzAzODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Chanel Classic Flap',
      price: '€2,890',
      seller: 'Marie L.',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1761345880123-c7c3b160c1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGxlYXRoZXIlMjBiYWclMjBkZXRhaWx8ZW58MXx8fHwxNzYxNTcwMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Prada Nylon Bag',
      price: '€420',
      seller: 'Anna K.',
    },
  ];

  // Same closet items
  const sameClosetItems = [
    { id: 1, image: productImages[0], title: 'Gucci Loafers', price: '€320' },
    { id: 2, image: productImages[1], title: 'Dior Sunglasses', price: '€195' },
    { id: 3, image: productImages[2], title: 'YSL Clutch', price: '€280' },
    { id: 4, image: productImages[3], title: 'Cartier Watch', price: '€1,850' },
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header */}
      <HeaderAlt />

      {/* Product Gallery and Details */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '120px 64px 80px',
      }}>
        {/* Back Button */}
        {onBack && (
          <motion.button
            onClick={onBack}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              color: '#0A4834',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '48px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.4s ease-in-out',
            }}
            whileHover={{ x: -4 }}
          >
            <ChevronLeft size={20} />
            Back to Shop
          </motion.button>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '80px',
        }}>
          {/* Left: Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Main Image */}
            <div 
              style={{
                position: 'relative',
                marginBottom: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => {
                setIsHoveringImage(false);
                setIsHoveringPrev(false);
                setIsHoveringNext(false);
              }}
            >
              {/* Current Image */}
              <motion.div
                animate={{ 
                  x: isHoveringPrev ? 30 : isHoveringNext ? -30 : 0,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <ImageWithFallback
                  src={productImages[selectedImage]}
                  alt="Product main view"
                  style={{
                    width: '100%',
                    height: '700px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </motion.div>

              {/* Previous Image Preview */}
              {selectedImage > 0 && isHoveringPrev && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 0.3, x: -670 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <ImageWithFallback
                    src={productImages[selectedImage - 1]}
                    alt="Previous view"
                    style={{
                      width: '100%',
                      height: '700px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </motion.div>
              )}

              {/* Next Image Preview */}
              {selectedImage < productImages.length - 1 && isHoveringNext && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 0.3, x: 670 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <ImageWithFallback
                    src={productImages[selectedImage + 1]}
                    alt="Next view"
                    style={{
                      width: '100%',
                      height: '700px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </motion.div>
              )}

              {/* Navigation Arrows */}
              {isHoveringImage && selectedImage > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedImage(selectedImage - 1)}
                  onMouseEnter={() => setIsHoveringPrev(true)}
                  onMouseLeave={() => setIsHoveringPrev(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    left: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 10,
                  }}
                >
                  <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
                </motion.button>
              )}

              {isHoveringImage && selectedImage < productImages.length - 1 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedImage(selectedImage + 1)}
                  onMouseEnter={() => setIsHoveringNext(true)}
                  onMouseLeave={() => setIsHoveringNext(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    right: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 10,
                  }}
                >
                  <ChevronRight size={28} color="#FFFFFF" strokeWidth={2.5} />
                </motion.button>
              )}

              {/* Wishlist Button */}
              <motion.button
                onClick={() => setIsWishlisted(!isWishlisted)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                }}
              >
                <Heart
                  size={22}
                  fill={isWishlisted ? '#9F8151' : 'none'}
                  stroke={isWishlisted ? '#9F8151' : '#0A4834'}
                  strokeWidth={2}
                />
              </motion.button>
            </div>

            {/* Seller Info */}
            <div style={{
              backgroundColor: '#F0ECE3',
              padding: '20px',
              borderRadius: '12px',
              marginTop: '48px',
            }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '12px',
              }}>
                Seller Info
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#9F8151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '18px',
                  color: '#FFFFFF',
                }}>
                  EC
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#000000',
                    marginBottom: '3px',
                  }}>
                    Elena C.
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '3px',
                  }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={12} fill="#9F8151" stroke="#9F8151" />
                    ))}
                    <span style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '12px',
                      color: '#666',
                      marginLeft: '6px',
                    }}>
                      142 sales
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '12px',
                    color: '#9F8151',
                    fontWeight: 500,
                  }}>
                    ✓ Verified Closet
                  </div>
                </div>

                <a
                  href="#"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#9F8151',
                    textDecoration: 'none',
                  }}
                >
                  View Closet →
                </a>
              </div>

              <motion.button
                onClick={() => setIsContactOpen(true)}
                whileHover={{ backgroundColor: '#083D2C', y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#0A4834',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  transition: 'all 0.4s ease-in-out',
                  boxShadow: '0px 2px 8px rgba(10,72,52,0.2)',
                }}
              >
                <MessageCircle size={16} />
                Contact Seller
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Title */}
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '16px',
              lineHeight: '40px',
            }}>
              Vintage Gucci Marmont Shoulder Bag
            </h1>

            {/* Price */}
            <div style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '20px',
              fontWeight: 500,
              color: '#9F8151',
              marginBottom: '24px',
            }}>
              €890
            </div>

            {/* Condition & Category Tags */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              {['Excellent', 'Designer', 'Vintage'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0A4834',
                    backgroundColor: '#F0ECE3',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#000000',
              marginBottom: '40px',
            }}>
              A timeless piece from Gucci's iconic Marmont collection. This vintage shoulder bag features the signature GG logo, chevron leather, and antique gold-tone hardware. Lovingly preserved, it carries stories of elegance and craftsmanship that only improve with time.
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: 'rgba(159,129,81,0.2)',
              marginBottom: '32px',
            }} />

            {/* Details Accordion */}
            <Accordion type="single" collapsible style={{ marginBottom: '40px' }}>
              <AccordionItem value="brand" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A4834',
                  letterSpacing: '0.02em',
                }}>
                  Brand
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  paddingTop: '12px',
                }}>
                  Gucci
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="material" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A4834',
                  letterSpacing: '0.02em',
                }}>
                  Material
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  paddingTop: '12px',
                }}>
                  Matelassé chevron leather with antique gold-tone hardware
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A4834',
                  letterSpacing: '0.02em',
                }}>
                  Size
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  paddingTop: '12px',
                }}>
                  26cm W × 15cm H × 7cm D
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="condition" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A4834',
                  letterSpacing: '0.02em',
                }}>
                  Condition
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  paddingTop: '12px',
                }}>
                  Excellent vintage condition with minor signs of wear. All hardware intact and fully functional.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A4834',
                  letterSpacing: '0.02em',
                }}>
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  paddingTop: '12px',
                }}>
                  Store in dust bag when not in use. Clean with soft dry cloth. Avoid water and harsh chemicals.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ backgroundColor: '#083D2C', y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCheckout}
              style={{
                width: '100%',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#0A4834',
                border: 'none',
                borderRadius: '12px',
                padding: '18px 24px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                transition: 'all 0.4s ease-in-out',
                boxShadow: '0px 4px 12px rgba(10,72,52,0.3)',
              }}
            >
              Add to Cart
            </motion.button>
          </motion.div>
        </div>

        {/* Delivery & Returns - Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
          style={{
            marginTop: '80px',
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {/* Delivery */}
            <div style={{
              backgroundColor: '#F0ECE3',
              borderRadius: '12px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(10, 72, 52, 0.06)',
                border: '1px solid rgba(10, 72, 52, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Package size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '8px',
                letterSpacing: '-0.3px',
              }}>
                Standard delivery
              </div>
              <div style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#000000',
                opacity: 0.65,
                lineHeight: '22px',
              }}>
                Tracked and insured shipping in 3–5 days
              </div>
            </div>

            {/* Returns */}
            <div style={{
              backgroundColor: '#F0ECE3',
              borderRadius: '12px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(10, 72, 52, 0.06)',
                border: '1px solid rgba(10, 72, 52, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <RotateCcw size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '8px',
                letterSpacing: '-0.3px',
              }}>
                Easy returns
              </div>
              <div style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#000000',
                opacity: 0.65,
                lineHeight: '22px',
              }}>
                Returns accepted within 7 days in original condition
              </div>
            </div>

            {/* Sustainability */}
            <div style={{
              backgroundColor: '#F0ECE3',
              borderRadius: '12px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(10, 72, 52, 0.06)',
                border: '1px solid rgba(10, 72, 52, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Leaf size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '8px',
                letterSpacing: '-0.3px',
              }}>
                Circular fashion
              </div>
              <div style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#000000',
                opacity: 0.65,
                lineHeight: '22px',
              }}>
                Every purchase supports sustainable fashion
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Similar Items */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
        style={{
          backgroundColor: '#F0ECE3',
          padding: '120px 64px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#0A4834',
            marginBottom: '48px',
            textAlign: 'center',
          }}>
            You May Also Like
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
          }}>
            {similarItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -8 }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease-in-out',
                }}
              >
                <div style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                }}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '320px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </motion.div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#000000',
                    marginBottom: '8px',
                  }}>
                    {item.title}
                  </div>

                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#9F8151',
                    marginBottom: '8px',
                  }}>
                    {item.price}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#9F8151',
                      fontSize: '11px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Manrope, sans-serif',
                    }}>
                      {item.seller.charAt(0)}
                    </div>
                    <span style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      color: '#666',
                    }}>
                      {item.seller}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* From the Same Closet */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
        style={{
          backgroundColor: '#FFFFFF',
          padding: '120px 64px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#0A4834',
            marginBottom: '16px',
          }}>
            From the Same Closet
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: '#666',
            marginBottom: '48px',
          }}>
            More curated pieces from Elena C.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '48px',
          }}>
            {sameClosetItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease-in-out',
                }}
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F0ECE3',
                }}>
                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#000000',
                    marginBottom: '4px',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#9F8151',
                  }}>
                    {item.price}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <motion.a
              href="#"
              whileHover={{ x: 4 }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#9F8151',
                textDecoration: 'none',
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              View Full Closet <ChevronRight size={18} />
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Engagement CTA */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
        style={{
          backgroundColor: '#F0ECE3',
          padding: '120px 64px',
        }}
      >
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontStyle: 'italic',
            color: '#9F8151',
            marginBottom: '48px',
            lineHeight: '44px',
          }}>
            "Fashion has memory."
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <motion.button
              whileHover={{ backgroundColor: '#083D2C', y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#0A4834',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                transition: 'all 0.4s ease-in-out',
              }}
            >
              Sell Your Closet
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: '#8A7141', y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#9F8151',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                transition: 'all 0.4s ease-in-out',
              }}
            >
              Join Newsletter
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Contact Seller Popup */}
      <ContactSellerPopup
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        sellerName="Elena C."
        sellerPhone="+1 (555) 123-4567"
        productTitle="Vintage Gucci Marmont Shoulder Bag"
      />
    </div>
  );
}
