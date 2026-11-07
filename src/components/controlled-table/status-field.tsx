import Select, { SelectBoxProps, SelectOption } from '@/components/ui/select';

export default function StatusField({
  placeholder = '',
  ...props
}: SelectBoxProps<SelectOption>) {
  return (
    <Select
      placeholder={placeholder}
      selectClassName="h-9 min-w-[150px] rounded-xl border-gray-200 ring-[#143087]/20 focus:border-[#143087] focus:ring-[#143087]/20"
      dropdownClassName="rounded-xl border border-gray-200 p-1.5 text-ellipsis whitespace-nowrap shadow-sm"
      optionClassName="h-9 rounded-lg"
      {...props}
    />
  );
}