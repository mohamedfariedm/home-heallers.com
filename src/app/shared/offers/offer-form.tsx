'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Controller,
  SubmitHandler,
  type Control,
  type FieldErrors,
  type UseFormReturn,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import Select from 'react-select';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs';
import Spinner from '@/components/ui/spinner';
import {
  offerFormSchema,
  type OfferFormInput,
} from '@/utils/validators/offer-form.schema';
import { useCreateOffer, useUpdateOffer } from '@/framework/packages';
import { useCategories } from '@/framework/categories';
import { useCities } from '@/framework/cities';
import { useServices } from '@/framework/services';
import { useDoctors } from '@/framework/doctors';
import { routes } from '@/config/routes';
import cn from '@/utils/class-names';
import LocaleTabs from '@/app/shared/offers/locale-tabs';
import LocaleListEditor from '@/app/shared/offers/list-editor';
import RestrictedQuill from '@/app/shared/offers/restricted-quill';
import MediaSlot from '@/app/shared/offers/media-fields';
import FaqTab from '@/app/shared/offers/faq-tab';
import ReviewsTab from '@/app/shared/offers/reviews-tab';
import OfferStatusBadge from '@/app/shared/offers/offer-status-badge';
import {
  asLocaleList,
  asTranslationMap,
  compactLocaleList,
  computePricing,
  deriveOfferStatus,
  fromDatetimeLocalValue,
  localeCompleteness,
  pickDirtyPayload,
  seoLocaleWarning,
  toDatetimeLocalValue,
} from '@/app/shared/offers/utils';
import type { OfferLocale } from '@/types/offer';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import toast from 'react-hot-toast';

type OfferTabId =
  | 'basic'
  | 'pricing'
  | 'content'
  | 'media'
  | 'seo'
  | 'merchandising'
  | 'faqs'
  | 'reviews';

const TABS: { id: OfferTabId; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO' },
  { id: 'merchandising', label: 'Merchandising' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'reviews', label: 'Reviews' },
];

const TAB_ERROR_KEYS: Record<OfferTabId, string[]> = {
  basic: ['name', 'short_description', 'description', 'sessions_count', 'category_ids', 'city_ids', 'service_ids', 'doctors', 'tags'],
  pricing: ['price', 'old_price', 'discount_percentage', 'savings_amount', 'currency', 'stock_quantity'],
  content: ['highlights', 'package_includes', 'suitable_conditions', 'why_choose_home_healers', 'patient_journey', 'benefits', 'before_treatment', 'after_treatment', 'terms_conditions', 'cancellation_policy', 'visit_duration', 'location_type', 'validity_days'],
  media: ['image', 'cover_image', 'gallery_images', 'og_image'],
  seo: ['slug', 'meta_title', 'meta_description', 'canonical_url'],
  merchandising: ['is_active', 'starts_at', 'ends_at', 'sort_order', 'display_rating', 'display_reviews_count', 'booked_count'],
  faqs: [],
  reviews: [],
};

function toOptions(items: any[] | undefined, locale: OfferLocale) {
  return (items ?? []).map((item) => ({
    value: Number(item.id),
    label: resolveLocalizedName(item?.name, locale) || item?.name?.en || `#${item.id}`,
  }));
}

function idsFrom(value: any, nested?: any[]): number[] {
  if (Array.isArray(value) && value.every((v) => typeof v === 'number' || typeof v === 'string')) {
    return value.map(Number);
  }
  if (Array.isArray(value) && value.every((v) => v && typeof v === 'object')) {
    return value.map((v: any) => Number(v.id)).filter((id) => !Number.isNaN(id));
  }
  if (Array.isArray(nested)) {
    return nested.map((v: any) => Number(v.id)).filter((id) => !Number.isNaN(id));
  }
  return [];
}

function countTabErrors(tabId: OfferTabId, errors: FieldErrors<OfferFormInput>) {
  return TAB_ERROR_KEYS[tabId].reduce((count, key) => {
    const err = (errors as any)[key];
    if (!err) return count;
    if (err.en || err.ar) {
      return count + Number(Boolean(err.en)) + Number(Boolean(err.ar));
    }
    return count + 1;
  }, 0);
}

function firstTabWithError(errors: FieldErrors<OfferFormInput>): number {
  const index = TABS.findIndex((tab) => countTabErrors(tab.id, errors) > 0);
  return index >= 0 ? index : 0;
}

export function buildOfferDefaults(initValues?: any): OfferFormInput {
  return {
    name: asTranslationMap(initValues?.name) as { en: string; ar: string },
    short_description: asTranslationMap(initValues?.short_description) as { en: string; ar: string },
    description: asTranslationMap(initValues?.description) as { en: string; ar: string },
    type: 'offer',
    sessions_count: initValues?.sessions_count || 1,
    category_ids: idsFrom(initValues?.category_ids, initValues?.categories),
    city_ids: idsFrom(initValues?.city_ids, initValues?.cities),
    service_ids: idsFrom(initValues?.service_ids, initValues?.services),
    doctors: idsFrom(initValues?.doctors),
    tags: asLocaleList(initValues?.tags),
    price: Number(initValues?.price ?? 0),
    old_price: initValues?.old_price != null ? Number(initValues.old_price) : null,
    discount_percentage:
      initValues?.discount_percentage != null ? Number(initValues.discount_percentage) : null,
    savings_amount:
      initValues?.savings_amount != null ? Number(initValues.savings_amount) : null,
    currency: initValues?.currency || 'SAR',
    stock_quantity: initValues?.stock_quantity ?? null,
    highlights: asLocaleList(initValues?.highlights),
    package_includes: asLocaleList(initValues?.package_includes),
    suitable_conditions: asLocaleList(initValues?.suitable_conditions),
    why_choose_home_healers: asTranslationMap(initValues?.why_choose_home_healers) as { en: string; ar: string },
    patient_journey: asLocaleList(initValues?.patient_journey),
    benefits: asTranslationMap(initValues?.benefits) as { en: string; ar: string },
    before_treatment: asTranslationMap(initValues?.before_treatment) as { en: string; ar: string },
    after_treatment: asTranslationMap(initValues?.after_treatment) as { en: string; ar: string },
    terms_conditions: asTranslationMap(initValues?.terms_conditions) as { en: string; ar: string },
    cancellation_policy: asTranslationMap(initValues?.cancellation_policy) as { en: string; ar: string },
    visit_duration: asTranslationMap(initValues?.visit_duration) as { en: string; ar: string },
    location_type: asTranslationMap(initValues?.location_type) as { en: string; ar: string },
    validity_days: initValues?.validity_days ?? null,
    image: initValues?.image ?? null,
    cover_image: initValues?.cover_image ?? null,
    gallery_images: initValues?.gallery_images ?? [],
    og_image: initValues?.og_image ?? null,
    slug: initValues?.slug || '',
    meta_title: asTranslationMap(initValues?.meta_title) as { en: string; ar: string },
    meta_description: asTranslationMap(initValues?.meta_description) as { en: string; ar: string },
    canonical_url: initValues?.canonical_url || '',
    is_active: Boolean(initValues?.is_active),
    starts_at: toDatetimeLocalValue(initValues?.starts_at),
    ends_at: toDatetimeLocalValue(initValues?.ends_at),
    sort_order: initValues?.sort_order ?? 0,
    is_featured: Boolean(initValues?.is_featured),
    is_best_seller: Boolean(initValues?.is_best_seller),
    is_most_popular: Boolean(initValues?.is_most_popular),
    is_new: Boolean(initValues?.is_new),
    display_rating: initValues?.display_rating != null ? Number(initValues.display_rating) : null,
    display_reviews_count: initValues?.display_reviews_count ?? 0,
    booked_count: initValues?.booked_count ?? 0,
  };
}

function MultiSelect({
  label,
  options,
  value,
  onChange,
  isLoading,
  disabled,
  error,
}: {
  label: string;
  options: { value: number; label: string }[];
  value: number[];
  onChange: (ids: number[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <Select
        isMulti
        isDisabled={disabled}
        isLoading={isLoading}
        options={options}
        value={options.filter((opt) => value.includes(opt.value))}
        onChange={(opts) => onChange((opts || []).map((opt) => Number(opt.value)))}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 40 }) }}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

type FieldProps = {
  control: Control<OfferFormInput>;
  watch: UseFormWatch<OfferFormInput>;
  setValue: UseFormSetValue<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
  locale: OfferLocale;
  readOnly: boolean;
  categoryOptions: { value: number; label: string }[];
  cityOptions: { value: number; label: string }[];
  serviceOptions: { value: number; label: string }[];
  doctorOptions: { value: number; label: string }[];
  lookupsLoading: boolean;
  pricingManual: boolean;
  setPricingManual: (value: boolean) => void;
};

function BasicTab({ control, errors, locale, readOnly, categoryOptions, cityOptions, serviceOptions, doctorOptions, lookupsLoading }: FieldProps) {
  return (
    <div className="grid gap-5">
      <Controller
        name={`name.${locale}`}
        control={control}
        render={({ field }) => (
          <Input label={`Name (${locale.toUpperCase()})`} {...field} error={(errors.name as any)?.[locale]?.message || errors.name?.message} disabled={readOnly} />
        )}
      />
      <Controller
        name={`short_description.${locale}`}
        control={control}
        render={({ field }) => (
          <Textarea
            label={`Short description (${locale.toUpperCase()})`}
            {...field}
            error={(errors.short_description as any)?.[locale]?.message || errors.short_description?.message}
            disabled={readOnly}
          />
        )}
      />
      <p className="text-xs text-gray-500">Plain text only. Required for the public offer card.</p>
      <Controller
        name={`description.${locale}`}
        control={control}
        render={({ field }) => (
          <RestrictedQuill
            label={`Description (${locale.toUpperCase()})`}
            value={field.value}
            onChange={field.onChange}
            error={(errors.description as any)?.[locale]?.message}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            disabled={readOnly}
          />
        )}
      />
      <Controller
        name="sessions_count"
        control={control}
        render={({ field }) => (
          <Input label="Sessions count" type="number" {...field} error={errors.sessions_count?.message} disabled={readOnly} />
        )}
      />
      <Controller name="category_ids" control={control} render={({ field }) => (
        <MultiSelect label="Categories" options={categoryOptions} value={field.value || []} onChange={field.onChange} isLoading={lookupsLoading} disabled={readOnly} />
      )} />
      <Controller name="city_ids" control={control} render={({ field }) => (
        <MultiSelect label="Cities" options={cityOptions} value={field.value || []} onChange={field.onChange} isLoading={lookupsLoading} disabled={readOnly} />
      )} />
      <Controller name="service_ids" control={control} render={({ field }) => (
        <MultiSelect label="Services" options={serviceOptions} value={field.value || []} onChange={field.onChange} isLoading={lookupsLoading} disabled={readOnly} />
      )} />
      <Controller name="doctors" control={control} render={({ field }) => (
        <MultiSelect label="Doctors" options={doctorOptions} value={field.value || []} onChange={field.onChange} isLoading={lookupsLoading} disabled={readOnly} />
      )} />
      <Controller name="tags" control={control} render={({ field }) => (
        <LocaleListEditor label="Tags" value={field.value} locale={locale} onChange={field.onChange} chips disabled={readOnly} />
      )} />
      <Text className="text-xs text-gray-500">Prices, flags, dates and ids are shared across EN/AR. Locale tabs only switch translatable content.</Text>
    </div>
  );
}

function PricingTab({ control, watch, setValue, errors, readOnly, pricingManual, setPricingManual }: FieldProps) {
  const price = Number(watch('price') || 0);
  const oldPrice = watch('old_price');

  useEffect(() => {
    if (pricingManual) return;
    if (oldPrice == null || oldPrice === ('' as any)) {
      setValue('savings_amount', null, { shouldDirty: false });
      setValue('discount_percentage', null, { shouldDirty: false });
      return;
    }
    const next = computePricing(Number(oldPrice), price);
    setValue('savings_amount', next.savings_amount, { shouldDirty: false });
    setValue('discount_percentage', next.discount_percentage, { shouldDirty: false });
  }, [price, oldPrice, pricingManual, setValue]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Controller name="price" control={control} render={({ field }) => (
        <Input label="Price" type="number" step="0.01" {...field} error={errors.price?.message} disabled={readOnly} />
      )} />
      <Controller name="old_price" control={control} render={({ field }) => (
        <Input
          label="Old price"
          type="number"
          step="0.01"
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          error={errors.old_price?.message}
          disabled={readOnly}
        />
      )} />
      <Controller name="savings_amount" control={control} render={({ field }) => (
        <Input
          label="Savings amount"
          type="number"
          step="0.01"
          value={field.value ?? ''}
          onChange={(e) => {
            setPricingManual(true);
            field.onChange(e.target.value === '' ? null : Number(e.target.value));
          }}
          error={errors.savings_amount?.message}
          disabled={readOnly}
        />
      )} />
      <Controller name="discount_percentage" control={control} render={({ field }) => (
        <Input
          label="Discount %"
          type="number"
          step="0.01"
          value={field.value ?? ''}
          onChange={(e) => {
            setPricingManual(true);
            field.onChange(e.target.value === '' ? null : Number(e.target.value));
          }}
          error={errors.discount_percentage?.message}
          disabled={readOnly}
        />
      )} />
      <Controller name="currency" control={control} render={({ field }) => (
        <Input label="Currency" maxLength={3} {...field} error={errors.currency?.message} disabled={readOnly} />
      )} />
      <Controller name="stock_quantity" control={control} render={({ field }) => (
        <Input
          label="Stock quantity"
          type="number"
          placeholder="Unlimited"
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          error={errors.stock_quantity?.message}
          disabled={readOnly}
        />
      )} />
      <div className="sm:col-span-2">
        <Button type="button" size="sm" variant="outline" disabled={readOnly} onClick={() => {
          setPricingManual(false);
          const next = computePricing(Number(watch('old_price')), Number(watch('price')));
          setValue('savings_amount', next.savings_amount);
          setValue('discount_percentage', next.discount_percentage);
        }}>
          Recalculate discount
        </Button>
        <p className="mt-2 text-xs text-gray-500">
          The server fills these at save time unless you send an explicit value. Clearing old price clears both derived fields. Never send the legacy <code>discount</code> field.
        </p>
      </div>
    </div>
  );
}

function ContentTab({ control, locale, readOnly }: FieldProps) {
  return (
    <div className="grid gap-6">
      <Controller name="highlights" control={control} render={({ field }) => (
        <LocaleListEditor label="Highlights" value={field.value} locale={locale} onChange={field.onChange} disabled={readOnly} />
      )} />
      <Controller name="package_includes" control={control} render={({ field }) => (
        <LocaleListEditor label="Package includes" value={field.value} locale={locale} onChange={field.onChange} disabled={readOnly} />
      )} />
      <Controller name="suitable_conditions" control={control} render={({ field }) => (
        <LocaleListEditor label="Suitable conditions" value={field.value} locale={locale} onChange={field.onChange} disabled={readOnly} />
      )} />
      <Controller name="patient_journey" control={control} render={({ field }) => (
        <LocaleListEditor label="Patient journey" hint="Ordered timeline — numbering is shown on the public page." value={field.value} locale={locale} onChange={field.onChange} numbered disabled={readOnly} />
      )} />
      {(['why_choose_home_healers', 'benefits', 'before_treatment', 'after_treatment', 'terms_conditions', 'cancellation_policy'] as const).map((name) => (
        <Controller
          key={name}
          name={`${name}.${locale}`}
          control={control}
          render={({ field }) => (
            <RestrictedQuill
              label={`${name.replace(/_/g, ' ')} (${locale.toUpperCase()})`}
              value={field.value}
              onChange={field.onChange}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              disabled={readOnly}
            />
          )}
        />
      ))}
      <Controller name={`visit_duration.${locale}`} control={control} render={({ field }) => (
        <Input label={`Visit duration (${locale.toUpperCase()})`} {...field} disabled={readOnly} />
      )} />
      <Controller name={`location_type.${locale}`} control={control} render={({ field }) => (
        <Input label={`Location type (${locale.toUpperCase()})`} {...field} disabled={readOnly} />
      )} />
      <Controller name="validity_days" control={control} render={({ field }) => (
        <Input
          label="Validity days"
          type="number"
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          disabled={readOnly}
        />
      )} />
    </div>
  );
}

function MediaTab({ control, readOnly }: FieldProps) {
  return (
    <div className="grid gap-8">
      <Controller name="image" control={control} render={({ field }) => (
        <MediaSlot label="Card thumbnail" hint="≈ 4:3" aspect="4:3" value={field.value} onChange={field.onChange} disabled={readOnly} />
      )} />
      <Controller name="cover_image" control={control} render={({ field }) => (
        <MediaSlot label="Cover image" hint="Hero / banner" aspect="16:9" value={field.value} onChange={field.onChange} disabled={readOnly} />
      )} />
      <Controller name="gallery_images" control={control} render={({ field }) => (
        <MediaSlot label="Gallery" multiple value={field.value} onChange={field.onChange} disabled={readOnly} />
      )} />
      <Controller
        name="og_image"
        control={control}
        render={({ field, formState }) => (
          <MediaSlot
            label="OG image"
            hint="Social share card · 1200×630"
            aspect="1.91:1"
            value={field.value}
            onChange={field.onChange}
            fallbackLabel={!field.value ? 'Will use the cover image' : undefined}
            disabled={readOnly}
          />
        )}
      />
    </div>
  );
}

function SeoTab({ control, errors, locale, readOnly }: FieldProps) {
  return (
    <div className="grid gap-5">
      <Controller name="slug" control={control} render={({ field }) => (
        <Input label="Slug" {...field} error={errors.slug?.message} disabled={readOnly} />
      )} />
      <Controller name={`meta_title.${locale}`} control={control} render={({ field }) => (
        <Input label={`Meta title (${locale.toUpperCase()})`} {...field} error={(errors.meta_title as any)?.[locale]?.message} disabled={readOnly} />
      )} />
      <Controller name={`meta_description.${locale}`} control={control} render={({ field }) => (
        <Textarea label={`Meta description (${locale.toUpperCase()})`} {...field} error={(errors.meta_description as any)?.[locale]?.message} disabled={readOnly} />
      )} />
      <Controller name="canonical_url" control={control} render={({ field }) => (
        <Input label="Canonical URL" {...field} error={errors.canonical_url?.message} disabled={readOnly} />
      )} />
    </div>
  );
}

function MerchandisingTab({ control, errors, readOnly }: FieldProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Controller name="is_active" control={control} render={({ field }) => (
        <div className="flex items-center gap-2">
          <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={readOnly} />
          <label className="text-sm">Active</label>
        </div>
      )} />
      <Controller name="sort_order" control={control} render={({ field }) => (
        <Input label="Sort order" type="number" {...field} error={errors.sort_order?.message} disabled={readOnly} />
      )} />
      <Controller name="starts_at" control={control} render={({ field }) => (
        <Input label="Starts at" type="datetime-local" {...field} value={field.value || ''} error={errors.starts_at?.message} disabled={readOnly} />
      )} />
      <Controller name="ends_at" control={control} render={({ field }) => (
        <Input label="Ends at" type="datetime-local" {...field} value={field.value || ''} error={errors.ends_at?.message} disabled={readOnly} />
      )} />
      {(['is_featured', 'is_best_seller', 'is_most_popular', 'is_new'] as const).map((name) => (
        <Controller key={name} name={name} control={control} render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={readOnly} />
            <label className="text-sm capitalize">{name.replace('is_', '').replace('_', ' ')}</label>
          </div>
        )} />
      ))}
      <Controller name="display_rating" control={control} render={({ field }) => (
        <div>
          <Input
            label="Display rating"
            type="number"
            step="0.1"
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            error={errors.display_rating?.message}
            disabled={readOnly}
          />
          <p className="mt-1 text-xs text-gray-500">Displayed on the offer page. Not calculated from customer reviews.</p>
        </div>
      )} />
      <Controller name="display_reviews_count" control={control} render={({ field }) => (
        <div>
          <Input
            label="Display reviews count"
            type="number"
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            error={errors.display_reviews_count?.message}
            disabled={readOnly}
          />
          <p className="mt-1 text-xs text-gray-500">Displayed on the offer page. Not calculated from customer reviews.</p>
        </div>
      )} />
      <Controller name="booked_count" control={control} render={({ field }) => (
        <div className="sm:col-span-2">
          <Input
            label="Booked count"
            type="number"
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            error={errors.booked_count?.message}
            disabled={readOnly}
          />
          <p className="mt-1 text-xs text-gray-500">Seed value. Increases automatically with each paid booking. Not an accounting figure.</p>
        </div>
      )} />
    </div>
  );
}

function DirtySync({
  dirty,
  onDirty,
}: {
  dirty: boolean;
  onDirty: (value: boolean) => void;
}) {
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  return null;
}

export default function OfferForm({
  initValues,
  readOnly = false,
  canFaqs = true,
  canReviews = true,
  canGate1 = true,
  canGate2 = false,
}: {
  initValues?: any;
  readOnly?: boolean;
  canFaqs?: boolean;
  canReviews?: boolean;
  canGate1?: boolean;
  canGate2?: boolean;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<OfferLocale>('en');
  const [activeTab, setActiveTab] = useState(0);
  const [pricingManual, setPricingManual] = useState(false);
  const [serverErrorSummary, setServerErrorSummary] = useState<{ key: string; message: string }[]>([]);
  const methodsRef = useRef<UseFormReturn<OfferFormInput> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const isEdit = Boolean(initValues?.id);
  const { mutateAsync: createOffer, isPending: creating } = useCreateOffer();
  const { mutateAsync: updateOffer, isPending: updating } = useUpdateOffer();
  const { data: categories, isLoading: categoriesLoading } = useCategories('limit=200');
  const { data: cities, isLoading: citiesLoading } = useCities('limit=200');
  const { data: services, isLoading: servicesLoading } = useServices('limit=200');
  const { data: doctors, isLoading: doctorsLoading } = useDoctors('limit=200');

  const categoryOptions = useMemo(() => toOptions(categories?.data, locale), [categories?.data, locale]);
  const cityOptions = useMemo(() => toOptions(cities?.data, locale), [cities?.data, locale]);
  const serviceOptions = useMemo(() => toOptions(services?.data, locale), [services?.data, locale]);
  const doctorOptions = useMemo(() => toOptions(doctors?.data, locale), [doctors?.data, locale]);

  const onSubmit: SubmitHandler<OfferFormInput> = async (data) => {
    const methods = methodsRef.current;
    const warning = seoLocaleWarning(data);
    if (warning) toast(warning, { icon: '⚠️' });

    const payload: Record<string, any> = {
      ...data,
      type: 'offer',
      starts_at: fromDatetimeLocalValue(data.starts_at),
      ends_at: fromDatetimeLocalValue(data.ends_at),
      highlights: compactLocaleList(data.highlights),
      package_includes: compactLocaleList(data.package_includes),
      suitable_conditions: compactLocaleList(data.suitable_conditions),
      patient_journey: compactLocaleList(data.patient_journey),
      tags: compactLocaleList(data.tags),
    };
    delete payload.discount;

    try {
      setServerErrorSummary([]);
      if (isEdit) {
        const dirty = methods?.formState?.dirtyFields
          ? pickDirtyPayload(payload, methods.formState.dirtyFields)
          : payload;
        const body: Record<string, any> = { ...dirty, type: 'offer' };
        if (dirty.starts_at !== undefined) {
          body.starts_at = fromDatetimeLocalValue(data.starts_at);
        }
        if (dirty.ends_at !== undefined) {
          body.ends_at = fromDatetimeLocalValue(data.ends_at);
        }
        await updateOffer({ id: initValues.id, ...body });
        methods?.reset(data);
      } else {
        const created = await createOffer(payload);
        const id = created?.id;
        if (id) router.push(routes.offers.edit(id));
        else router.push(routes.offers.index);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 422) {
        const serverErrors = error?.response?.data?.errors || {};
        const summary: { key: string; message: string }[] = [];
        Object.entries(serverErrors).forEach(([key, messages]) => {
          const message = Array.isArray(messages) ? String(messages[0]) : String(messages);
          methods?.setError(key as any, { type: 'server', message });
          summary.push({ key, message });
        });
        setServerErrorSummary(summary);
        const fakeErrors = summary.reduce((acc, item) => {
          const root = item.key.split('.')[0] as keyof OfferFormInput;
          (acc as any)[root] = { message: item.message };
          return acc;
        }, {} as FieldErrors<OfferFormInput>);
        setActiveTab(firstTabWithError(fakeErrors));
        const localeMatch = summary.find((item) => item.key.endsWith('.ar') || item.key.endsWith('.en'));
        if (localeMatch?.key.endsWith('.ar')) setLocale('ar');
        if (localeMatch?.key.endsWith('.en')) setLocale('en');
        return;
      }
      if (status === 403) {
        toast.error("You don't have permission to save this offer");
        return;
      }
    }
  };

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return (
    <Form<OfferFormInput>
      onSubmit={onSubmit}
      validationSchema={offerFormSchema as any}
      useFormProps={{
        defaultValues: buildOfferDefaults(initValues),
        mode: 'onBlur',
      }}
      className="space-y-4"
    >
        {(methods) => {
        methodsRef.current = methods;
        const { control, watch, setValue, formState } = methods;
        const { errors, isDirty: formIsDirty } = formState;
        const fieldProps: FieldProps = {
          control,
          watch,
          setValue,
          errors,
          locale,
          readOnly,
          categoryOptions,
          cityOptions,
          serviceOptions,
          doctorOptions,
          lookupsLoading: categoriesLoading || citiesLoading || servicesLoading || doctorsLoading,
          pricingManual,
          setPricingManual,
        };
        const completeness = {
          en: localeCompleteness(watch(), 'en'),
          ar: localeCompleteness(watch(), 'ar'),
        };
        const status = deriveOfferStatus({
          is_active: watch('is_active'),
          starts_at: watch('starts_at'),
          ends_at: watch('ends_at'),
        });

        const visibleTabs = TABS.filter((tab) => {
          if (tab.id === 'faqs' && !canFaqs) return false;
          if (tab.id === 'reviews' && !canReviews) return false;
          return true;
        });

        return (
          <div className="min-[1440px]:grid min-[1440px]:grid-cols-[1fr_280px] min-[1440px]:gap-6">
            <DirtySync dirty={formIsDirty} onDirty={setIsDirty} />
            <div className="rounded-xl border border-gray-200 bg-white">
              {readOnly && (
                <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">
                  You don&apos;t have permission to edit this offer. The form is read-only.
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
                <div>
                  <Title as="h4">{isEdit ? 'Edit offer' : 'New offer'}</Title>
                  <Text className="text-xs text-gray-500">Offers are packages with type = offer.</Text>
                </div>
                <LocaleTabs locale={locale} onChange={setLocale} completeness={completeness} />
              </div>

              {serverErrorSummary.length > 0 && (
                <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
                  <p className="font-medium">Please fix the following:</p>
                  <ul className="mt-1 list-disc ps-5">
                    {serverErrorSummary.map((item) => (
                      <li key={item.key}>
                        <button
                          type="button"
                          className="underline"
                          onClick={() => setActiveTab(firstTabWithError({ [item.key.split('.')[0]]: { message: item.message } } as any))}
                        >
                          {item.key}: {item.message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
                <div className="overflow-x-auto border-b px-4">
                  <TabList className="inline-flex gap-1 border-0 p-0">
                    {visibleTabs.map((tab) => {
                      const count = countTabErrors(tab.id, errors);
                      const faqDisabled = tab.id === 'faqs' && !isEdit;
                      return (
                        <Tab
                          key={tab.id}
                          disabled={faqDisabled}
                          className={({ selected }) =>
                            cn(
                              'relative px-4 py-3 text-sm font-medium outline-none',
                              selected ? 'border-b-2 border-primary text-primary' : 'text-gray-600',
                              faqDisabled && 'cursor-not-allowed opacity-50'
                            )
                          }
                        >
                          {tab.label}
                          {count > 0 && (
                            <Badge className="ms-2" color="danger">
                              {count}
                            </Badge>
                          )}
                        </Tab>
                      );
                    })}
                  </TabList>
                </div>
                <TabPanels className="p-6">
                  <TabPanel><BasicTab {...fieldProps} /></TabPanel>
                  <TabPanel><PricingTab {...fieldProps} /></TabPanel>
                  <TabPanel><ContentTab {...fieldProps} /></TabPanel>
                  <TabPanel><MediaTab {...fieldProps} /></TabPanel>
                  <TabPanel><SeoTab {...fieldProps} /></TabPanel>
                  <TabPanel><MerchandisingTab {...fieldProps} /></TabPanel>
                  {canFaqs && (
                    <TabPanel>
                      <FaqTab packageId={initValues?.id} disabled={!isEdit} />
                    </TabPanel>
                  )}
                  {canReviews && (
                    <TabPanel>
                      <ReviewsTab packageId={initValues?.id} canGate1={canGate1} canGate2={canGate2} />
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
                    router.push(routes.offers.index);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={creating || updating}
                  disabled={readOnly}
                >
                  {isEdit ? 'Save changes' : 'Create offer'}
                </Button>
              </div>
            </div>

            <aside className="hidden h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-5 min-[1440px]:sticky min-[1440px]:top-24 min-[1440px]:block">
              <Text className="text-sm font-semibold">Summary</Text>
              <OfferStatusBadge status={initValues?.offer_status || status} />
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-lg font-semibold">
                  {watch('price') || 0} {watch('currency') || 'SAR'}
                </p>
                {watch('old_price') != null && (
                  <p className="text-xs text-gray-400 line-through">{watch('old_price')}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                isLoading={creating || updating}
                disabled={readOnly}
              >
                Save
              </Button>
            </aside>
          </div>
        );
      }}
    </Form>
  );
}
