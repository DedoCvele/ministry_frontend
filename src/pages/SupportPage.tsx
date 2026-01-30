import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderAlt } from '../components/HeaderAlt';
import { FooterAlt } from '../components/FooterAlt';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Mail, Clock } from 'lucide-react';
import '../components/styles/SupportPage.css';

const SUPPORT_CATEGORIES = [
  { value: '', label: 'Select a topic' },
  { value: 'general', label: 'General inquiry' },
  { value: 'account', label: 'Account & profile' },
  { value: 'orders', label: 'Orders & shipping' },
  { value: 'selling', label: 'Selling & listings' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'feedback', label: 'Feedback & suggestions' },
  { value: 'other', label: 'Other' },
];

export function SupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      // Placeholder: in production you would POST to your support API
      await new Promise((r) => setTimeout(r, 800));
      setIsSubmitted(true);
      setSubject('');
      setCategory('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <HeaderAlt
        onShopClick={() => navigate('/shop')}
        onClosetsClick={() => navigate('/closets')}
        onJournalClick={() => navigate('/blog')}
        onBecomeSellerClick={() => navigate('/become-seller')}
      />

      <section className="support-hero">
        <div className="support-hero-content">
          <div className="support-icon-wrap">
            <MessageCircle className="support-icon" aria-hidden />
          </div>
          <h1 className="support-title">Contact Support</h1>
          <p className="support-subtitle">
            Have a question or need help? Send a message to the site owners. We typically respond within 1–2 business days.
          </p>
        </div>
      </section>

      <section className="support-main">
        <div className="support-layout">
          <aside className="support-info">
            <div className="support-info-card">
              <h2 className="support-info-title">How we can help</h2>
              <ul className="support-info-list">
                <li>Account and profile issues</li>
                <li>Orders, shipping, and returns</li>
                <li>Listing and selling questions</li>
                <li>Technical problems or bugs</li>
                <li>Feedback and suggestions</li>
              </ul>
            </div>
            <div className="support-info-card support-info-response">
              <Clock className="support-info-icon" aria-hidden />
              <p className="support-info-text">
                <strong>Response time:</strong> We aim to reply within 1–2 business days.
              </p>
            </div>
            <div className="support-info-card support-info-email">
              <Mail className="support-info-icon" aria-hidden />
              <p className="support-info-text">
                You’re logged in as <strong>{displayName || user?.username}</strong>. Replies will be sent to your account email.
              </p>
            </div>
          </aside>

          <div className="support-form-wrap">
            {isSubmitted ? (
              <div className="support-success">
                <div className="support-success-icon" aria-hidden>
                  <Send />
                </div>
                <h2 className="support-success-title">Message sent</h2>
                <p className="support-success-text">
                  Thank you for contacting us. We’ll get back to you as soon as we can.
                </p>
                <button
                  type="button"
                  className="support-success-btn"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="support-form">
                <label className="support-label" htmlFor="support-subject">
                  Subject
                </label>
                <input
                  id="support-subject"
                  type="text"
                  className="support-input"
                  placeholder="Brief summary of your request"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={120}
                />

                <label className="support-label" htmlFor="support-category">
                  Topic
                </label>
                <select
                  id="support-category"
                  className="support-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {SUPPORT_CATEGORIES.map((opt) => (
                    <option key={opt.value || 'default'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <label className="support-label" htmlFor="support-message">
                  Message <span className="support-required">*</span>
                </label>
                <textarea
                  id="support-message"
                  className="support-textarea"
                  placeholder="Describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  required
                />

                <button
                  type="submit"
                  className="support-submit"
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? (
                    <span className="support-submit-loading">Sending...</span>
                  ) : (
                    <>
                      <Send className="support-submit-icon" aria-hidden />
                      Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <FooterAlt />
    </div>
  );
}
