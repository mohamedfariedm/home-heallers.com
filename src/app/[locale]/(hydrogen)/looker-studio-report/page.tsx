'use client';

import { useState } from 'react';
import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { PiChartBarDuotone } from 'react-icons/pi';

export default function LookerStudioReportPage() {
  const REPORT_ID = 'cef24180-77a3-4ba1-b98a-10e9138ed9d4';
  const PAGE_ID = 'ITnlF';
  const EMBED_URL = `https://lookerstudio.google.com/embed/reporting/${REPORT_ID}/page/${PAGE_ID}`;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <AdminPageShell
      title="Looker Studio Report"
      description="Embedded Looker Studio analytics report"
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
                href={`https://lookerstudio.google.com/reporting/${REPORT_ID}`}
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
            title="Looker Studio Report"
            className="h-full w-full"
            frameBorder="0"
            allowFullScreen
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
