import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { type Language, getTranslation } from '../translations';

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export function NewsletterPopup({ isOpen, onClose, language = 'en' }: NewsletterPopupProps) {
  const t = getTranslation(language);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 72, 52, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0px 24px 64px rgba(0,0,0,0.15)',
          maxWidth: '540px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#0A4834',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0ECE3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={24} />
        </button>

        {/* Decorative Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A4834 0%, #0F5A43 100%)',
          padding: '48px 40px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            backgroundColor: 'rgba(159, 129, 81, 0.15)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(159, 129, 81, 0.1)',
          }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#9F8151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0px 8px 24px rgba(159, 129, 81, 0.3)',
            }}
          >
            <Mail size={32} color="#FFFFFF" />
          </motion.div>

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '36px',
            fontWeight: 600,
            color: '#FFFFFF',
            margin: '0 0 12px 0',
            position: 'relative',
          }}>
            Join Our Circle
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            lineHeight: '1.6',
            position: 'relative',
          }}>
            Be the first to discover new arrivals, editorial stories, and exclusive offers.
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '40px' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9F8151',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                      padding: '14px 16px 14px 48px',
                      border: '1.5px solid #DCD6C9',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#9F8151';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(159, 129, 81, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#DCD6C9';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Subscribe Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#0A4834',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0px 4px 12px rgba(10, 72, 52, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#083D2C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0A4834';
                }}
              >
                Subscribe to Newsletter
              </motion.button>

              {/* Privacy Notice */}
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
                marginTop: '20px',
                lineHeight: '1.6',
              }}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#0A4834',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>

              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '28px',
                fontWeight: 600,
                color: '#0A4834',
                margin: '0 0 12px 0',
              }}>
                Welcome to the Circle!
              </h3>

              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                color: 'rgba(0, 0, 0, 0.7)',
                margin: 0,
              }}>
                Check your inbox for a special welcome gift.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}