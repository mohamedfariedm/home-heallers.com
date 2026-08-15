import { z } from 'zod';

const translationMap = z.object({
  en: z.string().optional().default(''),
  ar: z.string().optional().default(''),
});

const localeListMap = z.object({
  en: z.array(z.string()).optional().default([]),
  ar: z.array(z.string()).optional().default([]),
});

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
}, z.number().min(0).nullable().optional());

const optionalInt = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
}, z.number().int().min(0).nullable().optional());

export const offerFormSchema = z
  .object({
    name: z.object({
      en: z.string().max(255, 'English name must be 255 characters or less'),
      ar: z.string().max(255, 'Arabic name must be 255 characters or less'),
    }),
    short_description: z.object({
      en: z.string().max(200, 'English short description must be 200 characters or less'),
      ar: z.string().max(200, 'Arabic short description must be 200 characters or less'),
    }),
    description: translationMap,
    type: z.literal('offer'),
    sessions_count: z.coerce.number().int().min(1, 'Sessions count must be at least 1'),
    category_ids: z.array(z.number()).optional().default([]),
    city_ids: z.array(z.number()).optional().default([]),
    service_ids: z.array(z.number()).optional().default([]),
    doctors: z.array(z.number()).optional().default([]),
    tags: localeListMap,
    price: z.coerce.number().min(0, 'Price must be 0 or more'),
    old_price: optionalNumber,
    discount_percentage: optionalNumber,
    savings_amount: optionalNumber,
    currency: z.string().length(3, 'Currency must be 3 characters').optional().or(z.literal('')),
    stock_quantity: optionalInt,
    highlights: localeListMap,
    package_includes: localeListMap,
    suitable_conditions: localeListMap,
    why_choose_home_healers: translationMap,
    patient_journey: localeListMap,
    benefits: translationMap,
    before_treatment: translationMap,
    after_treatment: translationMap,
    terms_conditions: translationMap,
    cancellation_policy: translationMap,
    visit_duration: z.object({
      en: z.string().max(255).optional().default(''),
      ar: z.string().max(255).optional().default(''),
    }),
    location_type: z.object({
      en: z.string().max(255).optional().default(''),
      ar: z.string().max(255).optional().default(''),
    }),
    validity_days: optionalInt,
    image: z.any().nullable().optional(),
    cover_image: z.any().nullable().optional(),
    gallery_images: z.any().nullable().optional(),
    og_image: z.any().nullable().optional(),
    slug: z.string().max(160).optional().or(z.literal('')),
    meta_title: z.object({
      en: z.string().max(60, 'English meta title must be 60 characters or less'),
      ar: z.string().max(60, 'Arabic meta title must be 60 characters or less'),
    }),
    meta_description: z.object({
      en: z.string().max(160, 'English meta description must be 160 characters or less'),
      ar: z.string().max(160, 'Arabic meta description must be 160 characters or less'),
    }),
    canonical_url: z.string().max(255).optional().or(z.literal('')),
    is_active: z.boolean().optional().default(false),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    sort_order: z.coerce.number().int().optional().default(0),
    is_featured: z.boolean().optional().default(false),
    is_best_seller: z.boolean().optional().default(false),
    is_most_popular: z.boolean().optional().default(false),
    is_new: z.boolean().optional().default(false),
    display_rating: optionalNumber,
    display_reviews_count: optionalInt,
    booked_count: optionalInt,
  })
  .superRefine((data, ctx) => {
    if (!data.name.en.trim() && !data.name.ar.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name is required in at least one locale',
        path: ['name', 'en'],
      });
    }
    if (!data.short_description.en.trim() && !data.short_description.ar.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Short description is required. The public card cannot render without it.',
        path: ['short_description', 'en'],
      });
    }
    if (
      data.old_price != null &&
      data.price != null &&
      Number(data.old_price) <= Number(data.price)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Old price must be greater than price',
        path: ['old_price'],
      });
    }
    if (data.discount_percentage != null && (data.discount_percentage < 0 || data.discount_percentage > 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Discount percentage must be between 0 and 100',
        path: ['discount_percentage'],
      });
    }
    if (data.display_rating != null && (data.display_rating < 0 || data.display_rating > 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Display rating must be between 0 and 5',
        path: ['display_rating'],
      });
    }
    if (data.starts_at && data.ends_at && new Date(data.ends_at) <= new Date(data.starts_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['ends_at'],
      });
    }
  });

export type OfferFormInput = z.infer<typeof offerFormSchema>;
