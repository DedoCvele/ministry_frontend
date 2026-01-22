import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  register: (payload: RegisterPayload & { password: string }) => Promise<{
    success: boolean;
    message?: string;
    user?: AuthUser;
  }>;
  logout: () => Promise<void>;
}

const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_BASE_URL = 'http://localhost:8000';

const ADMIN_ACCOUNT = {
  username: 'admin',
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
          // Get CSRF cookie first
          await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
          });

          const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });
          
          const profileUser = profileResponse.data?.user || profileResponse.data?.data?.user || profileResponse.data;
          // API uses integer roles: 1 = Admin, 2 = Buyer, 3 = Seller
          const userRole = profileUser?.role;
          const isAdmin = userRole === 1 || userRole === '1';
          
          // Update user with correct role from backend
          const updatedUser: AuthUser = {
            username: profileUser?.email || storedUser.username,
            role: isAdmin ? 'admin' : 'user',
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
    async (username, password) => {
      const trimmedUser = username.trim();
      if (!trimmedUser) {
        return { success: false, message: 'Username is required.' };
      }

      // Authenticate with Laravel backend
      try {
        // Get CSRF cookie first (required for Sanctum SPA authentication)
        await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });

        // Authenticate with Laravel
        // Note: Laravel expects 'email' but we're using username, so we'll use username as email
        // If your backend uses a different field, adjust accordingly
        const loginResponse = await axios.post(
          `${API_BASE_URL}/login`,
          {
            email: trimmedUser, // Using username as email
            password: password,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        // If Laravel authentication succeeds, store token and proceed with frontend auth
        const responseData = loginResponse.data;
        const token = responseData?.token || responseData?.access_token;
        const apiUser = responseData?.user || responseData?.data?.user || responseData;
        
        // Store token in localStorage
        if (token && typeof window !== 'undefined') {
          window.localStorage.setItem('auth_token', token);
        }

        // Fetch user profile to get accurate role information
        // The profile endpoint returns the most up-to-date user data including role
        let profileUser = apiUser;
        try {
          const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });
          
          // Profile endpoint returns { status: 'success', user: {...} } or just user object
          profileUser = profileResponse.data?.user || profileResponse.data?.data?.user || profileResponse.data || apiUser;
        } catch (profileError) {
          console.warn('Could not fetch user profile, using login response data:', profileError);
          // Continue with apiUser from login response
        }

        // Create AuthUser from API response (use backend data as source of truth)
        // API uses integer roles: 1 = Admin, 2 = Buyer, 3 = Seller
        const userRole = profileUser?.role || apiUser?.role;
        // Convert integer role to frontend role string
        // role === 1 means admin, anything else is 'user'
        const isAdmin = userRole === 1 || userRole === '1';
        const authUser: AuthUser = {
          username: profileUser?.email || apiUser?.email || profileUser?.username || apiUser?.username || trimmedUser,
          role: isAdmin ? 'admin' : 'user',
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
              user.username.toLowerCase() === trimmedUser.toLowerCase() &&
              user.password === password,
          );

          if (!match) {
            return { success: false, message: 'Invalid username or password.' };
          }

          const { password: _password, ...safeUser } = match;
          persistCurrent(safeUser);
          return { success: true, user: safeUser };
        } else if (error.response?.status === 401 || error.response?.status === 422) {
          // Authentication failed - invalid credentials
          return { 
            success: false, 
            message: error.response?.data?.message || 'Invalid username or password.' 
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
        // Get CSRF cookie first (required for Sanctum SPA authentication)
        await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });

        // Register with Laravel
        const registerResponse = await axios.post(
          `${API_BASE_URL}/register`,
          {
            name: name,
            email: trimmedUser, // Using username as email
            password: password,
            password_confirmation: password_confirmation || password,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        // If registration succeeds, extract user data and token
        const { user: apiUser, token } = registerResponse.data;

        // Store token in localStorage
        if (token && typeof window !== 'undefined') {
          window.localStorage.setItem('auth_token', token);
        }

        // Create AuthUser from API response
        // API uses integer roles: 1 = Admin, 2 = Buyer, 3 = Seller
        const userRole = apiUser?.role;
        const isAdmin = userRole === 1 || userRole === '1';
        const newAuthUser: AuthUser = {
          username: apiUser.email || trimmedUser,
          role: isAdmin ? 'admin' : 'user',
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
      await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
          },
        }
      );
    } catch (error) {
      // Ignore logout errors - still clear frontend state
      console.warn('Laravel logout failed, clearing frontend state anyway:', error);
    }
    
    // Clear frontend state
    persistCurrent(null);
  }, [persistCurrent]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: currentUser,
      isAdmin: currentUser?.role === 'admin',
      login,
      register,
      logout,
    }),
    [currentUser, login, logout, register],
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

