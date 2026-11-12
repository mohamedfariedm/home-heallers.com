'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  Home,
  Play,
  Video,
  X,
  Film,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { useSettings } from '@/framework/site-settings';
import { MediaFolder, MediaFile } from '@/types/settings';
import { resolveEffectiveRoles } from '@/utils/kpi-export';
import {
  filterVisibleMediaFolders,
  type MediaFolderViewer,
} from '@/utils/media-folder-access';
import { PiFileImageDuotone } from 'react-icons/pi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFolderAtPath(folders: MediaFolder[], path: string[]): MediaFolder | null {
  if (!path.length) return null;
  const [head, ...rest] = path;
  const found = folders.find((f) => f.id === head);
  if (!found) return null;
  return rest.length === 0 ? found : getFolderAtPath(found.subFolders, rest);
}

// ─── Video Modal ──────────────────────────────────────────────────────────────

const VideoModal: React.FC<{ file: MediaFile; onClose: () => void }> = ({ file, onClose }) => {
  const src = file.attachment?.original || file.attachment?.thumbnail || '';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-950/90 backdrop-blur">
          <Film className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-white font-medium truncate flex-1" title={file.name}>
            {file.name || 'Video'}
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-2 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Player */}
        <div className="aspect-video bg-black">
          {src ? (
            <video
              src={src}
              className="w-full h-full"
              controls
              autoPlay
              preload="auto"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-600">
              <Video className="w-16 h-16" />
              <p className="text-sm">No video source available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Folder Card (view-only) ──────────────────────────────────────────────────

const FolderCard: React.FC<{ folder: MediaFolder; onClick: () => void }> = ({ folder, onClick }) => (
  <button
    onClick={onClick}
    className="group flex w-full flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:border-[#143087]/40 hover:shadow-md"
  >
    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl group-hover:from-amber-100 group-hover:to-yellow-200 transition-all">
      <Folder className="w-9 h-9 text-amber-400 group-hover:text-amber-500 transition-colors" />
    </div>
    <div className="text-center w-full">
      <p className="text-sm font-semibold text-gray-800 truncate" title={folder.name}>
        {folder.name}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {folder.subFolders.length > 0 && `${folder.subFolders.length} folder${folder.subFolders.length !== 1 ? 's' : ''}`}
        {folder.subFolders.length > 0 && folder.files.length > 0 && ' · '}
        {folder.files.length > 0 && `${folder.files.length} file${folder.files.length !== 1 ? 's' : ''}`}
        {folder.subFolders.length === 0 && folder.files.length === 0 && 'Empty'}
      </p>
    </div>
  </button>
);

// ─── File Card (view-only) ────────────────────────────────────────────────────

const FileCard: React.FC<{ file: MediaFile; onPlay: () => void }> = ({ file, onPlay }) => {
  const src = file.attachment?.original || file.attachment?.thumbnail || '';
  return (
    <button
      onClick={onPlay}
      className="group relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:border-[#143087]/40 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {src ? (
          <video
            src={src}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
          <div className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all bg-white rounded-full p-3.5 shadow-xl">
            <Play className="h-6 w-6 fill-[#143087] text-[#143087]" />
          </div>
        </div>
      </div>
      {/* Name */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
          {file.name || 'Untitled'}
        </p>
      </div>
    </button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaGalleryPage() {
  const { data, isLoading } = useSettings();
  const { data: session } = useSession();
  const sessionRoles = (session?.user as { roles?: string[] } | undefined)?.roles;
  const userRoles = resolveEffectiveRoles(Array.isArray(sessionRoles) ? sessionRoles : []);
  const viewer: MediaFolderViewer = {
    userId: session?.user?.id,
    roles: userRoles,
  };
  const viewerKey = `${session?.user?.id ?? ''}|${userRoles.map((role) => role.toLowerCase()).join('|')}`;
  const folders: MediaFolder[] = useMemo(
    () => filterVisibleMediaFolders(data?.data[0]?.setting?.media_folders ?? [], viewer),
    // viewerKey tracks the signed-in user without changing identity every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, viewerKey]
  );

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const currentFolder = currentPath.length > 0 ? getFolderAtPath(folders, currentPath) : null;
  const displayedFolders = currentFolder ? currentFolder.subFolders : folders;

  useEffect(() => {
    if (currentPath.length === 0) return;
    if (!getFolderAtPath(folders, currentPath)) setCurrentPath([]);
  }, [folders, currentPath]);
  const displayedFiles = currentFolder ? currentFolder.files : [];

  // Breadcrumbs
  function getBreadcrumbs() {
    const crumbs: { id: string; name: string }[] = [];
    let list = folders;
    for (const id of currentPath) {
      const f = list.find((x) => x.id === id);
      if (!f) break;
      crumbs.push({ id: f.id, name: f.name });
      list = f.subFolders;
    }
    return crumbs;
  }

  const breadcrumbs = getBreadcrumbs();
  const isEmpty = displayedFolders.length === 0 && displayedFiles.length === 0;

  return (
    <AdminPageShell
      title="Media Gallery"
      description="Browse your media folders and videos"
      icon={<PiFileImageDuotone />}
    >
      <div className="space-y-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm">
          <button
            onClick={() => setCurrentPath([])}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              currentPath.length === 0
                ? 'bg-blue-50 text-[#143087]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-[#143087]'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>All Folders</span>
          </button>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  i === breadcrumbs.length - 1
                    ? 'bg-blue-50 text-[#143087]'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#143087]'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-32 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <FolderOpen className="h-7 w-7 text-[#143087]" />
            </div>
            <p className="text-lg font-medium text-gray-700">No media here</p>
            <p className="mt-1 text-sm text-gray-400">
              {currentPath.length === 0
                ? 'No folders are visible to you yet.'
                : 'This folder is empty.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedFolders.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Folders
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {displayedFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onClick={() => setCurrentPath([...currentPath, folder.id])}
                    />
                  ))}
                </div>
              </section>
            )}

            {displayedFiles.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Videos & Files
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onPlay={() => setPreviewFile(file)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {previewFile && (
        <VideoModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </AdminPageShell>
  );
}
