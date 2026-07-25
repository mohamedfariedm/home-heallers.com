// context/PermissionsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { AUTH_TOKEN } from '@/config/constants';

interface PermissionsContextType {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const getStoredPermissions = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('permissions');
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

export function PermissionsProvider({ children, initialPermissions = [] }: { children: ReactNode; initialPermissions?: string[] }) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);

  useEffect(() => {
    // Fallback to persisted permissions on first client mount
    if (initialPermissions.length > 0) return;
    const stored = getStoredPermissions();
    if (stored.length > 0) {
      setPermissions(stored);
    }
  }, [initialPermissions]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Permissions are stored client-side only (not in the NextAuth JWT)
      const stored = getStoredPermissions();
      setPermissions(stored);
    } else if (status === 'unauthenticated' && !Cookies.get(AUTH_TOKEN)) {
      setPermissions([]);
      localStorage.removeItem('permissions');
    }
  }, [session, status]);

  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions }}>
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