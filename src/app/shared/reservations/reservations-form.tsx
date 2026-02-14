'use client';

import React, { useEffect, useRef } from 'react';
import {
  useForm,
  type SubmitHandler,
  Controller,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PiXBold } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from 'rizzui';
import { useModal } from '../modal-views/use-modal';
import {
  useCreateReservation,
  useUpdateReservation,
} from '@/framework/reservations';
import { useServices } from '@/framework/services';
import { useDoctors } from '@/framework/doctors';
import { usePatients } from '@/framework/patients';
import {
  type ReservationFormInput,
  reservationFormSchema,
} from '@/utils/validators/reservation-form-schema';
import Spinner from '@/components/ui/spinner';
import { useCategories } from '@/framework/categories';
import { usePermissions } from '@/context/PermissionsContext';
import { useCenters } from '@/framework/centers';

const timePeriods = [
  { id: 'morning', name: 'Morning' },
  { id: 'afternoon', name: 'Afternoon' },
  { id: 'evening', name: 'Evening' },
];

const statusOptions = [
  { value: '1', en: 'Reviewing', ar: 'قيد المراجعة' },
  { value: '2', en: 'WaitConfirm', ar: 'في انتظار التأكيد' },
  { value: '3', en: 'Confirmed', ar: 'تم التأكيد' },
  { value: '4', en: 'Canceled', ar: 'تم الإلغاء' },
  { value: '5', en: 'Completed', ar: 'مكتمل' },
  { value: '6', en: 'Failed', ar: 'فشل' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function CreateOrUpdateReservation({
  initValues,
  leadData,
  onSuccess,
}: {
  initValues?: any;
  leadData?: any;
  onSuccess?: () => void;
}) {
  const { permissions } = usePermissions();

  const { mutate: createReservation, isPending: isCreating } =
    useCreateReservation();
  const { mutate: updateReservation, isPending: isUpdating } =
    useUpdateReservation();

  const { data: patients, isLoading: isPatientsLoading } = usePatients('');
  const { data: services, isLoading: isServicesLoading } = useServices('');
  const { data: doctors, isLoading: isDoctorsLoading } = useDoctors('');
  const { data: categories, isLoading: isCategoriesLoading } =
    useCategories('');
  const { data: centers, isLoading: isCentersLoading } = useCenters('');

  const { closeModal } = useModal();

  const guest = initValues?.guest_info ?? {};
  const isGuestReservation =
    initValues?.is_guest === 1 || !!initValues?.guest_info;
  const isExistingPatient = !!initValues?.patient?.id;
  
  // Use lead data to pre-populate fields when creating a new reservation
  const hasExistingReservations = leadData?.reservations && Array.isArray(leadData.reservations) && leadData.reservations.length > 0;
  const leadPatientId = leadData?.patient_id || leadData?.reservations?.[0]?.patient?.id;
  const shouldUseLeadData = !initValues && leadData;
  const feesTypeOptions = [
    { value: 'صفریة', label: 'صفریة' },
    { value: 'معافاة', label: 'معافاة' },
    { value: '15%', label: '15%' },
  ];
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    resetField,
    watch,
    getValues,
  } = useForm<ReservationFormInput>({
    resolver: zodResolver(reservationFormSchema),

    defaultValues: {
      reservation_type: (isExistingPatient || hasExistingReservations) ? 'existing' : 'guest',
      paid: initValues?.paid !== undefined && initValues?.paid !== null ? Number(initValues.paid) : 0,
      source_campaign: initValues?.source_campaign || leadData?.source_campaign || '',
      center_id: initValues?.center_id?.toString() || '',
      // 🧩 base IDs
      patient_id: initValues?.patient?.id?.toString() || leadPatientId?.toString() || '',
      doctor_id: initValues?.doctor?.id?.toString() || '',
      service_id: initValues?.service?.id?.toString() || '',
      category_id: initValues?.category?.id?.toString() || '',
      sessions_count: initValues?.sessions_count?.toString() || '1',

      // 🧩 numbers and billing
      session_price: initValues?.sub_total && initValues?.sessions_count
        ? (Number(initValues.sub_total) / Number(initValues.sessions_count)).toString()
        : '',
      sub_total: initValues?.sub_total?.toString() || '',
      fees: initValues?.fees || 0, // now fees is string type
      fees_type: initValues?.fees_type || 'صفریة',
      remaining_payment: initValues?.remaining_payment?.toString() || '',
      total_amount: initValues?.total_amount?.toString() || '',
      transaction_reference:
        initValues?.transaction_reference &&
        ['تحويل بنكي', 'تيلر', 'كاش'].includes(initValues.transaction_reference)
          ? initValues.transaction_reference
          : undefined,

      // 🧩 common fields
      status: initValues?.status?.toString() || '2',
      pain_location: initValues?.pain_location || '',
      notes: initValues?.notes || leadData?.notes || '',
      address_city:
        initValues?.address?.city?.en ||
        initValues?.guest_info?.city ||
        initValues?.address_city ||
        leadData?.address_1 ||
        '',
      address_state:
        initValues?.address?.state?.en ||
        initValues?.guest_info?.state ||
        initValues?.address_state ||
        '',
      address_link: initValues?.address?.link || initValues?.address_link || '',

      // 🧩 Lead-related fields
      lead_id: initValues?.lead_id || (shouldUseLeadData ? leadData?.id : undefined),
      name: initValues?.name || (shouldUseLeadData ? leadData?.name : undefined),

      patient_name:
        guest?.name ||
        initValues?.patient?.name?.en ||
        initValues?.patient?.name?.ar ||
        (shouldUseLeadData ? leadData?.name : ''),
      patient_email: guest?.email || initValues?.patient?.email || '',
      patient_national_id:
        guest?.national_id || initValues?.patient?.national_id || '',
      patient_gender: guest?.gender || initValues?.patient?.gender || (shouldUseLeadData ? leadData?.gender || 'male' : 'male'),
      patient_country:
        guest?.country ||
        guest?.nationality ||
        initValues?.patient?.country?.name?.en?.en ||
        '',
      patient_mobile: guest?.mobile || initValues?.patient?.mobile || (shouldUseLeadData ? leadData?.mobile_phone || leadData?.booking_phone_number : ''),
      patient_city:
        guest?.city || initValues?.patient?.city?.name?.en?.en || '',
      patient_state: guest?.state || initValues?.patient?.state?.en || '',
      patient_date_of_birth:
        guest?.date_of_birth || initValues?.patient?.date_of_birth || '',

      // 🧩 nested dates handling - improved to handle both data structures
      dates: (initValues?.dates && Array.isArray(initValues.dates) && initValues.dates.length > 0)
        ? initValues.dates.map((d: any) => ({
            date: d?.date && typeof d.date === 'string' ? d.date.split('T')[0] : '',
            time: d?.time && typeof d.time === 'string'
              ? d.time.split('T')[1]?.substring(0, 5) || ''
              : (d?.end_time && typeof d.end_time === 'string' ? d.end_time.split('T')[1]?.substring(0, 5) : '') || '',
            time_period: d?.time_period || 'morning',
            doctor_id: d?.doctor?.id?.toString() || '',
            status: d?.status?.toString() || '1',
          }))
        : [
        {
          date: '',
          time: '',
          time_period: 'morning',
          doctor_id: '',
          status: '1',
        },
      ],
    },
  });

  const reservationType = useWatch({ control, name: 'reservation_type' });
  const watchDates = watch('dates');
  const watchSessionsCount = useWatch({ control, name: 'sessions_count' });
  const watchDoctorId = useWatch({ control, name: 'doctor_id' });
  const watchSessionPrice = useWatch({ control, name: 'session_price' });
  const watchSubTotal = useWatch({ control, name: 'sub_total' });
  const watchFeesType = useWatch({ control, name: 'fees_type' });
  const watchTotalAmount = useWatch({ control, name: 'total_amount' });
  const watchReservationStatus = useWatch({ control, name: 'status' });
  const watchSourceCampaign = useWatch({ control, name: 'source_campaign' });

  const prevStatusRef = useRef<string | undefined>();
  useEffect(() => {
    if (
      watchReservationStatus &&
      watchReservationStatus !== prevStatusRef.current
    ) {
      prevStatusRef.current = watchReservationStatus;
      const currentDates = getValues('dates') || [];
      if (currentDates.length > 0) {
        const updatedDates = currentDates.map((date: any) => ({
          ...date,
          status: watchReservationStatus,
        }));
        setValue('dates', updatedDates, { shouldValidate: false });
      }
    }
  }, [watchReservationStatus, setValue, getValues]);

  const lang: 'en' | 'ar' = 'en';

  // Reset irrelevant fields on switch
  useEffect(() => {
    if (reservationType === 'guest') {
      resetField('patient_id', { defaultValue: '' });
    } else if (reservationType === 'existing') {
      resetField('patient_name', { defaultValue: '' });
      resetField('patient_email', { defaultValue: '' });
      resetField('patient_national_id', { defaultValue: '' });
      resetField('patient_gender', { defaultValue: 'male' });
      resetField('patient_country', { defaultValue: '' });
      resetField('patient_mobile', { defaultValue: '' });
      resetField('patient_city', { defaultValue: '' });
      resetField('patient_state', { defaultValue: '' });
      resetField('patient_date_of_birth', { defaultValue: '' });
    }
  }, [reservationType, resetField]);

  // 🔁 sync number of date blocks
  const prevSessionsCountRef = useRef<string | undefined>();
  useEffect(() => {
    const sessionCount = Number(watchSessionsCount) || 1;
    if (watchSessionsCount !== prevSessionsCountRef.current) {
      prevSessionsCountRef.current = watchSessionsCount;
      const currentDates = getValues('dates') || [];
      const newDates = Array.from({ length: sessionCount }, (_, i) => ({
        date: currentDates[i]?.date || '',
        time: currentDates[i]?.time || '',
        time_period: currentDates[i]?.time_period || 'morning',
        doctor_id: currentDates[i]?.doctor_id || '',
        status: currentDates[i]?.status || '1',
      }));
      setValue('dates', newDates, { shouldValidate: true });
    }
  }, [watchSessionsCount, setValue, getValues]);

  const prevDoctorIdRef = useRef<string | undefined>();
  useEffect(() => {
    if (watchDoctorId && watchDoctorId !== prevDoctorIdRef.current) {
      prevDoctorIdRef.current = watchDoctorId;
      const currentDates = getValues('dates') || [];
      if (currentDates.length > 0) {
        const updatedDates = currentDates.map((date: any) => ({
          ...date,
          doctor_id: watchDoctorId,
        }));
        setValue('dates', updatedDates, { shouldValidate: false });
      }
    }
  }, [watchDoctorId, setValue, getValues]);

  // Clear center_id when source_campaign changes away from "center"
  const prevSourceCampaignRef = useRef<string | undefined>();
  useEffect(() => {
    if (watchSourceCampaign !== prevSourceCampaignRef.current) {
      prevSourceCampaignRef.current = watchSourceCampaign;
      if (watchSourceCampaign !== 'center') {
        setValue('center_id', '', { shouldValidate: false });
      }
    }
  }, [watchSourceCampaign, setValue]);

  // Calculate sub_total from session_price * sessions_count
  useEffect(() => {
    const sessionPrice = Number(watchSessionPrice) || 0;
    const sessions = Number(watchSessionsCount) || 1;

    if (sessionPrice > 0 && sessions > 0) {
      const calculatedSubTotal = sessionPrice * sessions;
      setValue('sub_total', calculatedSubTotal.toString(), { shouldValidate: false });
    }
  }, [watchSessionPrice, watchSessionsCount, setValue]);

  useEffect(() => {
    const sub = Number(watchSubTotal) || 0;

    let calculatedFees = 0;

    if (watchFeesType === 'صفریة' || watchFeesType === 'معافاة') {
      calculatedFees = 0;
    } else if (watchFeesType === '15%') {
      calculatedFees = sub * 0.15;
    }

    const total = sub + calculatedFees;

    // احفظ قيمة الفيز الفعلية المحسوبة
    setValue('fees', calculatedFees.toString(), { shouldValidate: false });

    // احفظ التوتال
    setValue('total_amount', total.toString(), { shouldValidate: false });
  }, [watchFeesType, watchSubTotal, setValue]);

  useEffect(() => {
    if (patients?.data?.length && initValues?.patient?.id) {
      setValue('patient_id', initValues.patient.id.toString());
    }
  }, [patients?.data, initValues?.patient?.id, setValue]);

  const applyStatusToAllDates = (status: string) => {
    if (!watchDates || watchDates.length === 0) return;
    const updatedDates = watchDates.map((date: any) => ({
      ...date,
      status,
    }));
    setValue('dates', updatedDates, { shouldValidate: false });
  };

  const applyDoctorToAllDates = (doctorId: string) => {
    if (!watchDates || watchDates.length === 0) return;
    const updatedDates = watchDates.map((date: any) => ({
      ...date,
      doctor_id: doctorId,
    }));
    setValue('dates', updatedDates, { shouldValidate: false });
  };

  const onSubmit: SubmitHandler<ReservationFormInput> = (data) => {
    const requestBody = {
      service_id: data.service_id ? Number(data.service_id) : undefined,
      category_id: data.category_id ? Number(data.category_id) : undefined,
      doctor_id: data.doctor_id ? Number(data.doctor_id) : undefined,
      sessions_count: data.sessions_count
        ? Number(data.sessions_count)
        : undefined,
      session_price: data.session_price ? Number(data.session_price) : undefined,
      sub_total: data.sub_total ? Number(data.sub_total) : undefined,
      fees: data.fees ? Number(data.fees) : undefined,
      fees_type: data.fees_type,
      remaining_payment: data.remaining_payment
        ? Number(data.remaining_payment)
        : undefined,
      total_amount: data.total_amount ? Number(data.total_amount) : undefined,
      transaction_reference: data.transaction_reference,
      status: data.status ? Number(data.status) : undefined,
      pain_location: data.pain_location,
      notes: data.notes,
      address_city: data.address_city,
      address_state: data.address_state,
      address_link: data.address_link,
      paid: data.paid !== undefined && data.paid !== null ? Number(data.paid) : 0,
      source_campaign: data.source_campaign,
      center_id: data.center_id ? Number(data.center_id) : undefined,
      dates: (data.dates && Array.isArray(data.dates) && data.dates.length > 0)
        ? data.dates.map((date: any) => ({
            date: date?.date || '',
            time: date?.time || '',
            time_period: date?.time_period || 'morning',
            doctor_id: date?.doctor_id ? Number(date.doctor_id) : undefined,
            status: date?.status ? Number(date.status) : undefined,
          }))
        : [],

      // Include lead_id and name if available
      ...(data.lead_id ? { lead_id: Number(data.lead_id) } : {}),
      ...(data.name ? { name: data.name } : {}),

      ...(data.reservation_type === 'guest'
        ? {
            patient_name: data.patient_name,
            patient_email: data.patient_email,
            patient_national_id: data.patient_national_id,
            patient_gender: data.patient_gender,
            patient_country: data.patient_country,
            patient_mobile: data.patient_mobile,
            patient_city: data.address_city,
            patient_state: data.address_state,
            patient_date_of_birth: data.patient_date_of_birth,
          }
        : {
            patient_id: data.patient_id ? Number(data.patient_id) : undefined,
          }),
    };

    try {
      if (initValues?.id) {
        updateReservation(
          { reservation_id: initValues.id, ...requestBody },
          {
            onSuccess: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
            onError: (error) => {
              console.error('Error updating reservation:', error);
            },
          }
        );
      } else {
        createReservation(requestBody, {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            }
          },
          onError: (error) => {
            console.error('Error creating reservation:', error);
          },
        });
      }
    } catch (error) {
      console.error('Error submitting reservation form:', error);
    }
  };

  // ✅ Detect if current user is an invoices assistant
  const isInvoicesAssistant = permissions?.includes('invoices_assistant');

  // ✅ Determine if editing is allowed
  const initialStatus = initValues?.status?.toString();
  const initialDates = initValues?.dates || [];

  const canEdit =
    !isInvoicesAssistant ||
    initialStatus === '4' ||
    initialDates.some((d: any) => d?.status?.toString() === '4');

  const inputProps = { disabled: !canEdit };

  return isPatientsLoading ||
    isServicesLoading ||
    isDoctorsLoading ||
    isCategoriesLoading ||
    isCentersLoading ? (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  ) : (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-grow flex-col gap-6 overflow-y-auto p-6"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">
          {initValues ? 'Update Reservation' : 'Create Reservation'}
        </h4>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      {/* Reservation Type Radios - Controller ensures immediate updates */}
      {!initValues && !hasExistingReservations && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Reservation Type
          </label>
          <Controller
            name="reservation_type"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="guest"
                    checked={value === 'guest'}
                    onChange={() => onChange('guest')}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Guest Reservation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="existing"
                    checked={value === 'existing'}
                    onChange={() => onChange('existing')}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Existing Patient</span>
                </label>
              </div>
            )}
          />
        </div>
      )}

      {reservationType === 'guest' ? (
        // key forces a remount so the very first toggle always re-renders fresh
        <div key="guest" className="space-y-4 border-l-4 border-blue-500 pl-4">
          <h5 className="text-sm font-semibold">Guest Patient Information</h5>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              {...inputProps}
              placeholder="e.g., أحمد محمد"
              {...register('patient_name')}
              error={errors.patient_name?.message}
            />
            <Input
              label="Patient Email"
              type="email"
              {...inputProps}
              placeholder="e.g., ah1med@example.com"
              {...register('patient_email')}
              error={errors.patient_email?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="National ID"
              {...inputProps}
              placeholder="e.g., 12134567890"
              {...register('patient_national_id')}
              error={errors.patient_national_id?.message}
            />
            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select
                {...inputProps}
                {...register('patient_gender')}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...inputProps}
              label="Mobile"
              placeholder="e.g., 05101234567"
              {...register('patient_mobile')}
              error={errors.patient_mobile?.message}
            />
            <Input
              {...inputProps}
              label="Date of Birth"
              type="date"
              {...register('patient_date_of_birth')}
              error={errors.patient_date_of_birth?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...inputProps}
              label="Country"
              placeholder="e.g., السعودية"
              {...register('patient_country')}
              error={errors.patient_country?.message}
            />
          </div>
        </div>
      ) : (
        <div key="existing">
          <label className="text-sm text-gray-700">
            Select Existing Patient
          </label>
          <select
            {...inputProps}
            {...register('patient_id')}
            className="w-full rounded-lg border border-gray-300 p-2"
            disabled={isPatientsLoading || !canEdit}
          >
            <option value="">
              {isPatientsLoading ? 'Loading patients...' : 'Select Patient'}
            </option>
            {patients?.data?.map((patient: any) => (
              <option key={patient.id} value={String(patient.id)}>
                {patient.name?.en || patient.name?.ar}
              </option>
            ))}
          </select>
          {errors.patient_id && (
            <p className="text-sm text-red-500">{errors.patient_id.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">Service</label>
          <select
            {...register('service_id')}
            className="w-full rounded-lg border border-gray-300 p-2"
            disabled={isServicesLoading || !canEdit}
          >
            <option value="">
              {isServicesLoading ? 'Loading services...' : 'Select Service'}
            </option>
            {services?.data?.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name?.en}
              </option>
            ))}
          </select>
          {errors.service_id && (
            <p className="text-sm text-red-500">{errors.service_id.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-700">Doctor</label>
          <select
            {...register('doctor_id')}
            className="w-full rounded-lg border border-gray-300 p-2"
            disabled={isDoctorsLoading || !canEdit}
          >
            <option value="">
              {isDoctorsLoading ? 'Loading doctors...' : 'Select Doctor'}
            </option>
            {doctors?.data?.map((doctor: any) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name?.en}
              </option>
            ))}
          </select>
          {errors.doctor_id && (
            <p className="text-sm text-red-500">{errors.doctor_id.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-700">Category</label>
        <select
          {...inputProps}
          {...register('category_id')}
          className="w-full rounded-lg border border-gray-300 p-2"
        >
          <option value="">
            {isCategoriesLoading ? 'Loading categories...' : 'Select Category'}
          </option>
          {categories?.data?.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name?.en}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-sm text-red-500">{errors.category_id.message}</p>
        )}
      </div>

      <div className="space-y-4 border-l-4 border-green-500 pl-4">
        <h5 className="text-sm font-semibold">Address Information</h5>
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...inputProps}
            label="City"
            placeholder="e.g., الرياض"
            {...register('address_city')}
            error={errors.address_city?.message}
          />
          <Input
            {...inputProps}
            label="State/Region"
            placeholder="e.g., منطقة الرياض"
            {...register('address_state')}
            error={errors.address_state?.message}
          />
        </div>
        <Input
          {...inputProps}
          label="Address Link (Maps)"
          type="url"
          placeholder="https://maps.google.com/?q=24.7136,46.6753"
          {...register('address_link')}
          error={errors.address_link?.message}
        />
      </div>

      <div className="space-y-4 border-l-4 border-purple-500 pl-4">
        <h5 className="text-sm font-semibold">Billing Information</h5>
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...inputProps}
            label="Sessions Count"
            type="tel"
            {...register('sessions_count')}
            error={errors.sessions_count?.message}
          />
          <Input
            {...inputProps}
            label="Session Price"
            type="tel"
            {...register('session_price')}
            error={errors.session_price?.message}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...inputProps}
            label="Sub Total"
            type="tel"
            {...register('sub_total')}
            error={errors.sub_total?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Fees Type</label>
            <select
              {...inputProps}
              {...register('fees_type')}
              className="w-full rounded-lg border border-gray-300 p-2"
            >
              {feesTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              {...inputProps}
              label="Total Amount"
              type="tel"
              {...register('total_amount')}
              error={errors.total_amount?.message}
            />
            <p className="mt-1 text-xs text-gray-500">
              Auto-calculated from Sub Total + Fees (editable)
            </p>
          </div>
        </div>

        <Input
          {...inputProps}
          label="Remaining Payment"
          type="tel"
          {...register('remaining_payment')}
          error={errors.remaining_payment?.message}
        />

        <div>
          <label className="text-sm text-gray-700">Transaction Reference</label>
          <select
            {...inputProps}
            {...register('transaction_reference')}
            className="w-full rounded-lg border border-gray-300 p-2"
          >
            <option value="">Select Transaction Type</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
            <option value="تيلر">تيلر</option>
            <option value="كاش">كاش</option>
          </select>
          {errors.transaction_reference && (
            <p className="text-sm text-red-500">
              {errors.transaction_reference.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Source Campaign
            </label>
            <select
              {...inputProps}
              {...register('source_campaign')}
              className="w-full rounded-lg border border-gray-300 p-2"
            >
              <option value="">Select Source</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="snapchat">Snapchat</option>
              <option value="telegram">Telegram</option>
              <option value="twitter">Twitter</option>
              <option value="tiktok">TikTok</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Call</option>
              <option value="youtube">YouTube</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="center">Center</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {watchSourceCampaign === 'center' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Center <span className="text-red-500">*</span>
              </label>
              <select
                {...inputProps}
                {...register('center_id')}
                className="w-full rounded-lg border border-gray-300 p-2"
                disabled={isCentersLoading || !canEdit}
              >
                <option value="">
                  {isCentersLoading ? 'Loading centers...' : 'Select Center'}
                </option>
                {centers?.data?.map((center: any) => (
                  <option key={center.id} value={String(center.id)}>
                    {center.name?.en || center.name?.ar || `Center #${center.id}`}
                  </option>
                ))}
              </select>
              {errors.center_id && (
                <p className="mt-1 text-sm text-red-500">{errors.center_id.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Paid Status
            </label>
            <Controller
              name="paid"
              control={control}
              render={({ field: { value, onChange } }) => {
                // Safely convert value to number, default to 0 if undefined/null
                const paidValue = value !== undefined && value !== null ? Number(value) : 0;
                
                return (
                  <select
                    value={paidValue}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      onChange(newValue);
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value={0}>Unpaid</option>
                    <option value={1}>Paid</option>
                  </select>
                );
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">Status</label>
          <select
            {...inputProps}
            {...register('status')}
            className="w-full rounded-lg border border-gray-300 p-2"
          >
            <option value="">Select Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.en}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>
        <Input
          {...inputProps}
          label="Pain Location"
          placeholder="e.g., ألم في الرقبة"
          {...register('pain_location')}
          error={errors.pain_location?.message}
        />
      </div>

      <Input
        {...inputProps}
        label="Notes"
        placeholder="e.g., حجز ضيف جديد"
        {...register('notes')}
        error={errors.notes?.message}
      />

      <div className="space-y-4 border-l-4 border-orange-500 pl-4">
        <h5 className="text-sm font-semibold">Reservation Dates</h5>

        {watchDates?.map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...inputProps}
                label="Date"
                type="date"
                {...register(`dates.${index}.date` as const)}
                error={errors.dates?.[index]?.date?.message}
              />
              <Input
                {...inputProps}
                label="Time"
                type="time"
                {...register(`dates.${index}.time` as const)}
                error={errors.dates?.[index]?.time?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Time Period</label>
                <select
                  {...inputProps}
                  {...register(`dates.${index}.time_period` as const)}
                  className="w-full rounded-lg border border-gray-300 p-2"
                >
                  {timePeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Doctor</label>
                <select
                  {...inputProps}
                  {...register(`dates.${index}.doctor_id` as const)}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  disabled={isDoctorsLoading}
                >
                  <option value="">
                    {isDoctorsLoading ? 'Loading...' : 'Select Doctor'}
                  </option>
                  {doctors?.data?.map((doctor: any) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name?.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Status</label>
              <select
                {...inputProps}
                {...register(`dates.${index}.status` as const)}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {watchDates && watchDates.length > 1 && (
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              {...inputProps}
              size="sm"
              onClick={() => {
                const currentStatus = watch(`dates.0.status`);
                if (currentStatus) {
                  applyStatusToAllDates(currentStatus);
                }
              }}
            >
              Apply First Date Status to All
            </Button>
            <Button
              type="button"
              {...inputProps}
              variant="outline"
              size="sm"
              onClick={() => {
                const currentDoctor = watch(`dates.0.doctor_id`);
                if (currentDoctor) {
                  applyDoctorToAllDates(currentDoctor);
                }
              }}
            >
              Apply First Date Doctor to All
            </Button>
          </div>
        )}

        {errors.dates && typeof errors.dates?.message === 'string' && (
          <p className="text-sm text-red-500">{errors.dates.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || isUpdating || !canEdit}>
          {initValues ? 'Update Reservation' : 'Create Reservation'}
        </Button>
      </div>
    </form>
  );
}
