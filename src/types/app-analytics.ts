export interface InstallationStats {
  total_installs: number;
  new_installs: {
    today: number;
    this_week: number;
    this_month: number;
  };
  by_platform: {
    android: number;
    ios: number;
  };
  by_app_version: Array<{ app_version: string; count: number }>;
  active_installations: number;
  uninstalled: {
    push_invalid: number;
    inactive_30_days: number;
    total: number;
  };
  unregistered: number;
  reinstalls: number;
}

export interface OutdatedInstallationItem {
  installation_id: number;
  platform: string;
  app_version: string | null;
  app_build: number | null;
  device_model: string | null;
  last_seen_at: string | null;
  latest_supported_version: string;
}

export interface DeviceStats {
  top_device_models: Array<{ device_model: string; count: number }>;
  top_android_versions: Array<{ os_version: string; count: number }>;
  top_iphone_models: Array<{ device_model: string; count: number }>;
  old_app_versions: Array<{ app_version: string; platform: string; count: number }>;
  latest_supported_versions: { android: string; ios: string };
  should_update: {
    count: number;
    items: OutdatedInstallationItem[];
  };
}

export interface ActiveUserStats {
  date: string;
  installations: { dau: number; wau: number; mau: number };
  users: { dau: number; wau: number; mau: number };
  source: 'live' | 'rollup';
}

export interface AppAnalyticsOverview {
  installations: InstallationStats;
  devices: DeviceStats;
  active_users: ActiveUserStats;
}

export interface AdminAnalyticsResponse<T> {
  message: string;
  data: T;
}
