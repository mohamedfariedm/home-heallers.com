"use client";

import { useEffect, useState } from "react";
import { PiXBold } from "react-icons/pi";
import { SubmitHandler } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/text";
import { useModal } from "@/app/shared/modal-views/use-modal";
import Select from "react-select";
import { packageFormSchema, PackageFormInput } from "@/utils/validators/package-form.schema";
import { Checkbox } from "rizzui";
import Spinner from "@/components/ui/spinner";
import { useCreatePackages, useUpdatePackages } from "@/framework/packages";
import { useDoctors } from "@/framework/doctors";

export default function CreateOrUpdatePackages({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createPackage, isPending: isCreating } = useCreatePackages();
  const { mutate: updatePackage, isPending: isUpdating } = useUpdatePackages();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const { data: doctors } = useDoctors("");

  const [selectedDoctors, setSelectedDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize language and selected doctors for edit mode
  useEffect(() => {
    if (initValues) {
      const selectedLang = initValues?.lang || "en";
      setLang(selectedLang);

      const formattedDoctors =
        initValues?.doctors?.map((doctor: any) => ({
          value: doctor.id,
          label:
            doctor.name?.[selectedLang] ??
            doctor.name?.en ??
            doctor.name ??
            "Unknown",
        })) || [];

      setSelectedDoctors(formattedDoctors);
    }
  }, [initValues]);

  // ✅ Update selected doctor labels when switching language
  useEffect(() => {
    if (selectedDoctors.length > 0 && doctors?.data) {
      setSelectedDoctors((prev) =>
        prev.map((doctor) => {
          const found = doctors.data.find((d: any) => d.id === doctor.value);
          return {
            ...doctor,
            label: found?.name?.[lang] ?? found?.name?.en ?? doctor.label,
          };
        })
      );
    }
  }, [lang, doctors]);

  const onSubmit: SubmitHandler<PackageFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      description: data.description,
      discount: data.discount,
      price: data.price,
      sessions_count: data.sessions_count,
      type: data.type,
      // doctors: selectedDoctors.map((doctor) => doctor.value),
    };

    if (initValues) {
      updatePackage({ coupon_id: initValues.id, ...requestBody });
    } else {
      createPackage(requestBody);
    }

    setLoading(true);
  };

  if (isCreating || isUpdating) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<PackageFormInput>
      onSubmit={onSubmit}
      validationSchema={packageFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || "",
            ar: initValues?.name?.ar || "",
          },
          description: {
            en: initValues?.description?.en || "",
            ar: initValues?.description?.ar || "",
          },
          discount: initValues?.discount || "",
          price: initValues?.price || "",
          type: initValues?.type || "offer",
          // doctors: initValues?.doctors || [],
          sessions_count: initValues?.sessions_count || "",
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors } }) => (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? "Update Package" : "Create Package"}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          {/* Language Switch */}
          <div className="flex gap-3">
            <Checkbox label="English" checked={lang === "en"} onChange={() => setLang("en")} />
            <Checkbox label="Arabic" checked={lang === "ar"} onChange={() => setLang("ar")} />
          </div>

          {/* Multilingual Name Field */}
          {lang === "en" ? (
            <Input
              key={"name.en"}
              label="Package Name (English)"
              {...register("name.en")}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
              key={"name.ar"}
              label="Package Name (Arabic)"
              {...register("name.ar")}
              error={errors.name?.ar?.message}
            />
          )}

          {/* Multilingual Description Field */}
          {lang === "en" ? (
            <Input
              key={"description.en"}
              label="Description (English)"
              {...register("description.en")}
              error={errors.description?.en?.message}
            />
          ) : (
            <Input
              key={"description.ar"}
              label="Description (Arabic)"
              {...register("description.ar")}
              error={errors.description?.ar?.message}
            />
          )}

          {/* Type Field */}
          <div>
            <label>Type</label>
            <select {...register("type")} className="w-full border border-gray-300 rounded-lg p-2">
              <option value="offer">Offer</option>
              <option value="package">Package</option>
            </select>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          {/* Price Field */}
          <Input
            label="Price"
            type="number"
            {...register("price")}
            error={errors.price?.message}
          />

          {/* Discount Field */}
          <Input
            label="Discount"
            type="number"
            {...register("discount")}
            error={errors.discount?.message}
          />

          {/* Sessions Count Field */}
          <Input
            label="Number of Sessions"
            type="number"
            {...register("sessions_count")}
            error={errors.sessions_count?.message}
          />

          {/* Doctors Multi-Select */}
          {/* <div>
            <label className="block mb-2 font-medium">Doctors</label>
            {!doctors ? (
              <p className="text-sm text-gray-500">Loading doctors...</p>
            ) : doctors?.data?.length === 0 ? (
              <p className="text-sm text-gray-500">No doctors found.</p>
            ) : (
              <Select
                isMulti
                options={doctors.data.map((doctor: any) => ({
                  value: doctor.id,
                  label: doctor.name?.[lang] ?? doctor.name?.en ?? doctor.name,
                }))}
                value={selectedDoctors}
                onChange={(selected) => setSelectedDoctors(selected || [])}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                placeholder={lang === "ar" ? "اختر الأطباء" : "Select doctors"}
              />
            )}
            {errors.doctors && (
              <p className="text-sm text-red-500 mt-1">{errors.doctors.message}</p>
            )}
          </div> */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
