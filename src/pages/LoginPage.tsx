import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = getTranslation(language);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegisterMode) {
        // Registration flow
        if (password !== confirmPassword) {
          setError(t.auth.errors.passwordsDoNotMatch);
          setIsLoading(false);
          return;
        }

        const result = await register({
          username,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          password_confirmation: confirmPassword,
        });

        if (!result.success) {
          setError(result.message ?? t.auth.errors.unableToRegister);
          setIsLoading(false);
          return;
        }

        const destination =
          (location.state as { from?: string } | null)?.from ??
          (result.user?.role === 'admin' ? '/admin' : '/');

        navigate(destination);
      } else {
        // Login flow
        const result = await login(username, password);
        if (!result.success) {
          setError(result.message ?? t.auth.errors.unableToSignIn);
          setIsLoading(false);
          return;
        }

        const destination =
          (location.state as { from?: string } | null)?.from ??
          (result.user?.role === 'admin' ? '/admin' : '/');

        if (rememberMe && typeof window !== 'undefined') {
          window.localStorage.setItem('ministry_last_user', username);
        }

        navigate(destination);
      }
    } catch (err) {
      setError(t.auth.errors.unexpectedError);
      setIsLoading(false);
    }
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
            {isRegisterMode ? t.auth.joinMinistry : t.auth.welcomeBack}
          </h2>

          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.6)',
            margin: 0,
          }}>
            {isRegisterMode ? t.auth.createAccount : t.auth.loginSubtitle}
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            {/* Name Fields (only shown in register mode) */}
            {isRegisterMode && (
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
            )}

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
                {isRegisterMode ? t.auth.email : t.auth.usernameOrEmail}
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder={isRegisterMode ? t.auth.emailPlaceholderRegister : t.auth.emailPlaceholder}
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

            {/* Confirm Password Input (only shown in register mode) */}
            {isRegisterMode && (
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
            )}

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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isRegisterMode ? t.auth.passwordPlaceholderRegister : t.auth.passwordPlaceholder}
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

            {/* Remember Me & Forgot Password (only shown in login mode) */}
            {!isRegisterMode && (
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
                  {t.auth.rememberMe}
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
                  {t.auth.forgotPassword}
                </button>
              </div>
            )}

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

            {/* Submit Button */}
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
              {isLoading 
                ? (isRegisterMode ? t.auth.creatingAccount : t.auth.loggingIn) 
                : (isRegisterMode ? t.auth.createAccountButton : t.auth.login)}
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

            {/* Toggle between Login/Register */}
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.7)',
              textAlign: 'center',
              margin: 0,
            }}            >
              {isRegisterMode ? (
                <>
                  {t.auth.haveAccount}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setError(null);
                      setFirstName('');
                      setLastName('');
                      setConfirmPassword('');
                    }}
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
                </>
              ) : (
                <>
                  {t.auth.noAccount}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError(null);
                    }}
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
                    {t.auth.signupLink}
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

