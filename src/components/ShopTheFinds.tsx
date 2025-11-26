import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Language, getTranslation } from '../translations';
import axios from 'axios';

interface ShopTheFindsProps {
  language?: Language;
}

interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  seller: string;
  condition: string;
}

export function ShopTheFinds({ language = 'en' }: ShopTheFindsProps = {}) {
  const t = getTranslation(language);
  const navigate = useNavigate();
  const [wishlistedItems, setWishlistedItems] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved items from API
  useEffect(() => {
    const fetchApprovedItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/items');
        const items = response.data;

        // Console log the full response to debug
        console.log('=== SHOP THE FINDS - API RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Is array?', Array.isArray(response.data));
        if (Array.isArray(items) && items.length > 0) {
          console.log('First item structure:', items[0]);
          console.log('First item keys:', Object.keys(items[0]));
          console.log('First item title:', items[0].title);
          console.log('First item name:', items[0].name);
        }

        // Filter for approved items and map to product format
        const approvedProducts: Product[] = items
          .filter((item: any) => item.approved === 1)
          .map((item: any) => {
            // Try multiple possible field names for title
            const itemTitle = item.title || item.name || item.product_name || 'Untitled Item';
            
            // Format price with euro symbol
            const priceValue = parseFloat(item.price) || 0;
            const formattedPrice = priceValue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            // Get image URL
            const imageUrl = item.images && item.images.length > 0
              ? `http://127.0.0.1:8000/storage/${item.images[0]}`
              : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';

            // Get seller name
            const sellerName = item.user?.name || item.user?.email || 'Unknown Seller';

            console.log('Mapping item:', {
              id: item.id,
              title: itemTitle,
              originalTitle: item.title,
              originalName: item.name,
              price: item.price,
              seller: sellerName,
            });

            return {
              id: item.id,
              image: imageUrl,
              title: itemTitle,
              price: `€${formattedPrice}`,
              seller: sellerName,
              condition: item.condition || 'Good',
            };
          });

        console.log('Approved products:', approvedProducts);
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
    console.log('=== ITEM CLICKED ===');
    console.log('Product ID:', productId);
    
    try {
      // Fetch the product data when clicked to log the response
      const response = await axios.get(`http://127.0.0.1:8000/api/items/${productId}`);
      console.log('=== AXIOS RESPONSE ON ITEM CLICK ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Product title:', response.data.title);
      console.log('Product name:', response.data.name);
      console.log('Product keys:', Object.keys(response.data));
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
            Curated Selection
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
            Discover one-of-a-kind pieces from luxury closets around the world.
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
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '16px', color: '#0A4834', opacity: 0.7 }}>
                No approved products available at the moment.
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
                  by {product.seller}
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
            View All Items
          </motion.button>
        </div>
      </div>
    </section>
  );
}