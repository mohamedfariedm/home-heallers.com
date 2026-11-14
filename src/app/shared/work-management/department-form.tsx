'use client';

import { useState } from 'react';
import {
  PiXBold,
  PiBuildings,
  PiUsersThree,
} from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ActionIcon } from '@/components/ui/action-icon';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useWmUsers,
} from '@/framework/work-management/departments';
import type { Department } from '@/types/work-management';
import Select from 'react-select';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type DeptTabId = 'general' | 'people';

const DEPT_TABS: {
  id: DeptTabId;
  label: string;
  icon: typeof PiBuildings;
}[] = [
  { id: 'general', label: 'General', icon: PiBuildings },
  { id: 'people', label: 'People', icon: PiUsersThree },
];

function deptTabHasErrors(
  tabId: DeptTabId,
  errors: Record<string, unknown>
): boolean {
  switch (tabId) {
    case 'general':
      return Boolean(errors.name || errors.description || errors.status);
    case 'people':
      return Boolean(errors.managerId || errors.memberIds);
    default:
      return false;
  }
}

export default function DepartmentForm({
  initValues,
}: {
  initValues?: Department;
}) {
  const { closeModal } = useModal();
  const { data: users = [] } = useWmUsers();
  const { mutate: create, isPending: creating } = useCreateDepartment();
  const { mutate: update, isPending: updating } = useUpdateDepartment();
  const [activeTab, setActiveTab] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, unknown>>({});

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

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(DEPT_TABS.length - 1, index)));
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const tabIndex = DEPT_TABS.findIndex((tab) =>
      deptTabHasErrors(tab.id, errors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, unknown> = {};
    if (!name.trim()) errors.name = true;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      onInvalid(errors);
      return;
    }
    setFieldErrors({});
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

  const isBusy = creating || updating;
  const tabsWithErrors: ModalFormTabItem[] = DEPT_TABS.map((tab) => ({
    ...tab,
    hasError: deptTabHasErrors(tab.id, fieldErrors),
  }));

  return (
    <form onSubmit={onSubmit} className={modalFormTabsClassName}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiBuildings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              {initValues ? 'Edit Department' : 'Create Department'}
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
              description="Department name and status"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={fieldErrors.name ? 'Name is required' : undefined}
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {initValues ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as Department['status'])
                    }
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              ) : null}
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="People"
              description="Manager and members"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Manager
                </label>
                <Select
                  options={userOptions}
                  value={
                    userOptions.find((o) => o.value === managerId) ?? null
                  }
                  onChange={(opt) => setManagerId(opt?.value ?? null)}
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
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={DEPT_TABS.length}
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
