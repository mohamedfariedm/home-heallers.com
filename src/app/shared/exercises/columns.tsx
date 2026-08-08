'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { PiStethoscopeBold } from 'react-icons/pi';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import AvatarCard from '@/components/ui/avatar-card';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '@/app/shared/create-button';
import CreateOrUpdateExercise from '@/app/shared/exercises/exercise-form';
import RehabilitationReviewForm from '@/app/shared/exercises/rehabilitation-review-form';
import type { Exercise } from '@/types/admin-exercises';

type Columns = {
  data: Exercise[];
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  handleSelectAll: any;
  onChecked?: (id: string) => void;
  rehabilitationReviewMode?: boolean;
};

export const getColumns = ({
  data,
  checkedItems,
  onDeleteItem,
  handleSelectAll,
  onChecked,
  rehabilitationReviewMode = false,
}: Columns) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title="Select All"
          onChange={handleSelectAll}
          checked={data.length > 0 && checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 40,
    render: (_: unknown, row: Exercise) => (
      <div className="inline-flex">
        <Checkbox
          className="cursor-pointer"
          checked={checkedItems.includes(String(row.id))}
          {...(onChecked && { onChange: () => onChecked(String(row.id)) })}
        />
      </div>
    ),
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 120,
    render: (_: unknown, row: Exercise) => (
      <div className="flex items-center gap-3">
        {!rehabilitationReviewMode && (
          <Tooltip
            size="sm"
            content={() => 'Edit exercise'}
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
              view={<CreateOrUpdateExercise initValues={row} />}
              label=""
              customSize="720px"
              className="m-0 bg-transparent p-0 text-gray-700"
            />
          </Tooltip>
        )}
        {row.rehabilitation_review_status === 'pending' && (
          <Tooltip
            size="sm"
            content={() => 'Review rehabilitation candidate'}
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
                  <PiStethoscopeBold className="h-4 w-4" />
                </ActionIcon>
              }
              view={<RehabilitationReviewForm exercise={row} />}
              label=""
              customSize="620px"
              className="m-0 bg-transparent p-0 text-gray-700"
            />
          </Tooltip>
        )}
        {!rehabilitationReviewMode && (
          <DeletePopover
            title="Delete exercise"
            description={`Are you sure you want to delete #${row.id}?`}
            onDelete={() => onDeleteItem([String(row.id)])}
          >
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="Delete Item"
              className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </DeletePopover>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell title="Exercise" />,
    dataIndex: 'title',
    key: 'title',
    width: 280,
    render: (_: unknown, row: Exercise) => (
      <AvatarCard
        src={row.thumbnail_url || row.media_url || undefined}
        name={row.title?.en || row.title?.ar || 'Untitled'}
        description={
          row.external_ref
            ? `Ref ${row.external_ref} · ID-${row.id}`
            : `ID-${row.id}`
        }
      />
    ),
  },
  {
    title: <HeaderCell title="Body part" />,
    dataIndex: 'body_part',
    key: 'body_part',
    width: 120,
    render: (value: string | null) => (
      <span className="capitalize">{value || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Equipment" />,
    dataIndex: 'equipment',
    key: 'equipment',
    width: 130,
    render: (value: string | null) => (
      <span className="capitalize">{value || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Target" />,
    dataIndex: 'target',
    key: 'target',
    width: 120,
    render: (value: string | null) => (
      <span className="capitalize">{value || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Muscle group" />,
    dataIndex: 'muscle_group',
    key: 'muscle_group',
    width: 140,
    render: (value: string | null) => (
      <span className="capitalize">{value || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Rehab review" />,
    dataIndex: 'rehabilitation_review_status',
    key: 'rehabilitation_review_status',
    width: 130,
    render: (value: Exercise['rehabilitation_review_status']) => {
      const color =
        value === 'approved'
          ? 'success'
          : value === 'rejected'
            ? 'danger'
            : value === 'pending'
              ? 'warning'
              : 'secondary';
      return (
        <Badge variant="flat" color={color} className="capitalize">
          {value?.replace(/_/g, ' ') || 'Not reviewed'}
        </Badge>
      );
    },
  },
  {
    title: <HeaderCell title="Rehab category" />,
    dataIndex: 'rehab_category',
    key: 'rehab_category',
    width: 180,
    render: (_: unknown, row: Exercise) =>
      row.rehab_category?.name_en || row.rehab_category?.name_ar || '—',
  },
  {
    title: <HeaderCell title="Difficulty" />,
    dataIndex: 'difficulty',
    key: 'difficulty',
    width: 110,
    render: (value: Exercise['difficulty']) => (
      <span className="capitalize">{value || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (value: boolean) => (
      <Badge variant="flat" color={value ? 'success' : 'danger'} className="capitalize">
        {value ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];
