import { LandingBuilderApp } from '@/components/landing/builder/landing-builder-app';

export const metadata = {
  title: 'Landing Page Builder',
  description:
    'Build responsive landing pages with live preview, templates, JSON mode, and export.',
};

export default function LandingBuilderPage() {
  return <LandingBuilderApp />;
}
