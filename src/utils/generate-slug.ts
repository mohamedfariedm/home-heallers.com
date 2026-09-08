export function generateSlug(title: string) {
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  return slug.replace(/[^a-z0-9-]/g, '');
}

/** Arabic slug: keep Arabic letters, replace spaces with dashes. Do not latinize. */
export function generateArabicSlug(title: string) {
  return title.trim().replace(/\s+/g, '-');
}
