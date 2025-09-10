'use client';

import React, { useEffect, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';


type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  userDetails: {name: string, value: string}[] | [];
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
  // retailerDetails: {name: string, value: string}[] | [];
  productDetails: {name: string, value: string}[] | [];
  brandDetails: {name: string, value: string}[] | [];
  categoriesDetails: any;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  userDetails,
  retailerDetails,
  productDetails,
  brandDetails,
  categoriesDetails,

}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [seletedSubCategory, setSelectedSubCategory] = useState<{id: number, name: string, children: any}[] | []>([])
  const [selectedSubSubCat, setSelecedSubSubCat] = useState<{name: string, id: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  useEffect(() => {
    if(filters['filter_category']){
      setSelectedSubCategory(categoriesDetails?.find(((cat: any) => cat?.id == filters['filter_category']))?.children)
    }
    if(filters['filter_sub_category']){
      setSelecedSubSubCat(seletedSubCategory?.find(((cat: any) => cat?.id == filters['filter_sub_category']))?.children)
    }
    if(filters['filter_retailer']){
      setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == filters['filter_retailer'])?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
    }
  }, [])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
      <div className='flex gap-2'>
        <DateFiled
            selected={filters['offerDateFrom_from'] ? new Date(filters['offerDateFrom_from']) : null}
            onChange={(date: any) => {
            updateFilter('offerDateFrom_from', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select start date"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Start Offer Date from',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['offerDateFrom_to'] ? new Date(filters['offerDateFrom_to']) : null}
            onChange={(date: any) => {
            updateFilter('offerDateFrom_to', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select start date"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Start Offer Date to',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        </div>
      <div className='flex gap-2'>
        <DateFiled
            selected={filters['offerDateTo_from'] ? new Date(filters['offerDateTo_from']) : null}
            onChange={(date: any) => {
            updateFilter('offerDateTo_from', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select End date"
            {...(isMediumScreen && {
            inputProps: {
                label: 'End Offer Date from',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['offerDateTo_to'] ? new Date(filters['offerDateTo_to']) : null}
            onChange={(date: any) => {
            updateFilter('offerDateTo_to', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select End date"
            {...(isMediumScreen && {
            inputProps: {
                label: 'End Offer Date to',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        </div>
      <div className='flex gap-2'>
        <StatusField
          options={userDetails}
          placeholder='Select user'
          value={filters['filter_user']}
          onChange={(value: string) => {
            updateFilter('filter_user', value);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
              userDetails?.find((option) => option.value === selected)?.name ??
            selected
          }
          {...(isMediumScreen && {
            label: 'Users',
            labelClassName: 'font-medium text-gray-700',
          })}
        />
        <StatusField
        options={brandDetails}
        placeholder='Select brand'
        value={filters['filter_brand']}
        onChange={(value: string) => {
        updateFilter('filter_brand', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
            brandDetails?.find((option) => option.value === selected)?.name ??
        selected
        }
        {...(isMediumScreen && {
        label: 'Brands',
        labelClassName: 'font-medium text-gray-700',
        })} 
        />
      </div>
      
        <div className='flex gap-2'>
          <StatusField
            options={retailerDetails}
            placeholder='Select retailer'
            value={filters['filter_retailer']}
            onChange={(value: string) => {
              updateFilter('filter_retailer', value);
              setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == value)?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
                retailerDetails?.find((option) => option.value === selected)?.name ??
              selected
            }
            {...(isMediumScreen && {
              label: 'Retailers',
              labelClassName: 'font-medium text-gray-700',
            })} 
          />
          <StatusField
            options={selectedRetailer}
            placeholder='Select Store'
            value={filters['filter_store']}
            onChange={(value: string) => {
            updateFilter('filter_store', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
              selectedRetailer?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Store',
            labelClassName: 'font-medium text-gray-700',
            })} 
            />
        </div>
        <StatusField
            options={productDetails}
            placeholder='Select Model'
            value={filters['search_model']}
            onChange={(value: string) => {
            updateFilter('search_model', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
                productDetails?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Model',
            labelClassName: 'font-medium text-gray-700',
            })} 
            />
          <StatusField
            options={categoriesDetails?.map((cat:any) => ({name: cat?.name, value: cat?.id}))}
            placeholder='Select BG'
            value={filters['filter_category']}
            onChange={(value: string) => {
              updateFilter('filter_category', String(value));
              setSelectedSubCategory(categoriesDetails?.find(((cat: any) => cat?.id == value))?.children)
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
              categoriesDetails?.find((option: any) => option.id == selected)?.name ??
              ''
            }
            {...(isMediumScreen && {
              label: 'BG',
              labelClassName: 'font-medium text-gray-700',
            })} 
          />
      <div className='flex gap-2 w-full'>
      <StatusField
        options={seletedSubCategory?.map((cat:any) => ({name: cat?.name, value: cat?.id}))}
        placeholder='Select BU'
        value={filters['filter_sub_category']}
        onChange={(value: string) => {
          updateFilter('filter_sub_category', String(value));
          setSelecedSubSubCat(seletedSubCategory?.find(((cat: any) => cat?.id == value))?.children)
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          seletedSubCategory?.find((option: any) => option.id == selected)?.name ??
          ''
        }
        {...(isMediumScreen && {
          label: 'VCP',
          labelClassName: 'font-medium text-gray-700',
        })} 
      />
      <StatusField
        options={selectedSubSubCat?.map((cat:any) => ({name: cat?.name, value: cat?.id}))}
        placeholder='Select BU'
        value={filters['filter_sub_sub_category']}
        onChange={(value: string) => {
          updateFilter('filter_sub_sub_category', String(value));
          // setSelecedSubSubCat(seletedSubCategory?.find(((cat: any) => cat?.id == value))?.children)
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          selectedSubSubCat?.find((option: any) => option.id == selected)?.name ??
          ''
        }
        {...(isMediumScreen && {
          label: 'BU',
          labelClassName: 'font-medium text-gray-700',
        })} 
      />
      </div>

      {/* {isFiltered ?  */}
      
        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      
       {/* : null} */}
    </>
  );
}
