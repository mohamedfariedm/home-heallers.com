'use client';

import FormGroup from '@/app/shared/form-group';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import { useUpdateSettings } from '@/framework/site-settings';
import { settingsFormSchema, SettingsFormTypes } from '@/utils/validators/settings.schema';

import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Checkbox, Input, Textarea } from 'rizzui';

export default function SettingsForm({
  settings,
}: {
  settings?: SettingsFormTypes;
}) {
  const { mutate: update, isPending } = useUpdateSettings();
  const [isoading, setLoading] = useState(false);
  const [isImageData, setImage] = useState(settings?.logo);
  const [reset, setReset] = useState({});
  const [teamActivation, setTeamActivation] = useState<number>(
    settings?.section_team === true ? 1 : 0
  );
  const [reportsActivation, setReportsActivation] = useState<number>(
    settings?.report_control === true ? 1 : 0
  );
  const [incubatorsActivation, setIncubatorsActivation] = useState<number>(
    settings?.incupator_control === true ? 1 : 0
  );
  const [previousIncubatorsActivation, setPreviousIncubatorsActivation] =
    useState<number>(settings?.active_previous === true ? 1 : 0);
  const [partnersActivation, setPartnersActivation] = useState<number>(
    settings?.partner_control === true ? 1 : 0
  );
  const [mediaCenterActivation, setMediaCenterActivation] = useState<number>(
    settings?.media_center === true ? 1 : 0
  );
  const [
    mediaCenterBrandIdentityActivation,
    setMediaCenterBrandIdentityActivation,
  ] = useState<number>(settings?.media_center_brand_identity === true ? 1 : 0);
  const [mediaCenterImagesActivation, setMediaCenterImagesActivation] =
    useState<number>(settings?.media_center_image === true ? 1 : 0);
  const [mediaCenterVideosActivation, setMediaCenterVideosActivation] =
    useState<number>(settings?.media_center_video === true ? 1 : 0);
  const onSubmit: SubmitHandler<SettingsFormTypes> = (data) => {
    update({
      setting: {
        ...data,
        logo: isImageData,
        section_team: teamActivation ? true : false,
        report_control: reportsActivation ? true : false,
        incupator_control: incubatorsActivation ? true : false,
        active_previous: previousIncubatorsActivation ? true : false,
        partner_control: partnersActivation ? true : false,
        media_center: mediaCenterActivation ? true : false,
        media_center_brand_identity: mediaCenterBrandIdentityActivation
          ? true
          : false,
        media_center_image: mediaCenterImagesActivation ? true : false,
        media_center_video: mediaCenterVideosActivation ? true : false,
        social: {
          twetter: data.social.twetter,
          snapchat: data.social.snapchat,
          instgram: data.social.instgram,
          linked_in: data.social.linked_in,
          tiktok: data.social.tiktok,
          whatsapp: data.social.whatsapp,
        },
      },
    });
  };

  const handleFileUpload = (event: any) => {
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
        setImage(response.data.data);
        setLoading(false);
        toast.success('Image Uploaded successfuly');
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error('Please Try Again');
      });
  };

  return (
    <>
      <Form<SettingsFormTypes>
        validationSchema={settingsFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues: {
            ...settings,
          },
        }}
      >
        {({ register, control, formState: { errors }, watch }) => {
          return (
            <div className="mx-auto w-full max-w-screen-2xl">
              <h2 className="text-xl underline underline-offset-8">Socials</h2>
              <FormGroup
                title="Twetter"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Twetter"
                  {...register('social.twetter')}
                />
              </FormGroup>
              <FormGroup
                title="snapchat"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="snapchat"
                  {...register('social.snapchat')}
                />
              </FormGroup>
              <FormGroup
                title="Instgram"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Instgram"
                  {...register('social.instgram')}
                />
              </FormGroup>
              <FormGroup
                title="Linkedin"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Linkedin"
                  {...register('social.linked_in')}
                />
              </FormGroup>
              <FormGroup
                title="whatsapp"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="whatsapp"
                  {...register('social.whatsapp')}
                />
              </FormGroup>
              {/* <FormGroup
                title="Snabchat"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Snabchat"
                  {...register('social.snabchat')}
                />
              </FormGroup> */}
              {/* <h2 className="mt-11 text-xl underline underline-offset-8">
                Terms of use
              </h2>
              <FormGroup
                title="Terms of use (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Textarea
                  dir="rtl"
                  className="col-span-full"
                  placeholder="Terms of use (AR)"
                  {...register('Terms_of_use.ar')}
                  error={errors?.['Terms_of_use']?.ar?.message}
                />
              </FormGroup> */}
              {/* <FormGroup
                title="Terms of use (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Textarea
                  className="col-span-full"
                  placeholder="Terms of use (EN)"
                  {...register('Terms_of_use.en')}
                  error={errors?.['Terms_of_use']?.en?.message}
                />
              </FormGroup> */}
              {/* <h2 className="mt-11 text-xl underline underline-offset-8">
                privacy policy
              </h2>{' '}
              <FormGroup
                title="privacy policy (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Textarea
                  dir="rtl"
                  className="col-span-full"
                  placeholder="privacy policy (AR)"
                  {...register('privacy_policy.ar')}
                  error={errors?.['privacy_policy']?.ar?.message}
                />
              </FormGroup> */}
              {/* <FormGroup
                title="privacy policy (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Textarea
                  className="col-span-full"
                  placeholder="privacy policy (EN)"
                  {...register('privacy_policy.en')}
                  error={errors?.['privacy_policy']?.en?.message}
                />
              </FormGroup>{' '} */}
              <h2 className="mt-11 text-xl underline underline-offset-8">
                Company Information
              </h2>{' '}
              {/* <FormGroup
                title="name"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="name"
                  {...register('company_information.name')}
                  // error={errors.company_information?.name?.message}
                />
              </FormGroup> */}
              <FormGroup
                title="Email Name (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Email"
                  {...register('company_information.email.hint_ar')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Email Name (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Email"
                  {...register('company_information.email.hint_en')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Email"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Email"
                  {...register('company_information.email.value')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Phone Name (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Phone Name Er"
                  {...register('company_information.phone.hint_ar')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Phone Name (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Phone Name En"
                  {...register('company_information.phone.hint_en')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Phone"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Phone"
                  {...register('company_information.phone.value')}
                  // error={errors.company_information?.phone?.message}
                />
              </FormGroup>


              {/* <FormGroup
                title="Location Name (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="location Name Er"
                  {...register('company_information.location.hint_ar')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Location Name (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="location Name En"
                  {...register('company_information.location.hint_en')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Latitude"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Latitude"
                  {...register('company_information.location.Latitude')}
                  // error={errors.company_information?.Latitude?.message}
                />
              </FormGroup>

              <FormGroup
                title="Longitude"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Longitude"
                  {...register('company_information.location.longitude')}
                  // error={errors.company_information?.longitude?.message}
                />
              </FormGroup> */}


              {/* <h2 className="mt-11 text-xl underline underline-offset-8">
              General Post
              </h2>
              <FormGroup
                title="First Title (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Latitude"
                  {...register('general_post.first_title_ar')}
                  // error={errors.company_information?.Latitude?.message}
                />
              </FormGroup>
              <FormGroup
                title="First Title (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Latitude"
                  {...register('general_post.first_title_en')}
                  // error={errors.company_information?.Latitude?.message}
                />
              </FormGroup>
              <FormGroup
                title="Second Title (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Latitude"
                  {...register('general_post.second_title_ar')}
                  // error={errors.company_information?.Latitude?.message}
                />
              </FormGroup>
              <FormGroup
                title="Second Title (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Latitude"
                  {...register('general_post.second_title_en')}
                  // error={errors.company_information?.Latitude?.message}
                />
              </FormGroup>
              <FormGroup
                title="Descreption (AR)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="location Name Er"
                  {...register('general_post.descreption_ar')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Descreption (EN)"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="location Name En"
                  {...register('general_post.descreption_en')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup>
              <FormGroup
                title="Value"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <Input
                  type="text"
                  className="col-span-full"
                  placeholder="Value"
                  {...register('general_post.value')}
                  // error={errors.company_information?.email?.message}
                />
              </FormGroup> */}

              {/* <FormGroup
                title=""
                className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                {isoading ? (
                  <div className="absolute z-10 m-auto flex h-[100%] w-[100%] items-center justify-center ">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  ''
                )}
                <Upload accept="img" onChange={handleFileUpload} />
              </FormGroup>{' '} */}
              {/* <h2 className="mt-11 text-xl underline underline-offset-8">
                Toggle Sections
              </h2>{' '}
              <FormGroup
                title="Center Team Section"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={teamActivation == 1}
                    onChange={() => setTeamActivation(teamActivation ? 0 : 1)}
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={teamActivation == 0}
                    onChange={() => setTeamActivation(teamActivation ? 0 : 1)}
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Reports Section"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={reportsActivation == 1}
                    onChange={() =>
                      setReportsActivation(reportsActivation ? 0 : 1)
                    }
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={reportsActivation == 0}
                    onChange={() =>
                      setReportsActivation(reportsActivation ? 0 : 1)
                    }
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Incubators Section"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={incubatorsActivation == 1}
                    onChange={() =>
                      setIncubatorsActivation(incubatorsActivation ? 0 : 1)
                    }
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={incubatorsActivation == 0}
                    onChange={() =>
                      setIncubatorsActivation(incubatorsActivation ? 0 : 1)
                    }
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Previous Incubators Page"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={previousIncubatorsActivation == 1}
                    onChange={() =>
                      setPreviousIncubatorsActivation(
                        previousIncubatorsActivation ? 0 : 1
                      )
                    }
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={previousIncubatorsActivation == 0}
                    onChange={() =>
                      setPreviousIncubatorsActivation(
                        previousIncubatorsActivation ? 0 : 1
                      )
                    }
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Partners Section"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={partnersActivation == 1}
                    onChange={() =>
                      setPartnersActivation(partnersActivation ? 0 : 1)
                    }
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={partnersActivation == 0}
                    onChange={() =>
                      setPartnersActivation(partnersActivation ? 0 : 1)
                    }
                  />
                </div>
              </FormGroup> */}
              {/* <h3 className="mt-6 !text-lg underline underline-offset-4">
                Media Center Control
              </h3>{' '}
              <FormGroup
                title="Media Center page"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={mediaCenterActivation == 1}
                    onChange={() => setMediaCenterActivation(mediaCenterActivation ? 0 : 1)}
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={mediaCenterActivation == 0}
                    onChange={() => setMediaCenterActivation(mediaCenterActivation ? 0 : 1)}
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Brand Identity"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={mediaCenterBrandIdentityActivation == 1}
                    onChange={() => setMediaCenterBrandIdentityActivation(mediaCenterBrandIdentityActivation ? 0 : 1)}
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={mediaCenterBrandIdentityActivation == 0}
                    onChange={() => setMediaCenterBrandIdentityActivation(mediaCenterBrandIdentityActivation ? 0 : 1)}
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Images Library"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={mediaCenterImagesActivation == 1}
                    onChange={() => setMediaCenterImagesActivation(mediaCenterImagesActivation ? 0 : 1)}
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={mediaCenterImagesActivation == 0}
                    onChange={() => setMediaCenterImagesActivation(mediaCenterImagesActivation ? 0 : 1)}
                  />
                </div>
              </FormGroup>
              <FormGroup
                title="Videos Library"
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="flex flex-wrap gap-3 px-1">
                  <Checkbox
                    key={1}
                    label={'Active'}
                    checked={mediaCenterVideosActivation == 1}
                    onChange={() => setMediaCenterVideosActivation(mediaCenterVideosActivation ? 0 : 1)}
                  />
                  <Checkbox
                    key={0}
                    label={'Not Active'}
                    checked={mediaCenterVideosActivation == 0}
                    onChange={() => setMediaCenterVideosActivation(mediaCenterVideosActivation ? 0 : 1)}
                  />
                </div>
              </FormGroup> */}
              <div className="mt-6 flex w-auto items-center justify-end gap-3">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                  variant="solid"
                  className="dark:bg-gray-100 dark:text-white"
                >
                  Update
                </Button>
              </div>
            </div>
          );
        }}
      </Form>
    </>
  );
}

// Logged devices
