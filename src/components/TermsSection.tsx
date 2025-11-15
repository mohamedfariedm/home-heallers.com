"use client";

import React, { useState } from "react";
import {
  FileText,
  Globe,
  BookOpen,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TermsSectionProps {
  terms: any; // { ar: {...}, en: {...} }
  onUpdate: (terms: any) => void;
}

export default function TermsSection({ terms, onUpdate }: TermsSectionProps) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [isPreview, setIsPreview] = useState(false);

  const t = terms?.[lang] || {
    title: "",
    last_updated: "",
    sections: [],
  };

  const sections = Array.isArray(t.sections) ? t.sections : [];

  const updateField = (key: string, value: string) => {
    onUpdate({
      ...terms,
      [lang]: {
        ...t,
        [key]: value,
      },
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };

    onUpdate({
      ...terms,
      [lang]: {
        ...t,
        sections: updated,
      },
    });
  };

  const addSection = () => {
    const updated = [
      ...sections,
      {
        heading: lang === "ar" ? "عنوان جديد" : "New section",
        content: "",
      },
    ];
    onUpdate({
      ...terms,
      [lang]: {
        ...t,
        sections: updated,
      },
    });
  };

  const deleteSection = (index: number) => {
    const updated = sections.filter((_:any, i:any) => i !== index);
    onUpdate({
      ...terms,
      [lang]: {
        ...t,
        sections: updated,
      },
    });
  };

  const reorderSections = (from: number, to: number) => {
    if (from === to) return;
    const updated = [...sections];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    onUpdate({
      ...terms,
      [lang]: {
        ...t,
        sections: updated,
      },
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    reorderSections(fromIndex, index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            {lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
          </h2>
          <p className="text-gray-600 text-sm">
            Manage your legal terms content in both Arabic and English.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPreview((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          {isPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Edit Mode
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </button>
      </div>

      {/* Language Switch */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "ar" | "en")}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          <span className="font-medium">
            {lang === "ar" ? "آخر تحديث:" : "Last updated:"}
          </span>{" "}
          {t.last_updated || (lang === "ar" ? "غير محدد" : "Not set")}
        </div>
      </div>

      {/* Title */}
      {!isPreview && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">
              {lang === "ar" ? "العنوان" : "Title"}
            </h3>
          </div>

          <input
            type="text"
            value={t.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Sections Edit / Preview */}
      {!isPreview ? (
        <div className="space-y-4">
          {sections.map((section: any, i: number) => (
            <div
              key={i}
              className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4"
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
            >
              {/* Header line with drag + index + delete */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-medium text-gray-900">
                    {lang === "ar" ? "قسم" : "Section"} {i + 1}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => deleteSection(i)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>

              {/* Heading input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === "ar" ? "العنوان الفرعي" : "Heading"}
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) =>
                    updateSection(i, "heading", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content editor (Quill) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === "ar" ? "المحتوى" : "Content"}
                </label>
                <div className="bg-white border border-gray-300 rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={section.content || ""}
                    onChange={(value) =>
                      updateSection(i, "content", value)
                    }
                    className=""
                    
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === "ar"
                    ? "يمكنك تنسيق النص (عناوين، قوائم، روابط،... إلخ)."
                    : "You can format the text (headings, lists, links, etc.)."}
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                       border border-dashed border-blue-400 text-blue-600
                       hover:bg-blue-50 text-sm"
          >
            <Plus className="w-4 h-4" />
            {lang === "ar" ? "إضافة قسم جديد" : "Add new section"}
          </button>
        </div>
      ) : (
        // PREVIEW MODE
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-1">{t.title}</h3>
            <p className="text-xs text-gray-500 mb-4">
              {lang === "ar" ? "آخر تحديث" : "Last updated"}: {t.last_updated}
            </p>

            <div className="space-y-4">
              {sections.map((section: any, i: number) => (
                <div key={i} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {section.heading}
                  </h4>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content || "" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
