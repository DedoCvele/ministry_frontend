import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Package, ArrowRight, User } from 'lucide-react';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';

interface NewOrderConfirmationProps {
  onContinueShopping?: () => void;
  onViewOrders?: () => void;
}

export function NewOrderConfirmation({ onContinueShopping, onViewOrders }: NewOrderConfirmationProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Fade out confetti after 2 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  const orderDetails = {
    orderNumber: 'MOS-2024-001234',
    date: 'November 3, 2024',
    item: 'Vintage Chanel Tweed Jacket',
    seller: 'Sophie Laurent',
    price: '€1,250',
    size: '38',
    shipping: 'Express Delivery',
    total: '€1,265',
  };

  return (
    <div style={{ backgroundColor: '#F0ECE3', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <HeaderAlt />

      {/* Confetti Animation */}
      {showConfetti && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none',
          zIndex: 50,
        }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -20, 
                x: `${Math.random() * 100}vw`,
                opacity: 1,
                rotate: 0,
              }}
              animate={{ 
                y: '110vh', 
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: 0,
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                ease: 'easeIn',
                delay: Math.random() * 0.5,
              }}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: ['#9F8151', '#0A4834', '#F0ECE3', '#FFFFFF'][Math.floor(Math.random() * 4)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '120px 40px 80px',
          textAlign: 'center',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#0A4834',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 6px 24px rgba(10, 72, 52, 0.2)',
          }}
        >
          <Check size={40} color="#FFFFFF" strokeWidth={3} />
        </div>

        {/* Main Message */}
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '48px',
            fontWeight: 600,
            color: '#0A4834',
            marginBottom: '16px',
            marginTop: 0,
            lineHeight: '1.3',
          }}
        >
          Thank you for giving this piece a new story
        </h1>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: '#000000',
            opacity: 0.7,
            marginBottom: '60px',
            marginTop: 0,
          }}
        >
          Your order has been confirmed and will be carefully prepared for shipment
        </p>

        {/* Order Summary Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '48px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            textAlign: 'left',
            marginBottom: '40px',
          }}
        >
          {/* Order Number */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '24px',
              marginBottom: '24px',
              borderBottom: '1px solid rgba(159, 129, 81, 0.2)',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '12px',
                  color: '#000000',
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px',
                  marginTop: 0,
                }}
              >
                Order Number
              </p>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {orderDetails.orderNumber}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '12px',
                  color: '#000000',
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px',
                  marginTop: 0,
                }}
              >
                Order Date
              </p>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {orderDetails.date}
              </p>
            </div>
          </div>

          {/* Item Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '16px',
                marginTop: 0,
              }}
            >
              {orderDetails.item}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                    opacity: 0.6,
                  }}
                >
                  Seller
                </span>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                  }}
                >
                  {orderDetails.seller}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                    opacity: 0.6,
                  }}
                >
                  Size
                </span>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                  }}
                >
                  {orderDetails.size}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                    opacity: 0.6,
                  }}
                >
                  Shipping
                </span>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                  }}
                >
                  {orderDetails.shipping}
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(159, 129, 81, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  opacity: 0.6,
                }}
              >
                Item Price
              </span>
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                }}
              >
                {orderDetails.price}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  opacity: 0.6,
                }}
              >
                Shipping
              </span>
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                }}
              >
                €15
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '2px solid #0A4834',
              }}
            >
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '18px',
                  color: '#0A4834',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '18px',
                  color: '#0A4834',
                }}
              >
                {orderDetails.total}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <motion.button
            whileHover={{ backgroundColor: '#083D2C', y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewOrders}
            style={{
              padding: '16px 32px',
              backgroundColor: '#0A4834',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.4s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0px 4px 12px rgba(10,72,52,0.3)',
            }}
          >
            <User size={20} />
            View Your Orders
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: '#9F815110', y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinueShopping}
            style={{
              padding: '16px 32px',
              backgroundColor: 'transparent',
              color: '#9F8151',
              border: '2px solid #9F8151',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.4s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Continue Shopping
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>

      <FooterAlt />
    </div>
  );
}
