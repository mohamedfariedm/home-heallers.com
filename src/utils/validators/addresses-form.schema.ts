import { z } from 'zod';

export const addressFormSchema = z.object({
  addressable_type: z.string().min(1, 'Type is required'),
  addressable_id: z.number({ invalid_type_error: 'Must be a number' }),
  country_id: z.number({ invalid_type_error: 'Country is required' }),
  state_id: z.number({ invalid_type_error: 'State is required' }),
  city_id: z.number({ invalid_type_error: 'City is required' }),
  street: z.string().min(1, 'Street is required'),
  building: z.string().min(1, 'Building is required'),
  apartment: z.string().min(1, 'Apartment is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  notes: z.string().optional(),
  is_default: z.boolean().optional(),
});

export type AddressFormInput = z.infer<typeof addressFormSchema>;
