'use client';

import { useState } from 'react';
import { useWmUsers } from '@/framework/work-management/departments';
import {
  setStoredWmActorId,
  useWmActorId,
} from '@/framework/work-management/keys';

export function WmActorSwitcher({ className }: { className?: string }) {
  const { data: users = [] } = useWmUsers();
  const actorId = useWmActorId();
  const [, bump] = useState(0);

  return (
    <select
      className={
        className ??
        'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm'
      }
      value={actorId}
      onChange={(e) => {
        setStoredWmActorId(e.target.value);
        window.dispatchEvent(new Event('wm-actor-changed'));
        bump((n) => n + 1);
      }}
      title="Mock current user (for demo)"
    >
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          Acting as {u.name}
        </option>
      ))}
    </select>
  );
}
