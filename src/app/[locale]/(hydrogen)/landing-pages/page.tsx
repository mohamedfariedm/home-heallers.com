'use client';
import LandingPagesSection from '@/components/LandingPagesSection';
import Spinner from '@/components/ui/spinner';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { Settings, LandingPage, LandingPageSection } from '@/types/settings';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function LandingPagesPage() {
  const { data, isLoading } = useSettings();
  const { mutate: update, isPending } = useUpdateSettings();
  
  const [settings, setSettings] = useState<Settings>(data?.data[0]?.setting || {} as Settings);
  
  // Update settings when data loads
  useEffect(() => {
    if (data?.data[0]?.setting) {
      setSettings(data.data[0].setting);
    }
  }, [data]);

  // Get landing pages from settings
  const landingPages = settings?.landing_pages || [];

  const handleUpdate = (pages: LandingPage[]) => {
    console.log({ landing_pages: pages });
    // Update settings with new landing pages (same as SettingsForm)
    const updatedSettings: Settings = {
      ...settings,
      landing_pages: pages,
    };
    setSettings(updatedSettings);
    
    // Save to API (same cycle as settings)
    console.log('Saving settings:', updatedSettings);
    update({ setting: updatedSettings });
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

    const currentPages = landingPages || [];
    handleUpdate([...currentPages, newLandingPage]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full mx-auto">
        {isLoading ? (
          <div className="m-auto">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
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
                landingPages={landingPages}
                onUpdate={handleUpdate}
              />
            </div>
            {isPending && (
              <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                Saving...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
