'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ExternalLink, Plus, Trash2, ArrowLeft, Megaphone } from 'lucide-react';
import {
  MultilingualText,
  OfferPopup,
  OfferPopupDevices,
  OfferPopupDiscountType,
  OfferPopupFormFieldKey,
  OfferPopupFrequency,
  OfferPopupTriggerType,
  OfferPopupUrlMatchType,
} from '@/types/settings';
import { routes } from '@/config/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/datepicker';
import { Textarea } from '@/components/ui/textarea';
import CouponSelect from '@/app/shared/geo-regions/coupon-select';
import AdminPageShell from '@/components/ui/admin-page-shell';
import OfferPopupPreview from './OfferPopupPreview';
import OfferPopupSummary from './OfferPopupSummary';
import {
  OFFER_POPUP_DEFAULTS,
  OFFER_POPUP_FORM_FIELD_META,
  buildCouponInitFromPopup,
  buildPopupPreviewUrl,
  normalizeOfferPopup,
  triggerNeedsScroll,
  triggerNeedsSeconds,
  validateOfferPopup,
} from '@/utils/offers-popup-defaults';

interface OfferPopupEditorProps {
  initialPopup: OfferPopup;
  onSave: (popup: OfferPopup) => void;
  isSaving?: boolean;
  mode: 'create' | 'edit';
}

const DEVICE_OPTIONS: { value: OfferPopupDevices; label: string }[] = [
  { value: 'both', label: 'Desktop + Mobile' },
  { value: 'desktop', label: 'Desktop only' },
  { value: 'mobile', label: 'Mobile only' },
];

const TRIGGER_OPTIONS: { value: OfferPopupTriggerType; label: string }[] = [
  { value: 'time_delay', label: 'Time delay' },
  { value: 'scroll_depth', label: 'Scroll depth' },
  { value: 'whichever_first', label: 'Whichever comes first' },
  { value: 'exit_intent', label: 'Exit intent' },
];

const DISCOUNT_OPTIONS: { value: OfferPopupDiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed amount (SAR)' },
  { value: 'free_session', label: 'Free session' },
];

const FREQUENCY_OPTIONS: { value: OfferPopupFrequency; label: string }[] = [
  { value: 'once_per_session', label: 'Once per session' },
  { value: 'once_per_day', label: 'Once per day' },
  { value: 'every_visit', label: 'Every visit' },
];

const FORM_FIELD_KEYS = Object.keys(
  OFFER_POPUP_FORM_FIELD_META
) as OfferPopupFormFieldKey[];

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-white text-[#143087] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="text-sm font-medium text-gray-700">{children}</label>
      {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function BilingualInputs({
  label,
  value,
  onChange,
  max,
  multiline,
  error,
  arPlaceholder,
  enPlaceholder,
}: {
  label: string;
  value: MultilingualText;
  onChange: (next: MultilingualText) => void;
  max?: number;
  multiline?: boolean;
  error?: string;
  arPlaceholder?: string;
  enPlaceholder?: string;
}) {
  const Field = multiline ? Textarea : Input;
  return (
    <div className="space-y-3">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel
            hint={max ? `${value.ar.length}/${max}` : undefined}
          >
            Arabic
          </FieldLabel>
          <Field
            dir="rtl"
            value={value.ar}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, ar: e.target.value })
            }
            placeholder={arPlaceholder}
            rows={multiline ? 2 : undefined}
          />
        </div>
        <div>
          <FieldLabel
            hint={max ? `${value.en.length}/${max}` : undefined}
          >
            English
          </FieldLabel>
          <Field
            value={value.en}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, en: e.target.value })
            }
            placeholder={enPlaceholder}
            rows={multiline ? 2 : undefined}
          />
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDateInput(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function OfferPopupEditor({
  initialPopup,
  onSave,
  isSaving,
  mode,
}: OfferPopupEditorProps) {
  const [popup, setPopup] = useState<OfferPopup>(() =>
    normalizeOfferPopup(initialPopup)
  );
  const [showErrors, setShowErrors] = useState(false);
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar');

  const errors = useMemo(() => validateOfferPopup(popup), [popup]);
  const couponInitValues = useMemo(
    () => buildCouponInitFromPopup(popup),
    [popup]
  );

  const patch = <K extends keyof OfferPopup>(key: K, value: OfferPopup[K]) => {
    setPopup((prev) => ({ ...prev, [key]: value }));
  };

  const patchFormField = (
    key: OfferPopupFormFieldKey,
    next: Partial<{ visible: boolean; required: boolean }>
  ) => {
    setPopup((prev) => {
      const current = prev.form_fields[key];
      const visible =
        next.visible !== undefined ? next.visible : current.visible;
      let required =
        next.required !== undefined ? next.required : current.required;
      if (!visible) required = false;
      if (visible && next.visible === true && next.required === undefined) {
        required = current.required;
      }
      return {
        ...prev,
        form_fields: {
          ...prev.form_fields,
          [key]: { visible, required },
        },
      };
    });
  };

  const handleSave = () => {
    const normalized = normalizeOfferPopup(popup);
    const nextErrors = validateOfferPopup(normalized);
    if (Object.keys(nextErrors).length) {
      setShowErrors(true);
      toast.error('Please fix the highlighted fields');
      return;
    }
    onSave(normalized);
  };

  const handlePreview = () => {
    const url = buildPopupPreviewUrl(popup);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const err = (key: string) => (showErrors ? errors[key] : undefined);

  const editorTitle =
    popup.name ||
    (mode === 'create' ? 'New Offers Popup' : 'Edit Offers Popup');

  return (
    <AdminPageShell
      title={editorTitle}
      description={
        mode === 'create'
          ? 'Create a lead-capture popup for offer pages'
          : 'Edit popup content, targeting, and display rules'
      }
      icon={<Megaphone />}
      breadcrumb={[
        { name: 'Website', href: routes.offersPopups.index },
        { name: 'Popups', href: routes.offersPopups.index },
        { name: mode === 'create' ? 'Create' : 'Edit' },
      ]}
      status={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            popup.status === 'active'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {popup.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      }
      actions={
        <>
          <Link href={routes.offersPopups.index}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handlePreview}
            type="button"
          >
            <ExternalLink className="h-4 w-4" />
            Preview on site
          </Button>
          <Button
            className="bg-[#143087] hover:bg-[#0F2466]"
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
            type="button"
          >
            Save changes
          </Button>
        </>
      }
      contentClassName="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-5">
          <SectionCard title="General">
            <div>
              <FieldLabel>Popup name</FieldLabel>
              <Input
                value={popup.name}
                onChange={(e) => patch('name', e.target.value)}
                placeholder="e.g. Offers Popup – Physio First Session"
                error={err('name')}
              />
            </div>

            <div>
              <FieldLabel>Show on pages</FieldLabel>
              <div className="space-y-2">
                {popup.url_rules.map((rule, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <select
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      value={rule.match}
                      onChange={(e) => {
                        const next = [...popup.url_rules];
                        next[index] = {
                          ...rule,
                          match: e.target.value as OfferPopupUrlMatchType,
                        };
                        patch('url_rules', next);
                      }}
                    >
                      <option value="contains">URL contains</option>
                      <option value="equals">URL equals</option>
                    </select>
                    <Input
                      className="min-w-[180px] flex-1"
                      value={rule.value}
                      onChange={(e) => {
                        const next = [...popup.url_rules];
                        next[index] = { ...rule, value: e.target.value };
                        patch('url_rules', next);
                      }}
                      placeholder="/offers"
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      disabled={popup.url_rules.length <= 1}
                      onClick={() =>
                        patch(
                          'url_rules',
                          popup.url_rules.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#143087] hover:underline"
                  onClick={() =>
                    patch('url_rules', [
                      ...popup.url_rules,
                      { match: 'contains', value: '' },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add URL rule
                </button>
              </div>
              <FieldError message={err('url_rules')} />
            </div>

            <div>
              <FieldLabel>Devices</FieldLabel>
              <SegmentedControl
                value={popup.devices}
                options={DEVICE_OPTIONS}
                onChange={(v) => patch('devices', v)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <FieldLabel>Popup status</FieldLabel>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={popup.status === 'active'}
                    onChange={() =>
                      patch(
                        'status',
                        popup.status === 'active' ? 'inactive' : 'active'
                      )
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {popup.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="w-28">
                <FieldLabel>Priority</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={popup.priority}
                  onChange={(e) =>
                    patch('priority', Math.max(1, Number(e.target.value) || 1))
                  }
                  error={err('priority')}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trigger">
            <div>
              <FieldLabel>Trigger type</FieldLabel>
              <SegmentedControl
                value={popup.trigger_type}
                options={TRIGGER_OPTIONS}
                onChange={(v) => patch('trigger_type', v)}
              />
            </div>
            {triggerNeedsSeconds(popup.trigger_type) ? (
              <div className="max-w-xs">
                <FieldLabel>Show after (seconds)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={popup.show_after_seconds}
                  onChange={(e) =>
                    patch('show_after_seconds', Number(e.target.value) || 0)
                  }
                  error={err('show_after_seconds')}
                />
              </div>
            ) : null}
            {triggerNeedsScroll(popup.trigger_type) ? (
              <div>
                <FieldLabel hint={`${popup.show_after_scroll_percent}%`}>
                  Show after scrolling
                </FieldLabel>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={popup.show_after_scroll_percent}
                  onChange={(e) =>
                    patch(
                      'show_after_scroll_percent',
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-[#143087]"
                />
                <FieldError message={err('show_after_scroll_percent')} />
              </div>
            ) : null}
            {popup.trigger_type === 'exit_intent' ? (
              <p className="text-sm text-gray-500">
                Exit intent fires on desktop when the cursor moves toward the
                top of the browser. Ignored on mobile.
              </p>
            ) : null}
          </SectionCard>

          <SectionCard title="Offer">
            <BilingualInputs
              label="Offer title"
              value={popup.offer_title}
              onChange={(v) => patch('offer_title', v)}
              max={OFFER_POPUP_DEFAULTS.offer_title_max}
              error={err('offer_title')}
              arPlaceholder="على أول جلسة علاج طبيعي في المنزل"
              enPlaceholder="On your first home physiotherapy session"
            />
            <BilingualInputs
              label="Badge text"
              value={popup.badge_text}
              onChange={(v) => patch('badge_text', v)}
              max={OFFER_POPUP_DEFAULTS.badge_max}
              error={err('badge_text')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Discount type</FieldLabel>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  value={popup.discount_type}
                  onChange={(e) => {
                    const type = e.target.value as OfferPopupDiscountType;
                    setPopup((prev) => ({
                      ...prev,
                      discount_type: type,
                      discount_value:
                        type === 'free_session'
                          ? null
                          : prev.discount_value ?? 20,
                    }));
                  }}
                >
                  {DISCOUNT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {popup.discount_type !== 'free_session' ? (
                <div>
                  <FieldLabel>Discount value</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={popup.discount_type === 'percentage' ? 100 : undefined}
                    value={popup.discount_value ?? ''}
                    onChange={(e) =>
                      patch(
                        'discount_value',
                        e.target.value === ''
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    error={err('discount_value')}
                  />
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Start date</FieldLabel>
                <DatePicker
                  selected={parseDate(popup.start_date)}
                  onChange={(date) =>
                    patch('start_date', toDateInput(date as Date | null))
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select start date"
                  className="w-full"
                />
              </div>
              <div>
                <FieldLabel>End date</FieldLabel>
                <DatePicker
                  selected={parseDate(popup.end_date)}
                  onChange={(date) =>
                    patch('end_date', toDateInput(date as Date | null))
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select end date"
                  className="w-full"
                />
              </div>
            </div>
            <FieldError message={err('dates')} />

            <div>
              <CouponSelect
                value={popup.coupon_id}
                lang="en"
                allowNone={false}
                label="Promo code (coupon)"
                hint="Required. Select an existing coupon or create one prefilled from this offer."
                createInitValues={couponInitValues}
                currentCoupon={
                  popup.coupon_id
                    ? {
                        id: popup.coupon_id,
                        code: popup.coupon_code || popup.coupon_id.slice(0, 8),
                        name: popup.offer_title,
                        is_active: true,
                        starts_at: popup.start_date,
                        ends_at: popup.end_date,
                      }
                    : null
                }
                error={err('coupon_id')}
                onChange={(couponId, coupon) => {
                  setPopup((prev) => ({
                    ...prev,
                    coupon_id: couponId,
                    coupon_code: coupon?.code || prev.coupon_code || '',
                  }));
                }}
              />
              {popup.coupon_code ? (
                <p className="mt-1 text-xs text-gray-500">
                  Linked code:{' '}
                  <span className="font-semibold text-gray-800">
                    {popup.coupon_code}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={popup.show_countdown}
                  onChange={() =>
                    patch('show_countdown', !popup.show_countdown)
                  }
                />
                <span className="text-sm text-gray-700">
                  Show countdown timer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={popup.auto_hide_after_end}
                  onChange={() =>
                    patch('auto_hide_after_end', !popup.auto_hide_after_end)
                  }
                />
                <span className="text-sm text-gray-700">
                  Auto-hide popup after end date
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Form fields">
            <p className="text-sm text-gray-500">
              Control which fields appear on the website and whether each is
              required.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Field</th>
                    <th className="px-3 py-2.5 font-semibold">Validation</th>
                    <th className="px-3 py-2.5 font-semibold">Visible</th>
                    <th className="px-3 py-2.5 font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FORM_FIELD_KEYS.map((key) => {
                    const meta = OFFER_POPUP_FORM_FIELD_META[key];
                    const config = popup.form_fields[key];
                    return (
                      <tr key={key}>
                        <td className="px-3 py-2.5 font-medium text-gray-800">
                          {meta.label}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">
                          {meta.validation}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={config.visible}
                              onChange={() =>
                                patchFormField(key, {
                                  visible: !config.visible,
                                })
                              }
                            />
                            <span className="text-xs font-medium text-gray-600">
                              {config.visible ? 'Shown' : 'Hidden'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={config.required}
                              disabled={!config.visible}
                              onChange={() =>
                                patchFormField(key, {
                                  required: !config.required,
                                })
                              }
                            />
                            <span
                              className={`text-xs font-medium ${
                                !config.visible
                                  ? 'text-gray-300'
                                  : config.required
                                    ? 'text-emerald-700'
                                    : 'text-gray-500'
                              }`}
                            >
                              {config.required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <FieldError message={err('form_fields')} />

            <BilingualInputs
              label="Button text"
              value={popup.button_text}
              onChange={(v) => patch('button_text', v)}
              max={OFFER_POPUP_DEFAULTS.button_max}
              error={err('button_text')}
            />
            <BilingualInputs
              label="Success message"
              value={popup.success_message}
              onChange={(v) => patch('success_message', v)}
              multiline
              error={err('success_message')}
            />
          </SectionCard>

          <SectionCard title="Frequency">
            <div className="max-w-sm">
              <FieldLabel>Max times per visitor</FieldLabel>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                value={popup.max_times_per_visitor}
                onChange={(e) =>
                  patch(
                    'max_times_per_visitor',
                    e.target.value as OfferPopupFrequency
                  )
                }
              >
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="max-w-xs">
              <FieldLabel>After close, hide for (days)</FieldLabel>
              <Input
                type="number"
                min={0}
                max={30}
                value={popup.hide_after_close_days}
                onChange={(e) =>
                  patch(
                    'hide_after_close_days',
                    Number(e.target.value) || 0
                  )
                }
                error={err('hide_after_close_days')}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={popup.never_show_after_submit}
                onChange={() =>
                  patch(
                    'never_show_after_submit',
                    !popup.never_show_after_submit
                  )
                }
              />
              <span className="text-sm text-gray-700">
                Never show again after form submit
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Lead handling">
            <Checkbox
              label="Save to Leads in dashboard"
              checked={popup.save_to_leads}
              onChange={() => patch('save_to_leads', !popup.save_to_leads)}
            />
            <Checkbox
              label="Notify call center (WhatsApp / email)"
              checked={popup.notify_call_center}
              onChange={() =>
                patch('notify_call_center', !popup.notify_call_center)
              }
            />
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Fire tracking events on submit
              </p>
              <div className="space-y-2">
                <Checkbox
                  label="Meta – Lead"
                  checked={popup.tracking.meta_lead}
                  onChange={() =>
                    patch('tracking', {
                      ...popup.tracking,
                      meta_lead: !popup.tracking.meta_lead,
                    })
                  }
                />
                <Checkbox
                  label="Snapchat – SIGN_UP"
                  checked={popup.tracking.snapchat_sign_up}
                  onChange={() =>
                    patch('tracking', {
                      ...popup.tracking,
                      snapchat_sign_up: !popup.tracking.snapchat_sign_up,
                    })
                  }
                />
                <Checkbox
                  label="GA4 – generate_lead"
                  checked={popup.tracking.ga4_generate_lead}
                  onChange={() =>
                    patch('tracking', {
                      ...popup.tracking,
                      ga4_generate_lead: !popup.tracking.ga4_generate_lead,
                    })
                  }
                />
                <Checkbox
                  label="TikTok – SubmitForm"
                  checked={popup.tracking.tiktok_submit_form}
                  onChange={() =>
                    patch('tracking', {
                      ...popup.tracking,
                      tiktok_submit_form: !popup.tracking.tiktok_submit_form,
                    })
                  }
                />
              </div>
            </div>
          </SectionCard>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="flex justify-end">
          <SegmentedControl
            value={previewLang}
            options={[
              { value: 'ar', label: 'AR preview' },
              { value: 'en', label: 'EN preview' },
            ]}
            onChange={setPreviewLang}
          />
        </div>
        <OfferPopupPreview popup={popup} lang={previewLang} />
        <OfferPopupSummary popup={popup} />
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handlePreview}
            type="button"
          >
            <ExternalLink className="h-4 w-4" />
            Preview on site
          </Button>
          <Button
            className="w-full bg-[#143087] hover:bg-[#0F2466]"
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
            type="button"
          >
            Save changes
          </Button>
        </div>
      </aside>
    </AdminPageShell>
  );
}
