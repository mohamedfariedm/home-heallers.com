'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import OffersPopupsList from '@/components/offers-popups/OffersPopupsList';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { OfferPopup } from '@/types/settings';
import { normalizeOfferPopup } from '@/utils/offers-popup-defaults';

export default function OffersPopupsPage() {
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();

  const settings = data?.data[0]?.setting;
  const popups: OfferPopup[] = (settings?.offer_popups ?? []).map(
    normalizeOfferPopup
  );

  const handleUpdate = (offer_popups: OfferPopup[]) => {
    if (!settings) return;
    update({
      setting: {
        ...settings,
        offer_popups: offer_popups.map(normalizeOfferPopup),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10">
      <div className="border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d7377] to-[#14919b] shadow">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Offers Popups</h1>
            <p className="text-xs text-gray-400">
              Configure lead-capture popups for offer pages on the website
            </p>
          </div>
          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-[#0d7377]">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#0d7377]" />
              Saving…
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : (
          <OffersPopupsList
            popups={popups}
            onUpdate={handleUpdate}
            isSaving={isPending}
          />
        )}
      </div>
    </div>
  );
}
