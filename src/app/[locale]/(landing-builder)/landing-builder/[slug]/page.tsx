import { LandingPagePublicPreview } from '@/components/landing/builder/landing-page-public-preview';

type Props = {
  params: { locale: string; slug: string };
};

export default function LandingBuilderSlugPage({ params }: Props) {
  return <LandingPagePublicPreview slug={params.slug} locale={params.locale} />;
}
