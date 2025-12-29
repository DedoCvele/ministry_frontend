import { useState } from 'react';
import { HeaderAlt } from '../components/HeaderAlt';
import { FooterAlt } from '../components/FooterAlt';
import { useNavigate } from 'react-router-dom';
import '../components/styles/ComingSoonPage.css';

export function ComingSoonPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Here you would typically send the email to your backend
      console.log('Email submitted:', email);
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <div className="coming-soon-page">
      <HeaderAlt 
        onShopClick={() => navigate('/shop')}
        onClosetsClick={() => navigate('/closets')}
        onJournalClick={() => navigate('/blog')}
        onBecomeSellerClick={() => navigate('/become-seller')}
      />
      
      {/* Hero Section */}
      <section className="coming-soon-hero">
        {/* Animated Background Elements */}
        <div className="animated-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>

        {/* Moving Banner */}
        <div className="moving-banner-container">
          <div className="moving-banner">
            <span className="banner-text">COMING SOON</span>
            <span className="banner-text">COMING SOON</span>
            <span className="banner-text">COMING SOON</span>
            <span className="banner-text">COMING SOON</span>
            <span className="banner-text">COMING SOON</span>
            <span className="banner-text">COMING SOON</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="coming-soon-content">
          <div className="content-inner">
            <h1 className="coming-soon-title">
              <span className="title-line">Something Amazing</span>
              <span className="title-line gradient-text">is Coming</span>
            </h1>
            <p className="coming-soon-subtitle">
              We're crafting something extraordinary. Be the first to know when we launch.
            </p>
            
            {/* Email Form */}
            <form onSubmit={handleSubmit} className="email-form">
              <div className="email-input-wrapper">
                <div className="input-container">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="email-input"
                    required
                  />
                  <div className="input-glow"></div>
                </div>
                <button type="submit" className="email-submit-btn">
                  <span>Notify Me</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {isSubmitted && (
                <div className="success-message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Thank you! We'll notify you when we launch.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <FooterAlt hideNewsletter={true} hideSellerSection={true} />
    </div>
  );
}

