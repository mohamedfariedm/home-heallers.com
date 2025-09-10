// context/PermissionsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface PermissionsContextType {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children, initialPermissions = [] }: { children: ReactNode; initialPermissions?: string[] }) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);

  useEffect(() => {
    console.log('PermissionsProvider - Session status:', status, 'Session:', session);
    if (status === 'authenticated' && session?.user?.permissions) {
      console.log('PermissionsProvider - Updating permissions:', session.user.permissions);
      setPermissions(session.user.permissions);
      localStorage.setItem('permissions', JSON.stringify(session.user.permissions));
    } else if (status === 'unauthenticated') {
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