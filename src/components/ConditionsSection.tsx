"use client";

import React, { useState } from "react";
import {
  ListChecks,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ConditionsSectionProps {
  conditions: any; // { ar: {...}, en: {...} }
  onUpdate: (conditions: any) => void;
}

export default function ConditionsSection({
  conditions,
  onUpdate,
}: ConditionsSectionProps) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [isPreview, setIsPreview] = useState(false);

  const c = conditions?.[lang] || {
    title: "",
    last_updated: "",
    items: [],
  };

  const items = Array.isArray(c.items) ? c.items : [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    onUpdate({
      ...conditions,
      [lang]: {
        ...c,
        items: updated,
      },
    });
  };

  const updateField = (field: string, value: string) => {
    onUpdate({
      ...conditions,
      [lang]: {
        ...c,
        [field]: value,
      },
    });
  };

  const addItem = () => {
    const updated = [
      ...items,
      {
        heading: lang === "ar" ? "شرط جديد" : "New condition",
        content: "",
      },
    ];

    onUpdate({
      ...conditions,
      [lang]: {
        ...c,
        items: updated,
      },
    });
  };

  const deleteItem = (index: number) => {
    const updated = items.filter((_:any, i:any) => i !== index);
    onUpdate({
      ...conditions,
      [lang]: {
        ...c,
        items: updated,
      },
    });
  };

  const reorderItems = (from: number, to: number) => {
    if (from === to) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    onUpdate({
      ...conditions,
      [lang]: {
        ...c,
        items: updated,
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
    reorderItems(fromIndex, index);
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
            <Shield className="w-6 h-6 text-blue-600" />
            {lang === "ar" ? "الشروط العامة" : "General Conditions"}
          </h2>
          <p className="text-gray-600 text-sm">
            Configure general usage conditions for your platform.
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

      {/* Language Selector */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "ar" | "en")}
          className="w-40 px-3 py-2 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="ar">Arabic</option>
          <option value="en">English</option>
        </select>
        </div>

        <div className="text-sm text-gray-500">
          <span className="font-medium">
            {lang === "ar" ? "آخر تحديث:" : "Last updated:"}
          </span>{" "}
          {c.last_updated || (lang === "ar" ? "غير محدد" : "Not set")}
        </div>
      </div>

      {/* Title field (edit mode only) */}
      {!isPreview && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {lang === "ar" ? "العنوان العام" : "Main Title"}
          </h3>

          <input
            type="text"
            value={c.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Items Edit / Preview */}
      {!isPreview ? (
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4"
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <ListChecks className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-medium text-gray-900">
                    {lang === "ar" ? "شرط" : "Condition"} {i + 1}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem(i)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>

              {/* Heading field */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {lang === "ar" ? "العنوان" : "Heading"}
                </label>
                <input
                  value={item.heading}
                  onChange={(e) =>
                    updateItem(i, "heading", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content editor (Quill) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {lang === "ar" ? "المحتوى" : "Content"}
                </label>
                <div className="bg-white  border border-gray-300 rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={item.content || ""}
                    onChange={(value) => updateItem(i, "content", value)}
                    className=""
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === "ar"
                    ? "يمكنك تنسيق النص (قوائم، فقرات، روابط، ...)."
                    : "You can format the text (lists, paragraphs, links, etc.)."}
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                       border border-dashed border-blue-400 text-blue-600
                       hover:bg-blue-50 text-sm"
          >
            <Plus className="w-4 h-4" />
            {lang === "ar" ? "إضافة شرط جديد" : "Add new condition"}
          </button>
        </div>
      ) : (
        // PREVIEW MODE
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{c.title}</h3>
            <p className="text-xs text-gray-500">
              {lang === "ar" ? "آخر تحديث" : "Last updated"}: {c.last_updated}
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item: any, i: number) => (
              <div key={i} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-medium text-gray-900 mb-1">
                  {item.heading}
                </h4>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content || "" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
