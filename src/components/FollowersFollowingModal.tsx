import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { apiClient } from '../api/apiClient';
import { getTranslation } from '../translations';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const PER_PAGE = 15;

export type FollowersFollowingMode = 'followers' | 'following';

interface UserListItem {
  id: number;
  name: string;
  email?: string;
  username?: string;
  profile_picture?: string | null;
  is_followed?: boolean;
  followers_count?: number;
  following_count?: number;
}

interface FollowersFollowingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode: FollowersFollowingMode;
  onCountsChange?: () => void;
}

const API_ROOT_ORIGIN = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';

function normalizeAvatarUrl(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.startsWith('//')) return `https:${v}`;
  if (v.startsWith('storage/') || v.startsWith('/storage/'))
    return `${API_ROOT_ORIGIN}/${v.replace(/^\//, '')}`;
  return '';
}

export function FollowersFollowingModal({
  open,
  onOpenChange,
  initialMode,
  onCountsChange,
}: FollowersFollowingModalProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const [mode, setMode] = useState<FollowersFollowingMode>(initialMode);
  const [followers, setFollowers] = useState<UserListItem[]>([]);
  const [following, setFollowing] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageFollowers, setPageFollowers] = useState(1);
  const [pageFollowing, setPageFollowing] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState<number | null>(null);

  const fetchList = useCallback(
    async (kind: FollowersFollowingMode, page: number, append: boolean) => {
      const endpoint = kind === 'followers' ? '/me/followers' : '/me/following';
      const setList = kind === 'followers' ? setFollowers : setFollowing;
      const setPage = kind === 'followers' ? setPageFollowers : setPageFollowing;
        const setHasMore = kind === 'followers' ? setHasMoreFollowers : setHasMoreFollowing;

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await apiClient.get(endpoint, {
          params: { 'per-page': PER_PAGE, page },
        });
        const data = res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(data) ? data : [];
        const meta = res.data?.meta ?? {};
        const lastPage = meta.last_page ?? 1;
        const currentPage = meta.current_page ?? page;

        setList((prev) => (append ? [...prev, ...arr] : arr));
        setPage(currentPage);
        setHasMore(currentPage < lastPage);
      } catch (err) {
        setList((prev) => (append ? prev : []));
        setHasMore(false);
        toast.error(language === 'mk' ? 'Грешка при вчитување' : 'Failed to load');
      } finally {
        if (page === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [language]
  );

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setPageFollowers(1);
    setPageFollowing(1);
    setHasMoreFollowers(true);
    setHasMoreFollowing(true);
    fetchList(initialMode, 1, false);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'followers' && followers.length === 0 && hasMoreFollowers && !loading) {
      fetchList('followers', 1, false);
    }
    if (mode === 'following' && following.length === 0 && hasMoreFollowing && !loading) {
      fetchList('following', 1, false);
    }
  }, [open, mode]);

  const handleLoadMore = () => {
    if (mode === 'followers' && hasMoreFollowers && !loadingMore) {
      const nextPage = pageFollowers + 1;
      fetchList('followers', nextPage, true);
    }
    if (mode === 'following' && hasMoreFollowing && !loadingMore) {
      const nextPage = pageFollowing + 1;
      fetchList('following', nextPage, true);
    }
  };

  const handleFollowToggle = async (u: UserListItem) => {
    setFollowLoadingId(u.id);
    try {
      if (u.is_followed) {
        await apiClient.delete(`/me/users/${u.id}/unfollow`);
        toast.success(t.closet?.unfollowed ?? 'Unfollowed.');
        setFollowers((prev) =>
          prev.map((x) => (x.id === u.id ? { ...x, is_followed: false } : x))
        );
        setFollowing((prev) => prev.filter((x) => x.id !== u.id));
      } else {
        await apiClient.post(`/me/users/${u.id}/follow`, {});
        toast.success(t.closet?.followed ?? 'You are now following.');
        setFollowers((prev) =>
          prev.map((x) => (x.id === u.id ? { ...x, is_followed: true } : x))
        );
        setFollowing((prev) =>
          prev.map((x) => (x.id === u.id ? { ...x, is_followed: true } : x))
        );
      }
      onCountsChange?.();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.user?.[0] ||
        (language === 'mk' ? 'Грешка' : 'Something went wrong');
      toast.error(msg);
    } finally {
      setFollowLoadingId(null);
    }
  };

  const list = mode === 'followers' ? followers : following;
  const hasMore = mode === 'followers' ? hasMoreFollowers : hasMoreFollowing;
  const displayName = (u: UserListItem) =>
    u.name || u.username || (u.email ? `@${u.email.split('@')[0]}` : `User ${u.id}`);
  const displayHandle = (u: UserListItem) =>
    u.username || (u.email ? `@${u.email.split('@')[0]}` : '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[400px] sm:max-w-[400px] p-0 gap-0 overflow-hidden"
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-[#eee] shrink-0">
          <DialogTitle className="sr-only">
            {mode === 'followers' ? t.profile?.followers ?? 'Followers' : t.profile?.following ?? 'Following'}
          </DialogTitle>
          <div className="flex rounded-lg bg-[#f0f0f0] p-0.5">
            <button
              type="button"
              onClick={() => {
                setMode('followers');
                if (followers.length === 0 && hasMoreFollowers) fetchList('followers', 1, false);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'followers'
                  ? 'bg-white text-[#0A4834] shadow-sm'
                  : 'text-[#666] hover:text-[#0A4834]'
              }`}
            >
              {t.profile?.followers ?? 'Followers'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('following');
                if (following.length === 0 && hasMoreFollowing) fetchList('following', 1, false);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'following'
                  ? 'bg-white text-[#0A4834] shadow-sm'
                  : 'text-[#666] hover:text-[#0A4834]'
              }`}
            >
              {t.profile?.following ?? 'Following'}
            </button>
          </div>
        </DialogHeader>

        <div
          className="overflow-y-auto flex-1 min-h-0"
          style={{ maxHeight: '60vh' }}
        >
          {loading && list.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[#999]">
              {language === 'mk' ? 'Се вчитува...' : 'Loading...'}
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[#999] text-sm">
              {mode === 'followers'
                ? (language === 'mk' ? 'Немате следбеници.' : 'You have no followers.')
                : (language === 'mk' ? 'Не следите никого.' : 'You are not following anyone.')}
            </div>
          ) : (
            <ul className="divide-y divide-[#f0f0f0]">
              {list.map((u) => {
                const avatarUrl = normalizeAvatarUrl(u.profile_picture ?? '');
                return (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E8E4DD] shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        <ImageWithFallback
                          src={avatarUrl}
                          alt={displayName(u)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#0A4834] font-semibold text-sm">
                          {(u.name || u.email || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0A4834] truncate" title={displayName(u)}>
                        {displayName(u)}
                      </p>
                      {displayHandle(u) && (
                        <p className="text-sm text-[#999] truncate">{displayHandle(u)}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={u.is_followed ? 'outline' : 'default'}
                      className={`shrink-0 rounded-lg ${
                        u.is_followed
                          ? 'border-[#9F8151] text-[#9F8151] hover:bg-[#f5f2ed]'
                          : 'bg-[#9F8151] hover:bg-[#8a7147] text-white'
                      }`}
                      disabled={followLoadingId === u.id}
                      onClick={() => handleFollowToggle(u)}
                    >
                      {followLoadingId === u.id ? (
                        '...'
                      ) : u.is_followed ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          {t.closet?.following ?? 'Following'}
                        </>
                      ) : (
                        t.closet?.follow ?? 'Follow'
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          {list.length > 0 && hasMore && (
            <div className="p-3 border-t border-[#eee]">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-2 text-sm font-medium text-[#9F8151] hover:text-[#0A4834] disabled:opacity-60"
              >
                {loadingMore
                  ? (language === 'mk' ? 'Се вчитува...' : 'Loading...')
                  : (language === 'mk' ? 'Вчитај повеќе' : 'Load more')}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
