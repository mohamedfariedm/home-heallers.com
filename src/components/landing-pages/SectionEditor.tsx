import React, { useState } from 'react';
import Image from 'next/image';
import { LandingPageSection, CallToActionButton, FormField, FormFieldOption } from '../../types/settings';
import { Save, X, Image as ImageIcon, Plus, Trash2, FileText, Settings } from 'lucide-react';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';
import { useServices } from '@/framework/services';
import { useDoctors } from '@/framework/doctors';
import { usePackages } from '@/framework/packages';
import { useBlogs } from '@/framework/blog';
import { useFaqs } from '@/framework/faqs';
import SelectBox from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';

interface SectionEditorProps {
  section: LandingPageSection;
  onSave: (section: LandingPageSection) => void;
  onCancel: () => void;
}

const sectionTypes = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'section', label: 'Section' },
  { value: 'banner', label: 'Banner' },
  { value: 'form', label: 'Form Builder' },
];

const formFieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date Picker' },
  { value: 'time', label: 'Time Picker' },
  { value: 'file', label: 'File Upload' },
];

const slideTypes = [
  { value: 'services', label: 'Services' },
  { value: 'doctors', label: 'Doctors' },
  { value: 'blogs', label: 'Blogs' },
  { value: 'packages', label: 'Packages' },
  { value: 'offers', label: 'Offers' },
  { value: 'faqs', label: 'FAQs' },
];

const SectionEditor: React.FC<SectionEditorProps> = ({ section, onSave, onCancel }) => {
  const [editedSection, setEditedSection] = useState<LandingPageSection>({
    ...section,
    display_mode: section.display_mode || 'section',
    active: section.active !== undefined ? section.active : true, // Default value is true
    payment_link: section.payment_link !== undefined ? section.payment_link : false, // Default value is false
  });

  // Fetch data for different slide types
  const { data: servicesData, isLoading: isLoadingServices } = useServices('limit=1000');
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors('limit=1000');
  const { data: packagesData, isLoading: isLoadingPackages } = usePackages('limit=1000');
  const { data: blogsData, isLoading: isLoadingBlogs } = useBlogs('limit=1000');
  const { data: faqsData, isLoading: isLoadingFaqs } = useFaqs();

  const services = servicesData?.data || [];
  const doctors = doctorsData?.data || [];
  const packages = packagesData?.data || [];
  const blogs = blogsData?.data || [];
  const faqs = faqsData?.data || [];

  const updateField = (field: keyof LandingPageSection, value: any) => {
    setEditedSection(prev => ({ ...prev, [field]: value }));
  };

  const updateMultilingualField = (
    field: 'title' | 'content',
    lang: 'en' | 'ar',
    value: string
  ) => {
    setEditedSection(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        [lang]: value,
      },
    }));
  };

  const handleImageUpload = (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      // Handle both FileUpload format and direct attachment format
      const attachment = {
        id: file.id || Date.now(),
        thumbnail: file.thumbnail || file.original || file.url || file.path || '',
        original: file.original || file.url || file.path || '',
      };
      updateField('attachment', attachment);
      updateField('image', attachment.original);
    }
  };

  const handleRemoveImage = () => {
    updateField('attachment', undefined);
    updateField('image', '');
  };

  const isBannerSection = editedSection.type === 'banner';
  const isHeroSection = editedSection.type === 'hero';
  const isServicesSection = editedSection.type === 'services';
  const isFormSection = editedSection.type === 'form';
  const showSliderOptions = editedSection.display_mode === 'slider';
  const showContentFields = !isBannerSection;

  // Button management functions
  const addButton = () => {
    const newButton: CallToActionButton = {
      text: { en: '', ar: '' },
      link: '',
      style: 'primary',
      open_in_new_tab: false,
    };
    updateField('buttons', [...(editedSection.buttons || []), newButton]);
  };

  const updateButton = (index: number, field: keyof CallToActionButton, value: any) => {
    const buttons = [...(editedSection.buttons || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    updateField('buttons', buttons);
  };

  const removeButton = (index: number) => {
    const buttons = (editedSection.buttons || []).filter((_: any, i: number) => i !== index);
    updateField('buttons', buttons);
  };

  // Form Field management functions
  const addFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: { en: '', ar: '' },
      type: 'text',
      placeholder: { en: '', ar: '' },
      required: false,
    };
    updateField('form_fields', [...(editedSection.form_fields || []), newField]);
  };

  const updateFormField = (index: number, field: keyof FormField, value: any) => {
    const fields = [...(editedSection.form_fields || [])];
    fields[index] = { ...fields[index], [field]: value };
    updateField('form_fields', fields);
  };

  const removeFormField = (index: number) => {
    const fields = (editedSection.form_fields || []).filter((_: any, i: number) => i !== index);
    updateField('form_fields', fields);
  };

  const addFieldOption = (fieldIndex: number) => {
    const fields = [...(editedSection.form_fields || [])];
    const newOption: FormFieldOption = {
      value: `option_${Date.now()}`,
      label: { en: '', ar: '' },
    };
    fields[fieldIndex].options = [...(fields[fieldIndex].options || []), newOption];
    updateField('form_fields', fields);
  };

  const updateFieldOption = (fieldIndex: number, optionIndex: number, field: keyof FormFieldOption, value: any) => {
    const fields = [...(editedSection.form_fields || [])];
    const options = [...(fields[fieldIndex].options || [])];
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    fields[fieldIndex].options = options;
    updateField('form_fields', fields);
  };

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    const fields = [...(editedSection.form_fields || [])];
    fields[fieldIndex].options = (fields[fieldIndex].options || []).filter((_: any, i: number) => i !== optionIndex);
    updateField('form_fields', fields);
  };


  // Get data and loading state based on slide type
  const getSlideTypeData = () => {
    const slideType = editedSection.slide_type;
    switch (slideType) {
      case 'services':
        return { data: services, loading: isLoadingServices, field: 'selected_services' };
      case 'doctors':
        return { data: doctors, loading: isLoadingDoctors, field: 'selected_doctors' };
      case 'packages':
        return { data: packages, loading: isLoadingPackages, field: 'selected_packages' };
      case 'offers':
        return { data: packages, loading: isLoadingPackages, field: 'selected_offers' }; // Assuming offers use packages API
      case 'blogs':
        return { data: blogs, loading: isLoadingBlogs, field: 'selected_blogs' };
      case 'faqs':
        return { data: faqs, loading: isLoadingFaqs, field: 'selected_faqs' };
      default:
        return { data: [], loading: false, field: '' };
    }
  };

  const slideTypeData = getSlideTypeData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Section</h2>
          <p className="text-sm text-gray-600 mt-1">Configure section content and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={() => onSave(editedSection)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Section
          </button>
        </div>
      </div>

      {/* Section Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Type
        </label>
        <select
          value={editedSection.type}
          onChange={(e) => {
            const newType = e.target.value;
            updateField('type', newType);
            // Reset display mode when changing type
            if (newType === 'banner') {
              updateField('display_mode', 'section');
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sectionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Active
          </label>
          <p className="text-xs text-gray-500">Show this section on the page</p>
        </div>
        <button
          type="button"
          onClick={() => updateField('active', !editedSection.active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            editedSection.active !== false ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              editedSection.active !== false ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Display Mode - For all sections except banner */}
      {!isBannerSection && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Mode
          </label>
          <select
            value={editedSection.display_mode || 'section'}
            onChange={(e) => updateField('display_mode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="section">Section</option>
            <option value="slider">Swiper Slider</option>
          </select>
        </div>
      )}

      {/* Slide Type - When slider is selected */}
      {showSliderOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slide Type
          </label>
          <select
            value={editedSection.slide_type || 'services'}
            onChange={(e) => {
              updateField('slide_type', e.target.value);
              // Clear previous selections when changing slide type
              updateField('selected_services', undefined);
              updateField('selected_doctors', undefined);
              updateField('selected_packages', undefined);
              updateField('selected_offers', undefined);
              updateField('selected_blogs', undefined);
              updateField('selected_faqs', undefined);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {slideTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the type of content to display in the slider
          </p>
        </div>
      )}

      {/* Slide Type Data Selection - When slider is selected */}
      {showSliderOptions && editedSection.slide_type && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-4">
            Select {slideTypes.find(t => t.value === editedSection.slide_type)?.label || 'Items'} for Slider
          </h4>
          {slideTypeData.loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : slideTypeData.data.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">
                No {editedSection.slide_type} available
              </p>
            </div>
          ) : (
            <>
              <SelectBox
                multiple
                options={slideTypeData.data.map((item: any) => ({
                  value: item.id,
                  label: item.name?.en || item.name?.ar || item.name || 
                         item.title?.en || item.title?.ar || item.title || 
                         item.question?.en || item.question?.ar || item.question ||
                         `Item ${item.id}`,
                }))}
                value={slideTypeData.data
                  .filter((item: any) => (editedSection as any)[slideTypeData.field]?.includes(item.id))
                  .map((item: any) => ({
                    value: item.id,
                    label: item.name?.en || item.name?.ar || item.name || 
                           item.title?.en || item.title?.ar || item.title || 
                           item.question?.en || item.question?.ar || item.question ||
                           `Item ${item.id}`,
                  }))}
                onChange={(selected: any) => {
                  const selectedIds = Array.isArray(selected)
                    ? selected.map((s: any) => s.value)
                    : selected
                    ? [selected.value]
                    : [];
                  updateField(slideTypeData.field as keyof LandingPageSection, selectedIds);
                }}
                label={`Select ${slideTypes.find(t => t.value === editedSection.slide_type)?.label || 'Items'}`}
                placeholder={`Select ${editedSection.slide_type} to display in the slider`}
                displayValue={(val: any) => {
                  if (Array.isArray(val)) {
                    if (val.length === 0) return '';
                    return val.map((o: any) => o?.label ?? o?.name ?? o?.value).join(', ');
                  }
                  return val?.label || val?.name || val || '';
                }}
              />
              {(editedSection as any)[slideTypeData.field] && (editedSection as any)[slideTypeData.field].length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {(editedSection as any)[slideTypeData.field].length} item(s) selected
                </p>
              )}
              
              {/* Payment Link Toggle - Only show for packages or offers */}
              {(editedSection.slide_type === 'packages' || editedSection.slide_type === 'offers') && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Link
                    </label>
                    <p className="text-xs text-gray-500">Enable payment link for selected packages/offers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('payment_link', !editedSection.payment_link)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editedSection.payment_link ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editedSection.payment_link ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Order
        </label>
        <input
          type="number"
          value={editedSection.order}
          onChange={(e) => updateField('order', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
        />
      </div>

      {/* Content - English and Arabic - Only show if not banner */}
      {showContentFields && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* English */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">English Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editedSection.title?.en || ''}
                onChange={(e) => updateMultilingualField('title', 'en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editedSection.content?.en || ''}
                onChange={(e) => updateMultilingualField('content', 'en', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Arabic */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Arabic Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <input
                type="text"
                value={editedSection.title?.ar || ''}
                onChange={(e) => updateMultilingualField('title', 'ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                value={editedSection.content?.ar || ''}
                onChange={(e) => updateMultilingualField('content', 'ar', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Upload - For all non-banner sections, but ONLY when display mode is "Section" (not "Slider") */}
      {showContentFields && !showSliderOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Image
          </label>
          <FileUpload
            label="Upload Section Image"
            onUpload={handleImageUpload}
            onRemove={handleRemoveImage}
            currentFiles={editedSection.attachment ? [editedSection.attachment] : []}
            multiple={false}
            accept="image/*"
          />
          {editedSection.attachment?.original && (
            <div className="mt-4">
              <Image
                src={editedSection.attachment.thumbnail || editedSection.attachment.original}
                alt="Section preview"
                width={500}
                height={300}
                className="max-w-md rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      )}

      {/* Banner Image - Always show for banner sections */}
      {isBannerSection && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image
          </label>
          <FileUpload
            label="Upload Banner Image"
            onUpload={handleImageUpload}
            onRemove={handleRemoveImage}
            currentFiles={editedSection.attachment ? [editedSection.attachment] : []}
            multiple={false}
            accept="image/*"
          />
          {editedSection.attachment?.original && (
            <div className="mt-4">
              <Image
                src={editedSection.attachment.thumbnail || editedSection.attachment.original}
                alt="Banner preview"
                width={500}
                height={300}
                className="max-w-md rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      )}

      {/* Services Selection - For Services Section (not slider) */}
      {isServicesSection && !showSliderOptions && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-4">Select Services</h4>
          {isLoadingServices ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <SelectBox
              multiple
              options={services.map((service: any) => ({
                value: service.id,
                label: service.name?.en || service.name?.ar || service.name || `Service ${service.id}`,
              }))}
              value={services
                .filter((s: any) => editedSection.selected_services?.includes(s.id))
                .map((s: any) => ({
                  value: s.id,
                  label: s.name?.en || s.name?.ar || s.name || `Service ${s.id}`,
                }))}
              onChange={(selected: any) => {
                const selectedIds = Array.isArray(selected)
                  ? selected.map((s: any) => s.value)
                  : selected
                  ? [selected.value]
                  : [];
                updateField('selected_services', selectedIds);
              }}
              label="Services"
              placeholder="Select services to display"
              displayValue={(val: any) => {
                if (Array.isArray(val)) {
                  if (val.length === 0) return '';
                  return val.map((o: any) => o?.label ?? o?.name ?? o?.value).join(', ');
                }
                return val?.label || val?.name || val || '';
              }}
            />
          )}
          {editedSection.selected_services && editedSection.selected_services.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {editedSection.selected_services.length} service(s) selected
            </p>
          )}
        </div>
      )}

      {/* Call-to-Action Buttons - Available for ALL sections except Form */}
      {!isFormSection && (
        <div className="space-y-4 border-t-2 border-green-200 pt-6 mt-6">
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🔘</span>
                Call-to-Action Buttons (Optional)
              </h4>
              <p className="text-sm text-gray-600 mt-1">Add action buttons to this section</p>
            </div>
            <button
              type="button"
              onClick={addButton}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Button
            </button>
          </div>
          
          {editedSection.buttons && editedSection.buttons.length > 0 ? (
            <div className="space-y-4">
              {editedSection.buttons.map((button, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4 hover:border-green-300 transition-colors">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h5 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Button {index + 1}
                      </span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeButton(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Text (English) *
                      </label>
                      <input
                        type="text"
                        value={button.text?.en || ''}
                        onChange={(e) => updateButton(index, 'text', { ...button.text, en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Click Here"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Text (Arabic) *
                      </label>
                      <input
                        type="text"
                        value={button.text?.ar || ''}
                        onChange={(e) => updateButton(index, 'text', { ...button.text, ar: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="انقر هنا"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link (URL) *
                    </label>
                    <input
                      type="text"
                      value={button.link || ''}
                      onChange={(e) => updateButton(index, 'link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="https://example.com/action"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Style
                      </label>
                      <select
                        value={button.style || 'primary'}
                        onChange={(e) => updateButton(index, 'style', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="primary">Primary (Solid)</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={button.open_in_new_tab || false}
                          onChange={(e) => updateButton(index, 'open_in_new_tab', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm text-gray-700 font-medium">Open in new tab</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-2">🔘</div>
              <p className="text-sm text-gray-600">No buttons added yet</p>
              <p className="text-xs text-gray-500 mt-1">Click &quot;Add Button&quot; to create your first CTA button</p>
            </div>
          )}
        </div>
      )}

      {/* Form Builder - Only for Form Section Type */}
      {isFormSection && (
        <div className="space-y-6 border-t-2 border-purple-200 pt-6 mt-6">
          <div className="flex items-center justify-between bg-purple-50 px-4 py-3 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Form Fields Builder
              </h4>
              <p className="text-sm text-gray-600 mt-1">Create and manage your form fields</p>
            </div>
            <button
              type="button"
              onClick={addFormField}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>

          {/* Form Fields List */}
          {editedSection.form_fields && editedSection.form_fields.length > 0 ? (
            <div className="space-y-4">
              {editedSection.form_fields.map((field: FormField, fieldIndex: number) => (
                <div key={field.id} className="bg-white border-2 border-purple-200 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <h5 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-600" />
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        Field {fieldIndex + 1}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">({field.type})</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeFormField(fieldIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Field Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type *
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateFormField(fieldIndex, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      {formFieldTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Field Labels */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Label (English) *
                      </label>
                      <input
                        type="text"
                        value={field.label?.en || ''}
                        onChange={(e) => updateFormField(fieldIndex, 'label', { ...field.label, en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Label (Arabic) *
                      </label>
                      <input
                        type="text"
                        value={field.label?.ar || ''}
                        onChange={(e) => updateFormField(fieldIndex, 'label', { ...field.label, ar: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="الاسم الكامل"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Field Placeholders */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder (English)
                      </label>
                      <input
                        type="text"
                        value={field.placeholder?.en || ''}
                        onChange={(e) => updateFormField(fieldIndex, 'placeholder', { ...(field.placeholder || { en: '', ar: '' }), en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder (Arabic)
                      </label>
                      <input
                        type="text"
                        value={field.placeholder?.ar || ''}
                        onChange={(e) => updateFormField(fieldIndex, 'placeholder', { ...(field.placeholder || { en: '', ar: '' }), ar: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="أدخل اسمك الكامل"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Required Checkbox */}
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => updateFormField(fieldIndex, 'required', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">Required Field</span>
                    </label>
                  </div>

                  {/* Options for Select, Radio, Checkbox */}
                  {['select', 'radio', 'checkbox'].includes(field.type) && (
                    <div className="border-t border-purple-100 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">
                          Options (for {field.type})
                        </label>
                        <button
                          type="button"
                          onClick={() => addFieldOption(fieldIndex)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-xs font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          Add Option
                        </button>
                      </div>

                      {field.options && field.options.length > 0 ? (
                        <div className="space-y-2">
                          {field.options.map((option: FormFieldOption, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                              <div className="flex-1 grid md:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => updateFieldOption(fieldIndex, optionIndex, 'value', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  placeholder="option_value"
                                />
                                <input
                                  type="text"
                                  value={option.label?.en || ''}
                                  onChange={(e) => updateFieldOption(fieldIndex, optionIndex, 'label', { ...option.label, en: e.target.value })}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  placeholder="Label (EN)"
                                />
                                <input
                                  type="text"
                                  value={option.label?.ar || ''}
                                  onChange={(e) => updateFieldOption(fieldIndex, optionIndex, 'label', { ...option.label, ar: e.target.value })}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  placeholder="التسمية (AR)"
                                  dir="rtl"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFieldOption(fieldIndex, optionIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                title="Remove Option"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                          <p className="text-xs text-gray-600">No options added yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Validation Rules for Number fields */}
                  {field.type === 'number' && (
                    <div className="border-t border-purple-100 pt-4 mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Validation Rules (Optional)
                      </label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Min Value</label>
                          <input
                            type="number"
                            value={field.validation?.min || ''}
                            onChange={(e) => updateFormField(fieldIndex, 'validation', { 
                              ...(field.validation || {}), 
                              min: e.target.value ? Number(e.target.value) : undefined 
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Max Value</label>
                          <input
                            type="number"
                            value={field.validation?.max || ''}
                            onChange={(e) => updateFormField(fieldIndex, 'validation', { 
                              ...(field.validation || {}), 
                              max: e.target.value ? Number(e.target.value) : undefined 
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-sm text-gray-600 font-medium">No form fields added yet</p>
              <p className="text-xs text-gray-500 mt-1">Click &quot;Add Field&quot; to create your first form field</p>
            </div>
          )}

          {/* Form Settings */}
          <div className="border-t-2 border-purple-200 pt-6 space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Form Settings
            </h4>

            {/* Submit Button Text */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submit Button Text (English)
                </label>
                <input
                  type="text"
                  value={editedSection.form_submit_text?.en || ''}
                  onChange={(e) => updateField('form_submit_text', { 
                    ...(editedSection.form_submit_text || { en: '', ar: '' }), 
                    en: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Submit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submit Button Text (Arabic)
                </label>
                <input
                  type="text"
                  value={editedSection.form_submit_text?.ar || ''}
                  onChange={(e) => updateField('form_submit_text', { 
                    ...(editedSection.form_submit_text || { en: '', ar: '' }), 
                    ar: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="إرسال"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Success Message */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Message (English)
                </label>
                <textarea
                  value={editedSection.form_success_message?.en || ''}
                  onChange={(e) => updateField('form_success_message', { 
                    ...(editedSection.form_success_message || { en: '', ar: '' }), 
                    en: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  rows={2}
                  placeholder="Thank you! Your submission has been received."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Message (Arabic)
                </label>
                <textarea
                  value={editedSection.form_success_message?.ar || ''}
                  onChange={(e) => updateField('form_success_message', { 
                    ...(editedSection.form_success_message || { en: '', ar: '' }), 
                    ar: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  rows={2}
                  placeholder="شكراً لك! تم استلام طلبك."
                  dir="rtl"
                />
              </div>
            </div>

            {/* API Endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form API Endpoint (Optional)
              </label>
              <input
                type="text"
                value={editedSection.form_api_endpoint || ''}
                onChange={(e) => updateField('form_api_endpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="/api/contact-form"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default form handler
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
