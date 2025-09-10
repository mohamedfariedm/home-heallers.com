'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiEnvelopeSimple, PiSealCheckFill } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import SelectBox from '@/components/ui/select';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import AvatarUpload from '@/components/ui/file-upload/avatar-upload';
import {
  profileFormSchema,
  ProfileFormTypes,
} from '@/utils/validators/profile-settings.schema';
import { roles } from '@/data/forms/my-details';
import FormGroup from '@/app/shared/form-group';
import Link from 'next/link';
import FormFooter from '@/components/form-footer';
import UploadZone from '@/components/ui/file-upload/upload-zone';
import cn from '@/utils/class-names';
import { useLayout } from '@/hooks/use-layout';
import { useBerylliumSidebars } from '@/layouts/beryllium/beryllium-utils';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { useRoles } from '@/framework/roles';
import { DatePicker } from '@/components/ui/datepicker';
import { useState } from 'react';
import Spinner from '@/components/ui/spinner';
import { useUpdateUser } from '@/framework/users';
import { log } from 'console';
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
});
let imageFile:any="";

export default function ProfileSettingsView({ initValues }: {
  initValues?: any
}) {

  const [gender, setGender] = useState<number>(1)
  const { data:rolesData, isLoading: isRolesLOading} = useRoles('')
  const [selectedImage, setSelectedImage] = useState(null);
  const { mutate: update, isPending } = useUpdateUser();

  const onSubmit: SubmitHandler<ProfileFormTypes> = (data) => {
    const Month = data?.birth_date?.getMonth() + 1 <10 ? `0${data?.birth_date?.getMonth() + 1}` : `${data?.birth_date?.getMonth() + 1}`
    const Day = data?.birth_date?.getDate() < 10 ? `0${data?.birth_date?.getDate()}` : `${data?.birth_date?.getDate()}`
    const formatedDate = `${data?.birth_date?.getFullYear()}-${Month}-${Day}`
    console.log(data);

    update({
      user_id: initValues?.id,
      name: data?.name,
      email:data?.email,
      address:data?.address,
      role:data?.role,
      gendor: gender,
      birth_date: data?.birth_date ? formatedDate : initValues?.birth_date,
      image:imageFile,
      phone: data?.phone,
      mac_id:data?.mac_id||"",
      password:data?.confirmPassword||"",
    })
  };





  var today = new Date(),
  date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  
  return (
    <>
                  <ProfileHeader
                title={`${initValues?.name} (${initValues?.roles[0]?.name})`}
                description={`${initValues?.email}`}
                image={`${initValues?.image||""}`}
              >
              </ProfileHeader>

              {
        isRolesLOading ? (
            <div className="m-auto">
                <Spinner size="lg" />
            </div>
        ) : (
      <Form<ProfileFormTypes>
        validationSchema={profileFormSchema}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          defaultValues: {
          name: initValues?.name || 'mohamed',
          phone: initValues?.phone || "",
          email: initValues?.email || '',
          address: initValues?.address || '',
          mac_id:initValues?.mac_id  || '',
          role:initValues?.roles[0]?.id|| '',
          image:imageFile,
          birth_date:new Date(initValues?.birth_date||date)
          }
      }}
      >
        {({
          register,
          control,
          getValues,
          setValue,
          formState: { errors },
        }) => {
          console.log(errors);
          
          return (
            <>


              <div className="mx-auto mb-10 grid w-full max-w-screen-2xl gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                <FormGroup
                  title="Username"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                  type='text'
                    className="col-span-full"
                    placeholder="First Name"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                </FormGroup>
                <FormGroup
                  title="password"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                  // type='password'
                    className="col-span-full"
                    placeholder="New password"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <Input
                  // type='password'
                    className="col-span-full"
                    placeholder="Confirm New Password"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    />
                </FormGroup>

                <FormGroup
                  title="Phone Number"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <Input
                    type="tel"
                    placeholder="05xxxxxxxx"
                    className="col-span-full"
                    {...register('phone')}
                    error={errors.phone?.message}
                    />
                </FormGroup>
                <FormGroup
                  title="Email"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                    <Input
                    type="email"
                    placeholder="Enter your email"
                    className="col-span-full"
                    {...register('email')}
                    error={errors.email?.message}
                    />
                </FormGroup>
                <FormGroup
                  title="Mac-ID"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                    <Input
                    placeholder="Mac Id"
                    className="col-span-full"
                    {...register('mac_id')}
                    error={errors.mac_id?.message}
                    />
                </FormGroup>
                <FormGroup
                        title="Role"
                        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                        <Controller
                            control={control}
                            name="role"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select Role"
                                options={ rolesData?.data?.roles?.map((role: any) =>{ return {...role, value: role.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>
                                  rolesData?.data?.roles?.find((r: any) => r.id === selected)?.name ?? selected
                                }
                                error={errors?.role?.message as string}
                            />
                            )}
                        />
                        </FormGroup>
                <FormGroup
                  title="Address"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                    <Input
                    placeholder="address..."
                    className="col-span-full"
                    {...register('address')}
                    error={errors.address?.message}
                    />
                </FormGroup>

                <FormGroup
                  title="Your Photo"
                  description="This will be displayed on your profile."
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-2 flex flex-col items-center gap-4 @xl:flex-row">
                    <div>

                  {selectedImage? 
                                    <div>
                                    <Image
                                        alt="not found"
                                        width={250}
                                        height={250}
                                        src={URL.createObjectURL(selectedImage)||`${initValues?.image}`}
                                    />
                                    <br />
                                    </div>
                                :initValues?.image?<div>
                                <Image
                                    alt="not found"
                                    width={250}
                                    height={250}
                                    src={`${initValues?.image}`}
                                />
                                <br />
                                </div>:""}      

                                <input
                                    type="file"
                                    name="myImage"
                                    onChange={(event) => {
                                    const reader:any=new FileReader();
                                    //@ts-ignore
                                    const file:any=event.target.files[0];
                                    setSelectedImage(file);
                                    reader.addEventListener("load",()=>{
                                        //@ts-ignore
                                        imageFile=reader.result.replace("data:image/jpeg;base64,", '')                                       
                                    })
                                    reader.readAsDataURL(file);
                                    }}
                                />
                    </div>
                  </div>
                </FormGroup>

                <FormGroup
                  title="Birth Date"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="@3xl:col-span-2">
                  <Controller
                            name="birth_date"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                            <DatePicker
                                placeholderText="Select Date"
                                dateFormat="yyyy MM dd"
                                selected={value}
                                isClearable
                                onChange={onChange}
                            />
                            )}
                        />
                        {errors.birth_date && (
                            <p className="text-red-600 text-xs cursor-default">
                            {errors.birth_date.message as string}
                          </p>
                        )}
                  </div>
                </FormGroup>

                <FormGroup
                  title="Gender"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                >
                  <div className="col-span-full">
                  <div className='flex flex-wrap px-1 gap-3'>
                  <Checkbox
                            key={1} 
                            label={'Male'}
                            checked={gender == 1}
                            // value={permission.id}
                            onChange={ () => setGender(gender ? 0 : 1) }
                        />
                        <Checkbox
                            key={0} 
                            label={'Female'}
                            checked={gender == 0}
                            // value={permission.id}
                            onChange={ () => setGender(gender ? 0 : 1) }
                        />
                        </div>
                  </div>
                </FormGroup>

              </div>
              <FormFooter
                // isLoading={isLoading}
                altBtnText="Cancel"
                submitBtnText="Save"
              />
            </>
          );
        }}
      </Form>
              )
            }
    </>
  );
}

export function ProfileHeader({
  title,
  description,
  children,
  image
}: React.PropsWithChildren<{ title: string; description?: string;image:string }>) {
  const { layout } = useLayout();
  const { expandedLeft } = useBerylliumSidebars();

  return (
    <div
      className={cn(
        'relative z-0 -mx-4 px-4 pt-28 before:absolute before:start-0 before:top-0 before:h-40 before:w-full before:bg-gradient-to-r before:from-[#F8E1AF] before:to-[#F6CFCF] @3xl:pt-[190px] @3xl:before:h-[calc(100%-120px)] dark:before:from-[#bca981] dark:before:to-[#cbb4b4] md:-mx-5 md:px-5 lg:-mx-8 lg:px-8 xl:-mx-6 xl:px-6 3xl:-mx-[33px] 3xl:px-[33px] 4xl:-mx-10 4xl:px-10',
        layout === LAYOUT_OPTIONS.BERYLLIUM && expandedLeft
          ? 'before:start-5 3xl:before:start-[25px]'
          : 'xl:before:w-[calc(100%_+_10px)]'
      )}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-wrap items-end justify-start gap-6 border-b border-dashed border-gray-300 pb-10">
        <div className="relative -top-1/3 aspect-square w-[110px] overflow-hidden rounded-full border-[6px] border-white bg-gray-100 shadow-profilePic @2xl:w-[130px] @5xl:-top-2/3 @5xl:w-[150px] dark:border-gray-50 3xl:w-[200px]">
          <Image
            src={`${image}`}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw"
            className="aspect-auto"
          />
        </div>
        <div>
          <Title
            as="h2"
            className="mb-2 inline-flex items-center gap-3 text-xl font-bold text-gray-900"
          >
            {title}
            <PiSealCheckFill className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </Title>
          {description ? (
            <Text className="text-sm text-gray-500">{description}</Text>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
