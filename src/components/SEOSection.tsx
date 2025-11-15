import React, { useState } from "react";
import { Globe, Search, Share2, Twitter } from "lucide-react";
import { SEOData } from "../types/settings";

interface SEOSectionProps {
  seo: Record<
    string,
    {
      ar: SEOData;
      en: SEOData;
    }
  >;
  onUpdate: (seo: any) => void;
}

const SEOSection: React.FC<SEOSectionProps> = ({ seo, onUpdate }) => {
  const pageKeys = Object.keys(seo);
  const [activePage, setActivePage] = useState(pageKeys[0]);
  const [activeLang, setActiveLang] = useState<"ar" | "en">("ar");

  const currentSEO = seo?.[activePage]?.[activeLang];

  // if (!currentSEO) return null;

  const handleFieldChange = (field: keyof SEOData, value: string) => {
    onUpdate({
      ...seo,
      [activePage]: {
        ...seo[activePage],
        [activeLang]: {
          ...seo[activePage][activeLang],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          SEO Settings
        </h2>
        <p className="text-gray-600">
          Manage SEO for each page in Arabic and English.
        </p>
      </div>

      {/* Page Selection */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Page
        </label>

        <select
          value={activePage}
          onChange={(e) => setActivePage(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {pageKeys.map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-3">
        {(["ar", "en"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              activeLang === lang
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {lang === "ar" ? "Arabic" : "English"}
          </button>
        ))}
      </div>

      {/* SEO FORM */}
      <div key={`${activePage}-${activeLang}`} className="grid gap-6">
        {/* Basic SEO */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Basic SEO</h3>
          </div>

          <div className="grid gap-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700">Page Title</label>
              <input
                type="text"
                value={currentSEO?.title||""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                value={currentSEO?.description||""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* H1 */}
            <div>
              <label className="text-sm font-medium text-gray-700">H1 Heading</label>
              <input
                type="text"
                value={currentSEO?.h1||""}
                onChange={(e) => handleFieldChange("h1", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="text-sm font-medium text-gray-700">Keywords</label>
              <input
                type="text"
                value={currentSEO?.keywords||""}
                onChange={(e) => handleFieldChange("keywords", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Canonical */}
            <div>
              <label className="text-sm font-medium text-gray-700">Canonical URL</label>
              <input
                type="text"
                value={currentSEO?.canonical||""}
                onChange={(e) => handleFieldChange("canonical", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-blue-600" />
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
                value={currentSEO?.og_title||""}
                onChange={(e) => handleFieldChange("og_title", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                OG Description
              </label>
              <textarea
                value={currentSEO?.og_description||""}
                onChange={(e) => handleFieldChange("og_description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                OG Image URL
              </label>
              <input
                type="text"
                value={currentSEO?.og_image||""}
                onChange={(e) => handleFieldChange("og_image", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-4">
            <Twitter className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-medium text-gray-900">Twitter Card</h3>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter Title
              </label>
              <input
                type="text"
                value={currentSEO?.twitter_title||""}
                onChange={(e) => handleFieldChange("twitter_title", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter Description
              </label>
              <textarea
                value={currentSEO?.twitter_description||""}
                onChange={(e) => handleFieldChange("twitter_description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter Image URL
              </label>
              <input
                type="text"
                value={currentSEO?.twitter_image||""}
                onChange={(e) => handleFieldChange("twitter_image", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
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
