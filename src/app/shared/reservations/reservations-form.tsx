"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PiXBold } from "react-icons/pi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ActionIcon } from "rizzui";
import { useModal } from "../modal-views/use-modal";
import { useCreateReservation, useUpdateReservation } from "@/framework/reservations";
import { useServices } from "@/framework/services";
import { useDoctors } from "@/framework/doctors";
import { usePatients } from "@/framework/patients";
import { type ReservationFormInput, reservationFormSchema } from "@/utils/validators/reservation-form-schema";

const timePeriods = [
  { id: "morning", name: "Morning" },
  { id: "afternoon", name: "Afternoon" },
  { id: "evening", name: "Evening" },
];

const statusOptions = [
  { value: "1", en: "Reviewing", ar: "قيد المراجعة" },
  { value: "2", en: "Waiting for Confirmation", ar: "في انتظار التأكيد" },
  { value: "3", en: "Confirmed", ar: "تم التأكيد" },
  { value: "4", en: "Canceled", ar: "تم الإلغاء" },
  { value: "5", en: "Completed", ar: "مكتمل" },
  { value: "6", en: "Failed", ar: "فشل" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function CreateOrUpdateReservation({ initValues }: { initValues?: any }) {
  const { mutate: createReservation, isPending: isCreating } = useCreateReservation();
  const { mutate: updateReservation, isPending: isUpdating } = useUpdateReservation();

  const { data: patients } = usePatients("");
  const { data: services } = useServices("");
  const { data: doctors } = useDoctors("");

  const { closeModal } = useModal();

  // 👇 Helper for safe nested values
  const guest = initValues?.guest_info ?? {};

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    resetField,
    watch,
  } = useForm<ReservationFormInput>({
    resolver: zodResolver(reservationFormSchema),

    defaultValues: {
      // 🧩 detect guest or existing
      reservation_type: initValues?.is_guest ? "guest" : "existing",

      // 🧩 base IDs
      patient_id: initValues?.patient?.id?.toString() || "",
      doctor_id: initValues?.doctor?.id?.toString() || "",
      service_id: initValues?.service?.id?.toString() || "",
      category_id: initValues?.category_id?.toString() || "",
      sessions_count: initValues?.sessions_count?.toString() || "1",

      // 🧩 numbers and billing
      sub_total: initValues?.sub_total?.toString() || "",
      fees: initValues?.fees?.toString() || "",
      total_amount: initValues?.total_amount?.toString() || "",
      transaction_reference: initValues?.transaction_reference || "",

      // 🧩 common fields
      status: initValues?.status?.toString() || "2",
      pain_location: initValues?.pain_location || "",
      notes: initValues?.notes || "",
      address_city: initValues?.guest_info?.city || initValues?.address_city || "",
      address_state: initValues?.guest_info?.state || initValues?.address_state || "",
      address_link: initValues?.address_link || "",

      // 🧩 guest info (flatten)
      patient_name: guest?.name || "",
      patient_email: guest?.email || "",
      patient_national_id: guest?.national_id || "",
      patient_gender: guest?.gender || "male",
      patient_country: guest?.country || guest?.nationality || "",
      patient_mobile: guest?.mobile || "",
      patient_city: guest?.city || "",
      patient_state: guest?.state || "",
      patient_date_of_birth: guest?.date_of_birth || "",

      // 🧩 nested dates handling
      dates:
        initValues?.dates?.map((d: any) => ({
          date: d.date || d.end_time?.split("T")[0] || "",
          time: d.time || d.end_time?.split("T")[1]?.substring(0, 5) || "",
          time_period: d.time_period || "morning",
          doctor_id: d.doctor?.id?.toString() || "",
          status: d.status || "pending",
        })) || [
          {
            date: "",
            time: "",
            time_period: "morning",
            doctor_id: "",
            status: "pending",
          },
        ],
    },
  });

  const reservationType = useWatch({ control, name: "reservation_type" });
  const watchDates = watch("dates");
  const watchSessionsCount = useWatch({ control, name: "sessions_count" });
  const lang: "en" | "ar" = "en";

  // Reset irrelevant fields on switch
  useEffect(() => {
    if (reservationType === "guest") {
      resetField("patient_id", { defaultValue: "" });
    } else if (reservationType === "existing") {
      resetField("patient_name", { defaultValue: "" });
      resetField("patient_email", { defaultValue: "" });
      resetField("patient_national_id", { defaultValue: "" });
      resetField("patient_gender", { defaultValue: "male" });
      resetField("patient_country", { defaultValue: "" });
      resetField("patient_mobile", { defaultValue: "" });
      resetField("patient_city", { defaultValue: "" });
      resetField("patient_state", { defaultValue: "" });
      resetField("patient_date_of_birth", { defaultValue: "" });
    }
  }, [reservationType, resetField]);

  // 🔁 sync number of date blocks
  useEffect(() => {
    const sessionCount = Number(watchSessionsCount) || 1;
    const newDates = Array.from({ length: sessionCount }, (_, i) => ({
      date: watchDates?.[i]?.date || "",
      time: watchDates?.[i]?.time || "",
      time_period: watchDates?.[i]?.time_period || "morning",
      doctor_id: watchDates?.[i]?.doctor_id || "",
      status: watchDates?.[i]?.status || "pending",
    }));
    setValue("dates", newDates, { shouldValidate: true });
  }, [watchSessionsCount]);

  const onSubmit: SubmitHandler<ReservationFormInput> = (data) => {
    const requestBody = {
      service_id: Number(data.service_id),
      category_id: Number(data.category_id),
      sessions_count: Number(data.sessions_count),
      sub_total: Number(data.sub_total),
      fees: Number(data.fees),
      total_amount: Number(data.total_amount),
      transaction_reference: data.transaction_reference,
      status: Number(data.status),
      pain_location: data.pain_location,
      notes: data.notes,
      address_city: data.address_city,
      address_state: data.address_state,
      address_link: data.address_link,

      dates: data.dates.map((date) => ({
        date: date.date,
        time: date.time,
        time_period: date.time_period,
        doctor_id: Number(date.doctor_id),
        status: date.status || "pending",
      })),

      ...(data.reservation_type === "guest"
        ? {
            patient_name: data.patient_name,
            patient_email: data.patient_email,
            patient_national_id: data.patient_national_id,
            patient_gender: data.patient_gender,
            patient_country: data.patient_country,
            patient_mobile: data.patient_mobile,
            patient_city: data.patient_city,
            patient_state: data.patient_state,
            patient_date_of_birth: data.patient_date_of_birth,
          }
        : {
            patient_id: Number(data.patient_id),
          }),
    };

    if (initValues) {
      updateReservation({ reservation_id: initValues.id, ...requestBody });
    } else {
      createReservation(requestBody);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-grow flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg">{initValues ? "Update Reservation" : "Create Reservation"}</h4>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      {/* Reservation Type Radios - Controller ensures immediate updates */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Reservation Type</label>
        <Controller
          name="reservation_type"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="guest"
                  checked={value === "guest"}
                  onChange={() => onChange("guest")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Guest Reservation</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="existing"
                  checked={value === "existing"}
                  onChange={() => onChange("existing")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Existing Patient</span>
              </label>
            </div>
          )}
        />
      </div>

      {reservationType === "guest" ? (
        // key forces a remount so the very first toggle always re-renders fresh
        <div key="guest" className="space-y-4 border-l-4 border-blue-500 pl-4">
          <h5 className="font-semibold text-sm">Guest Patient Information</h5>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              placeholder="e.g., أحمد محمد"
              {...register("patient_name")}
              error={errors.patient_name?.message}
            />
            <Input
              label="Patient Email"
              type="email"
              placeholder="e.g., ah1med@example.com"
              {...register("patient_email")}
              error={errors.patient_email?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="National ID"
              placeholder="e.g., 12134567890"
              {...register("patient_national_id")}
              error={errors.patient_national_id?.message}
            />
            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select {...register("patient_gender")} className="w-full border border-gray-300 rounded-lg p-2">
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mobile"
              placeholder="e.g., 05101234567"
              {...register("patient_mobile")}
              error={errors.patient_mobile?.message}
            />
            <Input
              label="Date of Birth"
              type="date"
              {...register("patient_date_of_birth")}
              error={errors.patient_date_of_birth?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              placeholder="e.g., السعودية"
              {...register("patient_country")}
              error={errors.patient_country?.message}
            />
            <Input
              label="City"
              placeholder="e.g., الرياض"
              {...register("patient_city")}
              error={errors.patient_city?.message}
            />
          </div>

          <Input
            label="State/Region"
            placeholder="e.g., منطقة الرياض"
            {...register("patient_state")}
            error={errors.patient_state?.message}
          />
        </div>
      ) : (
        <div key="existing">
          <label className="text-sm text-gray-700">Select Existing Patient</label>
          <select {...register("patient_id")} className="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Select Patient</option>
            {patients?.data?.map((patient: any) => (
              <option key={patient.id} value={patient.id}>
                {patient.name?.en || patient.name?.ar}
              </option>
            ))}
          </select>
          {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">Service</label>
          <select {...register("service_id")} className="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Select Service</option>
            {services?.data?.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name?.en}
              </option>
            ))}
          </select>
          {errors.service_id && <p className="text-sm text-red-500">{errors.service_id.message}</p>}
        </div>
        <div>
          <label className="text-sm text-gray-700">Doctor</label>
          <select {...register("doctor_id")} className="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Select Doctor</option>
            {doctors?.data?.map((doctor: any) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name?.en}
              </option>
            ))}
          </select>
          {errors.doctor_id && <p className="text-sm text-red-500">{errors.doctor_id.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-700">Category</label>
        <select {...register("category_id")} className="w-full border border-gray-300 rounded-lg p-2">
          <option value="">Select Category</option>
          <option value="21">Category 21</option>
        </select>
        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
      </div>

      <div className="space-y-4 border-l-4 border-green-500 pl-4">
        <h5 className="font-semibold text-sm">Address Information</h5>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="e.g., الرياض"
            {...register("address_city")}
            error={errors.address_city?.message}
          />
          <Input
            label="State/Region"
            placeholder="e.g., منطقة الرياض"
            {...register("address_state")}
            error={errors.address_state?.message}
          />
        </div>
        <Input
          label="Address Link (Maps)"
          type="url"
          placeholder="https://maps.google.com/?q=24.7136,46.6753"
          {...register("address_link")}
          error={errors.address_link?.message}
        />
      </div>

      <div className="space-y-4 border-l-4 border-purple-500 pl-4">
        <h5 className="font-semibold text-sm">Billing Information</h5>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sessions Count"
            type="number"
            {...register("sessions_count")}
            error={errors.sessions_count?.message}
          />
          <Input label="Sub Total" type="number" {...register("sub_total")} error={errors.sub_total?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Fees" type="number" {...register("fees")} error={errors.fees?.message} />
          <Input
            label="Total Amount"
            type="number"
            {...register("total_amount")}
            error={errors.total_amount?.message}
          />
        </div>

        <Input
          label="Transaction Reference"
          placeholder="e.g., GUEST123"
          {...register("transaction_reference")}
          error={errors.transaction_reference?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">Status</label>
          <select {...register("status")} className="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Select Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {lang === "ar" ? option.ar : option.en}
              </option>
            ))}
          </select>
          {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
        </div>
        <Input
          label="Pain Location"
          placeholder="e.g., ألم في الرقبة"
          {...register("pain_location")}
          error={errors.pain_location?.message}
        />
      </div>

      <Input label="Notes" placeholder="e.g., حجز ضيف جديد" {...register("notes")} error={errors.notes?.message} />

 <div className="space-y-4 border-l-4 border-orange-500 pl-4">
        <h5 className="font-semibold text-sm">Reservation Dates</h5>

        {watchDates?.map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                {...register(`dates.${index}.date` as const)}
                error={errors.dates?.[index]?.date?.message}
              />
              <Input
                label="Time"
                type="time"
                {...register(`dates.${index}.time` as const)}
                error={errors.dates?.[index]?.time?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Time Period</label>
                <select
                  {...register(`dates.${index}.time_period` as const)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  {timePeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Doctor</label>
                <select
                  {...register(`dates.${index}.doctor_id` as const)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select Doctor</option>
                  {doctors?.data?.map((doctor: any) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name?.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Status</label>
              <select
                {...register(`dates.${index}.status` as const)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {lang === "ar" ? s.ar : s.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {errors.dates && typeof errors.dates?.message === "string" && (
          <p className="text-sm text-red-500">{errors.dates.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || isUpdating}>
          {initValues ? "Update Reservation" : "Create Reservation"}
        </Button>
      </div>
    </form>
  );
}
