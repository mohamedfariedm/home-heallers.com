'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCategoryBulkPrice } from '@/framework/categories';
import { useSettings } from '@/framework/site-settings';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import {
  categoryBulkPriceSchema,
  type CategoryBulkPriceInput,
} from '@/utils/validators/category-bulk-price.schema';
import {
  SETTINGS_PRICE_KEYS,
  type CategoryBulkPricePayload,
  type SettingsPriceKey,
  type SettingsPrices,
} from '@/types/category-bulk-price';

const SETTINGS_PRICE_LABELS: Record<SettingsPriceKey, string> = {
  session_price: 'Settings session price',
  booking_price: 'Settings booking price',
  reservation_price: 'Settings reservation price',
};

type CategoryRow = { id: number | string; name?: unknown };

export default function CategoryBulkPrice({ category }: { category: CategoryRow }) {
  const { data: settingsResponse, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Spinner size="xl" />
      </div>
    );
  }

  const currentSettings: Partial<SettingsPrices> = settingsResponse?.data?.[0]?.setting ?? {};

  return <CategoryBulkPriceForm category={category} currentSettings={currentSettings} />;
}

function CategoryBulkPriceForm({
  category,
  currentSettings,
}: {
  category: CategoryRow;
  currentSettings: Partial<SettingsPrices>;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useCategoryBulkPrice();
  const categoryName = resolveLocalizedName(category.name, 'en') || `#${category.id}`;

  const [values, setValues] = useState<CategoryBulkPriceInput>({
    doctor_session_price: '',
    session_price: String(currentSettings.session_price ?? ''),
    booking_price: String(currentSettings.booking_price ?? ''),
    reservation_price: String(currentSettings.reservation_price ?? ''),
  });
  const [pending, setPending] = useState<CategoryBulkPricePayload | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<CategoryBulkPriceInput> = (data) => {
    setValues(data);

    const payload: CategoryBulkPricePayload = { id: category.id };
    if (data.doctor_session_price !== '') {
      payload.session_price = Number(data.doctor_session_price);
    }

    // Only changed Settings prices are sent; an emptied field keeps the current value.
    const settings: NonNullable<CategoryBulkPricePayload['settings']> = {};
    SETTINGS_PRICE_KEYS.forEach((key) => {
      const current = currentSettings[key];
      if (data[key] !== '' && (current == null || Number(data[key]) !== Number(current))) {
        settings[key] = Number(data[key]);
      }
    });
    if (Object.keys(settings).length > 0) {
      payload.settings = settings;
    }

    if (payload.session_price === undefined && payload.settings === undefined) {
      setFormError('Enter a doctor session price or change at least one Settings price.');
      return;
    }

    setFormError(null);
    setPending(payload);
  };

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <Title as="h4" className="font-semibold">
          Bulk price
        </Title>
        <Text className="mt-1 text-sm text-gray-500">Category: {categoryName}</Text>
      </div>
      <ActionIcon size="sm" variant="text" onClick={closeModal}>
        <PiXBold className="h-auto w-5" />
      </ActionIcon>
    </div>
  );

  if (pending) {
    return (
      <div className="flex flex-grow flex-col gap-6 p-6 @container">
        {header}
        <div className="space-y-3 rounded-md border border-gray-200 p-4 text-sm">
          <Text className="font-medium text-gray-900">
            Apply these prices to the category &quot;{categoryName}&quot;?
          </Text>
          <ul className="list-disc space-y-1 ps-5 text-gray-700">
            {pending.session_price !== undefined && (
              <li>
                Session price of every doctor in &quot;{categoryName}&quot; becomes{' '}
                <b>{pending.session_price} SAR</b> (part-time prices are not changed).
              </li>
            )}
            {SETTINGS_PRICE_KEYS.filter((key) => pending.settings?.[key] !== undefined).map(
              (key) => (
                <li key={key}>
                  {SETTINGS_PRICE_LABELS[key]}: {String(currentSettings[key] ?? '—')} →{' '}
                  <b>{pending.settings?.[key]} SAR</b>
                </li>
              )
            )}
          </ul>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setPending(null)}
            disabled={isPending}
            className="w-full @xl:w-auto"
          >
            Back
          </Button>
          <Button
            onClick={() => mutate(pending)}
            isLoading={isPending}
            className="w-full @xl:w-auto"
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form<CategoryBulkPriceInput>
      onSubmit={onSubmit}
      validationSchema={categoryBulkPriceSchema}
      useFormProps={{ defaultValues: values }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors } }) => (
        <>
          {header}

          <Input
            type="number"
            min={300}
            step={1}
            label="Doctor session price (SAR)"
            placeholder="Leave empty to keep doctors' current prices"
            helperText="Overwrites the session price of every doctor in this category."
            {...register('doctor_session_price')}
            error={errors.doctor_session_price?.message}
          />

          {SETTINGS_PRICE_KEYS.map((key) => (
            <Input
              key={key}
              type="number"
              min={0}
              step="any"
              label={`${SETTINGS_PRICE_LABELS[key]} (SAR)`}
              {...register(key)}
              error={errors[key]?.message}
            />
          ))}

          {formError && <Text className="text-sm text-red-500">{formError}</Text>}

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={closeModal} className="w-full @xl:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full @xl:w-auto">
              Continue
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
