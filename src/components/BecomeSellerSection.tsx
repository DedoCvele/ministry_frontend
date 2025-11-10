import { DollarSign, Users, Upload, Shield } from "lucide-react";
import { type Language, getTranslation } from '../translations';
import './styles/BecomeSellerSection.css';

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
      className="become-seller-section py-32 px-8"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="bs-manrope seller-joinus">
            {t.becomeSeller.joinUs}
          </p>

          <h2 className="bs-cormorant seller-title">
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
              >
                {/* Icon Circle */}
                <div className="icon-circle">
                  <Icon size={32} strokeWidth={1.5} color="#0A4834" />
                </div>

                {/* Title */}
                <h3 className="bs-cormorant benefit-title"
                >
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="bs-manrope benefit-desc">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            className="seller-cta bs-manrope"
          >
            {t.becomeSeller.startSelling}
          </button>
        </div>
      </div>

      
    </section>
  );
}