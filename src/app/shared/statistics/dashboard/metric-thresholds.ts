export type MetricPerformance = 'excellent' | 'average' | 'danger';

export type RateMetricKey =
  | 'reservation_rate'
  | 'conversion_rate'
  | 'package_conversion';

const THRESHOLDS: Record<
  RateMetricKey,
  { excellentMin: number; averageMin: number }
> = {
  reservation_rate: { excellentMin: 25, averageMin: 15 },
  conversion_rate: { excellentMin: 18, averageMin: 10 },
  package_conversion: { excellentMin: 35, averageMin: 20 },
};

/** Rate is a decimal (0–1); thresholds are in percent (0–100). */
export function getRatePerformance(
  rate: number,
  metric: RateMetricKey
): MetricPerformance {
  const percent = rate * 100;
  const { excellentMin, averageMin } = THRESHOLDS[metric];

  if (percent >= excellentMin) return 'excellent';
  if (percent >= averageMin) return 'average';
  return 'danger';
}

export function formatRatePercent(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function getPerformanceColors(status: MetricPerformance) {
  switch (status) {
    case 'excellent':
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        darkBgColor: 'dark:bg-green-900/20',
        darkTextColor: 'dark:text-green-400',
        blurColor: 'bg-green-50/50',
        darkBlurColor: 'dark:bg-green-900/10',
        badgeClass:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        barColor: '#22c55e',
      };
    case 'average':
      return {
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        darkBgColor: 'dark:bg-amber-900/20',
        darkTextColor: 'dark:text-amber-400',
        blurColor: 'bg-amber-50/50',
        darkBlurColor: 'dark:bg-amber-900/10',
        badgeClass:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        barColor: '#f59e0b',
      };
    case 'danger':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        darkBgColor: 'dark:bg-red-900/20',
        darkTextColor: 'dark:text-red-400',
        blurColor: 'bg-red-50/50',
        darkBlurColor: 'dark:bg-red-900/10',
        badgeClass:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        barColor: '#ef4444',
      };
  }
}

export function getPerformanceLabel(status: MetricPerformance): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'average':
      return 'Average';
    case 'danger':
      return 'Needs Attention';
  }
}
