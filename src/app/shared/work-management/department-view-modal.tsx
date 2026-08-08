'use client';

import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import type { Department, WmUser } from '@/types/work-management';
import { WmBadge } from './ui';
import DepartmentForm from './department-form';

export default function DepartmentViewModal({
  department,
  users,
  openWorkload,
}: {
  department: Department;
  users: WmUser[];
  openWorkload: (memberId: string) => number;
}) {
  const { closeModal, openModal } = useModal();
  const manager = users.find((u) => u.id === department.managerId);

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2">
            <WmBadge
              tone={department.status === 'active' ? 'success' : 'default'}
            >
              {department.status}
            </WmBadge>
          </div>
          <Title as="h4" className="font-semibold">
            {department.name}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            {department.description || 'No description'}
          </Text>
        </div>
        <Button variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
        <div>
          <Text className="text-xs uppercase text-gray-500">Manager</Text>
          <div className="mt-1 text-sm font-medium">
            {manager?.name ?? '—'}
          </div>
        </div>
        <div>
          <Text className="text-xs uppercase text-gray-500">Members</Text>
          <div className="mt-1 text-sm font-medium">
            {department.memberIds.length}
          </div>
        </div>
      </div>

      <div>
        <Text className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Team workload
        </Text>
        <ul className="space-y-2">
          {department.memberIds.map((id) => {
            const u = users.find((x) => x.id === id);
            return (
              <li
                key={id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm"
              >
                <span>
                  {u?.name ?? id}
                  {u?.active === false ? (
                    <span className="ms-2 text-xs text-red-500">(inactive)</span>
                  ) : null}
                </span>
                <WmBadge>{openWorkload(id)} open</WmBadge>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
        <Button
          onClick={() => {
            closeModal();
            setTimeout(() => {
              openModal({
                view: <DepartmentForm initValues={department} />,
                customSize: '720px',
              });
            }, 50);
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
