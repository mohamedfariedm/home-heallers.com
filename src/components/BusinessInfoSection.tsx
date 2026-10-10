import React from 'react';
import { Building2, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { BusinessInfo } from '../types/settings';
import { useTranslation } from 'react-i18next';

interface BusinessInfoSectionProps {
  businessInfo: BusinessInfo;
  onUpdate: (businessInfo: BusinessInfo) => void;
}

const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({ businessInfo, onUpdate }) => {
  const { t } = useTranslation();
  const handleChange = (field: keyof BusinessInfo, value: string) => {
    onUpdate({
      ...businessInfo,
      [field]: value,
    });
  };

  const fields = [
    { key: 'commercial_registration' as keyof BusinessInfo, labelKey: 'settings_business_commercial_registration', icon: Building2 },
    { key: 'health_license' as keyof BusinessInfo, labelKey: 'settings_business_health_license', icon: Building2 },
    { key: 'known_number' as keyof BusinessInfo, labelKey: 'settings_business_known_number', icon: Tag },
    { key: 'whatsapp' as keyof BusinessInfo, labelKey: 'settings_business_whatsapp', icon: Phone },
    { key: 'contact' as keyof BusinessInfo, labelKey: 'settings_business_contact', icon: Phone },
    { key: 'email' as keyof BusinessInfo, labelKey: 'settings_business_email', icon: Mail, type: 'email' },
    { key: 'address' as keyof BusinessInfo, labelKey: 'settings_business_address', icon: MapPin },
    { key: 'brand' as keyof BusinessInfo, labelKey: 'settings_business_brand', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('settings_business_title')}</h2>
        <p className="text-gray-600">{t('settings_business_desc')}</p>
      </div>

      <div className="grid gap-6">
        {fields.map((field) => {
          const Icon = field.icon;
          const value = businessInfo[field.key] || '';

          return (
            <div key={field.key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t(field.labelKey)}</h3>
                </div>
              </div>

              <div>
                <input
                  type={field.type || 'text'}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={t('settings_business_ph', { label: t(field.labelKey) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">{t('settings_business_guidelines_title')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('settings_business_guide1')}</li>
          <li>• {t('settings_business_guide2')}</li>
          <li>• {t('settings_business_guide3')}</li>
          <li>• {t('settings_business_guide4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default BusinessInfoSection;

