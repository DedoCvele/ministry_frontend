import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login
    console.log('Login:', { email, password, rememberMe });
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F0ECE3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0px 24px 64px rgba(0,0,0,0.15)',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#0A4834',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0ECE3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div style={{
          padding: '48px 40px 32px',
          textAlign: 'center',
          borderBottom: '1px solid #F0ECE3',
        }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '40px',
            fontWeight: 600,
            color: '#0A4834',
            margin: '0 0 8px 0',
          }}>
            Welcome Back
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.6)',
            margin: 0,
          }}>
            Log in to access your closet
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#0A4834',
                display: 'block',
                marginBottom: '8px',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9F8151',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    padding: '14px 16px 14px 48px',
                    border: '1.5px solid #DCD6C9',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#9F8151';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(159, 129, 81, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#DCD6C9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#0A4834',
                display: 'block',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9F8151',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    padding: '14px 48px 14px 48px',
                    border: '1.5px solid #DCD6C9',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#9F8151';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(159, 129, 81, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#DCD6C9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9F8151',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.7)',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#9F8151',
                  }}
                />
                Remember me
              </label>

              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#9F8151',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#0A4834',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0px 4px 12px rgba(10, 72, 52, 0.2)',
                marginBottom: '24px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#083D2C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0A4834';
              }}
            >
              Log In
            </motion.button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#DCD6C9' }} />
              <span style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.5)',
              }}>
                OR
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#DCD6C9' }} />
            </div>

            {/* Social Login Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A4834',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DCD6C9',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0ECE3';
                  e.currentTarget.style.borderColor = '#9F8151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#DCD6C9';
                }}
              >
                Google
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A4834',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DCD6C9',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0ECE3';
                  e.currentTarget.style.borderColor = '#9F8151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#DCD6C9';
                }}
              >
                Facebook
              </button>
            </div>

            {/* Sign Up Link */}
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.7)',
              textAlign: 'center',
              margin: 0,
            }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#9F8151',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

