import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { apiClient } from '../api/apiClient';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Leaf,
  Star,
  ShieldCheck,
  Calendar,
  User,
  Mail,
  Hash,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { HeaderAlt } from '../components/HeaderAlt';
import { FooterAlt } from '../components/FooterAlt';
import '../components/styles/ProductPage.css';
import '../components/styles/AdminPage.css';

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const BACKEND_BASE_URL = API_ROOT;

const CONDITION_LABELS: Record<number, string> = {
  1: 'New',
  2: 'Excellent',
  3: 'Very Good',
  4: 'Good',
  5: 'Fair',
};

const APPROVAL_LABELS: Record<number, string> = {
  1: 'Pending',
  2: 'Approved',
  3: 'Specialist Approved',
};

function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (trimmed.match(/^https?:\/\//i)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (!trimmed.startsWith('/') && trimmed.includes('.')) return `https://${trimmed}`;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (trimmed.startsWith('storage/') || trimmed.startsWith('/storage/'))
    return `${BACKEND_BASE_URL}${cleanPath}`;
  if (
    trimmed.startsWith('items/') ||
    trimmed.startsWith('/items/') ||
    trimmed.startsWith('images/') ||
    trimmed.startsWith('/images/')
  ) {
    return `${BACKEND_BASE_URL}/storage${cleanPath}`;
  }
  return `${BACKEND_BASE_URL}${cleanPath}`;
}

export function AdminItemPreviewPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isHoveringPrev, setIsHoveringPrev] = useState(false);
  const [isHoveringNext, setIsHoveringNext] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        setError('Item ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setSelectedImage(0);
      try {
        const response = await apiClient.get(`/items/${itemId}`);
        const data = response.data?.data ?? response.data;
        if (!data || (!data.name && !data.title)) {
          setError('Item not found or incomplete.');
          setLoading(false);
          return;
        }
        setProduct(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Item not found. It may be pending and only visible to the owner.');
        } else {
          setError(err.response?.data?.message || 'Failed to load item.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  let mainImageUrl = '';
  let additionalImages: string[] = [];
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const mainImage = product.images[0];
    mainImageUrl = normalizeImageUrl(mainImage?.url ?? '') || '';
    additionalImages = product.images
      .slice(1)
      .map((img: any) => normalizeImageUrl(img?.url ?? ''))
      .filter(Boolean);
  } else {
    mainImageUrl =
      normalizeImageUrl(product?.mainImage?.url ?? '') ||
      (product?.images?.[0]?.url ? normalizeImageUrl(product.images[0].url) : '');
  }
  let productImages = [mainImageUrl, ...additionalImages].filter(Boolean);
  if (productImages.length === 0 && product?.image) {
    productImages = [normalizeImageUrl(product.image)];
  }

  const productTitle = product?.name || product?.title || 'Untitled Item';
  const productPrice = product?.price != null ? `€${parseFloat(String(product.price)).toFixed(2)}` : '€0';
  const productBrand = product?.brand?.name ?? '—';
  const productDescription = product?.description ?? 'No description.';
  const productSize =
    product?.sizes?.[0]?.label ?? (Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes[0]?.label : 'One size');
  const productCondition = CONDITION_LABELS[product?.condition] ?? 'Good';
  const productMaterial = product?.material ?? '—';
  const sellerName = product?.user?.name || product?.user?.email || 'Unknown Seller';
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const sellerEmail = product?.user?.email ?? '—';
  const productTags = Array.isArray(product?.tags)
    ? product.tags.map((tag: any) => tag?.name ?? tag)
    : [];
  const approvalStatus = product?.approval_status ?? product?.approved ?? 1;
  const approvalLabel = APPROVAL_LABELS[approvalStatus] ?? 'Unknown';
  const createdAt = product?.created_at
    ? new Date(product.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
  const updatedAt = product?.updated_at
    ? new Date(product.updated_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  if (loading) {
    return (
      <div className="product-root">
        <HeaderAlt />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '18px',
            color: '#0A4834',
          }}
        >
          Loading preview…
        </div>
        <FooterAlt />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-root">
        <HeaderAlt />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            fontFamily: 'Manrope, sans-serif',
            gap: '16px',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '18px', color: '#0A4834', fontWeight: 600, textAlign: 'center' }}>
            {error}
          </div>
          <motion.button
            onClick={() => navigate('/admin')}
            whileHover={{ backgroundColor: '#083D2C' }}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#0A4834',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              cursor: 'pointer',
            }}
          >
            Back to Admin
          </motion.button>
        </div>
        <FooterAlt />
      </div>
    );
  }

  return (
    <div className="product-root">
      <HeaderAlt />
      <div className="product-inner">
        <motion.button
          onClick={() => navigate('/admin')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="back-btn"
          whileHover={{ x: -4 }}
        >
          <ChevronLeft size={20} />
          Back to Admin
        </motion.button>

        {/* Admin-only info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-preview-banner"
          style={{
            background: 'linear-gradient(135deg, #0A4834 0%, #083D2C 100%)',
            color: '#FFFFFF',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} />
            <strong>Admin preview</strong> — This is how the item will appear when published.
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={16} />
            ID: {product.id}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={16} />
            Status: {approvalLabel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} />
            Submitted: {createdAt}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={16} />
            Seller: {sellerName}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={16} />
            {sellerEmail}
          </span>
        </motion.div>

        <div className="product-grid">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="gallery-col"
          >
            <div
              className="gallery-main"
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => {
                setIsHoveringImage(false);
                setIsHoveringPrev(false);
                setIsHoveringNext(false);
              }}
            >
              <motion.div
                animate={{
                  x: isHoveringPrev ? 30 : isHoveringNext ? -30 : 0,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <ImageWithFallback
                  src={productImages[selectedImage] || ''}
                  alt={productTitle}
                  className="gallery-image"
                />
              </motion.div>
              {selectedImage > 0 && isHoveringImage && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedImage(selectedImage - 1)}
                  onMouseEnter={() => setIsHoveringPrev(true)}
                  onMouseLeave={() => setIsHoveringPrev(false)}
                  className="nav-arrow left"
                >
                  <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
                </motion.button>
              )}
              {selectedImage < productImages.length - 1 && isHoveringImage && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedImage(selectedImage + 1)}
                  onMouseEnter={() => setIsHoveringNext(true)}
                  onMouseLeave={() => setIsHoveringNext(false)}
                  className="nav-arrow right"
                >
                  <ChevronRight size={28} color="#FFFFFF" strokeWidth={2.5} />
                </motion.button>
              )}
            </div>
            {productImages.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 12,
                  flexWrap: 'wrap',
                }}
              >
                {productImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: selectedImage === i ? '2px solid #0A4834' : '1px solid #e0e0e0',
                      padding: 0,
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                  >
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
            <div className="seller-card" style={{ marginTop: 24 }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 600, color: '#0A4834', marginBottom: '12px' }}>
                Seller
              </div>
              <div className="seller-row">
                <div className="seller-avatar-large">{sellerInitial}</div>
                <div style={{ flex: 1 }}>
                  <div className="seller-name-large">{sellerName}</div>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#9F8151', fontWeight: 500 }}>
                    {sellerEmail}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <h1 className="product-title-large">{productTitle}</h1>
            <div className="product-price">{productPrice}</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <span className="admin-preview-tag">{productCondition}</span>
              {product?.category?.name && <span className="admin-preview-tag">{product.category.name}</span>}
              {productTags.slice(0, 4).map((tag: string) => (
                <span key={tag} className="admin-preview-tag">
                  {tag}
                </span>
              ))}
            </div>
            <div
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#000000',
                marginBottom: '40px',
              }}
            >
              {productDescription}
            </div>
            <div style={{ height: '1px', backgroundColor: 'rgba(159,129,81,0.2)', marginBottom: '32px' }} />

            <Accordion type="single" collapsible style={{ marginBottom: '40px' }}>
              <AccordionItem value="brand" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 500, color: '#0A4834' }}>
                  Brand
                </AccordionTrigger>
                <AccordionContent style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', color: '#000000', paddingTop: '12px' }}>
                  {productBrand}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="material" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 500, color: '#0A4834' }}>
                  Material
                </AccordionTrigger>
                <AccordionContent style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', color: '#000000', paddingTop: '12px' }}>
                  {productMaterial}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="size" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 500, color: '#0A4834' }}>
                  Size
                </AccordionTrigger>
                <AccordionContent style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', color: '#000000', paddingTop: '12px' }}>
                  {productSize}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="condition" style={{ borderColor: 'rgba(159,129,81,0.2)' }}>
                <AccordionTrigger style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 500, color: '#0A4834' }}>
                  Condition
                </AccordionTrigger>
                <AccordionContent style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', color: '#000000', paddingTop: '12px' }}>
                  {productCondition}. {productDescription}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '24px',
                padding: '16px',
                background: '#F9FAFB',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontWeight: 600, color: '#0A4834', marginBottom: 8 }}>Admin details</div>
              <div>Item ID: {product.id}</div>
              <div>Approval: {approvalLabel}</div>
              <div>Created: {createdAt}</div>
              <div>Updated: {updatedAt}</div>
              {product?.location && <div>Location: {product.location}</div>}
            </div>
          </motion.div>
        </div>

        <div style={{ marginTop: 80 }}>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <Package size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div className="info-title">Standard delivery</div>
              <div className="info-desc">Delivery within 3–5 working days.</div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <RotateCcw size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div className="info-title">Easy returns</div>
              <div className="info-desc">30-day return policy.</div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Leaf size={36} strokeWidth={1.5} stroke="#9F8151" />
              </div>
              <div className="info-title">Circular fashion</div>
              <div className="info-desc">Pre-loved and sustainable.</div>
            </div>
          </div>
        </div>
      </div>
      <FooterAlt />
    </div>
  );
}
