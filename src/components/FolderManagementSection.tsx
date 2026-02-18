import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  ChevronRight,
  Video,
  Upload,
  X,
  Home,
  Play,
} from 'lucide-react';
import { MediaFolder, MediaFile } from '../types/settings';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';

interface FolderManagementSectionProps {
  folders: MediaFolder[];
  onUpdate: (folders: MediaFolder[]) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Walk the tree and return the folder at the given path of IDs */
function getFolderAtPath(
  folders: MediaFolder[],
  path: string[]
): MediaFolder | null {
  if (path.length === 0) return null;
  const [head, ...rest] = path;
  const found = folders.find((f) => f.id === head);
  if (!found) return null;
  if (rest.length === 0) return found;
  return getFolderAtPath(found.subFolders, rest);
}

/** Immutably update a folder deep in the tree */
function updateFolderInTree(
  folders: MediaFolder[],
  path: string[],
  updater: (f: MediaFolder) => MediaFolder
): MediaFolder[] {
  if (path.length === 0) return folders;
  const [head, ...rest] = path;
  return folders.map((f) => {
    if (f.id !== head) return f;
    if (rest.length === 0) return updater(f);
    return { ...f, subFolders: updateFolderInTree(f.subFolders, rest, updater) };
  });
}

/** Immutably delete a folder from the tree */
function deleteFolderFromTree(
  folders: MediaFolder[],
  path: string[]
): MediaFolder[] {
  if (path.length === 0) return folders;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    return folders.filter((f) => f.id !== head);
  }
  return folders.map((f) => {
    if (f.id !== head) return f;
    return { ...f, subFolders: deleteFolderFromTree(f.subFolders, rest) };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FolderCardProps {
  folder: MediaFolder;
  onOpen: () => void;
  onDelete: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onOpen, onDelete }) => (
  <div className="group relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
    <button
      onClick={onOpen}
      className="flex flex-col items-center gap-2 w-full"
    >
      <div className="w-16 h-16 flex items-center justify-center bg-yellow-50 rounded-xl">
        <Folder className="w-10 h-10 text-yellow-400" />
      </div>
      <span className="text-sm font-medium text-gray-700 text-center break-all line-clamp-2">
        {folder.name}
      </span>
      <span className="text-xs text-gray-400">
        {folder.subFolders.length} folder{folder.subFolders.length !== 1 ? 's' : ''} ·{' '}
        {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
      </span>
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
      title="Delete folder"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

// ─── Video Preview Modal ──────────────────────────────────────────────────────

interface VideoModalProps {
  file: MediaFile;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ file, onClose }) => {
  const src = file.attachment?.original || file.attachment?.thumbnail || '';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-900">
          <p className="text-white font-medium truncate max-w-[80%]" title={file.name}>
            {file.name || 'Video Preview'}
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Video */}
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
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500">
              <Video className="w-16 h-16" />
              <p>No video source available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── File Card ────────────────────────────────────────────────────────────────

interface FileCardProps {
  file: MediaFile;
  onDelete: () => void;
  onPreview: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete, onPreview }) => {
  // thumbnail may be null from API — fall back to original
  const src = file.attachment?.original || file.attachment?.thumbnail || '';
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all">
      {/* Thumbnail / preview area — click opens modal */}
      <button
        onClick={onPreview}
        className="w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden relative"
      >
        {src ? (
          <video
            src={src}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <Video className="w-10 h-10 text-gray-300" />
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
          <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/90 rounded-full p-3 shadow-lg">
            <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
          </div>
        </div>
      </button>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
          {file.name || 'Untitled'}
        </p>
      </div>

      <button
        onClick={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white rounded-full p-1 shadow text-red-400 hover:text-red-600 transition-all"
        title="Delete file"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Upload Panel ─────────────────────────────────────────────────────────────

interface UploadPanelProps {
  onUpload: (name: string, files: any[]) => void;
  onClose: () => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onUpload, onClose }) => {
  const [fileName, setFileName] = useState('');
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);

  const handleAdd = () => {
    if (!pendingFiles.length) return;
    onUpload(fileName || pendingFiles[0]?.original?.split('/').pop() || 'Untitled', pendingFiles);
    setFileName('');
    setPendingFiles([]);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-blue-800 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload File
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Name
        </label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter a name for this file…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <FileUpload
        label="Select Video / File"
        onUpload={(files) => setPendingFiles(files)}
        onRemove={() => setPendingFiles([])}
        currentFiles={pendingFiles}
        multiple={false}
        accept="video/*,image/*,application/pdf"
      />

      <button
        onClick={handleAdd}
        disabled={!pendingFiles.length}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Add to Folder
      </button>
    </div>
  );
};

// ─── New Folder Dialog ────────────────────────────────────────────────────────

interface NewFolderDialogProps {
  onConfirm: (name: string) => void;
  onClose: () => void;
}

const NewFolderDialog: React.FC<NewFolderDialogProps> = ({ onConfirm, onClose }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">New Folder</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onConfirm(name.trim())}
          placeholder="Folder name…"
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FolderManagementSection: React.FC<FolderManagementSectionProps> = ({
  folders,
  onUpdate,
}) => {
  // currentPath is an array of folder IDs representing the navigation stack
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // ── Derived state ──────────────────────────────────────────────────────────

  const currentFolder =
    currentPath.length > 0 ? getFolderAtPath(folders, currentPath) : null;

  const displayedFolders = currentFolder ? currentFolder.subFolders : folders;
  const displayedFiles = currentFolder ? currentFolder.files : [];

  // ── Breadcrumb labels ──────────────────────────────────────────────────────

  function getBreadcrumbs(): { id: string; name: string }[] {
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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateFolder = (name: string) => {
    const newFolder: MediaFolder = {
      id: generateId(),
      name,
      subFolders: [],
      files: [],
    };

    if (currentPath.length === 0) {
      onUpdate([...folders, newFolder]);
    } else {
      onUpdate(
        updateFolderInTree(folders, currentPath, (f) => ({
          ...f,
          subFolders: [...f.subFolders, newFolder],
        }))
      );
    }
    setShowNewFolder(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    const targetPath = [...currentPath, folderId];
    onUpdate(deleteFolderFromTree(folders, targetPath));
  };

  const handleUploadFile = (name: string, uploadedFiles: any[]) => {
    if (!uploadedFiles.length || currentPath.length === 0) return;
    const raw = uploadedFiles[0];
    const newFile: MediaFile = {
      id: generateId(),
      name,
      attachment: {
        id: raw.id ?? Date.now(),
        thumbnail: raw.thumbnail || raw.url || raw.path || '',
        original: raw.original || raw.url || raw.path || '',
      },
    };
    onUpdate(
      updateFolderInTree(folders, currentPath, (f) => ({
        ...f,
        files: [...f.files, newFile],
      }))
    );
    setShowUpload(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (currentPath.length === 0) return;
    onUpdate(
      updateFolderInTree(folders, currentPath, (f) => ({
        ...f,
        files: f.files.filter((file) => file.id !== fileId),
      }))
    );
  };

  const navigateTo = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setShowUpload(false);
  };

  const navigateInto = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
    setShowUpload(false);
  };

  const breadcrumbs = getBreadcrumbs();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Folder Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
          {currentPath.length > 0 && (
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
        <button
          onClick={() => { setCurrentPath([]); setShowUpload(false); }}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          <span>Root</span>
        </button>
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <button
              onClick={() => navigateTo(i)}
              className={`hover:text-blue-600 transition-colors font-medium ${
                i === breadcrumbs.length - 1 ? 'text-blue-600' : ''
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Upload Panel */}
      {showUpload && (
        <UploadPanel
          onUpload={handleUploadFile}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Gallery Grid */}
      {displayedFolders.length === 0 && displayedFiles.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FolderOpen className="w-14 h-14 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {currentPath.length === 0
              ? 'No folders yet. Click "New Folder" to get started.'
              : 'This folder is empty. Create a sub-folder or upload a file.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Sub-folders */}
          {displayedFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={() => navigateInto(folder.id)}
              onDelete={() => handleDeleteFolder(folder.id)}
            />
          ))}

          {/* Files */}
          {displayedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={() => handleDeleteFile(file.id)}
              onPreview={() => setPreviewFile(file)}
            />
          ))}
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolder && (
        <NewFolderDialog
          onConfirm={handleCreateFolder}
          onClose={() => setShowNewFolder(false)}
        />
      )}

      {/* Video Preview Modal */}
      {previewFile && (
        <VideoModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default FolderManagementSection;
