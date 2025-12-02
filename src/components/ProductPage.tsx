import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
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
import './styles/ProductPage.css';

interface ProductPageProps {
  onBack?: () => void;
  onCheckout?: () => void;
  language?: Language;
}

export function ProductPage({ onBack, onCheckout, language = 'en' }: ProductPageProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/shop');
    }
  };
  
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/cart');
    }
  };
  const t = getTranslation(language);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isHoveringPrev, setIsHoveringPrev] = useState(false);
  const [isHoveringNext, setIsHoveringNext] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setSelectedImage(0); // Reset image selection when product changes
        const response = await axios.get(`http://127.0.0.1:8000/api/items/${productId}`);
        
        // Console log the response for debugging
        console.log('=== PRODUCT PAGE - API RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Product ID:', productId);
        console.log('Product keys:', Object.keys(response.data));
        console.log('Product title:', response.data.title);
        console.log('Product name:', response.data.name);
        
        // CRITICAL: Log image data
        // Per API docs: response includes 'image' (path), 'image_url' (full URL), and 'images' (array)
        console.log('🖼️ PRODUCT PAGE - Image Debug:');
        console.log('🖼️ Product image (path):', response.data.image);
        console.log('🖼️ Product image_url (full URL):', response.data.image_url);
        console.log('🖼️ Product images (array):', response.data.images);
        console.log('🖼️ Product name:', response.data.name);
        console.log('🖼️ Product title:', response.data.title);
        
        if (response.data.image_url) {
          console.log('✅ Using image_url from response:', response.data.image_url);
        } else if (response.data.image) {
          console.log('⚠️ No image_url, constructing from image path:', `http://127.0.0.1:8000/storage/${response.data.image}`);
        } else {
          console.warn('⚠️ Product has NO image or image_url field!');
        }
        
        setProduct(response.data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        setError(err.response?.status === 404 ? 'Product not found' : 'Failed to load product');
        setLoading(false); // Make sure to set loading to false on error
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Map API product data to display format
  // Per API docs: response includes 'image_url' (preferred) or 'image' (path), plus 'images' array
  const getImageUrl = (img: any): string => {
    if (!img) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
    }
    
    // If image is already a full URL, return as is
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }
    
    // If image is an object with url or path property (from images array)
    if (typeof img === 'object' && img !== null) {
      const url = img.url || img.image_url || img.path || img.image || img.src;
      if (url) {
        if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
          return url;
        }
        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
        if (cleanPath.startsWith('storage/')) {
          return `http://127.0.0.1:8000/${cleanPath}`;
        }
        return `http://127.0.0.1:8000/storage/${cleanPath}`;
      }
    }
    
    // If image is a string (path), construct URL
    if (typeof img === 'string') {
      const cleanPath = img.startsWith('/') ? img.substring(1) : img;
      if (cleanPath.startsWith('storage/')) {
        return `http://127.0.0.1:8000/${cleanPath}`;
      }
      return `http://127.0.0.1:8000/storage/${cleanPath}`;
    }
    
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
  };
  
  // Per API docs: Use 'image_url' if available (preferred), otherwise construct from 'image' path
  // Also include additional images from 'images' array
  const mainImageUrl = product?.image_url || getImageUrl(product?.image);
  const additionalImages = product?.images && Array.isArray(product.images) 
    ? product.images.map((img: any) => img.url || getImageUrl(img.path || img))
    : [];
  
  // Combine main image with additional images
  const productImages = [mainImageUrl, ...additionalImages].filter(Boolean);

  // Per API docs: response includes both 'name' and 'title' fields
  const productTitle = product?.title || product?.name || product?.product_name || 'Loading...';
  const productPrice = product?.price ? `€${parseFloat(product.price).toFixed(2)}` : '€0';
  const productBrand = product?.brand?.name || 'Unknown Brand';
  const productDescription = product?.description || 'No description available.';
  const productSize = product?.size || 'One Size';
  const productCondition = product?.condition || 'Good';
  const productMaterial = product?.material || 'Material information not available';
  const sellerName = product?.user?.name || product?.user?.email || 'Unknown Seller';
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const sellerUsername = `@${sellerName.split(' ')[0]}`;

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

  // Loading state
  if (loading) {
    return (
      <div className="product-root">
        <HeaderAlt />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontFamily: 'Manrope, sans-serif',
          fontSize: '18px',
          color: '#0A4834',
        }}>
          Loading product...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-root">
        <HeaderAlt />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontFamily: 'Manrope, sans-serif',
          gap: '16px',
        }}>
          <div style={{ fontSize: '18px', color: '#0A4834', fontWeight: 600 }}>
            {error || 'Product not found'}
          </div>
          <motion.button
            onClick={handleBack}
            whileHover={{ backgroundColor: '#083D2C' }}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#0A4834',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              cursor: 'pointer',
            }}
          >
            Back to Shop
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-root">
      {/* Header */}
      <HeaderAlt />

      {/* Product Gallery and Details */}
      <div className="product-inner">
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="back-btn"
          whileHover={{ x: -4 }}
        >
          <ChevronLeft size={20} />
          Back to Shop
        </motion.button>

        <div className="product-grid">
          {/* Left: Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="gallery-col"
          >
            {/* Main Image */}
            <div className="gallery-main"
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
                <ImageWithFallback src={productImages[selectedImage]} alt="Product main view" className="gallery-image" />
              </motion.div>

              {/* Previous Image Preview */}
              {selectedImage > 0 && isHoveringPrev && (
                <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 0.3, x: -670 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="preview-wrap">
                  <ImageWithFallback src={productImages[selectedImage - 1]} alt="Previous view" className="gallery-image" />
                </motion.div>
              )}

              {/* Next Image Preview */}
              {selectedImage < productImages.length - 1 && isHoveringNext && (
                <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 0.3, x: 670 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="preview-wrap">
                  <ImageWithFallback src={productImages[selectedImage + 1]} alt="Next view" className="gallery-image" />
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
                  className="nav-arrow left"
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
                  className="nav-arrow right"
                >
                  <ChevronRight size={28} color="#FFFFFF" strokeWidth={2.5} />
                </motion.button>
              )}

              {/* Wishlist Button */}
              <motion.button onClick={() => setIsWishlisted(!isWishlisted)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="wishlist-btn">
                <Heart size={22} fill={isWishlisted ? '#9F8151' : 'none'} stroke={isWishlisted ? '#9F8151' : '#0A4834'} strokeWidth={2} />
              </motion.button>
            </div>

            {/* Seller Info */}
            <div className="seller-card">
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '12px',
              }}>
                Seller Info
              </div>

              <div className="seller-row">
                <div className="seller-avatar-large">{sellerInitial}</div>

                <div style={{ flex: 1 }}>
                  <div className="seller-name-large">{sellerName}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    {[1,2,3,4,5].map((star) => (<Star key={star} size={12} fill="#9F8151" stroke="#9F8151" />))}
                    <span className="seller-stats">Verified Seller</span>
                  </div>

                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#9F8151', fontWeight: 500 }}>✓ Verified Closet</div>
                </div>

                <a href={`/closets/${product?.user?.id || ''}`} className="view-closet-link">View Closet →</a>
              </div>

              <motion.button
                onClick={() => setIsContactOpen(true)}
                whileHover={{ backgroundColor: '#083D2C', y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="contact-btn"
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
              {productTitle}
            </h1>

            {/* Price */}
            <div style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '20px',
              fontWeight: 500,
              color: '#9F8151',
              marginBottom: '24px',
            }}>
              {productPrice}
            </div>

            {/* Condition & Category Tags */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              {productCondition && (
                <span
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
                  {productCondition}
                </span>
              )}
              {product?.category?.name && (
                <span
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
                  {product.category.name}
                </span>
              )}
              {product?.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                product.tags.slice(0, 2).map((tag: string) => (
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
                ))
              )}
            </div>

            {/* Description */}
            <div style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#000000',
              marginBottom: '40px',
            }}>
              {productDescription}
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
                  {productBrand}
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
                  {productMaterial}
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
                  {productSize}
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
                  {productCondition} condition. {productDescription}
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
              onClick={handleCheckout}
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
                onClick={() => navigate(`/product/${item.id}`)}
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
                onClick={() => navigate(`/product/${item.id}`)}
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
        sellerName={sellerName}
      />
    </div>
  );
}
