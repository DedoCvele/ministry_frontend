import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Edit3,
  FilePlus2,
  ImageOff,
  LogOut,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { HeaderAlt } from '../components/HeaderAlt';
import { FooterAlt } from '../components/FooterAlt';
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

const BLOG_CATEGORIES = [
  'Market Insights',
  'Seller Spotlights',
  'Trend Reports',
  'Closet Tours',
  'Sustainability',
];

export function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'approve' | 'add-blog'>('approve');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(APPROVAL_QUEUE);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: BLOG_CATEGORIES[0] ?? '',
    summary: '',
    content: '',
    heroImage: '',
  });

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

  const handleBlogSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success('Draft saved to editorial queue ✨', {
      style: {
        background: '#FFFFFF',
        color: '#0A4834',
        border: '1px solid #9F8151',
        fontFamily: 'Manrope, sans-serif',
      },
    });
    setBlogForm({
      title: '',
      category: BLOG_CATEGORIES[0] ?? '',
      summary: '',
      content: '',
      heroImage: '',
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
                onClick={() => setActiveTab('add-blog')}
                className={`admin-tab-button ${activeTab === 'add-blog' ? 'is-active' : ''}`}
              >
                <FilePlus2 />
                Add Blog
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
              ) : (
                <>
                  <div className="admin-content-header">
                    <h3>Create an editorial draft</h3>
                    <div className="admin-form-hint">Autosaves every 30s while you type.</div>
                  </div>

                  <form className="admin-form" onSubmit={handleBlogSubmit}>
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
                        <select
                          id="blog-category"
                          value={blogForm.category}
                          onChange={(event) =>
                            setBlogForm((prev) => ({ ...prev, category: event.target.value }))
                          }
                        >
                          {BLOG_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
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
                        Drafts are synced to the editorial review queue once saved.
                      </span>
                      <button type="submit" className="admin-submit">
                        <Edit3 size={18} />
                        Save Draft
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <FooterAlt />
    </div>
  );
}

