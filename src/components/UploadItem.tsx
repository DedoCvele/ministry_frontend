import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeaderAlt } from './HeaderAlt';
import { FooterAlt } from './FooterAlt';
import { getTranslation } from '../translations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<LocalImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [brandLookup, setBrandLookup] = useState<Record<string, number>>({});
  const [categoryLookup, setCategoryLookup] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database-fetched options for dropdowns
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ id: number; name: string }>>([]);
  const [conditions, setConditions] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

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
    material: '',
    autoExpire: true,
  });

  // Fetch brands, categories, and conditions from database
  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        
        // Fetch brands, categories, sizes, and conditions from API endpoints
        const [brandsResponse, categoriesResponse, sizesResponse, conditionsResponse] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/brands`),
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/sizes`),
          axios.get(`${API_BASE_URL}/conditions`),
        ]);

        const brandMap = new Map<string, number>();
        const categoryMap = new Map<string, number>();
        let brandsCount = 0;
        let categoriesCount = 0;
        let sizesCount = 0;
        let conditionsCount = 0;

        // Process brands
        if (brandsResponse.status === 'fulfilled' && brandsResponse.value?.data) {
          const brandsData = Array.isArray(brandsResponse.value.data) 
            ? brandsResponse.value.data 
            : Array.isArray(brandsResponse.value.data?.data) 
              ? brandsResponse.value.data.data 
              : [];
          
          const formattedBrands = brandsData
            .filter((brand: any) => brand?.id && brand?.name)
            .map((brand: any) => {
              brandMap.set(brand.name, brand.id);
              brandMap.set(brand.name.toLowerCase(), brand.id);
              return { id: brand.id, name: brand.name };
            });
          
          brandsCount = formattedBrands.length;
          
          if (isMounted) {
            setBrands(formattedBrands);
          }
        }

        // Process categories
        if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value?.data) {
          const categoriesData = Array.isArray(categoriesResponse.value.data) 
            ? categoriesResponse.value.data 
            : Array.isArray(categoriesResponse.value.data?.data) 
              ? categoriesResponse.value.data.data 
              : [];
          
          const formattedCategories = categoriesData
            .filter((category: any) => category?.id && category?.name)
            .map((category: any) => {
              categoryMap.set(category.name, category.id);
              categoryMap.set(category.name.toLowerCase(), category.id);
              return { id: category.id, name: category.name };
            });
          
          categoriesCount = formattedCategories.length;
          
          if (isMounted) {
            setCategories(formattedCategories);
          }
        }

        // Process sizes
        if (sizesResponse.status === 'fulfilled' && sizesResponse.value?.data) {
          const sizesData = Array.isArray(sizesResponse.value.data) 
            ? sizesResponse.value.data 
            : Array.isArray(sizesResponse.value.data?.data) 
              ? sizesResponse.value.data.data 
              : [];
          
          const formattedSizes = sizesData
            .filter((size: any) => size?.id && size?.name)
            .map((size: any) => ({ id: size.id, name: size.name }));
          
          sizesCount = formattedSizes.length;
          
          if (isMounted) {
            setSizes(formattedSizes);
          }
        }

        // Process conditions
        if (conditionsResponse.status === 'fulfilled' && conditionsResponse.value?.data) {
          console.log('🔍 Conditions API Response:', conditionsResponse.value.data);
          
          const conditionsData = Array.isArray(conditionsResponse.value.data) 
            ? conditionsResponse.value.data 
            : Array.isArray(conditionsResponse.value.data?.data) 
              ? conditionsResponse.value.data.data 
              : [];
          
          console.log('🔍 Processed conditions data:', conditionsData);
          
          // Handle different response formats:
          // 1. Array of objects with id and name: [{ id: 1, name: "New" }, ...]
          // 2. Array of strings: ["New", "Excellent", ...]
          // 3. Object with data property: { data: [...] }
          const formattedConditions = conditionsData
            .map((condition: any) => {
              // If it's already an object with id and name
              if (condition?.id && condition?.name) {
                return { id: condition.id, name: condition.name };
              }
              // If it's a string, create an object with the string as both id and name
              if (typeof condition === 'string') {
                return { id: condition, name: condition };
              }
              // If it's an object but might have different structure
              if (typeof condition === 'object' && condition !== null) {
                // Try to find name or value property
                const name = condition.name || condition.value || condition.condition || String(condition);
                const id = condition.id || condition.value || name;
                return { id, name };
              }
              return null;
            })
            .filter((condition: any) => condition !== null && condition.name);
          
          conditionsCount = formattedConditions.length;
          
          console.log('✅ Formatted conditions:', formattedConditions);
          
          if (isMounted) {
            setConditions(formattedConditions);
          }
        } else if (conditionsResponse.status === 'rejected') {
          console.error('❌ Failed to fetch conditions:', conditionsResponse.reason);
        } else {
          console.warn('⚠️ Conditions response is not in expected format:', conditionsResponse);
        }

        // Also fetch items to build lookup maps as fallback
        try {
          const itemsResponse = await axios.get(`${API_BASE_URL}/items`);
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
            sizes: sizesCount,
            conditions: conditionsCount
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

  useEffect(() => {
    return () => {
      uploadedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [uploadedImages]);

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
      size: '',
      condition: '',
      description: '',
      tags: '',
      sellingPrice: '',
      material: '',
      autoExpire: true,
    });
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
    if (!formData.size.trim()) missingFields.push('size');
    if (!formData.condition.trim()) missingFields.push('condition');
    if (!formData.description.trim()) missingFields.push('description');
    if (!formData.sellingPrice.trim()) missingFields.push('selling price');

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
        const itemsResponse = await axios.get(`${API_BASE_URL}/items`);
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
    // All field names must match what the backend Item model expects
    const payload = new FormData();
    
    // Required fields for Item model
    // Database uses 'name' field - send 'name' to match database schema
    // (Backend API docs say either 'title' or 'name' works, but database has 'name')
    payload.append('name', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('price', priceValue.toString());
    
    // Handle brand_id: Optional - only send if we have an ID
    // Don't send names to avoid backend mass assignment errors
    if (brandId) {
      // Send ID if we found it
      payload.append('brand_id', String(brandId));
    }
    // If no brand ID found, don't send brand_id at all (backend will set it to null)
    // Brand is optional, so this is acceptable

    // Handle category_id: Required - MUST be an ID (never send names to avoid backend errors)
    // We already tried to find/create it above, so categoryId should exist
    if (categoryId && typeof categoryId === 'number') {
      // Send ID as string - this is what backend expects
      payload.append('category_id', String(categoryId));
      console.log('📤 Sending category_id as ID:', categoryId);
    } else {
      // This should not happen - we already checked above and showed error
      // But add a final safety check to prevent sending names
      console.error('❌ CRITICAL: Attempted to send category without valid ID!', {
        categoryId,
        categoryName: formData.category,
        type: typeof categoryId
      });
      setSubmitError(`Critical error: Could not resolve category "${formData.category}" to a valid ID. Please try again or contact support.`);
      setIsSubmitting(false);
      return;
    }
    
    // Optional fields for Item model (only send if they have values)
    if (formData.size.trim()) {
      payload.append('size', formData.size.trim());
    }
    
    if (formData.condition.trim()) {
      payload.append('condition', formData.condition.trim());
    }
    
    if (formData.material.trim()) {
      payload.append('material', formData.material.trim());
    }
    
    // Note: auto_expire is not in the database schema, so we don't send it
    // If you need this feature, add it to the database schema first

    // Tags array (only send if there are tags)
    // Backend should handle tags[] array
    if (tagsPayload.length > 0) {
      tagsPayload.forEach((tag) => {
        if (tag.trim()) {
          payload.append('tags[]', tag.trim());
        }
      });
    }
    
    // Image uploads - per API docs (RECOMMENDED WAY):
    // - 'images[]' (array) = all images - the first image is automatically set as the main image
    // This is the recommended approach per API documentation
    if (uploadedImages.length > 0) {
      // Send all images via images[] array - recommended way per API docs
      // The first image will automatically be set as the main image (is_main = true)
      uploadedImages.forEach((img, index) => {
        payload.append('images[]', img.file);
        console.log(`📤 Sending image ${index + 1}${index === 0 ? ' (main)' : ''}:`, img.file.name);
      });
    }

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
    console.log('📤 Sending item data to backend:', {
      name: formData.title, // Database uses 'name' field
      description: formData.description.substring(0, 50) + '...',
      price: priceValue,
      brand_id: brandId ? String(brandId) : '(not sending - optional)',
      category_id: String(categoryId), // Must be a number
      size: formData.size || '(not set)',
      condition: formData.condition || '(not set)',
      material: formData.material || '(not set)',
      tags_count: tagsPayload.length,
      main_image: uploadedImages.length > 0 ? uploadedImages[0].file.name : '(no image)',
      additional_images_count: uploadedImages.length > 1 ? uploadedImages.length - 1 : 0,
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
      // Get CSRF cookie for SPA authentication (if using cookie-based auth)
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
        additional_images: uploadedImages.length > 1 ? uploadedImages.length - 1 : 0,
        has_token: !!token,
      });

      // Make the POST request with Bearer token authentication
      // The backend will automatically associate the item with the authenticated user
      // Note: Don't set Content-Type header for FormData - browser will set it with boundary
      console.log('📡 Sending POST request to:', `${API_BASE_URL}/items`);
      const response = await axios.post(`${API_BASE_URL}/items`, payload, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it automatically for FormData with boundary
        },
        withCredentials: true,
      });

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
        console.error('❌ Created item values:', Object.values(createdItem));
        
        // Try to find ID in nested structure
        const allKeys = JSON.stringify(createdItem).match(/"id":\s*(\d+)/gi);
        if (allKeys) {
          console.warn('⚠️ Found potential ID in JSON string:', allKeys);
        }
        
        // Don't throw error yet - maybe the item was created but response format is different
        // Let's try to fetch all items and find our item by title/name
        console.warn('⚠️ Item may have been created but response format is unexpected. Will verify by fetching all items...');
      } else {
        console.log('✅ Item created successfully with ID:', itemId);
      }
      
      console.log('✅ Full created item:', createdItem);

      // Verify the item can be fetched back (if we have an ID)
      if (itemId) {
        // Add a small delay in case of database transaction timing issues
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          console.log('🔍 Verifying item exists by fetching it back...');
          console.log('🔍 Fetching:', `${API_BASE_URL}/items/${itemId}`);
          console.log('🔍 Using auth token for verification:', !!token);
          
          // IMPORTANT: Send auth headers so backend allows us to see our own item
          const verifyResponse = await axios.get(`${API_BASE_URL}/items/${itemId}`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          const verifiedItem = verifyResponse.data?.data || verifyResponse.data;
          // Database schema uses 'approved' field (1 = approved, 2 = special status)
          const approvedStatus = verifiedItem?.approved;
          const isApproved = approvedStatus === 1 || approvedStatus === '1';
          console.log('✅ Item verified - exists in database:', {
            id: verifiedItem?.id,
            name: verifiedItem?.name || verifiedItem?.title,
            approved: approvedStatus,
            isApproved: isApproved,
            note: isApproved 
              ? 'Item is approved and visible on shop page'
              : 'Item is not approved and will not appear on shop page until approved'
          });
          
          // CRITICAL: Log images from verified item
          // Per API docs: response includes 'image' (path), 'image_url' (full URL), and 'images' (array)
          console.log('🖼️ IMAGE DEBUG - Verified item images:');
          console.log('🖼️ Verified item image (path):', verifiedItem?.image);
          console.log('🖼️ Verified item image_url (full URL):', verifiedItem?.image_url);
          console.log('🖼️ Verified item images (array):', verifiedItem?.images);
          console.log('🖼️ Verified item name:', verifiedItem?.name);
          console.log('🖼️ Verified item title:', verifiedItem?.title);
          
          if (verifiedItem?.image_url) {
            console.log('✅ Using image_url from response:', verifiedItem.image_url);
          } else if (verifiedItem?.image) {
            console.log('⚠️ No image_url, constructing from image path:', `${API_ROOT}/storage/${verifiedItem.image}`);
          } else {
            console.error('❌ Verified item has NO image or image_url field!');
            console.error('❌ Verified item keys:', Object.keys(verifiedItem || {}));
            console.error('❌ Full verified item:', JSON.stringify(verifiedItem, null, 2));
          }
        } catch (verifyError: any) {
          console.error('❌ ERROR: Could not fetch item back!', {
            status: verifyError?.response?.status,
            statusText: verifyError?.response?.statusText,
            message: verifyError?.message,
            itemId: itemId
          });
          
          // Try to find the item by fetching all items and searching
          console.log('🔍 Trying alternative: Fetching all items to find the newly created one...');
          try {
            const allItemsResponse = await axios.get(`${API_BASE_URL}/items`, {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`, // Add auth in case it affects results
              },
              withCredentials: true,
            });
            const allItems = Array.isArray(allItemsResponse.data) 
              ? allItemsResponse.data 
              : Array.isArray(allItemsResponse.data?.data)
                ? allItemsResponse.data.data
                : [];
            
            // Try to find the item by name/title
            // Database schema uses 'name' field
            const searchTitle = createdItem.name || createdItem.title || formData.title;
            const foundItem = allItems.find((item: any) => 
              (item.title === searchTitle || item.name === searchTitle) &&
              (item.description === createdItem.description || item.description === formData.description)
            );
            
            if (foundItem) {
              console.log('✅ Found item in all items list!', {
                foundId: foundItem.id,
                name: foundItem.name || foundItem.title,
                approved: foundItem.approved
              });
              console.warn('⚠️ Backend returned item but with different ID or structure. Item exists with ID:', foundItem.id);
            } else {
              console.error('❌ Item not found in all items list either!');
              console.error('❌ This suggests the item was NOT saved to the database.');
              console.error('❌ Searched for title/name:', searchTitle);
              console.error('❌ Total items in database:', allItems.length);
              
              // Log all item titles/names for debugging
              console.error('❌ Current items in database:', allItems.map((item: any) => ({
                id: item.id,
                name: item.name || item.title,
                user_id: item.user_id || item.user?.id,
                approved: item.approved
              })));
              
              // Log the created item structure for comparison
              console.error('❌ Created item structure:', {
                id: createdItem.id || createdItem.item_id,
                name: createdItem.name || createdItem.title,
                title: createdItem.title,
                description: createdItem.description,
                approved: createdItem.approved,
                user_id: createdItem.user_id || createdItem.user?.id,
                all_keys: Object.keys(createdItem)
              });
              
              // Show full backend response
              console.error('❌ Full backend response structure:', JSON.stringify(response.data, null, 2));
            }
          } catch (searchError) {
            console.error('❌ Failed to search all items:', searchError);
          }
          
          // CRITICAL: Item was not saved to database
          setSubmitError(
            '❌ CRITICAL ERROR: The item was not saved to the database.\n\n' +
            'The backend returned ID ' + itemId + ', but the item does not exist in the database.\n\n' +
            'This indicates a backend issue:\n' +
            '1. The item may not be committed to the database (transaction issue)\n' +
            '2. There may be a validation error preventing save\n' +
            '3. The backend may be returning a mock response\n\n' +
            'Please check:\n' +
            '- Backend Laravel logs for errors\n' +
            '- Database directly to verify item exists\n' +
            '- Backend controller to ensure Item::create() is actually saving\n\n' +
            'Check browser console for detailed logs.'
          );
        }
      } else {
        console.error('❌ CRITICAL: No item ID in response! Item may not have been saved.');
        console.error('❌ Response structure is unexpected. Backend may not be saving the item.');
        
        // Try to verify by fetching all items
        try {
          console.log('🔍 Attempting to verify by fetching all items...');
          const allItemsResponse = await axios.get(`${API_BASE_URL}/items`, {
            headers: {
              Accept: 'application/json',
            },
          });
          const allItems = Array.isArray(allItemsResponse.data) 
            ? allItemsResponse.data 
            : Array.isArray(allItemsResponse.data?.data)
              ? allItemsResponse.data.data
              : [];
          
          console.log('📋 Total items in database:', allItems.length);
          console.log('📋 Last 3 items:', allItems.slice(-3));
        } catch (err) {
          console.error('❌ Could not fetch items list:', err);
        }
        
        setSubmitError(
          '⚠️ WARNING: Item creation response was unexpected. ' +
          'The item may not have been saved to the database. ' +
          'Please check your backend logs and database. ' +
          'Response format: ' + JSON.stringify(createdItem).substring(0, 200) + '...'
        );
      }

      resetForm();
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        handleRedirectAfterPublish();
      }, 2000);
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
            {t.upload.title}
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
            {t.upload.subtitle}
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
            {t.upload.photos}
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
              {t.upload.dragDrop}
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
              {t.upload.dragDropHint}
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
                    src={img.previewUrl}
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
            {t.upload.details}
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
                {t.upload.itemName} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t.upload.itemNamePlaceholder}
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
                {t.upload.brand} *
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
                <option value="">{t.upload.brandPlaceholder}</option>
                {isLoadingOptions ? (
                  <option value="">{t.upload.loadingBrands}</option>
                ) : (
                  brands.map(brand => (
                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                  ))
                )}
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
                {t.upload.category} *
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
              <label
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  color: '#0A4834',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {t.upload.size} *
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
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
                <option value="">{t.upload.sizePlaceholder}</option>
                {isLoadingOptions ? (
                  <option value="">{t.upload.loadingSizes}</option>
                ) : (
                  sizes.map(size => (
                    <option key={size.id} value={size.name}>{size.name}</option>
                  ))
                )}
              </select>
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
                {t.upload.condition} *
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
                <option value="">{t.upload.conditionPlaceholder}</option>
                {isLoadingOptions ? (
                  <option value="">{t.upload.loadingConditions}</option>
                ) : conditions.length > 0 ? (
                  conditions.map(cond => (
                    <option key={cond.id} value={cond.name}>{cond.name}</option>
                  ))
                ) : (
                  <option value="" disabled>{t.upload.noConditionsAvailable}</option>
                )}
              </select>
            </div>

            {/* Material */}
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
                {t.upload.material}
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder={t.upload.materialPlaceholder}
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
                {t.upload.description}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.upload.descriptionPlaceholder}
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
                {t.upload.tags}
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder={t.upload.tagsPlaceholder}
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
            {t.upload.pricing}
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
                {t.upload.price} *
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
                  placeholder={t.upload.pricePlaceholder}
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
                {t.upload.autoExpire}
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    opacity: 0.6,
                    marginTop: '4px',
                  }}
                >
                  {t.upload.autoExpireHint}
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
            {t.upload.preview}
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
                  src={uploadedImages[0].previewUrl}
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
              {formData.title || t.upload.itemTitle}
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
              {formData.brand || t.upload.brand} • {formData.condition || t.upload.condition}
            </p>
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                color: '#000000',
                opacity: 0.6,
                marginTop: 0,
                marginBottom: '12px',
              }}
            >
              {formData.material ? `${t.upload.material}: ${formData.material}` : t.upload.materialAddDetails}
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
        <div style={{ maxWidth: '640px', margin: '0 auto 24px' }}>
          {submitError && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(193, 64, 64, 0.1)',
                border: '1px solid rgba(193, 64, 64, 0.35)',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                color: '#7a1f1f',
              }}
            >
              {submitError}
            </div>
          )}
        </div>
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
            disabled={isSubmitting}
            style={{
              padding: '16px 48px',
              backgroundColor: '#0A4834',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              minWidth: '200px',
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#083d2c';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0A4834';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? t.upload.publishing : t.upload.publish}
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
            {t.upload.saveDraft}
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
            {t.upload.itemSavedSuccess}
          </span>
        </div>
      )}
    </div>
  );
}
