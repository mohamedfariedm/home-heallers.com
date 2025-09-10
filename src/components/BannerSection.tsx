import React, { useState } from 'react';
import { Banner } from '../types/settings';
import { Plus, Trash2, Eye } from 'lucide-react';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';

interface BannerSectionProps {
  banners: Banner[];
  onUpdate: (banners: Banner[]) => void;
}

const BannerSection: React.FC<BannerSectionProps> = ({ banners, onUpdate }) => {
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const pageOptions = [
    'home',
    'about-us',
    'services',
    'blogs',
    'contact',
    'subspecialty',
    'specialty'
  ];

  const addBanner = () => {
    const newBanner: Banner = {
      page: 'home',
      attachment: {
        id: Date.now(),
        thumbnail: '',
        original: ''
      }
    };
    onUpdate([...banners, newBanner]);
  };

  const updateBanner = (index: number, updatedBanner: Banner) => {
    const newBanners = [...banners];
    newBanners[index] = updatedBanner;
    onUpdate(newBanners);
  };

  const deleteBanner = (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    onUpdate(newBanners);
  };

  const handleImageUpload = (index: number, uploadedFiles: any[]) => {
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0]; // Single file upload for banners
      const updatedBanner = {
        ...banners[index],
        attachment: {
          ...banners[index].attachment,
          thumbnail: file.thumbnail || file.url || file.path || '',
          original: file.original || file.url || file.path || ''
        }
      };
      updateBanner(index, updatedBanner);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedBanner = {
      ...banners[index],
      attachment: {
        ...banners[index].attachment,
        thumbnail: '',
        original: ''
      }
    };
    updateBanner(index, updatedBanner);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Banner Management</h2>
        <button
          onClick={addBanner}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid gap-6">
        {banners.map((banner, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Banner {index + 1}
              </h3>
              <button
                onClick={() => deleteBanner(index)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page
                  </label>
                  <select
                    value={banner.page}
                    onChange={(e) => updateBanner(index, { ...banner, page: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {pageOptions.map((page) => (
                      <option key={page} value={page}>
                        {page.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FileUpload
                    label="Banner Image"
                    onUpload={(files) => handleImageUpload(index, files)}
                    onRemove={() => handleRemoveImage(index)}
                    currentFiles={banner.attachment.thumbnail ? [banner.attachment] : [{
                      id: banner.attachment.id,
                      thumbnail: banner.attachment.thumbnail,
                      original: banner.attachment.original
                    }]}
                    multiple={false}
                    accept="image/*"
                  />
                  {banner.attachment.original && (
                    <button
                      onClick={() => setSelectedBanner(banner)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mt-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
                {banner.attachment.thumbnail ? (
                  <img
                    src={banner.attachment.thumbnail}
                    alt={`Banner for ${banner.page}`}
                    className="max-w-full max-h-32 object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p>No image uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 mb-4">No banners configured</p>
            <button
              onClick={addBanner}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Banner
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Banner Preview - {selectedBanner.page.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <button
                  onClick={() => setSelectedBanner(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <img
                src={selectedBanner.attachment.original}
                alt={`Banner for ${selectedBanner.page}`}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection;