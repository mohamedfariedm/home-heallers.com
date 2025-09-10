'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Select from 'react-select'; // multi-select for countries
import { Checkbox } from 'rizzui'; // Checkbox component for language switch
import Spinner from '@/components/ui/spinner';
import { useCountries } from '@/framework/countrues';
import { useCreatState, useUpdateState } from '@/framework/states';
import { StatesFormInput, statesFormSchema } from '@/utils/validators/states-form.schema';
import { useCities } from '@/framework/cities';

export default function CreateOrUpdateState({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createCity, isPending: isCreating } = useCreatState();
  const { mutate: updateCity, isPending: isUpdating } = useUpdateState();
  const { data: cityData, isLoading: isCityLoading } = useCities(""); // Get countries for dropdown

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedCity, setSelectedCity] = useState<any>(null); // To store the selected country
  const [loading, setLoading] = useState(false);

  // Language change handler
  useEffect(() => {
    if (initValues) {
      setSelectedCity({
        value: initValues?.city?.id, // Set the country based on initial values
        label: cityData?.data?.find((city:any) => city.id === initValues?.city.id)?.name?.[lang] || '',
      });
    }
  }, [initValues, lang, cityData]);
  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<StatesFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      city_id: selectedCity?.value, // Use selected country ID
      status: data.status,
    };

    if (initValues) {
      updateCity({ id: initValues.id, ...requestBody });
    } else {
      createCity(requestBody);
    }

    setLoading(true);
  };

  if (isCityLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<StatesFormInput>
      onSubmit={onSubmit}
      validationSchema={statesFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          city_id: initValues?.city_id || 1,
          status: initValues?.status || 'Published',
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors },setValue }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update State' : 'Create State'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          {/* Language Switch */}
          <div className="flex gap-3">
            <Checkbox  label="English" checked={lang === 'en'} onChange={() => setLang('en')} />
            <Checkbox label="Arabic" checked={lang === 'ar'} onChange={() => setLang('ar')} />
          </div>

          {/* Multilingual Name Field */}
          {lang === 'en' ? (
            <Input
            key={"name.en"}
              label="State Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"name.ar"}
              label="State Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />
          )}

          {/* Countries Select */}
          <div>
            <label>Countries</label>
            <Select
              options={cityData?.data?.map((country: any) => ({
                value: country.id,
                label: country.name?.[lang] ?? country.name?.en,
              }))}
              value={selectedCity} // Bind selected country
              onChange={(selected) => {
                setValue('city_id', selected?.value);
                setSelectedCity(selected)}} // Update selected country
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              placeholder="Select countries"
            />
            {errors.city_id && (
              <p className="text-sm text-red-500">{errors.city_id.message}</p>
            )}
          </div>

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
              {initValues ? 'Update State' : 'Create State'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
