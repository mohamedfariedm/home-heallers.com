'use client';

import WidgetCard from '@/components/cards/widget-card';
import cn from '@/utils/class-names';
import type { OutdatedInstallationItem } from '@/types/app-analytics';

interface OutdatedInstallationsTableProps {
  count: number;
  items: OutdatedInstallationItem[];
  className?: string;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function OutdatedInstallationsTable({
  count,
  items,
  className,
}: OutdatedInstallationsTableProps) {
  if (count === 0) return null;

  return (
    <WidgetCard
      title="Outdated Installations"
      description={`${count.toLocaleString()} installations need an update${count > items.length ? ` (showing first ${items.length})` : ''}`}
      className={cn(className)}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Platform</th>
              <th className="px-3 py-3">Version</th>
              <th className="px-3 py-3">Build</th>
              <th className="px-3 py-3">Device</th>
              <th className="px-3 py-3">Last Seen</th>
              <th className="px-3 py-3">Latest Supported</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <tr key={item.installation_id} className="text-sm text-gray-700 dark:text-gray-300">
                <td className="px-3 py-3 font-medium">{item.installation_id}</td>
                <td className="px-3 py-3 capitalize">{item.platform}</td>
                <td className="px-3 py-3">{item.app_version ?? '—'}</td>
                <td className="px-3 py-3">{item.app_build ?? '—'}</td>
                <td className="px-3 py-3">{item.device_model ?? '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(item.last_seen_at)}</td>
                <td className="px-3 py-3">{item.latest_supported_version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
}
