'use client';

import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import TrashIcon from '@/components/icons/trash';
import PencilIcon from '@/components/icons/pencil';
import CreateButton from '../create-button';
import DeletePopover from '@/app/shared/delete-popover';
import CreateOrUpdateDoctors from './doctors-form';
import { Badge } from '@/components/ui/badge';

// Type definitions
interface Columns {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
}

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title="Select All"
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 20,
    render: (_: any, row: any) => (
      <Checkbox
        className="cursor-pointer"
        checked={checkedItems.includes(row.id)}
        {...(onChecked && { onChange: () => onChecked(row.id) })}
      />
    ),
  },
  {
    title: <></>,
    dataIndex: 'actions',
    key: 'actions',
    width: 20,
    render: (_: any, row: any) => (
      <div className="flex items-center gap-3">
        <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon tag="span" size="sm" variant="outline">
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<CreateOrUpdateDoctors initValues={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
          />
        </Tooltip>

        <DeletePopover
          title={`Delete Doctor`}
          description={`Are you sure you want to delete doctor #${row.id}?`}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon size="sm" variant="outline" className="hover:text-gray-700">
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Name" />,
    dataIndex: 'name',
    key: 'name',
    render: (_: any, row: any) => (
      <div>
        <div className="font-medium">{row?.name?.en ?? '—'}</div>
        <div className="text-sm text-gray-500">{row?.name?.ar ?? '—'}</div>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Email" />,
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => email ?? '—',
  },
  {
    title: <HeaderCell title="Doctor Role" />,
    dataIndex: 'doctor_role',
    key: 'doctor_role',
    render: (doctor_role: string) => (
      <Badge variant="outline" className="capitalize">
        {doctor_role ?? '—'}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Department" />,
    dataIndex: 'department',
    key: 'department',
    render: (department: string) => department ?? '—',
  },
  {
    title: <HeaderCell title="Specialization" />,
    dataIndex: 'specialized_in',
    key: 'specialized_in',
    render: (specialized_in: string) => specialized_in ?? '—',
  },
  {
    title: <HeaderCell title="Experience" />,
    dataIndex: 'experience',
    key: 'experience',
    render: (experience: number) => `${experience} years` ?? '—',
  },
  {
    title: <HeaderCell title="Mobile" />,
    dataIndex: 'mobile_number',
    key: 'mobile_number',
    render: (mobile_number: string, row: any) => 
      `${row.country_code || ''} ${mobile_number}`.trim() || '—',
  },
  {
    title: <HeaderCell title="National ID" />,
    dataIndex: 'national_id',
    key: 'national_id',
    render: (national_id: string) => national_id ?? '—',
  },
  {
    title: <HeaderCell title="Gender" />,
    dataIndex: 'gender',
    key: 'gender',
    render: (gender: string) => (
      <Badge >
        {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '—'}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Blood Group" />,
    dataIndex: 'blood_group',
    key: 'blood_group',
    render: (blood_group: string) => blood_group ?? '—',
  },
  {
    title: <HeaderCell title="Degree" />,
    dataIndex: 'degree',
    key: 'degree',
    render: (degree: string) => degree ?? '—',
  },
  {
    title: <HeaderCell title="Classification" />,
    dataIndex: 'classification',
    key: 'classification',
    render: (classification: string) => classification ?? '—',
  },
  {
    title: <HeaderCell title="Medical School" />,
    dataIndex: 'medical_school',
    key: 'medical_school',
    render: (medical_school: string) => medical_school ?? '—',
  },
  {
    title: <HeaderCell title="Clinic" />,
    dataIndex: 'clinic_name',
    key: 'clinic_name',
    render: (clinic_name: string) => clinic_name ?? '—',
  },
  {
    title: <HeaderCell title="Working Hours" />,
    dataIndex: 'working_hours',
    key: 'working_hours',
    render: (_: any, row: any) => 
      row.from && row.to ? `${row.from} - ${row.to}` : '—',
  },
  {
    title: <HeaderCell title="Registration No." />,
    dataIndex: 'medical_registration_number',
    key: 'medical_registration_number',
    render: (medical_registration_number: string) => medical_registration_number ?? '—',
  },
  {
    title: <HeaderCell title="License Expiry" />,
    dataIndex: 'medical_license_expiry',
    key: 'medical_license_expiry',
    render: (medical_license_expiry: string) => 
      medical_license_expiry ? new Date(medical_license_expiry).toLocaleDateString() : '—',
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    render: (status: boolean) => (
      <Badge >
        {status ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Nationality" />,
    dataIndex: 'nationality',
    key: 'nationality',
    render: (_: any, row: any) => row?.nationality?.name?.en ?? '—',
  },
  {
    title: <HeaderCell title="Languages" />,
    dataIndex: 'languages_spoken',
    key: 'languages_spoken',
    render: (languages_spoken: string) => languages_spoken ?? '—',
  },
  {
    title: <HeaderCell title="Created At" />,
    dataIndex: 'created_at',
    key: 'created_at',
    render: (created_at: string) => new Date(created_at).toLocaleString(),
  },
];