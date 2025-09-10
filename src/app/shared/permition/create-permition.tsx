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
import { useCreatePermissions, useUpdatePermition } from "@/framework/permitions"
import { type CreatePermitionInput, createPermitionSchema } from "@/utils/validators/create-permition.schema"

export default function CreatePermition({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal()
  const [lang, setLang] = useState<"en" | "ar">("en")
  const [isLoading, setLoading] = useState(false)
  const { mutate, isPending } = useCreatePermissions()
  const { mutate: update } = useUpdatePermition()
console.log(initValues);

  const onSubmit: SubmitHandler<CreatePermitionInput> = (data) => {
    if (initValues) {
      update({
        role_id: initValues?.id,
        name: data.name,
        guard_name:data.guard_name,
      })
    } else {
      mutate({
        name: data.name,
        guard_name:data.guard_name,
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
          name: initValues?.name || "",
          guard_name: initValues?.guard_name || "",
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? "Update Permission" : "Add a new Permission"}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Input
          key={"name"}
            label="Permission Name (English)"
            placeholder="Enter English name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
          key={"guard_name"}
            label="Guard Name"
            placeholder="Guard Name"
            {...register("guard_name")}
            error={errors.guard_name?.message}
          />




          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={closeModal} className="w-full @xl:w-auto">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-full @xl:w-auto">
              {initValues ? "Update Permission" : "Create Permission"}
            </Button>
          </div>
        </>
      )}
    </Form>
  )
}
