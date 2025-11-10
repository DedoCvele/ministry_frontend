import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface PaymentProcessingProps {
  onComplete: () => void;
}

export function PaymentProcessing({ onComplete }: PaymentProcessingProps) {
  useEffect(() => {
    // Auto-transition after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      backgroundColor: '#F0ECE3',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '64px 48px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Animated Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          style={{
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          <Loader2 size={64} color="#9F8151" strokeWidth={1.5} />
        </motion.div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#E0E0E0',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '32px',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            style={{
              height: '100%',
              backgroundColor: '#9F8151',
            }}
          />
        </div>

        {/* Text */}
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '28px',
          color: '#0A4834',
          marginBottom: '16px',
          letterSpacing: '0.02em',
        }}>
          Processing your payment…
        </h2>

        <p style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '15px',
          color: '#666',
          lineHeight: '1.6',
        }}>
          This may take a few seconds. Please don't close this window.
        </p>

        {/* Security Badge */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#FFFAF5',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            color: '#9F8151',
          }}>
            🔒 Secure Payment Processing
          </span>
        </div>
      </motion.div>
    </div>
  );
}
