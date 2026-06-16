import React from 'react';
import { Palette } from 'lucide-react';
import { RateColorsByMetric } from '../types/settings';
import RateMetricRangesEditor, { RATE_METRIC_OPTIONS } from './RateMetricRangesEditor';

interface RateColorsSectionProps {
  rateColors: RateColorsByMetric;
  onUpdate: (rateColors: RateColorsByMetric) => void;
}

const RateColorsSection: React.FC<RateColorsSectionProps> = ({ rateColors, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Rate Colors</h2>
        <p className="text-gray-600">
          Configure color ranges per metric. Each dashboard rate card uses its own key settings.
        </p>
      </div>

      <div className="space-y-8">
        {RATE_METRIC_OPTIONS.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Palette className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{key}</span>
            </div>

            <RateMetricRangesEditor
              metric={key}
              ranges={rateColors[key] || []}
              onChange={(ranges) => onUpdate({ ...rateColors, [key]: ranges })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateColorsSection;
