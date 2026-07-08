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
    const sessionPermissions = (session?.user as any)?.permissions as string[] | undefined;
    console.log('PermissionsProvider - Session status:', status, 'Session:', session);
    if (status === 'authenticated' && Array.isArray(sessionPermissions)) {
      console.log('PermissionsProvider - Updating permissions:', sessionPermissions);
      setPermissions(sessionPermissions);
      localStorage.setItem('permissions', JSON.stringify(sessionPermissions));
    } else if (status === 'authenticated') {
      // If session exists without permissions, keep using persisted local permissions
      const stored = getStoredPermissions();
      setPermissions(stored);
    } else if (status === 'unauthenticated' && !Cookies.get(AUTH_TOKEN)) {
      console.log('PermissionsProvider - Clearing permissions');
      setPermissions([]);
      localStorage.removeItem('permissions');
    }
  }, [session, status]);

  console.log('PermissionsProvider - Current permissions:', permissions);

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