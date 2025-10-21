import React, { useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { ActionIcon, Checkbox } from 'rizzui';
import { useModal } from '../modal-views/use-modal';
import { useCreateReservation, useUpdateReservation } from '@/framework/reservations';
import { useServices } from '@/framework/services';
import { useDoctors } from '@/framework/doctors';
import { usePatients } from '@/framework/patients';
import { ReservationFormInput, reservationFormSchema } from '@/utils/validators/reservation-form-schema';
import { useCategories } from '@/framework/categories';
import { useAddresses } from '@/framework/addresses';


const timePeriods = [
  { id: 'morning', name: 'Morning' },
  { id: 'afternoon', name: 'Afternoon' },
  { id: 'evening', name: 'Evening' },
];

const statusOptions = [
  { value: "1", en: "Reviewing", ar: "قيد المراجعة" },
  { value: "2", en: "Waiting for Confirmation", ar: "في انتظار التأكيد" },
  { value: "3", en: "Confirmed", ar: "تم التأكيد" },
  { value: "4", en: "Canceled", ar: "تم الإلغاء" },
  { value: "5", en: "Completed", ar: "مكتمل" },
  { value: "6", en: "Failed", ar: "فشل" },
];

export default function CreateOrUpdateReservation({ initValues }: { initValues?: any }) {
  const { mutate: createReservation, isPending: isCreating } = useCreateReservation();
  const { mutate: updateReservation, isPending: isUpdating } = useUpdateReservation();
  const [lang, setLang] = useState<"en" | "ar">("en");
  
  const { data: pationts } = usePatients("");
  const { data: services } = useServices("");
  const { data: doctors } = useDoctors("");
  const { data: categories } = useCategories("");
  const { data: adress } = useAddresses("");
  console.log(adress);
  
  const { closeModal } = useModal();

  const onSubmit: SubmitHandler<ReservationFormInput> = (data) => {
    const requestBody = {
      client_id: Number(data.client_id),
      service_id: Number(data.service_id) || undefined,
      doctor_id: Number(data.doctor_id) || undefined,
      category_id: Number(data.category_id),
      address_id: Number(data.address_id),
      sessions_count: Number(data.sessions_count),
      sub_total: Number(data.sub_total),
      fees: Number(data.fees),
      total_amount: Number(data.total_amount),
      transaction_reference: data.transaction_reference,
      status: Number(data.status), // ✅ convert to number
      pain_location: data.pain_location,
      notes: data.notes,
      dates: data.dates.map(date => ({
        start_time: date.start_time,
        end_time: date.end_time,
        time_period: date.time_period
      })),
    };

    if (initValues) {
      updateReservation({ reservation_id: initValues.id, ...requestBody });
    } else {
      createReservation(requestBody);
    }
  };

  return (
    <Form<ReservationFormInput>
      onSubmit={onSubmit}
      //@ts-ignore
      validationSchema={reservationFormSchema}
      useFormProps={{
        defaultValues: {
          client_id: initValues?.client?.id?.toString() || '',
          service_id: initValues?.service?.id?.toString() || '',
          doctor_id: initValues?.doctor?.id?.toString() || '',
          category_id: initValues?.category_id?.toString() || '',
          address_id: initValues?.address_id?.toString() || '',
          sessions_count: initValues?.sessions_count?.toString() || '',
          sub_total: initValues?.sub_total?.toString() || '',
          fees: initValues?.fees?.toString() || '',
          status: initValues?.status?.toString() || "1", // ✅ new default
          total_amount: initValues?.total_amount?.toString() || '',
          transaction_reference: initValues?.transaction_reference || '',
          pain_location: initValues?.pain_location || '',
          notes: initValues?.notes || '',
          dates: initValues?.dates || [{ start_time: '', end_time: '', time_period: '' }],
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 overflow-y-auto"
    >
      {({ register, formState: { errors }, watch, setValue, control }) => 
        {
const { fields, append, remove } = useFieldArray({
  name: "dates",
  control,
});

return        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Reservation' : 'Create Reservation'}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Client</label>
              <select {...register('client_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Client</option>
                {pationts?.data?.map((client: any) => (
                  <option key={client.id} value={client.id}>{client.name?.en||client.name?.ar}</option>
                ))}
              </select>
              {errors.client_id && <p className="text-sm text-red-500">{errors.client_id.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700">Service</label>
              <select {...register('service_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Service</option>
                {services?.data?.map((service: any) => (
                  <option key={service.id} value={service.id}>{service.name?.en}</option>
                ))}
              </select>
              {errors.service_id && <p className="text-sm text-red-500">{errors.service_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Doctor</label>
              <select {...register('doctor_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Doctor</option>
                {doctors?.data?.map((doctor: any) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name?.en}</option>
                ))}
              </select>
              {errors.doctor_id && <p className="text-sm text-red-500">{errors.doctor_id.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700">Category</label>
              <select {...register('category_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Category</option>
                {categories?.data?.map((category: any) => (
                  <option key={category.id} value={category.id}>{category.name?.en}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
                        <div>
              <label className="text-sm text-gray-700">Address</label>
              <select {...register('address_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Address</option>
                {adress?.data?.map((adress: any) => (
                  <option key={adress.id} value={adress.id}>{adress.street}</option>
                ))}
              </select>
              {errors.address_id && <p className="text-sm text-red-500">{errors.address_id.message}</p>}
            </div>
            <Input label="Sessions Count" type="number" {...register('sessions_count')} error={errors.sessions_count?.message} />
          </div>
{/* ✅ Status Field */}
<select {...register("status")} className="w-full border border-gray-300 rounded-lg p-2">
  <option value="">Select Status</option>
  {statusOptions.map((option) => (
    <option key={option.value} value={option.value}>
      {lang === "ar" ? option.ar : option.en}
    </option>
  ))}
</select>


          <div className="grid grid-cols-2 gap-4">
            <Input label="Sub Total" type="number" {...register('sub_total')} error={errors.sub_total?.message} />
            <Input label="Fees" type="number" {...register('fees')} error={errors.fees?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Amount" type="number" {...register('total_amount')} error={errors.total_amount?.message} />
            <Input label="Transaction Reference" {...register('transaction_reference')} error={errors.transaction_reference?.message} />
          </div>

          <Input label="Pain Location" {...register('pain_location')} error={errors.pain_location?.message} />
          <Input label="Notes" {...register('notes')} error={errors.notes?.message} />

          {/* ✅ Dates Array Handling */}
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <Title as="h5" className="font-semibold">Reservation Dates</Title>
    <Button type="button" size="sm" onClick={() => append({ start_time: '', end_time: '', time_period: '' })}>
      + Add Date
    </Button>
  </div>

  {fields.map((field, index) => (
    <div key={field.id} className="border rounded-lg p-4 space-y-3 relative">
      {index > 0 && (
        <ActionIcon
          onClick={() => remove(index)}
          className="absolute top-2 right-2 text-red-500"
          size="sm"
          variant="text"
        >
          <PiXBold className="w-4 h-4" />
        </ActionIcon>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Time"
          type="datetime-local"
          {...register(`dates.${index}.start_time` as const)}
          error={errors.dates?.[index]?.start_time?.message}
        />
        <Input
          label="End Time"
          type="datetime-local"
          {...register(`dates.${index}.end_time` as const)}
          error={errors.dates?.[index]?.end_time?.message}
        />
      </div>

      <div>
        <label className="text-sm text-gray-700">Time Period</label>
        <select
          {...register(`dates.${index}.time_period` as const)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">Select Time Period</option>
          {timePeriods.map(period => (
            <option key={period.id} value={period.id}>{period.name}</option>
          ))}
        </select>
        {errors.dates?.[index]?.time_period && (
          <p className="text-sm text-red-500">{errors.dates?.[index]?.time_period?.message}</p>
        )}
      </div>
    </div>
  ))}

  {errors.dates && typeof errors.dates?.message === "string" && (
    <p className="text-sm text-red-500">{errors.dates.message}</p>
  )}
</div>

          <div>
            <label className="text-sm text-gray-700">Time Period</label>
            <select {...register('dates.0.time_period')} className="w-full border border-gray-300 rounded-lg p-2">
              <option value="">Select Time Period</option>
              {timePeriods.map(period => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
            {errors.dates?.[0]?.time_period && <p className="text-sm text-red-500">{errors.dates?.[0]?.time_period.message}</p>}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {initValues ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </div>
        </>
        }



      }
    </Form>
  );
}