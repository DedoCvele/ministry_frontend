import { MessageCircle, Package, Truck, ArrowLeftRight, Upload as UploadIcon, User, Phone, X } from 'lucide-react';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';

interface ChatbotFlowProps {
  onClose?: () => void;
}

export function ChatbotFlow({ onClose }: ChatbotFlowProps) {
  const intents = [
    { icon: Package, label: 'Orders', color: '#0A4834' },
    { icon: Truck, label: 'Shipping', color: '#0A4834' },
    { icon: ArrowLeftRight, label: 'Returns', color: '#0A4834' },
    { icon: UploadIcon, label: 'Posting', color: '#9F8151' },
    { icon: User, label: 'Profile', color: '#9F8151' },
    { icon: MessageCircle, label: 'Contact Seller', color: '#9F8151' },
    { icon: Phone, label: 'Talk to Human', color: '#000000' },
  ];

  return (
    <div style={{ backgroundColor: '#F0ECE3', minHeight: '100vh' }}>
      <HeaderAlt />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 40px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '48px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '16px',
              marginTop: 0,
            }}
          >
            Chatbot Flow Visualization
          </h1>
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#000000',
              opacity: 0.7,
              marginTop: 0,
            }}
          >
            FAQ Assistant + Talk to Human Support
          </p>
        </div>

        {/* Intent Categories */}
        <section style={{ marginBottom: '60px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '32px',
              marginTop: 0,
            }}
          >
            Support Intents
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {intents.map((intent, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${intent.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <intent.icon size={24} color={intent.color} />
                </div>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#0A4834',
                  }}
                >
                  {intent.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Example Flow */}
        <section style={{ marginBottom: '60px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '32px',
              marginTop: 0,
            }}
          >
            Example Conversation Flow
          </h2>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* User Question */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <div
                style={{
                  backgroundColor: '#0A4834',
                  color: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '70%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                }}
              >
                Where is my order?
              </div>
            </div>

            {/* Bot Response */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#F0ECE3',
                  color: '#000000',
                  padding: '16px 20px',
                  borderRadius: '16px 16px 16px 4px',
                  maxWidth: '70%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                }}
              >
                I can help you track your order! Please provide your order number, or I can look up recent orders for you.
              </div>
            </div>

            {/* User Question 2 */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <div
                style={{
                  backgroundColor: '#0A4834',
                  color: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '70%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                }}
              >
                Can you help me contact the seller?
              </div>
            </div>

            {/* Bot Fallback */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#F0ECE3',
                  color: '#000000',
                  padding: '16px 20px',
                  borderRadius: '16px 16px 16px 4px',
                  maxWidth: '70%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                }}
              >
                For seller-specific questions, you can contact them directly through their profile. Would you like to speak with a human support agent instead?
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#9F8151',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    Talk to Human
                  </button>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#0A4834',
                      border: '1px solid #0A4834',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    Continue with Bot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UI Mockups */}
        <section>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '32px',
              marginTop: 0,
            }}
          >
            Chat Widget UI
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {/* Closed State */}
            <div>
              <h3
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginBottom: '16px',
                  marginTop: 0,
                }}
              >
                Sticky Button (Closed)
              </h3>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '40px',
                  borderRadius: '16px',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  position: 'relative',
                  height: '200px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#0A4834',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(10, 72, 52, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  <MessageCircle size={28} color="#FFFFFF" />
                </div>
              </div>
            </div>

            {/* Open State */}
            <div>
              <h3
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginBottom: '16px',
                  marginTop: 0,
                }}
              >
                Chat Window (Open)
              </h3>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    backgroundColor: '#0A4834',
                    color: '#FFFFFF',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MessageCircle size={20} />
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}>
                      Ministry Support
                    </span>
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <X size={20} color="#FFFFFF" />
                  </button>
                </div>

                {/* Messages */}
                <div style={{ padding: '20px', minHeight: '200px', backgroundColor: '#F0ECE3' }}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '12px 16px',
                      borderRadius: '12px 12px 12px 4px',
                      marginBottom: '12px',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                    }}
                  >
                    Hi! How can I help you today?
                  </div>
                </div>

                {/* Input */}
                <div style={{ padding: '16px', borderTop: '1px solid #00000010' }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      border: '1px solid #00000020',
                      borderRadius: '12px',
                      outline: 'none',
                      backgroundColor: '#F0ECE3',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Triggers */}
        <section style={{ marginTop: '60px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '32px',
              marginTop: 0,
            }}
          >
            Automatic Triggers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginBottom: '12px',
                  marginTop: 0,
                }}
              >
                Exit-Intent
              </h3>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  opacity: 0.7,
                  marginTop: 0,
                  marginBottom: 0,
                  lineHeight: '1.6',
                }}
              >
                Chatbot appears when user moves cursor to leave the page: "Before you go, is there anything I can help you with?"
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginBottom: '12px',
                  marginTop: 0,
                }}
              >
                Cart Inactivity
              </h3>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  opacity: 0.7,
                  marginTop: 0,
                  marginBottom: 0,
                  lineHeight: '1.6',
                }}
              >
                If user hasn't completed checkout after 2 minutes: "Need help completing your purchase?"
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  color: '#0A4834',
                  marginBottom: '12px',
                  marginTop: 0,
                }}
              >
                Page-Specific
              </h3>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  opacity: 0.7,
                  marginTop: 0,
                  marginBottom: 0,
                  lineHeight: '1.6',
                }}
              >
                Contextual help based on current page (e.g., upload tips on Upload page, shipping info on Checkout)
              </p>
            </div>
          </div>
        </section>
      </div>

      <FooterAlt />
    </div>
  );
}
