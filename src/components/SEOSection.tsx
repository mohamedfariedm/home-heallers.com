import React, { useState } from 'react';
import { SEOData } from '../types/settings';
import { Globe, Search, Share2, Twitter } from 'lucide-react';

interface SEOSectionProps {
  seo: Record<string, SEOData>;
  onUpdate: (seo: Record<string, SEOData>) => void;
}

const SEOSection: React.FC<SEOSectionProps> = ({ seo, onUpdate }) => {
  const [activePage, setActivePage] = useState(Object.keys(seo)[0] || 'home');

  const pageOptions = Object.keys(seo);

  const handleFieldChange = (field: keyof SEOData, value: string) => {
    onUpdate({
      ...seo,
      [activePage]: {
        ...seo[activePage],
        [field]: value
      }
    });
  };

  const currentSEO = seo[activePage];

  if (!currentSEO) return null;

  console.log(currentSEO, 'currentSEO');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">SEO Settings</h2>
        <p className="text-gray-600">Optimize your websites search engine visibility for each page.</p>
      </div>

      {/* Page Selection */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Page
        </label>
        <select
          value={activePage}
          onChange={(e) => setActivePage(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {pageOptions.map((page) => (
            <option key={page} value={page}>
              {page.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div key={activePage} className="grid gap-6">
        {/* Basic SEO */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Basic SEO</h3>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={currentSEO.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {currentSEO.title.length}/60 characters (recommended)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={currentSEO.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {currentSEO.description.length}/160 characters (recommended)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                H1 Heading
              </label>
              <input
                type="text"
                value={currentSEO.h1}
                onChange={(e) => handleFieldChange('h1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={currentSEO.keywords}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="Separate keywords with commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                value={currentSEO.canonical}
                onChange={(e) => handleFieldChange('canonical', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Open Graph (Facebook)</h3>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Title
              </label>
              <input
                type="text"
                value={currentSEO.og_title}
                onChange={(e) => handleFieldChange('og_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Description
              </label>
              <textarea
                value={currentSEO.og_description}
                onChange={(e) => handleFieldChange('og_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Image URL
              </label>
              <input
                type="url"
                value={currentSEO.og_image}
                onChange={(e) => handleFieldChange('og_image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Twitter className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-medium text-gray-900">Twitter Card</h3>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Title
              </label>
              <input
                type="text"
                value={currentSEO.twitter_title}
                onChange={(e) => handleFieldChange('twitter_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Description
              </label>
              <textarea
                value={currentSEO.twitter_description}
                onChange={(e) => handleFieldChange('twitter_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Image URL
              </label>
              <input
                type="url"
                value={currentSEO.twitter_image}
                onChange={(e) => handleFieldChange('twitter_image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO Preview */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Search Result Preview</h4>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="text-lg text-blue-600 hover:underline cursor-pointer">
            {currentSEO.title}
          </div>
          <div className="text-sm text-green-700 mt-1">
            {currentSEO.canonical}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {currentSEO.description}
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 className="font-medium text-green-900 mb-2">SEO Best Practices</h4>
        <ul className="text-sm text-green-800 space-y-1">
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