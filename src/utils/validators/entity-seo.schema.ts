import { z } from 'zod';
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from '@/types/seo-locale';

const localeString = (max: number) =>
  z.object({
    en: z.string().max(max, `Max ${max} characters`).optional().nullable(),
    ar: z.string().max(max, `Max ${max} characters`).optional().nullable(),
  }).optional();

export const entitySeoFieldsSchema = {
  slug: localeString(SEO_TITLE_MAX),
  meta_title: localeString(SEO_TITLE_MAX),
  meta_description: localeString(SEO_DESCRIPTION_MAX),
  og_title: localeString(SEO_TITLE_MAX),
  og_description: localeString(SEO_DESCRIPTION_MAX),
};
