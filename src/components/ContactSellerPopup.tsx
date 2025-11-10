import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Language, getTranslation } from '../translations';

interface ContactSellerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  language?: Language;
}

export function ContactSellerPopup({
  isOpen,
  onClose,
  sellerName,
  language = 'en'
}: ContactSellerPopupProps) {
  const t = getTranslation(language);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/15551234567?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 72, 52, 0.3)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.3s ease-in-out',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0ECE3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={20} color="#000000" />
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#0A4834',
            marginBottom: '12px',
            marginTop: 0,
          }}
        >
          {t.contactSeller.title} {sellerName}
        </h2>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: '#000000',
            opacity: 0.7,
            marginBottom: '24px',
            marginTop: 0,
          }}
        >
          {t.contactSeller.message}
        </p>

        {/* Message Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.contactSeller.messagePlaceholder}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #0A4834',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: '#000000',
            resize: 'vertical',
            minHeight: '100px',
            marginBottom: '20px',
          }}
        />

        {/* Contact Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Send Button */}
          <button
            onClick={handleSend}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 24px',
              backgroundColor: '#0A4834',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#083d2c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0A4834';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Send size={20} />
            <span>{t.contactSeller.send}</span>
          </button>
        </div>

        {/* Note */}
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            color: '#000000',
            opacity: 0.5,
            marginTop: '24px',
            marginBottom: 0,
            fontStyle: 'italic',
            lineHeight: '1.6',
            textAlign: 'center',
          }}
        >
          Click the button above to open WhatsApp and start a conversation
        </p>
      </div>
    </div>
  );
}