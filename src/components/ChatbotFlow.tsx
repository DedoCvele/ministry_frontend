import { MessageCircle, Package, Truck, ArrowLeftRight, Upload as UploadIcon, User, Phone, X } from 'lucide-react';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import './styles/ChatbotFlow.css';

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
    <div className="chatbot-flow-root">
      <HeaderAlt />

      <div className="chatbot-flow-content">
        {/* Header */}
        <div className="chatbot-header">
          <h1 className="bs-cormorant chatbot-title">
            Chatbot Flow Visualization
          </h1>
          <p className="chatbot-subtitle">
            FAQ Assistant + Talk to Human Support
          </p>
        </div>

        {/* Intent Categories */}
        <section className="intents-section">
          <h2 className="bs-cormorant intents-section-title">
            Support Intents
          </h2>

          <div className="intents-grid">
            {intents.map((intent, index) => (
              <div
                key={index}
                className="intent-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="intent-icon-box"
                  style={{
                    backgroundColor: `${intent.color}15`,
                  }}
                >
                  <intent.icon size={24} color={intent.color} />
                </div>
                <span className="bs-manrope intent-label">
                  {intent.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Example Flow */}
        <section className="flow-section">
          <h2 className="bs-cormorant flow-section-title">
            Example Conversation Flow
          </h2>

          <div className="flow-container">
            {/* User Question */}
            <div className="message-row message-row-user">
              <div className="message-bubble message-bubble-user">
                Where is my order?
              </div>
            </div>

            {/* Bot Response */}
            <div className="message-row message-row-bot">
              <div className="message-bubble message-bubble-bot">
                I can help you track your order! Please provide your order number, or I can look up recent orders for you.
              </div>
            </div>

            {/* User Question 2 */}
            <div className="message-row message-row-user">
              <div className="message-bubble message-bubble-user">
                Can you help me contact the seller?
              </div>
            </div>

            {/* Bot Fallback */}
            <div className="message-row message-row-bot">
              <div className="message-bubble message-bubble-bot">
                For seller-specific questions, you can contact them directly through their profile. Would you like to speak with a human support agent instead?
                <div className="message-actions">
                  <button className="message-action-btn message-action-btn-primary">
                    Talk to Human
                  </button>
                  <button className="message-action-btn message-action-btn-secondary">
                    Continue with Bot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UI Mockups */}
        <section>
          <h2 className="bs-cormorant ui-mockups-title">
            Chat Widget UI
          </h2>

          <div className="mockups-grid">
            {/* Closed State */}
            <div>
              <h3 className="bs-manrope mockup-label">
                Sticky Button (Closed)
              </h3>
              <div className="mockup-closed-state">
                <div className="chat-button">
                  <MessageCircle size={28} color="#FFFFFF" />
                </div>
              </div>
            </div>

            {/* Open State */}
            <div>
              <h3 className="bs-manrope mockup-label">
                Chat Window (Open)
              </h3>
              <div className="mockup-open-state">
                {/* Header */}
                <div className="chat-header">
                  <div className="chat-header-content">
                    <MessageCircle size={20} />
                    <span className="chat-header-text">
                      Ministry Support
                    </span>
                  </div>
                  <button className="chat-close-btn">
                    <X size={20} color="#FFFFFF" />
                  </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  <div className="chat-message-bubble">
                    Hi! How can I help you today?
                  </div>
                </div>

                {/* Input */}
                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="chat-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Triggers */}
        <section className="triggers-section">
          <h2 className="bs-cormorant triggers-title">
            Automatic Triggers
          </h2>

          <div className="triggers-grid">
            <div className="trigger-card">
              <h3 className="bs-manrope trigger-card-title">
                Exit-Intent
              </h3>
              <p className="trigger-card-desc">
                Chatbot appears when user moves cursor to leave the page: "Before you go, is there anything I can help you with?"
              </p>
            </div>

            <div className="trigger-card">
              <h3 className="bs-manrope trigger-card-title">
                Cart Inactivity
              </h3>
              <p className="trigger-card-desc">
                If user hasn't completed checkout after 2 minutes: "Need help completing your purchase?"
              </p>
            </div>

            <div className="trigger-card">
              <h3 className="bs-manrope trigger-card-title">
                Page-Specific
              </h3>
              <p className="trigger-card-desc">
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
