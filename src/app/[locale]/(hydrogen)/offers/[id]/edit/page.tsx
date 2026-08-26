'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import OfferForm from '@/app/shared/offers/offer-form';
import { usePackage } from '@/framework/packages';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOffersPermissions } from '@/app/shared/offers/permissions';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { offerDisplayName } from '@/app/shared/offers/utils';

export default function EditOfferPage() {
  const params = useParams();
  const id = params?.id as string;
  const { permissions } = usePermissions();
  const access = resolveOffersPermissions(permissions);
  const { data, isLoading, error, refetch } = usePackage(id);
  const status = (error as any)?.response?.status;

  if (!access.view) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to view offers.
      </div>
    );
  }

  if (status === 404) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <p>Offer not found.</p>
        <Link href={routes.offers.index}>
          <Button className="mt-4">Back to list</Button>
        </Link>
      </div>
    );
  }

  if (error && status !== 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <p>Could not load this offer.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const title = data ? offerDisplayName(data.name) || 'Edit offer' : 'Edit offer';

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { href: '/', name: 'Home' },
          { href: routes.offers.index, name: 'Offers' },
          { name: 'Edit' },
        ]}
      />
      {isLoading && !data ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <OfferForm
          initValues={data}
          readOnly={!access.update || status === 403}
          canFaqs={access.faqs}
          canReviews={access.reviewsView}
          canGate1={access.reviewsGate1}
          canGate2={access.reviewsGate2}
        />
      )}
    </>
  );
}
