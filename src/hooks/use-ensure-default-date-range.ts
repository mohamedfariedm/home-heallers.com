'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type DateRangeMode,
  ensureDefaultDateParams,
  getDefaultDateRange,
  resolveDateKeys,
  shouldSkipDefaultDateRange,
} from '@/utils/default-date-range';

type Options = {
  mode: DateRangeMode;
  fromKey?: string;
  toKey?: string;
  /** Extra query keys to always preserve when rewriting the URL. */
  preserveKeys?: string[];
  enabled?: boolean;
};

/**
 * When the URL has no date range, sync the page default into search params via replace.
 * Returns the effective from/to (URL values or computed defaults).
 */
export function useEnsureDefaultDateRange(options: Options) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { fromKey, toKey } = resolveDateKeys(options);
  const enabled = options.enabled !== false;
  const skip = shouldSkipDefaultDateRange(searchParams);
  const defaults = getDefaultDateRange(options.mode);

  const urlFrom = searchParams.get(fromKey) || undefined;
  const urlTo = searchParams.get(toKey) || undefined;

  const dateFrom = skip ? urlFrom : urlFrom || defaults.from;
  const dateTo = skip ? urlTo : urlTo || defaults.to;

  useEffect(() => {
    if (!enabled || skip) return;

    // Activity-log style shortcuts already define a date window
    const hasShortcut = [
      'today',
      'yesterday',
      'this_week',
      'this_month',
      'last_month',
    ].some((key) => searchParams.get(key) === '1');
    if (hasShortcut) return;

    const params = new URLSearchParams(searchParams.toString());
    const mutated = ensureDefaultDateParams(params, {
      mode: options.mode,
      fromKey,
      toKey,
      skip: false,
    });

    if (!mutated) return;

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [enabled, skip, searchParams, router, pathname, options.mode, fromKey, toKey]);

  return {
    dateFrom,
    dateTo,
    defaults,
    skip,
    fromKey,
    toKey,
  };
}
