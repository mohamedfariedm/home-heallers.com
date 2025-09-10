  'use client';
  import PageHeader from '@/app/shared/page-header';
  import Spinner from '@/components/ui/spinner';
  import { routes } from '@/config/routes';
  import DataView from './DataView';
  import { useParams } from 'next/navigation';
  import { usePosts } from '@/framework/attachmentsService';
  import PasswordSettingsView from '@/app/shared/attachmentsService/password-settings';
  import ToggleSection from '@/app/shared/ToggleSection';

  export default function RegistrationFormPage() {
    const { id } = useParams();
    const serviceId = id ? String(id) : null; // التأكد من أن id موجود وصالح

    const { data, isLoading } = usePosts(serviceId || '1');
    console.log("1111",data);


    const pageHeader = {
      title: `${data?.data[0]?.name?.en||"Page Details"}`,
      breadcrumb: [
        {
          href: routes.pages.index,
          name: 'Home',
        },
        {
          name: `${data?.data[0]?.name?.en||"Page Details"}`,
        },
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
            {/* <ToggleSection
              // key={key}
              page_id={data?.section?.page_id}
              section_id={id || '1'}
              active={data?.section?.active ?? 1}
              priority={data?.section?.priority ?? 1}
              titleEn={data?.data[0]?.name?.en}
              titleAr={data?.data[0]?.name?.ar}
            /> */}

            {data?.data[0]?.sections?.map((form: any) => (
              <div key={form.id}>
                {/* <PasswordSettingsView
                  settings={{
                    title: form?.title ?? { en: "", ar: "", value: null },
                    description: form.description ?? { en: "", ar: "" },
                  }}
                  formData={form}
                  /> */}
                {form.Posts.map((items:any)=>{
                  return<PasswordSettingsView
                  key={items.id}
                  settings={{
                    title: items?.title ?? { en: "", ar: "", value: null },
                    description: items.description ?? { en: "", ar: "" },
                    sliders: items.attachment ?? null,
                  }}
                  formData={items}
                  />
                })}
              
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
