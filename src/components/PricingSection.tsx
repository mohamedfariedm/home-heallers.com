import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PricingSectionProps {
  sessionPrice: number | string | null | undefined;
  onUpdate: (sessionPrice: number | '') => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  sessionPrice,
  onUpdate,
}) => {
  const { t } = useTranslation('settings');
  const value =
    sessionPrice === null || sessionPrice === undefined || sessionPrice === ''
      ? ''
      : String(sessionPrice);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t('settings_pricing_title')}
        </h2>
        <p className="text-gray-600">{t('settings_pricing_desc')}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center space-x-3">
          <CircleDollarSign className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {t('settings_bulk_price')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('settings_bulk_price_hint')}
            </p>
          </div>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('settings_bulk_price')} (SAR)
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onUpdate('');
              return;
            }
            const next = Number(raw);
            onUpdate(Number.isFinite(next) && next >= 0 ? next : '');
          }}
          placeholder={t('settings_bulk_price_ph')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default PricingSection;
