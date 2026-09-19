import React, { useState } from 'react';
import { Banner } from '../types/settings';
import { Plus, Trash2, Eye, BellRing } from 'lucide-react';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';
import { usePackages } from '@/framework/packages';
import { useDoctors } from '@/framework/doctors';
import { useCategories } from '@/framework/categories';
import {
  deepLinkPathForType,
  type DeepLinkEntityType,
} from '@/app/shared/notifications/constants';

interface BannerSectionProps {
  banners: Banner[];
  onUpdate: (banners: Banner[]) => void;
}

// CTA type selector — mirrors the Highlights/Stories CTA. `coupon` is
// intentionally excluded (banners must not offer it and the API rejects it).
const CTA_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'offers', label: 'Offers' },
  { value: 'doctors', label: 'Doctors' },
  { value: 'categories', label: 'Categories' },
];

const ENTITY_CTA_TYPES = ['offers', 'doctors', 'categories'];

function resolveEntityName(item: any): string {
  const name = item?.name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  if (name && typeof name === 'object') {
    return (name.en || name.ar || '').trim() || `#${item?.id}`;
  }
  const title = item?.title;
  if (typeof title === 'string' && title.trim()) return title.trim();
  if (title && typeof title === 'object') {
    return (title.en || title.ar || '').trim() || `#${item?.id}`;
  }
  return `#${item?.id}`;
}

const BannerSection: React.FC<BannerSectionProps> = ({ banners, onUpdate }) => {
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Entity lists for the CTA pickers (offers / doctors / categories).
  const listQuery = 'limit=1000';
  const { data: packagesData, isLoading: offersLoading } = usePackages(listQuery);
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors(listQuery);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories(listQuery);

  const offers = Array.isArray(packagesData?.data) ? packagesData.data : [];
  const doctors = Array.isArray(doctorsData?.data) ? doctorsData.data : [];
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

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
      type: 'web',
      order: banners.length,
      cta_type: null,
      deep_link: null,
      url: null,
      extra_data: null,
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

  // Changing the CTA type resets the resolved companion fields.
  const handleCtaTypeChange = (index: number, banner: Banner, nextType: string) => {
    updateBanner(index, {
      ...banner,
      cta_type: nextType || null,
      deep_link: null,
      url: null,
      extra_data: null,
    });
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

  // Display ordered by `order` while keeping each banner's real array index for
  // update/delete. Mobile also sorts ascending by `order`.
  const orderedBanners = banners
    .map((banner, index) => ({ banner, index }))
    .sort((a, b) => (a.banner.order ?? 0) - (b.banner.order ?? 0));

  const renderCtaValueField = (index: number, banner: Banner) => {
    const ctaType = banner.cta_type || '';

    // offers / doctors / categories all resolve to deep_link = entity id
    // (same shape as the Highlights/Stories CTA).
    if (ctaType === 'offers' || ctaType === 'doctors' || ctaType === 'categories') {
      const entityMap = {
        offers: { list: offers, loading: offersLoading, label: 'Offer' },
        doctors: { list: doctors, loading: doctorsLoading, label: 'Doctor' },
        categories: { list: categories, loading: categoriesLoading, label: 'Category' },
      } as const;
      const { list, loading, label } = entityMap[ctaType];
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <select
            value={banner.deep_link ?? ''}
            onChange={(e) => {
              const id = e.target.value;
              updateBanner(index, {
                ...banner,
                deep_link: id || null,
                // Auto-fill the full URL from the selection (like Stories).
                url: id
                  ? deepLinkPathForType(ctaType as DeepLinkEntityType, id)
                  : null,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              {loading ? 'Loading…' : `Select ${label.toLowerCase()}`}
            </option>
            {list.map((item: any) => (
              <option key={item.id} value={String(item.id)}>
                {resolveEntityName(item)}
              </option>
            ))}
            {/* Keep an unknown/legacy id selectable */}
            {banner.deep_link &&
              !list.some((item: any) => String(item.id) === banner.deep_link) && (
                <option value={banner.deep_link}>
                  {label} #{banner.deep_link}
                </option>
              )}
          </select>
        </div>
      );
    }

    return null;
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
        {orderedBanners.map(({ banner, index }, displayPos) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Banner {displayPos + 1}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={banner.type || 'web'}
                      onChange={(e) => updateBanner(index, { ...banner, type: e.target.value as 'web' | 'mobile app' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="web">Web</option>
                      <option value="mobile app">Mobile App</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={banner.order ?? 0}
                      onChange={(e) =>
                        updateBanner(index, {
                          ...banner,
                          order: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

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

            {/* CTA (notification-shaped) — like the Highlights/Stories CTA */}
            <div className="mt-5 rounded-lg border border-purple-100 bg-purple-50/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-purple-700" />
                <span className="text-sm font-semibold text-purple-900">
                  CTA Action (optional)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Type
                  </label>
                  <select
                    value={banner.cta_type || ''}
                    onChange={(e) => handleCtaTypeChange(index, banner, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CTA_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {ENTITY_CTA_TYPES.includes(banner.cta_type || '')
                  ? renderCtaValueField(index, banner)
                  : null}
              </div>

              {ENTITY_CTA_TYPES.includes(banner.cta_type || '') && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External URL{' '}
                    <span className="font-normal text-gray-400">
                      (auto-filled from selection)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={banner.url ?? ''}
                    onChange={(e) =>
                      updateBanner(index, { ...banner, url: e.target.value || null })
                    }
                    placeholder="https://home-healers.com/offers/22"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
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
