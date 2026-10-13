'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Title, Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import {
  useSupportTicketsSettings,
  useUpdateSupportTicketsSettings,
} from '@/framework/support-tickets';

const MAX_LENGTH = 1000;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportTicketsSettingsModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useSupportTicketsSettings(isOpen);
  const update = useUpdateSupportTicketsSettings({
    success: t('st_settings_saved'),
    error: t('st_settings_save_error'),
  });
  const [ar, setAr] = useState('');
  const [en, setEn] = useState('');

  useEffect(() => {
    if (!isOpen || !data?.welcome_message) return;
    setAr(data.welcome_message.ar ?? '');
    setEn(data.welcome_message.en ?? '');
  }, [data, isOpen]);

  const valid = ar.trim().length > 0 && en.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await update.mutateAsync({ welcome_message: { ar: ar.trim(), en: en.trim() } });
      onClose();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <Title as="h3" className="mb-1 text-lg font-semibold text-gray-900">
          {t('st_settings_title')}
        </Title>
        <Text className="mb-4 text-xs text-gray-500">{t('st_settings_desc')}</Text>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label={t('st_settings_welcome_ar')}
              dir="rtl"
              value={ar}
              maxLength={MAX_LENGTH}
              onChange={(e) => setAr(e.target.value)}
              rows={4}
              required
              helperText={`${ar.length}/${MAX_LENGTH}`}
            />
            <Textarea
              label={t('st_settings_welcome_en')}
              dir="ltr"
              value={en}
              maxLength={MAX_LENGTH}
              onChange={(e) => setEn(e.target.value)}
              rows={4}
              required
              helperText={`${en.length}/${MAX_LENGTH}`}
            />
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('st_cancel')}
              </Button>
              <Button type="submit" isLoading={update.isPending} disabled={!valid}>
                {t('st_save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
