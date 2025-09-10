'use client';

import { HeaderCell } from '@/components/ui/table';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => [
    {
        title: <HeaderCell title="" />,
        children: [
            {
              title: <HeaderCell title="BG" />,
              dataIndex: 'product.BG',
              key: 'BG',
              width: 30,
              hidden: 'BG',
              render: (_: string, row: any) => row?.product?.BG ,
            },
            {
              title: <HeaderCell title="BU" />,
              dataIndex: 'product.BU',
              key: 'BU',
              width: 30,
              hidden: 'BU',
              render: (_: string, row: any) => row?.product?.BU ,
            },
            {
              title: <HeaderCell title="VCP" />,
              dataIndex: 'product.VCP',
              key: 'VCP',
              width: 30,
              hidden: 'VCP',
              render: (_: string, row: any) => row?.product?.VCP ,
            },
            {
              title: <HeaderCell title="Period" />,
              dataIndex: 'period',
              key: 'period',
              width: 100,
              hidden: 'period',
              render: (_: string, row: any) => row?.period ,
            },
        ]
    },
    {
        title: <HeaderCell title="QTY" className='justify-center' />,
        children: [
            {
              title: <HeaderCell title="TGT" />,
              dataIndex: 'tgt_quentity',
              key: 'TGT',
              width: 30,
              hidden: 'TGT',
              render: (_: string, row: any) => row?.tgt_quentity ,
            },
            {
              title: <HeaderCell title="CY" />,
              dataIndex: 'achived_quentity',
              key: 'CY',
              width: 30,
              hidden: 'CY',
              render: (_: string, row: any) => row?.achived_quentity ,
            },
            {
              title: <HeaderCell title="Remaining" />,
              dataIndex: 'remaining_quentity',
              key: 'Remaining',
              width: 30,
              hidden: 'Remaining',
              render: (_: string, row: any) => row?.remaining_quentity ,
            },
            {
              title: <HeaderCell title="ACH%" />,
              dataIndex: 'ACH_quentity',
              key: 'ACH',
              width: 30,
              hidden: 'ACH',
              render: (_: string, row: any) => row?.ACH_quentity ,
            },
            {
              title: <HeaderCell title="ACH% Remaining" />,
              dataIndex: 'ACH_remaining_quentity',
              key: 'ACH Remaining',
              width: 150,
              hidden: 'ACH_remaining',
              render: (_: string, row: any) => row?.ACH_remaining_quentity ,
            },
        ]
    },
    {
        title: <HeaderCell title="VAL" className='justify-center' />,
        children: [
            {
              title: <HeaderCell title="TGT" />,
              dataIndex: 'tgt_value',
              key: 'TGT Value',
              width: 30,
              hidden: 'TGT_value',
              render: (_: string, row: any) => row?.tgt_value,
            },
            {
                title: <HeaderCell title="CY" />,
                dataIndex: 'achived_value',
                key: 'CY Value',
                width: 30,
                hidden: 'CY_value',
                render: (_: string, row: any) => row?.achived_value ,
              },
              {
                title: <HeaderCell title="Remaining" />,
                dataIndex: 'remaining_value',
                key: 'Remaining Value',
                width: 30,
                hidden: 'remaining_value',
                render: (_: string, row: any) => row?.remaining_value ,
              },
              {
                title: <HeaderCell title="ACH%" />,
                dataIndex: 'achived_value',
                key: 'ACH Value',
                width: 30,
                hidden: 'ACH_value',
                render: (_: string, row: any) => row?.achived_value ,
              },
              {
                title: <HeaderCell title="ACH% Remaining" />,
                dataIndex: 'ACH_remaining_value',
                key: 'ACH Remaining Value',
                width: 150,
                hidden: 'ACH_remaining_value',
                render: (_: string, row: any) => row?.ACH_remaining_value ,
              },
        ]
    },
];
