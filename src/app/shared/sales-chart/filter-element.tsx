'use client';

import React, { useEffect, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'

const typeOptions = [
  {
    value: 'daily',
    name: 'daily',
    label: "Day",
    filterFrom: 'date_from',
    filterTo: 'date_to',
    dateFormat: 'yyyy/MM/dd'
  },
  {
    value: 'weekly',
    name: 'weekly',
    label: 'Week',
    filterFrom: 'week_from',
    filterTo: 'week_to',
    dateFormat: 'I/R'
  },
  {
    value: 'monthly',
    name: 'monthly',
    label: 'Month',
    filterFrom: 'month_from',
    filterTo: 'month_to',
    dateFormat: 'MM/yyyy'
  },
  {
    value: 'quarter',
    name: 'quarter',
    label: 'Quarter',
    filterFrom: 'quarter_from',
    filterTo: 'quarter_to',
    dateFormat: 'yyyy, QQQ'
  },
  {
    value: 'yearly',
    name: 'yearly',
    label: 'Year',
    filterFrom: 'year_from',
    filterTo: 'year_to',
    dateFormat: 'yyyy'
  },
];

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  setDateFilter: (filterKeys: string[], filtersValue: any, type: string) => void;
  userDetails: {name: string, value: string}[] | [];
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
  regionDetails: {name: string, value: string, city: any}[] | [];
  productDetails: {name: string, value: string}[] | [];
  brandDetails: {name: string, value: string}[] | [];
  categoriesDetails: any;
  role: string;
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
  setDateFilter,
  role
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [seletedSubCategory, setSelectedSubCategory] = useState<{id: number, name: string, children: any}[] | []>([])
  const [selectedSubSubCat, setSelecedSubSubCat] = useState<{name: string, id: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  const [selectedType, setSelectedType] = useState(typeOptions[0])
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
    if(role !== '') {
      setSelectedType(typeOptions?.find((option) => option?.filterFrom == role || '') || typeOptions[0])
    }
  }, [])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  dayjs.extend(weekOfYear)
  dayjs.extend(quarterOfYear)

  return (
    <>
      <StatusField
          options={typeOptions}
          placeholder='Select Type'
          value={selectedType.value}
          onChange={(value: string) => {
            setSelectedType(typeOptions.find((option: any) => option.value == value) || typeOptions[0]);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            typeOptions?.find((option) => option.value === selected)?.value ??
            selected
          }
          {...(isMediumScreen && {
            label: 'Type',
            labelClassName: 'font-medium text-gray-700',
          })}
        />
        {selectedType.label == 'Day' ? 
        <>
          <DateFiled
              selected={filters['date_from'] ? new Date(filters['date_from']) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterFrom, String(date));
              setDateFilter([selectedType.filterFrom], {[selectedType.filterFrom]: String(formatDate(date, 'YYYY-MM-DD'))}, '_from')
              }}
              placeholderText="Select start date"
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: ` From ${selectedType.label}`,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
          <DateFiled
              selected={filters['date_to'] ? new Date(filters['date_to']) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterTo, String(date));
              setDateFilter([selectedType.filterTo], {[selectedType.filterTo]: String(formatDate(new Date(date), 'YYYY-MM-DD'))}, '_to')

              }}
              placeholderText="Select to date"
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: `To ${selectedType.label} `,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
        </>
         : null}
         {selectedType.label == 'Week' ? 
        <>
          <DateFiled
              selected={filters['week_from'] ? new Date(filters['year_from'], 0, 1 + (filters['week_from'] - 1) * 7) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterFrom, String(date));
              setDateFilter([selectedType.filterFrom, 'year_from'], {[selectedType.filterFrom]: String(dayjs(date).week() - 1), 'year_from': dayjs(date).get('year')}, '_from')
              }}
              placeholderText="Select start date"
              showWeekNumbers={selectedType.value == 'weekly'}
              //@ts-ignore
              showWeekPicker={selectedType.value == 'weekly'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: ` From ${selectedType.label}`,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
          <DateFiled
              selected={filters['week_to'] && filters['year_to'] ? new Date(filters['year_to'], 0, 1 + (filters['week_to'] - 1) * 7) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterTo, String(date));
              setDateFilter([selectedType.filterTo, 'year_to'], {[selectedType.filterTo]: String(dayjs(date)?.week() - 1), 'year_to': dayjs(date)?.get('year')}, '_to')

              }}
              placeholderText="Select to date"
              showWeekNumbers={selectedType.value == 'weekly'}
              //@ts-ignore
              showWeekPicker={selectedType.value == 'weekly'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: ` To ${selectedType.label}`,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
        </>
         : null}
         {selectedType.label == 'Month' ? 
        <>
          <DateFiled
              selected={filters['month_from'] && filters['year_from'] ? new Date(filters['year_from'], filters['month_from'] - 1, 1) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterFrom, String(date));
              setDateFilter([selectedType.filterFrom, 'year_from'], {[selectedType.filterFrom]: String(dayjs(date).month() + 1), 'year_from': dayjs(date).get('year')}, '_from')
              }}
              placeholderText="Select start date"
              showMonthYearPicker={selectedType.value == 'monthly'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: `From ${selectedType.label} `,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
          <DateFiled
              selected={filters['month_to'] && filters['year_to'] ? new Date(filters['year_to'], filters['month_to'] - 1, 1) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterTo, String(date));
              setDateFilter([selectedType.filterTo, 'year_to'], {[selectedType.filterTo]: String(dayjs(date).month() + 1), 'year_to': dayjs(date).get('year')}, '_to')

              }}
              placeholderText="Select to date"
              showMonthYearPicker={selectedType.value == 'monthly'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: ` To ${selectedType.label}`,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
        </>
         : null}
         {selectedType.label == 'Quarter' ? 
        <>
          <DateFiled
              selected={filters['quarter_from'] ? new Date(filters['year_from'], filters['quarter_from'] * 3, 1) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterFrom, String(date));
              setDateFilter([selectedType.filterFrom, 'year_from'], {[selectedType.filterFrom]: String(dayjs(date).quarter()), 'year_from': dayjs(date).get('year')}, '_from')
              }}
              placeholderText="Select start date"
              showQuarterYearPicker={selectedType.value == 'quarter'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: `From ${selectedType.label} `,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
          <DateFiled
              selected={filters['quarter_to'] ? new Date(filters['year_to'], filters['quarter_to'] * 3, 0 ) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterTo, String(date));
              setDateFilter([selectedType.filterTo, 'year_to'], {[selectedType.filterTo]: String(dayjs(date).quarter()), 'year_to': dayjs(date).get('year')}, '_to')

              }}
              placeholderText="Select to date"
              showQuarterYearPicker={selectedType.value == 'quarter'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: `To ${selectedType.label} `,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
        </>
         : null}
         {selectedType.label == 'Year' ? 
        <>
          <DateFiled
              selected={filters['year_from'] ? new Date(filters['year_from'], 0, 1) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterFrom, String(date));
              setDateFilter([selectedType.filterFrom], {[selectedType.filterFrom]: String(dayjs(date).get('year'))}, '_from')
              }}
              placeholderText="Select start date"
              showYearPicker={selectedType.value == 'yearly'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: `From ${selectedType.label} `,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
          <DateFiled
              selected={filters['year_to'] ? new Date(filters['year_to'], 0, 1) : null}
              onChange={(date: any) => {
              // updateFilter(selectedType.filterTo, String(date));
              setDateFilter([selectedType.filterTo], {[selectedType.filterTo]: String(dayjs(date).get('year'))}, '_to')

              }}
              placeholderText="Select to date"
              showYearPicker={selectedType.value == 'yearly'}
              dateFormat={selectedType.dateFormat}
              {...(isMediumScreen && {
              inputProps: {
                  label: `To ${selectedType.label} `,
                  labelClassName: 'font-medium text-gray-700',
              },
              })}
          />
        </>
         : null}
      <div className='flex gap-2'>
        <StatusField
          options={userDetails}
          placeholder='Select user'
          value={filters['user_id']}
          onChange={(value: string) => {
            updateFilter('user_id', value);
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
        
      </div>
      
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
            value={filters['brand_id']}
            onChange={(value: string) => {
            updateFilter('brand_id', value);
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
