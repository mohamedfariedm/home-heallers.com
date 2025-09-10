'use client';
import { useEffect, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { AddressFormInput, addressFormSchema } from '@/utils/validators/addresses-form.schema';
import { useCreateAddress, useUpdateAddress } from '@/framework/addresses';
import { useCountries } from '@/framework/countrues';
import { useCities } from '@/framework/cities';
import { useStates } from '@/framework/states';
import Select from 'react-select';
import { Textarea } from 'rizzui';

export default function AddressForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const { data: countriesData } = useCountries("");
  const { data: citiesData } = useCities("");
  const { data: statesData } = useStates("");

  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  useEffect(() => {
    if (initValues) {
      setSelectedCountry({
        value: initValues?.country?.id,
        label: initValues?.country?.name?.en ?? '',
      });
      setSelectedState({
        value: initValues?.state?.id,
        label: initValues?.state?.name?.en ?? '',
      });
      setSelectedCity({
        value: initValues?.city?.id,
        label: initValues?.city?.name?.en ?? '',
      });
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<AddressFormInput> = (data) => {
    const requestBody = {
      ...data,
      country_id: selectedCountry?.value,
      state_id: selectedState?.value,
      city_id: selectedCity?.value,
      is_default: Boolean(data.is_default),
    };

    if (initValues) {
      updateAddress({ id: initValues.id, ...requestBody });
    } else {
      createAddress(requestBody);
    }

    setLoading(true);
  };

  return (
    <Form<AddressFormInput>
      onSubmit={onSubmit}
      validationSchema={addressFormSchema}
      useFormProps={{
        defaultValues: {
    addressable_type: initValues?.addressable_type ?? "App\\Models\\Client", // 👈 default value
          addressable_id: initValues?.addressable_id ?? 1,
          country_id: initValues?.country?.id ?? '',
          state_id: initValues?.state?.id ?? '',
          city_id: initValues?.city?.id ?? '',
          street: initValues?.street ?? '',
          building: initValues?.building ?? '',
          apartment: initValues?.apartment ?? '',
          zip_code: initValues?.zip_code ?? '',
          notes: initValues?.notes ?? '',
          is_default: initValues?.is_default ?? false,
        },
      }}
      className="flex flex-col gap-4 p-6"
    >
      {({ register, setValue, formState: { errors } }) => (
        <>
          <Title as="h4">{initValues ? 'Update Address' : 'Create Address'}</Title>

<div>
  <label className="mb-1 block text-sm font-medium text-gray-700">Addressable Type</label>
  <select
    {...register('addressable_type')}
    className="w-full rounded-md border border-gray-300 p-2"
  >
    <option selected={initValues?false:true}  value="App\\Models\\Client">Client</option>
    <option value="App\\Models\\Doctor">Doctor</option>
  </select>
  {errors.addressable_type && (
    <p className="text-sm text-red-500">{errors.addressable_type.message}</p>
  )}
</div>
          <Input className='hidden'  label="Addressable ID" type="number" {...register('addressable_id')} error={errors.addressable_id?.message} />

          {/* Country Dropdown */}
          <div>
            <label>Country</label>
            <Select
              options={countriesData?.data?.map((c: any) => ({ value: c.id, label: c.name.en }))}
              value={selectedCountry}
              onChange={(selected) => {
                setSelectedCountry(selected);
                setValue('country_id', selected?.value);
              }}
              placeholder="Select Country"
            />
            {errors.country_id && <p className="text-sm text-red-500">{errors.country_id.message}</p>}
          </div>

          {/* State Dropdown */}
          <div>
            <label>State</label>
            <Select
              options={statesData?.data?.map((s: any) => ({ value: s.id, label: s.name.en }))}
              value={selectedState}
              onChange={(selected) => {
                setSelectedState(selected);
                setValue('state_id', selected?.value);
              }}
              placeholder="Select State"
            />
            {errors.state_id && <p className="text-sm text-red-500">{errors.state_id.message}</p>}
          </div>

          {/* City Dropdown */}
          <div>
            <label>City</label>
            <Select
              options={citiesData?.data?.map((s: any) => ({ value: s.id, label: s.name.en }))}
              value={selectedCity}
              onChange={(selected) => {
                setSelectedCity(selected);
                setValue('city_id', selected?.value);
              }}
              placeholder="Select City"
            />
            {errors.city_id && <p className="text-sm text-red-500">{errors.city_id.message}</p>}
          </div>

          {/* Address Fields */}
          <Input label="Street" {...register('street')} error={errors.street?.message} />
          <Input label="Building" {...register('building')} error={errors.building?.message} />
          <Input label="Apartment" {...register('apartment')} error={errors.apartment?.message} />
          <Input label="ZIP Code" {...register('zip_code')} error={errors.zip_code?.message} />
          <Textarea label="Notes" {...register('notes')} error={errors.notes?.message} />
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" {...register('is_default')} />
            Default Address
          </label>

          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? 'Update' : 'Create'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
