'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreatecountries, useUpdatecountries } from '@/framework/countrues'; // replace with correct API hooks
import { Checkbox } from 'rizzui';
import { countryFormSchema, CountryFormInput } from '@/utils/validators/country-form.schema'; // schema for validation

export default function CreateOrUpdateCountry({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createCountry, isPending: isCreating } = useCreatecountries();
  const { mutate: updateCountry, isPending: isUpdating } = useUpdatecountries();

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(false);

  // Language change handler
  useEffect(() => {
    // When switching language, reset the country fields
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<CountryFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      currency: data.currency,
      status: data.status,
    };

    if (initValues) {
      updateCountry({ country_id: initValues.id, ...requestBody });
    } else {
      createCountry(requestBody);
    }

    setLoading(true);
  };

  return (
    <Form<CountryFormInput>
      onSubmit={onSubmit}
      validationSchema={countryFormSchema}
      useFormProps={{
        defaultValues: {
          name: { en: initValues?.name?.en || '', ar: initValues?.name?.ar || '' },
          currency: { en: initValues?.currency?.en || '', ar: initValues?.currency?.ar || '' },
          status: initValues?.status || 'Published',
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Country' : 'Create Country'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

        

          {/* Multilingual Name Field */}
            <Input
            key={"name.en"}
              label="Country Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />
            <Input
            key={"name.ar"}
              label="Country Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />

          {/* Multilingual Currency Field */}
            <Input
            key={"currency.en"}
              label="Currency (English)"
              {...register('currency.en')}
              error={errors.currency?.en?.message}
            />
            <Input
            key={"currency.ar"}
              label="Currency (Arabic)"
              {...register('currency.ar')}
              error={errors.currency?.ar?.message}
            />

          {/* Status Field */}
          <div>
            <label>Status</label>
            <select {...register('status')} className="w-full">
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? 'Update Country' : 'Create Country'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
