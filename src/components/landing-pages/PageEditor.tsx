import React, { useState } from 'react';
import { LandingPage, LandingPageSection } from '../../types/settings';
import { Save, X, Plus, GripVertical, Trash2, Edit2, Eye, Settings as SettingsIcon } from 'lucide-react';
import SectionEditor from './SectionEditor';
import PageSEOSection from './PageSEOSection';

interface PageEditorProps {
  page: LandingPage;
  onSave: (page: LandingPage) => void;
  onCancel: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ page, onSave, onCancel }) => {
  const [editedPage, setEditedPage] = useState<LandingPage>(page);
  const [activeTab, setActiveTab] = useState<'content' | 'sections' | 'seo'>('content');
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);

  const updateField = (field: keyof LandingPage, value: any) => {
    setEditedPage(prev => ({ ...prev, [field]: value }));
  };

  const updateMultilingualField = (
    field: keyof LandingPage,
    lang: 'en' | 'ar',
    value: string
  ) => {
    setEditedPage(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        [lang]: value,
      },
    }));
  };

  const addSection = () => {
    const newSection: LandingPageSection = {
      type: 'hero',
      title: { en: 'New Section', ar: 'قسم جديد' },
      content: { en: 'Section content', ar: 'محتوى القسم' },
      order: (editedPage.sections?.length || 0) + 1,
      display_mode: 'section',
    };
    setEditedPage(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
    setEditingSection(newSection);
  };

  const updateSection = (updatedSection: LandingPageSection) => {
    setEditedPage(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s =>
        s.order === updatedSection.order ? updatedSection : s
      ),
    }));
    setEditingSection(null);
  };

  const deleteSection = (order: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setEditedPage(prev => ({
        ...prev,
        sections: (prev.sections || [])
          .filter(s => s.order !== order)
          .map((s, idx) => ({ ...s, order: idx + 1 })),
      }));
    }
  };

  const updateSEO = (seo: LandingPage['seo']) => {
    setEditedPage(prev => ({ ...prev, seo }));
  };

  if (editingSection) {
    return (
      <SectionEditor
        section={editingSection}
        onSave={updateSection}
        onCancel={() => setEditingSection(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Landing Page</h2>
          <p className="text-sm text-gray-600 mt-1">Configure page content, sections, and SEO</p>
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
            onClick={() => onSave(editedPage)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Page
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'content', label: 'Page Content', icon: Edit2 },
            { id: 'sections', label: 'Sections', icon: SettingsIcon },
            { id: 'seo', label: 'SEO Settings', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* English */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">English Content</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Name
                </label>
                <input
                  type="text"
                  value={editedPage.name?.en || ''}
                  onChange={(e) => updateMultilingualField('name', 'en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={editedPage.title?.en || ''}
                  onChange={(e) => updateMultilingualField('title', 'en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editedPage.description?.en || ''}
                  onChange={(e) => updateMultilingualField('description', 'en', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Arabic */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Arabic Content</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الصفحة
                </label>
                <input
                  type="text"
                  value={editedPage.name?.ar || ''}
                  onChange={(e) => updateMultilingualField('name', 'ar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الصفحة
                </label>
                <input
                  type="text"
                  value={editedPage.title?.ar || ''}
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
                  value={editedPage.description?.ar || ''}
                  onChange={(e) => updateMultilingualField('description', 'ar', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Slug (URL)
            </label>
            <input
              type="text"
              value={editedPage.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="home, about-us, services"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in the URL: /landing/{editedPage.slug}
            </p>
          </div>
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Page Sections</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add and manage sections for this landing page
              </p>
            </div>
            <button
              onClick={addSection}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-3">
            {editedPage.sections
              ?.sort((a, b) => a.order - b.order)
              .map((section) => (
                <div
                  key={section.order}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="text-gray-400 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {section.type}
                          </span>
                          {section.display_mode === 'slider' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Slider ({section.slide_type || 'services'})
                            </span>
                          )}
                          <span className="font-medium text-gray-900">
                            {section.type === 'banner' 
                              ? 'Banner Section' 
                              : section.title?.en || section.title?.ar || 'Untitled Section'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Order: {section.order}
                          {section.type === 'services' && section.selected_services && (
                            <span className="ml-2">
                              • {section.selected_services.length} service(s)
                            </span>
                          )}
                          {section.display_mode === 'slider' && section.slide_type === 'doctors' && section.selected_doctors && (
                            <span className="ml-2">
                              • {section.selected_doctors.length} doctor(s)
                            </span>
                          )}
                          {section.display_mode === 'slider' && section.slide_type === 'packages' && section.selected_packages && (
                            <span className="ml-2">
                              • {section.selected_packages.length} package(s)
                            </span>
                          )}
                          {section.display_mode === 'slider' && section.slide_type === 'offers' && section.selected_offers && (
                            <span className="ml-2">
                              • {section.selected_offers.length} offer(s)
                            </span>
                          )}
                          {section.display_mode === 'slider' && section.slide_type === 'blogs' && section.selected_blogs && (
                            <span className="ml-2">
                              • {section.selected_blogs.length} blog(s)
                            </span>
                          )}
                          {section.display_mode === 'slider' && section.slide_type === 'services' && section.selected_services && (
                            <span className="ml-2">
                              • {section.selected_services.length} service(s)
                            </span>
                          )}
                          {section.display_mode === 'slider' && section.slide_type === 'faqs' && section.selected_faqs && (
                            <span className="ml-2">
                              • {section.selected_faqs.length} FAQ(s)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSection(section.order)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {(!editedPage.sections || editedPage.sections.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No sections added yet</p>
                <button
                  onClick={addSection}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Section
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <PageSEOSection
          seo={editedPage.seo}
          metaTitle={editedPage.meta_title}
          metaDescription={editedPage.meta_description}
          onUpdate={updateSEO}
          onUpdateMetaTitle={(value) => updateField('meta_title', value)}
          onUpdateMetaDescription={(value) => updateField('meta_description', value)}
        />
      )}
    </div>
  );
};

export default PageEditor;
