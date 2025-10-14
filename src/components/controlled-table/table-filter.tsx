'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ToggleColumns } from '@/components/ui/table';
import { PiMagnifyingGlassBold, PiFunnel, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Input } from '@/components/ui/input';
import { Title } from '@/components/ui/text';
import cn from '@/utils/class-names';
import { useMedia } from '@/hooks/use-media';
import DropdownAction from '@/components/charts/dropdown-action';
const Drawer = dynamic(
  () => import('@/components/ui/drawer').then((module) => module.Drawer),
  { ssr: false }
);

const viewOptions = [
  {
    value: 'weekly',
    name: 'Weekly'
  },
  {
    value: 'monthly',
    name: 'Monthly',
  },
  {
    value: 'quarter',
    name: 'Quarter',
  },
  {
    value: 'yearly',
    name: 'Yearly',
  },
];


function FilterDrawerView({
  isOpen,
  drawerTitle,
  hasSearched,
  setOpenDrawer,
  filters,
  children,
}: React.PropsWithChildren<{
  drawerTitle?: string;
  hasSearched?: boolean;
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen?: boolean;
  filters?: any;
}>) {
  const { push } = useRouter()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const handleShowResults = () => {
  const keys = Object.keys(filters);
  const params = new URLSearchParams(searchParams);

  keys.forEach((key) => {
    const value = filters[key];

    // ✅ only include if value is not empty, null, or undefined
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, String(value));
    } else {
      // ✅ remove empty params from URL
      params.delete(key);
    }
  });

  setOpenDrawer(false);
  params.set('page', '1'); // always reset to first page

  // ✅ Uncomment these in production
  push(`${pathName}?${params.toString()}`);
};

  return (
    <Drawer
      size="sm"
      isOpen={isOpen ?? false}
      onClose={() => setOpenDrawer(false)}
      overlayClassName="dark:bg-opacity-20 backdrop-blur-md"
      containerClassName="dark:bg-gray-100 overflow-y-scroll"
    >
      <div className="flex h-full flex-col p-5">
        <div className="-mx-5 mb-6 flex items-center justify-between border-b border-gray-200 px-5 pb-4">
          <Title as="h5">{drawerTitle}</Title>
          <ActionIcon
            size="sm"
            rounded="full"
            variant="text"
            title={'Close Filter'}
            onClick={() => setOpenDrawer(false)}
          >
            <PiXBold className="h-4 w-4" />
          </ActionIcon>
        </div>
        <div className="flex-grow">
          <div className="grid grid-cols-1 gap-6 [&_.price-field>span.mr-2]:mb-1.5 [&_.price-field]:flex-col [&_.price-field]:items-start [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-wrapper_.w-72]:w-full [&_.text-gray-500]:text-gray-700 [&_button.h-9]:h-10 sm:[&_button.h-9]:h-11 [&_label>.h-9]:h-10 sm:[&_label>.h-9]:h-11 [&_label>.w-24.h-9]:w-full">
            {children}
          </div>
        </div>
        <Button
          size="lg"
          onClick={handleShowResults}
          className="mt-5 h-11 w-full text-sm"
        >
          Show Results
        </Button>
      </div>
    </Drawer>
  );
}

export type TableFilterProps = {
  searchTerm: string;
  onSearchClear: () => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  columns: { [key: string]: any }[];
  checkedColumns: string[];
  setCheckedColumns: React.Dispatch<React.SetStateAction<string[]>>;
  hideIndex?: number;
  children?: React.ReactNode;
  drawerTitle?: string;
  hasSearched?: boolean;
  showSearchOnTheRight?: boolean;
  enableDrawerFilter?: boolean;
  menu?: React.ReactNode;
  filters?: any
  showToggleColumns?: boolean;
  showToggleType?: boolean;
};

export default function TableFilter({
  searchTerm,
  onSearchClear,
  onSearchChange,
  columns,
  checkedColumns,
  setCheckedColumns,
  hideIndex,
  drawerTitle = 'Table Filters',
  hasSearched,
  enableDrawerFilter = false,
  showSearchOnTheRight = false,
  menu,
  filters,
  showToggleColumns = true,
  showToggleType = false,
  children,
}: TableFilterProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [showFilters, setShowFilters] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const { push } = useRouter()
  const pathName = usePathname()
  function handleChange(viewType: string) {
    params.set('chart_type', viewType)
    push(`${pathName}?${params.toString()}`)
  }
const[term,setTerm]=useState("")
useEffect(()=>{
  if(params.get("name")){
    setTerm(String(params.get("name")))
  }
},[])

  return (
    <div className="table-filter mb-4 flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-4">
        {!showSearchOnTheRight ? <>
          <Input
            type="search"
            placeholder="Search by anything..."
            value={term?term:""}
            onClear={()=>{
              setTerm("")
            }}
            onChange={(event)=>{
              setTerm(event.target.value)
            }}
            inputClassName="h-9"
            clearable={true}
            prefix={<PiMagnifyingGlassBold onClick={()=>{
              params.set("page","1")
              params.set("name",term)
              push(`${pathName}?${params.toString()}`)
            }}  className="h-4 w-4 cursor-pointer" />}
          />
        </>

         : null}

        {showSearchOnTheRight && enableDrawerFilter ? (
          <>{menu ? menu : null}</>
        ) : null}

        {children && (
          <>
            {isMediumScreen || enableDrawerFilter ? (
              <FilterDrawerView
                isOpen={openDrawer}
                setOpenDrawer={setOpenDrawer}
                drawerTitle={drawerTitle}
                hasSearched={hasSearched}
                filters={filters}
              >
                {children}
              </FilterDrawerView>
            ) : (
              <>{showFilters ? children : null}</>
            )}
          </>
        )}
      </div>

      <div className="ms-4 flex flex-shrink-0 items-center">
        {showSearchOnTheRight ? (
          <Input
            type="search"
            placeholder="Search by anything..."
            value={searchTerm}
            onClear={onSearchClear}
            onChange={onSearchChange}
            inputClassName="h-9"
            clearable={true}
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            className="me-2.5"
          />
        ) : null}

        {showToggleType ? (
          <div className='px-3'>
          <DropdownAction
           options={viewOptions} 
           defaultOption={viewOptions.find((option: any) => option?.value == params.get('chart_type')) || viewOptions[0]} 
           onChange={handleChange}
          //  className='h-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-50 transition-colors duration-200 px-4 py-2 text-sm rounded-md bg-transparent border focus-visible:ring-offset-2 border-gray-300 hover:enabled:border-gray-1000 focus-visible:enabled:border-gray-1000 focus-visible:ring-gray-900/30'
           />
           </div>
        ) : null}

        {children ? (
          <Button
            {...(isMediumScreen || enableDrawerFilter
              ? {
                  onClick: () => {
                    setOpenDrawer(() => !openDrawer);
                  },
                }
              : { onClick: () => setShowFilters(() => !showFilters) })}
            variant={'outline'}
            className={cn(
              'me-2.5 h-9 pe-3 ps-2.5',
              !(isMediumScreen || enableDrawerFilter) &&
                showFilters &&
                'border-dashed border-gray-700'
            )}
          >
            <PiFunnel className="me-1.5 h-[18px] w-[18px]" strokeWidth={1.7} />
            {!(isMediumScreen || enableDrawerFilter) && showFilters
              ? 'Hide Filters'
              : 'Filters'}
          </Button>
        ) : null}

        {showToggleColumns ? (
        <ToggleColumns
          columns={columns}
          checkedColumns={checkedColumns}
          setCheckedColumns={setCheckedColumns}
          hideIndex={hideIndex}
        />) : null}
      </div>
    </div>
  );
}
