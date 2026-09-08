'use client';

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SeoLocaleTabs from '@/app/shared/seo/seo-locale-tabs';
import {
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  type EntitySeoModule,
  type SeoLocale,
} from '@/types/seo-locale';
import { generateLocaleSlug } from '@/utils/seo-fields';
import { encodeSlugPath } from '@/utils/slugs';

type SeoFormValues = {
  slug?: { en?: string | null; ar?: string | null };
  meta_title?: { en?: string | null; ar?: string | null };
  meta_description?: { en?: string | null; ar?: string | null };
  og_title?: { en?: string | null; ar?: string | null };
  og_description?: { en?: string | null; ar?: string | null };
  name?: { en?: string | null; ar?: string | null };
};

function CharCount({
  value,
  max,
  hint,
}: {
  value: string;
  max: number;
  hint?: string;
}) {
  return (
    <div className="mt-1 flex items-start justify-between gap-3 text-xs text-gray-500">
      <span>{hint}</span>
      <span className={value.length > max ? 'text-red-500' : ''}>
        {value.length}/{max}
      </span>
    </div>
  );
}

function publicUrlPreview(
  module: EntitySeoModule,
  locale: SeoLocale,
  slug: string,
  categorySlug?: { en?: string | null; ar?: string | null } | null
): string | null {
  if (!slug) return null;
  const encoded = encodeSlugPath(slug);
  if (module === 'category') {
    return locale === 'ar' ? `/categories/${encoded}` : `/en/categories/${encoded}`;
  }
  if (module === 'blog') {
    return locale === 'ar' ? `/blog/${encoded}` : `/en/blog/${encoded}`;
  }
  const parent = locale === 'ar' ? categorySlug?.ar : categorySlug?.en;
  if (!parent) return null;
  const parentEncoded = encodeSlugPath(parent);
  return locale === 'ar'
    ? `/categories/${parentEncoded}/${encoded}`
    : `/en/categories/${parentEncoded}/${encoded}`;
}

export default function EntitySeoSection<T extends SeoFormValues>({
  locale,
  onLocaleChange,
  register,
  watch,
  setValue,
  errors,
  module,
  categorySlug,
  names,
  hideTabs = false,
}: {
  locale: SeoLocale;
  onLocaleChange: (locale: SeoLocale) => void;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  module: EntitySeoModule;
  categorySlug?: { en?: string | null; ar?: string | null } | null;
  names?: { en?: string | null; ar?: string | null };
  hideTabs?: boolean;
}) {
  const slugValue = String(watch(`slug.${locale}` as any) ?? '');
  const slugEn = String(watch('slug.en' as any) ?? '').trim();
  const slugAr = String(watch('slug.ar' as any) ?? '').trim();
  const metaTitle = String(watch(`meta_title.${locale}` as any) ?? '');
  const metaDescription = String(watch(`meta_description.${locale}` as any) ?? '');
  const ogTitle = String(watch(`og_title.${locale}` as any) ?? '');
  const ogDescription = String(watch(`og_description.${locale}` as any) ?? '');
  const previewEn = publicUrlPreview(module, 'en', slugEn, categorySlug);
  const previewAr = publicUrlPreview(module, 'ar', slugAr, categorySlug);
  const hideServicePreview = module === 'service' && !categorySlug?.en && !categorySlug?.ar;

  const slugError = (errors as any)?.slug?.[locale]?.message as string | undefined;
  const metaTitleError = (errors as any)?.meta_title?.[locale]?.message as string | undefined;
  const metaDescriptionError = (errors as any)?.meta_description?.[locale]?.message as string | undefined;
  const ogTitleError = (errors as any)?.og_title?.[locale]?.message as string | undefined;
  const ogDescriptionError = (errors as any)?.og_description?.[locale]?.message as string | undefined;

  const handleGenerateSlug = () => {
    if (slugValue.trim()) return;
    const source = names?.[locale] || '';
    const generated = generateLocaleSlug(source, locale);
    if (!generated) return;
    setValue(`slug.${locale}` as any, generated, { shouldDirty: true });
  };

  const handleCopyFromOther = () => {
    const other: SeoLocale = locale === 'en' ? 'ar' : 'en';
    (['slug', 'meta_title', 'meta_description', 'og_title', 'og_description'] as const).forEach(
      (field) => {
        const value = watch(`${field}.${other}` as any);
        setValue(`${field}.${locale}` as any, value ?? '', { shouldDirty: true });
      }
    );
  };

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h5 className="font-semibold text-gray-900">SEO</h5>
        <div className="flex flex-wrap items-center gap-2">
          {!hideTabs && <SeoLocaleTabs locale={locale} onChange={onLocaleChange} />}
          <Button type="button" variant="outline" size="sm" onClick={handleCopyFromOther}>
            Copy from {locale === 'en' ? 'AR' : 'EN'}
          </Button>
        </div>
      </div>

      <Input
        key={`slug.${locale}`}
        label="Slug"
        placeholder="URL path only. No domain, no leading /."
        maxLength={SEO_TITLE_MAX}
        helperText="Leave empty to generate from the name. Changing the name later will not change this slug."
        {...register(`slug.${locale}` as any)}
        error={slugError}
      />
      <div className="-mt-2 flex items-center justify-between gap-3">
        <CharCount value={slugValue} max={SEO_TITLE_MAX} />
        {!slugValue.trim() && (
          <Button type="button" variant="text" size="sm" className="shrink-0" onClick={handleGenerateSlug}>
            Generate from name
          </Button>
        )}
      </div>

      {!hideServicePreview && (previewEn || previewAr) && (
        <div className="space-y-1 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
          {previewEn && (
            <p>
              EN: <span className="font-medium text-gray-800">{previewEn}</span>
            </p>
          )}
          {previewAr && (
            <p>
              AR: <span className="font-medium text-gray-800">{previewAr}</span>
            </p>
          )}
        </div>
      )}

      <Input
        key={`meta_title.${locale}`}
        label="Meta title"
        placeholder="Shown in the browser tab and Google title. Aim for about 60 characters."
        maxLength={SEO_TITLE_MAX}
        {...register(`meta_title.${locale}` as any)}
        error={metaTitleError}
      />
      <CharCount value={metaTitle} max={SEO_TITLE_MAX} hint="Aim for about 60 characters." />

      <Textarea
        key={`meta_description.${locale}`}
        label="Meta description"
        placeholder="Shown under the Google title. Aim for about 160 characters."
        maxLength={SEO_DESCRIPTION_MAX}
        {...register(`meta_description.${locale}` as any)}
        error={metaDescriptionError}
      />
      <CharCount
        value={metaDescription}
        max={SEO_DESCRIPTION_MAX}
        hint="Aim for about 160 characters. Server limit is 500."
      />

      <Input
        key={`og_title.${locale}`}
        label="OG title"
        placeholder="Title when the page is shared."
        maxLength={SEO_TITLE_MAX}
        {...register(`og_title.${locale}` as any)}
        error={ogTitleError}
      />
      <CharCount value={ogTitle} max={SEO_TITLE_MAX} />

      <Textarea
        key={`og_description.${locale}`}
        label="OG description"
        placeholder="Text when the page is shared."
        maxLength={SEO_DESCRIPTION_MAX}
        {...register(`og_description.${locale}` as any)}
        error={ogDescriptionError}
      />
      <CharCount value={ogDescription} max={SEO_DESCRIPTION_MAX} hint="Server limit is 500." />
    </section>
  );
}
