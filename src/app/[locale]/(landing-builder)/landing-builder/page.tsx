import { LandingBuilderListApp } from '@/components/landing/builder/landing-builder-list-app';

export const metadata = {
  title: 'Landing Page Builder',
  description:
    'Build responsive landing pages with live preview, templates, JSON mode, and export.',
};

export default function LandingBuilderPage() {
  return <LandingBuilderListApp />;
}
