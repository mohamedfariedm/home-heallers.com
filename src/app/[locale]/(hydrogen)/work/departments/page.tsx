'use client';

import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useArchiveDepartment,
  useWmDepartments,
  useWmUsers,
} from '@/framework/work-management/departments';
import { useWmWorkItems } from '@/framework/work-management/work-items';
import DepartmentForm from '@/app/shared/work-management/department-form';
import DepartmentViewModal from '@/app/shared/work-management/department-view-modal';
import {
  WmBadge,
  WmOpenModalButton,
  WmPageHeader,
} from '@/app/shared/work-management/ui';
import { PiEye, PiPencilSimpleBold } from 'react-icons/pi';

export default function DepartmentsPage() {
  const { data: departments = [], isLoading } = useWmDepartments();
  const { data: users = [] } = useWmUsers();
  const { data: items = [] } = useWmWorkItems();
  const archive = useArchiveDepartment();
  const { openModal } = useModal();

  const nameOf = (id: string | null) =>
    id ? users.find((u) => u.id === id)?.name ?? '—' : '—';

  const workload = (memberId: string) =>
    items.filter(
      (i) =>
        i.assigneeId === memberId &&
        i.status !== 'done' &&
        i.status !== 'cancelled'
    ).length;

  return (
    <div>
      <WmPageHeader
        title="Departments"
        description="Organize work by business unit. Archived departments cannot receive new work."
        action={
          <WmOpenModalButton
            label="Create department"
            view={<DepartmentForm />}
          />
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Name</th>
                  <th className="px-4 py-3.5 font-semibold">Manager</th>
                  <th className="px-4 py-3.5 font-semibold">Members</th>
                  <th className="px-4 py-3.5 font-semibold">Workload</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 text-end font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500">
                        {d.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{nameOf(d.managerId)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {d.memberIds.slice(0, 4).map((id) => {
                          const u = users.find((x) => x.id === id);
                          return (
                            <WmBadge
                              key={id}
                              tone={
                                u?.active === false ? 'danger' : 'default'
                              }
                            >
                              {u?.name?.split(' ')[0] ?? id}
                            </WmBadge>
                          );
                        })}
                        {d.memberIds.length > 4 ? (
                          <WmBadge>+{d.memberIds.length - 4}</WmBadge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {d.memberIds.reduce((sum, id) => sum + workload(id), 0)}{' '}
                      open
                    </td>
                    <td className="px-4 py-3.5">
                      <WmBadge
                        tone={d.status === 'active' ? 'success' : 'default'}
                      >
                        {d.status}
                      </WmBadge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip
                          size="sm"
                          content={() => 'View'}
                          placement="top"
                          color="invert"
                        >
                          <ActionIcon
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openModal({
                                view: (
                                  <DepartmentViewModal
                                    department={d}
                                    users={users}
                                    openWorkload={workload}
                                  />
                                ),
                                customSize: '640px',
                              })
                            }
                          >
                            <PiEye className="h-4 w-4" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip
                          size="sm"
                          content={() => 'Edit'}
                          placement="top"
                          color="invert"
                        >
                          <ActionIcon
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openModal({
                                view: <DepartmentForm initValues={d} />,
                                customSize: '720px',
                              })
                            }
                          >
                            <PiPencilSimpleBold className="h-4 w-4" />
                          </ActionIcon>
                        </Tooltip>
                        {d.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => archive.mutate(d.id)}
                          >
                            Archive
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
