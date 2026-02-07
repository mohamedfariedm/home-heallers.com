import React, { useState } from 'react';
import { LandingPage, LandingPageSection } from '../../types/settings';
import { Save, X, Plus, GripVertical, Trash2, Edit2, Eye, Settings as SettingsIcon } from 'lucide-react';
import SectionEditor from './SectionEditor';
import PageSEOSection from './PageSEOSection';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageEditorProps {
  page: LandingPage;
  onSave: (page: LandingPage) => void | Promise<void>;
  onCancel: () => void;
  onSaveSection?: (pageId: number, section: LandingPageSection) => Promise<void>; // Optional API callback for section saves
}

// Sortable Section Item Component
interface SortableSectionItemProps {
  section: LandingPageSection;
  index: number;
  onEdit: (section: LandingPageSection) => void;
  onDelete: (order: number) => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({ section, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id || `${section.order}_${section.type}_${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 rounded-lg border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none"
          >
            <GripVertical className="text-gray-400" />
          </div>
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
              {section.active === false && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inactive
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
            onClick={() => onEdit(section)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(section.order)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PageEditor: React.FC<PageEditorProps> = ({ page, onSave, onCancel, onSaveSection }) => {
  const [editedPage, setEditedPage] = useState<LandingPage>(() => {
    // Initialize with a deep copy and ensure sections have proper order
    const pageCopy = {
      ...page,
      show_in_menu: page.show_in_menu ?? false,
      show_in_footer: page.show_in_footer ?? false,
      sections: (page.sections || []).map((section: LandingPageSection, index: number) => ({
        ...section,
        // Ensure order is set
        order: section.order || index + 1,
        // Ensure active is set (default: true)
        active: section.active !== undefined ? section.active : true,
      })),
    } as LandingPage;
    return pageCopy;
  });
  const [activeTab, setActiveTab] = useState<'content' | 'sections' | 'seo'>('content');
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);
  const [editingSectionOriginalOrder, setEditingSectionOriginalOrder] = useState<number | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    const newOrder = (editedPage.sections?.length || 0) + 1;
    const newSection: LandingPageSection = {
      type: 'hero',
      title: { en: 'New Section', ar: 'قسم جديد' },
      content: { en: 'Section content', ar: 'محتوى القسم' },
      order: newOrder,
      display_mode: 'section',
      active: true, // Default value is true
    };
    setEditedPage(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
    setEditingSectionOriginalOrder(newOrder);
    setEditingSection(newSection);
  };

  const updateSection = async (updatedSection: LandingPageSection) => {
    try {
      // If onSaveSection callback is provided and page has an ID, call API
      if (onSaveSection && page.id && updatedSection.id) {
        await onSaveSection(page.id, updatedSection);
      }

      setEditedPage(prev => {
        const sections = prev.sections || [];
        // Find section by id (if exists) or by original order
        const sectionIndex = sections.findIndex(s => {
          // If both have IDs, match by ID
          if (s.id && updatedSection.id && s.id === updatedSection.id) {
            return true;
          }
          // If editing section has original order tracked, use that
          if (editingSectionOriginalOrder !== null && s.order === editingSectionOriginalOrder) {
            return true;
          }
          // Fallback: match by current order and type (less reliable but works for new sections)
          if (!s.id && !updatedSection.id && s.order === updatedSection.order) {
            return true;
          }
          return false;
        });
        
        if (sectionIndex !== -1) {
          // Update existing section
          const newSections = [...sections];
          const oldSection = sections[sectionIndex];
          newSections[sectionIndex] = {
            ...updatedSection,
            // Preserve original id if it exists
            id: updatedSection.id !== undefined ? updatedSection.id : oldSection.id,
            // Ensure order is maintained
            order: updatedSection.order || oldSection.order,
          };
          return { ...prev, sections: newSections };
        } else {
          // Section not found, add it (shouldn't happen, but handle gracefully)
          console.warn('Section not found for update, adding as new section');
          return {
            ...prev,
            sections: [...sections, updatedSection],
          };
        }
      });
      setEditingSection(null);
      setEditingSectionOriginalOrder(null);
    } catch (error) {
      console.error('Error updating section:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  const deleteSection = (order: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setEditedPage(prev => {
        const sections = (prev.sections || [])
          .filter(s => s.order !== order)
          .map((s, idx) => ({ ...s, order: idx + 1 }));
        return { ...prev, sections };
      });
    }
  };

  // Handle drag end to reorder sections
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setEditedPage(prev => {
      const sections = [...(prev.sections || [])];
      const sortedSections = sections.sort((a, b) => a.order - b.order);
      
      const oldIndex = sortedSections.findIndex(s => 
        (s.id && String(s.id) === String(active.id)) ||
        (!s.id && `${s.order}_${s.type}_${sortedSections.indexOf(s)}` === String(active.id))
      );
      const newIndex = sortedSections.findIndex(s => 
        (s.id && String(s.id) === String(over.id)) ||
        (!s.id && `${s.order}_${s.type}_${sortedSections.indexOf(s)}` === String(over.id))
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Remove the item from its old position
        const [movedSection] = sortedSections.splice(oldIndex, 1);
        // Insert it at the new position
        sortedSections.splice(newIndex, 0, movedSection);
        // Update order numbers
        const reorderedSections = sortedSections.map((s, idx) => ({
          ...s,
          order: idx + 1,
        }));
        return { ...prev, sections: reorderedSections };
      }

      return prev;
    });
  };

  const updateSEO = (seo: LandingPage['seo']) => {
    setEditedPage(prev => ({ ...prev, seo }));
  };

  const handleSavePage = async () => {
    try {
      // Ensure all sections have proper order
      const sectionsWithOrder = (editedPage.sections || []).map((section, index) => ({
        ...section,
        order: section.order || index + 1,
      }));
      
      const pageToSave: LandingPage = {
        ...editedPage,
        sections: sectionsWithOrder,
      };
      
      await onSave(pageToSave);
    } catch (error) {
      console.error('Error preparing page to save:', error);
      alert('Failed to save page. Please check your data and try again.');
    }
  };

  if (editingSection) {
    return (
      <SectionEditor
        section={editingSection}
        onSave={async (updatedSection) => {
          try {
            await updateSection(updatedSection);
          } catch (error) {
            console.error('Error saving section:', error);
            alert('Failed to save section. Please try again.');
          }
        }}
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
            onClick={handleSavePage}
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

          {/* Page Visibility Options */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Page Visibility</h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show in Menu
                </label>
                <p className="text-xs text-gray-500">Add this page to the navigation menu</p>
              </div>
              <button
                type="button"
                onClick={() => updateField('show_in_menu', !editedPage.show_in_menu)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editedPage.show_in_menu ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editedPage.show_in_menu ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show in Footer
                </label>
                <p className="text-xs text-gray-500">Add this page to the footer links</p>
              </div>
              <button
                type="button"
                onClick={() => updateField('show_in_footer', !editedPage.show_in_footer)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editedPage.show_in_footer ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editedPage.show_in_footer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
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
                Add and manage sections for this landing page. Drag and drop to reorder.
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

          {(!editedPage.sections || editedPage.sections.length === 0) ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-4">No sections added yet</p>
              <button
                onClick={addSection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Section
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={
                  editedPage.sections
                    ?.sort((a, b) => a.order - b.order)
                    .map((s, idx) => s.id || `${s.order}_${s.type}_${idx}`) || []
                }
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {editedPage.sections
                    ?.sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <SortableSectionItem
                        key={section.id || `${section.order}_${section.type}_${index}`}
                        section={section}
                        index={index}
                        onEdit={(s) => {
                          setEditingSectionOriginalOrder(s.order);
                          setEditingSection(s);
                        }}
                        onDelete={deleteSection}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
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
