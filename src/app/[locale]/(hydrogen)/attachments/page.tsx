'use client';

import Spinner from '@/components/ui/spinner';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { routes } from '@/config/routes';
import { useEditSection, usePosts, useUpdateSection } from '@/framework/attachments';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentManager } from './components/forms/ContentManager';
import toast from 'react-hot-toast';
import { FileImage } from 'lucide-react';

export default function ProfileSettingsFormPage() {
  const { t } = useTranslation('attachments');
  const routeParams = useParams();
  const lang = routeParams?.locale === 'ar' ? 'ar' : 'en';
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('section_id')) params.set('section_id', '1');
  const { data, isLoading } = usePosts(params.get('section_id') || '1');
  const [key, setKey] = useState(0);
  const { mutate: update } = useEditSection();
  const { mutate } = useUpdateSection();

  const sectionTitle =
    data?.section?.title?.[lang] ||
    data?.section?.title?.en ||
    data?.section?.title?.ar ||
    t('attachments_page_fallback', 'Description Page');

  const handleUpdateSection = async (sectionData: any) => {
    try {
      update({
        ...sectionData,
      });
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleUpdateItem = async (itemData: any) => {
    try {
      mutate({
        ...itemData,
      });
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error(t('attachments_update_failed', 'Failed to update item'));
    }
  };

  const handleDeleteItem = async (_itemId: number) => {
    // delete reserved for future use
  };

  useEffect(() => {
    setKey((k) => k + 1);
  }, [params.get('section_id')]);

  return (
    <AdminPageShell
      title={sectionTitle}
      description={t(
        'attachments_page_description',
        'Manage section content, titles, and media for the website'
      )}
      icon={<FileImage />}
      breadcrumb={[
        {
          href: routes.pages.index,
          name: t('attachments_home', 'Home'),
        },
        {
          name: sectionTitle,
        },
      ]}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      ) : (
        <ContentManager
          key={key}
          data={data}
          onUpdateSection={handleUpdateSection}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          isLoading={isLoading}
        />
      )}
    </AdminPageShell>
  );
}
