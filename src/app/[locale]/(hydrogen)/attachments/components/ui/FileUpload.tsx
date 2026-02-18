import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, FileText } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface FileUploadProps {
  label: string;
  onUpload?: (files: any[]) => void;
  onRemove?: (index: number) => void;
  currentFiles?: any[];
  multiple?: boolean;
  accept?: string;
  isLoading?: boolean;
  uploadUrl?: string;
}

/** Returns true if the accept string or file src looks like a video */
function isVideoFile(accept?: string, src?: string | null): boolean {
  if (accept && accept.includes('video')) return true;
  if (src) {
    const ext = src.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'm4v'].includes(ext);
  }
  return false;
}

/** Returns true if the accept string or file src looks like an image */
function isImageFile(accept?: string, src?: string | null): boolean {
  if (accept && accept.includes('image') && !accept.includes('video')) return true;
  if (src) {
    const ext = src.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext);
  }
  return false;
}

/** Human-readable hint for the drop zone */
function acceptHint(accept: string): string {
  if (accept === 'image/*') return 'PNG, JPG, GIF, WEBP';
  if (accept === 'video/*') return 'MP4, WEBM, MOV, AVI';
  if (accept.includes('video') && accept.includes('image')) return 'Images & Videos';
  if (accept.includes('pdf')) return 'PDF, Images, Videos';
  return accept;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onUpload,
  onRemove,
  currentFiles = [],
  multiple = false,
  accept = 'image/*',
  isLoading: externalLoading = false,
  uploadUrl = process.env.NEXT_PUBLIC_ATTACHMENT_URL || '/api/upload',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isLoading = externalLoading || internalLoading;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setInternalLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('attachment[]', file));

    try {
      const { data } = await axios.post(uploadUrl, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        },
      });

      const uploadedFiles = data.data || data;
      onUpload?.(multiple ? uploadedFiles : uploadedFiles.slice(0, 1));
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setInternalLoading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = (index: number) => {
    onRemove?.(index);
  };

  const getFileSrc = (file: any): string | null => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    if (file.original) return file.original;
    if (file.thumbnail) return file.thumbnail;
    if (file.url) return file.url;
    if (file.path) return file.path;
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  };

  const renderFilePreview = (file: any, index: number) => {
    const src = getFileSrc(file);
    const videoByAccept = isVideoFile(accept, null);
    const videoByUrl = isVideoFile(undefined, src);
    const showVideo = videoByAccept || videoByUrl;
    const showImage = !showVideo && (isImageFile(accept, null) || isImageFile(undefined, src));

    return (
      <div key={index} className="relative group">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
          {src && showVideo ? (
            <video
              src={src}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          ) : src && showImage ? (
            <img
              src={src}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : src ? (
            // Generic file (PDF, etc.)
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
              <FileText className="h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500 text-center break-all line-clamp-2">
                {file?.name || src.split('/').pop()}
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={() => handleRemoveFile(index)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  const dropZoneIcon = isVideoFile(accept, null) ? (
    <Video className="h-10 w-10 text-gray-400" />
  ) : (
    <Upload className="h-10 w-10 text-gray-400" />
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
          ${isLoading ? 'opacity-60 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="text-sm text-gray-600">Uploading…</span>
            {uploadProgress > 0 && (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              multiple={multiple}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              {dropZoneIcon}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {acceptHint(accept)} · {multiple ? 'Multiple files' : 'Single file'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {currentFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {currentFiles.map((file, index) => renderFilePreview(file, index))}
        </div>
      )}
    </div>
  );
};