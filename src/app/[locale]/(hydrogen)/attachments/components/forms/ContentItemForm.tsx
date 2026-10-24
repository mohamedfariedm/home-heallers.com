import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from '../ui/FormField';
import { FileUpload } from '../ui/FileUpload';
import { FormSection } from '../ui/FormSection';
import { Save, Trash2 } from 'lucide-react';
import { FormItem } from '@/types/form';
import QuillEditor from '@/components/ui/quill-editor';

interface ContentItemFormProps {
  item: FormItem;
  onUpdate: (data: any) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  hasImages?: boolean;
}

export const ContentItemForm: React.FC<ContentItemFormProps> = ({
  item,
  onUpdate,
  onDelete,
  isLoading = false,
  hasImages = false,
}) => {
  const { t } = useTranslation('attachments');
  const [currentImages, setCurrentImages] = useState(item.attachment || []);
  const isMultiple = Array.isArray(item.attachment) && item.attachment.length > 1;

  const { register, handleSubmit, formState: { errors },control } = useForm({
    defaultValues: {
      title_en: item.title?.en === 'Empty' ? '' : (item.title?.en || ''),
      title_ar: item.title?.ar === 'Empty' ? '' : (item.title?.ar || ''),
      title_value: item.title?.value || 0,
      description_en: item.description?.en === 'Empty' ? '' : (item.description?.en || ''),
      description_ar: item.description?.ar === 'Empty' ? '' : (item.description?.ar || ''),
      additional_link: item.additional?.link || '',
      additional_date_en: item.additional?.date?.en || '',
      additional_date_ar: item.additional?.date?.ar || '',
    },
  });

  const handleFileUpload = (uploadedFiles: any[]) => {
    // If not in multiple mode, keep only the first uploaded file
    if (!isMultiple) {
      setCurrentImages(uploadedFiles.slice(0, 1));
    } else {
      // In multiple mode, append new files to existing ones
      setCurrentImages((prev) => [...prev, ...uploadedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setCurrentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    const formattedData = {
      id: item.id,
      section_id: item.section_id,
      title: {
        en: data.title_en.trim() || 'Empty',
        ar: data.title_ar.trim() || 'Empty',
        ...(data.title_value && { value: Number(data.title_value) }),
      },
      description: item.description
        ? {
            en: data.description_en.trim() || 'Empty',
            ar: data.description_ar.trim() || 'Empty',
          }
        : undefined,
      attachment: currentImages,
      additional: {
        ...(item.additional?.link !== undefined && { link: data.additional_link }),
        ...(item.additional?.date !== undefined && {
          date: {
            en: data.additional_date_en,
            ar: data.additional_date_ar,
          },
        }),
      },
      children: item.children || [],
    };

    onUpdate(formattedData);
  };

  return (
    <FormSection
      title={t('attachments_content_item', {
        id: item.id,
        defaultValue: 'Content Item #{{id}}',
      })}
      className="mb-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            name="title_en"
            label={t('attachments_field_title_en', 'Title (English)')}
            type="text"
            register={register}
            errors={errors}
            placeholder={t('attachments_field_title_en_ph', 'Enter English title')}
            required
          />
          <FormField
            name="title_ar"
            label={t('attachments_field_title_ar', 'Title (Arabic)')}
            type="text"
            register={register}
            errors={errors}
            placeholder={t('attachments_field_title_ar_ph', 'Enter Arabic title')}
            required
          />
        </div>

        {/* Value Field (if exists) */}
        {item.title?.value !== undefined && (
          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              name="title_value"
              label={t('attachments_field_value', 'Value')}
              type="number"
              register={register}
              errors={errors}
              placeholder={t('attachments_field_value_ph', 'Enter value')}
            />
          </div>
        )}

        {/* Description Fields */}
        {item.description&&item.section_id !== 2  && (
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              name="description_en"
              label={t('attachments_field_desc_en', 'Description (English)')}
              type="textarea"
              register={register}
              errors={errors}
              placeholder={t('attachments_field_desc_en_ph', 'Enter English description')}
            />
            <FormField
              name="description_ar"
              label={t('attachments_field_desc_ar', 'Description (Arabic)')}
              type="textarea"
              register={register}
              errors={errors}
              placeholder={t('attachments_field_desc_ar_ph', 'Enter Arabic description')}
            />
          </div>
        )}
        {item.description &&item.section_id === 2 && (
          <div className="grid md:grid-cols-2 gap-6">
            <QuillEditor
              name="description_en"
              label={t('attachments_field_desc_en', 'Description (English)')}
              control={control}
              error={errors.description_en?.message}
              placeholder={t('attachments_field_desc_en_ph', 'Enter English description')}
            />
            <QuillEditor
              name="description_ar"
              label={t('attachments_field_desc_ar', 'Description (Arabic)')}
              error={errors.description_ar?.message}
              control={control}
              placeholder={t('attachments_field_desc_ar_ph', 'Enter Arabic description')}
            />
          </div>
        )}

        {/* Additional Fields */}
        {item.additional?.link !== undefined && (
          <FormField
            name="additional_link"
            label={t('attachments_field_link', 'Link')}
            type="url"
            register={register}
            errors={errors}
            placeholder="https://example.com"
          />
        )}

        {item.additional?.date && (
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              name="additional_date_en"
              label={t('attachments_field_date_en', 'Date (English)')}
              type="text"
              register={register}
              errors={errors}
              placeholder={t('attachments_field_date_en_ph', 'Enter date in English')}
            />
            <FormField
              name="additional_date_ar"
              label={t('attachments_field_date_ar', 'Date (Arabic)')}
              type="text"
              register={register}
              errors={errors}
              placeholder={t('attachments_field_date_ar_ph', 'Enter date in Arabic')}
            />
          </div>
        )}

        {/* File Upload */}
        {hasImages && (
          <FileUpload
            label={t('attachments_images', 'Images')}
            onUpload={handleFileUpload}
            onRemove={handleRemoveFile}
            currentFiles={currentImages}
            multiple={true}
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t('shared_delete', 'Delete')}
            </button>
          )}
          <div className="flex gap-3 ml-auto">

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('shared_update', 'Update')}
            </button>
          </div>
        </div>
      </form>
    </FormSection>
  );
};