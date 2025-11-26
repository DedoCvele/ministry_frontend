import { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';
import './styles/CartPage.css';

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
    <div className="cart-page-root">
      <HeaderAlt language={language} />
      
      <div className="cart-page-content">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          className="cart-back-btn bs-manrope"
        >
          <ArrowLeft size={18} />
          {t.cart.continueShopping}
        </motion.button>

        {/* Page Title */}
        <h1 className="cart-title bs-cormorant">
          {t.cart.title}
        </h1>

        {items.length === 0 ? (
          // Empty State
          <div className="cart-empty">
            <ShoppingBag 
              size={64} 
              strokeWidth={1} 
              className="cart-empty-icon"
            />
            <p className="cart-empty-title bs-cormorant">
              {t.cart.empty}
            </p>
            <motion.button
              whileHover={{ backgroundColor: '#083D2C' }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinueShopping}
              className="cart-empty-btn bs-manrope"
            >
              {t.cart.continueShopping}
            </motion.button>
          </div>
        ) : (
          // Cart Content
          <div className="cart-grid">
            {/* Left Column - Cart Items */}
            <div className="cart-items-column">
              <div className="cart-items-list">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="cart-item-card"
                  >
                    {/* Product Image */}
                    <div className="cart-item-image">
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
                    <div className="cart-item-info">
                      <h3 className="cart-item-title bs-cormorant">
                        {item.title}
                      </h3>
                      <p className="cart-item-seller bs-manrope">
                        Sold by {item.seller}
                      </p>
                      <p className="cart-item-condition bs-manrope">
                        Condition: {item.condition}
                      </p>
                      <p className="cart-item-price bs-manrope">
                        €{item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: '#FFEBEB' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRemoveItem(item.id)}
                      className="cart-item-remove-btn"
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
                className="cart-continue-btn bs-manrope"
              >
                Continue Shopping →
              </motion.button>
            </div>

            {/* Right Column - Summary */}
            <div className="cart-summary-column">
              <div className="cart-summary-box">
                <h2 className="cart-summary-title bs-cormorant">
                  {t.checkout.orderSummary}
                </h2>

                {/* Summary Items */}
                <div className="cart-summary-items">
                  <div className="cart-summary-item bs-manrope">
                    <span>{t.cart.subtotal} ({items.length} {t.cart.itemsInCart})</span>
                    <span>€{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="cart-summary-item bs-manrope">
                    <span>{t.cart.shipping}</span>
                    <span style={{ color: '#0A4834' }}>{t.cart.shippingCost}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="cart-total-row">
                  <span className="cart-total-label bs-manrope">
                    {t.cart.total}
                  </span>
                  <div className="cart-total-amount">
                    <div className="cart-total-value bs-cormorant">
                      €{subtotal.toLocaleString()}
                    </div>
                    <div className="cart-total-delivery bs-manrope">
                      + 150 DEN delivery
                    </div>
                  </div>
                </div>
                <p className="cart-delivery-note bs-manrope">
                  Delivery fee to be paid in cash
                </p>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ backgroundColor: '#8A6D43', y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="cart-checkout-btn bs-manrope"
                >
                  Proceed to Checkout
                </motion.button>

                {/* Security Badge */}
                <p className="cart-security-badge bs-manrope">
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