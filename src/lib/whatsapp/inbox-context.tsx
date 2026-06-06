'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

export interface WhatsAppInboxContextValue {
  apiEnabled: boolean;
  hasManagePermission: boolean;
}

const WhatsAppInboxContext = createContext<WhatsAppInboxContextValue>({
  apiEnabled: false,
  hasManagePermission: false,
});

export function WhatsAppInboxProvider({
  children,
  apiEnabled,
  hasManagePermission,
}: {
  children: ReactNode;
  apiEnabled: boolean;
  hasManagePermission: boolean;
}) {
  const value = useMemo(
    () => ({ apiEnabled, hasManagePermission }),
    [apiEnabled, hasManagePermission]
  );

  return (
    <WhatsAppInboxContext.Provider value={value}>
      {children}
    </WhatsAppInboxContext.Provider>
  );
}

export function useWhatsAppInboxContext() {
  return useContext(WhatsAppInboxContext);
}
