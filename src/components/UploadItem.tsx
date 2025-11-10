import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { type Language, getTranslation } from '../translations';

interface UploadItemProps {
  onClose?: () => void;
  language?: Language;
}

export function UploadItem({ onClose, language = 'en' }: UploadItemProps) {
  const t = getTranslation(language);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: '',
    size: '',
    condition: '',
    description: '',
    tags: '',
    sellingPrice: '',
    autoExpire: true,
  });

  const brands = [
    'Chanel', 'Hermès', 'Louis Vuitton', 'Gucci', 'Dior',
    'Prada', 'Valentino', 'Saint Laurent', 'Bottega Veneta',
    'Céline', 'Burberry', 'Fendi', 'Balenciaga', 'Other'
  ];

  const categories = [
    'Dresses', 'Tops & Blouses', 'Skirts', 'Trousers', 'Jackets & Coats',
    'Bags', 'Shoes', 'Accessories', 'Jewelry', 'Swimwear'
  ];

  const conditions = [
    'New with tags',
    'Excellent',
    'Very good',
    'Good',
    'Fair'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = imageFiles.slice(0, 6 - uploadedImages.length).map(file => 
      URL.createObjectURL(file)
    );
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose?.();
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: '#F0ECE3', minHeight: '100vh' }}>
      <HeaderAlt />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 40px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '48px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '16px',
              marginTop: 0,
            }}
          >
            Upload Your Item
          </h1>
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              color: '#000000',
              opacity: 0.7,
              marginTop: 0,
            }}
          >
            Tell the story of your piece — one simple page.
          </p>
        </div>

        {/* Photo Upload Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '28px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '20px',
              marginTop: 0,
            }}
          >
            Photos
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#9F8151' : '#00000020'}`,
              borderRadius: '16px',
              padding: '60px 40px',
              backgroundColor: isDragging ? '#9F815110' : '#FFFFFF',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
            }}
          >
            <Upload size={48} color="#0A4834" style={{ margin: '0 auto 16px' }} />
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                color: '#0A4834',
                marginBottom: '8px',
                marginTop: 0,
              }}
            >
              Drag and drop photos here, or click to browse
            </p>
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#000000',
                opacity: 0.5,
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Include front, back, tag, and detail shots • Up to 6 photos
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Image Thumbnails */}
          {uploadedImages.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '16px',
              }}
            >
              {uploadedImages.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Upload ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <X size={16} color="#000000" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Item Details Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '28px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '20px',
              marginTop: 0,
            }}
          >
            Item Details
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              backgroundColor: '#FFFFFF',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Vintage Chanel Tweed Jacket"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                }}
              />
            </div>

            {/* Brand */}
            <div>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Brand *
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Size *
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., 38, S, M, L"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                }}
              />
            </div>

            {/* Condition */}
            <div>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select Condition</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share the story of this piece..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Tags */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="vintage, designer, evening wear (separate with commas)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  border: '1px solid #00000020',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#F0ECE3',
                }}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '28px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '20px',
              marginTop: 0,
            }}
          >
            Pricing
          </h2>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ maxWidth: '400px' }}>
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Selling Price *
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                    opacity: 0.5,
                  }}
                >
                  €
                </span>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 32px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    border: '1px solid #00000020',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: '#F0ECE3',
                  }}
                />
              </div>
            </div>

            {/* Auto-expire toggle */}
            <div
              style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#F0ECE3',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <input
                type="checkbox"
                id="autoExpire"
                checked={formData.autoExpire}
                onChange={(e) => setFormData({ ...formData, autoExpire: e.target.checked })}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#0A4834',
                }}
              />
              <label
                htmlFor="autoExpire"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                Auto-expire listing after 30 days
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    opacity: 0.6,
                    marginTop: '4px',
                  }}
                >
                  If unsold, you'll be notified to relist or extend
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Inline Preview */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '28px',
              fontWeight: 600,
              color: '#0A4834',
              marginBottom: '20px',
              marginTop: 0,
            }}
          >
            Preview
          </h2>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
              maxWidth: '320px',
            }}
          >
            {uploadedImages.length > 0 ? (
              <div
                style={{
                  aspectRatio: '3/4',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  backgroundColor: '#F0ECE3',
                }}
              >
                <ImageWithFallback
                  src={uploadedImages[0]}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                style={{
                  aspectRatio: '3/4',
                  borderRadius: '12px',
                  backgroundColor: '#F0ECE3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <ImageIcon size={48} color="#00000020" />
              </div>
            )}

            <h3
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#0A4834',
                marginBottom: '8px',
                marginTop: 0,
              }}
            >
              {formData.title || 'Item Title'}
            </h3>

            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#000000',
                opacity: 0.7,
                marginBottom: '12px',
                marginTop: 0,
              }}
            >
              {formData.brand || 'Brand'} • {formData.condition || 'Condition'}
            </p>

            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '18px',
                color: '#9F8151',
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              {formData.sellingPrice ? `€${formData.sellingPrice}` : '€0.00'}
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handlePublish}
            style={{
              padding: '16px 48px',
              backgroundColor: '#0A4834',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              minWidth: '200px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#083d2c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0A4834';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Publish Item
          </button>

          <button
            style={{
              padding: '16px 48px',
              backgroundColor: 'transparent',
              color: '#9F8151',
              border: '2px solid #9F8151',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              minWidth: '200px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#9F815110';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Save as Draft
          </button>
        </div>
      </div>

      <FooterAlt />

      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0A4834',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '12px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10000,
            animation: 'slideUpFade 0.3s ease-in-out',
          }}
        >
          <style>{`
            @keyframes slideUpFade {
              from {
                opacity: 0;
                transform: translate(-50%, 20px);
              }
              to {
                opacity: 1;
                transform: translate(-50%, 0);
              }
            }
          `}</style>
          <Check size={20} />
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}>
            Your piece is now live in your Closet!
          </span>
        </div>
      )}
    </div>
  );
}
