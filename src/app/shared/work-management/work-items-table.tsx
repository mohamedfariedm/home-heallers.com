'use client';

import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
  WORK_ITEM_TYPE_LABELS,
  type WorkItem,
  type WmUser,
  type Project,
  type Department,
} from '@/types/work-management';
import {
  WmBadge,
  WmWorkItemLink,
  priorityTone,
  statusTone,
} from './ui';
import { WorkItemRowActions } from './work-item-actions';

export default function WorkItemsTable({
  items,
  users,
  projects,
  departments,
}: {
  items: WorkItem[];
  users: WmUser[];
  projects: Project[];
  departments: Department[];
}) {
  const nameOf = (id: string | null) =>
    id ? users.find((u) => u.id === id)?.name ?? '—' : 'Unassigned';
  const projectOf = (id: string) => projects.find((p) => p.id === id);
  const deptOf = (id: string) => departments.find((d) => d.id === id);

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-700">No work items found</p>
        <p className="mt-1 text-xs text-gray-500">
          Try clearing filters or create a new work item.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50/90 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3.5 font-semibold">ID</th>
              <th className="px-4 py-3.5 font-semibold">Title</th>
              <th className="px-4 py-3.5 font-semibold">Type</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Priority</th>
              <th className="px-4 py-3.5 font-semibold">Project</th>
              <th className="px-4 py-3.5 font-semibold">Department</th>
              <th className="px-4 py-3.5 font-semibold">Assignee</th>
              <th className="px-4 py-3.5 font-semibold">Due</th>
              <th className="px-4 py-3.5 text-end font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const overdue =
                item.dueDate &&
                new Date(item.dueDate) < new Date() &&
                item.status !== 'done' &&
                item.status !== 'cancelled';
              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50/80"
                >
                  <td className="px-4 py-3.5">
                    <WmWorkItemLink itemKey={item.key} />
                  </td>
                  <td className="max-w-[240px] px-4 py-3.5">
                    <div className="truncate font-medium text-gray-900">
                      {item.title}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {WORK_ITEM_TYPE_LABELS[item.type]}
                  </td>
                  <td className="px-4 py-3.5">
                    <WmBadge tone={statusTone(item.status)}>
                      {WORK_ITEM_STATUS_LABELS[item.status] ?? item.status}
                    </WmBadge>
                  </td>
                  <td className="px-4 py-3.5">
                    <WmBadge tone={priorityTone(item.priority)}>
                      {WORK_ITEM_PRIORITY_LABELS[item.priority]}
                    </WmBadge>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-700">
                    {projectOf(item.projectId)?.key ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {deptOf(item.departmentId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">{nameOf(item.assigneeId)}</td>
                  <td
                    className={`px-4 py-3.5 ${
                      overdue ? 'font-medium text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <WorkItemRowActions
                      item={item}
                      users={users}
                      projects={projects}
                      departments={departments}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 text-xs text-gray-500">
        {items.length} item{items.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
