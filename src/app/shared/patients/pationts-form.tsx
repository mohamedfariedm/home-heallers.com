import React, { useState } from 'react';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import {
  PiUser,
  PiIdentificationCard,
  PiMapPin,
  PiXBold,
} from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Password, ActionIcon } from 'rizzui';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useModal } from '../modal-views/use-modal';
import { useCreatePatients, useUpdatePatients } from '@/framework/patients';
import {
  PationtsFormInput,
  pationtFormSchema,
} from '@/utils/validators/pationts-form-schema';
import { useNationality } from '@/framework/nationality';
import { useCountries } from '@/framework/countrues';
import { useCities } from '@/framework/cities';
import { routes } from '@/config/routes';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

type PatientTabId = 'account' | 'personal' | 'insurance';

const PATIENT_TABS: {
  id: PatientTabId;
  label: string;
  icon: typeof PiUser;
}[] = [
  { id: 'account', label: 'Account', icon: PiUser },
  { id: 'personal', label: 'Personal', icon: PiIdentificationCard },
  { id: 'insurance', label: 'Insurance & location', icon: PiMapPin },
];

const ACCOUNT_ERROR_KEYS = ['name', 'email', 'password', 'mobile', 'code'];
const PERSONAL_ERROR_KEYS = [
  'date_of_birth',
  'gender',
  'blood_group',
  'languages_spoken',
  'national_id',
  'nickname',
];
const INSURANCE_ERROR_KEYS = [
  'insurance_id',
  'insurance_company',
  'nationality_id',
  'country_id',
  'city_id',
];

function patientTabHasErrors(
  tabId: PatientTabId,
  errors: FieldErrors<PationtsFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'account':
      return has(ACCOUNT_ERROR_KEYS);
    case 'personal':
      return has(PERSONAL_ERROR_KEYS);
    case 'insurance':
      return has(INSURANCE_ERROR_KEYS);
    default:
      return false;
  }
}

export default function CreateOrUpdatePationts({
  initValues,
}: {
  initValues?: any;
}) {
  const { mutate: createSupport, isPending: isCreating } = useCreatePatients();
  const { mutate: updateSupport, isPending: isUpdating } = useUpdatePatients();
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [activeTab, setActiveTab] = useState(0);
  const [duplicatePatientId, setDuplicatePatientId] = useState<number | null>(
    null
  );
  const [duplicateMatch, setDuplicateMatch] = useState<string | null>(null);

  React.useEffect(() => {
    setLang('ar');
  }, [initValues]);

  const { data: nationalities, isLoading } = useNationality('');
  const { data: countries, isLoading: isLoadingCountries } = useCountries('');
  const { data: cities, isLoading: isLoadingCities } = useCities('');

  const { closeModal } = useModal();

  const handlePatientError = (error: any) => {
    const data = error?.response?.data;
    const existingId = data?.existing_patient_id;
    if (existingId) {
      setDuplicatePatientId(Number(existingId));
      setDuplicateMatch(data?.match || 'national_id');
      toast.error(
        data?.message || 'A patient with this National ID already exists.'
      );
      return;
    }
    toast.error(error?.message || 'Failed to save patient');
  };

  const onSubmit: SubmitHandler<PationtsFormInput> = (data) => {
    setDuplicatePatientId(null);
    setDuplicateMatch(null);
    const requestBody = {
      name: data.name,
      email: data.email || null,
      password: data.password || undefined,
      mobile: data.mobile,
      code: data.code || undefined,
      date_of_birth: data.date_of_birth,
      blood_group: data.blood_group || undefined,
      languages_spoken: data.languages_spoken,
      national_id: data.national_id?.trim() || null,
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
          onError: handlePatientError,
        }
      );
    } else {
      createSupport(requestBody, {
        onSuccess: () => {
          closeModal();
        },
        onError: handlePatientError,
      });
    }
  };

  const onInvalid = (formErrors: FieldErrors<PationtsFormInput>) => {
    const tabIndex = PATIENT_TABS.findIndex((tab) =>
      patientTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(PATIENT_TABS.length - 1, index)));
  };

  return (
    <Form<PationtsFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={pationtFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || initValues?.name?.ar || '',
            ar: initValues?.name?.en || initValues?.name?.ar || '',
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
          nationality_id: initValues?.nationality?.id || '',
          country_id: initValues?.country?.id || '',
          city_id: initValues?.city?.id || '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, setValue }) => {
        console.log('Form Errors:', errors);

        const tabsWithErrors: ModalFormTabItem[] = PATIENT_TABS.map((tab) => ({
          ...tab,
          hasError: patientTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiUser className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update patient' : 'Create patient'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </div>

            {duplicatePatientId != null && (
              <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                <p className="font-medium">
                  A patient with this National ID already exists
                  {duplicateMatch === 'mobile_and_national_id'
                    ? ' (same mobile too)'
                    : ''}
                  .
                </p>
                <Link
                  href={routes.patients.detail(duplicatePatientId)}
                  className="mt-2 inline-block font-semibold text-[#143087] underline"
                  onClick={() => closeModal()}
                >
                  Open / use existing patient #{duplicatePatientId}
                </Link>
              </div>
            )}

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {/* ── Account ── */}
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Account details"
                    description="Login and contact information"
                  >
                    <div className="sm:col-span-2">
                      <Input
                        key="name.unified"
                        label="Name"
                        placeholder="Enter name"
                        {...register('name.en', {
                          onChange: (e) =>
                            setValue('name.ar', e.target.value, {
                              shouldValidate: true,
                            }),
                        })}
                        error={
                          errors.name?.en?.message || errors.name?.ar?.message
                        }
                      />
                    </div>
                    <Input
                      label="Email (Optional)"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                      autoComplete="off"
                    />
                    <Password
                      label="Password (Optional)"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <Input
                      label="Mobile"
                      {...register('mobile')}
                      error={errors.mobile?.message}
                    />
                    <Input
                      label="Country Code (Optional)"
                      {...register('code')}
                      error={errors.code?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              {/* ── Personal ── */}
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Personal information"
                    description="Identity and demographic details"
                  >
                    <Input
                      label="Date of Birth"
                      type="date"
                      {...register('date_of_birth')}
                      error={errors.date_of_birth?.message}
                    />
                    <div>
                      <label className="text-sm text-gray-700">Gender</label>
                      <select
                        {...register('gender')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="">Select Gender</option>
                        {genders.map((gender) => (
                          <option key={gender.id} value={gender.id}>
                            {gender.name}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="text-sm text-red-500">
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">
                        Blood Group (Optional)
                      </label>
                      <select
                        {...register('blood_group')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      {errors.blood_group && (
                        <p className="text-sm text-red-500">
                          {errors.blood_group.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Language</label>
                      <select
                        {...register('languages_spoken')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="">Select Language</option>
                        {languages.map((langOption) => (
                          <option key={langOption.id} value={langOption.id}>
                            {langOption.name}
                          </option>
                        ))}
                      </select>
                      {errors.languages_spoken && (
                        <p className="text-sm text-red-500">
                          {errors.languages_spoken.message}
                        </p>
                      )}
                    </div>
                    <Input
                      label="National ID (optional)"
                      {...register('national_id')}
                      error={errors.national_id?.message}
                      placeholder="Leave empty if unknown — do not invent values"
                    />
                    <Input
                      label="Nickname (Optional)"
                      {...register('nickname')}
                      error={errors.nickname?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              {/* ── Insurance & location ── */}
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Insurance & location"
                    description="Coverage and location records"
                  >
                    <Input
                      label="Insurance ID (Optional)"
                      {...register('insurance_id')}
                      error={errors.insurance_id?.message}
                    />
                    <Input
                      label="Insurance Company (Optional)"
                      {...register('insurance_company')}
                      error={errors.insurance_company?.message}
                    />
                    <div>
                      <label className="text-sm text-gray-700">
                        Nationality (Optional)
                      </label>
                      <select
                        {...register('nationality_id')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="">Select Nationality</option>
                        {nationalities?.data?.map((nationality: any) => (
                          <option key={nationality.id} value={nationality.id}>
                            {nationality.name.en}
                          </option>
                        ))}
                      </select>
                      {errors.nationality_id && (
                        <p className="text-sm text-red-500">
                          {errors.nationality_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">
                        Country (Optional)
                      </label>
                      <select
                        {...register('country_id')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="">Select Country</option>
                        {countries?.data?.map((country: any) => (
                          <option key={country.id} value={country.id}>
                            {country.name.en}
                          </option>
                        ))}
                      </select>
                      {errors.country_id && (
                        <p className="text-sm text-red-500">
                          {errors.country_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">
                        City (Optional)
                      </label>
                      <select
                        {...register('city_id')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="">Select City</option>
                        {cities?.data?.map((city: any) => (
                          <option key={city.id} value={city.id}>
                            {city.name.en}
                          </option>
                        ))}
                      </select>
                      {errors.city_id && (
                        <p className="text-sm text-red-500">
                          {errors.city_id.message}
                        </p>
                      )}
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={PATIENT_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isCreating || isUpdating}
              disabled={isCreating || isUpdating}
              submitLabel={initValues ? 'Update patient' : 'Create patient'}
            />
          </>
        );
      }}
    </Form>
  );
}
