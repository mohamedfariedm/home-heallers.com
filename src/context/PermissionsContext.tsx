// context/PermissionsContext.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { AUTH_TOKEN } from '@/config/constants';

interface PermissionsContextType {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const EMPTY_PERMISSIONS: string[] = [];

const permissionsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const getStoredPermissions = (): string[] => {
  if (typeof window === 'undefined') return EMPTY_PERMISSIONS;
  try {
    const raw = localStorage.getItem('permissions');
    if (!raw) return EMPTY_PERMISSIONS;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : EMPTY_PERMISSIONS;
  } catch {
    return EMPTY_PERMISSIONS;
  }
};

export function PermissionsProvider({
  children,
  initialPermissions = EMPTY_PERMISSIONS,
}: {
  children: ReactNode;
  initialPermissions?: string[];
}) {
  const { status } = useSession();
  const [permissions, setPermissionsState] = useState<string[]>(initialPermissions);

  const setPermissions = useCallback((next: string[]) => {
    setPermissionsState((prev) => (permissionsEqual(prev, next) ? prev : next));
  }, []);

  useEffect(() => {
    // Fallback to persisted permissions on first client mount
    if (initialPermissions.length > 0) return;
    const stored = getStoredPermissions();
    if (stored.length > 0) {
      setPermissions(stored);
    }
  }, [initialPermissions, setPermissions]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Permissions are stored client-side only (not in the NextAuth JWT)
      setPermissions(getStoredPermissions());
    } else if (status === 'unauthenticated' && !Cookies.get(AUTH_TOKEN)) {
      setPermissions(EMPTY_PERMISSIONS);
      localStorage.removeItem('permissions');
    }
  }, [status, setPermissions]);

  const value = useMemo(
    () => ({ permissions, setPermissions }),
    [permissions, setPermissions]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}
