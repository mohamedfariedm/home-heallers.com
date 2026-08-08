'use client';

import Spinner from '@/components/ui/spinner';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import { useWmProjects } from '@/framework/work-management/projects';
import ProjectForm from '@/app/shared/work-management/project-form';
import ProjectViewModal from '@/app/shared/work-management/project-view-modal';
import {
  WmBadge,
  WmOpenModalButton,
  WmPageHeader,
} from '@/app/shared/work-management/ui';
import { PROJECT_STATUS_LABELS } from '@/types/work-management';
import { PiEye, PiPencilSimpleBold } from 'react-icons/pi';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useWmProjects();
  const { data: departments = [] } = useWmDepartments();
  const { data: users = [] } = useWmUsers();
  const { openModal } = useModal();

  const nameOf = (id: string | null) =>
    id ? users.find((u) => u.id === id)?.name ?? '—' : '—';
  const deptOf = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? '—';

  return (
    <div>
      <WmPageHeader
        title="Projects"
        description="Projects live inside departments. Work item keys use the project code (e.g. CARE-142)."
        action={
          <WmOpenModalButton label="Create project" view={<ProjectForm />} />
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
                  <th className="px-4 py-3.5 font-semibold">Key</th>
                  <th className="px-4 py-3.5 font-semibold">Name</th>
                  <th className="px-4 py-3.5 font-semibold">Department</th>
                  <th className="px-4 py-3.5 font-semibold">Owner</th>
                  <th className="px-4 py-3.5 font-semibold">Members</th>
                  <th className="px-4 py-3.5 font-semibold">Dates</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 text-end font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3.5 font-semibold text-primary">
                      {p.key}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{deptOf(p.departmentId)}</td>
                    <td className="px-4 py-3.5">{nameOf(p.ownerId)}</td>
                    <td className="px-4 py-3.5">{p.memberIds.length}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {p.startDate
                        ? new Date(p.startDate).toLocaleDateString()
                        : '—'}{' '}
                      →{' '}
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <WmBadge>{PROJECT_STATUS_LABELS[p.status]}</WmBadge>
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
                                  <ProjectViewModal
                                    project={p}
                                    users={users}
                                    departments={departments}
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
                                view: <ProjectForm initValues={p} />,
                                customSize: '720px',
                              })
                            }
                          >
                            <PiPencilSimpleBold className="h-4 w-4" />
                          </ActionIcon>
                        </Tooltip>
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
