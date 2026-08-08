'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PencilIcon from '@/components/icons/pencil';
import CreateButton from '@/app/shared/create-button';
import CreateOrUpdateExerciseProgram from '@/app/shared/exercise-programs/program-form';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import type { ExerciseProgram } from '@/types/admin-exercise-programs';

type Columns = {
  onSend: (id: number) => void;
  sendingId?: number | null;
};

export const getColumns = ({ onSend, sendingId }: Columns) => [
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 140,
    render: (_: unknown, row: ExerciseProgram) => (
      <div className="flex items-center gap-2">
        {row.status === 'draft' && (
          <>
            <Tooltip
              size="sm"
              content={() => 'Edit draft program'}
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
                view={<CreateOrUpdateExerciseProgram initValues={row} />}
                label=""
                customSize="900px"
                className="m-0 bg-transparent p-0 text-gray-700"
              />
            </Tooltip>
            <Button
              size="sm"
              variant="outline"
              isLoading={sendingId === row.id}
              onClick={() => onSend(row.id)}
            >
              Send
            </Button>
          </>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell title="Program" />,
    dataIndex: 'title',
    key: 'title',
    width: 220,
    render: (_: unknown, row: ExerciseProgram) => (
      <div>
        <div className="font-medium text-gray-900">
          {resolveLocalizedName(row.title) || `Program #${row.id}`}
        </div>
        <div className="text-xs text-gray-500">ID-{row.id}</div>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Doctor" />,
    dataIndex: 'doctor',
    key: 'doctor',
    width: 160,
    render: (_: unknown, row: ExerciseProgram) =>
      resolveLocalizedName(row.doctor?.name) || `#${row.doctor_id}`,
  },
  {
    title: <HeaderCell title="Patient" />,
    dataIndex: 'client',
    key: 'client',
    width: 160,
    render: (_: unknown, row: ExerciseProgram) =>
      resolveLocalizedName(row.client?.name) || `#${row.client_id}`,
  },
  {
    title: <HeaderCell title="Session" />,
    dataIndex: 'reservation_date_id',
    key: 'reservation_date_id',
    width: 160,
    render: (_: unknown, row: ExerciseProgram) =>
      resolveLocalizedName(row.session?.date) ||
      resolveLocalizedName(row.session?.label) ||
      `#${row.reservation_date_id}`,
  },
  {
    title: <HeaderCell title="Items" />,
    dataIndex: 'items',
    key: 'items',
    width: 80,
    render: (_: unknown, row: ExerciseProgram) => row.items?.length ?? 0,
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (value: ExerciseProgram['status']) => (
      <Badge
        variant="flat"
        color={value === 'sent' ? 'success' : 'warning'}
        className="capitalize"
      >
        {value}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Sent at" />,
    dataIndex: 'sent_at',
    key: 'sent_at',
    width: 160,
    render: (value: string | null | undefined) => value || '—',
  },
];
