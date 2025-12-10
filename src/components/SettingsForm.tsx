import React, { useState } from 'react';
import { Settings, Banner, Social, SEOData, BusinessInfo } from '../types/settings';
import BannerSection from './BannerSection';
import SocialSection from './SocialSection';
import AppLinksSection from './AppLinksSection';
import SEOSection from './SEOSection';
import { Save, Settings as SettingsIcon, Image, Share2, Smartphone, Search, FileText, Shield, Building2 } from 'lucide-react';
import TermsSection from './TermsSection';
import ConditionsSection from './ConditionsSection';
import BusinessInfoSection from './BusinessInfoSection';

interface SettingsFormProps {
  initialSettings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialSettings, onSave }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [activeTab, setActiveTab] = useState('banners');
  const [isLoading, setIsLoading] = useState(false);

const tabs = [
  { id: "banners", label: "Banners", icon: Image },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "app-links", label: "App Links", icon: Smartphone },
  { id: "seo", label: "SEO Settings", icon: Search },
  { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  { id: 'conditions', label: 'General Conditions', icon: Shield },
  { id: 'business-info', label: 'Business Information', icon: Building2 },
];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(settings);
      // You could add a success notification here
    } catch (error) {
      console.error('Error saving settings:', error);
      // You could add an error notification here
    } finally {
      setIsLoading(false);
    }
  };

  const updateBanners = (banners: Banner[]) => {
    setSettings(prev => ({ ...prev, banners }));
  };

  const updateSocial = (social: Social) => {
    setSettings(prev => ({ ...prev, social }));
  };

  const updateAppLinks = (ios_link: string, android_link: string) => {
    setSettings(prev => ({ ...prev, ios_link, android_link }));
  };

  const updateSEO = (seo: Record<string, SEOData>) => {
    setSettings(prev => ({ ...prev, seo }));
  };

  const updateTerms = (terms: any) => {
  setSettings(prev => ({ ...prev, terms }));
};

const updateConditions = (conditions: any) => {
  setSettings(prev => ({ ...prev, conditions }));
};

const updateBusinessInfo = (business_info: BusinessInfo) => {
  setSettings(prev => ({ ...prev, business_info }));
};

  const renderTabContent = () => {
    switch (activeTab) {
      case 'banners':
        return (
          <BannerSection
            banners={settings.banners}
            onUpdate={updateBanners}
          />
        );
      case 'social':
        return (
          <SocialSection
            social={settings.social}
            onUpdate={updateSocial}
          />
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
        return (
          <SEOSection
            seo={settings.seo}
            onUpdate={updateSEO}
          />
        );
            case "terms":
      return <TermsSection terms={settings.terms} onUpdate={updateTerms} />;

    case "conditions":
      return <ConditionsSection conditions={settings.conditions} onUpdate={updateConditions} />;

    case "business-info":
      return (
        <BusinessInfoSection
          businessInfo={settings.business_info || {
            commercial_registration: '',
            health_license: '',
            known_number: '',
            whatsapp: '',
            contact: '',
            email: '',
            address: '',
            brand: '',
          }}
          onUpdate={updateBusinessInfo}
        />
      );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-bold text-white">Settings Management</h1>
              </div>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;