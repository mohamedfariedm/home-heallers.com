'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { PiBellSimpleRingingFill, PiWarningBold } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/datepicker';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import {
  useCreateGeoRegion,
  useGeoRegions,
  useUpdateGeoRegion,
} from '@/framework/geo-regions';
import { routes } from '@/config/routes';
import type {
  GeoBilingual,
  GeoLang,
  GeoPoint,
  GeoRegion,
  GeoRegionPayload,
} from '@/types/geo-regions';
import CouponSelect from './coupon-select';
import CouponStatusAlert from './coupon-status-alert';
import {
  MIN_AREA_M2,
  REQUIRED_POINTS,
  formatArea,
  polygonAreaM2,
  validateShape,
  type GeoShapeError,
} from './geometry';

const RegionMap = dynamic(() => import('./region-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-lg border border-gray-200">
      <Spinner size="lg" />
    </div>
  ),
});

interface RegionFormProps {
  initialValues?: GeoRegion;
}

const LANGS: { key: GeoLang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
];

const MAX_NAME = 255;
const MAX_TITLE = 100;
const MAX_BODY = 250;

type FieldErrors = Record<string, string>;

const SHAPE_ERROR_KEY: Record<GeoShapeError, [string, string]> = {
  count: ['geo_err_count', 'The region must have exactly 4 points.'],
  distinct: ['geo_err_distinct', 'The region points must be distinct.'],
  collinear: [
    'geo_err_collinear',
    'Three of the region points lie on a straight line.',
  ],
  crossing: [
    'geo_err_crossing',
    'The region edges cross each other. Place the points in order around the area.',
  ],
  too_small: [
    'geo_err_too_small',
    'The region is too small. Minimum area is 2,500 m².',
  ],
};

function emptyBilingual(): GeoBilingual {
  return { ar: '', en: '' };
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`text-xs ${over ? 'text-red-500' : 'text-gray-400'}`}>
      {value.length}/{max}
    </span>
  );
}

export default function RegionForm({ initialValues }: RegionFormProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const uiLang: GeoLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const isEdit = Boolean(initialValues?.id);

  const [name, setName] = useState<GeoBilingual>(
    initialValues?.name ?? emptyBilingual()
  );
  const [pushTitle, setPushTitle] = useState<GeoBilingual>(
    initialValues?.push_title ?? emptyBilingual()
  );
  const [pushBody, setPushBody] = useState<GeoBilingual>(
    initialValues?.push_body ?? emptyBilingual()
  );
  // Draw from the saved points: the server may have reversed the winding.
  const [points, setPoints] = useState<GeoPoint[]>(
    initialValues?.points ?? []
  );
  const [priority, setPriority] = useState<string>(
    String(initialValues?.priority ?? 100)
  );
  const [couponId, setCouponId] = useState<string | null>(
    initialValues?.market_coupon_id ?? null
  );
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    initialValues?.expires_at ? new Date(initialValues.expires_at) : null
  );
  const [previewLang, setPreviewLang] = useState<GeoLang>(uiLang);
  const [errors, setErrors] = useState<FieldErrors>({});

  const create = useCreateGeoRegion();
  const update = useUpdateGeoRegion();
  const isSaving = create.isPending || update.isPending;

  // Other active regions, drawn faded for overlap context.
  const { data: othersData } = useGeoRegions('status=active&limit=100');
  const otherRegions = useMemo(
    () =>
      (othersData?.data ?? [])
        .filter((r) => r.id !== initialValues?.id)
        .map((r) => r.points),
    [othersData?.data, initialValues?.id]
  );

  const shapeError = validateShape(points, false);
  const area = points.length >= 3 ? polygonAreaM2(points) : 0;

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    const required = t('geo_required', 'This field is required');

    LANGS.forEach(({ key }) => {
      if (!name[key].trim()) found[`name.${key}`] = required;
      if (!pushTitle[key].trim()) found[`push_title.${key}`] = required;
      if (!pushBody[key].trim()) found[`push_body.${key}`] = required;
      if (name[key].length > MAX_NAME)
        found[`name.${key}`] = t('geo_too_long', {
          defaultValue: 'Maximum {{max}} characters',
          max: MAX_NAME,
        });
      if (pushTitle[key].length > MAX_TITLE)
        found[`push_title.${key}`] = t('geo_too_long', {
          defaultValue: 'Maximum {{max}} characters',
          max: MAX_TITLE,
        });
      if (pushBody[key].length > MAX_BODY)
        found[`push_body.${key}`] = t('geo_too_long', {
          defaultValue: 'Maximum {{max}} characters',
          max: MAX_BODY,
        });
    });

    const shape = validateShape(points, true);
    if (shape) {
      const [k, d] = SHAPE_ERROR_KEY[shape];
      found.points = t(k, d);
    }

    const prio = Number(priority);
    if (
      priority.trim() === '' ||
      !Number.isInteger(prio) ||
      prio < 0 ||
      prio > 1_000_000
    ) {
      found.priority = t(
        'geo_priority_invalid',
        'Priority must be a whole number between 0 and 1,000,000'
      );
    }

    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      found.expires_at = t(
        'geo_expires_future',
        'Expiry must be a future date, or leave it empty for no expiry'
      );
    }

    return found;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error(t('geo_fix_errors', 'Please fix the highlighted fields'));
      return;
    }

    const payload: GeoRegionPayload = {
      name: { ar: name.ar.trim(), en: name.en.trim() },
      push_title: { ar: pushTitle.ar.trim(), en: pushTitle.en.trim() },
      push_body: { ar: pushBody.ar.trim(), en: pushBody.en.trim() },
      points,
      priority: Number(priority),
      market_coupon_id: couponId,
      is_active: isActive,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    };

    try {
      if (isEdit && initialValues?.id) {
        await update.mutateAsync({ id: initialValues.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      router.push(routes.geoRegions.index);
    } catch (err: any) {
      // Surface the server's per-field messages next to the fields.
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const mapped: FieldErrors = {};
        Object.entries<any>(serverErrors).forEach(([field, msgs]) => {
          const first = Array.isArray(msgs) ? msgs[0] : msgs;
          if (!first) return;
          // points.N.lat / points.N.lng → points
          const key = field.startsWith('points.') ? 'points' : field;
          if (!mapped[key]) mapped[key] = String(first);
        });
        setErrors(mapped);
      }
    }
  };

  const setLangField = (
    setter: React.Dispatch<React.SetStateAction<GeoBilingual>>,
    prefix: string,
    lang: GeoLang,
    value: string
  ) => {
    setter((prev) => ({ ...prev, [lang]: value }));
    clearError(`${prefix}.${lang}`);
  };

  const mapError = errors.points ?? (shapeError ? (() => {
    const [k, d] = SHAPE_ERROR_KEY[shapeError];
    return t(k, d);
  })() : undefined);

  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700';
  const cardCls =
    'space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm';

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Settings */}
      <div className={cardCls}>
        <Title as="h3" className="text-base font-semibold text-gray-900">
          {t('geo_section_settings', 'Region settings')}
        </Title>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls}>
              {t('geo_field_priority', 'Priority')}
            </label>
            <Input
              type="number"
              min={0}
              max={1000000}
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                clearError('priority');
              }}
              error={errors.priority}
            />
            <Text className="mt-1 text-xs text-gray-500">
              {t(
                'geo_priority_hint',
                'The lower number wins when regions overlap.'
              )}
            </Text>
          </div>

          <div>
            <label className={labelCls}>
              {t('geo_field_expires', 'Expires at')}
            </label>
            <DatePicker
              selected={expiresAt ?? undefined}
              onChange={(date: Date | null) => {
                setExpiresAt(date ?? null);
                clearError('expires_at');
              }}
              showTimeSelect
              isClearable
              minDate={new Date()}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText={t('geo_no_expiry', 'No expiry')}
              inputProps={{ className: 'w-full' }}
            />
            {errors.expires_at ? (
              <p className="mt-1 text-sm text-red-500">{errors.expires_at}</p>
            ) : (
              <Text className="mt-1 text-xs text-gray-500">
                {t('geo_expires_hint', 'Leave empty for no expiry.')}
              </Text>
            )}
          </div>

          <div className="flex items-center gap-3 md:pt-7">
            <Switch checked={isActive} onChange={() => setIsActive(!isActive)} />
            <div>
              <Text className="text-sm font-semibold text-gray-900">
                {t('geo_field_active', 'Active')}
              </Text>
              <Text className="text-xs text-gray-500">
                {t(
                  'geo_active_hint',
                  'Only active regions reach the mobile app.'
                )}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Copy per language */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {LANGS.map(({ key, label }) => {
          const isAr = key === 'ar';
          return (
            <div key={key} className={cardCls}>
              <Title as="h3" className="text-base font-semibold text-gray-900">
                {label}
              </Title>

              <div>
                <label className={labelCls}>
                  {t('geo_field_name', 'Internal name')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  dir={isAr ? 'rtl' : 'ltr'}
                  placeholder={isAr ? 'العليا' : 'Olaya'}
                  value={name[key]}
                  onChange={(e) => setLangField(setName, 'name', key, e.target.value)}
                  error={errors[`name.${key}`]}
                />
                <Text className="mt-1 text-xs text-gray-500">
                  {t(
                    'geo_name_hint',
                    'Visible to admins only. Users never see it.'
                  )}
                </Text>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    {t('geo_field_push_title', 'Notification title')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <CharCounter value={pushTitle[key]} max={MAX_TITLE} />
                </div>
                <Input
                  dir={isAr ? 'rtl' : 'ltr'}
                  placeholder={isAr ? 'خصم 20% قريب منك' : '20% off near you'}
                  value={pushTitle[key]}
                  onChange={(e) =>
                    setLangField(setPushTitle, 'push_title', key, e.target.value)
                  }
                  error={errors[`push_title.${key}`]}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    {t('geo_field_push_body', 'Notification body')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <CharCounter value={pushBody[key]} max={MAX_BODY} />
                </div>
                <Textarea
                  dir={isAr ? 'rtl' : 'ltr'}
                  rows={3}
                  placeholder={
                    isAr
                      ? 'احجز جلستك النهارده بكود SUMMER20'
                      : 'Book today with code SUMMER20'
                  }
                  value={pushBody[key]}
                  onChange={(e) =>
                    setLangField(setPushBody, 'push_body', key, e.target.value)
                  }
                  error={errors[`push_body.${key}`]}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Map */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Title as="h3" className="text-base font-semibold text-gray-900">
            {t('geo_section_area', 'Region area')}
          </Title>
          <Text className="text-xs text-gray-500">
            {t('geo_points_count', {
              defaultValue: '{{count}} / {{total}} points',
              count: points.length,
              total: REQUIRED_POINTS,
            })}
          </Text>
        </div>

        <RegionMap
          points={points}
          onChange={(next) => {
            setPoints(next);
            clearError('points');
          }}
          otherRegions={otherRegions}
          hasError={Boolean(mapError)}
          disabled={isSaving}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-sm text-gray-700">
            {points.length >= 3
              ? t('geo_area_value', {
                  defaultValue: 'Approx. area: {{area}}',
                  area: formatArea(area),
                })
              : t('geo_area_pending', 'Place at least 3 points to see the area.')}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('geo_min_area', {
              defaultValue: 'Minimum area: {{area}}',
              area: formatArea(MIN_AREA_M2),
            })}
          </Text>
        </div>

        {mapError && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <PiWarningBold className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{mapError}</span>
          </div>
        )}
      </div>

      {/* Coupon */}
      <div className={cardCls}>
        <Title as="h3" className="text-base font-semibold text-gray-900">
          {t('geo_section_coupon', 'Coupon')}
        </Title>
        <div className="max-w-xl">
          <CouponSelect
            value={couponId}
            onChange={(id) => {
              setCouponId(id);
              clearError('market_coupon_id');
            }}
            lang={uiLang}
            currentCoupon={initialValues?.coupon}
            error={errors.market_coupon_id}
            disabled={isSaving}
          />
        </div>
        {isEdit && couponId === initialValues?.market_coupon_id && (
          <CouponStatusAlert status={initialValues?.coupon_status} />
        )}
      </div>

      {/* Preview */}
      <div className={cardCls}>
        <div className="flex items-center justify-between gap-3">
          <Title as="h3" className="text-base font-semibold text-gray-900">
            {t('geo_section_preview', 'Notification preview')}
          </Title>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {LANGS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreviewLang(key)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                  previewLang === key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {key.toUpperCase()}
                <span className="sr-only"> {label}</span>
              </button>
            ))}
          </div>
        </div>
        <div
          dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
          className="max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
              <PiBellSimpleRingingFill className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {pushTitle[previewLang] ||
                  t('geo_preview_title_ph', 'Notification title')}
              </p>
              <p className="mt-0.5 break-words text-sm text-gray-600">
                {pushBody[previewLang] ||
                  t('geo_preview_body_ph', 'Notification body appears here.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(routes.geoRegions.index)}
        >
          {t('geo_cancel', 'Cancel')}
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {isEdit
            ? t('geo_save', 'Save Changes')
            : t('geo_create_btn', 'Create Region')}
        </Button>
      </div>
    </form>
  );
}
