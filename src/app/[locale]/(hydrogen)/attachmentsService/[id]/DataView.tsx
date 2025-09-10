'use client';

import FormGroup from '@/app/shared/form-group';
import { Form } from '@/components/ui/form';
import { SubmitHandler } from 'react-hook-form';
import { Input } from 'rizzui';

interface user {
  id: number;
  commercial_registration_number: string;
  email: string;
  phone_number: string;
  company_activity: string;
  company_file_number: string;
  company_name:string;
  contact_person_name:string;
  job_title:string;
  number_of_workers:string;
  our_service:any;
  region:string;
  contract_duration:string;
  name_destination: number | null;
  commercial_register: string | null;
  national_id_number: string | null;
  nationality: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export default function DataView({ data }: { data?: user }) {
  console.log('datadd', data);
  const onSubmit: SubmitHandler<user> = (data) => {};

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };
  const readableDate = (date: string) =>
    new Date(date).toLocaleString('en-US', options);

  return (
    <>
      <Form<user>
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues: data,
          values: data,
        }}
      >
        {({ register, control, formState: { errors }, watch }) => {
          return (
            <div className="mx-auto w-full max-w-screen-2xl">
              <FormGroup
                title="commercial registration number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Name"
                  {...register('commercial_registration_number')}
                />
              </FormGroup>
              <FormGroup
                title="Email"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Email"
                  {...register('email')}
                />
              </FormGroup>
              <FormGroup
                title="Mobile Number"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Mobile Number"
                  {...register('phone_number')}
                />
              </FormGroup>
              <FormGroup
                title="Company Activity"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Type"
                  {...register('company_activity')}
                />
              </FormGroup>
              <FormGroup
                title="Usercompany file numbername"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('company_file_number')}
                />
              </FormGroup>

              <FormGroup
                title="Company Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('company_name')}
                />
              </FormGroup>

              <FormGroup
                title="Contact Person Name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('contact_person_name')}
                />
              </FormGroup>
              <FormGroup
                title="Contract Duration"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('contract_duration')}
                />
              </FormGroup>
              <FormGroup
                title="Job Title"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('job_title')}
                />
              </FormGroup>

              <FormGroup
                title="Number of workers"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('number_of_workers')}
                />
              </FormGroup>

              <FormGroup
                title="Region"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Username"
                  {...register('region')}
                />
              </FormGroup>

              <FormGroup
                title="Service"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
              <label>
              {data?.our_service?.name?.ar || ''}
              </label>
              </FormGroup>

              {data?.name_destination && (
                <FormGroup
                  title="Organization Name"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                    disabled
                    type="text"
                    className="pointer-events-none col-span-full"
                    placeholder="Organization Name"
                    {...register('name_destination')}
                  />
                </FormGroup>
              )}
              {data?.commercial_register && (
                <FormGroup
                  title="Commercial Register"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                    disabled
                    type="text"
                    className="pointer-events-none col-span-full"
                    placeholder="Commercial Register"
                    {...register('commercial_register')}
                  />
                </FormGroup>
              )}
              {data?.national_id_number && (
                <FormGroup
                  title="National ID Number"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                    disabled
                    type="text"
                    className="pointer-events-none col-span-full"
                    placeholder="National ID Number"
                    {...register('national_id_number')}
                  />
                </FormGroup>
              )}
              {data?.nationality && (
                <FormGroup
                  title="Nationality"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                    disabled
                    type="text"
                    className="pointer-events-none col-span-full"
                    placeholder="Nationality"
                    {...register('nationality')}
                  />
                </FormGroup>
              )}
              {data?.gender && (
                <FormGroup
                  title="Gender"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                    disabled
                    type="text"
                    className="pointer-events-none col-span-full"
                    placeholder="Gender"
                    {...register('gender')}
                  />
                </FormGroup>
              )}

              <FormGroup
                title="Created At"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Created At"
                  value={readableDate(data?.created_at || '')}
                />
              </FormGroup>
              <FormGroup
                title="Updated At"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  disabled
                  type="text"
                  className="pointer-events-none col-span-full"
                  placeholder="Updated At"
                  value={readableDate(data?.updated_at || '')}
                />
              </FormGroup>
            </div>
          );
        }}
      </Form>
    </>
  );
}
