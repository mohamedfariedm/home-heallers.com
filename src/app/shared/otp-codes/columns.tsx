'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import PencilIcon from '@/components/icons/pencil';
import DateCell from '@/components/ui/date-cell';
import CreateButton from '../create-button';
import OtpCodeForm from './otp-code-form';
import { resolveLocalizedNameOrFallback } from '@/utils/resolve-localized-name';
import type { OtpCodeTableRow } from '@/types/otp-codes';

type Columns = {
  onExtend: (row: OtpCodeTableRow) => void;
  extendingId?: string | null;
};

export const getColumns = ({ onExtend, extendingId }: Columns) => [
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 120,
    render: (_: string, row: OtpCodeTableRow) => (
      <div className="flex items-center gap-2">
        <Tooltip
          size="sm"
          content={() => 'Edit OTP'}
          placement="top"
          color="invert"
        >
          <CreateButton
            icon={
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<OtpCodeForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <Tooltip
          size="sm"
          content={() => 'Extend expiration by 1 hour'}
          placement="top"
          color="invert"
        >
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            isLoading={extendingId === row.id}
            onClick={() => onExtend(row)}
          >
            +1h
          </Button>
        </Tooltip>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Name" />,
    dataIndex: 'name',
    key: 'name',
    width: 220,
    render: (_: unknown, row: OtpCodeTableRow) => (
      <div>
        <Text className="font-medium text-gray-900 dark:text-gray-700">
          {resolveLocalizedNameOrFallback(row.name)}
        </Text>
        <Text className="text-xs text-gray-500">
          {row.type} #{row.entity_id}
        </Text>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Type" />,
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (value: OtpCodeTableRow['type']) => (
      <Badge
        variant="flat"
        color={value === 'doctor' ? 'info' : 'primary'}
        className="capitalize"
      >
        {value}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Mobile" />,
    dataIndex: 'mobile',
    key: 'mobile',
    width: 140,
    render: (value: string | null) => value || '—',
  },
  {
    title: <HeaderCell title="Email" />,
    dataIndex: 'email',
    key: 'email',
    width: 200,
    render: (value: string | null) => value || '—',
  },
  {
    title: <HeaderCell title="National ID" />,
    dataIndex: 'national_id',
    key: 'national_id',
    width: 130,
    render: (value: string | null) => value || '—',
  },
  {
    title: <HeaderCell title="OTP" />,
    dataIndex: 'otp',
    key: 'otp',
    width: 110,
    render: (value: string | null, row: OtpCodeTableRow) => (
      <div className="flex flex-col gap-1">
        <Text className="font-mono tracking-wide">{value ?? '—'}</Text>
        {value == null ? (
          <Badge variant="flat" className="w-fit bg-gray-100 text-gray-600">
            No OTP
          </Badge>
        ) : row.is_expired ? (
          <Badge variant="flat" color="danger" className="w-fit">
            Expired
          </Badge>
        ) : (
          <Badge variant="flat" color="success" className="w-fit">
            Active
          </Badge>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell title="Expires At" />,
    dataIndex: 'otp_expires_at',
    key: 'otp_expires_at',
    width: 180,
    render: (value: string | null) =>
      value ? <DateCell date={new Date(value)} /> : '—',
  },
  {
    title: <HeaderCell title="Verified" />,
    dataIndex: 'is_otp_verified',
    key: 'is_otp_verified',
    width: 180,
    render: (value: boolean, row: OtpCodeTableRow) => (
      <div className="flex flex-col gap-1">
        <Badge
          variant="flat"
          color={value ? 'success' : 'warning'}
          className="w-fit"
        >
          {value ? 'Verified' : 'Not verified'}
        </Badge>
        {row.otp_verified_at ? (
          <DateCell date={new Date(row.otp_verified_at)} />
        ) : (
          <Text className="text-xs text-gray-500">Never logged in with OTP</Text>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell title="Updated At" />,
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 180,
    render: (value: string) =>
      value ? <DateCell date={new Date(value)} /> : '—',
  },
];
