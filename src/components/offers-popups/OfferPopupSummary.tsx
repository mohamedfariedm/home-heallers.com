'use client';

import React from 'react';
import { OfferPopup } from '@/types/settings';
import {
  formatDateRangeSummary,
  formatFrequencySummary,
  formatTriggerSummary,
  formatUrlRulesSummary,
} from '@/utils/offers-popup-defaults';

interface OfferPopupSummaryProps {
  popup: OfferPopup;
}

export default function OfferPopupSummary({ popup }: OfferPopupSummaryProps) {
  const devicesLabel =
    popup.devices === 'both'
      ? 'Desktop + Mobile'
      : popup.devices === 'desktop'
        ? 'Desktop only'
        : 'Mobile only';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Summary
      </p>
      <ul className="space-y-2.5 text-sm text-gray-700">
        <li>
          <span className="font-medium text-gray-900">Shows on: </span>
          pages {formatUrlRulesSummary(popup.url_rules)}
        </li>
        <li>
          <span className="font-medium text-gray-900">Appears: </span>
          {formatTriggerSummary(popup)}
        </li>
        <li>
          <span className="font-medium text-gray-900">Runs: </span>
          {formatDateRangeSummary(popup)}
        </li>
        <li>
          <span className="font-medium text-gray-900">Frequency: </span>
          {formatFrequencySummary(popup)}
        </li>
        <li>
          <span className="font-medium text-gray-900">Devices: </span>
          {devicesLabel}
        </li>
        <li>
          <span className="font-medium text-gray-900">Status: </span>
          {popup.status === 'active' ? 'Active' : 'Inactive'}
        </li>
        <li>
          <span className="font-medium text-gray-900">Priority: </span>
          {popup.priority}
        </li>
        <li>
          <span className="font-medium text-gray-900">Promo: </span>
          {popup.coupon_code || (popup.coupon_id ? 'Linked coupon' : 'Not set')}
        </li>
      </ul>
    </div>
  );
}
