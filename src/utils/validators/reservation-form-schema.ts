import { z } from "zod"

export const reservationFormSchema = z
  .object({
    // Reservation type: 'guest' or 'existing'
    reservation_type: z.enum(["guest", "existing"]).default("guest"),

    // For existing patient reservations
    patient_id: z.string().optional(),

    // For guest reservations - patient details
    patient_name: z.string().optional(),
    // Email will be validated conditionally in superRefine (guest only)
    patient_email: z.string().optional(),
    patient_national_id: z.string().optional(),
    patient_gender: z.enum(["male", "female"]).optional(),
    patient_country: z.string().optional(),
    patient_mobile: z.string().optional(),
    patient_city: z.string().optional(),
    patient_state: z.string().optional(),
    patient_date_of_birth: z.string().optional(),
    remaining_payment: z.string().optional(),
    // Common fields
    service_id: z.string().min(1, "Service is required"),
    doctor_id: z.string().optional(),
    category_id: z.string().min(1, "Category is required"),
    sessions_count: z.string().min(1, "Sessions count is required"),
    session_price: z.string().optional(),
    sub_total: z.string().min(1, "Sub total is required"),
    fees: z.string().min(1, "Fees is required"),
    fees_type: z.string().min(1, "Fees is required"),
    total_amount: z.string().min(1, "Total amount is required"),
    transaction_reference: z.string().min(1, "Transaction reference is required"),
    status: z
      .enum(["1", "2", "3", "4", "5", "6"], {
        errorMap: () => ({ message: "Status is required" }),
      })
      .default("2"),
    pain_location: z.string().min(1, "Pain location is required"),
    notes: z.string().optional(),
    customer_tier: z.string().optional(),

    // Address fields
    address_city: z.string().min(1, "Address city is required"),
    address_state: z.string().min(1, "Address state is required"),
    address_link: z.string().url().optional(),

    // New fields
    paid: z.number().optional().default(0),
    source_campaign: z.string().optional(),
    center_id: z.string().optional(),

    // Lead-related fields
    lead_id: z.number().optional(),
    name: z.string().optional(),

    dates: z
      .array(
        z.object({
          date: z.string().optional(),
          time: z.string().optional(),
          time_period: z.enum(["morning", "afternoon", "evening"]).default("morning"),
          doctor_id: z.string().optional(),
          status: z.string().optional(),
        }),
      )
      .min(1, "At least one date is required"),
  })
  .superRefine((data, ctx) => {
    // If guest reservation, require critical guest fields
    if (data.reservation_type === "guest") {
      if (!data.patient_name || data.patient_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Patient Name is required",
          path: ["patient_name"],
        });
      }
      if (!data.patient_email || data.patient_email.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Patient Email is required",
          path: ["patient_email"],
        });
      }
      // Validate email format only when guest and provided
      if (data.patient_email && !/^\S+@\S+\.\S+$/.test(data.patient_email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email",
          path: ["patient_email"],
        });
      }
      if (!data.patient_mobile || data.patient_mobile.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mobile is required",
          path: ["patient_mobile"],
        });
      }
      if (!data.patient_national_id || data.patient_national_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "National ID is required",
          path: ["patient_national_id"],
        });
      }
      if (!data.patient_date_of_birth || data.patient_date_of_birth.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of Birth is required",
          path: ["patient_date_of_birth"],
        });
      }
    }

    // If existing patient, require patient_id
    if (data.reservation_type === "existing" && !data.patient_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Patient is required",
        path: ["patient_id"],
      });
    }
  })
  .refine(
    (data) => {
      // If source_campaign is "center", require center_id
      if (data.source_campaign === "center") {
        return !!data.center_id && data.center_id.trim() !== ""
      }
      return true
    },
    {
      message: "Center is required when Source Campaign is center",
      path: ["center_id"],
    },
  )

export type ReservationFormInput = z.infer<typeof reservationFormSchema>
