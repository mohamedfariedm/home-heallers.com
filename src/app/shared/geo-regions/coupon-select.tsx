'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import CreateOrUpdateCoupon from '@/app/shared/coupons/coupons-form';
import { useCoupons } from '@/framework/coupons';
import type { GeoRegionCoupon } from '@/types/geo-regions';
import type { MarketCoupon } from '@/types/coupon';

interface CouponSelectProps {
  value: string | null;
  onChange: (couponId: string | null) => void;
  lang: 'ar' | 'en';
  /** The coupon already linked to the region (edit), shown even if it is not in the current page. */
  currentCoupon?: GeoRegionCoupon | null;
  error?: string;
  disabled?: boolean;
}

type Option = {
  value: string;
  label: string;
  code?: string;
  endsAt?: string | null;
};

const NONE = '__none__';

function pickName(
  name: { ar?: string; en?: string } | string | null | undefined,
  lang: 'ar' | 'en'
) {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang] || name.en || name.ar || '';
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export default function CouponSelect({
  value,
  onChange,
  lang,
  currentCoupon,
  error,
  disabled,
}: CouponSelectProps) {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 350);
    return () => clearTimeout(timer);
  }, [input]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ is_active: '1', limit: '30', page: '1' });
    if (search) params.set('name', search);
    return params.toString();
  }, [search]);

  const { data, isLoading } = useCoupons(query);

  const options: Option[] = useMemo(() => {
    const list: MarketCoupon[] = Array.isArray(data?.data) ? data.data : [];
    const now = Date.now();

    const eligible = list.filter((c) => {
      if (c.ends_at && new Date(c.ends_at).getTime() < now) return false;
      return true;
    });

    const mapped: Option[] = eligible.map((c) => ({
      value: c.id,
      code: c.code,
      endsAt: c.ends_at,
      label: `${c.code} — ${pickName(c.name, lang)}`,
    }));

    // Keep the chosen coupon visible even when it isn't in the fetched page
    // (already linked on edit, or just created and not refetched yet).
    if (value && !mapped.some((o) => o.value === value)) {
      if (currentCoupon?.id === value) {
        mapped.unshift({
          value: currentCoupon.id,
          code: currentCoupon.code,
          endsAt: currentCoupon.ends_at,
          label: `${currentCoupon.code} — ${pickName(currentCoupon.name, lang)}`,
        });
      } else {
        mapped.unshift({ value, label: `#${value.slice(0, 8)}` });
      }
    }

    return [
      { value: NONE, label: t('geo_coupon_none', 'No coupon') },
      ...mapped,
    ];
  }, [data?.data, lang, value, currentCoupon, t]);

  const selected =
    options.find((o) => o.value === (value ?? NONE)) ?? options[0];

  const handleCreate = () => {
    openModal({
      view: (
        <CreateOrUpdateCoupon
          onCreated={(coupon) => {
            if (coupon?.id) onChange(String(coupon.id));
          }}
        />
      ),
      customSize: '960px',
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('geo_field_coupon', 'Coupon')}
        </label>
        <Button
          type="button"
          size="sm"
          variant="text"
          className="h-auto p-0 text-xs"
          disabled={disabled}
          onClick={handleCreate}
        >
          <PiPlusBold className="me-1 h-3.5 w-3.5" />
          {t('geo_coupon_create', 'Create new coupon')}
        </Button>
      </div>
      <Select<Option>
        options={options}
        value={selected}
        isLoading={isLoading}
        isDisabled={disabled}
        isSearchable
        filterOption={null}
        onInputChange={(v, meta) => {
          if (meta.action === 'input-change') setInput(v);
        }}
        onChange={(opt) =>
          onChange(!opt || opt.value === NONE ? null : opt.value)
        }
        formatOptionLabel={(opt) =>
          opt.value === NONE ? (
            <span className="text-gray-600">{opt.label}</span>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">{opt.label}</span>
              {opt.endsAt && (
                <span className="shrink-0 text-xs text-gray-500">
                  {t('geo_coupon_ends', 'Ends')} {formatDate(opt.endsAt)}
                </span>
              )}
            </div>
          )
        }
        placeholder={t('geo_coupon_search', 'Search coupons by name')}
        noOptionsMessage={() => t('geo_coupon_no_results', 'No coupons found')}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({
            ...base,
            minHeight: 42,
            borderColor: error ? '#ef4444' : base.borderColor,
          }),
        }}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : (
        <Text className="mt-1 text-xs text-gray-500">
          {t('geo_coupon_hint', 'Only active coupons are listed.')}
        </Text>
      )}
    </div>
  );
}
