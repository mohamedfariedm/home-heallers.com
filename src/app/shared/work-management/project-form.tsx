'use client';

import { useState } from 'react';
import {
  PiXBold,
  PiFolder,
  PiUsersThree,
  PiCalendarBlank,
} from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ActionIcon } from '@/components/ui/action-icon';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import {
  useCreateProject,
  useUpdateProject,
  useWmWorkflows,
} from '@/framework/work-management/projects';
import type { Project, ProjectStatus } from '@/types/work-management';
import Select from 'react-select';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type ProjectTabId = 'general' | 'team' | 'schedule';

const PROJECT_TABS: {
  id: ProjectTabId;
  label: string;
  icon: typeof PiFolder;
}[] = [
  { id: 'general', label: 'General', icon: PiFolder },
  { id: 'team', label: 'Team', icon: PiUsersThree },
  { id: 'schedule', label: 'Schedule', icon: PiCalendarBlank },
];

function projectTabHasErrors(
  tabId: ProjectTabId,
  errors: Record<string, unknown>
): boolean {
  switch (tabId) {
    case 'general':
      return Boolean(
        errors.key || errors.name || errors.description || errors.departmentId
      );
    case 'team':
      return Boolean(errors.ownerId || errors.memberIds);
    case 'schedule':
      return Boolean(
        errors.startDate || errors.dueDate || errors.status || errors.workflowId
      );
    default:
      return false;
  }
}

export default function ProjectForm({ initValues }: { initValues?: Project }) {
  const { closeModal } = useModal();
  const { data: departments = [] } = useWmDepartments();
  const { data: users = [] } = useWmUsers();
  const { data: workflows = [] } = useWmWorkflows();
  const { mutate: create, isPending: creating } = useCreateProject();
  const { mutate: update, isPending: updating } = useUpdateProject();
  const [activeTab, setActiveTab] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, unknown>>({});

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

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(PROJECT_TABS.length - 1, index)));
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const tabIndex = PROJECT_TABS.findIndex((tab) =>
      projectTabHasErrors(tab.id, errors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, unknown> = {};
    if (!key.trim()) errors.key = true;
    if (!name.trim()) errors.name = true;
    if (!departmentId) errors.departmentId = true;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      onInvalid(errors);
      return;
    }
    setFieldErrors({});
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

  const isBusy = creating || updating;
  const tabsWithErrors: ModalFormTabItem[] = PROJECT_TABS.map((tab) => ({
    ...tab,
    hasError: projectTabHasErrors(tab.id, fieldErrors),
  }));

  return (
    <form onSubmit={onSubmit} className={modalFormTabsClassName}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiFolder className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              {initValues ? 'Edit Project' : 'Create Project'}
            </h4>
            <p className="mt-0.5 text-xs text-gray-400">
              Fill each tab — save stays available on every step
            </p>
          </div>
        </div>
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={closeModal}
          className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
        >
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>

      <ModalFormTabs
        tabs={tabsWithErrors}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="General"
              description="Key, name, and department"
            >
              <Input
                label="Key"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="CARE"
                required
                disabled={!!initValues}
                error={fieldErrors.key ? 'Key is required' : undefined}
              />
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={fieldErrors.name ? 'Name is required' : undefined}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Department
                </label>
                <Select
                  options={deptOptions}
                  value={
                    deptOptions.find((o) => o.value === departmentId) ?? null
                  }
                  onChange={(opt) => setDepartmentId(opt?.value ?? '')}
                  menuPortalTarget={
                    typeof document !== 'undefined' ? document.body : null
                  }
                  styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                />
                {fieldErrors.departmentId ? (
                  <p className="mt-1 text-sm text-red-600">
                    Department is required
                  </p>
                ) : null}
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Team"
              description="Owner and members"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">Owner</label>
                <Select
                  options={userOptions}
                  value={userOptions.find((o) => o.value === ownerId) ?? null}
                  onChange={(opt) => setOwnerId(opt?.value ?? null)}
                  isClearable
                  menuPortalTarget={
                    typeof document !== 'undefined' ? document.body : null
                  }
                  styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Members
                </label>
                <Select
                  isMulti
                  options={userOptions}
                  value={userOptions.filter((o) =>
                    memberIds.includes(o.value)
                  )}
                  onChange={(opts) => setMemberIds(opts.map((o) => o.value))}
                  menuPortalTarget={
                    typeof document !== 'undefined' ? document.body : null
                  }
                  styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                />
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Schedule"
              description="Dates, status, and workflow"
            >
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
                <label className="mb-1.5 block text-sm font-medium">
                  Workflow
                </label>
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
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={PROJECT_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={closeModal}
        isLoading={isBusy}
        disabled={isBusy}
        submitLabel={initValues ? 'Save' : 'Create'}
      />
    </form>
  );
}
