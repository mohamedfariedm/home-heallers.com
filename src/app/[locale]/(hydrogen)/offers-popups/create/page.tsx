'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import OfferPopupEditor from '@/components/offers-popups/OfferPopupEditor';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { OfferPopup } from '@/types/settings';
import { routes } from '@/config/routes';
import {
  createDefaultOfferPopup,
  normalizeOfferPopup,
} from '@/utils/offers-popup-defaults';

export default function CreateOfferPopupPage() {
  const router = useRouter();
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();

  const settings = data?.data[0]?.setting;
  const initialPopup = useMemo(() => createDefaultOfferPopup(), []);

  const handleSave = (popup: OfferPopup) => {
    if (!settings) return;
    const next = normalizeOfferPopup(popup);
    const offer_popups = [
      ...(settings.offer_popups ?? []).map(normalizeOfferPopup),
      next,
    ];
    update(
      { setting: { ...settings, offer_popups } },
      {
        onSuccess: () => {
          router.push(routes.offersPopups.edit(next.id));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <OfferPopupEditor
      initialPopup={initialPopup}
      onSave={handleSave}
      isSaving={isPending}
      mode="create"
    />
  );
}
