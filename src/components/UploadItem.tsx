import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../api/apiClient';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './styles/UploadItem.css';

interface UploadItemProps {
  onClose?: () => void | string;
}

interface LocalImage {
  file: File;
  previewUrl: string;
}

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';
const API_BASE_URL = `${API_ROOT}/api`;
const MAX_IMAGES = 6;

export function UploadItem({ onClose }: UploadItemProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<LocalImage[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id?: number; url: string; path?: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [brandLookup, setBrandLookup] = useState<Record<string, number>>({});
  const [categoryLookup, setCategoryLookup] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit mode state
  const editItemId = searchParams.get('edit');
  const isEditMode = !!editItemId;
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const pendingEditSizeRef = useRef<{ sizeId: string; sizeQuantity: string } | null>(null);

  // Database-fetched options for dropdowns
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ id: number; label: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [customSizeValue, setCustomSizeValue] = useState('');
  
  // Conditions are enum values per API documentation (ItemCondition)
  // 1=New, 2=Excellent, 3=Very Good, 4=Good, 5=Fair
  const conditions = [
    { id: 1, name: 'New' },
    { id: 2, name: 'Excellent' },
    { id: 3, name: 'Very Good' },
    { id: 4, name: 'Good' },
    { id: 5, name: 'Fair' },
  ];

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: '',
    sizeId: '', // Store size ID (not name)
    sizeQuantity: '1', // Quantity for the selected size
    condition: '',
    description: '',
    tags: '',
    sellingPrice: '',
    material: '',
    autoExpire: true,
  });

  // Fetch brands and categories from database
  // Note: Conditions are hardcoded enum values per API docs, sizes are fetched per category
  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        
        // Fetch brands and categories from API endpoints
        // NOTE: Sizes are fetched separately when category is selected
        // NOTE: Conditions are enum values (1-5), not from API
        const [brandsResponse, categoriesResponse] = await Promise.allSettled([
          apiClient.get('/brands'),
          apiClient.get('/categories'),
        ]);

        const brandMap = new Map<string, number>();
        const categoryMap = new Map<string, number>();
        let brandsCount = 0;
        let categoriesCount = 0;

        // Process brands
        if (brandsResponse.status === 'fulfilled' && brandsResponse.value?.data) {
          console.log('🔍 Brands API Response:', brandsResponse.value.data);
          
          let brandsData: any[] = [];
          
          // Handle various response formats from the API
          // API returns Collection of BrandResource (no pagination)
          if (brandsResponse.value.data.status === 'success' && Array.isArray(brandsResponse.value.data.data)) {
            brandsData = brandsResponse.value.data.data;
            console.log('✅ Using brands from data.data array, count:', brandsData.length);
          } else if (Array.isArray(brandsResponse.value.data)) {
            brandsData = brandsResponse.value.data;
            console.log('✅ Using brands from direct array, count:', brandsData.length);
          } else if (Array.isArray(brandsResponse.value.data?.data)) {
            brandsData = brandsResponse.value.data.data;
            console.log('✅ Using brands from nested data property, count:', brandsData.length);
          } else {
            console.warn('⚠️ Brands response format not recognized:', brandsResponse.value.data);
          }
          
          const formattedBrands = brandsData
            .filter((brand: any) => brand?.id && brand?.name)
            .map((brand: any) => {
              brandMap.set(brand.name, brand.id);
              brandMap.set(brand.name.toLowerCase(), brand.id);
              return { id: brand.id, name: brand.name };
            });
          
          brandsCount = formattedBrands.length;
          console.log('✅ Formatted brands:', formattedBrands.length);
          
          if (isMounted) {
            setBrands(formattedBrands);
          }
        } else if (brandsResponse.status === 'rejected') {
          console.error('❌ Failed to fetch brands:', brandsResponse.reason);
          // Check if it's a 500 error
          const error = brandsResponse.reason as any;
          if (error?.response?.status === 500) {
            console.error('❌ Backend /api/brands returned 500 Internal Server Error');
            console.error('❌ This is a backend issue. Check Laravel logs for details.');
          }
        } else {
          console.warn('⚠️ Brands response is empty or invalid');
        }

        // Process categories
        if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value?.data) {
          console.log('🔍 Categories API Response:', categoriesResponse.value.data);
          
          let categoriesData: any[] = [];
          
          // Prioritize the standard API format: { status: "success", count: 21, data: [...] }
          if (categoriesResponse.value.data.status === 'success' && Array.isArray(categoriesResponse.value.data.data)) {
            categoriesData = categoriesResponse.value.data.data;
            console.log('✅ Using categories from data.data array, count:', categoriesData.length);
          } else if (Array.isArray(categoriesResponse.value.data)) {
            categoriesData = categoriesResponse.value.data;
            console.log('✅ Using categories from direct array, count:', categoriesData.length);
          } else if (Array.isArray(categoriesResponse.value.data?.data)) {
            categoriesData = categoriesResponse.value.data.data;
            console.log('✅ Using categories from nested data property, count:', categoriesData.length);
          }
          
          const formattedCategories = categoriesData
            .filter((category: any) => category?.id && category?.name)
            .map((category: any) => {
              categoryMap.set(category.name, category.id);
              categoryMap.set(category.name.toLowerCase(), category.id);
              return { id: category.id, name: category.name };
            });
          
          categoriesCount = formattedCategories.length;
          console.log('✅ Formatted categories:', formattedCategories.length);
          
          if (isMounted) {
            setCategories(formattedCategories);
          }
        }

        // Also fetch items to build lookup maps as fallback
        try {
          const itemsResponse = await apiClient.get('/items');
          const payload = Array.isArray(itemsResponse.data)
            ? itemsResponse.data
            : Array.isArray(itemsResponse.data?.data)
              ? itemsResponse.data.data
              : [];

          payload.forEach((item: any) => {
            if (item?.brand?.id && item.brand.name) {
              const brandName = item.brand.name;
              if (!brandMap.has(brandName) && !brandMap.has(brandName.toLowerCase())) {
                brandMap.set(brandName, item.brand.id);
                brandMap.set(brandName.toLowerCase(), item.brand.id);
              }
            }
            if (item?.category?.id && item.category.name) {
              const categoryName = item.category.name;
              if (!categoryMap.has(categoryName) && !categoryMap.has(categoryName.toLowerCase())) {
                categoryMap.set(categoryName, item.category.id);
                categoryMap.set(categoryName.toLowerCase(), item.category.id);
              }
            }
          });
        } catch (error) {
          console.warn('Could not fetch items for lookup fallback:', error);
        }

        if (isMounted) {
          setBrandLookup(Object.fromEntries(brandMap));
          setCategoryLookup(Object.fromEntries(categoryMap));
          
          // Log what we found for debugging
          console.log('📋 Options loaded from database:', {
            brands: brandsCount,
            categories: categoriesCount,
            conditions: '5 (hardcoded enum)',
            note: 'Sizes will be loaded when category is selected'
          });
        }
      } catch (error) {
        console.error('Failed to fetch options from database:', error);
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch sizes when category is selected
  // Per API docs: GET /api/categories/{category}/sizes
  useEffect(() => {
    let isMounted = true;

    const fetchSizesForCategory = async () => {
      // Reset size selection and custom input when category changes
      setFormData(prev => ({ ...prev, sizeId: '', sizeQuantity: '1' }));
      setShowCustomSizeInput(false);
      setCustomSizeValue('');
      setSizes([]);

      // Check if category is selected
      if (!formData.category || !formData.category.trim()) {
        setSizes([]);
        setIsLoadingSizes(false);
        return;
      }

      // Check if categories are loaded
      if (categories.length === 0) {
        setIsLoadingSizes(false);
        return;
      }

      // Find category ID from the selected category name
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      
      if (!selectedCategory) {
        setSizes([]);
        setIsLoadingSizes(false);
        return;
      }

      try {
        setIsLoadingSizes(true);
        
        // Use the correct API endpoint: GET /api/categories/{category}/sizes
        console.log(`🔍 Fetching sizes for category ${selectedCategory.id}...`);
        const response = await apiClient.get(`/categories/${selectedCategory.id}/sizes`);

        // Handle response structure - API returns collection of SizeResource
        // SizeResource has: id, label, category (optional)
        let sizesData: any[] = [];
        
        // Check various response formats
        if (Array.isArray(response.data)) {
          sizesData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          sizesData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          // Try to extract from any structure
          const possibleData = response.data.data || response.data.sizes || [];
          if (Array.isArray(possibleData)) {
            sizesData = possibleData;
          }
        }

        console.log(`✅ Found ${sizesData.length} sizes for category ${selectedCategory.name}`);

        // Remove duplicates by label (same labels may appear multiple times)
        // Per API docs, SizeResource has: id, label
        const uniqueSizesMap = new Map<string, { id: number; label: string }>();
        sizesData.forEach((size: any) => {
          // API returns 'label' field per SizeResource
          const sizeLabel = size?.label || size?.name;
          
          if (size?.id && sizeLabel) {
            // Use label as key to deduplicate
            if (!uniqueSizesMap.has(sizeLabel)) {
              uniqueSizesMap.set(sizeLabel, { id: size.id, label: sizeLabel });
            }
          }
        });

        const formattedSizes = Array.from(uniqueSizesMap.values());
        console.log('📏 Available sizes:', formattedSizes.map(s => s.label).join(', '));

        if (isMounted) {
          setSizes(formattedSizes);
          
          // Apply pending edit size if we're in edit mode and have a stored size
          if (pendingEditSizeRef.current) {
            const { sizeId: pendingSizeId, sizeQuantity: pendingQuantity } = pendingEditSizeRef.current;
            // Verify the size exists in the loaded sizes
            const sizeExists = formattedSizes.some(s => String(s.id) === pendingSizeId);
            if (sizeExists) {
              console.log('✅ Applying pending edit size:', pendingSizeId);
              setFormData(prev => ({ 
                ...prev, 
                sizeId: pendingSizeId, 
                sizeQuantity: pendingQuantity 
              }));
            } else {
              console.warn('⚠️ Pending size ID not found in available sizes:', pendingSizeId);
            }
            pendingEditSizeRef.current = null; // Clear the ref
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch sizes for category:', error);
        console.error('Error response:', error?.response?.data);
        if (isMounted) {
          setSizes([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSizes(false);
        }
      }
    };

    fetchSizesForCategory();

    return () => {
      isMounted = false;
    };
  }, [formData.category, categories]);

  useEffect(() => {
    return () => {
      uploadedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [uploadedImages]);

  // Fetch item data when in edit mode
  useEffect(() => {
    if (!isEditMode || !editItemId || isLoadingOptions) return;

    let isMounted = true;

    const fetchItemForEditing = async () => {
      setIsLoadingItem(true);
      try {
        console.log('📝 Edit mode: Fetching item data for ID:', editItemId);
        
        // Try to fetch the item from /api/me/items/{id} first (user's own items)
        let itemData: any = null;
        try {
          const response = await apiClient.get(`/me/items/${editItemId}`);
          itemData = response.data?.data || response.data;
          console.log('✅ Fetched item from /me/items:', itemData);
        } catch (err: any) {
          // If that fails, try the general items endpoint
          console.log('⚠️ Could not fetch from /me/items, trying /items...');
          try {
            const response = await apiClient.get(`/items/${editItemId}`);
            itemData = response.data?.data || response.data;
            console.log('✅ Fetched item from /items:', itemData);
          } catch (err2) {
            console.error('❌ Failed to fetch item for editing:', err2);
            setSubmitError('Failed to load item for editing. Please try again.');
            return;
          }
        }

        if (!itemData || !isMounted) return;

        console.log('📋 Item data to pre-fill:', itemData);

        // Pre-fill form data
        const brandName = itemData.brand?.name || '';
        const categoryName = itemData.category?.name || '';
        
        // Get condition ID (could be object with id, or direct value)
        let conditionId = '';
        if (itemData.condition) {
          if (typeof itemData.condition === 'object' && itemData.condition.id) {
            conditionId = String(itemData.condition.id);
          } else if (typeof itemData.condition === 'number') {
            conditionId = String(itemData.condition);
          } else if (typeof itemData.condition === 'string') {
            conditionId = itemData.condition;
          }
        }

        // Get size information - handle different API response formats
        let sizeId = '';
        let sizeQuantity = '1';
        if (itemData.sizes && Array.isArray(itemData.sizes) && itemData.sizes.length > 0) {
          const firstSize = itemData.sizes[0];
          if (firstSize.id) {
            sizeId = String(firstSize.id);
          } else if (firstSize.pivot?.size_id) {
            sizeId = String(firstSize.pivot.size_id);
          }
          if (firstSize.pivot?.quantity) {
            sizeQuantity = String(firstSize.pivot.quantity);
          } else if (firstSize.quantity) {
            sizeQuantity = String(firstSize.quantity);
          }
        }

        // Get tags - could be array or comma-separated string
        let tagsString = '';
        if (itemData.tags) {
          if (Array.isArray(itemData.tags)) {
            tagsString = itemData.tags.map((t: any) => typeof t === 'object' ? t.name : t).join(', ');
          } else if (typeof itemData.tags === 'string') {
            tagsString = itemData.tags;
          }
        }

        // Store the size info in ref to apply after sizes load (since sizes effect resets sizeId)
        if (sizeId) {
          pendingEditSizeRef.current = { sizeId, sizeQuantity };
          console.log('📌 Stored pending size for edit:', { sizeId, sizeQuantity });
        }

        // Set form data (sizeId will be empty initially, applied after sizes load)
        setFormData({
          title: itemData.name || itemData.title || '',
          brand: brandName,
          category: categoryName,
          sizeId: '', // Will be set after sizes load
          sizeQuantity: '1', // Will be set after sizes load
          condition: conditionId,
          description: itemData.description || '',
          tags: tagsString,
          sellingPrice: itemData.price ? String(itemData.price) : '',
          material: itemData.material || '',
          autoExpire: true,
        });

        // Set existing images
        const images: Array<{ id?: number; url: string; path?: string }> = [];
        
        // Main image
        if (itemData.image_url) {
          images.push({ url: itemData.image_url, path: itemData.image });
        } else if (itemData.image) {
          images.push({ url: `${API_ROOT}/../storage/${itemData.image}`, path: itemData.image });
        }
        
        // Additional images
        if (itemData.images && Array.isArray(itemData.images)) {
          itemData.images.forEach((img: any) => {
            const imgUrl = img.url || img.image_url || (img.path ? `${API_ROOT}/../storage/${img.path}` : null);
            if (imgUrl && !images.some(i => i.url === imgUrl)) {
              images.push({ id: img.id, url: imgUrl, path: img.path });
            }
          });
        }

        if (isMounted) {
          setExistingImages(images);
          console.log('✅ Form pre-filled for editing:', {
            title: itemData.name || itemData.title,
            brand: brandName,
            category: categoryName,
            sizeId,
            condition: conditionId,
            price: itemData.price,
            existingImages: images.length,
          });
        }
      } catch (error) {
        console.error('❌ Error fetching item for edit:', error);
        if (isMounted) {
          setSubmitError('Failed to load item for editing.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingItem(false);
        }
      }
    };

    fetchItemForEditing();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, editItemId, isLoadingOptions]);

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
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      return;
    }

    setUploadedImages((prev) => {
      const slotsLeft = MAX_IMAGES - prev.length;
      if (slotsLeft <= 0) {
        return prev;
      }

      const nextBatch = imageFiles.slice(0, slotsLeft).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      return [...prev, ...nextBatch];
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      brand: '',
      category: '',
      sizeId: '',
      sizeQuantity: '1',
      condition: '',
      description: '',
      tags: '',
      sellingPrice: '',
      material: '',
      autoExpire: true,
    });
    setShowCustomSizeInput(false);
    setCustomSizeValue('');
    setSizes([]);
    setUploadedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
  };

  const handleRedirectAfterPublish = () => {
    const result = onClose?.();
    if (typeof result === 'string') {
      navigate(result);
      return;
    }

    if (!onClose) {
      navigate('/profile');
    }
  };

  const handlePublish = async () => {
    // Check if user is authenticated
    if (!user) {
      setSubmitError(t.upload.errors.mustBeLoggedIn);
      navigate('/login', { replace: true, state: { from: '/upload' } });
      return;
    }

    // Double-check token exists
    const token = typeof window !== 'undefined' 
      ? window.localStorage.getItem('auth_token') 
      : null;
    
    if (!token) {
      setSubmitError(t.upload.errors.tokenNotFound);
      navigate('/login', { replace: true, state: { from: '/upload' } });
      return;
    }

    const missingFields: string[] = [];
    if (!formData.title.trim()) missingFields.push('title');
    if (!formData.brand.trim()) missingFields.push('brand');
    if (!formData.category.trim()) missingFields.push('category');
    if (!formData.sizeId.trim()) missingFields.push('size');
    if (!formData.condition.trim()) missingFields.push('condition');
    if (!formData.sellingPrice.trim()) missingFields.push('selling price');
    // Images are required per API docs - but in edit mode, existing images count
    const totalImages = uploadedImages.length + existingImages.length;
    if (totalImages === 0) missingFields.push('at least one image');

    if (missingFields.length) {
      setSubmitError(t.upload.errors.missingFields.replace('{fields}', missingFields.join(', ')));
      return;
    }

    const priceValue = parseFloat(formData.sellingPrice);
    if (Number.isNaN(priceValue)) {
      setSubmitError(t.upload.errors.invalidPrice);
      return;
    }

    const tagsPayload = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    // Helper function to find or create brand/category ID
    // We MUST find/create the ID to avoid backend mass assignment errors
    const findOrCreateBrandCategoryId = async (name: string, type: 'brand' | 'category'): Promise<number | null> => {
      // First check lookup (case-insensitive)
      const lookup = type === 'brand' ? brandLookup : categoryLookup;
      const lookupKey = Object.keys(lookup).find(
        key => key.toLowerCase() === name.toLowerCase()
      );
      if (lookupKey && lookup[lookupKey]) {
        return lookup[lookupKey];
      }

      // Try to fetch from API to find existing
      try {
        const endpoint = type === 'brand' ? `${API_BASE_URL}/brands` : `${API_BASE_URL}/categories`;
        const response = await axios.get(endpoint, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        const items = Array.isArray(response.data) 
          ? response.data 
          : Array.isArray(response.data?.data) 
            ? response.data.data 
            : [];
        
        const found = items.find((item: any) => 
          item?.name?.toLowerCase() === name.toLowerCase()
        );
        
        if (found?.id) {
          // Update lookup for future use
          if (type === 'brand') {
            setBrandLookup(prev => ({ ...prev, [name]: found.id }));
          } else {
            setCategoryLookup(prev => ({ ...prev, [name]: found.id }));
          }
          return found.id;
        }

        // Not found - try to create it via API
        // This is critical to avoid sending names which cause backend mass assignment errors
        try {
          const createResponse = await axios.post(
            endpoint, 
            { name: name.trim() }, 
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
          
          const created = createResponse.data?.data || createResponse.data;
          if (created?.id) {
            // Update lookup
            if (type === 'brand') {
              setBrandLookup(prev => ({ ...prev, [name]: created.id }));
            } else {
              setCategoryLookup(prev => ({ ...prev, [name]: created.id }));
            }
            console.log(`✅ Created ${type} "${name}" with ID:`, created.id);
            return created.id;
          }
        } catch (createError: any) {
          // If creation fails, log the error but continue searching
          console.error(`❌ Failed to create ${type} "${name}" via API:`, createError?.response?.data || createError?.message);
          // Don't return null yet - try searching items first
        }
      } catch (error) {
        console.warn(`Could not fetch ${type}s from API:`, error);
      }

      // Last resort: search through all items to find the category/brand
      try {
        const itemsResponse = await apiClient.get('/items');
        const allItems = Array.isArray(itemsResponse.data)
          ? itemsResponse.data
          : Array.isArray(itemsResponse.data?.data)
            ? itemsResponse.data.data
            : [];
        
        for (const item of allItems) {
          const target = type === 'brand' ? item?.brand : item?.category;
          if (target?.name?.toLowerCase() === name.toLowerCase() && target?.id) {
            // Update lookup
            if (type === 'brand') {
              setBrandLookup(prev => ({ ...prev, [name]: target.id }));
            } else {
              setCategoryLookup(prev => ({ ...prev, [name]: target.id }));
            }
            return target.id;
          }
        }
      } catch (error) {
        console.warn('Could not search items for category/brand:', error);
      }

      // If we still can't find it, return null - we'll have to send the name
      // This might cause backend errors, but it's the best we can do
      return null;
    };

    // Find brand and category IDs (optional - backend accepts names too)
    // Check lookup case-insensitively
    const brandLookupKey = Object.keys(brandLookup).find(
      key => key.toLowerCase() === formData.brand.toLowerCase()
    );
    let brandId = brandLookupKey ? brandLookup[brandLookupKey] : null;

    const categoryLookupKey = Object.keys(categoryLookup).find(
      key => key.toLowerCase() === formData.category.toLowerCase()
    );
    let categoryId = categoryLookupKey ? categoryLookup[categoryLookupKey] : null;

    // Find condition ID from the selected condition
    // formData.condition now stores the ID directly (as string), so convert to integer
    let conditionId: number | null = null;
    if (formData.condition.trim()) {
      const parsedId = parseInt(formData.condition.trim(), 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        conditionId = parsedId;
      }
    }

    // If IDs not found in lookup, try to find or create them via API
    // This is CRITICAL to avoid backend mass assignment errors
    if (!brandId && formData.brand.trim()) {
      brandId = await findOrCreateBrandCategoryId(formData.brand.trim(), 'brand');
    }

    if (!categoryId && formData.category.trim()) {
      console.log('🔍 Category ID not found in lookup, searching...');
      categoryId = await findOrCreateBrandCategoryId(formData.category.trim(), 'category');
      
      // If we still don't have a category ID, this is a CRITICAL problem
      // The backend will try to create it and hit the mass assignment error
      // We MUST have an ID - never send names
      if (!categoryId) {
        console.error('❌ CRITICAL: Could not find or create category ID for:', formData.category);
        console.error('Current category lookup:', categoryLookup);
        setSubmitError(`Unable to resolve category "${formData.category}" to an ID. The category may not exist in the database. Please contact support or try selecting a different category.`);
        setIsSubmitting(false);
        return;
      }
      console.log('✅ Category ID resolved:', categoryId);
    } else if (categoryId) {
      console.log('✅ Category ID found in lookup:', categoryId);
    }

    // Build FormData payload with all item fields
    // Per API docs for POST /api/me/items
    const payload = new FormData();
    
    // Required fields per API documentation:
    // - name (string, required, min 3, max 255)
    // - price (number, required, min 1)
    // - condition (required) — ItemCondition enum value: 1|2|3|4|5
    // - approval_status (required) — ItemApprovalStatus: 1|2|3
    // - category_id (integer, required)
    // - brand_id (integer, required)
    // - sizes (array, required, min 1 item) - each: { id, quantity }
    // - images (array of files, required)
    
    payload.append('name', formData.title.trim());
    payload.append('price', priceValue.toString());
    
    // Handle brand_id: Required per API docs
    if (brandId) {
      payload.append('brand_id', String(brandId));
    } else {
      // Brand is required - show error
      setSubmitError('Brand must be selected. Please choose a brand from the list.');
      setIsSubmitting(false);
      return;
    }

    // Handle category_id: Required - MUST be an ID
    if (categoryId && typeof categoryId === 'number') {
      payload.append('category_id', String(categoryId));
      console.log('📤 Sending category_id:', categoryId);
    } else {
      console.error('❌ CRITICAL: No valid category_id!', { categoryId, categoryName: formData.category });
      setSubmitError(`Critical error: Could not resolve category "${formData.category}" to a valid ID.`);
      setIsSubmitting(false);
      return;
    }
    
    // Handle condition: Required, must be integer 1-5 (ItemCondition enum)
    if (conditionId !== null && !isNaN(conditionId) && conditionId >= 1 && conditionId <= 5) {
      payload.append('condition', String(conditionId));
      console.log('📤 Sending condition:', conditionId);
    } else {
      console.error('❌ Invalid condition:', formData.condition);
      setSubmitError('Please select a valid condition.');
      setIsSubmitting(false);
      return;
    }
    
    // approval_status: Required per API docs
    // 1 = Pending, 2 = Approved, 3 = Rejected
    // New items should be Pending (1)
    payload.append('approval_status', '1');
    console.log('📤 Sending approval_status: 1 (Pending)');
    
    // sizes: Required array with { id, quantity }
    // Per API docs: sizes (array, required, min 1 item). Each element: { id, quantity }
    const sizeId = parseInt(formData.sizeId, 10);
    const sizeQuantity = parseInt(formData.sizeQuantity, 10) || 1;
    
    if (!sizeId || isNaN(sizeId)) {
      setSubmitError('Please select a valid size.');
      setIsSubmitting(false);
      return;
    }
    
    // Send sizes as array - backend expects sizes[0][id] and sizes[0][quantity] format for FormData
    payload.append('sizes[0][id]', String(sizeId));
    payload.append('sizes[0][quantity]', String(sizeQuantity));
    console.log('📤 Sending sizes:', [{ id: sizeId, quantity: sizeQuantity }]);
    
    // Optional fields
    if (formData.description.trim()) {
      payload.append('description', formData.description.trim());
    }
    
    if (formData.material.trim()) {
      payload.append('material', formData.material.trim());
    }
    
    // Location field (optional per docs)
    // payload.append('location', '');

    // Tags array (optional)
    if (tagsPayload.length > 0) {
      tagsPayload.forEach((tag) => {
        if (tag.trim()) {
          payload.append('tags[]', tag.trim());
        }
      });
    }
    
    // Images: Required array of files
    // Per API docs: images (array of files, required). Each file: image, mimes: jpg, webp, jpeg, png
    uploadedImages.forEach((img, index) => {
      payload.append('images[]', img.file);
      console.log(`📤 Sending image ${index + 1}:`, img.file.name);
    });

    // Final validation: Ensure category_id is a valid number
    if (!categoryId || typeof categoryId !== 'number' || isNaN(categoryId)) {
      console.error('❌ CRITICAL VALIDATION FAILED: category_id is not a valid number!', {
        categoryId,
        type: typeof categoryId,
        categoryName: formData.category
      });
      setSubmitError(`Critical validation error: Category ID is invalid. Please try again or contact support.`);
      setIsSubmitting(false);
      return;
    }

    // Debug: Log what we're sending (without files for readability)
    const conditionName = conditionId 
      ? conditions.find(c => c.id === conditionId)?.name || 'Unknown'
      : null;
    const selectedSizeLabel = sizes.find(s => s.id === sizeId)?.label || 'Unknown';
    console.log('📤 Sending item data to backend:', {
      name: formData.title,
      description: formData.description ? formData.description.substring(0, 50) + '...' : '(not set)',
      price: priceValue,
      brand_id: brandId,
      category_id: categoryId,
      sizes: [{ id: sizeId, quantity: sizeQuantity, label: selectedSizeLabel }],
      condition: `${conditionId} (${conditionName})`,
      approval_status: '1 (Pending)',
      material: formData.material || '(not set)',
      tags_count: tagsPayload.length,
      images_count: uploadedImages.length,
    });
    
    // Log FormData contents for debugging
    console.log('📤 FormData contents:');
    for (const [key, value] of payload.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // FINAL SAFETY CHECK: Verify we're sending an ID, not a name
    // This prevents the backend mass assignment error
    const categoryIdValue = payload.get('category_id');
    if (!categoryIdValue || isNaN(Number(categoryIdValue))) {
      console.error('❌ FINAL CHECK FAILED: category_id is not a valid number!', {
        value: categoryIdValue,
        type: typeof categoryIdValue,
        categoryName: formData.category
      });
      setSubmitError(`Validation failed: Category must be resolved to an ID. Current value: "${categoryIdValue}". Please try again.`);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get CSRF cookie first - required for Sanctum SPA authentication
      console.log('🔐 Getting CSRF cookie...');
      await axios.get(`${API_ROOT}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Log what we're sending (for debugging)
      console.log('📤 Preparing to send item data:', {
        name: formData.title, // Database uses 'name' field
        price: priceValue,
        brand_id: brandId,
        category_id: categoryId,
        main_image: uploadedImages.length > 0 ? 'yes' : 'no',
        existing_images: existingImages.length,
        additional_images: uploadedImages.length > 1 ? uploadedImages.length - 1 : 0,
        has_token: !!token,
        isEditMode: isEditMode,
        editItemId: editItemId,
      });

      let response;
      
      if (isEditMode && editItemId) {
        // UPDATE existing item with PUT request
        // Note: For Laravel, we need to use POST with _method=PUT for FormData
        payload.append('_method', 'PUT');
        
        // Include existing image paths to keep them
        existingImages.forEach((img, index) => {
          if (img.path) {
            payload.append(`keep_images[${index}]`, img.path);
          }
        });
        
        console.log('📡 Sending PUT request (via POST with _method) to:', `${API_BASE_URL}/me/items/${editItemId}`);
        response = await apiClient.post(`/me/items/${editItemId}`, payload, {
          headers: {
            // Don't set Content-Type - let browser set it automatically for FormData with boundary
          },
        });
      } else {
        // CREATE new item with POST request
        console.log('📡 Sending POST request to:', `${API_BASE_URL}/me/items`);
        response = await apiClient.post('/me/items', payload, {
          headers: {
            // Don't set Content-Type - let browser set it automatically for FormData with boundary
          },
        });
      }

      // CRITICAL: Verify the response status code (should be 201 Created)
      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}. Expected 201 or 200.`);
      }

      // Log full response for debugging
      console.log('✅ Response data:', response.data);
      console.log('✅ Response data type:', typeof response.data);
      console.log('✅ Response data keys:', response.data ? Object.keys(response.data) : 'no data');
      console.log('✅ Full response JSON:', JSON.stringify(response.data, null, 2));

      // Extract the created item from response (handle different response formats)
      // Backend might return: { data: {...} } or just {...} or { item: {...} }
      const createdItem = response.data?.data || response.data?.item || response.data;
      
      // CRITICAL: Log image data from response
      // Per API docs: response includes 'image' (path), 'image_url' (full URL), and 'images' (array)
      console.log('🖼️ IMAGE DEBUG - Checking images in response:');
      console.log('🖼️ Created item image (path):', createdItem?.image);
      console.log('🖼️ Created item image_url (full URL):', createdItem?.image_url);
      console.log('🖼️ Created item images (array):', createdItem?.images);
      console.log('🖼️ Created item name:', createdItem?.name);
      console.log('🖼️ Created item title:', createdItem?.title);
      
      // Use image_url if available (per API docs), otherwise construct from image path
      if (createdItem?.image_url) {
        console.log('✅ Using image_url from response:', createdItem.image_url);
      } else if (createdItem?.image) {
        console.log('⚠️ No image_url, constructing from image path:', `${API_ROOT}/storage/${createdItem.image}`);
      } else {
        console.warn('⚠️ No image or image_url field in response!');
        console.warn('⚠️ Created item keys:', Object.keys(createdItem || {}));
      }
      
      // CRITICAL: Verify the item was actually created by checking for an ID
      if (!createdItem) {
        console.error('❌ No item data in response!', response.data);
        throw new Error('Response does not contain item data. Item may not have been created.');
      }

      // Look for ID in multiple possible locations
      const itemId = createdItem.id || createdItem.item_id || createdItem.ID || createdItem.Id;
      
      if (!itemId) {
        console.error('❌ Created item missing ID!');
        console.error('❌ Full created item object:', createdItem);
        console.error('❌ Created item keys:', Object.keys(createdItem));
        setSubmitError(
          '⚠️ WARNING: Item creation response was unexpected. ' +
          'The item may not have been saved to the database. ' +
          'Please check your backend logs and database. ' +
          'Response format: ' + JSON.stringify(createdItem).substring(0, 200) + '...'
        );
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ Item created successfully with ID:', itemId);
      console.log('✅ Full created item:', createdItem);

      // Optional verification: Try to fetch the item back
      // NOTE: This may fail if the GET endpoint filters pending items, but that's OK
      // The item was successfully created if we got here with a valid ID
      if (itemId) {
        // Add a small delay in case of database transaction timing issues
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          console.log('🔍 Optional verification: Trying to fetch item back...');
          const verifyResponse = await apiClient.get(`/items/${itemId}`);
          const verifiedItem = verifyResponse.data?.data || verifyResponse.data;
          const approvedStatus = verifiedItem?.approved;
          console.log('✅ Verification successful - item exists in database:', {
            id: verifiedItem?.id,
            name: verifiedItem?.name || verifiedItem?.title,
            approved: approvedStatus,
            note: approvedStatus === 1 
              ? 'Item is pending approval and may not be visible to others'
              : 'Item is approved and visible on shop page'
          });
        } catch (verifyError: any) {
          // Verification failed, but that's OK - item creation was successful
          // This can happen if GET endpoints filter pending items
          console.warn('⚠️ Verification failed (this is OK if item is pending approval):', {
            status: verifyError?.response?.status,
            message: verifyError?.message,
            itemId: itemId,
            note: 'Item was successfully created. Verification failure may be due to access control filtering pending items.'
          });
          // Don't show error to user - item creation was successful
        }
      }

      resetForm();
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        handleRedirectAfterPublish();
      }, 4000);
    } catch (error: any) {
      console.error('❌ Failed to publish item');
      console.error('Error object:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      console.error('Error response status:', error?.response?.status);
      console.error('Error message:', error?.message);
      
      // Handle network errors (no response)
      if (!error.response) {
        console.error('❌ Network error - no response received');
        setSubmitError(t.upload.errors.networkError);
        return;
      }

      const status = error.response.status;
      console.error('❌ HTTP Error Status:', status);

      // Handle authentication errors specifically
      if (status === 401 || status === 403) {
        console.error('❌ Authentication error');
        setSubmitError(t.upload.errors.authFailed);
        // Clear invalid token
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('auth_token');
        }
        setTimeout(() => {
          navigate('/login', { state: { from: '/upload' } });
        }, 2000);
        return;
      }
      
      // Handle validation errors
      if (status === 422) {
        console.error('❌ Validation error');
        console.error('❌ Full error response:', error?.response?.data);
        const validationErrors = error?.response?.data?.errors;
        console.error('❌ Validation errors object:', validationErrors);
        
        if (validationErrors) {
          // Log each validation error in detail
          Object.entries(validationErrors).forEach(([field, messages]: [string, any]) => {
            console.error(`❌ Field "${field}":`, messages);
          });
          
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          setSubmitError(`${t.upload.errors.validationErrors}\n${errorMessages}\n\nPlease check the browser console for more details.`);
        } else {
          console.error('❌ No validation errors object found in response');
          console.error('❌ Response data:', error?.response?.data);
          setSubmitError(error?.response?.data?.message || t.upload.errors.failedToPublish);
        }
        return;
      }

      // Handle server errors (500, 502, 503, etc.)
      if (status >= 500) {
        console.error('❌ Server error');
        const errorData = error?.response?.data;
        const errorMessage = errorData?.message || error?.message || 'Unknown server error';
        const sqlError = errorData?.error || '';
        
        console.error('❌ Full error response:', errorData);
        console.error('❌ SQL Error (if any):', sqlError);
        
        // Check if it's a database schema error
        if (sqlError && sqlError.includes('table items')) {
          console.error('❌ DATABASE SCHEMA ERROR DETECTED!');
          console.error('❌ This usually means a column mismatch between what we send and what the database expects.');
          console.error('❌ Check: Are we sending fields that don\'t exist in the database?');
        }
        
        setSubmitError(
          `${t.upload.errors.serverError}\n\n` +
          `Error: ${errorMessage}\n\n` +
          (sqlError ? `SQL Error: ${sqlError.substring(0, 200)}...\n\n` : '') +
          'This is likely a backend database schema issue. Please check:\n' +
          '1. Backend Laravel logs for full error details\n' +
          '2. Database schema matches what the backend expects\n' +
          '3. All required fields are being sent correctly'
        );
        return;
      }
      
      // Handle 404 (endpoint not found)
      if (status === 404) {
        console.error('❌ Endpoint not found');
        setSubmitError(t.upload.errors.endpointNotFound);
        return;
      }

      // Generic error message with full details
      const errorData = error?.response?.data;
      const errorMessage = errorData?.message || error?.message || 'Unknown error occurred';
      const errorDetails = errorData?.errors 
        ? '\n\nValidation errors:\n' + JSON.stringify(errorData.errors, null, 2)
        : '';
      
      console.error('❌ Unexpected error:', {
        status,
        message: errorMessage,
        data: errorData,
      });

      setSubmitError(
        `${t.upload.errors.failedToPublish} (Status: ${status}):\n${errorMessage}${errorDetails}\n\n` +
        'Please check the browser console for more details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-item-container">
      <HeaderAlt />

      <div className="upload-item-content">
        {/* Header */}
        <div className="upload-item-header">
          <h1 className="upload-item-title">
            {isEditMode ? (language === 'mk' ? 'Уреди артикл' : 'Edit Item') : t.upload.title}
          </h1>
          <p className="upload-item-subtitle">
            {isEditMode 
              ? (language === 'mk' ? 'Ажурирајте ги деталите за вашиот артикл' : 'Update the details of your item')
              : t.upload.subtitle}
          </p>
          {isLoadingItem && (
            <p style={{ color: '#9F8151', fontSize: '14px', marginTop: '8px' }}>
              {language === 'mk' ? 'Се вчитува артиклот...' : 'Loading item data...'}
            </p>
          )}
        </div>

        {/* Photo Upload Section */}
        <section className="upload-section">
          <h2 className="upload-section-title">
            {t.upload.photos}
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          >
            <Upload size={48} color="#0A4834" className="upload-icon" />
            <p className="upload-dropzone-text">
              {t.upload.dragDrop}
            </p>
            <p className="upload-dropzone-hint">
              {t.upload.dragDropHint}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="upload-file-input"
          />

          {/* Image Thumbnails - Show existing images and newly uploaded images */}
          {(existingImages.length > 0 || uploadedImages.length > 0) && (
            <div className="upload-images-grid">
              {/* Existing images from server (in edit mode) */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="upload-image-thumbnail" style={{ position: 'relative' }}>
                  <ImageWithFallback
                    src={img.url}
                    alt={`Existing ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    background: 'rgba(10, 72, 52, 0.8)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {language === 'mk' ? 'Постоечка' : 'Existing'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExistingImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="upload-image-remove-btn"
                  >
                    <X size={16} color="#000000" />
                  </button>
                </div>
              ))}
              {/* Newly uploaded images */}
              {uploadedImages.map((img, index) => (
                <div key={`new-${index}`} className="upload-image-thumbnail">
                  <ImageWithFallback
                    src={img.previewUrl}
                    alt={`Upload ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="upload-image-remove-btn"
                  >
                    <X size={16} color="#000000" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Item Details Section */}
        <section className="upload-section">
          <h2 className="upload-section-title">
            {t.upload.details}
          </h2>
          <div className="upload-form-container">
            {/* Title */}
            <div className="upload-form-field-full">
              <label className="upload-form-label">
                {t.upload.itemName} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t.upload.itemNamePlaceholder}
                className="upload-form-input"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="upload-form-label">
                {t.upload.brand} *
                {!isLoadingOptions && brands.length === 0 && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginLeft: '8px' }}>
                    (Failed to load - check backend)
                  </span>
                )}
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="upload-form-select"
                disabled={isLoadingOptions}
              >
                <option value="">{t.upload.brandPlaceholder}</option>
                {isLoadingOptions ? (
                  <option value="" disabled>{t.upload.loadingBrands}</option>
                ) : brands.length > 0 ? (
                  brands.map(brand => (
                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Error loading brands - backend returned 500</option>
                )}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="upload-form-label">
                {t.upload.category} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="upload-form-select"
              >
                <option value="">{t.upload.categoryPlaceholder}</option>
                {isLoadingOptions ? (
                  <option value="">{t.upload.loadingCategories}</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="upload-form-label">
                {t.upload.size} *
              </label>
              {!formData.category ? (
                <select
                  className="upload-form-select"
                  disabled
                >
                  <option value="">Please select a category first</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <select
                    value={formData.sizeId}
                    onChange={(e) => {
                      setFormData({ ...formData, sizeId: e.target.value });
                    }}
                    className="upload-form-select"
                    style={{ flex: 1 }}
                    disabled={isLoadingSizes}
                  >
                    <option value="">{t.upload.sizePlaceholder}</option>
                    {isLoadingSizes ? (
                      <option value="" disabled>{t.upload.loadingSizes}</option>
                    ) : sizes.length > 0 ? (
                      sizes.map(size => (
                        <option key={size.id} value={String(size.id)}>{size.label}</option>
                      ))
                    ) : (
                      <option value="" disabled>No sizes available for this category</option>
                    )}
                  </select>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className="upload-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sizeQuantity}
                      onChange={(e) => setFormData({ ...formData, sizeQuantity: e.target.value })}
                      className="upload-form-input"
                      style={{ width: '70px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="upload-form-label">
                {t.upload.condition} *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="upload-form-select"
              >
                <option value="">{t.upload.conditionPlaceholder}</option>
                {isLoadingOptions ? (
                  <option value="">{t.upload.loadingConditions}</option>
                ) : conditions.length > 0 ? (
                  conditions.map(cond => (
                    <option key={cond.id} value={String(cond.id)}>{cond.name}</option>
                  ))
                ) : (
                  <option value="" disabled>{t.upload.noConditionsAvailable}</option>
                )}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="upload-form-label">
                {t.upload.material}
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder={t.upload.materialPlaceholder}
                className="upload-form-input"
              />
            </div>

            {/* Description */}
            <div className="upload-form-field-full">
              <label className="upload-form-label">
                {t.upload.description}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.upload.descriptionPlaceholder}
                rows={4}
                className="upload-form-textarea"
              />
            </div>

            {/* Tags */}
            <div className="upload-form-field-full">
              <label className="upload-form-label">
                {t.upload.tags}
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder={t.upload.tagsPlaceholder}
                className="upload-form-input"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="upload-section">
          <h2 className="upload-section-title">
            {t.upload.pricing}
          </h2>

          <div className="upload-pricing-container">
            <div className="upload-price-wrapper">
              <label className="upload-form-label">
                {t.upload.price} *
              </label>
              <div className="upload-price-input-wrapper">
                <span className="upload-price-symbol">
                  €
                </span>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder={t.upload.pricePlaceholder}
                  className="upload-price-input"
                />
              </div>
            </div>

            {/* Auto-expire toggle */}
            <div className="upload-auto-expire">
              <input
                type="checkbox"
                id="autoExpire"
                checked={formData.autoExpire}
                onChange={(e) => setFormData({ ...formData, autoExpire: e.target.checked })}
                className="upload-auto-expire-checkbox"
              />
              <label htmlFor="autoExpire" className="upload-auto-expire-label">
                {t.upload.autoExpire}
                <span className="upload-auto-expire-hint">
                  {t.upload.autoExpireHint}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Inline Preview */}
        <section className="upload-section">
          <h2 className="upload-section-title">
            {t.upload.preview}
          </h2>

          <div className="upload-preview-container">
            {uploadedImages.length > 0 ? (
              <div className="upload-preview-image">
                <ImageWithFallback
                  src={uploadedImages[0].previewUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : existingImages.length > 0 ? (
              <div className="upload-preview-image">
                <ImageWithFallback
                  src={existingImages[0].url}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div className="upload-preview-placeholder">
                <ImageIcon size={48} color="#00000020" />
              </div>
            )}

            <h3 className="upload-preview-title">
              {formData.title || t.upload.itemTitle}
            </h3>

            <p className="upload-preview-text">
              {formData.brand || t.upload.brand} • {formData.condition 
                ? (conditions.find(c => String(c.id) === formData.condition)?.name || formData.condition)
                : t.upload.condition}
            </p>
            <p className="upload-preview-text-small">
              {formData.material ? `${t.upload.material}: ${formData.material}` : t.upload.materialAddDetails}
            </p>

            <p className="upload-preview-price">
              {formData.sellingPrice ? `€${formData.sellingPrice}` : '€0.00'}
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="upload-actions-container">
          {submitError && (
            <div className="upload-error-message">
              {submitError}
            </div>
          )}
        </div>
        <div className="upload-buttons">
          <button
            onClick={handlePublish}
            disabled={isSubmitting || isLoadingItem}
            className="upload-button-primary"
            aria-busy={isSubmitting}
          >
            {isSubmitting 
              ? (isEditMode 
                  ? (language === 'mk' ? 'Се ажурира...' : 'Updating...') 
                  : t.upload.publishing)
              : (isEditMode 
                  ? (language === 'mk' ? 'Зачувај промени' : 'Save Changes') 
                  : t.upload.publish)}
          </button>

          <button 
            className="upload-button-secondary"
            onClick={() => navigate('/profile')}
          >
            {language === 'mk' ? 'Откажи' : 'Cancel'}
          </button>
        </div>
      </div>

      <FooterAlt />

      {/* Success Toast Notification */}
      {showToast && (
        <div className="upload-toast-overlay">
          <div className="upload-toast-success">
            <div className="upload-toast-icon">
              <Check size={32} />
            </div>
            <h3 className="upload-toast-title">
              {language === 'mk' ? 'Успешно!' : 'Success!'}
            </h3>
            <p className="upload-toast-message">
              {isEditMode 
                ? (language === 'mk' ? 'Артиклот е успешно ажуриран!' : 'Item updated successfully!')
                : t.upload.itemSavedSuccess}
            </p>
            <p className="upload-toast-submessage">
              {language === 'mk' 
                ? 'Ве пренасочуваме...' 
                : 'Redirecting you now...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
