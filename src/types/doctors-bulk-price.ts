export const SETTINGS_PRICE_KEYS = ['session_price', 'booking_price', 'reservation_price'] as const;

export type SettingsPriceKey = (typeof SETTINGS_PRICE_KEYS)[number];

export type SettingsPrices = Record<SettingsPriceKey, number | string | null>;

export interface DoctorsBulkPricePayload {
  session_price?: number;
  settings?: Partial<Record<SettingsPriceKey, number>>;
}

export interface DoctorsBulkPriceResponse {
  message: string;
  data: {
    doctors_updated: number;
    settings: SettingsPrices;
  };
}
