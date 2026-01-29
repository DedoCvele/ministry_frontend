import { X } from 'lucide-react';
import { type Language, getTranslation } from '../translations';

interface ContactOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  /** Seller phone (digits only or with formatting). If missing, buttons still show but note is displayed. */
  phone?: string | null;
  language?: Language;
}

export function ContactOptionsPopup({
  isOpen,
  onClose,
  sellerName,
  phone,
  language = 'en',
}: ContactOptionsPopupProps) {
  const t = getTranslation(language);
  const phoneDigits = phone?.replace(/\D/g, '') || '';

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
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
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

        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px',
            fontWeight: 600,
            color: '#0A4834',
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          {t.contactOptions.title}
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
          {t.contactOptions.chooseMethod.replace('{name}', sellerName)}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => {
              const message = encodeURIComponent(t.contactOptions.whatsappMessage);
              window.open(`https://wa.me/${phoneDigits}?text=${message}`, '_blank');
              onClose();
            }}
            disabled={!phoneDigits}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 24px',
              backgroundColor: phoneDigits ? '#25D366' : '#ccc',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: phoneDigits ? 'pointer' : 'not-allowed',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (phoneDigits) {
                e.currentTarget.style.backgroundColor = '#1da851';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = phoneDigits ? '#25D366' : '#ccc';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => {
              window.open(`viber://chat?number=${phoneDigits}`, '_blank');
              onClose();
            }}
            disabled={!phoneDigits}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 24px',
              backgroundColor: phoneDigits ? '#7360F2' : '#ccc',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: phoneDigits ? 'pointer' : 'not-allowed',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (phoneDigits) {
                e.currentTarget.style.backgroundColor = '#5a4bc7';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = phoneDigits ? '#7360F2' : '#ccc';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.182.518 6.795.358 10.013c-.161 3.218-.26 9.254 5.648 10.929h.006l-.004 2.51s-.037.986.626 1.188c.803.248 1.274-.517 2.042-1.347.42-.455.998-1.121 1.434-1.63 3.953.327 6.99-.427 7.337-.54.801-.257 5.342-.837 6.084-6.834.765-6.187-.367-10.09-2.412-11.861l-.004-.001C19.558.675 15.823-.076 11.398.002zM11.6 1.2c3.977-.058 7.325.476 8.725 1.722l.002.001c1.632 1.411 2.604 4.928 1.921 10.432-.613 4.972-4.248 5.648-4.932 5.87-.289.094-2.986.76-6.412.514 0 0-2.541 3.025-3.334 3.818-.124.124-.27.175-.368.152-.138-.033-.176-.189-.175-.417l.024-4.147c-4.908-1.4-4.628-6.321-4.49-9.073.138-2.751.79-5.029 2.263-6.495 1.933-1.771 5.345-2.322 8.776-2.377zm-.056 3.048c-.166.002-.32.137-.326.398-.007.27.195.463.403.466 1.61.022 2.876.495 3.793 1.366.922.876 1.427 2.089 1.505 3.637.007.172.149.363.399.361.26-.002.433-.2.425-.465-.09-1.78-.678-3.22-1.796-4.282-1.112-1.057-2.62-1.612-4.403-1.481zm.042 1.58c-.158.002-.31.124-.33.373-.02.26.166.458.367.482.99.116 1.648.482 2.099 1.012.454.533.695 1.23.756 2.015.015.19.169.374.424.358.264-.016.413-.214.398-.49-.076-.971-.378-1.857-.976-2.559-.594-.698-1.457-1.136-2.59-1.27a.496.496 0 00-.148.079zm.078 1.556c-.17-.014-.365.114-.384.364-.037.51.165.894.446 1.155.286.265.676.434 1.073.467.202.016.396-.134.41-.384.014-.262-.165-.428-.35-.445-.244-.021-.452-.12-.597-.255-.148-.137-.24-.322-.219-.533.014-.182-.147-.342-.32-.366a.425.425 0 00-.059-.003z" />
            </svg>
            <span>Viber</span>
          </button>
        </div>

        {!phoneDigits && (
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              color: '#000000',
              opacity: 0.5,
              marginTop: '20px',
              marginBottom: 0,
              fontStyle: 'italic',
              lineHeight: '1.6',
              textAlign: 'center',
            }}
          >
            {t.contactOptions.noPhone}
          </p>
        )}
      </div>
    </div>
  );
}
