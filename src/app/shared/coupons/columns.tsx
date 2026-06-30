'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import CouponForm from './coupons-form';
import TrashIcon from '@/components/icons/trash';
import { Badge } from '@/components/ui/badge';
import {
  formatCouponType,
  formatCouponValue,
} from '@/utils/coupon-constants';
import type { CouponDiscountType } from '@/types/coupon';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

export const getColumns = ({
  data,
  checkedItems,
  onDeleteItem,
  handleSelectAll,
  onChecked,
}: Columns) => {
  const lang = 'en';

  return [
    {
      title: (
        <div className="ps-2">
          <Checkbox
            title="Select All"
            onChange={handleSelectAll}
            checked={checkedItems.length === data.length && data.length > 0}
            className="cursor-pointer"
          />
        </div>
      ),
      dataIndex: 'checked',
      key: 'checked',
      width: 20,
      render: (_: any, row: any) => (
        <div className="inline-flex">
          <Checkbox
            className="cursor-pointer"
            checked={checkedItems.includes(row.id)}
            {...(onChecked && { onChange: () => onChecked(row.id) })}
          />
        </div>
      ),
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 20,
      render: (_: string, row: any) => (
        <div className="flex items-center gap-3">
          <Tooltip
            size="sm"
            content={() => 'Edit coupon'}
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
              view={<CouponForm initValues={row} />}
              label=""
              customSize="960px"
              className="m-0 bg-transparent p-0 text-gray-700"
            />
          </Tooltip>
          <DeletePopover
            title="Delete coupon"
            description={
              row.redemptions_count > 0
                ? `This coupon has ${row.redemptions_count} redemption(s). Consider deactivating instead of deleting.`
                : `Are you sure you want to delete coupon ${row.code}?`
            }
            onDelete={() => onDeleteItem([row.id])}
          >
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="Delete coupon"
              className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </DeletePopover>
        </div>
      ),
    },
    {
      title: <HeaderCell title="Code" />,
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <span className="font-mono font-semibold uppercase">{code}</span>
      ),
    },
    {
      title: <HeaderCell title="Name" />,
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (_: string, row: any) => (
        <AvatarCard
          src="/uploads/countrydefault.png"
          name={row?.name?.[lang] ?? row?.name?.en ?? 'Unnamed'}
          description={row.id}
        />
      ),
    },
    {
      title: <HeaderCell title="Type" />,
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: CouponDiscountType) => formatCouponType(type),
    },
    {
      title: <HeaderCell title="Value" />,
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (_: number, row: any) =>
        formatCouponValue(row.type, row.value ?? 0),
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Badge color={isActive ? 'success' : 'danger'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      title: <HeaderCell title="Redemptions" />,
      dataIndex: 'redemptions_count',
      key: 'redemptions_count',
      width: 110,
      render: (count: number) => count ?? 0,
    },
    {
      title: <HeaderCell title="Schedule" />,
      dataIndex: 'starts_at',
      key: 'schedule',
      width: 200,
      render: (_: string, row: any) => {
        if (!row.starts_at && !row.ends_at) return '—';
        return (
          <div className="text-xs leading-5">
            {row.starts_at && (
              <div>
                From: <DateCell date={row.starts_at} />
              </div>
            )}
            {row.ends_at && (
              <div>
                To: <DateCell date={row.ends_at} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: <HeaderCell title="Min subtotal" />,
      dataIndex: 'min_order_subtotal',
      key: 'min_order_subtotal',
      width: 110,
      render: (value: number | null) =>
        value != null ? `${value} SAR` : '—',
    },
  ];
};
