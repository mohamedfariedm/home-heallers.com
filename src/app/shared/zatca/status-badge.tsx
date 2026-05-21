'use client';

import cn from '@/utils/class-names';
import type { BusinessStatus, ValidationStatus, ZatcaStatus } from '@/types/zatca';

type BadgeKind = 'business' | 'zatca' | 'validation' | 'document';

const businessStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ISSUED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'border border-red-300 bg-transparent text-red-700',
};

const zatcaStyles: Record<string, string> = {
  NOT_SUBMITTED: 'bg-gray-100 text-gray-600',
  QUEUED: 'bg-yellow-100 text-yellow-800 animate-pulse',
  SUBMITTING: 'bg-yellow-100 text-yellow-800 animate-pulse',
  REPORTED: 'bg-green-100 text-green-800',
  CLEARED: 'bg-green-100 text-green-800',
  REPORTED_WITH_WARNINGS: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
};

const validationStyles: Record<string, string> = {
  VALID: 'bg-green-100 text-green-800',
  WARNING: 'bg-amber-100 text-amber-800',
  ERROR: 'bg-red-100 text-red-800',
};

const documentLabels: Record<string, string> = {
  INVOICE: 'Invoice',
  CREDIT_NOTE: 'Credit Note',
  DEBIT_NOTE: 'Debit Note',
};

function normalizeZatca(value: ZatcaStatus) {
  if (!value) return 'NOT_SUBMITTED';
  return value;
}

export default function StatusBadge({
  kind,
  value,
  className,
}: {
  kind: BadgeKind;
  value: string | null | undefined;
  className?: string;
}) {
  if (kind === 'validation' && !value) {
    return (
      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
        —
      </span>
    );
  }

  if (kind === 'validation') {
    const v = value as ValidationStatus;
    return (
      <span
        title={v ?? ''}
        className={cn(
          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
          validationStyles[v ?? ''] ?? 'bg-gray-100 text-gray-600',
          className
        )}
      >
        {v === 'VALID' ? '✓' : v === 'WARNING' ? '⚠' : v === 'ERROR' ? '✗' : v}
      </span>
    );
  }

  if (kind === 'document') {
    return (
      <span
        className={cn(
          'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700',
          className
        )}
      >
        {documentLabels[value ?? ''] ?? value}
      </span>
    );
  }

  if (kind === 'business') {
    const v = (value ?? 'DRAFT') as BusinessStatus;
    return (
      <span
        className={cn(
          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
          businessStyles[v] ?? 'bg-gray-100 text-gray-600',
          className
        )}
      >
        {v}
      </span>
    );
  }

  const v = normalizeZatca(value as ZatcaStatus);
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        zatcaStyles[v] ?? 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {v.replace(/_/g, ' ')}
    </span>
  );
}
