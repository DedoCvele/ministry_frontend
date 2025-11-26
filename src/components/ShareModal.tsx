import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Facebook, Twitter } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  closetName: string;
  closetUrl: string;
}

export function ShareModal({ isOpen, onClose, closetName, closetUrl }: ShareModalProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(closetUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
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
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              width: '90%',
              maxWidth: '480px',
              zIndex: 51,
              boxShadow: '0px 20px 40px rgba(0,0,0,0.1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={24} color="#000000" />
            </button>

            {/* Content */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '32px',
                fontWeight: 600,
                color: '#0A4834',
                margin: '0 0 8px 0',
              }}>
                Share this Closet
              </h2>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                color: 'rgba(0,0,0,0.7)',
                margin: '0 0 32px 0',
              }}>
                Share {closetName}'s closet with your friends
              </p>

              {/* Share Options */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}>
                <ShareButton
                  icon={<Facebook size={20} />}
                  label="Facebook"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(closetUrl)}`, '_blank')}
                />
                <ShareButton
                  icon={<Twitter size={20} />}
                  label="Twitter"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(closetUrl)}&text=Check out ${encodeURIComponent(closetName)}'s closet on Ministry of Second Hand`, '_blank')}
                />
                <ShareButton
                  icon={<Link2 size={20} />}
                  label="Copy Link"
                  onClick={copyToClipboard}
                />
              </div>

              {/* Copy Link */}
              <div
                style={{
                  backgroundColor: '#F0ECE3',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{
                  flex: 1,
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                }}>
                  {closetUrl}
                </div>
                <motion.button
                  onClick={copyToClipboard}
                  whileHover={{ backgroundColor: '#0A4834', color: '#FFFFFF' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCD6C9',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0A4834',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Link2 size={16} /> Copy Link
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShareButton({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, backgroundColor: '#0A4834' }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: '#9F8151',
        border: 'none',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: '#FFFFFF',
        transition: 'all 0.2s ease',
      }}
    >
      {icon}
      <span style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
      }}>
        {label}
      </span>
    </motion.button>
  );
}