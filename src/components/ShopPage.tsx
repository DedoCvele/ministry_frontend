import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, X, Heart, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { NewsletterPopup } from './NewsletterPopup';
import { type Language, getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
import './styles/ShopPage.css';

interface Product {
  id: number;
  title: string;
  price: number;
  seller: string;
  sellerAvatar: string;
  image: string;
  tags: string[];
  category: string;
  brand: string;
  size: string;
  condition: string;
  description?: string; // Optional description for search
  apiData?: any; // Store full API response for additional details
}

interface ShopPageProps {
  onProductClick?: (id: number) => void;
  language?: Language;
}

// Robust helper to safely extract numeric approval value from various response shapes
const getApprovalNumber = (item: any): number | null => {
  if (!item) return null;

  // 1) Direct primitive values using nullish coalescing (??) to handle 0 correctly
  const candidate = item.approved ?? item.approval_status ?? item.approval_state ?? item.status;

  if (candidate !== undefined && candidate !== null) {
    // If it's an object (e.g. { value: 3, type: 'number' }), try to extract known shapes
    if (typeof candidate === 'object') {
      if (candidate.value !== undefined) return Number(candidate.value);
      if (candidate.approved_number !== undefined) return Number(candidate.approved_number);
      if (candidate.approved !== undefined) return Number(candidate.approved);
      
      // Try to find first numeric-like value in the object
      for (const v of Object.values(candidate)) {
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
      }
      
      // Fallback to null if no numeric value found
      return null;
    }

    // If it's a string or number, coerce safely
    const coerced = Number(String(candidate).trim());
    return Number.isNaN(coerced) ? null : coerced;
  }

  // 2) Try alternative keys (some responses include additional keys)
  const altKeys = ['approved_number', 'approved_type', 'approval', 'approvalNumber', 'data', 'attributes'];
  for (const k of altKeys) {
    const v = item[k];
    if (v !== undefined && v !== null) {
      const n = Number(String(v).trim());
      if (!Number.isNaN(n)) return n;
    }
  }

  return null;
};

export function ShopPage({ onProductClick, language = 'en' }: ShopPageProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const handleProductClick = (productId: number) => {
    if (onProductClick) {
      onProductClick(productId);
    } else {
      navigate(`/product/${productId}`);
    }
  };
  const t = getTranslation(language);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{[key: string]: string}>({});
  const [sortBy, setSortBy] = useState('Newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);

  // Mock products as fallback
  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'Vintage Leather Blazer',
      price: 285,
      seller: 'TanjaVintage',
      sellerAvatar: 'T',
      image: 'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGVhdGhlciUyMGphY2tldHxlbnwxfHx8fDE3NjE1NzgwOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['StreetStyle', 'Vintage'],
      category: 'Outerwear',
      brand: 'Unknown',
      size: 'M',
      condition: 'Excellent',
    },
    {
      id: 2,
      title: 'Designer Silk Dress',
      price: 395,
      seller: 'SofiaCloset',
      sellerAvatar: 'S',
      image: 'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZHJlc3MlMjBlbGVnYW50fGVufDF8fHx8MTc2MTU4MTUxOXww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Evening', 'Designer'],
      category: 'Dresses',
      brand: 'Dior',
      size: 'S',
      condition: 'Like New',
    },
    {
      id: 3,
      title: 'Classic Structured Bag',
      price: 445,
      seller: 'LuxeFinds',
      sellerAvatar: 'L',
      image: 'https://images.unsplash.com/photo-1758171692659-024183c2c272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWclMjBsdXh1cnl8ZW58MXx8fHwxNzYxNTc1MjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Timeless', 'Investment'],
      category: 'Bags',
      brand: 'Hermès',
      size: 'One Size',
      condition: 'Very Good',
    },
    {
      id: 4,
      title: 'Vintage Denim Jacket',
      price: 165,
      seller: 'EmmaArchive',
      sellerAvatar: 'E',
      image: 'https://images.unsplash.com/photo-1716307961085-6a7006f28685?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZGVzaWduZXIlMjBjbG90aGluZ3xlbnwxfHx8fDE3NjE1ODE1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['90sVintage', 'Casual'],
      category: 'Outerwear',
      brand: "Levi's",
      size: 'L',
      condition: 'Good',
    },
    {
      id: 5,
      title: 'Statement Leather Boots',
      price: 225,
      seller: 'IsabellaStyle',
      sellerAvatar: 'I',
      image: 'https://images.unsplash.com/photo-1759563874692-d556321d7c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwaXRlbXN8ZW58MXx8fHwxNzYxNTgxNTE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['EdgyLuxe', 'Vintage'],
      category: 'Shoes',
      brand: 'YSL',
      size: '38',
      condition: 'Excellent',
    },
    {
      id: 6,
      title: 'Tailored Wool Trousers',
      price: 145,
      seller: 'MinimalWardrobe',
      sellerAvatar: 'M',
      image: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2FyZHJvYmUlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2MTU4MTUyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: ['Minimalist', 'Professional'],
      category: 'Bottoms',
      brand: 'MaxMara',
      size: 'M',
      condition: 'Excellent',
    },
  ];

  // Dynamically generate filter options from actual products
  const getFilterOptions = () => {
    const allProducts = apiProducts.length > 0 ? apiProducts : mockProducts;
    
    // Extract unique categories
    const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    categories.sort();
    
    // Extract unique brands
    const brands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean)));
    brands.sort();
    
    // Extract unique sizes
    const sizes = Array.from(new Set(allProducts.map(p => p.size).filter(Boolean)));
    sizes.sort();
    
    return {
      Category: ['All', ...categories],
      Brand: ['All', ...brands],
      Size: ['All', ...sizes],
      Price: ['All', 'Price: Low to High', 'Price: High to Low'],
    };
  };

  const filterOptions = getFilterOptions();

  const sortOptions = ['Newest', 'Trending', 'Lowest Price', 'Highest Price', 'Highest Rated'];

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
        const API_BASE_URL = `${API_ROOT}/api`;
        const response = await axios.get(`${API_BASE_URL}/items`);
        
        // Console log the full response
        console.log('=== AXIOS RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        console.log('Is array?', Array.isArray(response.data));
        console.log('Number of items:', Array.isArray(response.data) ? response.data.length : 'Not an array');
        
        // Handle different response structures
        let items = response.data;
        
        // Check if response has nested data structure
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else {
          items = [];
        }
        
        console.log('📦 Processed items:', items);
        console.log('📦 Items count:', Array.isArray(items) ? items.length : 0);
        
        // Log first item structure if available
        if (Array.isArray(items) && items.length > 0) {
          console.log('First item structure:', items[0]);
          console.log('First item keys:', Object.keys(items[0]));
          console.log('First item approved status:', items[0].approved);
        }
        
        // Filter items for shop page: show items with approved = 1, 2, or 3
        // 0 = Pending (not shown), 1 = Approved, 2 = Special, 3 = Premium
        const approvedItems = Array.isArray(items) 
          ? items.filter((item: any) => {
              const status = getApprovalNumber(item);
              return status !== null && (status === 1 || status === 2 || status === 3);
            })
          : [];
        
        console.log('🛍️ ShopPage - Filtered Items:', {
          total_items: Array.isArray(items) ? items.length : 0,
          approved_items: approvedItems.length,
          items_by_status: {
            status_1: items.filter((item: any) => getApprovalNumber(item) === 1).length,
            status_2: items.filter((item: any) => getApprovalNumber(item) === 2).length,
            status_3: items.filter((item: any) => getApprovalNumber(item) === 3).length,
          }
        });
        
          console.log('📊 Items filter stats:', {
          total_items: Array.isArray(items) ? items.length : 0,
          approved_items: approvedItems.length,
          pending_items: Array.isArray(items) ? items.filter((item: any) => {
            const approvedStatus = item.approved;
            // Items with approved !== 1 or 2 are considered pending
            return approvedStatus !== 1 && approvedStatus !== '1' && approvedStatus !== 2 && approvedStatus !== '2';
          }).length : 0
        });
        
        // Map API response to Product interface (only approved items)
        const mappedProducts: Product[] = approvedItems.map((item: any) => {
          const API_ROOT_FOR_IMAGES = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
          console.log('Mapping item:', {
            id: item.id,
            name: item.name,
            title: item.title, // Legacy field
            approved: item.approved,
            has_image: !!(item.image),
            image_data: item.image
          });
          
          // Handle different image formats from backend
          // Per API docs: response includes 'images[]' array (first is main), 'image_url', or 'image' (path)
          const getImageUrl = (item: any): string => {
            // Per API docs: Check 'images[]' array first - first image is main image
            if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
              const mainImage = item.images[0];
              // Use 'url' field if available (preferred)
              if (mainImage?.url) {
                return mainImage.url;
              }
              // Otherwise construct from 'path'
              if (mainImage?.path) {
                const img = mainImage.path;
                if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                  return img;
                }
                const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                if (cleanPath.startsWith('storage/')) {
                  return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
                }
                return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
              }
            }
            
            // Per API docs: Use 'image_url' if available (preferred)
            if (item?.image_url) {
              return item.image_url;
            }
            
            // Otherwise use 'image' path and construct URL
            if (item?.image) {
              const img = item.image;
              // If already a full URL
              if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                return img;
              }
              // Construct from path
              const cleanPath = img.startsWith('/') ? img.substring(1) : img;
              if (cleanPath.startsWith('storage/')) {
                return `${API_ROOT_FOR_IMAGES}/${cleanPath}`;
              }
              return `${API_ROOT_FOR_IMAGES}/storage/${cleanPath}`;
            }
            
            // Only return empty string if no image is available - ImageWithFallback will handle the fallback
            return '';
          };
          
          return {
          id: item.id,
          title: item.title || item.name || 'Untitled Item', // Per API docs: both 'title' and 'name' are available
          price: parseFloat(item.price) || 0,
          seller: item.user?.name || item.user?.email || 'Unknown Seller',
          sellerAvatar: item.user?.name?.charAt(0).toUpperCase() || 'U',
          image: getImageUrl(item), // Per API docs: use 'image_url' or construct from 'image'
          tags: item.tags ? (Array.isArray(item.tags) ? item.tags : typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : [item.tags]) : [],
          category: item.category?.name || 'Uncategorized',
          brand: item.brand?.name || 'Unknown',
          size: item.size || 'One Size',
          condition: item.condition || 'Good',
          description: item.description || '', // Add description for search
          // Store full API data for additional info
          apiData: item,
          };
        });
        
        console.log('Mapped products:', mappedProducts);
        console.log('Number of mapped products:', mappedProducts.length);
        console.log('First mapped product:', mappedProducts[0]);
        
        setApiProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching items:', error);
        // On error, set empty array (don't use mock products)
        // This way we can see if there's actually an error vs no items
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Always use API products if they exist, otherwise show empty (no fallback to mock)
  // This ensures we see actual database items, not hardcoded ones
  const allProducts = apiProducts;

  // Filter and sort products based on active filters, search query, and sort option
  const filteredAndSortedProducts = (() => {
    let filtered = [...allProducts];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply Category filter
    if (activeFilters.Category && activeFilters.Category !== 'All') {
      filtered = filtered.filter(product => 
        product.category === activeFilters.Category
      );
    }

    // Apply Brand filter
    if (activeFilters.Brand && activeFilters.Brand !== 'All') {
      filtered = filtered.filter(product => 
        product.brand === activeFilters.Brand
      );
    }

    // Apply Size filter
    if (activeFilters.Size && activeFilters.Size !== 'All') {
      filtered = filtered.filter(product => 
        product.size === activeFilters.Size || 
        product.size?.toUpperCase() === activeFilters.Size.toUpperCase()
      );
    }

    // Apply sorting
    // Note: If Price filter is set, it will override the sort option for price sorting
    const priceFilterActive = activeFilters.Price && activeFilters.Price !== 'All';
    
    if (priceFilterActive) {
      // Price filter takes priority for price sorting
      if (activeFilters.Price === 'Price: Low to High') {
        filtered = filtered.sort((a, b) => a.price - b.price);
      } else if (activeFilters.Price === 'Price: High to Low') {
        filtered = filtered.sort((a, b) => b.price - a.price);
      }
    } else {
      // Apply other sort options only if price filter is not active
      switch (sortBy) {
        case 'Newest':
          // Sort by ID descending (assuming higher ID = newer)
          filtered = filtered.sort((a, b) => b.id - a.id);
          break;
        case 'Lowest Price':
          filtered = filtered.sort((a, b) => a.price - b.price);
          break;
        case 'Highest Price':
          filtered = filtered.sort((a, b) => b.price - a.price);
          break;
        case 'Trending':
          // For now, sort by ID (can be enhanced with actual trending logic)
          filtered = filtered.sort((a, b) => b.id - a.id);
          break;
        case 'Highest Rated':
          // For now, sort by ID (can be enhanced with actual rating logic)
          filtered = filtered.sort((a, b) => b.id - a.id);
          break;
        default:
          // Default: keep original order
          break;
      }
    }

    return filtered;
  })();

  // Use filtered and sorted products
  const products = filteredAndSortedProducts;

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    setActiveFilters(newFilters);
  };

  return (
    <div className="shop-root">
      {/* Grain Texture */}
      <div className="shop-grain" />

      {/* Header */}
      <HeaderAlt />

      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="shop-header">
        <div className="shop-header-inner">
          <h1 className="shop-title">{t.shop.title}</h1>
          <p className="shop-subtitle">{t.shop.subtitle}</p>
          <div className="shop-hr" />
        </div>

        {/* Filter & Sort Bar */}
        <div className="shop-filters-container">
          <div className="shop-filters-card">
            {/* Search Bar */}
            <div className="search-container">
              <Search size={18} color="#9F8151" className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.shop.searchPlaceholder}
                className="search-input"
              />
            </div>

            {/* Filter Grid */}
            <div className="filter-grid">
              {Object.entries(filterOptions).map(([filterName, options]) => (
                <div key={filterName} className="filter-col">
                  <motion.button
                    onClick={() => setShowFilterDropdown(showFilterDropdown === filterName ? null : filterName)}
                    className="filter-button"
                    whileHover={{ backgroundColor: 'rgba(159,129,81,0.1)' }}
                  >
                    {filterName} <ChevronDown size={16} />
                  </motion.button>

                  <AnimatePresence>
                    {showFilterDropdown === filterName && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="filter-dropdown">
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              if (option === 'All') {
                                removeFilter(filterName);
                              } else {
                                setActiveFilters({ ...activeFilters, [filterName]: option });
                              }
                              setShowFilterDropdown(null);
                            }}
                            className="filter-option-btn"
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Sort Dropdown - Separate Row */}
            <div className="sort-row">
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <motion.button onClick={() => setShowFilterDropdown(showFilterDropdown === 'sort' ? null : 'sort')} whileHover={{ backgroundColor: 'rgba(159,129,81,0.1)' }} className="sort-button">
                  {sortBy} <ChevronDown size={16} />
                </motion.button>

                <AnimatePresence>
                  {showFilterDropdown === 'sort' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="filter-dropdown" style={{ left: '50%', transform: 'translateX(-50%)', minWidth: '180px' }}>
                      {sortOptions.map((option) => (
                        <button key={option} onClick={() => { setSortBy(option); setShowFilterDropdown(null); }} className="filter-option-btn">
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="active-filters">
              {Object.entries(activeFilters).map(([key, value]) => (
                <motion.div key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="filter-pill">
                  {value}
                  <button onClick={() => removeFilter(key)} className="filter-pill-close">
                    <X size={14} color="#FFFFFF" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="products-container">
        {loading ? (
          <div className="loading-placeholder">Loading products...</div>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="product-motion-wrapper"
            >
              {/* Product Card */}
              <div onClick={() => handleProductClick(product.id)} className="product-card">
                {/* Image Container */}
                <div className="product-image-container">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }} className="image-hover-wrap">
                    <ImageWithFallback src={product.image} alt={product.title} className="product-image" />
                  </motion.div>

                  {/* Gold overlay on hover */}
                  <div className="product-overlay">
                    <span className="view-details-text">View Details →</span>
                  </div>

                  {/* Wishlist Button */}
                  <motion.button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="wishlist-btn">
                    <Heart size={18} color="#9F8151" fill={wishlist.includes(product.id) ? '#9F8151' : 'none'} />
                  </motion.button>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="product-title">{product.title}</h3>

                  <p className="product-price">€{product.price}</p>

                  {/* Seller Info */}
                  <div className="seller-row">
                    <div className="seller-avatar">{product.sellerAvatar}</div>
                    <span className="seller-name">@{product.seller}</span>
                  </div>

                  {/* Divider */}
                  <div className="divider" />

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {product.tags.map((tag) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* Load More / Show Additional Info Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="load-more-wrap">
          <motion.button onClick={() => { setShowAdditionalInfo(!showAdditionalInfo); }} whileHover={{ backgroundColor: '#0A4834', color: '#FFFFFF' }} whileTap={{ scale: 0.98 }} className="toggle-info-btn">
            <Info size={18} />
            {showAdditionalInfo ? 'Hide Additional Info' : 'Show Additional Info'}
          </motion.button>

          {/* Additional Info Cards Display */}
          {showAdditionalInfo && products.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="additional-info-wrap">
              <h3 className="additional-info-title">Additional Product Information</h3>

              {/* Grid of Additional Info Cards */}
              <div className="additional-info-grid">
                {products.filter(p => p.apiData).map((product) => (
                  <motion.div key={`info-${product.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="info-card">
                    <div className="info-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(159,129,81,0.2)' }}>
                      <div className="info-image" style={{ width: 48, height: 48 }}>
                        <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#0A4834', margin: 0 }}>{product.title}</h4>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: '#9F8151', margin: '4px 0 0 0' }}>ID: {product.id}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'Manrope, sans-serif', fontSize: 13 }}>
                      {product.apiData.description && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Description:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.description}</span>
                        </div>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {product.apiData.brand_id && (
                          <div>
                            <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Brand ID:</strong>
                            <span style={{ color: '#0A4834' }}>{product.apiData.brand_id}</span>
                          </div>
                        )}
                        {product.apiData.category_id && (
                          <div>
                            <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Category ID:</strong>
                            <span style={{ color: '#0A4834' }}>{product.apiData.category_id}</span>
                          </div>
                        )}
                      </div>

                      {product.apiData.approved && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Approval Status:</strong>
                          <span style={{ color: '#0A4834', backgroundColor: (product.apiData.approved === 1 || product.apiData.approved === '1') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                            {product.apiData.approved === 1 || product.apiData.approved === '1' ? 'Approved' : product.apiData.approved === 2 || product.apiData.approved === '2' ? 'Special' : 'Pending'}
                          </span>
                        </div>
                      )}

                      {product.apiData.brand && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Brand:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.brand.name}</span>
                        </div>
                      )}

                      {product.apiData.category && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Category:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.category.name}</span>
                        </div>
                      )}

                      {product.apiData.user && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Seller:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.user.name || product.apiData.user.email}</span>
                        </div>
                      )}

                      {product.apiData.created_at && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>Created:</strong>
                          <span style={{ color: '#0A4834' }}>{new Date(product.apiData.created_at).toLocaleDateString()}</span>
                        </div>
                      )}

                      {product.apiData.image && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 8 }}>Image:</strong>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <img 
                              src={product.image} 
                              alt="Product image" 
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(159,129,81,0.2)' }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom CTA Strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bottom-cta">
          {/* Texture overlay */}
          <div className="bottom-cta-texture" />

          <p className="bottom-cta-quote">"Not old. Not new. Just you."</p>
        </motion.div>
      </div>

      {/* Footer */}
      <FooterAlt onNewsletterClick={() => setNewsletterOpen(true)} />

      {/* Newsletter Popup */}
      <NewsletterPopup
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />
    </div>
  );
}