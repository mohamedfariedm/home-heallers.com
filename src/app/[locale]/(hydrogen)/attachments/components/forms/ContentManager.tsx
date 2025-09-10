import React, { useState } from 'react';
import { SectionSettings } from './SectionSettings';
import { ContentItemForm } from './ContentItemForm';
import { Plus, FileText, Image, List } from 'lucide-react';
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
    <div className="w-full mx-auto p-6 space-y-8">

      {/* Section Settings */}
      <SectionSettings
        section={data.section}
        onUpdate={onUpdateSection}
        key={data.section.id}
        isLoading={isLoading}
      />

      {/* Content Items */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Content Items ({data.data.length})
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              <span>{hasImages ? 'Has Images' : 'No Images'}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{hasDescriptions ? 'Has Descriptions' : 'Titles Only'}</span>
            </div>
          </div>
        </div>

        {data.data.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content items yet
            </h3>
            <p className="text-gray-600 mb-4">
              This section doesn t have any content items to display.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((item, index) => {
              const ItemIcon = getItemIcon(item);
              const isActive = activeItem === item.id;
              
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Item Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setActiveItem(isActive ? null : item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <ItemIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.title?.en || `Item ${item.id}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {item.id} • Updated: {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isActive ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Item Form */}
                  {isActive && (
                    <div className="p-6 bg-white border-t border-gray-200">
                      <ContentItemForm
                        item={item}
                        onUpdate={onUpdateItem}
                        onDelete={onDeleteItem ? () => onDeleteItem(item.id) : undefined}
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