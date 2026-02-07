import React, { useState } from 'react';
import { LandingPage } from '../types/settings';
import { Plus, Trash2, Edit2, Eye, GripVertical, Search } from 'lucide-react';
import PageEditor from './landing-pages/PageEditor';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';

interface LandingPagesSectionProps {
  landingPages: LandingPage[];
  onUpdate: (pages: LandingPage[]) => void;
  onSavePage?: (page: LandingPage) => Promise<void>; // Optional API callback for individual page saves
  onDeletePage?: (pageId: number) => Promise<void>; // Optional API callback for page deletion
  onSaveSection?: (pageId: number, section: any) => Promise<void>; // Optional API callback for section saves
}

const LandingPagesSection: React.FC<LandingPagesSectionProps> = ({ 
  landingPages = [], 
  onUpdate,
  onSavePage,
  onDeletePage,
  onSaveSection,
}) => {
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [originalPageSlug, setOriginalPageSlug] = useState<string | null>(null); // Track original slug for updates
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const addPage = () => {
    try {
      const timestamp = Date.now();
      const pageSlug = `page-${timestamp}`;
      const currentDate = new Date().toISOString().split('T')[0];
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com';
      const pageUrl = `${baseUrl}/${pageSlug}`;

      // Professional SEO configuration for new page
      const professionalSEO = {
        meta_title: { 
          en: 'New Landing Page - Professional Services | Your Brand', 
          ar: 'صفحة هبوط جديدة - خدمات احترافية | علامتك التجارية' 
        },
        meta_description: { 
          en: 'Discover our new landing page with professional content and services. Get started today with tailored solutions for your needs.', 
          ar: 'اكتشف صفحة الهبوط الجديدة مع محتوى وخدمات احترافية. ابدأ اليوم مع حلول مصممة خصيصاً لاحتياجاتك.' 
        },
        focus_keyword: { 
          en: 'landing page services', 
          ar: 'خدمات صفحة الهبوط' 
        },
        h1_tag: { 
          en: 'New Page Title', 
          ar: 'عنوان الصفحة الجديدة' 
        },
        meta_keywords: { 
          en: 'landing page, professional services, web design, digital marketing', 
          ar: 'صفحة هبوط، خدمات احترافية، تصميم مواقع، تسويق رقمي' 
        },
        canonical_url: pageUrl,
        meta_robots: 'index, follow',
        og_title: { 
          en: 'New Landing Page - Professional Services', 
          ar: 'صفحة هبوط جديدة - خدمات احترافية' 
        },
        og_description: { 
          en: 'Discover our new landing page with professional content. Get started today!', 
          ar: 'اكتشف صفحة الهبوط الجديدة مع محتوى احترافي. ابدأ اليوم!' 
        },
        og_image: `${baseUrl}/images/og-default.jpg`,
        og_type: 'website',
        og_url: pageUrl,
        og_site_name: 'Your Brand Name',
        og_locale: { en: 'en_US', ar: 'ar_SA' },
        twitter_card: 'summary_large_image',
        twitter_title: { 
          en: 'New Landing Page - Professional Services', 
          ar: 'صفحة هبوط جديدة - خدمات احترافية' 
        },
        twitter_description: { 
          en: 'Discover our new landing page with professional content. Get started today!', 
          ar: 'اكتشف صفحة الهبوط الجديدة مع محتوى احترافي. ابدأ اليوم!' 
        },
        twitter_image: `${baseUrl}/images/twitter-default.jpg`,
        twitter_site: '@yourbrand',
        twitter_creator: '@yourbrand',
        schema_type: 'WebPage',
        author: 'Your Brand',
        published_date: currentDate,
        modified_date: currentDate,
        language: 'en',
      };

      const newPage: LandingPage = {
        slug: pageSlug,
        name: { en: 'New Page', ar: 'صفحة جديدة' },
        title: { en: 'New Page Title', ar: 'عنوان الصفحة الجديدة' },
        description: { en: 'Page description', ar: 'وصف الصفحة' },
        meta_title: professionalSEO.meta_title,
        meta_description: professionalSEO.meta_description,
        sections: [],
        seo: professionalSEO,
      };
      
      onUpdate([...landingPages, newPage]);
      setSelectedPage(newPage);
      setOriginalPageSlug(newPage.slug); // Track the new page's slug
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating new page:', error);
      alert('Failed to create new page. Please try again.');
    }
  };

  const updatePage = async (updatedPage: LandingPage) => {
    try {
      // Ensure the page has all required fields
      const pageToUpdate: LandingPage = {
        ...updatedPage,
        slug: updatedPage.slug || `page-${Date.now()}`,
        name: updatedPage.name || { en: 'Untitled Page', ar: 'صفحة بدون عنوان' },
        title: updatedPage.title || { en: 'Untitled Page', ar: 'صفحة بدون عنوان' },
        description: updatedPage.description || { en: '', ar: '' },
        meta_title: updatedPage.meta_title || { en: '', ar: '' },
        meta_description: updatedPage.meta_description || { en: '', ar: '' },
        sections: updatedPage.sections || [],
      };

      // If onSavePage callback is provided, call API first
      if (onSavePage) {
        await onSavePage(pageToUpdate);
      }

      // Use original slug to find the page (in case slug was changed during editing)
      // If originalPageSlug is null, it means this is a new page
      const searchSlug = originalPageSlug || pageToUpdate.slug;
      const index = landingPages.findIndex(p => 
        p.slug === searchSlug || 
        (p.id && updatedPage.id && p.id === updatedPage.id)
      );
      
      if (index !== -1) {
        // Update existing page
        const newPages = [...landingPages];
        newPages[index] = pageToUpdate;
        onUpdate(newPages);
        setSelectedPage(pageToUpdate);
        // Update original slug if it changed
        if (pageToUpdate.slug !== searchSlug) {
          setOriginalPageSlug(pageToUpdate.slug);
        }
      } else {
        // Add new page (only if originalPageSlug is null, meaning it's truly a new page)
        if (!originalPageSlug) {
          const newPages = [...landingPages, pageToUpdate];
          onUpdate(newPages);
          setSelectedPage(pageToUpdate);
          setOriginalPageSlug(pageToUpdate.slug);
        } else {
          // This shouldn't happen, but handle gracefully
          console.warn('Page not found for update, but original slug exists. Adding as new page.');
          const newPages = [...landingPages, pageToUpdate];
          onUpdate(newPages);
          setSelectedPage(pageToUpdate);
        }
      }
    } catch (error) {
      console.error('Error updating page:', error);
      // Don't throw, just log - let the update happen locally
    }
  };

  const deletePage = async (slug: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        const pageToDelete = landingPages.find(p => p.slug === slug);
        
        // If onDeletePage callback is provided and page has an ID, call API
        if (onDeletePage && pageToDelete?.id) {
          await onDeletePage(pageToDelete.id);
        }

        const updatedPages = landingPages.filter(p => p.slug !== slug);
        onUpdate(updatedPages);
        if (selectedPage?.slug === slug) {
          setSelectedPage(null);
          setOriginalPageSlug(null);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error deleting page:', error);
        // Still update locally even if API call fails
        const updatedPages = landingPages.filter(p => p.slug !== slug);
        onUpdate(updatedPages);
        if (selectedPage?.slug === slug) {
          setSelectedPage(null);
          setOriginalPageSlug(null);
          setIsEditing(false);
        }
      }
    }
  };

  const duplicatePage = (page: LandingPage) => {
    try {
      // Deep clone the page to avoid reference issues
      const duplicated: LandingPage = {
        ...page,
        slug: `${page.slug}-copy-${Date.now()}`,
        name: {
          en: `${page.name.en} (Copy)`,
          ar: `${page.name.ar} (نسخة)`,
        },
        // Deep clone sections (don't modify IDs as they should be numbers from the API)
        sections: (page.sections || []).map((section) => ({
          ...section,
        })),
      };
      onUpdate([...landingPages, duplicated]);
    } catch (error) {
      console.error('Error duplicating page:', error);
      alert('Failed to duplicate page. Please try again.');
    }
  };

  const filteredPages = landingPages.filter(page =>
    page.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.name.ar.includes(searchTerm) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing && selectedPage) {
    return (
      <PageEditor
        page={selectedPage}
        onSave={async (updatedPage) => {
          try {
            await updatePage(updatedPage);
            setIsEditing(false);
            setSelectedPage(null);
            setOriginalPageSlug(null); // Reset original slug
          } catch (error) {
            console.error('Error saving page:', error);
            alert('Failed to save page. Please try again.');
          }
        }}
        onCancel={() => {
          setIsEditing(false);
          setSelectedPage(null);
          setOriginalPageSlug(null); // Reset original slug
        }}
        onSaveSection={onSaveSection}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Landing Pages</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage multiple landing pages with customizable sections
          </p>
        </div>
        <button
          onClick={addPage}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      {/* Search */}
      {landingPages.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Pages List */}
      <div className="grid gap-4">
        {filteredPages.map((page) => (
          <div
            key={page.slug}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GripVertical className="text-gray-400 cursor-move" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {page.name.en}
                    </h3>
                    <p className="text-sm text-gray-500">{page.name.ar}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {page.slug}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {page.description.en}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{page.sections?.length || 0} sections</span>
                  <span>•</span>
                  <span>
                    {page.sections?.filter((s) => s.type === 'hero').length || 0} hero
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedPage(page);
                    setOriginalPageSlug(page.slug); // Store original slug when starting to edit
                    setIsEditing(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => duplicatePage(page)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePage(page.slug)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {landingPages.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 mb-4">No landing pages created yet</p>
            <button
              onClick={addPage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Landing Page
            </button>
          </div>
        )}

        {landingPages.length > 0 && filteredPages.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No pages found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPagesSection;
