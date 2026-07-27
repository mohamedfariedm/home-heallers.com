import type { ActiveUserStats, AppAnalyticsOverview } from '@/types/app-analytics';

function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getMockActiveUsers(date = toDateInputValue()): ActiveUserStats {
  return {
    date,
    installations: {
      dau: 320,
      wau: 890,
      mau: 2100,
    },
    users: {
      dau: 280,
      wau: 750,
      mau: 1800,
    },
    source: 'live',
  };
}

export function getMockAppAnalyticsOverview(
  date = toDateInputValue()
): AppAnalyticsOverview {
  return {
    installations: {
      total_installs: 1250,
      new_installs: {
        today: 12,
        this_week: 85,
        this_month: 310,
      },
      by_platform: {
        android: 820,
        ios: 430,
      },
      by_app_version: [
        { app_version: '1.2.0', count: 500 },
        { app_version: '1.1.0', count: 320 },
        { app_version: '1.0.5', count: 210 },
        { app_version: '1.0.0', count: 120 },
        { app_version: '0.9.8', count: 100 },
      ],
      active_installations: 980,
      uninstalled: {
        push_invalid: 45,
        inactive_30_days: 120,
        total: 165,
      },
      unregistered: 12,
      reinstalls: 28,
    },
    devices: {
      top_device_models: [
        { device_model: 'iPhone 15 Pro', count: 120 },
        { device_model: 'Pixel 8', count: 95 },
        { device_model: 'Samsung Galaxy S24', count: 88 },
        { device_model: 'iPhone 14', count: 80 },
        { device_model: 'Redmi Note 13', count: 72 },
      ],
      top_android_versions: [
        { os_version: '14', count: 400 },
        { os_version: '13', count: 250 },
        { os_version: '12', count: 120 },
        { os_version: '11', count: 50 },
      ],
      top_iphone_models: [
        { device_model: 'iPhone 15 Pro', count: 120 },
        { device_model: 'iPhone 14', count: 80 },
        { device_model: 'iPhone 13', count: 65 },
        { device_model: 'iPhone 12', count: 40 },
      ],
      old_app_versions: [
        { app_version: '1.0.0', platform: 'android', count: 50 },
        { app_version: '1.0.1', platform: 'ios', count: 30 },
        { app_version: '0.9.8', platform: 'android', count: 25 },
      ],
      latest_supported_versions: {
        android: '1.2.0',
        ios: '1.2.0',
      },
      should_update: {
        count: 75,
        items: [
          {
            installation_id: 42,
            platform: 'android',
            app_version: '1.0.0',
            app_build: 100,
            device_model: 'Pixel 6',
            last_seen_at: '2026-07-10T14:30:00+00:00',
            latest_supported_version: '1.2.0',
          },
          {
            installation_id: 57,
            platform: 'ios',
            app_version: '1.0.1',
            app_build: 101,
            device_model: 'iPhone 12',
            last_seen_at: '2026-07-09T09:15:00+00:00',
            latest_supported_version: '1.2.0',
          },
          {
            installation_id: 63,
            platform: 'android',
            app_version: '0.9.8',
            app_build: 98,
            device_model: 'Samsung Galaxy A52',
            last_seen_at: '2026-07-08T18:45:00+00:00',
            latest_supported_version: '1.2.0',
          },
        ],
      },
    },
    active_users: getMockActiveUsers(date),
  };
}

export function isAppAnalyticsEmpty(data: AppAnalyticsOverview) {
  return (
    data.installations.total_installs === 0 &&
    data.active_users.installations.dau === 0 &&
    data.active_users.installations.mau === 0 &&
    data.devices.top_device_models.length === 0 &&
    data.installations.by_app_version.length === 0
  );
}
