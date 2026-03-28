'use client';

import { useModal } from '@/app/shared/modal-views/use-modal';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Title } from '@/components/ui/text';

import { useState } from 'react';
import { Controller, SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import CreatableSelect from 'react-select';
import { Textarea } from 'rizzui';

import { DatePicker } from '@/components/ui/datepicker';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import { formatDate } from '@/utils/format-date';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import FormGroup from '../form-group';
import { useCreateBrand, useUpdateBrand } from '@/framework/brand';
import {
  ReviewFormInput,
  ReviewFormSchema,
} from '@/utils/validators/review-form.schema';
import {
  useCreateClientReview,
  useUpdateClientReview,
} from '@/framework/client-review';

export default function UpdateCreateBrand({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const { mutate: update } = useUpdateClientReview();
  const { mutate: create, isPending } = useCreateClientReview();
  const [isoading, setLoading] = useState(false);
  const [isImageData, setImage] = useState(initValues ? initValues?.image : null);
  let [imageError, setImageError] = useState(0);
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
        console.log(response.data.data);
        if (type === 'Image') {
          setImage(response.data.data);
        }
        toast.success(`${type} Uploaded successfully`);
      })
      .catch((error) => {
        console.log(error);
        toast.error('Please Try Again');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit: SubmitHandler<ReviewFormInput> = (data) => {

    console.log(data);
    // if (!isImageData) {
    //   setImageError(1);
    // } else {
    //   if (initValues) {
    //     // lang == 'en' ? setNameEn(data.name) : setNameAr(data.name)
    //     update({
    //       ...data,
    //       title: {
    //         en: data.titleEN,
    //         ar: data.titleAR,
    //       },
    //       name: {
    //         en: data.nameEN,
    //         ar: data.nameAR,
    //       },
    //       position: {
    //         en: data.positionEN,
    //         ar: data.positionAR,
    //       },
    //       text: {
    //         en: data.textEN,
    //         ar: data.textAR,
    //       },
    //       rate: data.rate,
    //       image: isImageData || initValues.image,
    //       brand_id: initValues.id,
    //     });
    //   } else {
    //     create({
    //       ...data,
    //       title: {
    //         en: data.titleEN,
    //         ar: data.titleAR,
    //       },
    //       name: {
    //         en: data.nameEN,
    //         ar: data.nameAR,
    //       },
    //       position: {
    //         en: data.positionEN,
    //         ar: data.positionAR,
    //       },
    //       text: {
    //         en: data.textEN,
    //         ar: data.textAR,
    //       },
    //       rate: data.rate,
    //       image: isImageData,
    //     });
    //   }
    //   setReset({
    //     roleName: '',
    //   });

    //   closeModal();
    // }

    if (initValues) {
      // lang == 'en' ? setNameEn(data.name) : setNameAr(data.name)
      update({
        ...data,
        title: {
          en: data.titleEN,
          ar: data.titleAR,
        },
        name: {
          en: data.nameEN,
          ar: data.nameAR,
        },
        position: {
          en: data.positionEN,
          ar: data.positionAR,
        },
        text: {
          en: data.textEN,
          ar: data.textAR,
        },
        rate: data.rate,
        image: isImageData || initValues.image,
        brand_id: initValues.id,
      });
    } else {
      create({
        ...data,
        title: {
          en: data.titleEN,
          ar: data.titleAR,
        },
        name: {
          en: data.nameEN,
          ar: data.nameAR,
        },
        position: {
          en: data.positionEN,
          ar: data.positionAR,
        },
        text: {
          en: data.textEN,
          ar: data.textAR,
        },
        rate: data.rate,
        image: isImageData,
      });
    }
  };

  return (
    <>
      <Form<ReviewFormInput>
        resetValues={reset}
        onSubmit={onSubmit}
        validationSchema={ReviewFormSchema}
        useFormProps={{
          defaultValues: {
            titleEN: initValues?.title?.en || '',
            titleAR: initValues?.title?.ar || '',
            nameEN: initValues?.name?.en || '',
            nameAR: initValues?.name?.ar || '',
            positionEN: initValues?.position?.en || '',
            positionAR: initValues?.position?.ar || '',
            textEN: initValues?.text?.en || '',
            textAR: initValues?.text?.ar || '',
            rate: initValues?.rate
          },
        }}
        className="flex flex-grow flex-col gap-6 overflow-y-auto p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
      >
        {({
          register,
          getValues,
          control,
          setValue,
          formState: { errors, isLoading },
        }) => {
          return (
            <>
              <div className="flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                  {initValues ? 'Update Review' : 'Add a new Review'}
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                  <PiXBold className="h-auto w-5" />
                </ActionIcon>
              </div>

              <Input
                label={'Title (EN)'}
                placeholder={'TitleEN'}
                {...register('titleEN')}
                error={errors.titleEN?.message}
              />
              <Input
                label={'Title (AR)'}
                placeholder={'Title (AR)'}
                {...register('titleAR')}
                error={errors.titleAR?.message}
              />

              <Input
                label={'Name (EN)'}
                placeholder={'NameEN'}
                {...register('nameEN')}
                error={errors.nameEN?.message}
              />
              <Input
                label={'Name (AR)'}
                placeholder={'Name (AR)'}
                {...register('nameAR')}
                error={errors.nameAR?.message}
              />

              <Input
                label={'Position (EN)'}
                placeholder={'Position EN'}
                {...register('positionEN')}
                error={errors.positionEN?.message}
              />
              <Input
                label={'Position (AR)'}
                placeholder={'PositionAR'}
                {...register('positionAR')}
                error={errors.positionAR?.message}
              />

              <div>
                <label className="text-sm text-gray-700">Rate</label>
                <Controller
                  name="rate"
                  control={control}
                  render={({ field }) => (
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={field.value != null ? String(field.value) : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v ? parseInt(v, 10) : undefined);
                      }}
                    >
                      <option value="">Select rating</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  )}
                />
                {errors.rate && (
                  <p className="text-sm text-red-500">{errors.rate.message as any}</p>
                )}
              </div>


              <Textarea
                label={'Text (EN)'}
                placeholder={'TextEN'}
                {...register('textEN')}
                error={errors.textEN?.message}
              />
              <Textarea
                label={'Text (AR)'}
                placeholder={'TextAR'}
                {...register('textAR')}
                error={errors.textAR?.message}
              />
              
              <FormGroup
                title="Image"
                className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                {isoading && (
                  <div className="absolute z-10 m-auto flex h-[100%] w-[100%] items-center justify-center ">
                    <Spinner size="xl" />
                  </div>
                )}
                <Upload
                  title="image"
                  accept="img"
                  onChange={(e) => {
                    setImageError(0);
                    handleFileUpload(e, 'Image');
                  }}
                />
                {imageError ? (
                  // "faried Error"
                  <p className="rizzui-input-error-text mt-0.5 text-xs text-red">
                    Image Requerd
                  </p>
                ) : (
                  ''
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
              </FormGroup>

              <div className="flex items-center justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="w-full @xl:w-auto"
                >
                  {'Cancel'}
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full @xl:w-auto"
                >
                  {initValues ? 'Update Review' : 'Create Review'}
                </Button>
              </div>
            </>
          );
        }}
      </Form>
    </>
  );
}
