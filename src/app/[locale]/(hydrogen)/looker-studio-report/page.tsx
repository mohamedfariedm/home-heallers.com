'use client';

import { useState } from 'react';
import Spinner from '@/components/ui/spinner';

export default function LookerStudioReportPage() {
  const REPORT_ID = 'cef24180-77a3-4ba1-b98a-10e9138ed9d4';
  const PAGE_ID = 'ITnlF';

  // ✅ Correct Looker Studio EMBED URL
  const EMBED_URL = `https://lookerstudio.google.com/embed/reporting/${REPORT_ID}/page/${PAGE_ID}`;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full">
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-gray-900">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Unable to load Looker Studio report
            </p>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Make sure the report is public and embedding is enabled.
            </p>
            <a
              href={`https://lookerstudio.google.com/reporting/${REPORT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-700"
            >
              Open report in Looker Studio
            </a>
          </div>
        </div>
      )}

      {/* Iframe */}
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
  );
}
