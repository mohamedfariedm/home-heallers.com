import React from 'react';
import { Building2, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { BusinessInfo } from '../types/settings';

interface BusinessInfoSectionProps {
  businessInfo: BusinessInfo;
  onUpdate: (businessInfo: BusinessInfo) => void;
}

const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({ businessInfo, onUpdate }) => {
  const handleChange = (field: keyof BusinessInfo, value: string) => {
    onUpdate({
      ...businessInfo,
      [field]: value,
    });
  };

  const fields = [
    {
      key: 'commercial_registration' as keyof BusinessInfo,
      label: 'سجل تجاري رقم',
      labelEn: 'Commercial Registration Number',
      placeholder: 'Enter commercial registration number',
      icon: Building2,
    },
    {
      key: 'health_license' as keyof BusinessInfo,
      label: 'ترخيص وزارة الصحة رقم',
      labelEn: 'Ministry of Health License Number',
      placeholder: 'Enter health license number',
      icon: Building2,
    },
    {
      key: 'known_number' as keyof BusinessInfo,
      label: 'معروف رقم',
      labelEn: 'Known Number',
      placeholder: 'Enter known number',
      icon: Tag,
    },
    {
      key: 'whatsapp' as keyof BusinessInfo,
      label: 'واتساب',
      labelEn: 'WhatsApp',
      placeholder: 'Enter WhatsApp number',
      icon: Phone,
    },
    {
      key: 'contact' as keyof BusinessInfo,
      label: 'اتصال',
      labelEn: 'Contact',
      placeholder: 'Enter contact number',
      icon: Phone,
    },
    {
      key: 'email' as keyof BusinessInfo,
      label: 'ايميل',
      labelEn: 'Email',
      placeholder: 'Enter email address',
      icon: Mail,
      type: 'email',
    },
    {
      key: 'address' as keyof BusinessInfo,
      label: 'العنوان',
      labelEn: 'Address',
      placeholder: 'Enter address',
      icon: MapPin,
    },
    {
      key: 'brand' as keyof BusinessInfo,
      label: 'العلامه التجارية',
      labelEn: 'Brand',
      placeholder: 'Enter brand name',
      icon: Tag,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Manage your business contact and registration details.</p>
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
                  <h3 className="text-lg font-medium text-gray-900">{field.labelEn}</h3>
                  <p className="text-sm text-gray-500">{field.label}</p>
                </div>
              </div>

              <div>
                <input
                  type={field.type || 'text'}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Business Information Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure all registration numbers are accurate and up-to-date</li>
          <li>• Keep contact information current for customer inquiries</li>
          <li>• Verify email addresses are correct and monitored regularly</li>
          <li>• Update address information if your business location changes</li>
        </ul>
      </div>
    </div>
  );
};

export default BusinessInfoSection;

