import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface SimpleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (rating: number, comment: string) => void;
}

export function SimpleReviewModal({ isOpen, onClose, onSubmit }: SimpleReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit?.(rating, comment);
      onClose();
      // Reset
      setRating(0);
      setComment('');
    }
  };

  const handleSkip = () => {
    onClose();
    setRating(0);
    setComment('');
  };

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
          from { opacity: 0; }
          to { opacity: 1; }
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
          How was your experience?
        </h2>

        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: '#000000',
            opacity: 0.7,
            marginBottom: '32px',
            marginTop: 0,
          }}
        >
          Your feedback helps our community grow
        </p>

        {/* Star Rating */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                transition: 'transform 0.2s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
            >
              <Star
                size={36}
                fill={star <= (hoveredRating || rating) ? '#9F8151' : 'none'}
                color={star <= (hoveredRating || rating) ? '#9F8151' : '#00000033'}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

        {/* Comment Textarea */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '16px',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: '#000000',
            backgroundColor: '#F0ECE3',
            border: 'none',
            borderRadius: '12px',
            resize: 'vertical',
            marginBottom: '24px',
            outline: 'none',
          }}
        />

        {/* Note */}
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            color: '#000000',
            opacity: 0.5,
            marginBottom: '24px',
            marginTop: 0,
            fontStyle: 'italic',
          }}
        >
          Reviews may be approved before publishing
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '14px 24px',
              backgroundColor: 'transparent',
              color: '#0A4834',
              border: '2px solid #0A4834',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0ECE3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Skip
          </button>

          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            style={{
              flex: 1,
              padding: '14px 24px',
              backgroundColor: rating === 0 ? '#cccccc' : '#0A4834',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: rating === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              opacity: rating === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (rating > 0) {
                e.currentTarget.style.backgroundColor = '#083d2c';
              }
            }}
            onMouseLeave={(e) => {
              if (rating > 0) {
                e.currentTarget.style.backgroundColor = '#0A4834';
              }
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
