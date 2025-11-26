import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Edit3,
  FilePlus2,
  ImageOff,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { HeaderAlt } from '../components/HeaderAlt';
import { FooterAlt } from '../components/FooterAlt';
import { ChatWidget } from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';
import '../components/styles/AdminPage.css';
import { toast } from 'sonner';

interface ApprovalItem {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: number;
  submittedAt: string;
  image?: string;
}

const APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: 'item-1001',
    title: 'Vintage Chanel Tweed Blazer',
    seller: '@luxecloset',
    category: 'Outerwear',
    price: 1480,
    submittedAt: '2 hours ago',
    image:
      'https://images.unsplash.com/photo-1744743128385-990e02da095f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'item-1002',
    title: 'Silk Evening Gown',
    seller: '@noirearchive',
    category: 'Dresses',
    price: 620,
    submittedAt: '4 hours ago',
    image:
      'https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    id: 'item-1003',
    title: 'Leather Saddle Bag',
    seller: '@heritagefinds',
    category: 'Accessories',
    price: 380,
    submittedAt: '9 hours ago',
  },
];

const DEFAULT_BLOG_CATEGORIES = [
  'Market Insights',
  'Seller Spotlights',
  'Trend Reports',
  'Closet Tours',
  'Sustainability',
];

const STORAGE_KEY_CATEGORIES = 'ministry_blog_categories';

interface Blog {
  id: number;
  title: string;
  category: string;
  short_summary: string;
  full_story: string;
  image_url: string;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

export function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'approve' | 'add-blog' | 'manage-blogs'>('approve');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(APPROVAL_QUEUE);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: DEFAULT_BLOG_CATEGORIES[0] ?? '',
    summary: '',
    content: '',
    heroImage: '',
  });
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [blogQuery, setBlogQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const customCategories = JSON.parse(saved);
        return [...DEFAULT_BLOG_CATEGORIES, ...customCategories];
      }
      return DEFAULT_BLOG_CATEGORIES;
    } catch {
      return DEFAULT_BLOG_CATEGORIES;
    }
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Fetch blogs on component mount and when switching to manage-blogs tab
  useEffect(() => {
    if (activeTab === 'manage-blogs') {
      fetchBlogs();
    }
  }, [activeTab]);

  // Load draft from localStorage on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('blog_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        // If draft has a category that's not in our list, add it
        if (draft.category && !categories.includes(draft.category)) {
          const updatedCategories = [...categories, draft.category];
          setCategories(updatedCategories);
          
          // Save to localStorage if it's not a default category
          if (!DEFAULT_BLOG_CATEGORIES.includes(draft.category)) {
            const customCategories = updatedCategories.filter(
              cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
            );
            localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
          }
        }
        setBlogForm(draft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs`);
      // API returns { status: "success", data: [...] }
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setBlogs(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback if response structure is different
        setBlogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }
    const lowered = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowered) ||
        item.seller.toLowerCase().includes(lowered) ||
        item.category.toLowerCase().includes(lowered),
    );
  }, [items, query]);

  const filteredBlogs = useMemo(() => {
    if (!blogQuery.trim()) {
      return blogs;
    }
    const lowered = blogQuery.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lowered) ||
        blog.category.toLowerCase().includes(lowered) ||
        blog.short_summary.toLowerCase().includes(lowered),
    );
  }, [blogs, blogQuery]);

  const handleDecision = (id: string, decision: 'approved' | 'rejected') => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(
      decision === 'approved'
        ? 'Item approved and published ✅'
        : 'Item rejected and seller notified ❌',
      {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      },
    );
  };

  const saveDraftToLocalStorage = () => {
    try {
      localStorage.setItem('blog_draft', JSON.stringify(blogForm));
      toast.success('Draft saved locally ✨', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    }
  };

  const handleSaveDraft = (event: React.FormEvent) => {
    event.preventDefault();
    saveDraftToLocalStorage();
  };

  const handlePostBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      toast.error('Title and Full Story are required', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    setLoading(true);

    // Map form fields to API fields
    // Backend may require multiple field names (full_story, context, content)
    const payload: {
      title: string;
      full_story: string;
      context?: string;
      content?: string;
      category?: string;
      short_summary?: string;
      image_url?: string;
    } = {
      title: blogForm.title,
      full_story: blogForm.content,
      content: blogForm.content, // Backend requires content field
      context: blogForm.content, // Also include context in case backend needs it
    };

    // Add optional fields if they have values
    if (blogForm.category) {
      payload.category = blogForm.category;
    }
    if (blogForm.summary) {
      payload.short_summary = blogForm.summary;
    }
    if (blogForm.heroImage) {
      payload.image_url = blogForm.heroImage;
    }

    try {

      if (editingBlogId) {
        // Update existing blog
        // Try multiple methods as backend may have different route configuration
        let updateSuccess = false;
        let lastError: any = null;
        
        // Try PATCH first (REST standard for updates)
        try {
          const response = await axios.patch(`${API_BASE_URL}/blogs/${editingBlogId}`, payload);
          updateSuccess = true;
        } catch (patchError: any) {
          lastError = patchError;
          // If PATCH is not supported (405), try POST with _method override (Laravel method spoofing)
          if (patchError.response?.status === 405) {
            try {
              // Try POST with _method=PATCH (Laravel method spoofing)
              const postPayload = { ...payload, _method: 'PATCH' };
              const response = await axios.post(`${API_BASE_URL}/blogs/${editingBlogId}`, postPayload);
              updateSuccess = true;
            } catch (postError1: any) {
              // Only continue if it's a 405 error (method not allowed)
              if (postError1.response?.status === 405) {
                try {
                  // Try POST with _method=PUT
                  const postPayload = { ...payload, _method: 'PUT' };
                  const response = await axios.post(`${API_BASE_URL}/blogs/${editingBlogId}`, postPayload);
                  updateSuccess = true;
                } catch (postError2: any) {
                  // Only continue if it's a 405 error
                  if (postError2.response?.status === 405) {
                    try {
                      // Try plain POST
                      const response = await axios.post(`${API_BASE_URL}/blogs/${editingBlogId}`, payload);
                      updateSuccess = true;
                    } catch (postError3: any) {
                      // Only continue if it's a 405 error
                      if (postError3.response?.status === 405) {
                        // Try PUT as last resort
                        try {
                          const response = await axios.put(`${API_BASE_URL}/blogs/${editingBlogId}`, payload);
                          updateSuccess = true;
                        } catch (putError: any) {
                          lastError = putError;
                        }
                      } else {
                        // Re-throw if it's a different error (validation, etc.)
                        throw postError3;
                      }
                    }
                  } else {
                    // Re-throw if it's a different error (validation, etc.)
                    throw postError2;
                  }
                }
              } else {
                // Re-throw if it's a different error (validation, etc.)
                throw postError1;
              }
            }
          } else {
            // Re-throw if it's a different error (validation, etc.)
            throw patchError;
          }
        }
        
        if (updateSuccess) {
          toast.success('Blog updated successfully ✨', {
            style: {
              background: '#FFFFFF',
              color: '#0A4834',
              border: '1px solid #9F8151',
              fontFamily: 'Manrope, sans-serif',
            },
          });
          setEditingBlogId(null);
        } else if (lastError) {
          // If all methods failed, throw the last error to be handled by outer catch
          throw lastError;
        }
      } else {
        // Create new blog
        const response = await axios.post(`${API_BASE_URL}/blogs`, payload);
        toast.success('Blog posted successfully ✨', {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
        });
      }

      // Clear localStorage draft after successful post
      localStorage.removeItem('blog_draft');

      // Reset form
      setBlogForm({
        title: '',
        category: categories[0] ?? '',
        summary: '',
        content: '',
        heroImage: '',
      });

      // Refresh blogs list if on manage-blogs tab
      if (activeTab === 'manage-blogs') {
        fetchBlogs();
      }
    } catch (error: any) {
      console.error('Error posting blog:', error);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Payload that was sent:', JSON.stringify(payload, null, 2));
      
      // Handle Laravel validation errors with detailed messages
      let errorMessage = 'Failed to post blog';
      const missingFields: string[] = [];
      
      // Handle 405 Method Not Allowed errors specially
      if (error.response?.status === 405) {
        const errorData = error.response.data;
        const errorMsg = errorData?.message || error.message || 'Method not allowed';
        // Extract supported methods if available in the error
        const supportedMethods = error.response?.headers?.['allow'] || 
                                errorMsg.match(/Supported methods: ([^.]+)/i)?.[1];
        
        let methodErrorMessage: string;
        if (supportedMethods) {
          methodErrorMessage = `Update method not supported. The backend only accepts: ${supportedMethods}. Please check the API route configuration.`;
        } else {
          methodErrorMessage = `The update method is not supported for this route. Only GET and HEAD methods are currently available. Please contact the backend developer to add PUT/PATCH support, or check if updates should use a different endpoint.`;
        }
        
        toast.error(methodErrorMessage, {
          style: {
            background: '#FFFFFF',
            color: '#0A4834',
            border: '1px solid #9F8151',
            fontFamily: 'Manrope, sans-serif',
          },
          duration: 7000, // Show longer for this type of error
        });
        return;
      }
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for Laravel validation errors format
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages: string[] = [];
          Object.keys(errorData.errors).forEach((field) => {
            const fieldErrors = Array.isArray(errorData.errors[field])
              ? errorData.errors[field]
              : [String(errorData.errors[field])];
            
            // Extract field name and add to missing fields list
            missingFields.push(field);
            errorMessages.push(...fieldErrors);
          });
          
          // Create a detailed error message
          if (missingFields.length > 0) {
            errorMessage = `Missing required fields: ${missingFields.join(', ')}. `;
            errorMessage += errorMessages.join('. ');
          } else {
            errorMessage = errorMessages.join('. ') || errorData.message || errorMessage;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
          // Try to extract field names from the message (handles various formats)
          if (errorData.message.toLowerCase().includes('field is required') || 
              errorData.message.toLowerCase().includes('is required')) {
            // Match patterns like "content field is required", "The content field is required"
            const fieldMatch = errorData.message.match(/(?:the\s+)?(\w+)\s+(?:field\s+)?is\s+required/i);
            if (fieldMatch && fieldMatch[1]) {
              const fieldName = fieldMatch[1];
              errorMessage = `The "${fieldName}" field is required. `;
              // Provide helpful context based on the field
              if (fieldName === 'content') {
                errorMessage += 'Please make sure the "Full Story" field is filled in.';
              } else if (fieldName === 'context') {
                errorMessage += 'Please make sure the "Full Story" field is filled in.';
              } else if (fieldName === 'title') {
                errorMessage += 'Please make sure the "Title" field is filled in.';
              } else {
                errorMessage += 'Please fill it in and try again.';
              }
            }
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error with actionable information
      toast.error(errorMessage, {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
        duration: 5000, // Show longer for validation errors
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    
    // If the blog has a category that's not in our list, add it
    if (blog.category && !categories.includes(blog.category)) {
      const updatedCategories = [...categories, blog.category];
      setCategories(updatedCategories);
      
      // Save to localStorage if it's not a default category
      if (!DEFAULT_BLOG_CATEGORIES.includes(blog.category)) {
        const customCategories = updatedCategories.filter(
          cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
        );
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
      }
    }
    
    setBlogForm({
      title: blog.title,
      category: blog.category || (categories[0] ?? ''),
      summary: blog.short_summary || '',
      content: blog.full_story,
      heroImage: blog.image_url || '',
    });
    setActiveTab('add-blog');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/blogs/${id}`);
      toast.success('Blog deleted successfully', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      fetchBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      category: categories[0] ?? '',
      summary: '',
      content: '',
      heroImage: '',
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    const trimmedCategory = newCategory.trim();
    
    // Check if category already exists
    if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
      toast.error('This category already exists', {
        style: {
          background: '#FFFFFF',
          color: '#0A4834',
          border: '1px solid #9F8151',
          fontFamily: 'Manrope, sans-serif',
        },
      });
      return;
    }

    // Add to categories list
    const updatedCategories = [...categories, trimmedCategory];
    setCategories(updatedCategories);

    // Save custom categories to localStorage (only the ones not in default list)
    const customCategories = updatedCategories.filter(
      cat => !DEFAULT_BLOG_CATEGORIES.includes(cat)
    );
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));

    // Set the new category as selected
    setBlogForm(prev => ({ ...prev, category: trimmedCategory }));

    // Reset add category form
    setNewCategory('');
    setShowAddCategory(false);

    toast.success('Category added successfully ✨', {
      style: {
        background: '#FFFFFF',
        color: '#0A4834',
        border: '1px solid #9F8151',
        fontFamily: 'Manrope, sans-serif',
      },
    });
  };

  return (
    <div className="admin-page">
      <HeaderAlt />
      <main className="admin-main">
        <section className="admin-hero">
          <div className="admin-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="admin-profile-card"
            >
              <img
                className="admin-avatar"
                src="https://static.vecteezy.com/system/resources/previews/021/190/188/non_2x/user-profile-outline-icon-in-transparent-background-basic-app-and-web-ui-bold-line-icon-eps10-free-vector.jpg"
                alt="Admin avatar"
              />
              <h2>{user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Administrator'}</h2>
              <p>{user?.username ?? 'amin'}</p>
              <div className="admin-meta">
                <span>Role: Admin</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="admin-hero-intro"
            >
              <h1>Ministry Admin Console</h1>
              <p>
                Review curated submissions, publish standout stories, and keep the marketplace thriving.
                Every action shapes the experience for our community of collectors and sellers.
              </p>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <span>Items Pending</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Published This Week</span>
                  <strong>12</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Stories in Draft</span>
                  <strong>5</strong>
                </div>
              </div>
              <button
                onClick={logout}
                className="admin-submit"
                style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.15)' }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </motion.div>
          </div>
        </section>

        <div className="admin-surface">
          <div className="admin-surface-inner">
            <div className="admin-tabs">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('approve')}
                className={`admin-tab-button ${activeTab === 'approve' ? 'is-active' : ''}`}
              >
                <ShieldCheck />
                Approve Items
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('add-blog');
                  handleCancelEdit();
                }}
                className={`admin-tab-button ${activeTab === 'add-blog' ? 'is-active' : ''}`}
              >
                <FilePlus2 />
                {editingBlogId ? 'Edit Blog' : 'Add Blog'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('manage-blogs');
                  handleCancelEdit();
                }}
                className={`admin-tab-button ${activeTab === 'manage-blogs' ? 'is-active' : ''}`}
              >
                <Edit3 />
                Manage Blogs
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="admin-content-card"
            >
              {activeTab === 'approve' ? (
                <>
                  <div className="admin-content-header">
                    <h3>Submitters awaiting review</h3>
                    <div className="admin-search">
                      <Search />
                      <input
                        type="text"
                        placeholder="Filter by name, seller, or category"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  {filteredItems.length > 0 ? (
                    <div className="admin-queue">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="admin-queue-card">
                          {item.image ? (
                            <img
                              className="admin-queue-image"
                              src={item.image}
                              alt={item.title}
                            />
                          ) : (
                            <div className="admin-queue-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageOff size={32} color="#9F8151" />
                            </div>
                          )}
                          <div className="admin-queue-details">
                            <h4>{item.title}</h4>
                            <div className="admin-queue-meta">
                              <span>@{item.seller.replace(/^@/, '')}</span>
                              <span>{item.category}</span>
                              <span>${item.price.toLocaleString()}</span>
                              <span>Submitted {item.submittedAt}</span>
                            </div>
                          </div>
                          <div className="admin-queue-actions">
                            <button
                              className="approve"
                              onClick={() => handleDecision(item.id, 'approved')}
                            >
                              <Check size={18} />
                              Approve
                            </button>
                            <button
                              className="reject"
                              onClick={() => handleDecision(item.id, 'rejected')}
                            >
                              <X size={18} />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <ShieldCheck size={40} />
                      <strong>All caught up.</strong>
                      <span>There are no pending items to review right now.</span>
                    </div>
                  )}
                </>
              ) : activeTab === 'add-blog' ? (
                <>
                  <div className="admin-content-header">
                    <h3>{editingBlogId ? 'Edit blog post' : 'Create an editorial draft'}</h3>
                    <div className="admin-form-hint">
                      {editingBlogId ? 'Update the blog post below' : 'Autosaves every 30s while you type.'}
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleSaveDraft}>
                    <div className="admin-form-row">
                      <div className="admin-field">
                        <label htmlFor="blog-title">Title</label>
                        <input
                          id="blog-title"
                          type="text"
                          placeholder="The Luxury Edit: Parisian Finds"
                          value={blogForm.title}
                          onChange={(event) =>
                            setBlogForm((prev) => ({ ...prev, title: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="blog-category">Category</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                          <select
                            id="blog-category"
                            value={blogForm.category}
                            onChange={(event) =>
                              setBlogForm((prev) => ({ ...prev, category: event.target.value }))
                            }
                            style={{ flex: 1 }}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowAddCategory(!showAddCategory)}
                            className="admin-submit"
                            style={{ 
                              background: showAddCategory ? '#9F8151' : 'rgba(255,255,255,0.15)',
                              padding: '8px 16px',
                              whiteSpace: 'nowrap',
                              color: showAddCategory ? '#FFFFFF' : '#0A4834',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: showAddCategory ? 'none' : '1px solid rgba(10, 72, 52, 0.2)'
                            }}
                          >
                            {showAddCategory ? 'Cancel' : '+ Add Category'}
                          </button>
                        </div>
                        {showAddCategory && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Enter new category name"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCategory();
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #9F8151',
                                borderRadius: '6px',
                                background: '#FFFFFF',
                                color: '#0A4834',
                                fontFamily: 'Manrope, sans-serif',
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              className="admin-submit"
                              style={{ 
                                background: '#0A4834',
                                padding: '8px 16px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-field">
                      <label htmlFor="blog-summary">Short Summary</label>
                      <textarea
                        id="blog-summary"
                        placeholder="In this week’s edit we spotlight rare maison pieces from the 70s, sourced by curators across Paris."
                        value={blogForm.summary}
                        onChange={(event) =>
                          setBlogForm((prev) => ({ ...prev, summary: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="blog-content">Full Story</label>
                      <textarea
                        id="blog-content"
                        placeholder="Compose your editorial feature..."
                        value={blogForm.content}
                        onChange={(event) =>
                          setBlogForm((prev) => ({ ...prev, content: event.target.value }))
                        }
                        required
                        style={{ minHeight: 220 }}
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="blog-hero">Hero Image URL</label>
                      <input
                        id="blog-hero"
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={blogForm.heroImage}
                        onChange={(event) =>
                          setBlogForm((prev) => ({ ...prev, heroImage: event.target.value }))
                        }
                      />
                    </div>

                    <div className="admin-form-actions">
                      <span className="admin-form-hint">
                        {editingBlogId
                          ? 'Save draft locally or post to database.'
                          : 'Save draft locally or post to database.'}
                      </span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {editingBlogId && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="admin-submit"
                            style={{ background: 'rgba(255,255,255,0.15)' }}
                          >
                            Cancel
                          </button>
                        )}
                        <button type="submit" className="admin-submit" disabled={loading}>
                          <Edit3 size={18} />
                          Save Draft
                        </button>
                        <button
                          type="button"
                          onClick={handlePostBlog}
                          className="admin-submit"
                          disabled={loading}
                          style={{ background: '#0A4834' }}
                        >
                          {loading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              {editingBlogId ? 'Updating...' : 'Posting...'}
                            </>
                          ) : (
                            <>
                              <FilePlus2 size={18} />
                              {editingBlogId ? 'Update & Post' : 'Post'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="admin-content-header">
                    <h3>Manage Blog Posts</h3>
                    <div className="admin-search">
                      <Search />
                      <input
                        type="text"
                        placeholder="Search blogs by title, category, or summary"
                        value={blogQuery}
                        onChange={(event) => setBlogQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  {loading && blogs.length === 0 ? (
                    <div className="admin-empty-state">
                      <Loader2 size={40} className="animate-spin" />
                      <strong>Loading blogs...</strong>
                    </div>
                  ) : filteredBlogs.length > 0 ? (
                    <div className="admin-queue">
                      {filteredBlogs.map((blog) => (
                        <div key={blog.id} className="admin-queue-card">
                          {blog.image_url ? (
                            <img
                              className="admin-queue-image"
                              src={blog.image_url}
                              alt={blog.title}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {!blog.image_url && (
                            <div
                              className="admin-queue-image"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ImageOff size={32} color="#9F8151" />
                            </div>
                          )}
                          <div className="admin-queue-details">
                            <h4>{blog.title}</h4>
                            <div className="admin-queue-meta">
                              <span>{blog.category || 'Uncategorized'}</span>
                              <span>{blog.status || 'published'}</span>
                              <span>
                                {new Date(blog.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {blog.short_summary && (
                              <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                                {blog.short_summary.length > 150
                                  ? `${blog.short_summary.substring(0, 150)}...`
                                  : blog.short_summary}
                              </p>
                            )}
                          </div>
                          <div className="admin-queue-actions">
                            <button
                              className="approve"
                              onClick={() => handleEditBlog(blog)}
                              disabled={loading}
                            >
                              <Edit3 size={18} />
                              Edit
                            </button>
                            <button
                              className="reject"
                              onClick={() => handleDeleteBlog(blog.id)}
                              disabled={loading}
                            >
                              <Trash2 size={18} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <FilePlus2 size={40} />
                      <strong>No blogs found.</strong>
                      <span>
                        {blogQuery
                          ? 'Try adjusting your search query.'
                          : 'Create your first blog post using the "Add Blog" tab.'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <FooterAlt />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

