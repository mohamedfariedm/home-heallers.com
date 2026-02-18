'use client';

import React, { useState } from 'react';
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
import Spinner from '@/components/ui/spinner';
import { useSettings } from '@/framework/site-settings';
import { MediaFolder, MediaFile } from '@/types/settings';

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
    className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left w-full"
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
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden text-left w-full"
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
            <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
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
  const folders: MediaFolder[] = data?.data[0]?.setting?.media_folders ?? [];

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const currentFolder = currentPath.length > 0 ? getFolderAtPath(folders, currentPath) : null;
  const displayedFolders = currentFolder ? currentFolder.subFolders : folders;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Media Gallery</h1>
            <p className="text-xs text-gray-400">Browse your media folders and videos</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm flex-wrap">
          <button
            onClick={() => setCurrentPath([])}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
              currentPath.length === 0
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>All Folders</span>
          </button>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  i === breadcrumbs.length - 1
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No media here</p>
            <p className="text-gray-400 text-sm mt-1">
              {currentPath.length === 0
                ? 'No folders have been created yet.'
                : 'This folder is empty.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sub-folders */}
            {displayedFolders.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Folders
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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

            {/* Files */}
            {displayedFiles.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Videos & Files
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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

      {/* Video Modal */}
      {previewFile && (
        <VideoModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
