import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema, validateConfirmPassword, validateEmail,validateNewPassword,validatePhone } from '@/utils/validators/common-rules';
import toast from 'react-hot-toast';

// form zod validation schema
export const profileFormSchema = z.object({
  name:z.string().min(1, { message: messages.nameIsRequired }),
    email: validateEmail,
    phone: validatePhone,
    address: z.string().min(1, { message: messages.addressIsRequired }),
    birth_date: z.date(),
    gender: z.number().optional(),
    mac_id: z.string().optional(),
    role: z.number(),
    image:z.any(),
    password:validateNewPassword,
    confirmPassword:validateConfirmPassword,

}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ["confirmPassword"]
    });
  }
});


// generate form types from zod validation schema
export type ProfileFormTypes = z.infer<typeof profileFormSchema>;

