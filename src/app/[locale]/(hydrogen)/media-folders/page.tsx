'use client';

import FolderManagementSection from '@/components/FolderManagementSection';
import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { MediaFolder } from '@/types/settings';
import { PiFolderLockDuotone } from 'react-icons/pi';

export default function MediaFoldersPage() {
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();

  const settings = data?.data[0]?.setting;

  const handleUpdate = (media_folders: MediaFolder[]) => {
    if (!settings) return;
    update({ setting: { ...settings, media_folders } });
  };

  return (
    <AdminPageShell
      title="Media Folders"
      description="Organize your videos and files in folders"
      icon={<PiFolderLockDuotone />}
      status={
        isPending ? (
          <div className="flex items-center gap-2 text-sm text-[#143087]">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#143087]" />
            Saving…
          </div>
        ) : null
      }
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <FolderManagementSection
            folders={settings?.media_folders ?? []}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </AdminPageShell>
  );
}
