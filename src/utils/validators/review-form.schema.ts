import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const ReviewFormSchema = z.object({
  // name: z
  //   .string().min(1,"is Required"),
  //   text: z
  //   .string().min(1,"is Required"),
  //   position: z
  //   .string().min(1,"is Required"),
  titleEN: z
  .string().min(1,"is Required"),
  titleAR: z
  .string().min(1,"is Required"),  
  nameEN: z
    .string().min(1,"is Required"),
  nameAR: z
    .string().min(1,"is Required"),
    textEN: z
    .string().min(1,"is Required"),
    textAR: z
    .string().min(1,"is Required"),
    positionEN: z
    .string().min(1,"is Required"),
    positionAR: z
    .string().min(1,"is Required"),
    rate: z
    .number().min(1,"is Required")

});

// generate form types from zod validation schema
export type ReviewFormInput = z.infer<typeof ReviewFormSchema>;
