'use client';

import cn from '@/utils/class-names';

interface KpiTab {
  id: string;
  label: string;
}

interface KpiViewTabsProps {
  tabs: KpiTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function KpiViewTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: KpiViewTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/50',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
