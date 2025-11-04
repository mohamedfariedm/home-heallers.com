import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { LeadFormInput, leadFormSchema } from '@/utils/validators/suport-form.schema';
import { Textarea } from 'rizzui';
import { useCreateCustomerSupport, useUpdateCustomerSupport } from '@/framework/customer-suport';
import { useSearchParams } from 'next/navigation';

export default function CreateOrUpdateLead({ initValues,type }: { initValues?: any,type: string }) {

    
  const { closeModal } = useModal();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
    const { mutate: createSupport, isPending: isCreating } = useCreateCustomerSupport();
    const { mutate: updateSupport, isPending: isUpdating } = useUpdateCustomerSupport();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<LeadFormInput> = (data) => {
    const requestBody = {
      type,
      name: data.name,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      offer: data.offer,
      agent_name: data.agent_name,
      status: data.status,
      reason: data.reason,
      age: data.age,
      gender: data.gender,
      lead_source: data.lead_source,
      mobile_phone: data.mobile_phone,
      booking_phone_number: data.booking_phone_number,
      home_phone: data.home_phone,
      address_1: data.address_1,
      source_campaign: data.source_campaign,
      activity_code: data.activity_code,
      call_sub_result: data.call_sub_result,
      will_call_us_again_reason: data.will_call_us_again_reason,
      not_interested_reason: data.not_interested_reason,
      inquiry_only_reason: data.inquiry_only_reason,
      injection_date: data.injection_date,
      duplicate_lead: data.duplicate_lead,
      call_count: data.call_count,
      modified_by: data.modified_by,
      patient_id: data.patient_id,
      phonecall_patient_id: data.phonecall_patient_id,
      description: data.description,
      first_call_time: data.first_call_time,
      last_call_result: data.last_call_result,
      last_call_total_duration: data.last_call_total_duration,
      last_phone: data.last_phone,
      last_call_created_by: data.last_call_created_by,
      booking_count: data.booking_count,
      reservation_date_1: data.reservation_date_1,
      doctor1: data.doctor1,
      notes: data.notes,
      ads: data.ads,
      ad_set: data.ad_set,
      no_show_lost_reason: data.no_show_lost_reason,
      specialtie_1: data.specialtie_1,
      specialtie_2: data.specialtie_2,
      specialtie_3: data.specialtie_3,
      ads_name: data.ads_name,
      modified_on: data.modified_on,
      created_by: data.created_by,
      event_agent_name: data.event_agent_name,
    };
console.log(requestBody);

    if (initValues) {
      updateSupport({ lead_id: initValues.id, ...requestBody });
    } else {
      createSupport(requestBody);
    }

    setLoading(true);
  };


  return (
    <Form<LeadFormInput>
      onSubmit={onSubmit}
      validationSchema={leadFormSchema}
      useFormProps={{
        defaultValues: {
          name: initValues?.name || '',
          first_name: initValues?.first_name || '',
          middle_name: initValues?.middle_name || '',
          last_name: initValues?.last_name || '',
          offer: initValues?.offer || '',
          agent_name: initValues?.agent_name || '',
          status: initValues?.status || '',
          reason: initValues?.reason || '',
          age: initValues?.age || '',
          gender: initValues?.gender || '',
          lead_source: initValues?.lead_source || '',
          mobile_phone: initValues?.mobile_phone || '',
          booking_phone_number: initValues?.booking_phone_number || '',
          home_phone: initValues?.home_phone || '',
          address_1: initValues?.address_1 || '',
          source_campaign: initValues?.source_campaign || '',
          activity_code: initValues?.activity_code || '',
          call_sub_result: initValues?.call_sub_result || '',
          will_call_us_again_reason: initValues?.will_call_us_again_reason || '',
          not_interested_reason: initValues?.not_interested_reason || '',
          inquiry_only_reason: initValues?.inquiry_only_reason || '',
          injection_date: initValues?.injection_date || '',
          duplicate_lead: initValues?.duplicate_lead || '',
          call_count: initValues?.call_count || 0,
          modified_by: initValues?.modified_by || '',
          patient_id: initValues?.patient_id || '',
          phonecall_patient_id: initValues?.phonecall_patient_id || '',
          description: initValues?.description || '',
          first_call_time: initValues?.first_call_time || '',
          last_call_result: initValues?.last_call_result || '',
          last_call_total_duration: initValues?.last_call_total_duration || 0,
          last_phone: initValues?.last_phone || '',
          last_call_created_by: initValues?.last_call_created_by || '',
          booking_count: initValues?.booking_count || 0,
          reservation_date_1: initValues?.reservation_date_1 || '',
          doctor1: initValues?.doctor1 || '',
          notes: initValues?.notes || '',
          ads: initValues?.ads || '',
          ad_set: initValues?.ad_set || '',
          no_show_lost_reason: initValues?.no_show_lost_reason || '',
          specialtie_1: initValues?.specialtie_1 || '',
          specialtie_2: initValues?.specialtie_2 || '',
          specialtie_3: initValues?.specialtie_3 || '',
          ads_name: initValues?.ads_name || '',
          modified_on: initValues?.modified_on || '',
          created_by: initValues?.created_by || '',
          event_agent_name: initValues?.event_agent_name || '',
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors } }) => {
console.log(errors);

        return<>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Lead' : 'Create Lead'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="First Name" {...register('first_name')} error={errors.first_name?.message} />
            <Input label="Middle Name" {...register('middle_name')} error={errors.middle_name?.message} />
            <Input label="Last Name" {...register('last_name')} error={errors.last_name?.message} />
          </div>

          <Input label="Full Name" {...register('name')} error={errors.name?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Age" type="number" {...register('age')} error={errors.age?.message} />
            <div>
              <label>Gender</label>
              <select {...register('gender')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Mobile Phone" {...register('mobile_phone')} error={errors.mobile_phone?.message} />
            <Input label="Home Phone" {...register('home_phone')} error={errors.home_phone?.message} />
            <Input label="Booking Phone" {...register('booking_phone_number')} error={errors.booking_phone_number?.message} />
          </div>

          <Input label="Address" {...register('address_1')} error={errors.address_1?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Offer" {...register('offer')} error={errors.offer?.message} />
            <Input label="Agent Name" {...register('agent_name')} error={errors.agent_name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Status</label>
              <select {...register('status')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Status</option>
                <option value="new">New</option>
                <option value="follow_up">Follow Up</option>
                <option value="closed">Closed</option>
              </select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
            <Input label="Reason" {...register('reason')} error={errors.reason?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Lead Source" {...register('lead_source')} error={errors.lead_source?.message} />
            <Input label="Source Campaign" {...register('source_campaign')} error={errors.source_campaign?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Activity Code" {...register('activity_code')} error={errors.activity_code?.message} />
            <Input label="Call Sub Result" {...register('call_sub_result')} error={errors.call_sub_result?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Will Call Again Reason" {...register('will_call_us_again_reason')} error={errors.will_call_us_again_reason?.message} />
            <Input label="Not Interested Reason" {...register('not_interested_reason')} error={errors.not_interested_reason?.message} />
          </div>

          <Input label="Inquiry Only Reason" {...register('inquiry_only_reason')} error={errors.inquiry_only_reason?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Injection Date" type="date" {...register('injection_date')} error={errors.injection_date?.message} />
            <Input label="Duplicate Lead" {...register('duplicate_lead')} error={errors.duplicate_lead?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Call Count" type="number" {...register('call_count')} error={errors.call_count?.message} />
            <Input label="Modified By" {...register('modified_by')} error={errors.modified_by?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Patient ID" {...register('patient_id')} error={errors.patient_id?.message} />
            <Input label="Phone Call Patient ID" {...register('phonecall_patient_id')} error={errors.phonecall_patient_id?.message} />
          </div>

          <Textarea label="Description" {...register('description')} error={errors.description?.message}  rows={3} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Call Time" type="datetime-local" {...register('first_call_time')} error={errors.first_call_time?.message} />
            <Input label="Last Call Result" {...register('last_call_result')} error={errors.last_call_result?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Last Call Duration" type="number" {...register('last_call_total_duration')} error={errors.last_call_total_duration?.message} />
            <Input label="Last Phone" {...register('last_phone')} error={errors.last_phone?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Last Call Created By" {...register('last_call_created_by')} error={errors.last_call_created_by?.message} />
            <Input label="Booking Count" type="number" {...register('booking_count')} error={errors.booking_count?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Reservation Date" type="date" {...register('reservation_date_1')} error={errors.reservation_date_1?.message} />
            <Input label="Doctor" {...register('doctor1')} error={errors.doctor1?.message} />
          </div>


          <Textarea label="Notes" {...register('notes')} error={errors.notes?.message}  rows={3} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Ads" {...register('ads')} error={errors.ads?.message} />
            <Input label="Ad Set" {...register('ad_set')} error={errors.ad_set?.message} />
          </div>

          <Input label="No Show Lost Reason" {...register('no_show_lost_reason')} error={errors.no_show_lost_reason?.message} />

          <div className="grid grid-cols-3 gap-4">
            <Input label="Specialty 1" {...register('specialtie_1')} error={errors.specialtie_1?.message} />
            <Input label="Specialty 2" {...register('specialtie_2')} error={errors.specialtie_2?.message} />
            <Input label="Specialty 3" {...register('specialtie_3')} error={errors.specialtie_3?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Ads Name" {...register('ads_name')} error={errors.ads_name?.message} />
            <Input label="Modified On" type="datetime-local" {...register('modified_on')} error={errors.modified_on?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Created By" {...register('created_by')} error={errors.created_by?.message} />
            <Input label="Event Agent Name" {...register('event_agent_name')} error={errors.event_agent_name?.message} />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </>

      }
      }
    </Form>
  );
}