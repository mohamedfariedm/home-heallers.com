import React, { useEffect, useMemo, useState } from 'react';
import { Globe, Search, Share2, Twitter } from 'lucide-react';
import { SEOData } from '../types/settings';

interface PageSEO {
  ar: SEOData;
  en: SEOData;
}

interface SEOSectionProps {
  seo: Record<string, PageSEO>;
  onUpdate: (seo: any) => void;
}

const REQUIRED_SEO_PAGES = ['terms', 'conditions', 'booking', 'doctors-apply'] as const;

const HIDDEN_SEO_PAGES = ['services', 'specialty', 'subspecialty'] as const;

const PAGE_LABELS: Record<string, string> = {
  terms: 'Terms & Conditions',
  conditions: 'Privacy Policy',
  booking: 'Booking',
  'doctors-apply': 'Doctors Apply',
};

const emptySEOData = (): SEOData => ({
  title: '',
  description: '',
  h1: '',
  canonical: '',
  keywords: '',
  og_title: '',
  og_description: '',
  og_image: '',
  twitter_title: '',
  twitter_description: '',
  twitter_image: '',
});

const emptyPageSEO = (): PageSEO => ({
  ar: emptySEOData(),
  en: emptySEOData(),
});

const ensurePageSEO = (page?: Partial<PageSEO>): PageSEO => ({
  ar: { ...emptySEOData(), ...page?.ar },
  en: { ...emptySEOData(), ...page?.en },
});

const SEOSection: React.FC<SEOSectionProps> = ({ seo, onUpdate }) => {
  const safeSeo = seo || {};

  const pageKeys = useMemo(() => {
    const existing = Object.keys(safeSeo).filter(
      (page) => !HIDDEN_SEO_PAGES.includes(page as (typeof HIDDEN_SEO_PAGES)[number])
    );
    const missing = REQUIRED_SEO_PAGES.filter((page) => !existing.includes(page));
    return [...existing, ...missing];
  }, [safeSeo]);

  const [activePage, setActivePage] = useState(pageKeys[0] || 'terms');
  const [activeLang, setActiveLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    if (pageKeys.length > 0 && !pageKeys.includes(activePage)) {
      setActivePage(pageKeys[0]);
    }
  }, [pageKeys, activePage]);

  useEffect(() => {
    const missingPages = REQUIRED_SEO_PAGES.filter((page) => !safeSeo[page]);
    if (missingPages.length === 0) return;

    const next = { ...safeSeo };
    missingPages.forEach((page) => {
      next[page] = emptyPageSEO();
    });
    onUpdate(next);
  }, [safeSeo, onUpdate]);

  const currentSEO = ensurePageSEO(safeSeo[activePage])[activeLang];

  const handleFieldChange = (field: keyof SEOData, value: string) => {
    const pageSeo = ensurePageSEO(safeSeo[activePage]);
    onUpdate({
      ...safeSeo,
      [activePage]: {
        ...pageSeo,
        [activeLang]: {
          ...pageSeo[activeLang],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Globe className="h-6 w-6 text-blue-600" />
          SEO Settings
        </h2>
        <p className="text-gray-600">
          Manage SEO for each page in Arabic and English.
        </p>
      </div>

      {/* Page Selection */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Page
        </label>

        <select
          value={activePage}
          onChange={(e) => setActivePage(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none
                     focus:ring-2 focus:ring-blue-500 md:w-64"
        >
          {pageKeys.map((page) => (
            <option key={page} value={page}>
              {PAGE_LABELS[page] || page}
            </option>
          ))}
        </select>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-3">
        {(['ar', 'en'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              activeLang === lang
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {lang === 'ar' ? 'Arabic' : 'English'}
          </button>
        ))}
      </div>

      {/* SEO FORM */}
      <div key={`${activePage}-${activeLang}`} className="grid gap-6">
        {/* Basic SEO */}
        <div className="rounded-lg border bg-gray-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Search className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Basic SEO</h3>
          </div>

          <div className="grid gap-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Page Title
              </label>
              <input
                type="text"
                value={currentSEO?.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                value={currentSEO?.description || ''}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* H1 */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                H1 Heading
              </label>
              <input
                type="text"
                value={currentSEO?.h1 || ''}
                onChange={(e) => handleFieldChange('h1', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Keywords
              </label>
              <input
                type="text"
                value={currentSEO?.keywords || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Canonical */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Canonical URL
              </label>
              <input
                type="text"
                value={currentSEO?.canonical || ''}
                onChange={(e) => handleFieldChange('canonical', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="rounded-lg border bg-gray-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Share2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Open Graph (Facebook)
            </h3>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                OG Title
              </label>
              <input
                type="text"
                value={currentSEO?.og_title || ''}
                onChange={(e) => handleFieldChange('og_title', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                OG Description
              </label>
              <textarea
                value={currentSEO?.og_description || ''}
                onChange={(e) =>
                  handleFieldChange('og_description', e.target.value)
                }
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                OG Image URL
              </label>
              <input
                type="text"
                value={currentSEO?.og_image || ''}
                onChange={(e) => handleFieldChange('og_image', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="rounded-lg border bg-gray-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Twitter className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-medium text-gray-900">Twitter Card</h3>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter Title
              </label>
              <input
                type="text"
                value={currentSEO?.twitter_title || ''}
                onChange={(e) =>
                  handleFieldChange('twitter_title', e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter Description
              </label>
              <textarea
                value={currentSEO?.twitter_description || ''}
                onChange={(e) =>
                  handleFieldChange('twitter_description', e.target.value)
                }
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter Image URL
              </label>
              <input
                type="text"
                value={currentSEO?.twitter_image || ''}
                onChange={(e) =>
                  handleFieldChange('twitter_image', e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="mb-2 font-medium text-green-900">SEO Best Practices</h4>
        <ul className="space-y-1 text-sm text-green-800">
          <li>• Keep titles under 60 characters</li>
          <li>• Write meta descriptions between 150-160 characters</li>
          <li>• Use unique titles and descriptions for each page</li>
          <li>• Include your target keywords naturally</li>
          <li>• Use descriptive, engaging language</li>
        </ul>
      </div>
    </div>
  );
};

export default SEOSection;
