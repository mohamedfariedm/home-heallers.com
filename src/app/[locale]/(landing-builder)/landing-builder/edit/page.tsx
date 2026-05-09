import { LandingBuilderEditorApp } from '@/components/landing/builder/landing-builder-editor-app';

export const metadata = {
  title: 'Edit Landing Page',
  description: 'Edit a landing page by slug.',
};

export default function LandingBuilderEditPage() {
  return <LandingBuilderEditorApp />;
}
