import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '../ui/FormField';
import { FormSection } from '../ui/FormSection';
import { Save, Settings } from 'lucide-react';
import { Section } from '@/types/form';

interface SectionSettingsProps {
  section: Section;
  onUpdate: (data: any) => void;
  isLoading?: boolean;
}

export const SectionSettings: React.FC<SectionSettingsProps> = ({
  section,
  onUpdate,
  isLoading = false
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title_en: section?.title?.en === "Empty" ? "" : section?.title?.en,
      title_ar: section?.title?.ar === "Empty" ? "" : section?.title?.ar,
      priority: section?.priority,
      active: section?.active === 1
    }
  });

  const onSubmit = (data: any) => {
    const updatedData = {
      section_id: section.id.toString(),
      page_id: section.page_id,
      active: data.active ? 1 : 0,
      priority: Number(data.priority),
      title: {
        en: data.title_en.trim() || "Empty",
        ar: data.title_ar.trim() || "Empty"
      }
    };
    onUpdate(updatedData);
  };

  return (
    <FormSection title="Section Settings" className="mb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            name="title_en"
            label="Section Title (English)"
            type="text"
            register={register}
            errors={errors}
            placeholder="Enter English title"
          />
          <FormField
            name="title_ar"
            label="Section Title (Arabic)"
            type="text"
            register={register}
            errors={errors}
            placeholder="Enter Arabic title"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FormField
            name="priority"
            label="Priority"
            type="number"
            register={register}
            errors={errors}
            placeholder="1"
          />
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Status
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('active')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Settings className="h-4 w-4" />
            )}
            Update Section
          </button>
        </div>
      </form>
    </FormSection>
  );
};