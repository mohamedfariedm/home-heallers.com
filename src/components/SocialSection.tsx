import React from 'react';
import { Social, SocialLink } from '../types/settings';
import { Facebook, Instagram, Linkedin, Youtube, Ghost, Music2, X } from 'lucide-react';
import { Switch } from 'rizzui';

interface SocialSectionProps {
  social: Social;
  onUpdate: (social: Social) => void;
}

const SocialSection: React.FC<SocialSectionProps> = ({ social, onUpdate }) => {
  const handleChange = (field: keyof Social, value: Partial<SocialLink>) => {
    const current = social[field] || { url: '', show: false };
    onUpdate({ 
      ...social, 
      [field]: { ...current, ...value } 
    });
  };

  const socialFields = [
    { 
      key: 'x' as keyof Social, 
      label: 'X (Twitter)', 
      placeholder: 'Enter X (Twitter) profile URL',
      icon: X,
      color: 'text-black'
    },
    { 
      key: 'facebook' as keyof Social, 
      label: 'Facebook', 
      placeholder: 'Enter Facebook page URL',
      icon: Facebook,
      color: 'text-blue-600'
    },
    { 
      key: 'instgram' as keyof Social, 
      label: 'Instagram', 
      placeholder: 'Enter Instagram profile URL',
      icon: Instagram,
      color: 'text-pink-600'
    },
    { 
      key: 'linked_in' as keyof Social, 
      label: 'LinkedIn', 
      placeholder: 'Enter LinkedIn profile URL',
      icon: Linkedin,
      color: 'text-blue-700'
    },
    { 
      key: 'tiktok' as keyof Social, 
      label: 'TikTok', 
      placeholder: 'Enter TikTok profile URL',
      icon: Music2,
      color: 'text-pink-500'
    },
    { 
      key: 'snapchat' as keyof Social, 
      label: 'Snapchat', 
      placeholder: 'Enter Snapchat profile URL',
      icon: Ghost,
      color: 'text-yellow-400'
    },
    { 
      key: 'youtube' as keyof Social, 
      label: 'YouTube', 
      placeholder: 'Enter YouTube channel URL',
      icon: Youtube,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Social Media Links</h2>
        <p className="text-gray-600">Configure your social media presence across different platforms.</p>
      </div>

      <div className="grid gap-6">
        {socialFields.map((field) => {
          const Icon = field.icon;
          const currentValue = social[field.key] || { url: '', show: false };
          
          return (
            <div key={field.key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${field.color}`} />
                  <h3 className="text-lg font-medium text-gray-900">{field.label}</h3>
                </div>
                <Switch
                  label="Show"
                  checked={currentValue.show}
                  onChange={() => handleChange(field.key, { show: !currentValue.show })}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} Link
                  </label>
                  <input
                    type="text"
                    value={currentValue.url || ''}
                    onChange={(e) => handleChange(field.key, { url: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {currentValue.url && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Preview:</span>
                    <a
                      href={currentValue.url.startsWith('http') ? currentValue.url : `https://${currentValue.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {currentValue.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Tips for Social Media Links</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use complete URLs (e.g., https://twitter.com/username)</li>
          <li>• Ensure links are public and accessible</li>
          <li>• Test links regularly to ensure theyre working</li>
          <li>• Use consistent branding across all platforms</li>
        </ul>
      </div>
    </div>
  );
};

export default SocialSection;