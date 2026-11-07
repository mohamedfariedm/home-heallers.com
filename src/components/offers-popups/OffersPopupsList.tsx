'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  Search,
  Megaphone,
} from 'lucide-react';
import { OfferPopup } from '@/types/settings';
import { routes } from '@/config/routes';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  duplicateOfferPopup,
  formatDateRangeSummary,
  formatUrlRulesSummary,
  normalizeOfferPopup,
} from '@/utils/offers-popup-defaults';

interface OffersPopupsListProps {
  popups: OfferPopup[];
  onUpdate: (popups: OfferPopup[]) => void;
  isSaving?: boolean;
}

export default function OffersPopupsList({
  popups,
  onUpdate,
  isSaving,
}: OffersPopupsListProps) {
  const [search, setSearch] = useState('');

  const normalizedPopups = useMemo(
    () => popups.map((p) => normalizeOfferPopup(p)),
    [popups]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedPopups;
    return normalizedPopups.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.offer_title.ar.includes(search.trim()) ||
        p.offer_title.en.toLowerCase().includes(q) ||
        p.coupon_code.toLowerCase().includes(q) ||
        p.url_rules.some((r) => r.value.toLowerCase().includes(q))
    );
  }, [normalizedPopups, search]);

  const toggleStatus = (id: string) => {
    onUpdate(
      popups.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'active' ? 'inactive' : 'active',
            }
          : p
      )
    );
  };

  const remove = (id: string) => {
    if (!window.confirm('Delete this popup? This cannot be undone.')) return;
    onUpdate(popups.filter((p) => p.id !== id));
  };

  const duplicate = (popup: OfferPopup) => {
    onUpdate([...normalizedPopups, duplicateOfferPopup(popup)]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search popups…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-[#143087]/20 focus:ring-2"
          />
        </div>
        <Link href={routes.offersPopups.create}>
          <Button className="gap-2 bg-[#143087] hover:bg-[#0F2466]">
            <Plus className="h-4 w-4" />
            New popup
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Megaphone className="h-7 w-7 text-[#143087]" />
          </div>
          <p className="text-lg font-medium text-gray-700">No offer popups yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Create a popup to capture leads on offer pages. Settings are saved
            with site settings and used by the website.
          </p>
          <Link href={routes.offersPopups.create} className="mt-5">
            <Button className="gap-2 bg-[#143087] hover:bg-[#0F2466]">
              <Plus className="h-4 w-4" />
              Create first popup
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Pages</th>
                <th className="px-4 py-3 font-semibold">Dates</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((popup) => (
                <tr key={popup.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={routes.offersPopups.edit(popup.id)}
                      className="font-medium text-gray-900 hover:text-[#143087]"
                    >
                      {popup.name || 'Untitled popup'}
                    </Link>
                    {popup.offer_title.ar || popup.offer_title.en ? (
                      <p
                        className="mt-0.5 max-w-xs truncate text-xs text-gray-400"
                        dir={popup.offer_title.ar ? 'rtl' : 'ltr'}
                      >
                        {popup.offer_title.ar || popup.offer_title.en}
                        {popup.coupon_code
                          ? ` · ${popup.coupon_code}`
                          : ''}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatUrlRulesSummary(popup.url_rules)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateRangeSummary(popup)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{popup.priority}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={popup.status === 'active'}
                        onChange={() => toggleStatus(popup.id)}
                        disabled={isSaving}
                      />
                      <span
                        className={`text-xs font-medium ${
                          popup.status === 'active'
                            ? 'text-emerald-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {popup.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={routes.offersPopups.edit(popup.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-[#143087]"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => duplicate(popup)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-[#143087]"
                        title="Duplicate"
                        disabled={isSaving}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(popup.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
