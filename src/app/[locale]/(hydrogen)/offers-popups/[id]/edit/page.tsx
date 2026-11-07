'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import OfferPopupEditor from '@/components/offers-popups/OfferPopupEditor';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { OfferPopup } from '@/types/settings';
import { routes } from '@/config/routes';
import { normalizeOfferPopup } from '@/utils/offers-popup-defaults';

export default function EditOfferPopupPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();

  const settings = data?.data[0]?.setting;
  const popups: OfferPopup[] = (settings?.offer_popups ?? []).map(
    normalizeOfferPopup
  );

  const initialPopup = useMemo(
    () => popups.find((p) => p.id === id),
    [popups, id]
  );

  const handleSave = (popup: OfferPopup) => {
    if (!settings) return;
    const next = normalizeOfferPopup(popup);
    const offer_popups = popups.map((p) => (p.id === next.id ? next : p));
    update(
      { setting: { ...settings, offer_popups } },
      {
        onSuccess: () => {
          router.refresh();
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

  if (!initialPopup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium text-gray-800">Popup not found</p>
        <p className="text-sm text-gray-500">
          This offers popup may have been deleted.
        </p>
        <Link href={routes.offersPopups.index}>
          <Button className="bg-[#0d7377] hover:bg-[#0a5c5f]">
            Back to popups
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <OfferPopupEditor
      key={initialPopup.id}
      initialPopup={initialPopup}
      onSave={handleSave}
      isSaving={isPending}
      mode="edit"
    />
  );
}
