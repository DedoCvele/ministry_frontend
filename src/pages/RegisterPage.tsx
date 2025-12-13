import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = getTranslation(language);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.errors.passwordsDoNotMatch);
      return;
    }
    if (!acceptedTerms) {
      setError(t.auth.errors.acceptTerms);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password_confirmation: formData.confirmPassword,
      });

      if (!result.success) {
        setError(result.message ?? t.auth.errors.unableToSignUp);
        setIsLoading(false);
        return;
      }

      navigate(result.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(t.auth.errors.unexpectedError);
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          maxWidth: '540px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'transparent',
            border: '1.5px solid #9F8151',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#9F8151',
            padding: '6px 12px',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#9F8151';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#9F8151';
          }}
        >
          {language === 'en' ? 'MKD' : 'ENG'}
        </button>

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
            {t.auth.joinMinistry}
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.6)',
            margin: 0,
          }}>
            {t.auth.createAccount}
          </p>
        </div>

        {/* Scrollable Form Content */}
        <div style={{
          overflowY: 'auto',
          flex: 1,
        }}>
          <div style={{ padding: '40px' }}>
            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
              }}>
                <div>
                  <label style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0A4834',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    {t.auth.firstName}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9F8151',
                      }}
                    />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                      placeholder={t.auth.firstNamePlaceholder}
                      style={{
                        width: '100%',
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        padding: '12px 14px 12px 42px',
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

                <div>
                  <label style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0A4834',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    {t.auth.lastName}
                  </label>
                  <input
                    type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      placeholder={t.auth.lastNamePlaceholder}
                    style={{
                      width: '100%',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      padding: '12px 14px',
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

              {/* Username Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  {t.auth.usernameOrEmail}
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
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    required
                    placeholder={t.auth.emailPlaceholderRegister}
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

              {error && (
                <div
                  style={{
                    marginBottom: '24px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(193, 64, 64, 0.1)',
                    border: '1px solid rgba(193, 64, 64, 0.35)',
                    color: '#A32020',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  {t.auth.password}
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
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    placeholder={t.auth.passwordPlaceholderRegister}
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

              {/* Confirm Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  {t.auth.confirmPassword}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    placeholder={t.auth.confirmPasswordPlaceholder}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.7)',
                  lineHeight: '1.6',
                }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#9F8151',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    {t.auth.termsAndConditions}{' '}
                    <a href="#" style={{ color: '#9F8151', textDecoration: 'underline' }}>
                      {t.auth.termsOfService}
                    </a>{' '}
                    {t.auth.and}{' '}
                    <a href="#" style={{ color: '#9F8151', textDecoration: 'underline' }}>
                      {t.auth.privacyPolicy}
                    </a>
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: isLoading ? '#6B8E7A' : '#0A4834',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0px 4px 12px rgba(10, 72, 52, 0.2)',
                  marginBottom: '24px',
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#083D2C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0A4834';
                  }
                }}
              >
                {isLoading ? t.auth.creatingAccount : t.auth.createAccountButton}
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
                  {t.auth.or}
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#DCD6C9' }} />
              </div>

              {/* Social Sign Up Buttons */}
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
                  {t.auth.google}
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
                  {t.auth.facebook}
                </button>
              </div>

              {/* Login Link */}
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.7)',
                textAlign: 'center',
                margin: 0,
              }}>
                {t.auth.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
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
                  {t.auth.loginLink}
                </button>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

