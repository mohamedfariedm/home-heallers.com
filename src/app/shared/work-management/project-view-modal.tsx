'use client';

import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  PROJECT_STATUS_LABELS,
  type Department,
  type Project,
  type WmUser,
} from '@/types/work-management';
import { WmBadge } from './ui';
import ProjectForm from './project-form';

export default function ProjectViewModal({
  project,
  users,
  departments,
}: {
  project: Project;
  users: WmUser[];
  departments: Department[];
}) {
  const { closeModal, openModal } = useModal();
  const owner = users.find((u) => u.id === project.ownerId);
  const department = departments.find((d) => d.id === project.departmentId);

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{project.key}</span>
            <WmBadge>{PROJECT_STATUS_LABELS[project.status]}</WmBadge>
          </div>
          <Title as="h4" className="font-semibold">
            {project.name}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            {project.description || 'No description'}
          </Text>
        </div>
        <Button variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
        <div>
          <Text className="text-xs uppercase text-gray-500">Department</Text>
          <div className="mt-1 text-sm font-medium">
            {department?.name ?? '—'}
          </div>
        </div>
        <div>
          <Text className="text-xs uppercase text-gray-500">Owner</Text>
          <div className="mt-1 text-sm font-medium">{owner?.name ?? '—'}</div>
        </div>
        <div>
          <Text className="text-xs uppercase text-gray-500">Start</Text>
          <div className="mt-1 text-sm font-medium">
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : '—'}
          </div>
        </div>
        <div>
          <Text className="text-xs uppercase text-gray-500">Due</Text>
          <div className="mt-1 text-sm font-medium">
            {project.dueDate
              ? new Date(project.dueDate).toLocaleDateString()
              : '—'}
          </div>
        </div>
      </div>

      <div>
        <Text className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Members ({project.memberIds.length})
        </Text>
        <div className="flex flex-wrap gap-1.5">
          {project.memberIds.map((id) => (
            <WmBadge key={id}>
              {users.find((u) => u.id === id)?.name ?? id}
            </WmBadge>
          ))}
          {!project.memberIds.length ? (
            <Text className="text-sm text-gray-500">No members</Text>
          ) : null}
        </div>
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
                view: <ProjectForm initValues={project} />,
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
