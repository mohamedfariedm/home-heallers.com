'use client';

import { useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import OfferForm from '@/app/shared/offers/offer-form';
import { usePackage } from '@/framework/packages';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOffersPermissions } from '@/app/shared/offers/permissions';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'New Offer',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.offers.index, name: 'Offers' },
    { name: 'Create' },
  ],
};

export default function CreateOfferPage() {
  const searchParams = useSearchParams();
  const duplicateFrom = searchParams.get('duplicateFrom');
  const { permissions } = usePermissions();
  const access = resolveOffersPermissions(permissions);
  const { data, isLoading } = usePackage(duplicateFrom || undefined, Boolean(duplicateFrom));

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to create offers.
      </div>
    );
  }

  const defaults = duplicateFrom && data
    ? { ...data, id: undefined, slug: '' }
    : undefined;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      {duplicateFrom && isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <OfferForm
          initValues={defaults}
          canFaqs={access.faqs}
          canReviews={false}
          canGate1={access.reviewsGate1}
          canGate2={access.reviewsGate2}
        />
      )}
    </>
  );
}
