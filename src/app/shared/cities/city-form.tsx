'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateCity, useUpdateCity } from '@/framework/cities';
import Select from 'react-select'; // multi-select for countries
import { cityFormSchema, CityFormInput } from '@/utils/validators/city-form.schema'; // schema for validation
import { Checkbox } from 'rizzui'; // Checkbox component for language switch
import Spinner from '@/components/ui/spinner';
import { useCountries } from '@/framework/countrues';

export default function CreateOrUpdateCity({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createCity, isPending: isCreating } = useCreateCity();
  const { mutate: updateCity, isPending: isUpdating } = useUpdateCity();
  const { data: countriesData, isLoading: isCountriesLoading } = useCountries(""); // Get countries for dropdown

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedCountry, setSelectedCountry] = useState<any>(null); // To store the selected country
  const [loading, setLoading] = useState(false);

  // Language change handler
  useEffect(() => {
    if (initValues) {
      setSelectedCountry({
        value: initValues?.country.id, // Set the country based on initial values
        label: countriesData?.data?.find((country:any) => country.id === initValues?.country.id)?.name?.[lang] || '',
      });
    }
  }, [initValues, lang, countriesData]);
  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<CityFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      country_id: selectedCountry?.value, // Use selected country ID
      status: data.status,
    };

    if (initValues) {
      updateCity({ city_id: initValues.id, ...requestBody });
    } else {
      createCity(requestBody);
    }

    setLoading(true);
  };

  if (isCountriesLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<CityFormInput>
      onSubmit={onSubmit}
      validationSchema={cityFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          country_id: initValues?.country.id || 1,
          status: initValues?.status || 'Published',
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors },setValue }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update City' : 'Create City'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          

          {/* Multilingual Name Field */}
          
            <Input
            key={"name.en"}
              label="City Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />
         
            <Input
            key={"name.ar"}
              label="City Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />
         

          {/* Countries Select */}
          <div>
            <label>Countries</label>
            <Select
              options={countriesData?.data?.map((country: any) => ({
                value: country.id,
                label: country.name?.[lang] ?? country.name?.en,
              }))}
              value={selectedCountry} // Bind selected country
              onChange={(selected) => {
                setValue('country_id', selected?.value);
                setSelectedCountry(selected)}} // Update selected country
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              placeholder="Select countries"
            />
            {errors.country_id && (
              <p className="text-sm text-red-500">{errors.country_id.message}</p>
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
              {initValues ? 'Update City' : 'Create City'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
