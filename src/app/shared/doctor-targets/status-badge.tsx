'use client';

import { Badge } from '@/components/ui/badge';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  approved: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  approved: 'Approved',
  paid: 'Externally paid',
};

export default function TargetStatusBadge({ status }: { status?: string }) {
  const key = (status || '').toLowerCase();
  return (
    <Badge className={STATUS_STYLES[key] || 'bg-gray-100 text-gray-700'}>
      {STATUS_LABELS[key] || status || '—'}
    </Badge>
  );
}

export function formatAchievement(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(1)}%`;
}

export function formatMoney(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function doctorDisplayName(doctor?: any, fallbackId?: number | string) {
  if (!doctor) return fallbackId != null ? `Doctor #${fallbackId}` : '—';
  return (
    doctor?.name?.en ||
    doctor?.name?.ar ||
    doctor?.name ||
    doctor?.email ||
    `Doctor #${doctor?.id ?? fallbackId}`
  );
}
