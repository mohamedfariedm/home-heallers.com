'use client';

import React from 'react';
import { PiImageBold } from 'react-icons/pi';
import { OnboardingLang } from '@/types/onboarding-screens';

interface PhonePreviewProps {
  lang: OnboardingLang;
  image?: string | null;
  title?: string;
  description?: string;
}

// Rough phone-shaped mock of how the screen looks in the mobile app.
export default function PhonePreview({
  lang,
  image,
  title,
  description,
}: PhonePreviewProps) {
  const isAr = lang === 'ar';

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-gray-500">
        {isAr ? 'العربية' : 'English'}
      </span>
      <div className="relative h-[400px] w-[200px] overflow-hidden rounded-[28px] border-[6px] border-gray-900 bg-white shadow-lg">
        <div className="absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-gray-900" />
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="flex h-full flex-col text-start"
        >
          <div className="flex h-[58%] items-center justify-center bg-gray-100">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <PiImageBold className="h-10 w-10 text-gray-300" />
            )}
          </div>
          <div className="flex flex-1 flex-col px-3 pt-3">
            <p className="line-clamp-2 text-sm font-bold text-gray-900">
              {title || (isAr ? 'العنوان' : 'Title')}
            </p>
            <p className="mt-1.5 line-clamp-4 text-[11px] leading-relaxed text-gray-500">
              {description || (isAr ? 'الوصف' : 'Description')}
            </p>
            <div className="mt-auto flex items-center justify-between pb-4">
              <div className="flex gap-1">
                <span className="h-1.5 w-4 rounded-full bg-gray-900" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              </div>
              <span className="rounded-full bg-gray-900 px-3 py-1 text-[10px] font-semibold text-white">
                {isAr ? 'التالي' : 'Next'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
