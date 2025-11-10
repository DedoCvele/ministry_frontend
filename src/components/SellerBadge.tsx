import { motion } from 'motion/react';
import { Crown, Check, Leaf, Award } from 'lucide-react';
import { useState } from 'react';

export type BadgeType = 'trusted' | 'top-rated' | 'verified' | 'new-seller';

interface SellerBadgeProps {
  type: BadgeType;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export function SellerBadge({ type, size = 'medium', showTooltip = true }: SellerBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const badgeConfig = {
    'trusted': {
      icon: Award,
      label: 'Trusted Seller',
      description: 'Consistently excellent service and authentic items',
      color: '#9F8151',
      bgColor: 'rgba(159,129,81,0.1)',
    },
    'top-rated': {
      icon: Crown,
      label: 'Top Rated',
      description: '4.8+ rating with 50+ successful sales',
      color: '#9F8151',
      bgColor: 'rgba(159,129,81,0.1)',
    },
    'verified': {
      icon: Check,
      label: 'Verified Closet',
      description: 'Identity and authenticity verified',
      color: '#0A4834',
      bgColor: 'rgba(10,72,52,0.1)',
    },
    'new-seller': {
      icon: Leaf,
      label: 'New Seller',
      description: 'Fresh to the Ministry community',
      color: '#9F8151',
      bgColor: 'rgba(159,129,81,0.08)',
    },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizeConfig = {
    small: {
      container: 24,
      icon: 14,
      fontSize: '11px',
    },
    medium: {
      container: 28,
      icon: 16,
      fontSize: '12px',
    },
    large: {
      container: 36,
      icon: 20,
      fontSize: '14px',
    },
  };

  const dimensions = sizeConfig[size];

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        style={{
          width: `${dimensions.container}px`,
          height: `${dimensions.container}px`,
          borderRadius: '50%',
          backgroundColor: config.bgColor,
          border: `2px solid ${config.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: showTooltip ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
        }}
      >
        <Icon size={dimensions.icon} color={config.color} />
      </motion.div>

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            minWidth: '200px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}>
            <Icon size={16} color={config.color} />
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0A4834',
              margin: 0,
            }}>
              {config.label}
            </p>
          </div>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            color: '#666',
            margin: 0,
            lineHeight: '18px',
          }}>
            {config.description}
          </p>

          {/* Tooltip Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#FFFFFF',
            transform: 'translateX(-50%) rotate(45deg)',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
          }} />
        </motion.div>
      )}
    </div>
  );
}

// Component for displaying multiple badges in a row
interface SellerBadgesProps {
  badges: BadgeType[];
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export function SellerBadges({ badges, size = 'medium', showTooltip = true }: SellerBadgesProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      {badges.map((badge, index) => (
        <SellerBadge
          key={`${badge}-${index}`}
          type={badge}
          size={size}
          showTooltip={showTooltip}
        />
      ))}
    </div>
  );
}
