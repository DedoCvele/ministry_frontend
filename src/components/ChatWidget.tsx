import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Paperclip, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

type ChatMode = 'faq' | 'seller' | 'support';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('faq');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'MK'>('EN');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { text: "Where's my order?", action: 'order' },
    { text: 'How to sell an item?', action: 'sell' },
    { text: 'How to return?', action: 'return' },
    { text: 'Talk to support 🕊️', action: 'support' },
    { text: 'Contact seller', action: 'seller' },
  ];

  const handleQuickAction = (action: string) => {
    setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now(),
      text: quickActions.find(qa => qa.action === action)?.text || '',
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      
      let botResponse = '';
      
      switch (action) {
        case 'order':
          botResponse = "I can help you track your order! Please check your email for the tracking number, or view your order history in your account. Your recent order should arrive in 3-5 business days. 📦";
          break;
        case 'sell':
          botResponse = "Selling with Ministry is simple! Click 'Become a Seller' in the main navigation, set up your closet profile, and start listing your pieces. We'll guide you through photography tips and pricing. ✨";
          break;
        case 'return':
          botResponse = "Returns are easy within 14 days. Items must be unworn with tags attached. Visit your order page and click 'Request Return' to get a prepaid shipping label. 🔄";
          break;
        case 'support':
          setChatMode('support');
          botResponse = "Connecting you to our support team... We typically respond within 1 hour. How can we help you today? 💚";
          break;
        case 'seller':
          setChatMode('seller');
          botResponse = "I can help you contact the seller directly! Would you like to open your messages to continue the conversation? 💬";
          break;
        default:
          botResponse = "I'm here to help! What can I assist you with today?";
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowWelcome(false);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Thank you for your message! Our team will get back to you shortly. In the meantime, feel free to browse our curated collections. 🌿",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Sticky Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, backgroundColor: '#083D2C' }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          y: isOpen ? 0 : [0, -8, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          },
        }}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#0A4834',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          transition: 'background-color 0.3s ease',
        }}
        aria-label="Chat support"
      >
        <MessageCircle size={28} color="#FFFFFF" />
      </motion.button>

      {/* Chat Widget Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '32px',
              width: '400px',
              height: '580px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(159,129,81,0.2)',
              borderRadius: '20px',
              boxShadow: '0px 8px 28px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div style={{
              background: chatMode === 'support' 
                ? 'linear-gradient(135deg, #9F8151 0%, #B89968 100%)' 
                : 'linear-gradient(135deg, #0A4834 0%, #0D5A42 100%)',
              height: '72px',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.5s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#9F8151',
                }}>
                  M.
                </div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  margin: 0,
                }}>
                  {chatMode === 'support' ? 'Live Support' : 'Ministry Assistant'}
                </h3>
              </div>

              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ color: '#9F8151', rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  padding: '8px',
                  transition: 'color 0.3s ease',
                }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Chat Content Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              backgroundColor: '#FFFFFF',
            }}>
              {/* Welcome State */}
              {showWelcome && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {/* Welcome Message */}
                  <div style={{
                    backgroundColor: '#F0ECE3',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      color: '#000000',
                      lineHeight: '1.6',
                      margin: 0,
                    }}>
                      Hi there! 👋 I'm the Ministry Assistant — here to help with your orders, closets, and style questions.
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.action}
                        onClick={() => handleQuickAction(action.action)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                          backgroundColor: 'rgba(159,129,81,0.1)',
                          x: 4,
                        }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#0A4834',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #DCD6C9',
                          borderRadius: '24px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.3s ease',
                          boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        {action.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Chat Messages */}
              {messages.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        maxWidth: '80%',
                        backgroundColor: message.sender === 'bot' ? '#F0ECE3' : '#0A4834',
                        color: message.sender === 'bot' ? '#000000' : '#FFFFFF',
                        borderRadius: message.sender === 'bot' 
                          ? '12px 12px 12px 0px' 
                          : '12px 12px 0px 12px',
                        padding: '12px 16px',
                      }}>
                        <p style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          lineHeight: '1.6',
                          margin: 0,
                        }}>
                          {message.text}
                        </p>
                      </div>
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '12px',
                        color: '#9F8151',
                        marginTop: '4px',
                      }}>
                        {formatTime(message.timestamp)}
                      </span>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div style={{
                        backgroundColor: '#F0ECE3',
                        borderRadius: '12px 12px 12px 0px',
                        padding: '12px 16px',
                        display: 'flex',
                        gap: '4px',
                      }}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              y: [0, -6, 0],
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#9F8151',
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              borderTop: '1px solid #DCD6C9',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {/* Attachment Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9F8151',
                    padding: '8px',
                  }}
                >
                  <Paperclip size={20} />
                </motion.button>

                {/* Input Field */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question…"
                  style={{
                    flex: 1,
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCD6C9',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#9F8151'}
                  onBlur={(e) => e.target.style.borderColor = '#DCD6C9'}
                />

                {/* Send Button */}
                <motion.button
                  onClick={handleSendMessage}
                  whileHover={{ backgroundColor: '#083D2C' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#0A4834',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <Send size={18} color="#FFFFFF" />
                </motion.button>
              </div>

              {/* Language Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  backgroundColor: '#F0ECE3',
                  borderRadius: '16px',
                  padding: '4px',
                  gap: '4px',
                }}>
                  {(['EN', 'MK'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: language === lang ? '#FFFFFF' : 'rgba(0,0,0,0.5)',
                        backgroundColor: language === lang ? '#9F8151' : 'transparent',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '6px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grain Texture for Chat Widget */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}
