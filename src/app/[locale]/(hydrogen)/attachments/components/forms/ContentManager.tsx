import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionSettings } from './SectionSettings';
import { ContentItemForm } from './ContentItemForm';
import { FileText, Image, List } from 'lucide-react';
import { FormData } from '@/types/form';

interface ContentManagerProps {
  data: FormData;
  onUpdateSection: (data: any) => void;
  onUpdateItem: (data: any) => void;
  onDeleteItem?: (id: number) => void;
  isLoading?: boolean;
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  data,
  onUpdateSection,
  onUpdateItem,
  onDeleteItem,
  isLoading = false
}) => {
  const { t, i18n } = useTranslation('attachments');
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const [activeItem, setActiveItem] = useState<number | null>(null);

  // Determine if this section has images based on existing data
  const hasImages = data.data.some(item => item.attachment && item.attachment.length > 0);
  
  // Determine if items have descriptions
  const hasDescriptions = data.data.some(item => item.description);
  
  // Determine if items have additional fields
  const hasAdditionalFields = data.data.some(item => 
    item.additional && (item.additional.link || item.additional.date)
  );

  const getItemIcon = (item: any) => {
    if (item.attachment && item.attachment.length > 0) return Image;
    if (item.description) return FileText;
    return List;
  };

  return (
    <div className="w-full space-y-8">
      <SectionSettings
        section={data.section}
        onUpdate={onUpdateSection}
        key={data.section.id}
        isLoading={isLoading}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('attachments_content_items', {
              count: data.data.length,
              defaultValue: 'Content Items ({{count}})',
            })}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Image className="h-4 w-4 text-[#143087]" />
              <span>
                {hasImages
                  ? t('attachments_has_images', 'Has Images')
                  : t('attachments_no_images', 'No Images')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#143087]" />
              <span>
                {hasDescriptions
                  ? t('attachments_has_descriptions', 'Has Descriptions')
                  : t('attachments_titles_only', 'Titles Only')}
              </span>
            </div>
          </div>
        </div>

        {data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <List className="h-7 w-7 text-[#143087]" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              {t('attachments_empty_title', 'No content items yet')}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-400">
              {t(
                'attachments_empty_hint',
                "This section doesn't have any content items to display."
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((item) => {
              const ItemIcon = getItemIcon(item);
              const isActive = activeItem === item.id;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between bg-gray-50/80 p-4 transition-colors hover:bg-blue-50/40"
                    onClick={() => setActiveItem(isActive ? null : item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                        <ItemIcon className="h-4 w-4 text-[#143087]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.title?.[lang] ||
                            item.title?.en ||
                            item.title?.ar ||
                            t('attachments_item_fallback', {
                              id: item.id,
                              defaultValue: 'Item {{id}}',
                            })}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {t('attachments_item_meta', {
                            id: item.id,
                            date: new Date(item.updated_at).toLocaleDateString(),
                            defaultValue: 'ID: {{id}} • Updated: {{date}}',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.active
                          ? t('shared_active', 'Active')
                          : t('shared_inactive', 'Inactive')}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isActive ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {isActive && (
                    <div className="border-t border-gray-100 bg-white p-6">
                      <ContentItemForm
                        item={item}
                        onUpdate={onUpdateItem}
                        onDelete={
                          onDeleteItem ? () => onDeleteItem(item.id) : undefined
                        }
                        isLoading={isLoading}
                        hasImages={hasImages}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};