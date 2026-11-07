'use client';

import { DatePicker, DatePickerProps } from '@/components/ui/datepicker';

export default function DateFiled({
  onClear,
  placeholderText = 'Select date',
  inputProps,
  ...props
}: DatePickerProps<any> & { onClear?: () => void }) {
  return (
    <div>
      <DatePicker
        monthsShown={1}
        placeholderText={placeholderText}
        selectsRange={false}
        inputProps={{
          inputClassName:
            'h-9 rounded-xl border-gray-200 ring-[#143087]/20 focus:border-[#143087] focus:ring-[#143087]/20 [&_input]:text-ellipsis',
          ...inputProps,
        }}
        className="w-72"
        {...props}
      />
    </div>
  );
}

