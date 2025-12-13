import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBio?: string;
  currentAvatar?: string;
  onSave: (bio: string, profilePicture: string | File | null | undefined) => void;
}

// Default avatar options (placeholder avatars)
const defaultAvatars = [
  { 
    id: 'avatar1', 
    name: 'Avatar 1', 
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#F0ECE3"/>
      <circle cx="50" cy="35" r="12" fill="#0A4834"/>
      <path d="M 20 70 Q 50 50 80 70" stroke="#0A4834" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  { 
    id: 'avatar2', 
    name: 'Avatar 2', 
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#DCD6C9"/>
      <circle cx="50" cy="35" r="12" fill="#9F8151"/>
      <ellipse cx="50" cy="70" rx="20" ry="15" fill="#0A4834"/>
    </svg>`
  },
  { 
    id: 'avatar3', 
    name: 'Avatar 3', 
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#9F8151"/>
      <circle cx="50" cy="35" r="12" fill="#FFFFFF"/>
      <path d="M 25 75 Q 50 55 75 75" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  { 
    id: 'avatar4', 
    name: 'Avatar 4', 
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#0A4834"/>
      <circle cx="50" cy="35" r="12" fill="#F0ECE3"/>
      <ellipse cx="50" cy="70" rx="20" ry="15" fill="#9F8151"/>
    </svg>`
  },
  { 
    id: 'avatar5', 
    name: 'Avatar 5', 
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#3B7059"/>
      <circle cx="50" cy="35" r="12" fill="#DCD6C9"/>
      <path d="M 20 70 Q 50 50 80 70" stroke="#DCD6C9" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`
  },
];

export function EditProfileModal({
  isOpen,
  onClose,
  currentBio = '',
  currentAvatar = '',
  onSave,
}: EditProfileModalProps) {
  const [bio, setBio] = useState(currentBio);
  const [selectedAvatarType, setSelectedAvatarType] = useState<'default' | 'color'>('default');
  const [selectedDefaultAvatar, setSelectedDefaultAvatar] = useState<string>('avatar1');
  const [selectedColor, setSelectedColor] = useState({ r: 159, g: 129, b: 81 }); // Default to #9F8151

  useEffect(() => {
    if (isOpen) {
      setBio(currentBio);
      // Determine if current avatar is a color or default
      if (currentAvatar && currentAvatar.startsWith('#')) {
        setSelectedAvatarType('color');
        // Parse hex color to RGB
        const hex = currentAvatar.replace('#', '');
        setSelectedColor({
          r: parseInt(hex.substr(0, 2), 16),
          g: parseInt(hex.substr(2, 2), 16),
          b: parseInt(hex.substr(4, 2), 16),
        });
      } else if (currentAvatar && defaultAvatars.find(a => a.id === currentAvatar)) {
        setSelectedAvatarType('default');
        setSelectedDefaultAvatar(currentAvatar);
      } else {
        setSelectedAvatarType('default');
      }
    }
  }, [isOpen, currentBio, currentAvatar]);

  // Convert SVG to PNG blob/file
  const svgToImageFile = async (svgString: string, filename: string): Promise<File | null> => {
    return new Promise((resolve) => {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200; // Higher resolution for better quality
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, 200, 200);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              const file = new File([blob], filename, { type: 'image/png' });
              resolve(file);
            } else {
              resolve(null);
            }
          }, 'image/png');
        } else {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      
      img.src = url;
    });
  };

  const handleSave = async () => {
    let profilePictureValue: string | File | null | undefined = undefined; // undefined = don't update, null = remove
    
    if (selectedAvatarType === 'color') {
      // Convert RGB to hex
      const hex = `#${selectedColor.r.toString(16).padStart(2, '0')}${selectedColor.g.toString(16).padStart(2, '0')}${selectedColor.b.toString(16).padStart(2, '0')}`;
      profilePictureValue = hex;
    } else if (selectedAvatarType === 'default') {
      // Convert selected avatar SVG to image file
      const selectedAvatar = defaultAvatars.find(a => a.id === selectedDefaultAvatar);
      if (selectedAvatar) {
        // Create a proper SVG with proper namespace
        const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>${selectedAvatar.svg}`;
        const imageFile = await svgToImageFile(fullSvg, `${selectedAvatar.id}.png`);
        if (imageFile) {
          profilePictureValue = imageFile;
        } else {
          // Fallback: use SVG data URL if conversion fails
          const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml' });
          const dataUrl = URL.createObjectURL(svgBlob);
          profilePictureValue = dataUrl;
        }
      }
    }
    
    onSave(bio, profilePictureValue);
    onClose();
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="edit-profile-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 72, 52, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #9F8151',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0px 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F0ECE3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2
                  className="text-2xl font-semibold text-[#0A4834]"
                  style={{ fontFamily: 'Cormorant Garamond, serif', margin: 0 }}
                >
                  Edit Profile
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0ECE3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={20} color="#0A4834" />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Bio Section */}
              <div>
                <Label htmlFor="bio" style={{ fontFamily: 'Manrope, sans-serif', color: '#0A4834', marginBottom: '8px', display: 'block', fontWeight: 500 }}>
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    minHeight: '100px',
                    border: '2px solid #DCD6C9',
                    borderRadius: '12px',
                    padding: '12px',
                    width: '100%',
                    resize: 'vertical' as const,
                  }}
                />
              </div>

              {/* Profile Picture Section */}
              <div>
                <Label style={{ fontFamily: 'Manrope, sans-serif', color: '#0A4834', marginBottom: '12px', display: 'block', fontWeight: 500 }}>
                  Profile Picture
                </Label>

                {/* Avatar Type Selection */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setSelectedAvatarType('default')}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      backgroundColor: selectedAvatarType === 'default' ? '#0A4834' : '#F0ECE3',
                      color: selectedAvatarType === 'default' ? '#FFFFFF' : '#0A4834',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAvatarType !== 'default') {
                        e.currentTarget.style.backgroundColor = '#DCD6C9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAvatarType !== 'default') {
                        e.currentTarget.style.backgroundColor = '#F0ECE3';
                      }
                    }}
                  >
                    Default Avatars
                  </button>
                  <button
                    onClick={() => setSelectedAvatarType('color')}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      backgroundColor: selectedAvatarType === 'color' ? '#0A4834' : '#F0ECE3',
                      color: selectedAvatarType === 'color' ? '#FFFFFF' : '#0A4834',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAvatarType !== 'color') {
                        e.currentTarget.style.backgroundColor = '#DCD6C9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAvatarType !== 'color') {
                        e.currentTarget.style.backgroundColor = '#F0ECE3';
                      }
                    }}
                  >
                    <Palette size={16} />
                    Choose Color
                  </button>
                </div>

                {/* Default Avatars */}
                {selectedAvatarType === 'default' && (
                  <div className="grid grid-cols-5 gap-3">
                    {defaultAvatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedDefaultAvatar(avatar.id)}
                        className={`relative aspect-square rounded-full overflow-hidden transition-all ${
                          selectedDefaultAvatar === avatar.id
                            ? 'ring-4 ring-[#9F8151] scale-105'
                            : 'ring-2 ring-[#DCD6C9] hover:scale-105'
                        }`}
                      >
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: avatar.svg }}
                        />
                        {selectedDefaultAvatar === avatar.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#9F8151]/20">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Color Picker */}
                {selectedAvatarType === 'color' && (
                  <div className="space-y-4">
                    {/* Color Preview */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                        style={{ backgroundColor: rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b) }}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-[#666] mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          RGB: ({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                        </div>
                        <div className="text-sm text-[#666]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          Hex: {rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* RGB Sliders */}
                    <div className="space-y-3">
                      {/* Red Slider */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm text-[#0A4834]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Red
                          </Label>
                          <span className="text-sm text-[#666]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {selectedColor.r}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={selectedColor.r}
                          onChange={(e) => setSelectedColor({ ...selectedColor, r: parseInt(e.target.value) })}
                          className="w-full h-2 bg-[#F0ECE3] rounded-lg appearance-none cursor-pointer accent-[#9F8151]"
                          style={{
                            background: `linear-gradient(to right, #F0ECE3 0%, #ff0000 100%)`
                          }}
                        />
                      </div>

                      {/* Green Slider */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm text-[#0A4834]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Green
                          </Label>
                          <span className="text-sm text-[#666]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {selectedColor.g}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={selectedColor.g}
                          onChange={(e) => setSelectedColor({ ...selectedColor, g: parseInt(e.target.value) })}
                          className="w-full h-2 bg-[#F0ECE3] rounded-lg appearance-none cursor-pointer accent-[#9F8151]"
                          style={{
                            background: `linear-gradient(to right, #F0ECE3 0%, #00ff00 100%)`
                          }}
                        />
                      </div>

                      {/* Blue Slider */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm text-[#0A4834]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Blue
                          </Label>
                          <span className="text-sm text-[#666]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {selectedColor.b}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={selectedColor.b}
                          onChange={(e) => setSelectedColor({ ...selectedColor, b: parseInt(e.target.value) })}
                          className="w-full h-2 bg-[#F0ECE3] rounded-lg appearance-none cursor-pointer accent-[#9F8151]"
                          style={{
                            background: `linear-gradient(to right, #F0ECE3 0%, #0000ff 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Color Presets */}
                    <div>
                      <Label className="text-sm text-[#0A4834] mb-2 block" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Quick Colors
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { name: 'Beige', r: 240, g: 236, b: 227 },
                          { name: 'Taupe', r: 220, g: 214, b: 201 },
                          { name: 'Gold', r: 159, g: 129, b: 81 },
                          { name: 'Forest', r: 10, g: 72, b: 52 },
                          { name: 'Sage', r: 59, g: 112, b: 89 },
                          { name: 'White', r: 255, g: 255, b: 255 },
                          { name: 'Black', r: 0, g: 0, b: 0 },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setSelectedColor({ r: preset.r, g: preset.g, b: preset.b })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedColor.r === preset.r && selectedColor.g === preset.g && selectedColor.b === preset.b
                                ? 'ring-2 ring-[#9F8151]'
                                : 'hover:bg-[#F0ECE3]'
                            }`}
                            style={{
                              backgroundColor: rgbToHex(preset.r, preset.g, preset.b),
                              color: preset.r + preset.g + preset.b > 400 ? '#0A4834' : '#FFFFFF',
                              fontFamily: 'Manrope, sans-serif',
                            }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-xl border-2 border-[#9F8151] text-[#9F8151] hover:bg-[#9F8151]/5"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-[#0A4834] text-white hover:bg-[#0A4834]/90"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

