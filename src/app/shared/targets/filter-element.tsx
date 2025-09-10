'use client';

import React, { useEffect, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';
import { Input } from '@/components/ui/input';


type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  userDetails: {name: string, value: string}[] | [];
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
  regionDetails: {name: string, value: string, city: any}[] | [];
  productDetails: {name: string, value: string}[] | [];
  brandDetails: {name: string, value: string}[] | [];
//   brandFilter: {name: string, value: string}[] | [];
  categoriesDetails: any;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  userDetails,
  retailerDetails,
  regionDetails,
  productDetails,
  brandDetails,
  categoriesDetails,
//   brandFilter,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [seletedSubCategory, setSelectedSubCategory] = useState<{id: number, name: string, children: any}[] | []>([])
  const [selectedSubSubCat, setSelecedSubSubCat] = useState<{name: string, id: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  const[skuCode,setSKUcode]=useState<string>("")
  useEffect(() => {
    if(filters['region_id']){
        setSelectedRegion(regionDetails?.find((regions: any) => regions?.value == filters['region_id'])?.city?.map((city: any) => ({
          name: city?.name,
          value: String(city?.id)
        })) || [])
      }
      if(filters['retailer_id']){
        setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == filters['retailer_id'])?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
      }
      if(filters['BG_id']){
        setSelectedSubCategory(categoriesDetails?.find(((cat: any) => cat?.id == filters['BG_id']))?.children)
      }
      if(filters['VCP_id']){
        setSelecedSubSubCat(seletedSubCategory?.find(((cat: any) => cat?.id == filters['VCP_id']))?.children)
      }
  }, [])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
      <div className='flex gap-2'>
        <DateFiled
            selected={filters['date_from'] ? new Date(filters['date_from']) : null}
            onChange={(date: any) => {
            updateFilter('date_from', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select installation date from"
            {...(isMediumScreen && {
            inputProps: {
                label: 'From Date',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['date_to'] ? new Date(filters['date_to']) : null}
            onChange={(date: any) => {
            updateFilter('date_to', formatDate(new Date(date), 'YYYY-MM-DD'));
            }}
            placeholderText="Select installation date to"
            {...(isMediumScreen && {
            inputProps: {
                label: 'To Date',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
      </div>
      {/* <div className='flex gap-2'> */}
        <StatusField
          options={userDetails}
          placeholder='Select user'
          value={filters['promoter_id']}
          onChange={(value: string) => {
            updateFilter('promoter_id', value);
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
         <Input
                    label="SKU Code"
                    placeholder="SKU Code"
                    value={filters["sku_code"]}
          onChange={(event) => {            
            updateFilter('sku_code', event.target.value);
          }}
                    />
      {/* </div> */}
      <div className='flex gap-2'>
        <StatusField
            options={retailerDetails}
            placeholder='Select retailer'
            value={filters['retailer_id']}
            onChange={(value: string) => {
            updateFilter('retailer_id', value);
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
          placeholder='Select store'
          value={filters['store_id']}
          onChange={(value: string) => {
            updateFilter('store_id', value);
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
        <div className='flex gap-2'>
          <StatusField
            options={productDetails}
            placeholder='Select Product'
            value={filters['product_id']}
            onChange={(value: string) => {
            updateFilter('product_id', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
              productDetails?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Products',
            labelClassName: 'font-medium text-gray-700',
            })} 
          />
          <StatusField
            options={categoriesDetails?.map((cat:any) => ({name: cat?.name, value: cat?.id}))}
            placeholder='Select BG'
            value={filters['BG_id']}
            onChange={(value: string) => {
              updateFilter('BG_id', String(value));
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
        </div>
      <div className='flex gap-2 w-full'>
      <StatusField
        options={seletedSubCategory?.map((cat:any) => ({name: cat?.name, value: cat?.id}))}
        placeholder='Select BU'
        value={filters['VCP_id']}
        onChange={(value: string) => {
          updateFilter('VCP_id', String(value));
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
        value={filters['BU_id']}
        onChange={(value: string) => {
          updateFilter('BU_id', String(value));
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
      <div className='flex gap-2'>
        <StatusField
            options={regionDetails}
            placeholder='Select region'
            value={filters['region_id']}
            onChange={(value: string) => {
            updateFilter('region_id', value);
            setSelectedRegion(regionDetails?.find((regions: any) => regions?.value == value)?.city?.map((city: any) => ({
                name: city?.name,
                value: String(city?.id)
            })) || [])
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
            regionDetails?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Regions',
            labelClassName: 'font-medium text-gray-700',
            })}
        />

        <StatusField
            options={selectedRegion}
            placeholder='Select city'
            value={filters['city_id']}
            onChange={(value: string) => {
            updateFilter('city_id', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
            selectedRegion?.find((option) => option.value === selected)?.name ??
            ''
            }
            {...(isMediumScreen && {
            label: 'Cities',
            labelClassName: 'font-medium text-gray-700',
            })}
        />
      </div>

      {/* {isFiltered ? ( */}
        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      {/* ) : null} */}
    </>
  );
}
