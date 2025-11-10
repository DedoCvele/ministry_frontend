import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { type Language, getTranslation } from '../translations';

interface ShopTheFindsProps {
  language?: Language;
}

export function ShopTheFinds({ language = 'en' }: ShopTheFindsProps = {}) {
  const t = getTranslation(language);
  const [wishlistedItems, setWishlistedItems] = useState<number[]>([]);

  const products = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwaGFuZGJhZ3xlbnwxfHx8fDE3NjE1NzAzODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Vintage Gucci Marmont',
      price: '€890',
      seller: 'Elena C.',
      condition: 'Excellent',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1715408153725-186c6c77fb45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHZpbnRhZ2UlMjBjb2F0fGVufDF8fHx8MTc2MTU3MTQyOHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Burberry Trench Coat',
      price: '€385',
      seller: 'Sophie M.',
      condition: 'Very Good',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1747707500073-65dd5c1407b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwZHJlc3N8ZW58MXx8fHwxNzYxNTcxNDI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Valentino Silk Dress',
      price: '€620',
      seller: 'Claire D.',
      condition: 'Excellent',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1616795854633-b7b089bb7281?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHZpbnRhZ2UlMjBzaG9lc3xlbnwxfHx8fDE3NjE1NzE0Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Manolo Blahnik Heels',
      price: '€295',
      seller: 'Marie L.',
      condition: 'Very Good',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1597310781652-78af3276ba5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwamV3ZWxyeXxlbnwxfHx8fDE3NjE1NzE0Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Cartier Love Bracelet',
      price: '€2,450',
      seller: 'Anna K.',
      condition: 'Excellent',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1760446031507-ed534e0f9605?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHZpbnRhZ2UlMjBzdW5nbGFzc2VzfGVufDF8fHx8MTc2MTU3MTQyOXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Chanel Sunglasses',
      price: '€180',
      seller: 'Julia R.',
      condition: 'Excellent',
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1743324690702-d33036a5f904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW50YWdlJTIwc2NhcmZ8ZW58MXx8fHwxNzYxNTcxNDMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Hermès Silk Scarf',
      price: '€240',
      seller: 'Emma B.',
      condition: 'Excellent',
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1633655442168-c6ef0ed2f984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHZpbnRhZ2UlMjBibGF6ZXJ8ZW58MXx8fHwxNzYxNTcxNDMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Armani Wool Blazer',
      price: '€340',
      seller: 'Olivia S.',
      condition: 'Very Good',
    },
  ];

  const toggleWishlist = (id: number) => {
    setWishlistedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              whileHover={{ y: -8 }}
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
          ))}
        </div>

        {/* View All Button */}
        <div style={{ textAlign: 'center' }}>
          <motion.button
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