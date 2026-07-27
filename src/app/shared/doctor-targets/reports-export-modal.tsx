'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Text, Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { downloadDoctorTargetsReport } from '@/framework/doctor-targets';
import toast from 'react-hot-toast';
import DateInput from './date-input';

const REPORT_TYPES = [
  { type: 'monthly', label: 'Monthly performance' },
  { type: 'quarterly', label: 'Quarterly performance' },
  { type: 'ranking', label: 'Doctor ranking' },
  { type: 'incentive_history', label: 'Incentive history' },
  { type: 'wallet_settlement', label: 'Wallet settlement' },
] as const;

export default function ReportsExportModal() {
  const { closeModal } = useModal();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleDownload = async (type: string) => {
    setLoadingType(type);
    try {
      await downloadDoctorTargetsReport(type, from || undefined, to || undefined);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download report');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Title as="h4" className="font-semibold">
            Excel reports
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Downloads `.xlsx` files. Date range is optional where the report
            supports it.
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DateInput label="From" value={from} onChange={setFrom} />
        <DateInput label="To" value={to} onChange={setTo} />
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map((report) => (
          <Button
            key={report.type}
            variant="outline"
            size="sm"
            isLoading={loadingType === report.type}
            disabled={!!loadingType}
            onClick={() => handleDownload(report.type)}
          >
            {report.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
