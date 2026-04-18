import type { LandingPageConfig } from '@/types/landing-builder';
import {
  generateLandingExportTsx,
  generateReadme,
} from '@/lib/landing-builder/export-code';

export async function downloadLandingZip(config: LandingPageConfig) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  zip.file('components/ExportedLandingPage.tsx', generateLandingExportTsx(config));
  zip.file('README.md', generateReadme());
  zip.file(
    'config.snapshot.json',
    JSON.stringify(config, null, 2),
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'landing-page-export.zip';
  a.click();
  URL.revokeObjectURL(url);
}

export function getExportSource(config: LandingPageConfig) {
  return generateLandingExportTsx(config);
}
