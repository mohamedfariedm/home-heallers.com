'use client';
import FolderManagementSection from '@/components/FolderManagementSection';
import Spinner from '@/components/ui/spinner';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { MediaFolder } from '@/types/settings';

export default function MediaFoldersPage() {
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();

  const settings = data?.data[0]?.setting;

  const handleUpdate = (media_folders: MediaFolder[]) => {
    if (!settings) return;
    update({ setting: { ...settings, media_folders } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white">Media Folders</h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Organize your videos and files in folders
                </p>
              </div>
              {isPending && (
                <div className="ml-auto flex items-center gap-2 text-white text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving…
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
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
        </div>
      </div>
    </div>
  );
}
