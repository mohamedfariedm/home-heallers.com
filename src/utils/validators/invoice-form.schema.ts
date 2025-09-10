import { z } from "zod";

// helpers
const numericString = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((val) => !isNaN(Number(val)), `${label} must be a valid number`)
    .refine((val) => Number(val) >= 0, `${label} must be non-negative`);

export const InvoiceDetailSchema = z.object({
id: z.union([z.string(), z.number()]).optional(),
  customer_name: z.string().min(1, "Customer Name is required"),
  national_id: z.string().min(1, "National ID is required"),
  service_name: z.string().min(1, "Service Name is required"),
  service_code: z.string().min(1, "Service Code is required"),

  // Details numeric fields are numbers in your form state; accept strings too
  session_price: z.coerce
    .number({
      invalid_type_error: "Session Price must be a valid number",
    })
    .min(0, "Session Price must be non-negative"),
  session_count: z.coerce
    .number({
      invalid_type_error: "Session Count must be a valid number",
    })
    .int("Session Count must be a whole number")
    .min(1, "Session Count must be at least 1"),
  doctor_id: z.coerce
    .number({
      invalid_type_error: "Doctor ID must be a valid number",
    })
    .int("Doctor ID must be a whole number")
    .positive("Doctor ID must be a positive number"),
});

export const InvoiceFormSchema = z.object({
  // header fields (strings in your form)
  invoice_number: z.string().min(1, "Invoice Number is required"),
  invoice_date: z.string().min(1, "Invoice Date is required"),

  discount: numericString("Discount"),
  total_before_tax: numericString("Total Before Tax"),
  tax_total: numericString("Tax Total"),
  grand_total: numericString("Grand Total"),
  balance_due: numericString("Balance Due"),

  tax_percentage: z.enum(["0%", "15%", "20%", "معافاه"], {
    errorMap: () => ({
      message: "Tax Percentage must be one of: 0%, 15%, 20%, معافاه",
    }),
  }),

  status: z.enum(["قيد الانتظار", "موافق عليه", "ملغاة"], {
    errorMap: () => ({
      message: "Status must be one of: قيد الانتظار, موافق عليه, ملغاة",
    }),
  }),

  details: z
    .array(InvoiceDetailSchema)
    .min(1, "At least one invoice detail is required"),
});

// Types now match your RHF defaultValues and internal shapes:
// - header numbers are strings
// - detail numeric fields are numbers
export type InvoiceFormInput = z.infer<typeof InvoiceFormSchema>;
