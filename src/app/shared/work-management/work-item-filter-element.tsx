'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useMedia } from '@/hooks/use-media';
import type {
  WorkItemFilters,
  WorkItemPriority,
  WorkItemType,
} from '@/types/work-management';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import { useWmProjects } from '@/framework/work-management/projects';
import { WORK_ITEM_STATUS_LABELS } from '@/types/work-management';

type FilterElementProps = {
  filters: WorkItemFilters;
  updateFilter: (key: keyof WorkItemFilters, value: string) => void;
  handleReset: () => void;
  hideProject?: boolean;
};

function opt(value: string, name: string) {
  return {
    value,
    name,
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">{name}</Text>
      </div>
    ),
  };
}

export default function WorkItemFilterElement({
  filters,
  updateFilter,
  handleReset,
  hideProject,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const { data: departments = [] } = useWmDepartments();
  const { data: projects = [] } = useWmProjects();
  const { data: users = [] } = useWmUsers();

  const labelProps = isMediumScreen
    ? { labelClassName: 'font-medium text-gray-700' }
    : {};

  const projectOptions = projects.map((p) =>
    opt(p.id, `${p.key} — ${p.name}`)
  );
  const departmentOptions = departments.map((d) => opt(d.id, d.name));
  const typeOptions = [
    opt('task', 'Task'),
    opt('bug', 'Bug'),
    opt('story', 'User Story'),
    opt('improvement', 'Improvement'),
  ];
  const statusOptions = Object.entries(WORK_ITEM_STATUS_LABELS).map(
    ([k, label]) => opt(k, label)
  );
  const priorityOptions = [
    opt('critical', 'Critical'),
    opt('high', 'High'),
    opt('medium', 'Medium'),
    opt('low', 'Low'),
  ];
  const userOptions = users.map((u) => opt(u.id, u.name));
  const yesNo = [
    { value: '1', name: 'Yes', label: 'Yes' },
    { value: '0', name: 'No', label: 'No' },
  ];

  return (
    <>
      {!hideProject ? (
        <StatusField
          options={projectOptions}
          placeholder="Project"
          value={filters.projectId ?? ''}
          onChange={(value) => updateFilter('projectId', String(value ?? ''))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            projectOptions.find((o) => o.value === selected)?.name ?? selected
          }
          {...(isMediumScreen && { label: 'Project', ...labelProps })}
        />
      ) : null}

      <StatusField
        options={departmentOptions}
        placeholder="Department"
        value={filters.departmentId ?? ''}
        onChange={(value) => updateFilter('departmentId', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          departmentOptions.find((o) => o.value === selected)?.name ?? selected
        }
        {...(isMediumScreen && { label: 'Department', ...labelProps })}
      />

      <StatusField
        options={typeOptions}
        placeholder="Type"
        value={filters.type ?? ''}
        onChange={(value) => updateFilter('type', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          typeOptions.find((o) => o.value === selected)?.name ?? selected
        }
        {...(isMediumScreen && { label: 'Type', ...labelProps })}
      />

      <StatusField
        options={statusOptions}
        placeholder="Status"
        value={filters.status ?? ''}
        onChange={(value) => updateFilter('status', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((o) => o.value === selected)?.name ?? selected
        }
        {...(isMediumScreen && { label: 'Status', ...labelProps })}
      />

      <StatusField
        options={priorityOptions}
        placeholder="Priority"
        value={filters.priority ?? ''}
        onChange={(value) => updateFilter('priority', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          priorityOptions.find((o) => o.value === selected)?.name ?? selected
        }
        {...(isMediumScreen && { label: 'Priority', ...labelProps })}
      />

      <StatusField
        options={userOptions}
        placeholder="Assignee"
        value={filters.assigneeId ?? ''}
        onChange={(value) => updateFilter('assigneeId', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          userOptions.find((o) => o.value === selected)?.name ?? selected
        }
        {...(isMediumScreen && { label: 'Assignee', ...labelProps })}
      />

      <StatusField
        options={userOptions}
        placeholder="Reporter"
        value={filters.reporterId ?? ''}
        onChange={(value) => updateFilter('reporterId', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          userOptions.find((o) => o.value === selected)?.name ?? selected
        }
        {...(isMediumScreen && { label: 'Reporter', ...labelProps })}
      />

      <Input
        type="date"
        placeholder="Due from"
        value={filters.dueFrom?.slice(0, 10) ?? ''}
        onChange={(e) => updateFilter('dueFrom', e.target.value)}
        inputClassName="h-9"
        {...(isMediumScreen && {
          label: 'Due from',
          labelClassName: 'font-medium text-gray-700 mb-1.5 block',
        })}
      />

      <Input
        type="date"
        placeholder="Due to"
        value={filters.dueTo?.slice(0, 10) ?? ''}
        onChange={(e) => updateFilter('dueTo', e.target.value)}
        inputClassName="h-9"
        {...(isMediumScreen && {
          label: 'Due to',
          labelClassName: 'font-medium text-gray-700 mb-1.5 block',
        })}
      />

      <StatusField
        options={yesNo}
        placeholder="Overdue only"
        value={filters.overdue ? '1' : ''}
        onChange={(value) => updateFilter('overdue', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          yesNo.find((o) => o.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && { label: 'Overdue only', ...labelProps })}
      />

      <StatusField
        options={yesNo}
        placeholder="Unassigned only"
        value={filters.unassigned ? '1' : ''}
        onChange={(value) => updateFilter('unassigned', String(value ?? ''))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          yesNo.find((o) => o.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && { label: 'Unassigned only', ...labelProps })}
      />

      <Button
        size="sm"
        onClick={handleReset}
        className="h-8 bg-gray-200/70"
        variant="flat"
      >
        <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" />
        Clear
      </Button>
    </>
  );
}

// Keep type imports used for documentation / future narrowing
export type { WorkItemType, WorkItemPriority };
