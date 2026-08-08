'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const WM_ACTOR_KEY = 'wm-mock-actor-id';

export function getStoredWmActorId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(WM_ACTOR_KEY);
}

export function setStoredWmActorId(id: string) {
  localStorage.setItem(WM_ACTOR_KEY, id);
}

/** Resolve actor id: mock override → session → seed Ahmed. */
export function useWmActorId(): string {
  const { data } = useSession();
  const [override, setOverride] = useState<string | null>(null);

  useEffect(() => {
    setOverride(getStoredWmActorId());
    const onStorage = () => setOverride(getStoredWmActorId());
    window.addEventListener('storage', onStorage);
    window.addEventListener('wm-actor-changed', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wm-actor-changed', onStorage);
    };
  }, []);

  if (override) return override;
  const id = (data?.user as { id?: string } | undefined)?.id;
  if (id) return String(id);
  return 'u-1';
}

export const WM_QUERY_KEYS = {
  users: ['wm', 'users'] as const,
  departments: ['wm', 'departments'] as const,
  projects: ['wm', 'projects'] as const,
  workItems: ['wm', 'work-items'] as const,
  workItem: (key: string) => ['wm', 'work-item', key] as const,
  comments: (id: string) => ['wm', 'comments', id] as const,
  attachments: (id: string) => ['wm', 'attachments', id] as const,
  activities: (id: string) => ['wm', 'activities', id] as const,
  workLogs: (id: string) => ['wm', 'work-logs', id] as const,
  links: (id: string) => ['wm', 'links', id] as const,
  children: (id: string) => ['wm', 'children', id] as const,
  savedViews: (userId: string) => ['wm', 'saved-views', userId] as const,
  notifications: (userId: string) => ['wm', 'notifications', userId] as const,
  workflows: ['wm', 'workflows'] as const,
  dashboard: ['wm', 'dashboard'] as const,
  workflowForProject: (projectId: string) =>
    ['wm', 'workflow-project', projectId] as const,
};
