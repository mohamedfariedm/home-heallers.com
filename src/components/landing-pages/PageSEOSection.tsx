import React, { useState } from 'react';
import { LandingPageSEO, MultilingualText } from '../../types/settings';
import { Search, Share2, Twitter, Globe, Target, Code, FileText, Link2, Calendar, User, Tag } from 'lucide-react';
import { FileUpload } from '@/app/[locale]/(hydrogen)/attachments/components/ui/FileUpload';
import Image from 'next/image';

interface PageSEOSectionProps {
  seo?: LandingPageSEO;
  metaTitle?: MultilingualText;
  metaDescription?: MultilingualText;
  onUpdate: (seo: LandingPageSEO) => void;
  onUpdateMetaTitle: (value: MultilingualText) => void;
  onUpdateMetaDescription: (value: MultilingualText) => void;
}

const PageSEOSection: React.FC<PageSEOSectionProps> = ({
  seo,
  metaTitle,
  metaDescription,
  onUpdate,
  onUpdateMetaTitle,
  onUpdateMetaDescription,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'technical' | 'advanced'>('basic');

  const currentSEO = seo || {
    meta_title: { en: '', ar: '' },
    meta_description: { en: '', ar: '' },
  };

  const updateSEOField = (field: keyof LandingPageSEO, value: any) => {
    onUpdate({
      ...currentSEO,
      [field]: value,
    });
  };

  // Handle OG Image upload
  const handleOGImageUpload = (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      const imageUrl = file.original || file.url || file.path || file.thumbnail || '';
      updateSEOField('og_image', imageUrl);
    }
  };

  const handleOGImageRemove = () => {
    updateSEOField('og_image', '');
  };

  // Handle Twitter Image upload
  const handleTwitterImageUpload = (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      const imageUrl = file.original || file.url || file.path || file.thumbnail || '';
      updateSEOField('twitter_image', imageUrl);
    }
  };

  const handleTwitterImageRemove = () => {
    updateSEOField('twitter_image', '');
  };

  // Convert image URL to FileUpload format
  const getImageFileFormat = (imageUrl: string | undefined) => {
    if (!imageUrl) return [];
    return [{
      id: Date.now(),
      thumbnail: imageUrl,
      original: imageUrl,
    }];
  };

  const updateMultilingualField = (field: keyof LandingPageSEO, lang: 'en' | 'ar', value: string) => {
    const currentValue = (currentSEO[field] as MultilingualText) || { en: '', ar: '' };
    updateSEOField(field, {
      ...currentValue,
      [lang]: value,
    });
  };

  const updateMetaTitle = (lang: 'en' | 'ar', value: string) => {
    onUpdateMetaTitle({
      ...(metaTitle || { en: '', ar: '' }),
      [lang]: value,
    });
  };

  const updateMetaDescription = (lang: 'en' | 'ar', value: string) => {
    onUpdateMetaDescription({
      ...(metaDescription || { en: '', ar: '' }),
      [lang]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Professional SEO Settings</h2>
        </div>
        <p className="text-blue-100">
          Optimize your landing page to rank #1 on Google search results
        </p>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-3">
        {(['ar', 'en'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              activeLang === lang
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {lang === 'ar' ? 'العربية' : 'English'}
          </button>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'basic', label: 'Basic SEO', icon: Search },
          { id: 'social', label: 'Social Media', icon: Share2 },
          { id: 'technical', label: 'Technical', icon: Code },
          { id: 'advanced', label: 'Advanced', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Basic SEO Tab */}
      {activeTab === 'basic' && (
        <div className="bg-gray-50 rounded-lg p-6 border space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Basic SEO - Core Ranking Factors</h3>
          </div>

          <div className="grid gap-4">
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metaTitle?.[activeLang] || ''}
                onChange={(e) => updateMetaTitle(activeLang, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optimized page title with primary keyword"
                maxLength={60}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {metaTitle?.[activeLang]?.length || 0}/60 characters
                </p>
                <p className={`text-xs ${(metaTitle?.[activeLang]?.length || 0) >= 50 && (metaTitle?.[activeLang]?.length || 0) <= 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(metaTitle?.[activeLang]?.length || 0) >= 50 && (metaTitle?.[activeLang]?.length || 0) <= 60 ? '✓ Optimal' : '⚠ Aim for 50-60 chars'}
                </p>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={metaDescription?.[activeLang] || ''}
                onChange={(e) => updateMetaDescription(activeLang, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Compelling description that includes keywords and a call-to-action"
                maxLength={160}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {metaDescription?.[activeLang]?.length || 0}/160 characters
                </p>
                <p className={`text-xs ${(metaDescription?.[activeLang]?.length || 0) >= 150 && (metaDescription?.[activeLang]?.length || 0) <= 160 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(metaDescription?.[activeLang]?.length || 0) >= 150 && (metaDescription?.[activeLang]?.length || 0) <= 160 ? '✓ Optimal' : '⚠ Aim for 150-160 chars'}
                </p>
              </div>
            </div>

            {/* Focus Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Focus Keyword (Primary Keyword)
              </label>
              <input
                type="text"
                value={currentSEO.focus_keyword?.[activeLang] || ''}
                onChange={(e) => updateMultilingualField('focus_keyword', activeLang, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="main keyword you want to rank for"
              />
              <p className="text-xs text-gray-500 mt-1">
                The primary keyword you want this page to rank for in Google
              </p>
            </div>

            {/* H1 Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                H1 Heading Tag
              </label>
              <input
                type="text"
                value={currentSEO.h1_tag?.[activeLang] || ''}
                onChange={(e) => updateMultilingualField('h1_tag', activeLang, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Main heading of the page (include focus keyword)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Should include your focus keyword and be descriptive
              </p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Meta Keywords
              </label>
              <input
                type="text"
                value={currentSEO.meta_keywords?.[activeLang] || ''}
                onChange={(e) => updateMultilingualField('meta_keywords', activeLang, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="keyword1, keyword2, keyword3, keyword4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of relevant keywords (5-10 keywords recommended)
              </p>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                Canonical URL
              </label>
              <input
                type="text"
                value={currentSEO.canonical_url || ''}
                onChange={(e) => updateSEOField('canonical_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yoursite.com/landing-page"
              />
              <p className="text-xs text-gray-500 mt-1">
                Prevents duplicate content issues. Use the preferred URL if this page has multiple URLs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Open Graph */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Open Graph (Facebook, LinkedIn)</h3>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Title
                </label>
                <input
                  type="text"
                  value={currentSEO.og_title?.[activeLang] || ''}
                  onChange={(e) => updateMultilingualField('og_title', activeLang, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title for social media sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Description
                </label>
                <textarea
                  value={currentSEO.og_description?.[activeLang] || ''}
                  onChange={(e) => updateMultilingualField('og_description', activeLang, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description for social media sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image (Open Graph Image)
                </label>
                <FileUpload
                  label="Upload OG Image"
                  onUpload={handleOGImageUpload}
                  onRemove={handleOGImageRemove}
                  currentFiles={getImageFileFormat(currentSEO.og_image)}
                  multiple={false}
                  accept="image/*"
                />
                {currentSEO.og_image && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-2">Current OG Image:</p>
                    <div className="relative w-full max-w-md h-48 rounded-lg border border-gray-200 overflow-hidden">
                      <Image
                        src={currentSEO.og_image}
                        alt="OG Image Preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 1200x630px (1.91:1 ratio) for optimal social media sharing
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Type
                  </label>
                  <select
                    value={currentSEO.og_type || 'website'}
                    onChange={(e) => updateSEOField('og_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG URL
                  </label>
                  <input
                    type="text"
                    value={currentSEO.og_url || ''}
                    onChange={(e) => updateSEOField('og_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yoursite.com/landing-page"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Site Name
                </label>
                <input
                  type="text"
                  value={currentSEO.og_site_name || ''}
                  onChange={(e) => updateSEOField('og_site_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Site Name"
                />
              </div>
            </div>
          </div>

          {/* Twitter Card */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <Twitter className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900">Twitter Card</h3>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Card Type
                </label>
                <select
                  value={currentSEO.twitter_card || 'summary_large_image'}
                  onChange={(e) => updateSEOField('twitter_card', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Title
                </label>
                <input
                  type="text"
                  value={currentSEO.twitter_title?.[activeLang] || ''}
                  onChange={(e) => updateMultilingualField('twitter_title', activeLang, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title for Twitter sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Description
                </label>
                <textarea
                  value={currentSEO.twitter_description?.[activeLang] || ''}
                  onChange={(e) => updateMultilingualField('twitter_description', activeLang, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description for Twitter sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Image
                </label>
                <FileUpload
                  label="Upload Twitter Image"
                  onUpload={handleTwitterImageUpload}
                  onRemove={handleTwitterImageRemove}
                  currentFiles={getImageFileFormat(currentSEO.twitter_image)}
                  multiple={false}
                  accept="image/*"
                />
                {currentSEO.twitter_image && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-2">Current Twitter Image:</p>
                    <div className="relative w-full max-w-md h-48 rounded-lg border border-gray-200 overflow-hidden">
                      <Image
                        src={currentSEO.twitter_image}
                        alt="Twitter Image Preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1200x675px for large image cards
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Site (@username)
                </label>
                <input
                  type="text"
                  value={currentSEO.twitter_site || ''}
                  onChange={(e) => updateSEOField('twitter_site', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical SEO Tab */}
      {activeTab === 'technical' && (
        <div className="bg-gray-50 rounded-lg p-6 border space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Technical SEO</h3>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Robots
              </label>
              <select
                value={currentSEO.meta_robots || 'index, follow'}
                onChange={(e) => updateSEOField('meta_robots', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="index, follow">Index, Follow (Recommended)</option>
                <option value="index, nofollow">Index, NoFollow</option>
                <option value="noindex, follow">NoIndex, Follow</option>
                <option value="noindex, nofollow">NoIndex, NoFollow</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Controls how search engines crawl and index this page
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schema.org Type
              </label>
              <select
                value={currentSEO.schema_type || 'WebPage'}
                onChange={(e) => updateSEOField('schema_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WebPage">WebPage</option>
                <option value="Article">Article</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Organization">Organization</option>
                <option value="LocalBusiness">Local Business</option>
                <option value="MedicalBusiness">Medical Business</option>
                <option value="FAQPage">FAQ Page</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Structured data type for rich snippets in search results
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={currentSEO.language || activeLang}
                onChange={(e) => updateSEOField('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English (en)</option>
                <option value="ar">Arabic (ar)</option>
                <option value="en-US">English US (en-US)</option>
                <option value="ar-SA">Arabic Saudi (ar-SA)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Advanced SEO Tab */}
      {activeTab === 'advanced' && (
        <div className="bg-gray-50 rounded-lg p-6 border space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced SEO</h3>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Author
                </label>
                <input
                  type="text"
                  value={currentSEO.author || ''}
                  onChange={(e) => updateSEOField('author', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Published Date
                </label>
                <input
                  type="date"
                  value={currentSEO.published_date || ''}
                  onChange={(e) => updateSEOField('published_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modified Date
              </label>
              <input
                type="date"
                value={currentSEO.modified_date || ''}
                onChange={(e) => updateSEOField('modified_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Section
              </label>
              <input
                type="text"
                value={currentSEO.article_section?.[activeLang] || ''}
                onChange={(e) => updateMultilingualField('article_section', activeLang, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category or section name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Tags
              </label>
              <input
                type="text"
                value={currentSEO.article_tags?.[activeLang] || ''}
                onChange={(e) => updateMultilingualField('article_tags', activeLang, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Best Practices */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Professional SEO Best Practices for #1 Google Ranking
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Meta Title:</strong> 50-60 characters, include focus keyword at the beginning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Meta Description:</strong> 150-160 characters, include CTA and keywords naturally</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Focus Keyword:</strong> Use in title, H1, first paragraph, and naturally throughout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>H1 Tag:</strong> One per page, include focus keyword, descriptive and compelling</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Canonical URL:</strong> Prevents duplicate content penalties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Open Graph:</strong> Optimize for social sharing (Facebook, LinkedIn)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Schema Markup:</strong> Helps Google understand your content for rich snippets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Unique Content:</strong> Every page should have unique title, description, and content</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PageSEOSection;
