import { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('fast');
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Get product from route state if available
  const productFromState = (location.state as any)?.product;
  const displayItems = productFromState ? [productFromState] : items;
  
  const subtotal = displayItems.reduce((sum, item) => sum + item.price, 0);
  // Delivery fees: fast = 300, normal = 150, slow = 100
  const deliveryFee = deliveryMethod === 'fast' ? 300 : deliveryMethod === 'normal' ? 150 : 100;
  const total = subtotal + deliveryFee;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

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
          onClick={handleBack}
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
          {productFromState ? 'Back to Product' : t.checkout.backToCart}
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
                  {/* Fast Delivery */}
                  <motion.div
                    whileHover={{ borderColor: '#9F8151' }}
                    style={{
                      border: `2px solid ${deliveryMethod === 'fast' ? '#9F8151' : '#E0E0E0'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease-in-out',
                      backgroundColor: deliveryMethod === 'fast' ? '#FFFAF5' : '#FFFFFF',
                    }}
                    onClick={() => setDeliveryMethod('fast')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RadioGroupItem value="fast" id="fast" />
                      <Label 
                        htmlFor="fast"
                        style={{ 
                          flex: 1,
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                        }}
                      >
                        Fast Delivery
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

                  {/* Normal Delivery */}
                  <motion.div
                    whileHover={{ borderColor: '#9F8151' }}
                    style={{
                      border: `2px solid ${deliveryMethod === 'normal' ? '#9F8151' : '#E0E0E0'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease-in-out',
                      backgroundColor: deliveryMethod === 'normal' ? '#FFFAF5' : '#FFFFFF',
                    }}
                    onClick={() => setDeliveryMethod('normal')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RadioGroupItem value="normal" id="normal" />
                      <Label 
                        htmlFor="normal"
                        style={{ 
                          flex: 1,
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                        }}
                      >
                        Normal Delivery
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

                  {/* Slow Delivery */}
                  <motion.div
                    whileHover={{ borderColor: '#9F8151' }}
                    style={{
                      border: `2px solid ${deliveryMethod === 'slow' ? '#9F8151' : '#E0E0E0'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease-in-out',
                      backgroundColor: deliveryMethod === 'slow' ? '#FFFAF5' : '#FFFFFF',
                    }}
                    onClick={() => setDeliveryMethod('slow')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RadioGroupItem value="slow" id="slow" />
                      <Label 
                        htmlFor="slow"
                        style={{ 
                          flex: 1,
                          cursor: 'pointer',
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#0A4834',
                        }}
                      >
                        Slow Delivery
                      </Label>
                      <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        color: '#0A4834',
                        fontWeight: 600,
                      }}>
                        100 DEN
                      </span>
                    </div>
                  </motion.div>
                </RadioGroup>
              </div>

              {/* Payment Method - Tabs */}
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

                <div style={{ width: '100%' }}>
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#F0ECE3',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '24px',
                    gap: '4px',
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('cash')}
                      style={{
                        flex: 1,
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: paymentMethod === 'cash' ? '#0A4834' : '#666',
                        backgroundColor: paymentMethod === 'cash' ? '#FFFFFF' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: paymentMethod === 'cash' ? '0px 2px 8px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      Cash
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('credit')}
                      style={{
                        flex: 1,
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: paymentMethod === 'credit' ? '#0A4834' : '#666',
                        backgroundColor: paymentMethod === 'credit' ? '#FFFFFF' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: paymentMethod === 'credit' ? '0px 2px 8px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      Credit Card
                    </motion.button>
                  </div>

                  {paymentMethod === 'cash' && (
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
                  )}

                  {paymentMethod === 'credit' && (
                    <div style={{
                      padding: '24px',
                      backgroundColor: '#FFFAF5',
                      borderRadius: '12px',
                      border: '2px solid #9F8151',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <Label htmlFor="cardNumber" style={{ 
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#0A4834',
                            marginBottom: '8px',
                            display: 'block',
                          }}>
                            Card Number
                          </Label>
                          <Input 
                            id="cardNumber" 
                            placeholder="1234 5678 9012 3456"
                            value={cardData.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardData({ ...cardData, cardNumber: value });
                            }}
                            maxLength={19}
                            style={{ marginTop: '4px' }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cardName" style={{ 
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#0A4834',
                            marginBottom: '8px',
                            display: 'block',
                          }}>
                            Cardholder Name
                          </Label>
                          <Input 
                            id="cardName" 
                            placeholder="John Doe"
                            value={cardData.cardName}
                            onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                            style={{ marginTop: '4px' }}
                          />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <Label htmlFor="expiryDate" style={{ 
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#0A4834',
                              marginBottom: '8px',
                              display: 'block',
                            }}>
                              Expiry Date
                            </Label>
                            <Input 
                              id="expiryDate" 
                              placeholder="MM/YY"
                              value={cardData.expiryDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                }
                                setCardData({ ...cardData, expiryDate: value });
                              }}
                              maxLength={5}
                              style={{ marginTop: '4px' }}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cvv" style={{ 
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#0A4834',
                              marginBottom: '8px',
                              display: 'block',
                            }}>
                              CVV
                            </Label>
                            <Input 
                              id="cvv" 
                              placeholder="123"
                              type="password"
                              value={cardData.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').substring(0, 3);
                                setCardData({ ...cardData, cvv: value });
                              }}
                              maxLength={3}
                              style={{ marginTop: '4px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                {displayItems.map((item) => (
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

              {/* Product Image and Title Below Order Summary */}
              {productFromState && (
                <div style={{
                  marginBottom: '24px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid #E0E0E0',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#F0ECE3',
                    }}>
                      <ImageWithFallback
                        src={productFromState.image}
                        alt={productFromState.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '20px',
                      color: '#0A4834',
                      fontWeight: 600,
                      margin: 0,
                    }}>
                      {productFromState.title}
                    </h3>
                  </div>
                </div>
              )}

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

              {/* Finish Payment Button */}
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
                Finish Payment
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