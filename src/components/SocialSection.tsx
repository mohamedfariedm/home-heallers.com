import React from 'react';
import { Social } from '../types/settings';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

interface SocialSectionProps {
  social: Social;
  onUpdate: (social: Social) => void;
}

const SocialSection: React.FC<SocialSectionProps> = ({ social, onUpdate }) => {
  const handleChange = (field: keyof Social, value: string) => {
    onUpdate({ ...social, [field]: value });
  };

  const socialFields = [
    { 
      key: 'twetter' as keyof Social, 
      label: 'Twitter', 
      placeholder: 'Enter Twitter username or URL',
      icon: Twitter,
      color: 'text-blue-400'
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
          return (
            <div key={field.key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className={`w-6 h-6 ${field.color}`} />
                <h3 className="text-lg font-medium text-gray-900">{field.label}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} Link
                  </label>
                  <input
                    type="text"
                    value={social[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {social[field.key] && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Preview:</span>
                    <a
                      href={social[field.key].startsWith('http') ? social[field.key] : `https://${social[field.key]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {social[field.key]}
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