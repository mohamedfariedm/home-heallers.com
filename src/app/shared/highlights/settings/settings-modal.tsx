'use client';

import React, { useEffect, useState } from 'react';
import { Title, Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  useHighlightSettings,
  useUpdateHighlightSettings,
} from '@/framework/highlights';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface HighlightsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HighlightsSettingsModal({
  isOpen,
  onClose,
}: HighlightsSettingsModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useHighlightSettings();
  const updateSettings = useUpdateHighlightSettings();
  const [duration, setDuration] = useState<number>(15);

  useEffect(() => {
    if (data?.highlight_image_duration_seconds) {
      setDuration(Number(data.highlight_image_duration_seconds));
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) {
      toast.error(t('highlights_settings_duration_error'));
      return;
    }

    try {
      await updateSettings.mutateAsync({
        highlight_image_duration_seconds: duration,
      });
      onClose();
    } catch {
      // Handled in mutation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Title as="h3" className="mb-2 text-lg font-semibold text-gray-900">
          {t('highlights_settings_title')}
        </Title>
        <Text className="mb-4 text-xs text-gray-500">
          {t('highlights_settings_desc')}
        </Text>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('highlights_settings_duration_label')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              placeholder="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('highlights_cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={updateSettings.isPending}
              disabled={isLoading}
            >
              {t('highlights_settings_save')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
