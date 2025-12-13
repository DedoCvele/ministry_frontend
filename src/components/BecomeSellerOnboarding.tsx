import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import './styles/BecomeSellerOnboarding.css';

interface BecomeSellerOnboardingProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function BecomeSellerOnboarding({ onClose, onSuccess }: BecomeSellerOnboardingProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'info' | 'payment' | 'processing' | 'success'>('welcome');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    bio: '',
    socialLink: '',
    termsAccepted: false,
    ageConfirmed: false,
    paymentMethod: 'card',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    savePayment: false,
  });

  const handleContinueToInfo = () => {
    setStep('info');
    setTimeout(() => {
      document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleContinueToPayment = () => {
    if (!formData.termsAccepted || !formData.ageConfirmed) {
      alert(t.onboarding.pleaseAcceptTerms);
      return;
    }
    setStep('payment');
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePayment = () => {
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  const progressPercentage = 
    step === 'welcome' ? 0 :
    step === 'info' ? 33 :
    step === 'payment' ? 66 :
    step === 'processing' ? 90 :
    100;

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
                console.log('Back to Home clicked');
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
            <div
              className="text-[#0A4834] text-[20px] bs-cormorant"
            >
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
                  disabled={step !== 'info'}
                />
              </div>

              <div>
                <Label className="text-[#0A4834] mb-2 bs-manrope">
                  {t.onboarding.phoneNumber}
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t.onboarding.phonePlaceholder}
                  className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                  disabled={step !== 'info'}
                />
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
                      <SelectItem value="rs">Serbia</SelectItem>
                      <SelectItem value="hr">Croatia</SelectItem>
                      <SelectItem value="ba">Bosnia</SelectItem>
                      <SelectItem value="mk">Macedonia</SelectItem>
                      <SelectItem value="si">Slovenia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            </div>

            <div className="mt-6">
              <Label className="text-[#0A4834] mb-2 bs-manrope">
                {t.onboarding.socialLink}
              </Label>
              <Input
                value={formData.socialLink}
                onChange={(e) => setFormData({ ...formData, socialLink: e.target.value })}
                placeholder={t.onboarding.socialPlaceholder}
                className="bg-[#F0ECE3] border-none focus:ring-2 focus:ring-[#9F8151] rounded-xl"
                disabled={step !== 'info'}
              />
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
                    className="w-full bg-[#0A4834] text-white hover:bg-[#0A4834]/90 rounded-xl py-6 bs-manrope"
                  >
                    {t.onboarding.continueSubscription}
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
