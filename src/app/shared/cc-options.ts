export const CC_OPTIONS = [
  { value: 'Rework - Whatsapp', label: 'Rework - Whatsapp' },
  { value: 'Rework - Call', label: 'Rework - Call' },
] as const;

export const CC_OPTION_VALUES = CC_OPTIONS.map((o) => o.value);

export const isValidCcValue = (val?: string | null) =>
  !val || CC_OPTION_VALUES.includes(val as (typeof CC_OPTION_VALUES)[number]);
