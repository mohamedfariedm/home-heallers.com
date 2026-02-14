import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { ActionIcon, Checkbox, Password } from 'rizzui';
import { useModal } from '../modal-views/use-modal';
import { useCreatePatients, useUpdatePatients } from '@/framework/patients';
import { PationtsFormInput ,pationtFormSchema} from '@/utils/validators/pationts-form-schema';
import { useNationality } from '@/framework/nationality';
import { useCountries } from '@/framework/countrues';
import { useCities } from '@/framework/cities';

const bloodGroups = [
  { id: 'A+', name: 'A+' },
  { id: 'A-', name: 'A-' },
  { id: 'B+', name: 'B+' },
  { id: 'B-', name: 'B-' },
  { id: 'AB+', name: 'AB+' },
  { id: 'AB-', name: 'AB-' },
  { id: 'O+', name: 'O+' },
  { id: 'O-', name: 'O-' },
];

const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

const languages = [
  { id: 'en', name: 'English' },
  { id: 'ar', name: 'Arabic' },
];


export default function CreateOrUpdatePationts({ initValues }: { initValues?: any }) {
  const { mutate: createSupport, isPending: isCreating } = useCreatePatients();
  const { mutate: updateSupport, isPending: isUpdating } = useUpdatePatients();
    const [lang, setLang] = useState<"en" | "ar">("ar")

  React.useEffect(() => {
    setLang("ar");
  }, [initValues]);

  
      const { data: nationalities, isLoading } = useNationality("");   
      const { data: countries, isLoading: isLoadingCountries } = useCountries("");   
      const { data: cities, isLoading: isLoadingCities } = useCities("");   
  

    const { closeModal } = useModal()
  

  const onSubmit: SubmitHandler<PationtsFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      email: data.email || null,
      password: data.password || undefined,
      mobile: data.mobile,
      code: data.code || undefined,
      date_of_birth: data.date_of_birth,
      blood_group: data.blood_group || undefined,
      languages_spoken: data.languages_spoken,
      national_id: data.national_id,
      nickname: data.nickname || undefined,
      gender: data.gender,
      insurance_id: data.insurance_id || undefined,
      insurance_company: data.insurance_company || undefined,
      nationality_id: Number(data.nationality_id) || undefined,
      country_id: Number(data.country_id) || undefined,
      city_id: Number(data.city_id) || undefined,
    };

    if (initValues) {
      updateSupport(
        { lead_id: initValues.id, ...requestBody },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    } else {
      createSupport(requestBody, {
        onSuccess: () => {
          closeModal();
        },
      });
    }

  };

  return (
    <Form<PationtsFormInput>
      onSubmit={onSubmit}
      validationSchema={pationtFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || "",
            ar: initValues?.name?.ar || "",
          },
          email: initValues?.email || '',
          password: initValues?.password || '',
          mobile: initValues?.mobile || '',
          code: initValues?.code || '',
          date_of_birth: initValues?.date_of_birth || '',
          blood_group: initValues?.blood_group || '',
          languages_spoken: initValues?.languages_spoken || '',
          national_id: initValues?.national_id || '',
          nickname: initValues?.nickname || '',
          gender: initValues?.gender || '',
          insurance_id: initValues?.insurance_id || '',
          insurance_company: initValues?.insurance_company || '',
          nationality_id: initValues?.nationality?.id|| '',
          country_id: initValues?.country?.id|| '',
          city_id: initValues?.city?.id|| '',
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors } }) => {
        console.log("Form Errors:", errors);
        
        return(
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update patient' : 'Create patient'}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>
          <div className="flex flex-wrap px-1 gap-3">
            <Checkbox
              key={0}
              label={"English"}
              checked={lang === "en"}
              onChange={() => setLang("en")}
            />
            <Checkbox
              key={1}
              label={"Arabic"}
              checked={lang === "ar"}
              onChange={() => setLang("ar")}
            />
          </div>

          {lang === "en" ? (
            <Input
            key={"name.en"}
              label="Name (English)"
              placeholder="Enter English name"
              {...register("name.en")}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"name.ar"}
              label="Name (Arabic)"
              placeholder="أدخل الاسم بالعربية"
              {...register("name.ar")}
              error={errors.name?.ar?.message}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email (Optional)" type="email" {...register('email')} error={errors.email?.message} autoComplete="off" />
            <Password label="Password (Optional)"  {...register('password')} error={errors.password?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Mobile" {...register('mobile')} error={errors.mobile?.message} />
            <Input label="Country Code (Optional)" {...register('code')} error={errors.code?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" {...register('date_of_birth')} error={errors.date_of_birth?.message} />
            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select {...register('gender')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Gender</option>
                {genders.map(gender => (
                  <option key={gender.id} value={gender.id}>{gender.name}</option>
                ))}
              </select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Blood Group (Optional)</label>
              <select {...register('blood_group')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              {errors.blood_group && <p className="text-sm text-red-500">{errors.blood_group.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700">Language</label>
              <select {...register('languages_spoken')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Language</option>
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
              {errors.languages_spoken && <p className="text-sm text-red-500">{errors.languages_spoken.message}</p>}
            </div>
          </div>

          <Input label="National ID" {...register('national_id')} error={errors.national_id?.message} />
          <Input label="Nickname (Optional)" {...register('nickname')} error={errors.nickname?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Insurance ID (Optional)" {...register('insurance_id')} error={errors.insurance_id?.message} />
            <Input label="Insurance Company (Optional)" {...register('insurance_company')} error={errors.insurance_company?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Nationality (Optional)</label>
              <select {...register('nationality_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Nationality</option>
                {nationalities?.data?.map((nationality:any) => (
                  <option key={nationality.id} value={nationality.id}>{nationality.name.en}</option>
                ))}
              </select>
              {errors.nationality_id && <p className="text-sm text-red-500">{errors.nationality_id.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700">Country (Optional)</label>
              <select {...register('country_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Country</option>
                {countries?.data?.map((country:any) => (
                  <option key={country.id} value={country.id}>{country.name.en}</option>
                ))}
              </select>
              {errors.country_id && <p className="text-sm text-red-500">{errors.country_id.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700">City (Optional)</label>
              <select {...register('city_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select City</option>
                {cities?.data?.map((city:any) => (
                  <option key={city.id} value={city.id}>{city.name.en}</option>
                ))}
              </select>
              {errors.city_id && <p className="text-sm text-red-500">{errors.city_id.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {initValues ? 'Update patient' : 'Create patient'}
            </Button>
          </div>
        </>
      )}
      }
    </Form>
  );
}