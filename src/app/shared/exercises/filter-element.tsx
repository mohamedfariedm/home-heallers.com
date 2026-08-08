'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useExercisesFilterOptions } from '@/framework/exercises';
import type { ExerciseFilterOptions } from '@/types/admin-exercises';

type FilterElementProps = {
  filters: Record<string, unknown>;
  updateFilter: (columnId: string, filterValue: string | unknown[]) => void;
  handleReset: () => void;
  rehabilitationReviewMode?: boolean;
};

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-w-0 space-y-1.5">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <div className="w-full min-w-0 [&_.rizzui-select]:w-full [&_input]:w-full">
        {children}
      </div>
    </div>
  );
}

function toOptions(values: string[] = [], allLabel: string) {
  return [
    { value: '', name: 'all', label: allLabel },
    ...values.map((value) => ({
      value,
      name: value,
      label: value,
    })),
  ];
}

const ACTIVE_OPTIONS = [
  { value: '', name: 'all', label: 'All statuses' },
  { value: '1', name: 'active', label: 'Active' },
  { value: '0', name: 'inactive', label: 'Inactive' },
];

const REHABILITATION_OPTIONS = [
  { value: '', name: 'all', label: 'All exercises' },
  { value: '1', name: 'rehabilitation', label: 'Rehabilitation' },
  { value: '0', name: 'general', label: 'Not rehabilitation' },
];

export default function ExerciseFilterElement({
  filters,
  updateFilter,
  handleReset,
  rehabilitationReviewMode = false,
}: FilterElementProps) {
  const { data: filterOptionsData } = useExercisesFilterOptions();
  const filterOptions = (filterOptionsData as { data?: ExerciseFilterOptions } | undefined)
    ?.data;

  const bodyPartOptions = toOptions(filterOptions?.body_parts, 'All body parts');
  const equipmentOptions = toOptions(filterOptions?.equipment, 'All equipment');
  const targetOptions = toOptions(filterOptions?.targets, 'All targets');
  const muscleGroupOptions = toOptions(
    filterOptions?.muscle_groups,
    'All muscle groups'
  );
  const reviewStatusOptions = [
    { value: '', name: 'all', label: 'All review statuses' },
    ...(filterOptions?.rehabilitation_review_statuses ?? []).map((value) => ({
      value,
      name: value,
      label: value.replace(/_/g, ' '),
    })),
  ];
  const rehabilitationCategoryOptions = [
    { value: '', name: 'all', label: 'All rehabilitation categories' },
    ...(filterOptions?.rehabilitation_categories ?? []).map((category) => ({
      value: String(category.id),
      name: String(category.id),
      label: category.name_en || category.name_ar,
    })),
  ];

  return (
    <div className="grid grid-cols-1 gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">
      <FilterField label="Search">
        <Input
          placeholder="Search title or external ref"
          value={String(filters.search ?? '')}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </FilterField>

      <FilterField label="Body part">
        <StatusField
          placeholder="Body part"
          options={bodyPartOptions}
          value={String(filters.body_part ?? '')}
          onChange={(value: string) => updateFilter('body_part', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            bodyPartOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Equipment">
        <StatusField
          placeholder="Equipment"
          options={equipmentOptions}
          value={String(filters.equipment ?? '')}
          onChange={(value: string) => updateFilter('equipment', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            equipmentOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      {!rehabilitationReviewMode && <FilterField label="Target">
        <StatusField
          placeholder="Target"
          options={targetOptions}
          value={String(filters.target ?? '')}
          onChange={(value: string) => updateFilter('target', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            targetOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>}

      {!rehabilitationReviewMode && <FilterField label="Muscle group">
        <StatusField
          placeholder="Muscle group"
          options={muscleGroupOptions}
          value={String(filters.muscle_group ?? '')}
          onChange={(value: string) => updateFilter('muscle_group', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            muscleGroupOptions.find((option) => option.value === selected)
              ?.label ?? selected
          }
        />
      </FilterField>}

      {!rehabilitationReviewMode && <FilterField label="Status">
        <StatusField
          placeholder="Status"
          options={ACTIVE_OPTIONS}
          value={String(filters.is_active ?? '')}
          onChange={(value: string) => updateFilter('is_active', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            ACTIVE_OPTIONS.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>}

      {!rehabilitationReviewMode && <FilterField label="Rehabilitation">
        <StatusField
          placeholder="Rehabilitation"
          options={REHABILITATION_OPTIONS}
          value={String(filters.is_rehabilitation ?? '')}
          onChange={(value: string) =>
            updateFilter('is_rehabilitation', value)
          }
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            REHABILITATION_OPTIONS.find(
              (option) => option.value === selected
            )?.label ?? selected
          }
        />
      </FilterField>}

      {!rehabilitationReviewMode && <FilterField label="Review status">
        <StatusField
          placeholder="Review status"
          options={reviewStatusOptions}
          value={String(filters.rehabilitation_review_status ?? '')}
          onChange={(value: string) =>
            updateFilter('rehabilitation_review_status', value)
          }
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            reviewStatusOptions.find((option) => option.value === selected)
              ?.label ?? selected
          }
        />
      </FilterField>}

      {!rehabilitationReviewMode && <FilterField label="Rehabilitation category">
        <StatusField
          placeholder="Rehabilitation category"
          options={rehabilitationCategoryOptions}
          value={String(filters.rehab_category_id ?? '')}
          onChange={(value: string) =>
            updateFilter('rehab_category_id', value)
          }
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            rehabilitationCategoryOptions.find(
              (option) => option.value === selected
            )?.label ?? selected
          }
        />
      </FilterField>}

      <div className="col-span-full flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <PiTrashDuotone className="h-4 w-4" />
          Clear filters
        </Button>
      </div>
    </div>
  );
}
