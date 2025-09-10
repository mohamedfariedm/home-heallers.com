// utils/validators/doctors-form-schema.ts
import { z } from 'zod';

export const doctorFormSchema = z.object({
  doctor_role: z.string().min(1, 'Doctor role is required'),
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  email: z.string().email('Invalid email address'),
  nationality_id: z.string().min(1, 'Nationality is required'),

  // ⬇️ change from single to array
  service_ids: z.array(z.string()).min(1, 'At least one service is required'),

  national_id: z.string().min(1, 'National ID is required'),
  country_code: z.string().optional(),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  blood_group: z.string().optional(),
  gender: z.enum(['male', 'female']),
  status: z.boolean().optional(),
  degree: z.string().min(1, 'Degree is required'),
  languages_spoken: z.string().min(1, 'Languages spoken is required'),
  classification: z.string().min(1, 'Classification is required'),
  department: z.string().min(1, 'Department is required'),
  experience: z.string().min(1, 'Experience is required'),
  medical_school: z.string().min(1, 'Medical school is required'),
  memberships: z.string().optional(),
  specialized_in: z.string().min(1, 'Specialization is required'),
  awards: z.string().optional(),
  certification: z.string().optional(),
  upload_attachments: z.string().optional(),
  medical_registration_number: z.string().min(1, 'Medical registration number is required'),
  medical_license_expiry: z.string().min(1, 'Medical license expiry is required'),
  specialist: z.string().min(1, 'Specialist field is required'),
  sub_specialist: z.string().optional(),
  clinic_name: z.string().min(1, 'Clinic name is required'),
  from: z.string().min(1, 'Start time is required'),
  to: z.string().min(1, 'End time is required'),
});

export type DoctorFormInput = z.infer<typeof doctorFormSchema>;
