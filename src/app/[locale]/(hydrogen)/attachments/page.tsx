'use client';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { routes } from '@/config/routes';
import { useEditSection, usePosts, useUpdateSection } from '@/framework/attachments';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentManager } from './components/forms/ContentManager';
import toast from 'react-hot-toast';

export default function ProfileSettingsFormPage() {
  const { t } = useTranslation('attachments');
  const routeParams = useParams();
  const lang = routeParams?.locale === 'ar' ? 'ar' : 'en';
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('section_id')) params.set('section_id', '1');
  const { data, isLoading } = usePosts(params.get('section_id') || '1');
  let [key,setKey]=useState(0)
  const { mutate: update } = useEditSection();
    const { mutate } = useUpdateSection();
  
  const sectionTitle =
    data?.section?.title?.[lang] ||
    data?.section?.title?.en ||
    data?.section?.title?.ar ||
    t('attachments_page_fallback', 'Description Page');

  const pageHeader = {
    title: sectionTitle,
    breadcrumb: [
      {
        href: routes.pages.index,
        name: t('attachments_home', 'Home'),
      },
      {
        name: sectionTitle,
      },
    ],
  };

    const handleUpdateSection = async (sectionData: any) => {

    try {      
          update({
...sectionData
    });

    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleUpdateItem = async (itemData: any) => {
    console.log('Updating item:', itemData);
    
    try {
      // Simulate API call
    mutate(
      {
        ...itemData,
      }
    );
      
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error(t('attachments_update_failed', 'Failed to update item'));
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    // if (!confirm('Are you sure you want to delete this item?')) return;
    
    // setIsLoading(true);
    // try {
    //   // Simulate API call
    //   console.log('Deleting item:', itemId);
      
    //   // Update local state
    //   setData(prev => ({
    //     ...prev,
    //     data: prev.data.filter(item => item.id !== itemId)
    //   }));
      
    //   // Show success message
    //   setTimeout(() => {
    //     alert('Item deleted successfully!');
    //   }, 500);
      
    // } catch (error) {
    //   console.error('Failed to delete item:', error);
    //   alert('Failed to delete item');
    // } finally {
    //   setTimeout(() => setIsLoading(false), 1000);
    // }
  };

  useEffect(()=>{
    setKey(key+1)
  },[params.get('section_id')])

  return (
    <>
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <PageHeader
            title={pageHeader.title}
            breadcrumb={pageHeader.breadcrumb}
          ></PageHeader>
      <ContentManager
        data={data}
        onUpdateSection={handleUpdateSection}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        isLoading={isLoading}
      />
        </>
      )}
    </>
  );
}
