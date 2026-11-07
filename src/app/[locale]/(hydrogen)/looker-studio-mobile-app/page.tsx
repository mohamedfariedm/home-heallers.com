'use client';

import { useState } from 'react';
import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { PiChartBarDuotone } from 'react-icons/pi';

export default function LookerStudioMobileAppPage() {
  const REPORT_ID = '50041049-b351-4769-a0f9-b38ad3736001';
  const PAGE_ID = 'ITnlF';
  const EMBED_URL = `https://datastudio.google.com/embed/reporting/${REPORT_ID}/page/${PAGE_ID}`;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <AdminPageShell
      title="Looker Studio Mobile App"
      description="Embedded Looker Studio mobile app analytics"
      icon={<PiChartBarDuotone />}
      maxWidth="full"
      contentClassName="!py-4"
    >
      <div className="relative h-[calc(100vh-180px)] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
            <Spinner size="lg" />
          </div>
        )}

        {hasError && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-2 text-lg font-semibold text-gray-900">
                Unable to load Looker Studio report
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Make sure the report is public and embedding is enabled.
              </p>
              <a
                href={`https://datastudio.google.com/reporting/${REPORT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#143087] underline hover:text-[#0F2466]"
              >
                Open report in Looker Studio
              </a>
            </div>
          </div>
        )}

        {!hasError && (
          <iframe
            src={EMBED_URL}
            title="Looker Studio Mobile App"
            className="h-full w-full border-0"
            width="600"
            height="450"
            frameBorder="0"
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>
    </AdminPageShell>
  );
}
