'use client';
import { useParams, useSearchParams } from 'next/navigation';
import PasswordSettingsView from '@/app/shared/attachmentsService/password-settings';
import PageHeader from '@/app/shared/page-header';
import ToggleSection from '@/app/shared/ToggleSection';
import Spinner from '@/components/ui/spinner';
import { routes } from '@/config/routes';
import { usePosts } from '@/framework/attachmentsService';
import { useEffect, useState } from 'react';

export default function ProfileSettingsFormPage() {
  const { id } = useParams(); // استخراج id من الـ URL
  const serviceId = id ? String(id) : null; // التأكد من أن id موجود وصالح

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('section_id')) params.set('section_id', '1');

  const { data, isLoading } = usePosts(serviceId as string);
  console.log('Service ID:', serviceId);

  let [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [params.get('section_id')]); // تحديث عند تغيير section_id

  const pageHeader = {
    title: `${data?.section?.title?.en || "Description Page"}`,
    breadcrumb: [
      { href: routes.pages.index, name: 'Home' },
      { name: `${data?.section?.title?.en || "Description Page"}` },
    ],
  };

  return (
    <>
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
          <ToggleSection
            key={key}
            page_id={data?.section?.page_id}
            section_id={params.get('section_id') || '1'}
            active={data?.section?.active ?? 1}
            priority={data?.section?.priority ?? 1}
            titleEn={data?.section?.title?.en}
            titleAr={data?.section?.title?.ar}
          />

          {data?.data?.map((form: any) => (
            <div key={form.id}>
              <PasswordSettingsView
                settings={{
                  title: form?.title ?? { en: "", ar: "", value: null },
                  description: form.description ?? { en: "", ar: "" },
                  sliders: form.attachment ?? null,
                }}
                formData={form}
              />
              <br />
              <hr />
              <br />
            </div>
          ))}
        </>
      )}
    </>
  );
}
