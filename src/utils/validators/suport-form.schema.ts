import { z } from 'zod';

export const leadFormSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  offer: z.string().min(1, 'Offer is required'),
  agent_name: z.string().min(1, 'Agent name is required'),
  status: z.string().min(1, 'Status is required'),
  reason: z.string().min(1, 'Reason is required'),
  age: z.union([z.string(), z.number()]) // Allow both string and number types
  .refine((val) => {
    // Check if the value is a valid number or can be converted to a valid number
    return !isNaN(Number(val)) && Number(val) > 0;
  }, {
    message: 'Age must be a positive number or a valid string representation of a number',
  }),
  gender: z.string().min(1, 'Gender is required'),
  lead_source: z.string().min(1, 'Lead source is required'),
  mobile_phone: z.string().min(1, 'Mobile phone is required'),
  booking_phone_number: z.string().min(1, 'Booking phone number is required'),
  home_phone: z.string().optional(),
  address_1: z.string().min(1, 'Address is required'),
  source_campaign: z.string().min(1, 'Source campaign is required'),
  activity_code: z.string().min(1, 'Activity code is required'),
  call_sub_result: z.string().min(1, 'Call sub result is required'),
  will_call_us_again_reason: z.string().optional(),
  not_interested_reason: z.string().optional(),
  inquiry_only_reason: z.string().optional(),
  injection_date: z.string().min(1, 'Injection date is required'),
  duplicate_lead: z.string().min(1, 'Duplicate lead info is required'),
  call_count: z.union([z.string(), z.number()]) // Allow both string and number types
  .refine((val) => {
    // Check if the value is a valid number or can be converted to a valid number
    return !isNaN(Number(val)) && Number(val) > 0;
  }, {
    message: 'Age must be a positive number or a valid string representation of a number',
  }),
  modified_by: z.string().min(1, 'Modified by is required'),
  patient_id: z.string().min(1, 'Patient ID is required'),
  phonecall_patient_id: z.string().min(1, 'Phone call patient ID is required'),
  description: z.string().min(1, 'Description is required'),
  first_call_time: z.string().min(1, 'First call time is required'),
  last_call_result: z.string().min(1, 'Last call result is required'),
  last_call_total_duration: z.string().min(0, 'Last call total duration is required'),
  last_phone: z.string().min(1, 'Last phone number is required'),
  last_call_created_by: z.string().min(1, 'Last call created by is required'),
  booking_count: z.union([z.string(), z.number()]) // Allow both string and number types
  .refine((val) => {
    // Check if the value is a valid number or can be converted to a valid number
    return !isNaN(Number(val)) && Number(val) > 0;
  }, {
    message: 'Age must be a positive number or a valid string representation of a number',
  }),
  reservation_date_1: z.string().min(1, 'Reservation date is required'),
  doctor1: z.string().min(1, 'Doctor is required'),
  notes: z.string().min(1, 'Notes are required'),
  ads: z.string().min(1, 'Ads info is required'),
  ad_set: z.string().min(1, 'Ad set info is required'),
  no_show_lost_reason: z.string().optional(),
  specialtie_1: z.string().min(1, 'Specialty 1 is required'),
  specialtie_2: z.string().min(1, 'Specialty 2 is required'),
  specialtie_3: z.string().min(1, 'Specialty 3 is required'),
  ads_name: z.string().min(1, 'Ads name is required'),
  modified_on: z.string().min(1, 'Modified on date is required'),
  created_by: z.string().min(1, 'Created by is required'),
  event_agent_name: z.string().min(1, 'Event agent name is required'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;