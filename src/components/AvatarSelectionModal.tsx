import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import './styles/AvatarSelectionModal.css';

interface AvatarOption {
  id: string;
  name: string;
  svg: string;
}

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (avatarId: string) => void;
  currentAvatarId?: string;
}

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  onSelect,
  currentAvatarId,
}: AvatarSelectionModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarId || '1');

  // Avatar options with abstract, editorial SVG illustrations
  const avatarOptions: AvatarOption[] = [
    {
      id: '1',
      name: 'Linen Texture',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0ECE3"/>
          <rect x="30" y="30" width="60" height="60" fill="#9F8151" opacity="0.3" transform="rotate(45 60 60)"/>
          <circle cx="60" cy="60" r="20" fill="#0A4834"/>
          <path d="M40 60 Q60 40 80 60 Q60 80 40 60" fill="#9F8151" opacity="0.5"/>
        </svg>
      `,
    },
    {
      id: '2',
      name: 'Silk Drape',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#DCD6C9"/>
          <path d="M30 40 Q60 20 90 40 L90 80 Q60 100 30 80 Z" fill="#0A4834" opacity="0.7"/>
          <ellipse cx="60" cy="60" rx="25" ry="35" fill="#9F8151" opacity="0.4"/>
        </svg>
      `,
    },
    {
      id: '3',
      name: 'Vintage Hanger',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0ECE3"/>
          <line x1="30" y1="50" x2="90" y2="50" stroke="#0A4834" stroke-width="3" stroke-linecap="round"/>
          <circle cx="60" cy="35" r="8" fill="#9F8151"/>
          <path d="M30 50 L35 80 L85 80 L90 50" fill="none" stroke="#9F8151" stroke-width="2"/>
        </svg>
      `,
    },
    {
      id: '4',
      name: 'Fabric Fold',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#DCD6C9"/>
          <path d="M20 30 L60 50 L100 30 L100 90 L60 70 L20 90 Z" fill="#0A4834" opacity="0.6"/>
          <path d="M60 50 L60 70" stroke="#9F8151" stroke-width="2"/>
          <circle cx="60" cy="60" r="15" fill="#9F8151" opacity="0.5"/>
        </svg>
      `,
    },
    {
      id: '5',
      name: 'Abstract Collar',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0ECE3"/>
          <path d="M40 30 L60 50 L80 30 L80 60 L60 80 L40 60 Z" fill="#0A4834" opacity="0.7"/>
          <rect x="55" y="25" width="10" height="70" fill="#9F8151" opacity="0.4"/>
        </svg>
      `,
    },
    {
      id: '6',
      name: 'Button Detail',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#DCD6C9"/>
          <circle cx="60" cy="40" r="8" fill="#9F8151"/>
          <circle cx="60" cy="60" r="8" fill="#9F8151"/>
          <circle cx="60" cy="80" r="8" fill="#9F8151"/>
          <rect x="35" y="25" width="50" height="70" rx="10" fill="none" stroke="#0A4834" stroke-width="2"/>
        </svg>
      `,
    },
    {
      id: '7',
      name: 'Seam Lines',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0ECE3"/>
          <line x1="60" y1="20" x2="60" y2="100" stroke="#0A4834" stroke-width="2" stroke-dasharray="5,5"/>
          <line x1="20" y1="60" x2="100" y2="60" stroke="#0A4834" stroke-width="2" stroke-dasharray="5,5"/>
          <circle cx="60" cy="60" r="25" fill="none" stroke="#9F8151" stroke-width="3"/>
        </svg>
      `,
    },
    {
      id: '8',
      name: 'Pleated Form',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#DCD6C9"/>
          <path d="M30 30 L45 50 L30 70 L30 90 L45 90 L60 70 L75 90 L90 90 L90 70 L75 50 L90 30" fill="#0A4834" opacity="0.6"/>
          <path d="M45 50 L60 70 L75 50" fill="#9F8151" opacity="0.5"/>
        </svg>
      `,
    },
    {
      id: '9',
      name: 'Minimalist Garment',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0ECE3"/>
          <rect x="40" y="35" width="40" height="50" rx="5" fill="#0A4834" opacity="0.7"/>
          <rect x="30" y="40" width="60" height="5" fill="#9F8151"/>
          <circle cx="45" cy="50" r="3" fill="#9F8151"/>
          <circle cx="75" cy="50" r="3" fill="#9F8151"/>
        </svg>
      `,
    },
    {
      id: '10',
      name: 'Timeless Silhouette',
      svg: `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#DCD6C9"/>
          <ellipse cx="60" cy="60" rx="30" ry="45" fill="#0A4834" opacity="0.7"/>
          <ellipse cx="60" cy="45" rx="20" ry="15" fill="#9F8151" opacity="0.5"/>
          <rect x="55" y="75" width="10" height="25" fill="#9F8151" opacity="0.6"/>
        </svg>
      `,
    },
  ];

  const handleSave = () => {
    if (onSelect) {
      onSelect(selectedAvatar);
    }
    toast('✨ Profile image updated successfully', {
      duration: 3000,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#F0ECE3]/60 backdrop-blur-[12px]"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl border-2 border-[#9F8151] shadow-[0_6px_24px_rgba(0,0,0,0.06)] max-w-[640px] w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-[#F0ECE3] rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-[#0A4834]" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 avatar-header">
            <h2 className="avatar-title text-[#0A4834] mb-2">Choose Your Profile Picture</h2>
            <p className="avatar-subtitle text-[#9F8151]">Select one of our signature illustrations to match your style.</p>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`relative group transition-all duration-300 ${
                  selectedAvatar === avatar.id ? 'scale-105' : 'hover:scale-105'
                }`}
                title={avatar.name}
              >
                {/* Avatar Circle */}
                <div
                  className={`w-full aspect-square rounded-full overflow-hidden transition-all duration-300 ${
                    selectedAvatar === avatar.id
                      ? 'ring-4 ring-[#9F8151] shadow-[0_0_20px_rgba(159,129,81,0.4)]'
                      : 'ring-2 ring-[#DCD6C9]'
                  }`}
                  dangerouslySetInnerHTML={{ __html: avatar.svg }}
                />

                {/* Checkmark */}
                {selectedAvatar === avatar.id && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#9F8151] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Name tooltip on hover */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <span className="avatar-tooltip text-[#9F8151] text-xs bg-white px-2 py-1 rounded-lg shadow-lg">{avatar.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-xl px-6 border-2 border-[#9F8151] text-[#9F8151] hover:bg-[#9F8151]/5 avatar-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl px-6 bg-[#0A4834] text-white hover:bg-[#0A4834]/90 avatar-btn avatar-btn-primary"
            >
              Save Selection
            </Button>
          </div>

          {/* Footer Caption */}
          <div className="mt-6 pt-6 border-t border-[#9F8151]/20">
            <p
              style={{ fontFamily: 'Manrope, sans-serif' }}
              className="text-[#9F8151] text-center text-xs"
            >
              Each avatar is part of our Ministry Palette — designed to feel timeless and unified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
