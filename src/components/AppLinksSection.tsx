import React from 'react';
import { Smartphone, Apple, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AppLinksSectionProps {
  iosLink: string;
  androidLink: string;
  onUpdate: (iosLink: string, androidLink: string) => void;
}

const AppLinksSection: React.FC<AppLinksSectionProps> = ({
  iosLink,
  androidLink,
  onUpdate
}) => {
  const { t } = useTranslation('settings');
  const handleIOSChange = (value: string) => {
    onUpdate(value, androidLink);
  };

  const handleAndroidChange = (value: string) => {
    onUpdate(iosLink, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('settings_app_title')}</h2>
        <p className="text-gray-600">{t('settings_app_desc')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* iOS App Store Link */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Apple className="w-6 h-6 text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900">{t('settings_app_ios')}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings_app_store_url')}
              </label>
              <input
                type="url"
                value={iosLink}
                onChange={(e) => handleIOSChange(e.target.value)}
                placeholder="https://apps.apple.com/app/your-app-name/id123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {iosLink && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{t('settings_preview')}</span>
                <a
                  href={iosLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {iosLink}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Android Play Store Link */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Play className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">{t('settings_app_android')}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings_app_play_url')}
              </label>
              <input
                type="url"
                value={androidLink}
                onChange={(e) => handleAndroidChange(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=com.yourapp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {androidLink && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{t('settings_preview')}</span>
                <a
                  href={androidLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {androidLink}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* App Store Badges Preview */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">{t('settings_app_badges')}</h4>
        <div className="flex flex-wrap gap-4">
          {iosLink && (
            <a
              href={iosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                <Apple className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs">{t('settings_app_download_on')}</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </div>
            </a>
          )}
          
          {androidLink && (
            <a
              href={androidLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                <Play className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs">{t('settings_app_get_it_on')}</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </div>
            </a>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">{t('settings_app_notes_title')}</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• {t('settings_app_note1')}</li>
          <li>• {t('settings_app_note2')}</li>
          <li>• {t('settings_app_note3')}</li>
          <li>• {t('settings_app_note4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default AppLinksSection;