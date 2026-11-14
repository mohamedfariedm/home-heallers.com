'use client';

import { useMemo, useState, type MouseEvent, type SyntheticEvent } from 'react';
import { PiCaretDownBold, PiFlag, PiUserPlus } from 'react-icons/pi';
import { Popover } from '@/components/ui/popover';
import cn from '@/utils/class-names';
import {
  useAssignableUsers,
  useAssignCustomerSupport,
} from '@/framework/customer-suport';

type AssignmentUser = {
  id: number;
  name: string;
  email?: string;
  is_deleted?: boolean;
};

interface KanbanAssignFlagProps {
  leadId: number;
  assignedToId?: number | null;
  assignment?: {
    assigned_to?: AssignmentUser | null;
    assigned_by?: AssignmentUser | null;
    assigned_at?: string | null;
  } | null;
  /** Full assign/reassign (admin dropdown). */
  canAssign?: boolean;
  /** Non-admin self-assign on unassigned leads (icon only). */
  canSelfAssign?: boolean;
  isAdmin?: boolean;
  currentUserId?: string | number | null;
}

const stopDrag = (e: SyntheticEvent) => {
  e.stopPropagation();
};

export default function KanbanAssignFlag({
  leadId,
  assignedToId = null,
  assignment = null,
  canAssign = false,
  canSelfAssign = false,
  isAdmin = false,
  currentUserId = null,
}: KanbanAssignFlagProps) {
  const [search, setSearch] = useState('');
  const { mutate: assignLead, isPending } = useAssignCustomerSupport();
  const { data: users = [], isLoading } = useAssignableUsers(
    canAssign && isAdmin,
    search
  );

  const assigneeName =
    assignment?.assigned_to?.name ||
    (assignedToId != null ? `User #${assignedToId}` : null);
  const isAssigned = assignedToId != null || Boolean(assignment?.assigned_to);
  const allowSelfAssign = canSelfAssign;

  const options = useMemo(() => {
    const list = users.map((user) => ({
      id: user.id,
      label: `${user.name}${
        typeof user.open_assigned_count === 'number'
          ? ` (${user.open_assigned_count})`
          : ''
      }`,
    }));
    return [{ id: null as number | null, label: 'Unassigned' }, ...list];
  }, [users]);

  const assignTo = (nextId: number | null) => {
    if (isPending) return;
    if ((assignedToId ?? null) === nextId) return;
    assignLead({ id: leadId, assigned_to_id: nextId });
  };

  const handleSelfAssign = (e: MouseEvent) => {
    stopDrag(e);
    e.preventDefault();
    if (!allowSelfAssign || currentUserId == null) return;
    assignTo(Number(currentUserId));
  };

  const flagClass = cn(
    'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
    isAssigned
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
      : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
    canAssign && 'cursor-pointer hover:border-[#143087]/50 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    isPending && 'pointer-events-none opacity-60'
  );

  const label = isAssigned ? assigneeName : 'Unassigned';

  // Admin: dropdown to change assignee
  if (canAssign && isAdmin) {
    return (
      <div
        onPointerDown={stopDrag}
        onMouseDown={stopDrag}
        onClick={stopDrag}
        className="mt-2"
      >
        <Popover
          placement="bottom-start"
          className="z-[70] w-64 p-2"
          content={({ setOpen }) => (
            <div className="flex flex-col gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#143087] dark:border-gray-700 dark:bg-gray-900"
                onPointerDown={stopDrag}
                onClick={stopDrag}
              />
              <div className="max-h-52 overflow-y-auto">
                {isLoading ? (
                  <p className="px-2 py-1.5 text-xs text-gray-500">Loading...</p>
                ) : (
                  options.map((opt) => {
                    const selected =
                      (assignedToId ?? null) === (opt.id ?? null);
                    return (
                      <button
                        key={opt.id ?? 'unassigned'}
                        type="button"
                        disabled={isPending}
                        className={cn(
                          'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                          selected && 'bg-blue-50 font-medium text-[#143087] dark:bg-blue-900/30'
                        )}
                        onClick={() => {
                          assignTo(opt.id);
                          setOpen(false);
                          setSearch('');
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        >
          <button
            type="button"
            className={flagClass}
            title="Change assignee"
            disabled={isPending}
          >
            <PiFlag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
            <PiCaretDownBold className="h-3 w-3 shrink-0 opacity-70" />
          </button>
        </Popover>
      </div>
    );
  }

  // Non-admin: icon-only self-assign when unassigned
  if (!isAdmin && allowSelfAssign && !isAssigned) {
    return (
      <div
        className="mt-2"
        onPointerDown={stopDrag}
        onMouseDown={stopDrag}
        onClick={stopDrag}
      >
        <button
          type="button"
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:border-[#143087]/50 hover:bg-blue-50 hover:text-[#143087] dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:hover:bg-blue-900/20',
            isPending && 'pointer-events-none opacity-60'
          )}
          title="Assign to me"
          aria-label="Assign to me"
          disabled={isPending || currentUserId == null}
          onClick={handleSelfAssign}
        >
          <PiUserPlus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Read-only flag (or assigned for non-admin)
  return (
    <div
      className="mt-2"
      onPointerDown={stopDrag}
      onMouseDown={stopDrag}
      onClick={stopDrag}
    >
      <span className={flagClass} title={isAssigned ? `Assigned to ${label}` : 'Unassigned'}>
        <PiFlag className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    </div>
  );
}
