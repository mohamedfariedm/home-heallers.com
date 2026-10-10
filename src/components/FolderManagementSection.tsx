import React, { useEffect, useMemo, useState } from 'react';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  ChevronRight,
  Upload,
  X,
  Home,
  Play,
  FileText,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { MediaFolder, MediaFile } from '../types/settings';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';
import { useRoles } from '@/framework/roles';
import { resolveEffectiveRoles } from '@/utils/kpi-export';
import {
  canViewMediaFolder,
  folderRoleNames,
  normalizeRoleName,
} from '@/utils/media-folder-access';

interface FolderManagementSectionProps {
  folders: MediaFolder[];
  onUpdate: (folders: MediaFolder[]) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getFileExtension(nameOrUrl?: string): string {
  if (!nameOrUrl) return '';
  return nameOrUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
}

function isVideoFile(nameOrUrl?: string): boolean {
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'm4v'].includes(
    getFileExtension(nameOrUrl)
  );
}

function isImageFile(nameOrUrl?: string): boolean {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(
    getFileExtension(nameOrUrl)
  );
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
  visibleSubFolderCount: number;
  onOpen: () => void;
  onDelete: () => void;
  onEditRoles: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  visibleSubFolderCount,
  onOpen,
  onDelete,
  onEditRoles,
}) => {
  const roles = folderRoleNames(folder);
  return (
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
          {visibleSubFolderCount} folder{visibleSubFolderCount !== 1 ? 's' : ''} ·{' '}
          {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
        </span>
        <span className="flex flex-wrap justify-center gap-1 min-h-[20px]">
          {roles.length === 0 ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Everyone
            </span>
          ) : (
            roles.slice(0, 2).map((role) => (
              <span
                key={role}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700"
              >
                {role}
              </span>
            ))
          )}
          {roles.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              +{roles.length - 2}
            </span>
          )}
        </span>
      </button>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => { e.stopPropagation(); onEditRoles(); }}
          className="text-blue-400 hover:text-blue-600"
          title="Folder roles"
        >
          <Shield className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-red-400 hover:text-red-600"
          title="Delete folder"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Video Preview Modal ──────────────────────────────────────────────────────

interface VideoModalProps {
  file: MediaFile;
  onClose: () => void;
}

const FilePreviewModal: React.FC<VideoModalProps> = ({ file, onClose }) => {
  const src = file.attachment?.original || file.attachment?.thumbnail || '';
  const isVideo = isVideoFile(file.name || src);
  const isImage = !isVideo && isImageFile(file.name || src);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 bg-gray-900">
          <p className="text-white font-medium truncate max-w-[80%]" title={file.name}>
            {file.name || 'File Preview'}
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`bg-black ${isVideo || isImage ? 'aspect-video' : 'min-h-[200px]'}`}>
          {src && isVideo ? (
            <video
              src={src}
              className="w-full h-full"
              controls
              autoPlay
              preload="auto"
            />
          ) : src && isImage ? (
            <img
              src={src}
              alt={file.name || 'Preview'}
              className="w-full h-full object-contain"
            />
          ) : src ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-gray-300">
              <FileText className="w-16 h-16 text-gray-400" />
              <p className="text-center break-all">{file.name || 'File'}</p>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Open / Download
              </a>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500">
              <FileText className="w-16 h-16" />
              <p>No file source available</p>
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
  const src = file.attachment?.original || file.attachment?.thumbnail || '';
  const isVideo = isVideoFile(file.name || src);
  const isImage = !isVideo && isImageFile(file.name || src);

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all">
      <button
        onClick={onPreview}
        className="w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden relative"
      >
        {src && isVideo ? (
          <video
            src={src}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : src && isImage ? (
          <img
            src={src}
            alt={file.name || 'Preview'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-3">
            <FileText className="w-10 h-10 text-gray-300" />
            <span className="text-xs text-gray-400 text-center line-clamp-2 break-all">
              {file.name || 'File'}
            </span>
          </div>
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
            <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/90 rounded-full p-3 shadow-lg">
              <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
            </div>
          </div>
        )}
        {!isVideo && (isImage || src) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
            <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/90 rounded-full p-3 shadow-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        )}
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
        label="Select File"
        onUpload={(files) => setPendingFiles(files)}
        onRemove={() => setPendingFiles([])}
        currentFiles={pendingFiles}
        multiple={false}
        accept="*/*"
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

interface FolderFormDialogProps {
  title: string;
  confirmLabel: string;
  initialName?: string;
  initialRoles?: string[];
  availableRoles: string[];
  rolesLoading: boolean;
  onConfirm: (name: string, roles: string[]) => void;
  onClose: () => void;
}

const FolderFormDialog: React.FC<FolderFormDialogProps> = ({
  title,
  confirmLabel,
  initialName = '',
  initialRoles = [],
  availableRoles,
  rolesLoading,
  onConfirm,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);

  const toggleRole = (role: string) => {
    setSelectedRoles((current) =>
      current.some((item) => item.toLowerCase() === role.toLowerCase())
        ? current.filter((item) => item.toLowerCase() !== role.toLowerCase())
        : [...current, role]
    );
  };

  const submit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), selectedRoles);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Folder name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Folder name…"
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who can see this folder
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {selectedRoles.length === 0
              ? 'No roles selected. Everyone can see this folder. Admin always sees every folder.'
              : 'Only users with a selected role can see this folder. Admin always sees it.'}
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
            {rolesLoading ? (
              <p className="px-3 py-3 text-sm text-gray-400">Loading roles…</p>
            ) : availableRoles.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-400">No roles found.</p>
            ) : (
              availableRoles.map((role) => {
                const checked = selectedRoles.some(
                  (item) => item.toLowerCase() === role.toLowerCase()
                );
                return (
                  <label
                    key={role}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{role}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {confirmLabel}
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
  const { data: session } = useSession();
  const sessionRoles = (session?.user as { roles?: string[] } | undefined)?.roles;
  const userRoles = resolveEffectiveRoles(Array.isArray(sessionRoles) ? sessionRoles : []);
  const roleKey = userRoles.map((role) => role.toLowerCase()).join('|');
  const { data: rolesData, isLoading: rolesLoading } = useRoles('page=1&limit=200');
  const availableRoles = useMemo((): string[] => {
    const payload = rolesData?.data;
    const list: unknown[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    return Array.from(
      new Set(
        list
          .map((role) => normalizeRoleName(role))
          .filter((role): role is string => role.length > 0)
      )
    );
  }, [rolesData]);

  // currentPath is an array of folder IDs representing the navigation stack
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // ── Derived state ──────────────────────────────────────────────────────────

  const currentFolder =
    currentPath.length > 0 ? getFolderAtPath(folders, currentPath) : null;

  const displayedFolders = (currentFolder ? currentFolder.subFolders : folders).filter(
    (folder) => canViewMediaFolder(folder, userRoles)
  );
  const displayedFiles = currentFolder ? currentFolder.files : [];

  useEffect(() => {
    if (currentPath.length === 0) return;
    const folder = getFolderAtPath(folders, currentPath);
    if (!folder || !canViewMediaFolder(folder, userRoles)) {
      setCurrentPath([]);
    }
    // roleKey tracks the signed-in roles without changing identity every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders, currentPath, roleKey]);

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

  const handleCreateFolder = (name: string, roles: string[]) => {
    const newFolder: MediaFolder = {
      id: generateId(),
      name,
      roles,
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

  const handleUpdateFolderAccess = (name: string, roles: string[]) => {
    if (!editingFolder) return;
    onUpdate(
      updateFolderInTree(folders, [...currentPath, editingFolder.id], (f) => ({
        ...f,
        name,
        roles,
      }))
    );
    setEditingFolder(null);
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
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Folder Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Use the shield on a folder to choose which roles can see it. No roles means everyone can see it. Admin always sees every folder.
          </p>
        </div>
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
              visibleSubFolderCount={
                (folder.subFolders ?? []).filter((child) =>
                  canViewMediaFolder(child, userRoles)
                ).length
              }
              onOpen={() => navigateInto(folder.id)}
              onDelete={() => handleDeleteFolder(folder.id)}
              onEditRoles={() => setEditingFolder(folder)}
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
        <FolderFormDialog
          title="New Folder"
          confirmLabel="Create"
          availableRoles={availableRoles}
          rolesLoading={rolesLoading}
          onConfirm={handleCreateFolder}
          onClose={() => setShowNewFolder(false)}
        />
      )}

      {editingFolder && (
        <FolderFormDialog
          title="Folder access"
          confirmLabel="Save"
          initialName={editingFolder.name}
          initialRoles={folderRoleNames(editingFolder)}
          availableRoles={availableRoles}
          rolesLoading={rolesLoading}
          onConfirm={handleUpdateFolderAccess}
          onClose={() => setEditingFolder(null)}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default FolderManagementSection;
