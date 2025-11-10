import { motion } from 'motion/react';
import { type Language, getTranslation } from '../translations';

interface VintageBannerProps {
  language?: Language;
}

export function VintageBanner({ language = 'en' }: VintageBannerProps = {}) {
  const t = getTranslation(language);
  
  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: '400px',
        backgroundColor: '#0A4834',
      }}
    >
      {/* Background Image with Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1628668003003-85488fe78821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmFzaGlvbiUyMGVkaXRvcmlhbHxlbnwxfHx8fDE3NjE1NzE3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
        }}
      />

      {/* Dark Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,72,52,0.85) 0%, rgba(10,72,52,0.95) 100%)',
        }}
      />

      {/* Decorative Elements */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '1px solid rgba(159,129,81,0.2)',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '8%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '1px solid rgba(159,129,81,0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(159,129,81,0.1)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8"
        style={{ maxWidth: '900px', margin: '0 auto' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          {/* Small Label */}
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#9F8151',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            {t.banner.label}
          </p>

          {/* Main Message */}
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '56px',
              fontWeight: 600,
              lineHeight: '68px',
              color: '#FFFFFF',
              letterSpacing: '-1px',
              marginBottom: '24px',
            }}
          >
            {t.banner.title}
            <br />
            {t.banner.titleSecond}
          </h2>

          {/* Sub-message */}
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '28px',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '640px',
              margin: '0 auto',
              letterSpacing: '0.3px',
            }}
          >
            {t.banner.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Bottom Decorative Line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(159,129,81,0.3) 50%, transparent 100%)',
        }}
      />

      <style>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        section > div:nth-child(3) > div:nth-child(1) {
          animation: floatSlow 8s ease-in-out infinite;
        }

        section > div:nth-child(3) > div:nth-child(2) {
          animation: floatSlow 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        section > div:nth-child(3) > div:nth-child(3) {
          animation: floatSlow 7s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </section>
  );
}