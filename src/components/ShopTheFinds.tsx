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

// Robust helper to safely extract numeric approval value from various response shapes
const getApprovalNumber = (item: any): number | null => {
  if (!item) return null;

  // 1) Direct primitive values using nullish coalescing (??) to handle 0 correctly
  const candidate = item.approved ?? item.approval_status ?? item.approval_state ?? item.status;

  if (candidate !== undefined && candidate !== null) {
    // If it's an object (e.g. { value: 3, type: 'number' }), try to extract known shapes
    if (typeof candidate === 'object') {
      if (candidate.value !== undefined) return Number(candidate.value);
      if (candidate.approved_number !== undefined) return Number(candidate.approved_number);
      if (candidate.approved !== undefined) return Number(candidate.approved);
      
      // Try to find first numeric-like value in the object
      for (const v of Object.values(candidate)) {
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
      }
      
      // Fallback to null if no numeric value found
      return null;
    }

    // If it's a string or number, coerce safely
    const coerced = Number(String(candidate).trim());
    return Number.isNaN(coerced) ? null : coerced;
  }

  // 2) Try alternative keys (some responses include additional keys)
  const altKeys = ['approved_number', 'approved_type', 'approval', 'approvalNumber', 'data', 'attributes'];
  for (const k of altKeys) {
    const v = item[k];
    if (v !== undefined && v !== null) {
      const n = Number(String(v).trim());
      if (!Number.isNaN(n)) return n;
    }
  }

  return null;
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
        
        // Use API endpoint with approved=3 query parameter to filter items
        // According to API docs: GET /api/items?approved=3
        const response = await axios.get('http://127.0.0.1:8000/api/items', {
          params: {
            approved: 3
          }
        });
        
        // Handle different response structures
        let items = response.data;
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else {
          items = [];
        }

        // console.log('=== SHOP THE FINDS - API RESPONSE (approved=3) ===');
        // console.log('Full response:', response);
        // console.log('Response.data:', response.data);
        // console.log('Processed items:', items);
        // console.log('Items count:', Array.isArray(items) ? items.length : 0);

        // Map items to product format (all items from API are already filtered to approved=3)
        const approvedProducts: Product[] = items
          .map((item: any) => {
            // Per API docs: response includes both 'title' and 'name' fields
            const itemTitle = item.title || item.name || item.product_name || 'Untitled Item';
            
            // Format price with euro symbol
            const priceValue = parseFloat(item.price) || 0;
            const formattedPrice = priceValue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            // Get image URL - handle different formats from backend
            // Per API docs: response includes 'images[]' array (first is main), 'image_url', or 'image' (path)
            const getImageUrl = (item: any): string => {
              const API_ROOT_FOR_IMAGES = 'http://127.0.0.1:8000';
              
              // Per API docs: Check 'images[]' array first - first image is main image
              if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
                const mainImage = item.images[0];
                // Use 'url' field if available (preferred)
                if (mainImage?.url) {
                  return mainImage.url;
                }
                // Otherwise construct from 'path'
                if (mainImage?.path) {
                  const img = mainImage.path;
                  if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                    return img;
                  }
                  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                  if (cleanPath.startsWith('storage/')) {
                    return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
                  }
                  return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
                }
              }
              
              // Per API docs: Use 'image_url' if available (preferred)
              if (item?.image_url) {
                return item.image_url;
              }
              
              // Otherwise use 'image' path and construct URL
              if (item?.image) {
                const img = item.image;
                // If already a full URL
                if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                  return img;
                }
                // Construct from path
                const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                if (cleanPath.startsWith('storage/')) {
                  return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
                }
                return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
              }
              
              // Only return default if no image is available at all
              return '';
            };
            
            const imageUrl = getImageUrl(item);

            // Get seller name
            const sellerName = item.user?.name || item.user?.email || 'Unknown Seller';

            // console.log('Mapping item:', {
            //   id: item.id,
            //   title: itemTitle,
            //   originalTitle: item.title,
            //   originalName: item.name,
            //   price: item.price,
            //   seller: sellerName,
            // });

            return {
              id: item.id,
              image: imageUrl,
              title: itemTitle,
              price: `€${formattedPrice}`,
              seller: sellerName,
              condition: item.condition || 'Good',
            };
          });

        // console.log('Approved products (approved=3):', approvedProducts);
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
      const response = await axios.get(`http://127.0.0.1:8000/api/items/${productId}`);
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
    </section>
  );
}