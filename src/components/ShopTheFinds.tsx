import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

interface ShopTheFindsProps {
}

interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  seller: string;
  condition: string;
}

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;

const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('via.placeholder.com')) return '';
  if (trimmed.match(/^https?:\/\//i)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  // Protocol-less URL (e.g. picsum.photos/seed/... or ik.imagekit.io/...)
  if (!trimmed.startsWith('/') && trimmed.includes('.')) {
    return `https://${trimmed}`;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (trimmed.startsWith('storage/') || trimmed.startsWith('/storage/')) {
    return `${API_ROOT}${cleanPath}`;
  }
  if (
    trimmed.startsWith('items/') ||
    trimmed.startsWith('/items/') ||
    trimmed.startsWith('images/') ||
    trimmed.startsWith('/images/')
  ) {
    return `${API_ROOT}/storage${cleanPath}`;
  }

  return `${API_ROOT}${cleanPath}`;
};

/** Same as ShopPage: extract first image URL from an item (all known API shapes). */
function getFirstImageUrl(item: any): string {
  if (!item) return '';
  const asStr = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '');
  const fromObj = (o: any) =>
    asStr(o?.url ?? o?.image_url ?? o?.src ?? o?.path ?? o?.file_url);
  const fromArr = (arr: any[]): string => {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    const first = arr[0];
    return fromObj(first) || asStr(first);
  };
  return (
    fromObj(item.mainImage) ||
    fromObj(item.main_image) ||
    asStr(item.mainImage) ||
    asStr(item.main_image) ||
    fromArr(item.item_images) ||
    fromArr(item.itemImages) ||
    fromArr(item.images) ||
    asStr(item.first_image_url) ||
    asStr(item.thumbnail) ||
    asStr(item.image_url) ||
    asStr(item.image) ||
    ''
  );
}

const CONDITION_LABELS: Record<number, string> = {
  1: 'New',
  2: 'Excellent',
  3: 'Very Good',
  4: 'Good',
  5: 'Fair',
};

export function ShopTheFinds({}: ShopTheFindsProps = {}) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const [wishlistedItems, setWishlistedItems] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved items from API with proper filtering
  useEffect(() => {
    const fetchApprovedItems = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_BASE_URL}/items`);
        
        // Handle different response structures
        let items = response.data;
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else {
          items = [];
        }

        // ========== WHERE WE CONVERT JSON RESPONSE TO CARD ==========
        // Map items to product format and filter by approval_status 2 (Approved) or 3 (Specialist Approved)
        const approvedProducts: Product[] = items
          .filter((item: any) => item?.approval_status === 2 || item?.approval_status === 3)
          .map((item: any) => {
            const itemTitle = item.name || 'Untitled Item';
            
            // Format price with euro symbol
            const priceValue = parseFloat(item.price) || 0;
            const formattedPrice = priceValue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            const firstImageUrl = getFirstImageUrl(item);
            const imageUrl = normalizeImageUrl(firstImageUrl);

            // Get seller name
            const sellerName = item.user?.name || item.user?.email || 'Unknown Seller';

            return {
              id: item.id,
              image: imageUrl,
              title: itemTitle,
              price: `€${formattedPrice}`,
              seller: sellerName,
              condition: CONDITION_LABELS[item?.condition] || 'Good',
            };
          });

        setProducts(approvedProducts);
      } catch (error) {
        console.error('Error fetching approved items:', error);
        // Set empty array on error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedItems();
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlistedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProductClick = async (productId: number) => {
    // console.log('=== ITEM CLICKED ===');
    // console.log('Product ID:', productId);
    
    try {
      // Fetch the product data when clicked to log the response
      const response = await axios.get(`${API_BASE_URL}/items/${productId}`);
      // console.log('=== AXIOS RESPONSE ON ITEM CLICK ===');
      // console.log('Full response:', response);
      // console.log('Response data:', response.data);
      // console.log('Product title:', response.data.title);
      // console.log('Product name:', response.data.name);
      // console.log('Product keys:', Object.keys(response.data));
    } catch (error) {
      console.error('Error fetching product on click:', error);
    }
    
    navigate(`/product/${productId}`);
  };

  return (
    <section
      className="py-32 px-8"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16">
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#9F8151',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            {t.shopFinds.label}
          </p>
          <h2
            className="shop-finds-title"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '64px',
              fontWeight: 600,
              lineHeight: '72px',
              color: '#0A4834',
              letterSpacing: '-1px',
              marginBottom: '16px',
            }}
          >
            {t.shopFinds.title}
          </h2>
          <p
            className="shop-finds-subtitle"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '28px',
              color: '#000000',
              opacity: 0.7,
              maxWidth: '600px',
            }}
          >
            {t.shopFinds.subtitle}
          </p>
        </div>

        {/* Products Grid */}
        <div
          className="shop-finds-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px',
            marginBottom: '64px',
          }}
        >
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', color: '#0A4834', opacity: 0.7 }}>
                {t.shopFinds.loading}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', color: '#0A4834', opacity: 0.7 }}>
                {t.shopFinds.noProducts}
              </p>
            </div>
          ) : (
            products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              whileHover={{ y: -8 }}
              onClick={() => handleProductClick(product.id)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
              }}
            >
              {/* Product Image */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: '16px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#F0ECE3',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="shop-finds-product-image"
                    style={{
                      width: '100%',
                      height: '380px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </motion.div>

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
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Heart
                    size={18}
                    fill={wishlistedItems.includes(product.id) ? '#9F8151' : 'none'}
                    stroke={wishlistedItems.includes(product.id) ? '#9F8151' : '#0A4834'}
                    strokeWidth={2}
                  />
                </motion.button>

                {/* Condition Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(255,255,255,0.93)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 14px',
                    borderRadius: '16px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#0A4834',
                    letterSpacing: '0.5px',
                  }}
                >
                  {product.condition}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#0A4834',
                    marginBottom: '6px',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {product.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '17px',
                      fontWeight: 500,
                      color: '#9F8151',
                    }}
                  >
                    {product.price}
                  </p>
                </div>

                <p
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#000000',
                    opacity: 0.6,
                  }}
                >
                  {t.shopFinds.bySeller} {product.seller}
                </p>
              </div>
            </motion.div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div style={{ textAlign: 'center' }}>
          <motion.button
            onClick={() => navigate('/shop')}
            whileHover={{ backgroundColor: '#083D2C', y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              backgroundColor: '#0A4834',
              color: '#FFFFFF',
              padding: '18px 56px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0px 4px 16px rgba(10,72,52,0.2)',
            }}
          >
            {t.shopFinds.viewAllItems}
          </motion.button>
        </div>
      </div>
      
      <style>{`
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .shop-finds-title {
            font-size: 42px !important;
            line-height: 50px !important;
            margin-bottom: 12px !important;
          }

          .shop-finds-subtitle {
            font-size: 14px !important;
            line-height: 24px !important;
          }

          .shop-finds-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
            gap: 24px !important;
            margin-bottom: 48px !important;
          }

          .shop-finds-product-image {
            height: 300px !important;
          }

          section[class*="py-32"] {
            padding-top: 48px !important;
            padding-bottom: 48px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .shop-finds-title {
            font-size: 32px !important;
            line-height: 40px !important;
          }

          .shop-finds-subtitle {
            font-size: 13px !important;
            line-height: 22px !important;
          }

          .shop-finds-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .shop-finds-product-image {
            height: 280px !important;
          }

          section[class*="py-32"] {
            padding-top: 32px !important;
            padding-bottom: 32px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}