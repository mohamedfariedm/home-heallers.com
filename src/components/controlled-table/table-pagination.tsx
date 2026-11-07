import { PiCaretDownBold } from 'react-icons/pi';
import Pagination, { type PaginationProps } from '@/components/ui/pagination';
import Select from '@/components/ui/select';
import cn from '@/utils/class-names';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25];

export type TablePaginationProps = {
  pageSize: number;
  setPageSize?: React.Dispatch<React.SetStateAction<number>>;
  paginatorClassName?: string;
  pageSizeOptions?: number[];
} & PaginationProps;

export default function TablePagination({
  pageSize,
  setPageSize,
  total,
  paginatorClassName = 'mt-5 xs:mt-6 sm:mt-7',
  pageSizeOptions,
  ...props
}: TablePaginationProps) {
  const paginationLimitOptions = (pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS).map(
    (v, idx) => ({
      id: idx,
      name: String(v),
      value: v,
    })
  );
  if (total && total < pageSize) {
    return null;
  }

  return (
    <div
      className={cn(
        'table-pagination mt-4 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:justify-between',
        paginatorClassName
      )}
    >
      {!setPageSize ? (
        total && (
          <div className="hidden text-sm text-gray-500 sm:inline-flex">
            {props.current} of {Math.ceil(total / pageSize)} pages
          </div>
        )
      ) : (
        <div className="hidden items-center text-sm text-gray-600 sm:flex">
          Rows per page:{' '}
          <Select
            options={paginationLimitOptions}
            onChange={setPageSize}
            size="sm"
            variant="flat"
            value={pageSize}
            getOptionValue={({ value }) => value}
            suffix={<PiCaretDownBold />}
            useContainerWidth={false}
            dropdownClassName="w-12 rounded-xl border border-gray-100 p-1 shadow-lg"
            className="ms-1 [&_button]:rounded-xl [&_button]:border-gray-200 [&_button]:font-medium [&_button]:ring-[#143087]/20 [&_button]:focus:border-[#143087] [&_button]:focus:ring-[#143087]/20"
          />
        </div>
      )}
      <Pagination
        total={total}
        pageSize={pageSize}
        defaultCurrent={1}
        showLessItems={true}
        rounded="lg"
        prevIconClassName="py-0 !leading-[26px] text-gray-500 hover:text-[#143087]"
        nextIconClassName="py-0 !leading-[26px] text-gray-500 hover:text-[#143087]"
        {...props}
      />
    </div>
  );
}
