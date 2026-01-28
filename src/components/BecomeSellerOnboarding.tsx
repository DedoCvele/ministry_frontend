import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, Plus, X, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './styles/BecomeSellerOnboarding.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_ROOT = `${API_BASE_URL}/api`;

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const getXsrfHeader = () => {
  const token = getCookieValue('XSRF-TOKEN');
  return token ? { 'X-XSRF-TOKEN': token } : {};
};

// Country calling codes and phone format info
// Balkan phone formats supported by backend regex:
// /^(\+?\d{1,4})?[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{2,3}[-.\s]?\d{3,4}$/
interface CountryPhoneInfo {
  code: string;       // Country code (e.g., 'rs')
  name: string;       // Country name
  prefix: string;     // Phone prefix (e.g., '+381')
  placeholder: string; // Example local number format
  digitCount: number; // Expected number of digits in local part
  format: number[];   // Digit grouping pattern (e.g., [2, 3, 4] for XX XXX XXXX)
}

const countryPhoneInfo: Record<string, CountryPhoneInfo> = {
  rs: { code: 'rs', name: 'Serbia', prefix: '+381', placeholder: '64 123 4567', digitCount: 9, format: [2, 3, 4] },
  hr: { code: 'hr', name: 'Croatia', prefix: '+385', placeholder: '91 123 4567', digitCount: 9, format: [2, 3, 4] },
  ba: { code: 'ba', name: 'Bosnia', prefix: '+387', placeholder: '61 123 456', digitCount: 8, format: [2, 3, 3] },
  mk: { code: 'mk', name: 'North Macedonia', prefix: '+389', placeholder: '70 123 456', digitCount: 8, format: [2, 3, 3] },
  si: { code: 'si', name: 'Slovenia', prefix: '+386', placeholder: '40 123 456', digitCount: 8, format: [2, 3, 3] },
};

// Phone number validation regex (matches updated backend)
// Supports: +country (2-3 digits) (2-3 digits) (3-4 digits)
const phoneValidationRegex = /^(\+?\d{1,4})?[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{2,3}[-.\s]?\d{3,4}$/;

// Validate phone number format
const isValidPhoneFormat = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return true; // Empty is valid (nullable)
  return phoneValidationRegex.test(phone.trim());
};

// Format local phone number as user types based on country format
const formatLocalPhone = (value: string, countryCode?: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  if (!countryCode || !countryPhoneInfo[countryCode]) {
    // Default format: just add spaces every 3 digits
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }
  
  const { format, digitCount } = countryPhoneInfo[countryCode];
  const limitedDigits = digits.slice(0, digitCount);
  
  // Apply country-specific format
  let result = '';
  let position = 0;
  
  for (let i = 0; i < format.length && position < limitedDigits.length; i++) {
    const groupSize = format[i];
    const group = limitedDigits.slice(position, position + groupSize);
    result += (result ? ' ' : '') + group;
    position += groupSize;
  }
  
  return result;
};

// Social platform enum values (matching backend SocialLinkPlatform enum)
// 1 = Instagram, 2 = Facebook, 3 = TikTok, 4 = X (Twitter)
const SocialLinkPlatform = {
  INSTAGRAM: 1,
  FACEBOOK: 2,
  TIKTOK: 3,
  X: 4,
} as const;

type SocialPlatformValue = typeof SocialLinkPlatform[keyof typeof SocialLinkPlatform];

interface SocialLink {
  id?: number; // From backend, undefined for new links
visibleId: string; // Local ID for UI management
  platform: SocialPlatformValue;
  url: string;
}

// Map platform enum to display info
const platformInfo: Record<SocialPlatformValue, { name: string; color: string; placeholder: string }> = {
  [SocialLinkPlatform.INSTAGRAM]: {
    name: 'Instagram',
    color: '#E4405F',
    placeholder: 'https://instagram.com/username',
  },
  [SocialLinkPlatform.FACEBOOK]: {
    name: 'Facebook',
    color: '#1877F2',
    placeholder: 'https://facebook.com/username',
  },
  [SocialLinkPlatform.TIKTOK]: {
    name: 'TikTok',
    color: '#000000',
    placeholder: 'https://tiktok.com/@username',
  },
  [SocialLinkPlatform.X]: {
    name: 'X (Twitter)',
    color: '#000000',
    placeholder: 'https://x.com/username',
  },
};

// TikTok Icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ width: '1em', height: '1em' }}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Facebook Icon component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ width: '1em', height: '1em' }}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// X (Twitter) Icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ width: '1em', height: '1em' }}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const getPlatformIcon = (platform: SocialPlatformValue) => {
  switch (platform) {
    case SocialLinkPlatform.TIKTOK:
      return <TikTokIcon className="w-4 h-4" />;
    case SocialLinkPlatform.INSTAGRAM:
      return <Instagram className="w-4 h-4" />;
    case SocialLinkPlatform.FACEBOOK:
      return <FacebookIcon className="w-4 h-4" />;
    case SocialLinkPlatform.X:
      return <XIcon className="w-4 h-4" />;
  }
};

interface BecomeSellerOnboardingProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function BecomeSellerOnboarding({ onClose, onSuccess }: BecomeSellerOnboardingProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<'welcome' | 'info' | 'payment' | 'processing' | 'success'>('welcome');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneLocal: '', // Local part of phone number (without country prefix)
    city: '',
    country: '',
    bio: '',
    termsAccepted: false,
    ageConfirmed: false,
    paymentMethod: 'card',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    savePayment: false,
  });

  // Get the full phone number with country prefix
  const getFullPhoneNumber = () => {
    if (!formData.country || !formData.phoneLocal) return '';
    const countryInfo = countryPhoneInfo[formData.country];
    if (!countryInfo) return formData.phoneLocal;
    return `${countryInfo.prefix} ${formData.phoneLocal}`;
  };

  // Parse an existing phone number to extract local part
  const parsePhoneNumber = (fullPhone: string, countryCode: string): string => {
    if (!fullPhone) return '';
    const countryInfo = countryPhoneInfo[countryCode];
    if (!countryInfo) return fullPhone;
    
    // Remove the country prefix if present
    const prefix = countryInfo.prefix;
    let localPart = fullPhone.trim();
    
    if (localPart.startsWith(prefix)) {
      localPart = localPart.slice(prefix.length).trim();
    } else if (localPart.startsWith(prefix.replace('+', ''))) {
      localPart = localPart.slice(prefix.length - 1).trim();
    }
    
    return localPart;
  };

  // Social links state - using backend enum values
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformValue | ''>('');

  // Load user data and existing social links on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Get CSRF cookie
        try {
          await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        } catch (csrfError) {
          console.warn('Could not refresh CSRF cookie:', csrfError);
        }

        const xsrfHeader = getXsrfHeader();
        
        // Fetch user data
        const response = await axios.get(`${API_ROOT}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            ...xsrfHeader,
          },
          withCredentials: true,
        });

        const userData = response.data?.data || response.data?.user || response.data;
        
        if (userData) {
          // Try to detect country from existing phone number
          let detectedCountry = '';
          let localPhone = userData.phone || '';
          
          if (userData.phone) {
            // Try to match country prefix from phone number
            for (const [code, info] of Object.entries(countryPhoneInfo)) {
              if (userData.phone.startsWith(info.prefix)) {
                detectedCountry = code;
                localPhone = userData.phone.slice(info.prefix.length).trim();
                break;
              }
            }
          }
          
          // Pre-fill form with existing user data
          setFormData(prev => ({
            ...prev,
            fullName: userData.name || '',
            email: userData.email || '',
            phoneLocal: localPhone,
            city: userData.city || '',
            country: detectedCountry,
            bio: userData.bio || '',
          }));
        }

        // Try to fetch existing social links
        try {
          const socialResponse = await axios.get(`${API_ROOT}/me/social-links`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              ...xsrfHeader,
            },
            withCredentials: true,
          });

          const existingLinks = socialResponse.data?.data || socialResponse.data || [];
          if (Array.isArray(existingLinks)) {
            setSocialLinks(existingLinks.map((link: any) => ({
              id: link.id,
              visibleId: `existing-${link.id}`,
              platform: link.platform,
              url: link.url,
            })));
          }
        } catch (socialError: any) {
          // Routes might not be ready yet - this is expected
          console.log('Social links API not available yet:', socialError.response?.status);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Don't show error - just use empty form
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleContinueToInfo = () => {
    setStep('info');
    setTimeout(() => {
      document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleContinueToPayment = async () => {
    if (!formData.termsAccepted || !formData.ageConfirmed) {
      alert(t.onboarding.pleaseAcceptTerms);
      return;
    }

    // Validate bio has at least 4 characters if provided
    if (formData.bio && formData.bio.length > 0 && formData.bio.length < 4) {
      setError('Bio must be at least 4 characters long.');
      return;
    }

    // Validate phone number format if provided
    const fullPhone = getFullPhoneNumber();
    if (fullPhone && !isValidPhoneFormat(fullPhone)) {
      setError(`Invalid phone number format. Example: ${formData.country ? countryPhoneInfo[formData.country]?.prefix + ' ' + countryPhoneInfo[formData.country]?.placeholder : '+381 64 123 4567'}`);
      return;
    }

    // Save user data before proceeding to payment
    setSaving(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setSaving(false);
        return;
      }

      // Get CSRF cookie
      try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      } catch (csrfError) {
        console.warn('Could not refresh CSRF cookie:', csrfError);
      }

      const xsrfHeader = getXsrfHeader();

      // Prepare payload for PATCH /api/me
      // According to updated API docs:
      // - name (string, optional, min 3, max 255)
      // - phone (string, optional, nullable; must match phone validation regex)
      // - city (string, optional, nullable, min 3)
      // - bio (string, optional, nullable, min 4, max 5000)
      // - role (optional; 3 = Seller)
      // Note: fullPhone already validated above
      const payload: Record<string, unknown> = {
        name: formData.fullName,
        phone: fullPhone || null,
        city: formData.city || null,
        bio: formData.bio || null,
        role: 3, // Seller role
      };

      console.log('📤 PATCH /api/me - Updating seller profile:', payload);

      const response = await axios.patch(`${API_ROOT}/me`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...xsrfHeader,
        },
        withCredentials: true,
      });

      console.log('📥 PATCH /api/me - Response:', response.data);

      // Now save social links via the dedicated API
      // Filter out links with empty URLs
      const linksToSave = socialLinks.filter(link => link.url.trim());
      
      for (const link of linksToSave) {
        try {
          if (link.id) {
            // Update existing link
            console.log(`📤 PUT /api/me/social-links/${link.id}`, { platform: link.platform, url: link.url });
            await axios.put(`${API_ROOT}/me/social-links/${link.id}`, {
              platform: link.platform,
              url: link.url,
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...xsrfHeader,
              },
              withCredentials: true,
            });
          } else {
            // Create new link
            console.log('📤 POST /api/me/social-links', { platform: link.platform, url: link.url });
            await axios.post(`${API_ROOT}/me/social-links`, {
              platform: link.platform,
              url: link.url,
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...xsrfHeader,
              },
              withCredentials: true,
            });
          }
        } catch (socialError: any) {
          // Routes might not be ready yet - log but don't fail
          console.warn('Social link save failed (API may not be ready):', socialError.response?.status, socialError.response?.data);
        }
      }

      // Successfully saved - proceed to payment
      setStep('payment');
      setTimeout(() => {
        document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = () => {
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  // Add a new social link
  const handleAddSocialLink = () => {
    if (!selectedPlatform) return;

    // Check if platform already exists
    if (socialLinks.some(link => link.platform === selectedPlatform)) {
      alert(`You already have a ${platformInfo[selectedPlatform].name} link. Please edit the existing one.`);
      return;
    }

    const newLink: SocialLink = {
      visibleId: `new-${selectedPlatform}-${Date.now()}`,
      platform: selectedPlatform,
      url: '',
    };

    setSocialLinks([...socialLinks, newLink]);
    setSelectedPlatform('');
    setShowAddSocial(false);
  };

  // Update social link URL
  const handleUpdateSocialLink = (visibleId: string, url: string) => {
    setSocialLinks(links =>
      links.map(link =>
        link.visibleId === visibleId ? { ...link, url } : link
      )
    );
  };

  // Remove social link
  const handleRemoveSocialLink = async (visibleId: string) => {
    const linkToRemove = socialLinks.find(link => link.visibleId === visibleId);
    
    // If it has a backend ID, try to delete it from the API
    if (linkToRemove?.id) {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (token) {
        try {
          const xsrfHeader = getXsrfHeader();
          await axios.delete(`${API_ROOT}/me/social-links/${linkToRemove.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              ...xsrfHeader,
            },
            withCredentials: true,
          });
          console.log(`📤 DELETE /api/me/social-links/${linkToRemove.id} - Success`);
        } catch (deleteError: any) {
          console.warn('Could not delete social link from API:', deleteError.response?.status);
        }
      }
    }
    
    setSocialLinks(links => links.filter(link => link.visibleId !== visibleId));
  };

  // Get available platforms (not yet added)
  const getAvailablePlatforms = (): SocialPlatformValue[] => {
    const usedPlatforms = socialLinks.map(link => link.platform);
    const allPlatforms: SocialPlatformValue[] = [
      SocialLinkPlatform.INSTAGRAM,
      SocialLinkPlatform.FACEBOOK,
      SocialLinkPlatform.TIKTOK,
      SocialLinkPlatform.X,
    ];
    return allPlatforms.filter(p => !usedPlatforms.includes(p));
  };

  const progressPercentage = 
    step === 'welcome' ? 0 :
    step === 'info' ? 33 :
    step === 'payment' ? 66 :
    step === 'processing' ? 90 :
    100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0ECE3] flex items-center justify-center">
        <div className="text-[#9F8151] text-lg bs-manrope">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0ECE3]">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#9F8151] transition-all duration-500 z-50"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* Header */}
      <div className="bg-white border-b border-[#9F8151]/20" style={{ position: 'relative', zIndex: 40 }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/');
              }}
              className="flex items-center gap-2 text-[#9F8151] hover:text-[#0A4834] transition-colors bs-manrope"
              style={{ 
                cursor: 'pointer', 
                background: 'none', 
                border: 'none', 
                padding: '8px 0',
                position: 'relative',
                zIndex: 41
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.onboarding.backToHome}</span>
            </button>
            <div className="text-[#0A4834] text-[20px] bs-cormorant">
              {t.onboarding.sellerOnboarding}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {step === 'welcome' && (
          <div className="bg-white rounded-[24px] p-12 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border-2 border-[#9F8151]/30">
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-[#9F8151] mx-auto mb-4" />
              <h1 className="text-[#0A4834] text-[36px] mb-4 bs-cormorant">
                {t.onboarding.becomeMinistrySeller}
              </h1>
              <p className="text-[#9F8151] text-[16px] max-w-lg mx-auto bs-manrope">
                {t.onboarding.joinCircle}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-4 mb-10 max-w-md mx-auto">
              {[
                t.onboarding.uploadItems,
                t.onboarding.connectBuyers,
                t.onboarding.earnRelist,
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#9F8151]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#9F8151]" />
                  </div>
                  <p className="text-[#0A4834] text-[15px] bs-manrope">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleContinueToInfo}
                className="bg-[#9F8151] text-white hover:bg-[#9F8151]/90 rounded-xl px-10 py-6 bs-manrope"
              >
                {t.onboarding.startApplication}
              </Button>
            </div>
          </div>
        )}

        {(step === 'info' || step === 'payment' || step === 'processing' || step === 'success') && (
          <div id="info-section" className="bg-white rounded-[24px] p-10 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border-2 border-[#9F8151]/30 mb-8">
            <h2 className="text-[#0A4834] text-[28px] mb-6 bs-cormorant">
              {t.onboarding.personalInformation}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm bs-manrope">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-[#0A4834] mb-2 bs-manrope">
                  {t.onboarding.fullName}
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t.onboarding.fullNamePlaceholder}
                  className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                  disabled={step !== 'info'}
                />
              </div>

              <div>
                <Label className="text-[#0A4834] mb-2 bs-manrope">
                  {t.onboarding.emailAddress}
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.onboarding.emailPlaceholder}
                  className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                  disabled={true} // Email cannot be changed
                />
                <p className="text-xs text-[#9F8151] mt-1 bs-manrope">Email cannot be changed</p>
              </div>

              <div>
                <Label className="text-[#0A4834] mb-2 bs-manrope">
                  {t.onboarding.location}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t.onboarding.cityPlaceholder}
                    className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                    disabled={step !== 'info'}
                  />
                  <Select
                    value={formData.country}
                    onValueChange={(value: string) => setFormData({ ...formData, country: value })}
                    disabled={step !== 'info'}
                  >
                    <SelectTrigger className="bg-[#F0ECE3] border-none rounded-xl w-32">
                      <SelectValue placeholder={t.onboarding.country} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(countryPhoneInfo).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[#0A4834] mb-2 bs-manrope">
                  {t.onboarding.phoneNumber}
                </Label>
                <div className="flex">
                  {/* Country prefix - non-editable */}
                  <div 
                    className={`flex items-center justify-center px-4 rounded-l-xl border-r border-[#DCD6C9] ${
                      formData.country 
                        ? 'bg-[#0A4834] text-white' 
                        : 'bg-[#DCD6C9] text-[#9F8151]'
                    }`}
                    style={{ minWidth: '80px' }}
                  >
                    <span className="text-sm font-medium bs-manrope">
                      {formData.country 
                        ? countryPhoneInfo[formData.country]?.prefix 
                        : '+XXX'}
                    </span>
                  </div>
                  {/* Local phone number input */}
                  <Input
                    type="tel"
                    value={formData.phoneLocal}
                    onChange={(e) => {
                      // Format based on country's phone format
                      const formatted = formatLocalPhone(e.target.value, formData.country);
                      setFormData({ ...formData, phoneLocal: formatted });
                    }}
                    placeholder={
                      formData.country 
                        ? countryPhoneInfo[formData.country]?.placeholder 
                        : 'Select country first'
                    }
                    className={`bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-l-none rounded-r-xl flex-1 ${
                      formData.phoneLocal && !isValidPhoneFormat(getFullPhoneNumber()) 
                        ? 'ring-2 ring-red-400' 
                        : ''
                    }`}
                    disabled={step !== 'info' || !formData.country}
                    maxLength={formData.country ? countryPhoneInfo[formData.country]?.digitCount + 2 : 15}
                  />
                </div>
                {!formData.country && step === 'info' && (
                  <p className="text-xs text-[#9F8151] mt-1 bs-manrope">
                    Please select a country first to enter your phone number
                  </p>
                )}
                {formData.country && formData.phoneLocal && step === 'info' && (
                  <p className={`text-xs mt-1 bs-manrope ${
                    isValidPhoneFormat(getFullPhoneNumber()) ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {isValidPhoneFormat(getFullPhoneNumber()) 
                      ? `✓ ${getFullPhoneNumber()}` 
                      : `✗ Invalid format (e.g., ${countryPhoneInfo[formData.country]?.placeholder})`
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-[#0A4834] mb-2 bs-manrope">
                {t.onboarding.shortBio}
              </Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t.onboarding.bioPlaceholder}
                className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl min-h-[100px]"
                disabled={step !== 'info'}
              />
              <p className="text-xs text-[#9F8151] mt-1 bs-manrope">
                {formData.bio.length > 0 ? `${formData.bio.length} characters (minimum 4)` : 'Minimum 4 characters'}
              </p>
            </div>

            {/* Social Links Section */}
            <div className="mt-6">
              <Label className="text-[#0A4834] mb-3 bs-manrope flex items-center gap-2">
                Social Links
                <span className="text-[#9F8151] text-sm font-normal">(Optional)</span>
              </Label>

              {/* Existing social links */}
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <div 
                    key={link.visibleId} 
                    className="flex items-center gap-3 p-3 bg-[#F0ECE3] rounded-xl"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: platformInfo[link.platform].color }}
                    >
                      {getPlatformIcon(link.platform)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0A4834] text-sm font-medium bs-manrope">
                        {platformInfo[link.platform].name}
                      </p>
                      <Input
                        value={link.url}
                        onChange={(e) => handleUpdateSocialLink(link.visibleId, e.target.value)}
                        placeholder={platformInfo[link.platform].placeholder}
                        className="mt-1 bg-white border-none focus:ring-2 focus:ring-[#9F8151] rounded-lg text-sm"
                        disabled={step !== 'info'}
                      />
                    </div>
                    {step === 'info' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(link.visibleId)}
                        className="p-2 text-[#9F8151] hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add social link button/selector */}
              {step === 'info' && getAvailablePlatforms().length > 0 && (
                <div className="mt-4">
                  {!showAddSocial ? (
                    <button
                      type="button"
                      onClick={() => setShowAddSocial(true)}
                      className="flex items-center gap-2 text-[#9F8151] hover:text-[#0A4834] transition-colors bs-manrope text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Social Link
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-[#F0ECE3]/50 rounded-xl border-2 border-dashed border-[#9F8151]/30">
                      <Select
                        value={selectedPlatform ? String(selectedPlatform) : ''}
                        onValueChange={(value: string) => setSelectedPlatform(Number(value) as SocialPlatformValue)}
                      >
                        <SelectTrigger className="bg-white border-none rounded-xl w-44">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePlatforms().map((platform) => (
                            <SelectItem key={platform} value={String(platform)}>
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(platform)}
                                <span>{platformInfo[platform].name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddSocialLink}
                        disabled={!selectedPlatform}
                        className="bg-[#9F8151] text-white hover:bg-[#9F8151]/90 rounded-xl px-4 py-2 text-sm"
                      >
                        Add
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSocial(false);
                          setSelectedPlatform('');
                        }}
                        className="p-2 text-[#9F8151] hover:text-[#0A4834] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {socialLinks.length === 0 && step !== 'info' && (
                <p className="text-[#9F8151] text-sm bs-manrope mt-2">No social links added</p>
              )}
            </div>

            {step === 'info' && (
              <>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked: boolean | 'indeterminate' | undefined) => 
                        setFormData({ ...formData, termsAccepted: checked as boolean })
                      }
                      className="mt-1"
                    />
                    <label className="text-[#0A4834] text-[14px] bs-manrope">
                      {t.onboarding.agreeTerms}
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.ageConfirmed}
                      onCheckedChange={(checked: boolean | 'indeterminate' | undefined) => 
                        setFormData({ ...formData, ageConfirmed: checked as boolean })
                      }
                      className="mt-1"
                    />
                    <label className="text-[#0A4834] text-[14px] bs-manrope">
                      {t.onboarding.confirmAge}
                    </label>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={saving}
                    className="w-full bg-[#0A4834] text-white hover:bg-[#0A4834]/90 rounded-xl py-6 bs-manrope disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : t.onboarding.continueSubscription}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {(step === 'payment' || step === 'processing' || step === 'success') && (
          <div id="payment-section" className="bg-white rounded-[24px] p-10 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border-2 border-[#9F8151]/30">
            <h2 className="text-[#0A4834] text-[28px] mb-4 bs-cormorant">
              {t.onboarding.activateSellerProfile}
            </h2>
            
            <p className="text-[#0A4834] text-[15px] mb-8 leading-relaxed bs-manrope">
              {t.onboarding.subscriptionFee.replace('{amount}', '2.00')}
            </p>

            {step === 'payment' && (
              <>
                <div className="mb-6">
                  <Label className="text-[#0A4834] mb-3 bs-manrope">
                    {t.onboarding.paymentMethod}
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'card'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className="w-4 h-4 text-[#9F8151]"
                      />
                      <label className="text-[#0A4834] bs-manrope">
                        {t.onboarding.creditDebitCard}
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                        className="w-4 h-4 text-[#9F8151]"
                      />
                      <label className="text-[#0A4834] bs-manrope">
                        {t.onboarding.paypal}
                      </label>
                    </div>
                  </div>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label className="text-[#0A4834] mb-2 bs-manrope">
                        {t.onboarding.cardholderName}
                      </Label>
                      <Input
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        placeholder={t.onboarding.fullNamePlaceholder}
                        className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                      />
                    </div>

                    <div>
                      <Label className="text-[#0A4834] mb-2 bs-manrope">
                        {t.onboarding.cardNumber}
                      </Label>
                      <Input
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        placeholder={t.onboarding.cardNumberPlaceholder}
                        className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#0A4834] mb-2 bs-manrope">
                          {t.onboarding.expiryDate}
                        </Label>
                        <Input
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                          placeholder={t.onboarding.expiryPlaceholder}
                          className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-[#0A4834] mb-2 bs-manrope">
                          {t.onboarding.cvv}
                        </Label>
                        <Input
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                          placeholder={t.onboarding.cvvPlaceholder}
                          type="password"
                          className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                      <Checkbox
                        checked={formData.savePayment}
                        onCheckedChange={(checked: boolean | 'indeterminate' | undefined) => 
                          setFormData({ ...formData, savePayment: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <label className="text-[#0A4834] text-[14px] bs-manrope">
                        {t.onboarding.savePaymentInfo}
                      </label>
                    </div>
                  </div>
                )}

                <div className="bg-[#F0ECE3] rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#0A4834] bs-manrope">{t.onboarding.subscriptionFeeLabel}</span>
                    <span className="text-[#9F8151] text-[20px] bs-cormorant">€2.00 EUR</span>
                  </div>
                  <p className="text-[#9F8151] text-[13px] bs-manrope">{t.onboarding.renewsManually}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePayment}
                    className="flex-1 bg-[#9F8151] text-white hover:bg-[#9F8151]/90 rounded-xl py-6 bs-manrope"
                  >
                    {t.onboarding.paySubscribe}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-2 border-[#9F8151] text-[#9F8151] hover:bg-[#9F8151]/5 rounded-xl px-8 bs-manrope"
                  >
                    {t.onboarding.cancel}
                  </Button>
                </div>
              </>
            )}

            {step === 'processing' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 border-4 border-[#9F8151]/30 border-t-[#9F8151] rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-[#9F8151] text-[16px] bs-manrope">
                  {t.onboarding.processing}
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#9F8151]/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-[#9F8151]" />
                </div>
                <h3 className="text-[#0A4834] text-[28px] mb-4 bs-cormorant">
                  {t.onboarding.welcomeSellerCircle}
                </h3>
                <p className="text-[#9F8151] text-[15px] mb-8 max-w-md mx-auto bs-manrope">
                  {t.onboarding.subscriptionConfirmed}
                </p>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      if (onSuccess) {
                        onSuccess();
                      } else {
                        navigate('/profile');
                      }
                    }}
                    className="bg-[#0A4834] text-white hover:bg-[#0A4834]/90 rounded-xl px-8 py-6 bs-manrope"
                  >
                    {t.onboarding.goToMyCloset}
                  </Button>
                  <Button
                    onClick={() => {
                      if (onClose) {
                        onClose();
                      } else {
                        navigate('/');
                      }
                    }}
                    variant="outline"
                    className="border-2 border-[#9F8151] text-[#9F8151] hover:bg-[#9F8151]/5 rounded-xl px-8 bs-manrope"
                  >
                    {t.onboarding.returnHome}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
