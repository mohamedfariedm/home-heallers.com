'use client';

import { useState } from 'react';
import Spinner from '@/components/ui/spinner';

export default function LookerStudioMobileAppPage() {
  const REPORT_ID = '50041049-b351-4769-a0f9-b38ad3736001';
  const PAGE_ID = 'ITnlF';

  const EMBED_URL = `https://datastudio.google.com/embed/reporting/${REPORT_ID}/page/${PAGE_ID}`;

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
              href={`https://datastudio.google.com/reporting/${REPORT_ID}`}
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
  );
}
