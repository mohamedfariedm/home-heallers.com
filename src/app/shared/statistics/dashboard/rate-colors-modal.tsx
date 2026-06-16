'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { PiXBold } from 'react-icons/pi';
import RateMetricRangesEditor, {
  RATE_METRIC_OPTIONS,
  createEmptyRange,
} from '@/components/RateMetricRangesEditor';
import type { RateColorRange, RateColorsByMetric, RateMetricKey } from '@/types/settings';

interface RateColorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: RateMetricKey | null;
  rateColors: RateColorsByMetric;
  onSave: (rateColors: RateColorsByMetric, onSuccess?: () => void) => void;
  isSaving?: boolean;
}

export default function RateColorsModal({
  isOpen,
  onClose,
  metric,
  rateColors,
  onSave,
  isSaving = false,
}: RateColorsModalProps) {
  const [draftRanges, setDraftRanges] = useState<RateColorRange[]>([]);

  useEffect(() => {
    if (!isOpen || !metric) return;
    const existing = rateColors[metric];
    setDraftRanges(existing && existing.length > 0 ? existing : [createEmptyRange()]);
  }, [isOpen, metric, rateColors]);

  if (!metric) return null;

  const metricLabel =
    RATE_METRIC_OPTIONS.find((item) => item.key === metric)?.label ?? metric;

  const handleSave = () => {
    onSave(
      {
        ...rateColors,
        [metric]: draftRanges,
      },
      onClose
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} customSize="720px">
      <div className="m-auto px-7 pb-8 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Rate Colors
            </Title>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{metricLabel}</p>
          </div>
          <ActionIcon variant="text" onClick={onClose} className="h-5 w-5">
            <PiXBold className="h-5 w-5" />
          </ActionIcon>
        </div>

        <RateMetricRangesEditor
          metric={metric}
          ranges={draftRanges}
          onChange={setDraftRanges}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save to Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
