import React, { useState } from 'react';
import { Settings, Banner, Social, SEOData, BusinessInfo, LandingPage, LandingPageSection } from '../types/settings';
import BannerSection from './BannerSection';
import SocialSection from './SocialSection';
import AppLinksSection from './AppLinksSection';
import SEOSection from './SEOSection';
import { Save, Settings as SettingsIcon, Image, Share2, Smartphone, Search, FileText, Shield, Building2, Globe, Sparkles } from 'lucide-react';
import TermsSection from './TermsSection';
import ConditionsSection from './ConditionsSection';
import BusinessInfoSection from './BusinessInfoSection';
import LandingPagesSection from './LandingPagesSection';

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
  // { id: "landing-pages", label: "Landing Pages", icon: Globe },
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

const updateLandingPages = (landing_pages: any[]) => {
  console.log({landing_pages});
  setSettings(prev => ({ ...prev, landing_pages }));
};

// Function to create a landing page with selected section types (hero, section, banner, form)
const createLandingPageWithAllSections = () => {
  const timestamp = Date.now();
  const sections: LandingPageSection[] = [
    {
      type: 'hero',
      title: { en: 'Welcome to Our Platform', ar: 'مرحباً بكم في منصتنا' },
      content: { en: 'Discover amazing services and solutions tailored for you', ar: 'اكتشف خدمات وحلول رائعة مصممة خصيصاً لك' },
      order: 1,
      display_mode: 'section',
      buttons: [
        {
          text: { en: 'Get Started', ar: 'ابدأ الآن' },
          link: '/register',
          style: 'primary',
          open_in_new_tab: false,
        },
        {
          text: { en: 'Learn More', ar: 'اعرف المزيد' },
          link: '/about',
          style: 'outline',
          open_in_new_tab: false,
        },
      ],
    },
    {
      type: 'section',
      title: { en: 'About Our Services', ar: 'حول خدماتنا' },
      content: { en: 'We provide comprehensive solutions to meet all your needs. Our team is dedicated to delivering excellence in every project.', ar: 'نوفر حلولاً شاملة لتلبية جميع احتياجاتك. فريقنا ملتزم بتقديم التميز في كل مشروع.' },
      order: 2,
      display_mode: 'section',
      buttons: [
        {
          text: { en: 'Explore More', ar: 'استكشف المزيد' },
          link: '/services',
          style: 'primary',
          open_in_new_tab: false,
        },
      ],
    },
    {
      type: 'banner',
      title: { en: 'Special Offer', ar: 'عرض خاص' },
      content: { en: 'Limited time offer - Don\'t miss out!', ar: 'عرض لفترة محدودة - لا تفوت الفرصة!' },
      order: 3,
      display_mode: 'section',
    },
    {
      type: 'form',
      title: { en: 'Contact Form', ar: 'نموذج الاتصال' },
      content: { en: 'Fill out the form below and we\'ll get back to you', ar: 'املأ النموذج أدناه وسنعود إليك' },
      order: 4,
      display_mode: 'section',
      form_fields: [
        {
          id: 'name',
          label: { en: 'Full Name', ar: 'الاسم الكامل' },
          type: 'text',
          placeholder: { en: 'Enter your name', ar: 'أدخل اسمك' },
          required: true,
        },
        {
          id: 'email',
          label: { en: 'Email', ar: 'البريد الإلكتروني' },
          type: 'email',
          placeholder: { en: 'Enter your email', ar: 'أدخل بريدك الإلكتروني' },
          required: true,
        },
        {
          id: 'message',
          label: { en: 'Message', ar: 'الرسالة' },
          type: 'textarea',
          placeholder: { en: 'Enter your message', ar: 'أدخل رسالتك' },
          required: true,
        },
      ],
      form_submit_text: { en: 'Submit', ar: 'إرسال' },
      form_success_message: { en: 'Thank you! Your message has been sent successfully.', ar: 'شكراً لك! تم إرسال رسالتك بنجاح.' },
      form_api_endpoint: '/api/contact-form',
    },
  ];

  // Professional SEO configuration
  const currentDate = new Date().toISOString().split('T')[0];
  const pageSlug = `complete-landing-page-${timestamp}`;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com';
  const pageUrl = `${baseUrl}/${pageSlug}`;

  const professionalSEO = {
    meta_title: { 
      en: 'Complete Landing Page - Professional Services | Your Brand', 
      ar: 'صفحة هبوط كاملة - خدمات احترافية | علامتك التجارية' 
    },
    meta_description: { 
      en: 'Discover our comprehensive landing page with hero section, content sections, banner, and contact form. Get started today with professional solutions tailored for you.', 
      ar: 'اكتشف صفحة الهبوط الشاملة مع قسم البطل، أقسام المحتوى، البانر، ونموذج الاتصال. ابدأ اليوم مع حلول احترافية مصممة خصيصاً لك.' 
    },
    focus_keyword: { 
      en: 'professional landing page', 
      ar: 'صفحة هبوط احترافية' 
    },
    h1_tag: { 
      en: 'Complete Landing Page with All Sections', 
      ar: 'صفحة هبوط كاملة بجميع الأقسام' 
    },
    meta_keywords: { 
      en: 'landing page, professional services, hero section, contact form, banner, web design', 
      ar: 'صفحة هبوط، خدمات احترافية، قسم البطل، نموذج اتصال، بانر، تصميم مواقع' 
    },
    canonical_url: pageUrl,
    meta_robots: 'index, follow',
    og_title: { 
      en: 'Complete Landing Page - Professional Services', 
      ar: 'صفحة هبوط كاملة - خدمات احترافية' 
    },
    og_description: { 
      en: 'Discover our comprehensive landing page with professional sections and contact form. Get started today!', 
      ar: 'اكتشف صفحة الهبوط الشاملة مع أقسام احترافية ونموذج اتصال. ابدأ اليوم!' 
    },
    og_image: `${baseUrl}/images/og-landing-page.jpg`,
    og_type: 'website',
    og_url: pageUrl,
    og_site_name: 'Your Brand Name',
    og_locale: { en: 'en_US', ar: 'ar_SA' },
    twitter_card: 'summary_large_image',
    twitter_title: { 
      en: 'Complete Landing Page - Professional Services', 
      ar: 'صفحة هبوط كاملة - خدمات احترافية' 
    },
    twitter_description: { 
      en: 'Discover our comprehensive landing page with professional sections. Get started today!', 
      ar: 'اكتشف صفحة الهبوط الشاملة مع أقسام احترافية. ابدأ اليوم!' 
    },
    twitter_image: `${baseUrl}/images/twitter-landing-page.jpg`,
    twitter_site: '@yourbrand',
    twitter_creator: '@yourbrand',
    schema_type: 'WebPage',
    author: 'Your Brand',
    published_date: currentDate,
    modified_date: currentDate,
    language: 'en',
  };

  const newLandingPage: LandingPage = {
    slug: pageSlug,
    name: { en: 'Complete Landing Page', ar: 'صفحة هبوط كاملة' },
    title: { en: 'Complete Landing Page with All Sections', ar: 'صفحة هبوط كاملة بجميع الأقسام' },
    description: { en: 'A landing page with hero, section, banner, and form sections', ar: 'صفحة هبوط تحتوي على أقسام: البطل، القسم، البانر، والنموذج' },
    meta_title: professionalSEO.meta_title,
    meta_description: professionalSEO.meta_description,
    sections: sections,
    seo: professionalSEO,
  };

  const currentPages = settings.landing_pages || [];
  updateLandingPages([...currentPages, newLandingPage]);
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
      case "landing-pages":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Landing Pages Management</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create and manage your landing pages with customizable sections
                </p>
              </div>
              <button
                onClick={createLandingPageWithAllSections}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                title="Create a landing page with all section types"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Complete Landing Page</span>
              </button>
            </div>
            <LandingPagesSection
              landingPages={settings.landing_pages || []}
              onUpdate={updateLandingPages}
            />
          </div>
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
      <div className="w-full mx-auto">
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