'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
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
    <AdminPageShell
      title="Offers Popups"
      description="Configure lead-capture popups for offer pages on the website"
      icon={<Megaphone />}
      status={
        isPending ? (
          <div className="flex items-center gap-2 text-sm text-[#143087]">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#143087]" />
            Saving…
          </div>
        ) : null
      }
    >
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
    </AdminPageShell>
  );
}
