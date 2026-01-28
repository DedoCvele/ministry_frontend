import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';

type Role = 'admin' | 'user';

export interface AuthUser {
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

interface RegisterPayload {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  password_confirmation?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload & { password: string }) => Promise<{
    success: boolean;
    message?: string;
    user?: AuthUser;
  }>;
  logout: () => Promise<void>;
}

const BACKEND_BASE_URL = 'http://localhost:8000';

// Backend uses Sanctum SPA authentication - requires cookies AND CSRF
const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true, // Required for Sanctum SPA authentication
  withXSRFToken: true,   // Automatically send XSRF-TOKEN cookie as X-XSRF-TOKEN header
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Also add Bearer token for API routes that support it
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const ADMIN_ACCOUNT = {
  username: 'admin@najjak.com',
  password: 'najjakadmin123',
  role: 'admin' as Role,
  firstName: 'Admin',
  lastName: 'User',
};

const TEST_USER_ACCOUNT = {
  username: 'user@example',
  password: '12345678',
  role: 'user' as Role,
  firstName: 'Test',
  lastName: 'User',
};

const SOFI_USER_ACCOUNT = {
  username: 'sofi@sofi',
  password: '123123123',
  role: 'user' as Role,
  firstName: 'Sofi',
  lastName: 'Laurent',
};

const STORAGE_KEYS = {
  users: 'ministry_users',
  currentUser: 'ministry_current_user',
};

const PROFILE_ENDPOINTS = ['/api/user', '/api/me'];

const isAdminRoleValue = (role: unknown): boolean => {
  if (role === null || role === undefined) {
    return false;
  }

  if (typeof role === 'number') {
    return role === 1;
  }

  if (typeof role === 'string') {
    const normalized = role.trim().toLowerCase();
    return normalized === '1' || normalized === 'admin' || normalized === 'administrator';
  }

  if (typeof role === 'object') {
    const roleObject = role as { id?: unknown; value?: unknown; name?: unknown; label?: unknown };
    return (
      isAdminRoleValue(roleObject.id) ||
      isAdminRoleValue(roleObject.value) ||
      isAdminRoleValue(roleObject.name) ||
      isAdminRoleValue(roleObject.label)
    );
  }

  return false;
};

const resolveRole = (roleCandidates: Array<unknown>, fallback: Role = 'user'): Role => {
  for (const candidate of roleCandidates) {
    if (isAdminRoleValue(candidate)) {
      return 'admin';
    }
  }

  return fallback;
};

const extractRoleCandidate = (user: any): unknown => {
  if (!user || typeof user !== 'object') {
    return undefined;
  }

  return (
    user.role ??
    user.role_id ??
    user.roleId ??
    user.user_role ??
    user.userRole ??
    user.role?.id ??
    user.role?.name ??
    user.role?.value ??
    user.role?.label
  );
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read ${key} from storage`, error);
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to storage`, error);
  }
}

interface StoredUser extends AuthUser {
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => {
    const storedUsers = readFromStorage<StoredUser[]>(STORAGE_KEYS.users, []);

    const hasAdmin = storedUsers.some(
      (user) => user.username.toLowerCase() === ADMIN_ACCOUNT.username.toLowerCase(),
    );

    const hasTestUser = storedUsers.some(
      (user) => user.username.toLowerCase() === TEST_USER_ACCOUNT.username.toLowerCase(),
    );

    const hasSofiUser = storedUsers.some(
      (user) => user.username.toLowerCase() === SOFI_USER_ACCOUNT.username.toLowerCase(),
    );

    let updatedUsers = [...storedUsers];

    if (!hasAdmin) {
      updatedUsers = [...updatedUsers, ADMIN_ACCOUNT];
    }

    if (!hasTestUser) {
      updatedUsers = [...updatedUsers, TEST_USER_ACCOUNT];
    }

    if (!hasSofiUser) {
      updatedUsers = [...updatedUsers, SOFI_USER_ACCOUNT];
    }

    if (!hasAdmin || !hasTestUser || !hasSofiUser) {
      writeToStorage(STORAGE_KEYS.users, updatedUsers);
      return updatedUsers;
    }

    return storedUsers;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const storedUser = readFromStorage<AuthUser | null>(STORAGE_KEYS.currentUser, null);
    return storedUser ?? null;
  });

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  // Refresh user profile on app load if user is logged in
  useEffect(() => {
    const refreshUserProfile = async () => {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      const storedUser = readFromStorage<AuthUser | null>(STORAGE_KEYS.currentUser, null);
      
      // If we have a token and a stored user, refresh the profile to get accurate role
      if (token && storedUser) {
        try {
          // Note: NO CSRF cookie needed - we use Bearer token authentication
          // The token is automatically added by the api interceptor

          let profileUser: any = null;

          for (const endpoint of PROFILE_ENDPOINTS) {
            try {
              const profileResponse = await api.get(endpoint, {
                headers: {
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
              });
              profileUser =
                profileResponse.data?.user ||
                profileResponse.data?.data?.user ||
                profileResponse.data?.data ||
                profileResponse.data;
              if (profileUser) {
                break;
              }
            } catch (profileError: any) {
              const status = profileError?.response?.status;
              if (status === 404 || status === 405) {
                continue;
              }
              throw profileError;
            }
          }

          const resolvedRole = resolveRole(
            [extractRoleCandidate(profileUser), extractRoleCandidate(storedUser), storedUser?.role],
            storedUser?.role || 'user',
          );
          
          // Update user with correct role from backend
          const updatedUser: AuthUser = {
            username: profileUser?.email || storedUser.username,
            role: resolvedRole,
            firstName: profileUser?.name?.split(' ')[0] || profileUser?.first_name || profileUser?.firstName || storedUser.firstName,
            lastName: profileUser?.name?.split(' ').slice(1).join(' ') || profileUser?.last_name || profileUser?.lastName || storedUser.lastName,
          };
          
          // Always update to ensure we have the latest role from backend
          setCurrentUser(updatedUser);
          writeToStorage(STORAGE_KEYS.currentUser, updatedUser);
        } catch (error) {
          console.warn('Could not refresh user profile on app load:', error);
          // If profile fetch fails (e.g., token expired), clear user
          if (error && typeof error === 'object' && 'response' in error && (error as any).response?.status === 401) {
            console.log('Token expired, clearing user');
            setCurrentUser(null);
            writeToStorage(STORAGE_KEYS.currentUser, null);
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('auth_token');
            }
          }
        }
      }
    };

    refreshUserProfile();
  }, []); // Run once on mount

  const persistCurrent = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
    writeToStorage(STORAGE_KEYS.currentUser, user);
  }, []);

  const login = useCallback<AuthContextValue['login']>(
    async (email, password, remember) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return { success: false, message: 'Email is required.' };
      }

      // Authenticate with Laravel backend
      try {
        // Get CSRF cookie first - required for Sanctum SPA authentication
        await api.get('/sanctum/csrf-cookie');

        // Authenticate with Laravel
        const loginResponse = await api.post('/api/login', {
          email: trimmedEmail,
          password: password,
          ...(typeof remember === 'boolean' ? { remember } : {}),
        });

        // If Laravel authentication succeeds, store token and proceed with frontend auth
        const responseData = loginResponse.data;
        const token = responseData?.token || responseData?.access_token;
        const apiUser = responseData?.user || responseData?.data?.user || responseData;
        
        // Store token in localStorage
        if (token && typeof window !== 'undefined') {
          window.localStorage.setItem('auth_token', token);
        }

        // Fetch user profile to get accurate role information
        // Prefer /api/user, fall back to /api/me
        let profileUser = apiUser;
        for (const endpoint of PROFILE_ENDPOINTS) {
          try {
            const profileResponse = await api.get(endpoint, {
              headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              },
            });
            profileUser =
              profileResponse.data?.user ||
              profileResponse.data?.data?.user ||
              profileResponse.data?.data ||
              profileResponse.data ||
              apiUser;
            break;
          } catch (profileError: any) {
            const status = profileError?.response?.status;
            if (status === 404 || status === 405) {
              continue;
            }
            console.warn('Could not fetch user profile, using login response data:', profileError);
            break;
          }
        }

        // Create AuthUser from API response (use backend data as source of truth)
        // API uses integer roles: 1 = Admin, 2 = Buyer, 3 = Seller
        const resolvedRole = resolveRole(
          [extractRoleCandidate(profileUser), extractRoleCandidate(apiUser)],
          'user',
        );
        const authUser: AuthUser = {
          username: profileUser?.email || apiUser?.email || profileUser?.username || apiUser?.username || trimmedEmail,
          role: resolvedRole,
          firstName: profileUser?.name?.split(' ')[0] || apiUser?.name?.split(' ')[0] || profileUser?.first_name || apiUser?.first_name || profileUser?.firstName || apiUser?.firstName || undefined,
          lastName: profileUser?.name?.split(' ').slice(1).join(' ') || apiUser?.name?.split(' ').slice(1).join(' ') || profileUser?.last_name || apiUser?.last_name || profileUser?.lastName || apiUser?.lastName || undefined,
        };

        // Update local storage with the correct user data
        const existingUserIndex = users.findIndex(
          (u) => u.username.toLowerCase() === authUser.username.toLowerCase()
        );

        if (existingUserIndex >= 0) {
          // Update existing user with correct role
          const updatedUsers = [...users];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            role: authUser.role,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            password: password, // Keep password for local storage
          };
          setUsers(updatedUsers);
        } else {
          // Add new user to local storage
          const newStoredUser: StoredUser = {
            username: authUser.username,
            password: password,
            role: authUser.role,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
          };
          setUsers((prev) => [...prev, newStoredUser]);
        }

        persistCurrent(authUser);
        return { success: true, user: authUser };
      } catch (error: any) {
        console.error('Laravel authentication failed:', error);
        
        // Check if it's a network error (backend not running) or auth error
        if (!error.response) {
          // Network error - backend might not be running, try local storage fallback
          console.warn('Backend server may not be running. Trying local storage authentication.');
          
          const match = users.find(
            (user) =>
              user.username.toLowerCase() === trimmedEmail.toLowerCase() &&
              user.password === password,
          );

          if (!match) {
            return { success: false, message: 'Invalid email or password.' };
          }

          const { password: _password, ...safeUser } = match;
          persistCurrent(safeUser);
          return { success: true, user: safeUser };
        } else if (error.response?.status === 401 || error.response?.status === 422) {
          // Authentication failed - invalid credentials
          const apiErrors = error.response?.data?.errors || {};
          const errorMessage =
            apiErrors.email?.[0] ||
            apiErrors.password?.[0] ||
            error.response?.data?.message ||
            'Invalid email or password.';
          return { 
            success: false, 
            message: errorMessage,
          };
        }
        
        // For other errors, return failure
        return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed. Please try again.' 
        };
      }
    },
    [persistCurrent, users],
  );

  const forgotPassword = useCallback<AuthContextValue['forgotPassword']>(async (email) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, message: 'Email is required.' };
    }

    try {
      const response = await api.post('/api/forgot-password', { email: trimmedEmail });

      return {
        success: true,
        message: response.data?.status || 'Password reset email sent.',
      };
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors || {};
        const firstError = errors.email?.[0] || error.response?.data?.message;
        return { success: false, message: firstError || 'Unable to send reset email.' };
      }

      if (!error.response) {
        return { success: false, message: 'Unable to connect to server. Please try again.' };
      }

      return { success: false, message: error.response?.data?.message || 'Unable to send reset email.' };
    }
  }, []);

  const register = useCallback<AuthContextValue['register']>(
    async ({ username, password, firstName, lastName, password_confirmation }) => {
      const trimmedUser = username.trim();
      if (!trimmedUser) {
        return { success: false, message: 'Username/Email is required.' };
      }

      if (!password) {
        return { success: false, message: 'Password is required.' };
      }

      if (password_confirmation && password !== password_confirmation) {
        return { success: false, message: 'Passwords do not match.' };
      }

      // Build name from firstName and lastName, or use username as fallback
      const name = firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : firstName || lastName || trimmedUser;

      // Register with Laravel backend
      try {
        // Get CSRF cookie first - required for Sanctum SPA authentication
        await api.get('/sanctum/csrf-cookie');

        // Register with Laravel
        const registerResponse = await api.post('/api/register', {
          name: name,
          email: trimmedUser, // Using username as email
          password: password,
          password_confirmation: password_confirmation || password,
        });

        // Registration may return 204 or a user/token payload depending on backend
        const registerData = registerResponse.data || {};
        let apiUser = registerData?.user || registerData?.data?.user || null;
        let token = registerData?.token || registerData?.access_token || null;

        // If registration did not include a token/user, log in to get them
        if (!token || !apiUser) {
          try {
            const loginResponse = await api.post('/api/login', {
              email: trimmedUser,
              password: password,
            });
            const loginData = loginResponse.data || {};
            token = token || loginData?.token || loginData?.access_token || null;
            apiUser = apiUser || loginData?.user || loginData?.data?.user || loginData || null;
          } catch (loginError) {
            console.warn('Registration succeeded, but login failed:', loginError);
          }
        }

        // Store token in localStorage
        if (token && typeof window !== 'undefined') {
          window.localStorage.setItem('auth_token', token);
        }

        // If we still don't have user data, try to fetch it with the token
        if (!apiUser && token) {
          try {
            for (const endpoint of PROFILE_ENDPOINTS) {
              try {
                const profileResponse = await api.get(endpoint, {
                  headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                  },
                });
                apiUser =
                  profileResponse.data?.user ||
                  profileResponse.data?.data?.user ||
                  profileResponse.data?.data ||
                  profileResponse.data ||
                  null;
                break;
              } catch (profileError: any) {
                const status = profileError?.response?.status;
                if (status === 404 || status === 405) {
                  continue;
                }
                console.warn('Could not fetch user after registration:', profileError);
                break;
              }
            }
          } catch (profileError) {
            console.warn('Could not fetch user after registration:', profileError);
          }
        }

        if (!apiUser) {
          return {
            success: false,
            message: 'Registration succeeded. Please log in.',
          };
        }

        // Create AuthUser from API response
        // API uses integer roles: 1 = Admin, 2 = Buyer, 3 = Seller
        const resolvedRole = resolveRole([extractRoleCandidate(apiUser)], 'user');
        const newAuthUser: AuthUser = {
          username: apiUser.email || trimmedUser,
          role: resolvedRole,
          firstName: firstName || apiUser.name?.split(' ')[0],
          lastName: lastName || apiUser.name?.split(' ').slice(1).join(' '),
        };

        // Also store in local users array for compatibility
        const newStoredUser: StoredUser = {
          username: trimmedUser,
          password, // Note: This is only stored locally, not sent to backend
          role: newAuthUser.role,
          firstName: newAuthUser.firstName,
          lastName: newAuthUser.lastName,
        };

        setUsers((prev) => {
          const exists = prev.some(
            (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
          );
          if (exists) {
            return prev;
          }
          return [...prev, newStoredUser];
        });

        persistCurrent(newAuthUser);
        return { success: true, user: newAuthUser };
      } catch (error: any) {
        console.error('Laravel registration failed:', error);
        
        // Handle validation errors
        if (error.response?.status === 422) {
          const errors = error.response.data.errors || {};
          const firstError = Object.values(errors).flat()[0] as string;
          return { 
            success: false, 
            message: firstError || error.response.data.message || 'Validation failed. Please check your input.' 
          };
        }

        // Handle other errors
        if (error.response?.status === 409 || error.response?.status === 400) {
          return { 
            success: false, 
            message: error.response.data.message || 'Registration failed. This email may already be registered.' 
          };
        }

        // Network error - backend might not be running
        if (!error.response) {
          return { 
            success: false, 
            message: 'Unable to connect to server. Please ensure the backend is running.' 
          };
        }

        return { 
          success: false, 
          message: error.response?.data?.message || 'Registration failed. Please try again.' 
        };
      }
    },
    [persistCurrent, users],
  );

  const logout = useCallback(async () => {
    // Logout from Laravel backend
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      await api.post(
        '/api/logout',
        {},
        {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        }
      );
    } catch (error) {
      // Ignore logout errors - still clear frontend state
      console.warn('Laravel logout failed, clearing frontend state anyway:', error);
    }
    
    // Clear frontend state
    persistCurrent(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
    }
  }, [persistCurrent]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: currentUser,
      isAdmin: currentUser?.role === 'admin',
      login,
      forgotPassword,
      register,
      logout,
    }),
    [currentUser, login, forgotPassword, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

