import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { apiClient } from '../api/apiClient';
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
import { FooterAlt } from './FooterAlt';
import { ContactOptionsPopup } from './ContactOptionsPopup';
import { type Language, getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import './styles/ProductPage.css';

interface ProductPageProps {
  onBack?: () => void;
  onCheckout?: () => void;
  language?: Language;
}

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;

const CONDITION_LABELS: Record<number, string> = {
  1: 'New',
  2: 'Excellent',
  3: 'Very Good',
  4: 'Good',
  5: 'Fair',
};

export function ProductPage({ onBack, onCheckout, language: languageProp }: ProductPageProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { language: contextLanguage } = useLanguage();
  
  // Use language from context if available, otherwise use prop, otherwise default to 'en'
  const language = contextLanguage || languageProp || 'en';
  const t = getTranslation(language);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/shop');
    }
  };
  
  const handleCheckout = () => {
    if (user && !isAdmin && product) {
      const mainImageUrl =
        product?.mainImage?.url ??
        (Array.isArray(product?.images) && product.images.length > 0 ? product.images[0]?.url : '') ??
        '';

      const productTitle = product?.name || 'Product';
      
      // User is logged in, navigate to checkout with product info
      navigate('/checkout', { 
        state: { 
          product: {
            id: product?.id || productId,
            image: mainImageUrl,
            title: productTitle,
            price: parseFloat(product?.price || '0'),
          }
        } 
      });
    } else if (onCheckout) {
      onCheckout();
    } else {
      navigate('/cart');
    }
  };

  const handleAddToApprove = async () => {
    if (!productId) return;
    
    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      
      await apiClient.patch(`/me/items/${productId}`, { approval_status: 2 }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Item added to approval queue ✅', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      
      // Optionally navigate to admin page
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (error: any) {
      console.error('Error adding to approve:', error);
      toast.error('Failed to add item to approval queue', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    }
  };
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
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
        setError(t.product.errors.idMissing);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSelectedImage(0); // Reset image selection when product changes
      
      try {
        const response = await apiClient.get(`/items/${productId}`);
        const productData = response.data?.data || response.data;
        
        // Verify we have the essential product data
        if (!productData || !productData.name) {
          console.error('❌ Product data is missing name/title field!');
          setError(t.product.errors.dataIncomplete);
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        
        // Check favorite status if user is logged in
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
        if (token && productId) {
          try {
            const favoriteResponse = await apiClient.get('/me/favourites');
            const favourites = favoriteResponse.data?.data || favoriteResponse.data || [];
            const isFavorited = Array.isArray(favourites)
              ? favourites.some((item: any) => String(item?.id) === String(productId))
              : false;
            setIsWishlisted(isFavorited);
          } catch (favErr) {
            // Silently fail - user just won't see their favorite status
            console.warn('Could not fetch favorite status:', favErr);
          }
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        console.error('Product ID attempted:', productId);
        console.error('API URL:', `${API_BASE_URL}/items/${productId}`);
        
        // Provide more specific error messages
        if (err.response?.status === 404) {
          setError(t.product.errors.notFound);
        } else if (err.response?.status === 403) {
          setError(t.product.errors.noPermission);
        } else if (err.response?.status === 401) {
          setError(t.product.errors.loginRequired);
        } else if (err.response?.status >= 500) {
          setError(t.product.errors.serverError);
        } else {
          setError(err.response?.data?.message || t.product.errors.failedToLoad);
        }
        setLoading(false); // Make sure to set loading to false on error
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Map API product data to display format
  // Per API docs: images[] with url (first is main image)
  let mainImageUrl = '';
  let additionalImages: string[] = [];
  
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    // Use images array - first image is main
    const mainImage = product.images[0];
    mainImageUrl = mainImage?.url || '';
    
    // Additional images (skip first one as it's the main)
    additionalImages = product.images.slice(1).map((img: any) => 
      img?.url || ''
    ).filter(Boolean);
  } else {
    mainImageUrl = product?.mainImage?.url || '';
  }
  
  // Combine main image with additional images
  const productImages = [mainImageUrl, ...additionalImages].filter(Boolean);

  const productTitle = product?.name || t.product.defaults.loading;
  const productPrice = product?.price ? `€${parseFloat(product.price).toFixed(2)}` : '€0';
  const productBrand = product?.brand?.name || t.product.defaults.unknownBrand;
  const productDescription = product?.description || t.product.defaults.noDescription;
  const productSize = product?.sizes?.[0]?.label || t.product.defaults.oneSize;
  const productCondition = CONDITION_LABELS[product?.condition] || t.product.defaults.good;
  const productMaterial = product?.material || 'Material information not available';
  const sellerName = product?.user?.name || product?.user?.email || t.product.defaults.unknownSeller;
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const sellerUsername = `@${sellerName.split(' ')[0]}`;
  const productTags = Array.isArray(product?.tags)
    ? product.tags.map((tag: any) => tag?.name || tag)
    : [];

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
          {t.product.loading}
        </div>
      </div>
    );
  }

  // Toggle favorite function
  const toggleFavorite = async () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    console.log('🔄 Toggle favorite called, token:', token ? 'exists' : 'missing', 'productId:', productId);
    
    if (!token) {
      toast.error('Please log in to save favorites');
      return;
    }
    if (!productId) return;
    
    setFavoriteLoading(true);
    try {
      const url = `/me/favourites/${productId}`;
      const response = isWishlisted
        ? await apiClient.delete(url)
        : await apiClient.post(url, {});
      const nextWishlisted = !isWishlisted;
      setIsWishlisted(nextWishlisted);
      toast.success(
        response.data?.message ||
          (nextWishlisted ? 'Added to favorites' : 'Removed from favorites')
      );
    } catch (err: any) {
      console.error('❌ Error toggling favorite:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      toast.error(err.response?.data?.message || 'Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

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
            {error || t.product.notFound}
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
            {t.product.backToShop}
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
          {t.product.backToShop}
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
              <motion.button 
                onClick={toggleFavorite} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.95 }} 
                className="wishlist-btn"
                disabled={favoriteLoading}
                style={{ opacity: favoriteLoading ? 0.6 : 1 }}
              >
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
                {t.product.sellerInfo}
              </div>

              <div className="seller-row">
                <div className="seller-avatar-large">{sellerInitial}</div>

                <div style={{ flex: 1 }}>
                  <div className="seller-name-large">{sellerName}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    {[1,2,3,4,5].map((star) => (<Star key={star} size={12} fill="#9F8151" stroke="#9F8151" />))}
                    <span className="seller-stats">{t.product.verifiedSeller}</span>
                  </div>

                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#9F8151', fontWeight: 500 }}>✓ {t.product.verifiedCloset}</div>
                </div>

                <a
                  href={`/closets/${product?.user?.username || product?.user?.id || ''}`}
                  className="view-closet-link"
                >
                  {t.product.viewCloset} →
                </a>
              </div>

              <motion.button
                onClick={() => setIsContactOpen(true)}
                whileHover={{ backgroundColor: '#083D2C', y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="contact-btn"
              >
                <MessageCircle size={16} />
                {t.product.contactSeller}
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
            <h1 className="product-title-large">
              {productTitle}
            </h1>

            {/* Price */}
            <div className="product-price">
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
              {productTags.length > 0 && (
                productTags.slice(0, 2).map((tag: string) => (
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
                  {t.product.brand}
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
                  {t.product.material}
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
                  {t.product.size}
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
                  {t.product.condition}
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
                  {t.product.careInstructions}
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#000000',
                  paddingTop: '12px',
                }}>
                  {t.product.careInstructionsText}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Add to Cart / Add to Approve / Go to Checkout Button */}
            <motion.button
              whileHover={{ backgroundColor: '#083D2C', y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={isAdmin ? handleAddToApprove : handleCheckout}
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
              {isAdmin ? t.product.addToApprove : (user ? t.product.goToCheckout : t.product.addToCart)}
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
          <div className="info-grid">
            {/* Delivery */}
            <div className="info-card">
              <div className="info-icon">
                <Package size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div className="info-title">
                {t.product.standardDelivery}
              </div>
              <div className="info-desc">
                {t.product.standardDeliveryDesc}
              </div>
            </div>

            {/* Returns */}
            <div className="info-card">
              <div className="info-icon">
                <RotateCcw size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div className="info-title">
                {t.product.easyReturns}
              </div>
              <div className="info-desc">
                {t.product.easyReturnsDesc}
              </div>
            </div>

            {/* Sustainability */}
            <div className="info-card">
              <div className="info-icon">
                <Leaf size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div className="info-title">
                {t.product.circularFashion}
              </div>
              <div className="info-desc">
                {t.product.circularFashionDesc}
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
        className="similar-section"
      >
        <div className="similar-inner">
          <h2 className="similar-section-title">
            {t.product.youMayAlsoLike}
          </h2>

          <div className="similar-grid">
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
        className="same-closet-section"
      >
        <div className="same-closet-inner">
          <h2 className="same-closet-title">
            {t.product.fromSameCloset}
          </h2>

          <p className="same-closet-subtitle">
            {t.product.moreFromSeller.replace('{seller}', sellerName.split(' ')[0])}
          </p>

          <div className="same-closet-grid">
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
        className="engagement-cta"
      >
        <div className="cta-inner">
          <div className="engagement-cta-quote">
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

      {/* Contact Seller Popup (Viber/WhatsApp - same as profile) */}
      <ContactOptionsPopup
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        sellerName={sellerName}
        phone={product?.user?.phone}
        language={language}
      />
      
      <FooterAlt />
    </div>
  );
}
