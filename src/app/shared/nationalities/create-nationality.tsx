"use client"

import { useState } from "react"
import { PiXBold } from "react-icons/pi"
import type { SubmitHandler } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ActionIcon } from "@/components/ui/action-icon"
import { Title } from "@/components/ui/text"
import { useModal } from "@/app/shared/modal-views/use-modal"
import { type CreatePermitionInput, createPermitionSchema } from "@/utils/validators/create-permition.schema"
import { useCreateNationality, useUpdateNationality } from "@/framework/nationality"
export default function CreateNationality({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal()
  const [lang, setLang] = useState<"en" | "ar">("en")
  const [isLoading, setLoading] = useState(false)
  const { mutate, isPending } = useCreateNationality()
  const { mutate: update } = useUpdateNationality()
console.log(initValues);

  const onSubmit: SubmitHandler<CreatePermitionInput> = (data) => {
    if (initValues) {
      update({
        role_id: initValues?.id,
        name: data.name,
      })
    } else {
      mutate({
        name: data.name,
      })
    }

    setLoading(isPending)
    // closeModal();
  }

  return (
    <Form<CreatePermitionInput>
      onSubmit={onSubmit}
      validationSchema={createPermitionSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || "",
            ar: initValues?.name?.ar || "",
          },
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? "Update Nationality" : "Add a new Nationality"}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <div className="flex flex-wrap px-1 gap-3">
            <Checkbox
              key={0}
              label={"English"}
              checked={lang === "en"}
              onChange={() => setLang("en")}
            />
            <Checkbox
              key={1}
              label={"Arabic"}
              checked={lang === "ar"}
              onChange={() => setLang("ar")}
            />
          </div>

          {lang === "en" ? (
            <Input
            key={"name.en"}
              label="Nationality Name (English)"
              placeholder="Enter English name"
              {...register("name.en")}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"name.ar"}
              label="Nationality Name (Arabic)"
              placeholder="أدخل الاسم بالعربية"
              {...register("name.ar")}
              error={errors.name?.ar?.message}
            />
          )}

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={closeModal} className="w-full @xl:w-auto">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-full @xl:w-auto">
              {initValues ? "Update Nationality" : "Create Nationality"}
            </Button>
          </div>
        </>
      )}
    </Form>
  )
}
