import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Truck, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { type Language, getTranslation } from '../translations';

interface CartItem {
  id: number;
  image: string;
  title: string;
  seller: string;
  price: number;
  condition: string;
}

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
  onCompletePayment: () => void;
  language?: Language;
}

export function CheckoutPage({ items, onBack, onCompletePayment, language = 'en' }: CheckoutPageProps) {
  const t = getTranslation(language);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [saveAddress, setSaveAddress] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = deliveryMethod === 'express' ? 300 : 150; // 150 DEN for standard, 300 DEN for express
  const total = subtotal + deliveryFee;

  return (
    <div style={{ backgroundColor: '#F0ECE3', minHeight: '100vh' }}>
      <HeaderAlt language={language} />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '80px 24px 120px' 
      }}>
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: '#0A4834',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '32px',
            padding: 0,
          }}
        >
          <ArrowLeft size={18} />
          {t.checkout.backToCart}
        </motion.button>

        {/* Page Title */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '32px',
          color: '#0A4834',
          marginBottom: '48px',
          letterSpacing: '0.02em',
        }}>
          {t.checkout.title}
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Left Column - Checkout Form */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '32px' 
            }}>
              {/* Shipping Information */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '24px',
                }}>
                  <MapPin size={24} color="#9F8151" strokeWidth={1.5} />
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    color: '#0A4834',
                  }}>
                    {t.checkout.shippingInfo}
                  </h2>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px' 
                }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Jane Doe"
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  
                  <div style={{ gridColumn: 'span 2' }}>
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Vintage Lane"
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      placeholder="Paris"
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input 
                      id="postal" 
                      placeholder="75001"
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+33 1 23 45 67 89"
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="jane@example.com"
                      style={{ marginTop: '8px' }}
                    />
                  </div>

                  <div style={{ 
                    gridColumn: 'span 2',
                    marginTop: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Checkbox 
                        id="saveAddress"
                        checked={saveAddress}
                        onCheckedChange={(checked) => setSaveAddress(!!checked)}
                      />
                      <Label 
                        htmlFor="saveAddress"
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          color: '#666',
                          cursor: 'pointer',
                        }}
                      >
                        {t.checkout.saveAddress}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '24px',
                }}>
                  <Truck size={24} color="#9F8151" strokeWidth={1.5} />
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    color: '#0A4834',
                  }}>
                    {t.checkout.deliveryMethod}
                  </h2>
                </div>

                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <motion.div
                    whileHover={{ borderColor: '#9F8151' }}
                    style={{
                      border: `2px solid ${deliveryMethod === 'standard' ? '#9F8151' : '#E0E0E0'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease-in-out',
                      backgroundColor: deliveryMethod === 'standard' ? '#FFFAF5' : '#FFFFFF',
                    }}
                    onClick={() => setDeliveryMethod('standard')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RadioGroupItem value="standard" id="standard" />
                      <Label 
                        htmlFor="standard"
                        style={{ 
                          flex: 1,
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                        }}
                      >
                        {t.checkout.standardDelivery}
                      </Label>
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        color: '#0A4834',
                        fontWeight: 600,
                      }}>
                        150 DEN
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ borderColor: '#9F8151' }}
                    style={{
                      border: `2px solid ${deliveryMethod === 'express' ? '#9F8151' : '#E0E0E0'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease-in-out',
                      backgroundColor: deliveryMethod === 'express' ? '#FFFAF5' : '#FFFFFF',
                    }}
                    onClick={() => setDeliveryMethod('express')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RadioGroupItem value="express" id="express" />
                      <Label 
                        htmlFor="express"
                        style={{ 
                          flex: 1,
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                        }}
                      >
                        {t.checkout.expressDelivery}
                      </Label>
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        color: '#0A4834',
                        fontWeight: 600,
                      }}>
                        300 DEN
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ borderColor: '#9F8151' }}
                    style={{
                      border: `2px solid ${deliveryMethod === 'pickup' ? '#9F8151' : '#E0E0E0'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease-in-out',
                      backgroundColor: deliveryMethod === 'pickup' ? '#FFFAF5' : '#FFFFFF',
                    }}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label 
                        htmlFor="pickup"
                        style={{ 
                          flex: 1,
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                        }}
                      >
                        {t.checkout.pickup}
                      </Label>
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        color: '#9F8151',
                        fontWeight: 600,
                      }}>
                        Free
                      </span>
                    </div>
                  </motion.div>
                </RadioGroup>
              </div>

              {/* Payment Method - Cash Only */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '24px',
                }}>
                  <CreditCard size={24} color="#9F8151" strokeWidth={1.5} />
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    color: '#0A4834',
                  }}>
                    {t.checkout.paymentMethod}
                  </h2>
                </div>

                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#FFFAF5',
                  borderRadius: '12px',
                  border: '2px solid #9F8151',
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                  }}>
                    💵
                  </div>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    color: '#0A4834',
                    marginBottom: '12px',
                  }}>
                    {t.checkout.cashOnDelivery}
                  </h3>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    {t.checkout.payWithCash}
                  </p>
                  <p style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    color: '#9F8151',
                    fontWeight: 500,
                  }}>
                    {t.checkout.deliveryFee}: {deliveryFee} DEN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
            }}>
              <h2 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '24px',
                color: '#0A4834',
                marginBottom: '24px',
              }}>
                {t.checkout.orderSummary}
              </h2>

              {/* Cart Items */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                marginBottom: '24px',
                paddingBottom: '24px',
                borderBottom: '1px solid #E0E0E0',
                maxHeight: '300px',
                overflowY: 'auto',
              }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#F0ECE3',
                    }}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        color: '#0A4834',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}>
                        {item.title}
                      </p>
                      <p style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        color: '#9F8151',
                      }}>
                        €{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Breakdown */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                marginBottom: '24px',
                paddingBottom: '24px',
                borderBottom: '1px solid #E0E0E0',
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#666',
                }}>
                  <span>Subtotal</span>
                  <span>€{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  color: '#666',
                }}>
                  <span>Delivery</span>
                  <span style={{ color: deliveryFee === 0 ? '#9F8151' : '#0A4834' }}>
                    {deliveryFee === 0 ? 'Free' : `${deliveryFee} DEN`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#0A4834',
                }}>
                  {t.checkout.totalAmount}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '28px',
                    color: '#0A4834',
                  }}>
                    €{subtotal.toLocaleString()}
                  </div>
                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '4px',
                  }}>
                    + {deliveryFee} DEN delivery
                  </div>
                </div>
              </div>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                color: '#999',
                marginBottom: '24px',
                marginTop: '0',
              }}>
                {t.checkout.deliveryFeeCash}
              </p>

              {/* Complete Payment Button */}
              <motion.button
                whileHover={{ backgroundColor: '#083D2C', y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCompletePayment}
                style={{
                  width: '100%',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#0A4834',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 24px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  transition: 'all 0.4s ease-in-out',
                  boxShadow: '0px 4px 12px rgba(10,72,52,0.3)',
                }}
              >
                {t.checkout.completePayment}
              </motion.button>

              {/* Security Badge */}
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                color: '#999',
                textAlign: 'center',
                marginTop: '16px',
              }}>
                🔒 Secure payment • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

      <FooterAlt />
    </div>
  );
}