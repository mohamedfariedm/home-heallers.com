import { z } from "zod"

export const reservationFormSchema = z
  .object({
    // Reservation type: 'guest' or 'existing'
    reservation_type: z.enum(["guest", "existing"]).default("guest"),

    // For existing patient reservations
    patient_id: z.string().optional(),

    // For guest reservations - patient details
    patient_name: z.string().optional(),
    patient_email: z.string().optional(),
    patient_national_id: z.string().optional(),
    patient_gender: z.enum(["male", "female"]).optional(),
    patient_country: z.string().optional(),
    patient_mobile: z.string().optional(),
    patient_city: z.string().optional(),
    patient_state: z.string().optional(),
    patient_date_of_birth: z.string().optional(),

    // Common fields
    service_id: z.string().min(1, "Service is required"),
    doctor_id: z.string().min(1, "Doctor is required"),
    category_id: z.string().min(1, "Category is required"),
    sessions_count: z.string().min(1, "Sessions count is required"),
    sub_total: z.string().min(1, "Sub total is required"),
    fees: z.string().min(1, "Fees is required"),
    total_amount: z.string().min(1, "Total amount is required"),
    transaction_reference: z.string().min(1, "Transaction reference is required"),
    status: z
      .enum(["1", "2", "3", "4", "5", "6"], {
        errorMap: () => ({ message: "Status is required" }),
      })
      .default("2"),
    pain_location: z.string().min(1, "Pain location is required"),
    notes: z.string().optional(),

    // Address fields
    address_city: z.string().min(1, "Address city is required"),
    address_state: z.string().min(1, "Address state is required"),
    address_link: z.string().url().optional(),

    dates: z
      .array(
        z.object({
          date: z.string().min(1, "Date is required"),
          time: z.string().min(1, "Time is required"),
          time_period: z.enum(["morning", "afternoon", "evening"]).default("morning"),
          doctor_id: z.string().optional(),
          status: z.string().optional(),
        }),
      )
      .min(1, "At least one date is required"),
  })
  .refine(
    (data) => {
      // If guest reservation, require patient details
      if (data.reservation_type === "guest") {
        return data.patient_name && data.patient_email && data.patient_mobile
      }
      // If existing patient, require patient_id
      if (data.reservation_type === "existing") {
        return !!data.patient_id
      }
      return true
    },
    {
      message: "Please provide required patient information",
      path: ["patient_id"],
    },
  )

export type ReservationFormInput = z.infer<typeof reservationFormSchema>
