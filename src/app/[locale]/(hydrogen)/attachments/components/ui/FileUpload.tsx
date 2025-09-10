import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
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
  const isLoading = externalLoading || internalLoading;
console.log(currentFiles);

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
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('attachment[]', file));

    try {
      const { data } = await axios.post(uploadUrl, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // If not multiple, replace existing files with the new ones
      const uploadedFiles = data.data || data;
      onUpload?.(multiple ? uploadedFiles : uploadedFiles.slice(0, 1));
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    onRemove?.(index);
  };

  const getImageSrc = (file: any): string | null => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    if (file.thumbnail) return file.thumbnail;
    if (file.url) return file.url;
    if (file.path) return file.path;
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  };

  return (currentFiles.length > 0 &&
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Uploading...</span>
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
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {multiple ? 'Multiple files supported' : 'Single file only'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {currentFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {currentFiles.map((file, index) => {
            const src = getImageSrc(file);
            return (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  {src ? (
                    <img
                      src={src}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {onRemove &&currentFiles.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};