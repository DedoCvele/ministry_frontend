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
import { useLanguage } from '../context/LanguageContext';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
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

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;

const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('via.placeholder.com')) return '';
  if (trimmed.match(/^https?:\/\//i)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (trimmed.startsWith('storage/') || trimmed.startsWith('/storage/')) {
    return `${API_ROOT}${cleanPath}`;
  }
  if (
    trimmed.startsWith('items/') ||
    trimmed.startsWith('/items/') ||
    trimmed.startsWith('images/') ||
    trimmed.startsWith('/images/')
  ) {
    return `${API_ROOT}/storage${cleanPath}`;
  }

  return `${API_ROOT}${cleanPath}`;
};

const CONDITION_LABELS: Record<number, string> = {
  1: 'New',
  2: 'Excellent',
  3: 'Very Good',
  4: 'Good',
  5: 'Fair',
};

export function ShopPage({ onProductClick, language: languageProp }: ShopPageProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { language: contextLanguage } = useLanguage();
  
  // Use language from context if available, otherwise use prop, otherwise default to 'en'
  const language = contextLanguage || languageProp || 'en';
  
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
  const [sortBy, setSortBy] = useState(t.shop.sortOptions.newest);

  // Update sortBy and clear filters when language changes to keep them in sync
  useEffect(() => {
    setSortBy(t.shop.sortOptions.newest);
    setActiveFilters({}); // Clear filters since filter keys are language-dependent
  }, [language, t.shop.sortOptions.newest]);
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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
      [t.shop.filterNames.category]: [t.shop.filterOptions.all, ...categories],
      [t.shop.filterNames.brand]: [t.shop.filterOptions.all, ...brands],
      [t.shop.filterNames.size]: [t.shop.filterOptions.all, ...sizes],
      [t.shop.filterNames.price]: [t.shop.filterOptions.all, t.shop.filterOptions.priceLowToHigh, t.shop.filterOptions.priceHighToLow],
    };
  };

  const filterOptions = getFilterOptions();

  const sortOptions = [
    t.shop.sortOptions.newest,
    t.shop.sortOptions.trending,
    t.shop.sortOptions.lowestPrice,
    t.shop.sortOptions.highestPrice,
    t.shop.sortOptions.highestRated
  ];

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/items`);
        
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
        

        // Filter items for shop page: show items with approval_status === 2 (Approved)
        const approvedItems = Array.isArray(items)
          ? items.filter((item: any) => item?.approval_status === 2)
          : [];

        const mappedProducts: Product[] = approvedItems.map((item: any) => {
          const rawImageUrl =
            item?.mainImage?.url ??
            item?.main_image?.url ??
            (Array.isArray(item?.images) && item.images.length > 0 ? item.images[0]?.url : '') ??
            item?.image_url ??
            item?.image ??
            '';
          const imageUrl = normalizeImageUrl(rawImageUrl);

          const sizeLabel =
            Array.isArray(item?.sizes) && item.sizes.length > 0
              ? item.sizes[0]?.label
              : 'One Size';

          return {
            id: item.id,
            title: item.name || 'Untitled Item',
            price: parseFloat(item.price) || 0,
            seller: item.user?.name || item.user?.email || 'Unknown Seller',
            sellerAvatar: item.user?.name?.charAt(0).toUpperCase() || 'U',
            image: imageUrl,
            tags: Array.isArray(item?.tags) ? item.tags.map((tag: any) => tag?.name || tag) : [],
            category: item.category?.name || 'Uncategorized',
            brand: item.brand?.name || 'Unknown',
            size: sizeLabel,
            condition: CONDITION_LABELS[item?.condition] || 'Good',
            description: item.description || '',
            apiData: item,
          };
        });

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
    const categoryFilterKey = t.shop.filterNames.category;
    if (activeFilters[categoryFilterKey] && activeFilters[categoryFilterKey] !== t.shop.filterOptions.all) {
      filtered = filtered.filter(product => 
        product.category === activeFilters[categoryFilterKey]
      );
    }

    // Apply Brand filter
    const brandFilterKey = t.shop.filterNames.brand;
    if (activeFilters[brandFilterKey] && activeFilters[brandFilterKey] !== t.shop.filterOptions.all) {
      filtered = filtered.filter(product => 
        product.brand === activeFilters[brandFilterKey]
      );
    }

    // Apply Size filter
    const sizeFilterKey = t.shop.filterNames.size;
    if (activeFilters[sizeFilterKey] && activeFilters[sizeFilterKey] !== t.shop.filterOptions.all) {
      filtered = filtered.filter(product => 
        product.size === activeFilters[sizeFilterKey] || 
        product.size?.toUpperCase() === activeFilters[sizeFilterKey].toUpperCase()
      );
    }

    // Apply sorting
    // Note: If Price filter is set, it will override the sort option for price sorting
    const priceFilterKey = t.shop.filterNames.price;
    const priceFilterActive = activeFilters[priceFilterKey] && activeFilters[priceFilterKey] !== t.shop.filterOptions.all;
    
    if (priceFilterActive) {
      // Price filter takes priority for price sorting
      if (activeFilters[priceFilterKey] === t.shop.filterOptions.priceLowToHigh) {
        filtered = filtered.sort((a, b) => a.price - b.price);
      } else if (activeFilters[priceFilterKey] === t.shop.filterOptions.priceHighToLow) {
        filtered = filtered.sort((a, b) => b.price - a.price);
      }
    } else {
      // Apply other sort options only if price filter is not active
      switch (sortBy) {
        case t.shop.sortOptions.newest:
          // Sort by ID descending (assuming higher ID = newer)
          filtered = filtered.sort((a, b) => b.id - a.id);
          break;
        case t.shop.sortOptions.lowestPrice:
          filtered = filtered.sort((a, b) => a.price - b.price);
          break;
        case t.shop.sortOptions.highestPrice:
          filtered = filtered.sort((a, b) => b.price - a.price);
          break;
        case t.shop.sortOptions.trending:
          // For now, sort by ID (can be enhanced with actual trending logic)
          filtered = filtered.sort((a, b) => b.id - a.id);
          break;
        case t.shop.sortOptions.highestRated:
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

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, sortBy]);

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
                              if (option === t.shop.filterOptions.all) {
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
          <div className="loading-placeholder">{t.shop.loading}</div>
        ) : (
          <>
            <div className="products-grid">
              {paginatedProducts.map((product, index) => (
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
                      <span className="view-details-text">{t.shop.viewDetails}</span>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: '3rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {(() => {
                      const pages: (number | 'ellipsis')[] = [];
                      
                      // Determine which pages to show
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Always show first page
                        pages.push(1);
                        
                        // Show ellipsis and selected pages
                        if (currentPage <= 3) {
                          // Near the start: 1 2 3 4 ... last
                          for (let i = 2; i <= 4; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          // Near the end: 1 ... (last-3) (last-2) (last-1) last
                          pages.push('ellipsis');
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // In the middle: 1 ... (current-1) current (current+1) ... last
                          pages.push('ellipsis');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis');
                          pages.push(totalPages);
                        }
                      }
                      
                      // Remove duplicates and render
                      const renderedPages: JSX.Element[] = [];
                      let lastItem: number | 'ellipsis' | null = null;
                      
                      pages.forEach((item, index) => {
                        // Skip duplicate ellipsis
                        if (item === 'ellipsis' && lastItem === 'ellipsis') {
                          return;
                        }
                        
                        if (item === 'ellipsis') {
                          renderedPages.push(
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          renderedPages.push(
                            <PaginationItem key={item}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(item);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                isActive={currentPage === item}
                              >
                                {item}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        
                        lastItem = item;
                      });
                      
                      return renderedPages;
                    })()}
                    
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Load More / Show Additional Info Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="load-more-wrap">
          <motion.button onClick={() => { setShowAdditionalInfo(!showAdditionalInfo); }} whileHover={{ backgroundColor: '#0A4834', color: '#FFFFFF' }} whileTap={{ scale: 0.98 }} className="toggle-info-btn">
            <Info size={18} />
            {showAdditionalInfo ? t.shop.hideAdditionalInfo : t.shop.showAdditionalInfo}
          </motion.button>

          {/* Additional Info Cards Display */}
          {showAdditionalInfo && products.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="additional-info-wrap">
              <h3 className="additional-info-title">{t.shop.additionalProductInfo}</h3>

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
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: '#9F8151', margin: '4px 0 0 0' }}>{t.shop.additionalInfo.id}: {product.id}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'Manrope, sans-serif', fontSize: 13 }}>
                      {product.apiData.description && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.description}:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.description}</span>
                        </div>
                      )}
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {product.apiData.brand_id && (
                          <div>
                            <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.brandId}:</strong>
                            <span style={{ color: '#0A4834' }}>{product.apiData.brand_id}</span>
                          </div>
                        )}
                        {product.apiData.category_id && (
                          <div>
                            <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.categoryId}:</strong>
                            <span style={{ color: '#0A4834' }}>{product.apiData.category_id}</span>
                          </div>
                        )}
                      </div>

                      {product.apiData.approval_status && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.approvalStatus}:</strong>
                          <span style={{ color: '#0A4834', backgroundColor: product.apiData.approval_status === 2 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                            {product.apiData.approval_status === 2 ? t.shop.approvalStatus.approved : t.shop.approvalStatus.pending}
                          </span>
                        </div>
                      )}

                      {product.apiData.brand && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.brand}:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.brand.name}</span>
                        </div>
                      )}

                      {product.apiData.category && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.category}:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.category.name}</span>
                        </div>
                      )}

                      {product.apiData.user && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.seller}:</strong>
                          <span style={{ color: '#0A4834' }}>{product.apiData.user.name || product.apiData.user.email}</span>
                        </div>
                      )}

                      {product.apiData.created_at && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 4 }}>{t.shop.additionalInfo.created}:</strong>
                          <span style={{ color: '#0A4834' }}>{new Date(product.apiData.created_at).toLocaleDateString()}</span>
                        </div>
                      )}

                      {product.image && (
                        <div>
                          <strong style={{ color: '#9F8151', display: 'block', marginBottom: 8 }}>{t.shop.additionalInfo.image}:</strong>
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

          <p className="bottom-cta-quote">"{t.shop.quote}"</p>
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