import React, { useMemo, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { ActionIcon, Checkbox, Switch } from 'rizzui';
import { useModal } from '../modal-views/use-modal';
import { useCreateDoctors, useUpdateDoctors } from '@/framework/doctors';
import { DoctorFormInput, doctorFormSchema } from '@/utils/validators/doctors-form-schema';
import { useNationality } from '@/framework/nationality';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import FormGroup from '../form-group';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import { useServices } from '@/framework/services';
import SelectBox, { type SelectOption } from '@/components/ui/select';

const bloodGroups = [
  { id: 'A+', name: 'A+' },
  { id: 'A-', name: 'A-' },
  { id: 'B+', name: 'B+' },
  { id: 'B-', name: 'B-' },
  { id: 'AB+', name: 'AB+' },
  { id: 'AB-', name: 'AB-' },
  { id: 'O+', name: 'O+' },
  { id: 'O-', name: 'O-' },
];

const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

const doctorRoles = [
  { id: 'Consultant', name: 'Consultant' },
  { id: 'Specialist', name: 'Specialist' },
  { id: 'Resident', name: 'Resident' },
  { id: 'Intern', name: 'Intern' },
];

const classifications = [
  { id: 'Senior Specialist', name: 'Senior Specialist' },
  { id: 'Junior Specialist', name: 'Junior Specialist' },
  { id: 'General Practitioner', name: 'General Practitioner' },
];

export default function CreateOrUpdateDoctors({ initValues }: { initValues?: any }) {
  const { mutate: createDoctor, isPending: isCreating } = useCreateDoctors();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctors();
  const [lang, setLang] = useState<"en" | "ar">("en");

  const { data: nationalities, isLoading } = useNationality("");
  const { data: services, isLoading: isLoadingServices } = useServices("limit=1000");

  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
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

  // format "HH:MM" -> "YYYY-MM-DD HH:MM:00"
  const formatTimeToDateTime = (time: string) => {
    if (!time) return '';
    const today = new Date().toISOString().split('T')[0];
    return `${today} ${time}:00`;
  };

  // extract "HH:MM"
  const extractTimeFromDateTime = (datetime: string) => {
    if (!datetime) return '';
    if (datetime.includes(' ')) {
      return datetime.split(' ')[1]?.substring(0, 5) || '';
    }
    return datetime.substring(0, 5);
  };

  const onSubmit: SubmitHandler<DoctorFormInput> = (data) => {
    console.log("Form Data:", data);
    
    const requestBody = {
      doctor_role: data.doctor_role,
      name: data.name,
      email: data.email,
      nationality_id: Number(data.nationality_id) || undefined,

      // map string ids -> numbers
      service_ids: (data.service_ids || []).map((id) => Number(id)),

      national_id: data.national_id,
      country_code: data.country_code || undefined,
      mobile_number: data.mobile_number,
      date_of_birth: data.date_of_birth,
      blood_group: data.blood_group || undefined,
      gender: data.gender,
      status: data.status ?? true,
      degree: data.degree,
      languages_spoken: data.languages_spoken,
      classification: data.classification,
      department: data.department,
      experience: Number(data.experience),
      medical_school: data.medical_school,
      memberships: data.memberships || undefined,
      specialized_in: data.specialized_in,
      awards: data.awards || undefined,
      image: isImageData || initValues?.image,
      certification: data.certification || undefined,
      upload_attachments: data.upload_attachments || undefined,
      medical_registration_number: data.medical_registration_number,
      medical_license_expiry: data.medical_license_expiry,
      specialist: data.specialist,
      sub_specialist: data.sub_specialist || undefined,
      clinic_name: data.clinic_name,
      from: formatTimeToDateTime(data.from),
      to: formatTimeToDateTime(data.to),
    };

    if (initValues) {
      updateDoctor({ doctor_id: initValues.id, ...requestBody });
    } else {
      createDoctor(requestBody);
    }

    setLoading(true);
  };

  // Build service options once per lang/services data
  const serviceOptions: SelectOption[] = useMemo(
    () =>
      (services?.data ?? []).map((s: any) => ({
        value: String(s.id),
        name: (s?.name?.[lang] ?? s?.name?.en ?? `Service ${s.id}`) as string,
        label: (s?.name?.[lang] ?? s?.name?.en ?? `Service ${s.id}`) as string,
      })),
    [services?.data, lang]
  );

  return (
    <Form<DoctorFormInput>
      onSubmit={onSubmit}
      validationSchema={doctorFormSchema}
      useFormProps={{
        defaultValues: {
          doctor_role: initValues?.doctor_role || '',
          name: {
            en: initValues?.name?.en || "",
            ar: initValues?.name?.ar || "",
          },
          email: initValues?.email || '',

          // prefer service_ids; fallback to services[]
          service_ids: Array.isArray(initValues?.service_ids)
            ? initValues.service_ids.map((id: number | string) => String(id))
            : Array.isArray(initValues?.services)
              ? initValues.services.map((s: any) => String(s.id))
              : [],

          nationality_id: initValues?.nationality?.id?.toString() || '',
          national_id: initValues?.national_id || '',
          country_code: initValues?.country_code || '',
          mobile_number: initValues?.mobile_number || '',
          date_of_birth: initValues?.date_of_birth?.split('T')[0] || '',
          blood_group: initValues?.blood_group || '',
          gender: initValues?.gender || 'male',
          status: initValues?.status ?? true,
          degree: initValues?.degree || '',
          languages_spoken: initValues?.languages_spoken || '',
          classification: initValues?.classification || '',
          department: initValues?.department || '',
          experience: initValues?.experience?.toString() || '',
          medical_school: initValues?.medical_school || '',
          memberships: initValues?.memberships || '',
          specialized_in: initValues?.specialized_in || '',
          awards: initValues?.awards || '',
          certification: initValues?.certification || '',
          upload_attachments: initValues?.upload_attachments || '',
          medical_registration_number: initValues?.medical_registration_number || '',
          medical_license_expiry: initValues?.medical_license_expiry?.split('T')[0] || '',
          specialist: initValues?.specialist || '',
          sub_specialist: initValues?.sub_specialist || '',
          clinic_name: initValues?.clinic_name || '',
          from: extractTimeFromDateTime(initValues?.from || ''),
          to: extractTimeFromDateTime(initValues?.to || ''),
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 overflow-y-auto"
    >
      {({ register, formState: { errors }, watch, setValue, control }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Doctor' : 'Create Doctor'}
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
              label="Name (English)"
              placeholder="Enter English name"
              {...register("name.en")}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
              key={"name.ar"}
              label="Name (Arabic)"
              placeholder="أدخل الاسم بالعربية"
              {...register("name.ar")}
              error={errors.name?.ar?.message}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Doctor Role</label>
              <select {...register('doctor_role')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Doctor Role</option>
                {doctorRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.doctor_role && <p className="text-sm text-red-500">{errors.doctor_role.message}</p>}
            </div>
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="National ID" {...register('national_id')} error={errors.national_id?.message} />
            <Input label="Country Code (Optional)" {...register('country_code')} error={errors.country_code?.message} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* ✅ Multi-select Services using SelectBox + Controller */}
            <div>
              <Controller
                name="service_ids"
                control={control}
                render={({ field: { value, onChange } }) => {
                  // value is string[] of ids; convert to array of option objects
                  const selectedOptions =
                    Array.isArray(value)
                      ? serviceOptions.filter((opt) => value.includes(String(opt.value)))
                      : [];

                  return (
                    <SelectBox
                      multiple
                      options={serviceOptions}
                      value={selectedOptions}
                      onChange={(opts: SelectOption[] | SelectOption) => {
                        const ids = Array.isArray(opts)
                          ? opts.map((o) => String(o.value))
                          : opts
                          ? [String((opts as SelectOption).value)]
                          : [];
                        onChange(ids);
                      }}
                      isRequired
                      isLoading={isLoadingServices}
                      label="Services"
                      placeholder="Select Services"
                      error={(errors.service_ids as any)?.message}
                      // show comma-joined labels when multiple
                      displayValue={(val: any) => {
                        if (Array.isArray(val)) {
                          if (val.length === 0) return '';
                          return val.map((o: any) => o?.label ?? o?.name ?? o?.value).join(', ');
                        }
                        // single fallback (not used when multiple=true, but safe)
                        if (val?.label) return val.label;
                        if (val?.name) return val.name;
                        return val ?? '';
                      }}
                    />
                  );
                }}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Nationality (Optional)</label>
              <select {...register('nationality_id')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Nationality</option>
                {nationalities?.data?.map((nationality:any) => (
                  <option key={nationality.id} value={nationality.id}>{nationality.name.en}</option>
                ))}
              </select>
              {errors.nationality_id && <p className="text-sm text-red-500">{errors.nationality_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Mobile Number" {...register('mobile_number')} error={errors.mobile_number?.message} />
            <Input label="Date of Birth" type="date" {...register('date_of_birth')} error={errors.date_of_birth?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Blood Group (Optional)</label>
              <select {...register('blood_group')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              {errors.blood_group && <p className="text-sm text-red-500">{errors.blood_group.message}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select {...register('gender')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Gender</option>
                {genders.map(gender => (
                  <option key={gender.id} value={gender.id}>{gender.name}</option>
                ))}
              </select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Degree" {...register('degree')} error={errors.degree?.message} />
            <Input label="Languages Spoken" {...register('languages_spoken')} error={errors.languages_spoken?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Classification</label>
              <select {...register('classification')} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Select Classification</option>
                {classifications.map(classification => (
                  <option key={classification.id} value={classification.id}>{classification.name}</option>
                ))}
              </select>
              {errors.classification && <p className="text-sm text-red-500">{errors.classification.message}</p>}
            </div>
            <Input label="Department" {...register('department')} error={errors.department?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Experience (Years)" type="number" {...register('experience')} error={errors.experience?.message} />
            <Input label="Medical School" {...register('medical_school')} error={errors.medical_school?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Memberships (Optional)" {...register('memberships')} error={errors.memberships?.message} />
            <Input label="Specialized In" {...register('specialized_in')} error={errors.specialized_in?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Awards (Optional)" {...register('awards')} error={errors.awards?.message} />
            <Input label="Certification (Optional)" {...register('certification')} error={errors.certification?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Medical Registration Number" {...register('medical_registration_number')} error={errors.medical_registration_number?.message} />
            <Input label="Medical License Expiry" type="date" {...register('medical_license_expiry')} error={errors.medical_license_expiry?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Specialist" {...register('specialist')} error={errors.specialist?.message} />
            <Input label="Sub Specialist (Optional)" {...register('sub_specialist')} error={errors.sub_specialist?.message} />
          </div>

          <Input label="Clinic Name" {...register('clinic_name')} error={errors.clinic_name?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Time"
              type="time"
              {...register('from')}
              error={errors.from?.message}
              helperText="Working hours start time"
            />
            <Input
              label="To Time"
              type="time"
              {...register('to')}
              error={errors.to?.message}
              helperText="Working hours end time"
            />
          </div>

          <FormGroup
            title="Image"
            className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            {(isLoading || loading) && (
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

          <div className="flex items-center gap-2">
            <Switch
              checked={watch('status')}
              onChange={(event) => setValue('status', event.target.checked)}
            />
            <label className="text-sm text-gray-700">Active Status</label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              isLoading={isLoading || isLoadingServices || loading || isCreating || isUpdating}
              type="submit"
            >
              {initValues ? 'Update Doctor' : 'Create Doctor'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
