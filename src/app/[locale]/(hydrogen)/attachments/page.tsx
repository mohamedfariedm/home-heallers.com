'use client';
import PasswordSettingsView from '@/app/shared/attachments/password-settings';
import PageHeader from '@/app/shared/page-header';
import ToggleSection from '@/app/shared/ToggleSection';
import Spinner from '@/components/ui/spinner';
import { routes } from '@/config/routes';
import { useEditSection, usePosts, useUpdateSection } from '@/framework/attachments';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ContentManager } from './components/forms/ContentManager';
import toast from 'react-hot-toast';

export default function ProfileSettingsFormPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('section_id')) params.set('section_id', '1');
  const { data, isLoading } = usePosts(params.get('section_id') || '1');
  console.log('section data', data);
  let [key,setKey]=useState(0)
  const { mutate: update, isPending } = useEditSection();
    const { mutate } = useUpdateSection();
  

  const pageHeader = {
    title: `${data?.section?.title?.en||"Description Page"}`,
    breadcrumb: [
      {
        href: routes.pages.index,
        name: 'Home',
      },
      {
        name: `${data?.section?.title?.en||"Description Page"}`,
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
      alert('Failed to update item');
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
