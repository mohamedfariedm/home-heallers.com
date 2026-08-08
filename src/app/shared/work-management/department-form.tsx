'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useWmUsers,
} from '@/framework/work-management/departments';
import type { Department } from '@/types/work-management';
import Select from 'react-select';

export default function DepartmentForm({
  initValues,
}: {
  initValues?: Department;
}) {
  const { closeModal } = useModal();
  const { data: users = [] } = useWmUsers();
  const { mutate: create, isPending: creating } = useCreateDepartment();
  const { mutate: update, isPending: updating } = useUpdateDepartment();

  const [name, setName] = useState(initValues?.name ?? '');
  const [description, setDescription] = useState(initValues?.description ?? '');
  const [managerId, setManagerId] = useState<string | null>(
    initValues?.managerId ?? null
  );
  const [memberIds, setMemberIds] = useState<string[]>(
    initValues?.memberIds ?? []
  );
  const [status, setStatus] = useState(initValues?.status ?? 'active');

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (initValues) {
      update({
        id: initValues.id,
        name,
        description,
        managerId,
        memberIds,
        status: status as Department['status'],
      });
    } else {
      create({ name, description, managerId, memberIds });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {initValues ? 'Edit Department' : 'Create Department'}
        </Title>
        <Button type="button" variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Manager</label>
        <Select
          options={userOptions}
          value={userOptions.find((o) => o.value === managerId) ?? null}
          onChange={(opt) => setManagerId(opt?.value ?? null)}
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
      {initValues ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Status</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Department['status'])}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      ) : null}
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
