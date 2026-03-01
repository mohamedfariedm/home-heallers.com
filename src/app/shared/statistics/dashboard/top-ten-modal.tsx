'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';
import cn from '@/utils/class-names';

interface TopTenItem {
  name: string;
  value: number;
  percentage?: number;
  additionalInfo?: Record<string, any>;
}

interface TopTenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: TopTenItem[];
  valueLabel?: string;
  showPercentage?: boolean;
  additionalColumns?: Array<{
    key: string;
    label: string;
    render?: (item: TopTenItem) => React.ReactNode;
  }>;
}

export default function TopTenModal({
  isOpen,
  onClose,
  title,
  items,
  valueLabel = 'Count',
  showPercentage = true,
  additionalColumns = [],
}: TopTenModalProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const topTenItems = items.slice(0, 10);

  return (
    <Modal isOpen={isOpen} onClose={onClose} customSize="900px">
      <div className="m-auto px-7 pb-8 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-white">
            {title} - Top 10
          </Title>
          <ActionIcon variant="text" onClick={onClose} className="h-5 w-5">
            <PiXBold className="h-5 w-5" />
          </ActionIcon>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {valueLabel}
                </th>
                {showPercentage && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Percentage
                  </th>
                )}
                {additionalColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topTenItems.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                            index === 0
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : index === 1
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : index === 2
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          )}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value.toLocaleString()}
                      </div>
                    </td>
                    {showPercentage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-2 rounded-full dark:bg-blue-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px]">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    )}
                    {additionalColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-right">
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.additionalInfo?.[col.key]?.toLocaleString() || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <td colSpan={showPercentage ? 2 : 1} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                  {total.toLocaleString()}
                </td>
                {showPercentage && (
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                    100.0%
                  </td>
                )}
                {additionalColumns.map(() => (
                  <td key={Math.random()} className="px-4 py-3" />
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
}
