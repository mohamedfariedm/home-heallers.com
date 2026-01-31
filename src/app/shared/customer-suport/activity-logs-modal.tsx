'use client';
import { Title, Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PiClock, PiUser, PiArrowRight, PiXBold } from 'react-icons/pi';
import SimpleBar from '@/components/ui/simplebar';
import { useModal } from '@/app/shared/modal-views/use-modal';

dayjs.extend(relativeTime);

interface ActivityLog {
  id: number;
  description: string;
  causer_name: string | null;
  causer_id: number | null;
  changes?: {
    attributes?: Record<string, any>;
    old?: Record<string, any>;
  };
  created_at: string;
}

interface ActivityLogsModalProps {
  activityLogs: ActivityLog[];
  itemName?: string;
}

export default function ActivityLogsModal({
  activityLogs,
  itemName,
}: ActivityLogsModalProps) {
  const { closeModal } = useModal();
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY [at] HH:mm:ss');
  };

  const formatRelativeTime = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  // Check if a value is a date string (ISO format)
  const isDateString = (value: any): boolean => {
    if (!value || typeof value !== 'string') return false;
    // Check for ISO date format: YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3,6})?(Z|[+-]\d{2}:\d{2})?)?$/;
    return isoDateRegex.test(value) && !isNaN(Date.parse(value));
  };

  // Format a value - if it's a date, format it nicely
  const formatValue = (value: any): string => {
    if (value === null || value === '') {
      return '';
    }
    
    if (isDateString(value)) {
      return dayjs(value).format('MMM DD, YYYY [at] HH:mm:ss');
    }
    
    return String(value);
  };

  const renderChange = (key: string, oldValue: any, newValue: any) => {
    const formattedOldValue = formatValue(oldValue);
    const formattedNewValue = formatValue(newValue);
    
    return (
      <div key={key} className="mb-2 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md bg-red-50 px-2 py-1.5 text-sm dark:bg-red-900/20">
            <div className="text-xs text-red-600 dark:text-red-400">Old Value:</div>
            <div className="font-medium text-red-700 dark:text-red-300">
              {formattedOldValue === '' ? (
                <span className="italic text-gray-400">Empty</span>
              ) : (
                formattedOldValue
              )}
            </div>
          </div>
          <PiArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex-1 rounded-md bg-green-50 px-2 py-1.5 text-sm dark:bg-green-900/20">
            <div className="text-xs text-green-600 dark:text-green-400">New Value:</div>
            <div className="font-medium text-green-700 dark:text-green-300">
              {formattedNewValue === '' ? (
                <span className="italic text-gray-400">Empty</span>
              ) : (
                formattedNewValue
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-grow flex-col gap-6 p-6 @container">
      <div className="flex items-center justify-between">
        <Title as="h3" className="text-lg font-semibold">
          Activity Logs
          {itemName && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              - {itemName}
            </span>
          )}
        </Title>
        <Button variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>

        {activityLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <PiClock className="mb-4 h-12 w-12 text-gray-400" />
            <Text className="text-gray-500">No activity logs available</Text>
          </div>
        ) : (
          <SimpleBar className="max-h-[600px]">
            <div className="space-y-4 pr-2">
              {activityLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Timeline connector */}
                  {index < activityLogs.length - 1 && (
                    <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}

                  <div className="relative flex gap-4">
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <PiClock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Text className="font-semibold text-gray-900 dark:text-gray-100">
                              {log.description}
                            </Text>
                          </div>
                          {log.causer_name && (
                            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <PiUser className="h-4 w-4" />
                              <span>By: {log.causer_name}</span>
                              {log.causer_id && (
                                <Badge
                                  variant="flat"
                                  color="primary"
                                  className="ml-1 text-xs"
                                >
                                  ID: {log.causer_id}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatRelativeTime(log.created_at)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Changes */}
                      {log.changes?.attributes && log.changes?.old && (
                        <div className="mt-3 rounded-md border-t border-gray-200 pt-3 dark:border-gray-700">
                          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Changes:
                          </Text>
                          <div className="space-y-2">
                            {Object.keys(log.changes.attributes).map((key) => {
                              const oldValue = log.changes?.old?.[key];
                              const newValue = log.changes.attributes[key];
                              return renderChange(key, oldValue, newValue);
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SimpleBar>
        )}
    </div>
  );
}
