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
import { useCreateCategory, useUpdateCategory } from "@/framework/categories"
import FormGroup from "../form-group"
import Spinner from "@/components/ui/spinner"
import Upload from "@/components/ui/upload"
import axios from "axios"
import Cookies from "js-cookie"
import toast from "react-hot-toast"

export default function CreateCategories({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal()
  const [lang, setLang] = useState<"en" | "ar">("en")
  const [isLoading, setLoading] = useState(false)
  const { mutate, isPending } = useCreateCategory()
  const { mutate: update } = useUpdateCategory()
console.log(initValues);
  const [isImageData, setImage] = useState(initValues?.image || null);
  const [imageError, setImageError] = useState(0);
  const handleFileUpload = (event: any, type: 'Image' | 'File') => {
    setLoading(true);
    const file = event.target.files?.[0];
    const formData = new FormData();
    formData.append('attachment[]', file);

    axios
      .post(process.env.NEXT_PUBLIC_ATTACHMENT_URL as string, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
        },
      })
      .then((response) => {
        if (type === 'Image') {
          setImage(response.data.data);
        }
        toast.success(`${type} Uploaded successfully`);
      })
      .catch(() => toast.error('Please Try Again'))
      .finally(() => setLoading(false));
  };
  const onSubmit: SubmitHandler<CreatePermitionInput> = (data) => {
    if (initValues) {
      update({
        role_id: initValues?.id,
        name: data.name,
        image: isImageData || initValues?.image,
      })
    } else {
      mutate({
        name: data.name,
        image: isImageData || initValues?.image,
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
      {({ register, formState: { errors } }) => {
            console.log(errors);
            
        return <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? "Update Category" : "Add a new Category"}
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
              label="Category Name (English)"
              placeholder="Enter English name"
              {...register("name.en")}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"name.ar"}
              label="Category Name (Arabic)"
              placeholder="أدخل الاسم بالعربية"
              {...register("name.ar")}
              error={errors.name?.ar?.message}
            />
          )}
                      <FormGroup
                        title="Image"
                        className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                      >
                        {isLoading && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-md">
                            <Spinner size="xl" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Upload
                            title="Image"
                            accept="img"
                            onChange={(e) => {
                              setImageError(0);
                              handleFileUpload(e, 'Image');
                            }}
                          />
                          {imageError > 0 && (
                            <p className="text-xs text-red-500">Image is required.</p>
                          )}
                          {(isImageData?.[0]?.thumbnail || isImageData?.[0]?.original) && (
                            <div className="relative flex justify-center items-center w-full mt-2">
                              <img
                                src={isImageData[0].thumbnail || isImageData[0].original}
                                alt="Uploaded Preview"
                                className="w-48 h-auto rounded border border-gray-200 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setImage(null)}
                                className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-50"
                                title="Remove Image"
                              >
                                <PiXBold className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormGroup>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={closeModal} className="w-full @xl:w-auto">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-full @xl:w-auto">
              {initValues ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </>
      }

      }
    </Form>
  )
}
