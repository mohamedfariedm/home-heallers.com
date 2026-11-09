import React, { useEffect, useState } from 'react';
import {
  Settings,
  Banner,
  Social,
  SEOData,
  BusinessInfo,
  MediaFolder,
  RateColorsByMetric,
} from '../types/settings';
import BannerSection from './BannerSection';
import SocialSection from './SocialSection';
import AppLinksSection from './AppLinksSection';
import SEOSection from './SEOSection';
import {
  Save,
  Settings as SettingsIcon,
  Image,
  Share2,
  Smartphone,
  Search,
  FileText,
  Shield,
  Building2,
  FolderOpen,
  Palette,
  CreditCard,
} from 'lucide-react';
import TermsSection from './TermsSection';
import ConditionsSection from './ConditionsSection';
import BusinessInfoSection from './BusinessInfoSection';
import FolderManagementSection from './FolderManagementSection';
import RateColorsSection from './RateColorsSection';
import PaymentSection, {
  resolveAbandonedPaymentCouponSettings,
  validateAbandonedPaymentCouponSettings,
} from './PaymentSection';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface SettingsFormProps {
  initialSettings: Settings;
  onSave: (settings: Settings) => void;
  /** When true, skip outer page chrome (used inside AdminPageShell). */
  embedded?: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  initialSettings,
  onSave,
  embedded = false,
}) => {
  const { t } = useTranslation('settings');
  const normalizeSettings = (source: Settings): Settings => {
    const seo = { ...(source?.seo || {}) };
    const emptySEO = {
      title: '',
      description: '',
      h1: '',
      canonical: '',
      keywords: '',
      og_title: '',
      og_description: '',
      og_image: '',
      twitter_title: '',
      twitter_description: '',
      twitter_image: '',
    };
    const emptyPage = () => ({ ar: { ...emptySEO }, en: { ...emptySEO } });

    if (!seo.terms) seo.terms = emptyPage();
    if (!seo.conditions) seo.conditions = emptyPage();
    if (!seo.booking) seo.booking = emptyPage();
    if (!seo['doctors-apply']) seo['doctors-apply'] = emptyPage();

    const abandoned = resolveAbandonedPaymentCouponSettings(source);

    return {
      ...source,
      seo,
      abandoned_payment_coupon_enabled:
        abandoned.abandoned_payment_coupon_enabled,
      abandoned_payment_coupon_percent:
        abandoned.abandoned_payment_coupon_percent,
      abandoned_payment_coupon_delay_minutes:
        abandoned.abandoned_payment_coupon_delay_minutes,
    };
  };

  const [settings, setSettings] = useState<Settings>(() =>
    normalizeSettings(initialSettings)
  );
  const [activeTab, setActiveTab] = useState('banners');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<{
    percent?: string;
    delayMinutes?: string;
  }>({});

  // After save/refetch, show server values (including abandoned coupon keys)
  useEffect(() => {
    if (!initialSettings) return;
    setSettings(normalizeSettings(initialSettings));
    setPaymentErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSettings]);

  const tabs = [
    { id: 'banners', label: t('settings_tab_banners'), icon: Image },
    { id: 'social', label: t('settings_tab_social'), icon: Share2 },
    { id: 'app-links', label: t('settings_tab_app_links'), icon: Smartphone },
    { id: 'seo', label: t('settings_tab_seo'), icon: Search },
    { id: 'terms', label: t('settings_tab_terms'), icon: FileText },
    { id: 'conditions', label: t('settings_tab_conditions'), icon: Shield },
    { id: 'business-info', label: t('settings_tab_business'), icon: Building2 },
    {
      id: 'payment',
      label: t('settings_tab_payment', 'Payment'),
      icon: CreditCard,
    },
    { id: 'rate-colors', label: t('settings_tab_rate_colors'), icon: Palette },
    // { id: 'folder-management', label: 'Folder Management', icon: FolderOpen },
  ];

  const handleSave = async () => {
    const abandoned = {
      abandoned_payment_coupon_enabled: Boolean(
        settings.abandoned_payment_coupon_enabled
      ),
      abandoned_payment_coupon_percent:
        settings.abandoned_payment_coupon_percent as number,
      abandoned_payment_coupon_delay_minutes:
        settings.abandoned_payment_coupon_delay_minutes as number,
    };
    const nextErrors = validateAbandonedPaymentCouponSettings(abandoned, t);
    setPaymentErrors(nextErrors);
    if (nextErrors.percent || nextErrors.delayMinutes) {
      toast.error(
        t(
          'settings_abandoned_coupon_save_blocked',
          'Fix abandoned coupon fields before saving'
        )
      );
      setActiveTab('payment');
      return;
    }

    const payload: Settings = {
      ...settings,
      abandoned_payment_coupon_enabled:
        abandoned.abandoned_payment_coupon_enabled,
      abandoned_payment_coupon_percent: Number(
        abandoned.abandoned_payment_coupon_percent
      ),
      abandoned_payment_coupon_delay_minutes: Number(
        abandoned.abandoned_payment_coupon_delay_minutes
      ),
    };

    setIsLoading(true);
    try {
      await onSave(payload);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBanners = (banners: Banner[]) => {
    setSettings((prev) => ({ ...prev, banners }));
  };

  const updateSocial = (social: Social) => {
    setSettings((prev) => ({ ...prev, social }));
  };

  const updateAppLinks = (ios_link: string, android_link: string) => {
    setSettings((prev) => ({ ...prev, ios_link, android_link }));
  };

  const updateSEO = (seo: Record<string, SEOData>) => {
    setSettings((prev) => ({ ...prev, seo }));
  };

  const updateTerms = (terms: any) => {
    setSettings((prev) => ({ ...prev, terms }));
  };

  const updateConditions = (conditions: any) => {
    setSettings((prev) => ({ ...prev, conditions }));
  };

  const updateBusinessInfo = (business_info: BusinessInfo) => {
    setSettings((prev) => ({ ...prev, business_info }));
  };

  const updateMediaFolders = (media_folders: MediaFolder[]) => {
    setSettings((prev) => ({ ...prev, media_folders }));
  };

  const updateRateColors = (rate_colors: RateColorsByMetric) => {
    setSettings((prev) => ({ ...prev, rate_colors }));
  };

  const updateAbandonedPaymentCoupon = (values: {
    abandoned_payment_coupon_enabled: boolean;
    abandoned_payment_coupon_percent: number;
    abandoned_payment_coupon_delay_minutes: number;
  }) => {
    setSettings((prev) => ({ ...prev, ...values }));
    setPaymentErrors(
      validateAbandonedPaymentCouponSettings(values, t)
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'banners':
        return (
          <BannerSection banners={settings.banners} onUpdate={updateBanners} />
        );
      case 'social':
        return (
          <SocialSection social={settings.social} onUpdate={updateSocial} />
        );
      case 'app-links':
        return (
          <AppLinksSection
            iosLink={settings.ios_link}
            androidLink={settings.android_link}
            onUpdate={updateAppLinks}
          />
        );
      case 'seo':
        return <SEOSection seo={settings.seo} onUpdate={updateSEO} />;
      case 'terms':
        return <TermsSection terms={settings.terms} onUpdate={updateTerms} />;

      case 'conditions':
        return (
          <ConditionsSection
            conditions={settings.conditions}
            onUpdate={updateConditions}
          />
        );

      case 'business-info':
        return (
          <BusinessInfoSection
            businessInfo={
              settings.business_info || {
                commercial_registration: '',
                health_license: '',
                known_number: '',
                whatsapp: '',
                contact: '',
                email: '',
                address: '',
                brand: '',
              }
            }
            onUpdate={updateBusinessInfo}
          />
        );
      case 'payment':
        return (
          <PaymentSection
            values={{
              abandoned_payment_coupon_enabled: Boolean(
                settings.abandoned_payment_coupon_enabled
              ),
              abandoned_payment_coupon_percent:
                settings.abandoned_payment_coupon_percent as number,
              abandoned_payment_coupon_delay_minutes:
                settings.abandoned_payment_coupon_delay_minutes as number,
            }}
            onUpdate={updateAbandonedPaymentCoupon}
            errors={paymentErrors}
          />
        );
      case 'rate-colors':
        return (
          <RateColorsSection
            rateColors={settings.rate_colors || {}}
            onUpdate={updateRateColors}
          />
        );
      // case 'folder-management':
      //   return (
      //     <FolderManagementSection
      //       folders={settings.media_folders || []}
      //       onUpdate={updateMediaFolders}
      //     />
      //   );
      default:
        return null;
    }
  };

  const body = (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {!embedded && (
            <div className="bg-gradient-to-r from-[#143087] to-[#39519B] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="h-6 w-6 text-white" />
                  <h1 className="text-2xl font-bold text-white">
                    {t('settings_title')}
                  </h1>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2 rounded-xl bg-white px-4 py-2 text-[#143087] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? t('settings_saving') : t('settings_save')}</span>
                </button>
              </div>
            </div>
          )}

          {embedded && (
            <div className="flex justify-end border-b border-gray-100 px-6 py-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 rounded-xl bg-[#143087] px-4 py-2 text-white transition-colors hover:bg-[#0F2466] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? t('settings_saving') : t('settings_save')}</span>
              </button>
            </div>
          )}

          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 border-b-2 px-2 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#143087] text-[#143087]'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">{renderTabContent()}</div>
        </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#E8ECF5]/20 to-blue-50/20 px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">{body}</div>
    </div>
  );
};

export default SettingsForm;
