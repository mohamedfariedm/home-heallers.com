/** One JSON file per page/area under public/locales/{en,ar}/{namespace}.json */
export const I18N_NAMESPACES = [
  'common',
  'menu',
  'onboarding-screens',
  'app-analytics',
  'attachments',
  'statistics',
  'highlights',
  'settings',
  'reservations',
  'blogs',
  'faqs',
  'client-review',
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];
