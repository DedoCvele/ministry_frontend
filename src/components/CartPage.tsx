import { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';

interface CartItem {
  id: number;
  image: string;
  title: string;
  seller: string;
  price: number;
  condition: string;
}

interface CartPageProps {
  items: CartItem[];
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onBack: () => void;
  language?: Language;
}

export function CartPage({ items, onRemoveItem, onCheckout, onContinueShopping, onBack, language = 'en' }: CartPageProps) {
  const t = getTranslation(language);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const delivery = 150; // 150 DEN delivery
  const total = subtotal + delivery;

  return (
    <div style={{ backgroundColor: '#F0ECE3', minHeight: '100vh' }}>
      <HeaderAlt language={language} />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '80px 24px 120px' 
      }}>
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: '#0A4834',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '32px',
            padding: 0,
          }}
        >
          <ArrowLeft size={18} />
          {t.cart.continueShopping}
        </motion.button>

        {/* Page Title */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '32px',
          color: '#0A4834',
          marginBottom: '48px',
          letterSpacing: '0.02em',
        }}>
          {t.cart.title}
        </h1>

        {items.length === 0 ? (
          // Empty State
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
          }}>
            <ShoppingBag 
              size={64} 
              strokeWidth={1} 
              style={{ 
                color: '#9F8151', 
                margin: '0 auto 24px',
                opacity: 0.5 
              }} 
            />
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '24px',
              color: '#0A4834',
              marginBottom: '16px',
            }}>
              {t.cart.empty}
            </p>
            <motion.button
              whileHover={{ backgroundColor: '#083D2C' }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinueShopping}
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
                marginTop: '24px',
                transition: 'all 0.4s ease-in-out',
              }}
            >
              {t.cart.continueShopping}
            </motion.button>
          </div>
        ) : (
          // Cart Content
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}>
            {/* Left Column - Cart Items */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px' 
              }}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      gap: '20px',
                      boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                      position: 'relative',
                    }}
                  >
                    {/* Product Image */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#F0ECE3',
                    }}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '20px',
                        color: '#0A4834',
                        marginBottom: '8px',
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '4px',
                      }}>
                        Sold by {item.seller}
                      </p>
                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '13px',
                        color: '#9F8151',
                        marginBottom: '12px',
                      }}>
                        Condition: {item.condition}
                      </p>
                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#0A4834',
                      }}>
                        €{item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: '#FFEBEB' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRemoveItem(item.id)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#FFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <X size={16} color="#666" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <motion.button
                whileHover={{ x: 4 }}
                onClick={onContinueShopping}
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#9F8151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '24px',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Continue Shopping →
              </motion.button>
            </div>

            {/* Right Column - Summary */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
              }}>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '24px',
                  color: '#0A4834',
                  marginBottom: '24px',
                }}>
                  {t.checkout.orderSummary}
                </h2>

                {/* Summary Items */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  marginBottom: '24px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid #E0E0E0',
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    color: '#666',
                  }}>
                    <span>{t.cart.subtotal} ({items.length} {t.cart.itemsInCart})</span>
                    <span>€{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    color: '#666',
                  }}>
                    <span>{t.cart.shipping}</span>
                    <span style={{ color: '#0A4834' }}>{t.cart.shippingCost}</span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0A4834',
                  }}>
                    {t.cart.total}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '28px',
                      color: '#0A4834',
                    }}>
                      €{subtotal.toLocaleString()}
                    </div>
                    <div style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      color: '#666',
                      marginTop: '4px',
                    }}>
                      + 150 DEN delivery
                    </div>
                  </div>
                </div>
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '24px',
                  marginTop: '0',
                }}>
                  Delivery fee to be paid in cash
                </p>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ backgroundColor: '#8A6D43', y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  style={{
                    width: '100%',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: '#9F8151',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '18px 24px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    transition: 'all 0.4s ease-in-out',
                    boxShadow: '0px 4px 12px rgba(159,129,81,0.3)',
                  }}
                >
                  Proceed to Checkout
                </motion.button>

                {/* Security Badge */}
                <p style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'center',
                  marginTop: '16px',
                }}>
                  🔒 Secure checkout • SSL encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <FooterAlt />
    </div>
  );
}