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
  regionDetails: {name: string, value: string, city: any}[] | [];
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
  regionDetails,
  productDetails,
  brandDetails,
  categoriesDetails,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [seletedSubCategory, setSelectedSubCategory] = useState<{id: number, name: string, children: any}[] | []>([])
  const [selectedSubSubCat, setSelecedSubSubCat] = useState<{name: string, id: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  useEffect(() => {
    if(filters['filter_region']){
      setSelectedRegion(regionDetails?.find((regions: any) => regions?.value == filters['filter_region'])?.city?.map((city: any) => ({
        name: city?.name,
        value: String(city?.id)
      })) || [])
    }
    if(filters['filter_retailer']){
      setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == filters['filter_retailer'])?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
    }
    if(filters['filter_category']){
      setSelectedSubCategory(categoriesDetails?.find(((cat: any) => cat?.id == filters['filter_category']))?.children)
    }
    if(filters['filter_sub_category']){
      setSelecedSubSubCat(seletedSubCategory?.find(((cat: any) => cat?.id == filters['filter_sub_category']))?.children)
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
            placeholderText="Select start date"
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
            placeholderText="Select to date"
            {...(isMediumScreen && {
            inputProps: {
                label: 'To Date',
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
          options={productDetails}
          placeholder='Select product'
          value={filters['filter_product']}
          onChange={(value: string) => {
          updateFilter('filter_product', value);
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
              placeholder='Select store'
              value={filters['filter_store']}
              onChange={(value: string) => {
                updateFilter('filter_store', value);
              }}
              getOptionValue={(option) => option.value}
              displayValue={(selected: string) =>
                selectedRetailer?.find((option) => option.value === selected)?.name ??
                ''
              }
              {...(isMediumScreen && {
                label: 'Stores',
                labelClassName: 'font-medium text-gray-700',
              })}
            />
            
        </div>
        <div className='flex gap-2'>
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
        </div>
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
      <div className='flex gap-2'>
        <StatusField
            options={regionDetails}
            placeholder='Select region'
            value={filters['filter_region']}
            onChange={(value: string) => {
            updateFilter('filter_region', value);
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
            value={filters['filter_city']}
            onChange={(value: string) => {
            updateFilter('filter_city', value);
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
