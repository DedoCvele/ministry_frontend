import { DollarSign, Users, Upload, Shield } from "lucide-react";
import { type Language, getTranslation } from '../translations';

interface BecomeSellerSectionProps {
  language?: Language;
}

export function BecomeSellerSection({ language = 'en' }: BecomeSellerSectionProps = {}) {
  const t = getTranslation(language);
  
  const benefits = [
    {
      icon: DollarSign,
      title: t.becomeSeller.benefit1Title,
      description: t.becomeSeller.benefit1Desc,
    },
    {
      icon: Users,
      title: t.becomeSeller.benefit2Title,
      description: t.becomeSeller.benefit2Desc,
    },
    {
      icon: Upload,
      title: t.becomeSeller.benefit3Title,
      description: t.becomeSeller.benefit3Desc,
    },
    {
      icon: Shield,
      title: t.becomeSeller.benefit4Title,
      description: t.becomeSeller.benefit4Desc,
    },
  ];

  return (
    <section 
      id="seller"
      className="py-32 px-8"
      style={{ backgroundColor: '#F0ECE3' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p 
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#9F8151',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            {t.becomeSeller.joinUs}
          </p>

          <h2 
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '56px',
              fontWeight: 600,
              lineHeight: '64px',
              color: '#0A4834',
              marginBottom: '48px',
              letterSpacing: '-1px',
            }}
          >
            {t.becomeSeller.title}
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="benefit-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(10, 72, 52, 0.12)',
                  borderRadius: '12px',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Icon Circle */}
                <div
                  className="icon-circle"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(10, 72, 52, 0.06)',
                    border: '1px solid rgba(10, 72, 52, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon size={32} strokeWidth={1.5} color="#0A4834" />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#0A4834',
                    marginBottom: '12px',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {benefit.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: '#000000',
                    opacity: 0.65,
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            className="seller-cta"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              backgroundColor: '#0A4834',
              color: '#FFFFFF',
              padding: '18px 56px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
            }}
          >
            {t.becomeSeller.startSelling}
          </button>
        </div>
      </div>

      <style>{`
        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0px 12px 32px rgba(10, 72, 52, 0.12);
          border-color: rgba(10, 72, 52, 0.2);
        }

        .benefit-card:hover .icon-circle {
          background-color: rgba(10, 72, 52, 0.1);
          border-color: rgba(10, 72, 52, 0.2);
        }

        .seller-cta:hover {
          background-color: #9F8151;
          transform: translateY(-2px);
          box-shadow: 0px 8px 24px rgba(10, 72, 52, 0.25);
        }

        .seller-cta:active {
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}