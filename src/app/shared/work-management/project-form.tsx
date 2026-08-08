'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import {
  useCreateProject,
  useUpdateProject,
  useWmWorkflows,
} from '@/framework/work-management/projects';
import type { Project, ProjectStatus } from '@/types/work-management';
import Select from 'react-select';

export default function ProjectForm({ initValues }: { initValues?: Project }) {
  const { closeModal } = useModal();
  const { data: departments = [] } = useWmDepartments();
  const { data: users = [] } = useWmUsers();
  const { data: workflows = [] } = useWmWorkflows();
  const { mutate: create, isPending: creating } = useCreateProject();
  const { mutate: update, isPending: updating } = useUpdateProject();

  const activeDepts = departments.filter((d) => d.status === 'active');
  const [key, setKey] = useState(initValues?.key ?? '');
  const [name, setName] = useState(initValues?.name ?? '');
  const [description, setDescription] = useState(initValues?.description ?? '');
  const [departmentId, setDepartmentId] = useState(
    initValues?.departmentId ?? activeDepts[0]?.id ?? ''
  );
  const [ownerId, setOwnerId] = useState<string | null>(
    initValues?.ownerId ?? null
  );
  const [memberIds, setMemberIds] = useState<string[]>(
    initValues?.memberIds ?? []
  );
  const [startDate, setStartDate] = useState(
    initValues?.startDate?.slice(0, 10) ?? ''
  );
  const [dueDate, setDueDate] = useState(initValues?.dueDate?.slice(0, 10) ?? '');
  const [status, setStatus] = useState<ProjectStatus>(
    initValues?.status ?? 'active'
  );
  const [workflowId, setWorkflowId] = useState(
    initValues?.workflowId ?? ''
  );

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const deptOptions = (initValues ? departments : activeDepts).map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      key,
      name,
      description,
      departmentId,
      ownerId,
      memberIds,
      startDate: startDate || null,
      dueDate: dueDate || null,
      status,
      workflowId: workflowId || null,
    };
    if (initValues) {
      update({ id: initValues.id, ...payload });
    } else {
      create(payload);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {initValues ? 'Edit Project' : 'Create Project'}
        </Title>
        <Button type="button" variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Key"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          placeholder="CARE"
          required
          disabled={!!initValues}
        />
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Department</label>
        <Select
          options={deptOptions}
          value={deptOptions.find((o) => o.value === departmentId) ?? null}
          onChange={(opt) => setDepartmentId(opt?.value ?? '')}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Owner</label>
        <Select
          options={userOptions}
          value={userOptions.find((o) => o.value === ownerId) ?? null}
          onChange={(opt) => setOwnerId(opt?.value ?? null)}
          isClearable
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Members</label>
        <Select
          isMulti
          options={userOptions}
          value={userOptions.filter((o) => memberIds.includes(o.value))}
          onChange={(opts) => setMemberIds(opts.map((o) => o.value))}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Status</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Workflow</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
          >
            <option value="">Default / inherit</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" isLoading={creating || updating}>
          {initValues ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
