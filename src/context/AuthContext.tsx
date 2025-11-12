import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string; user?: AuthUser };
  register: (payload: RegisterPayload & { password: string }) => {
    success: boolean;
    message?: string;
    user?: AuthUser;
  };
  logout: () => void;
}

const ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'najjakadmin123',
  role: 'admin' as Role,
  firstName: 'Admin',
  lastName: 'User',
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

    if (hasAdmin) {
      return storedUsers;
    }

    const withAdmin = [...storedUsers, ADMIN_ACCOUNT];
    writeToStorage(STORAGE_KEYS.users, withAdmin);
    return withAdmin;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const storedUser = readFromStorage<AuthUser | null>(STORAGE_KEYS.currentUser, null);
    return storedUser ?? null;
  });

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  const persistCurrent = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
    writeToStorage(STORAGE_KEYS.currentUser, user);
  }, []);

  const login = useCallback<AuthContextValue['login']>(
    (username, password) => {
      const trimmedUser = username.trim();
      if (!trimmedUser) {
        return { success: false, message: 'Username is required.' };
      }

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
    },
    [persistCurrent, users],
  );

  const register = useCallback<AuthContextValue['register']>(
    ({ username, password, firstName, lastName }) => {
      const trimmedUser = username.trim();
      if (!trimmedUser) {
        return { success: false, message: 'Username is required.' };
      }

      if (!password) {
        return { success: false, message: 'Password is required.' };
      }

      const existing = users.find(
        (user) => user.username.toLowerCase() === trimmedUser.toLowerCase(),
      );

      if (existing) {
        if (existing.password !== password) {
          return { success: false, message: 'Account already exists with a different password.' };
        }

        const { password: _password, ...safeUser } = existing;
        persistCurrent(safeUser);
        return { success: true, message: 'Logged in with existing account.', user: safeUser };
      }

      const isAdmin =
        trimmedUser.toLowerCase() === ADMIN_ACCOUNT.username.toLowerCase() &&
        password === ADMIN_ACCOUNT.password;

      const newUser: StoredUser = {
        username: trimmedUser,
        password,
        role: isAdmin ? 'admin' : 'user',
        firstName,
        lastName,
      };

      setUsers((prev) => [...prev, newUser]);
      const { password: _password, ...safeUser } = newUser;
      persistCurrent(safeUser);

      return { success: true, user: safeUser };
    },
    [persistCurrent, users],
  );

  const logout = useCallback(() => {
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

