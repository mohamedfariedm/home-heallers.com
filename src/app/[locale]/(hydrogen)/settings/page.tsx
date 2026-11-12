'use client';

import SettingsForm from '@/components/SettingsForm';
import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { Settings } from '@/types/settings';
import { PiGearDuotone } from 'react-icons/pi';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();

  const handleSave = async (settings: Settings) => {
    update({ setting: settings });
  };

  return (
    <AdminPageShell
      title="Settings"
      description="Configure site-wide options and integrations"
      icon={<PiGearDuotone />}
      status={
        isPending ? (
          <div className="flex items-center gap-2 text-sm text-[#143087]">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#143087]" />
            Saving…
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      ) : (
        <SettingsForm
          onSave={handleSave}
          initialSettings={data?.data[0].setting}
          embedded
        />
      )}
    </AdminPageShell>
  );
}
