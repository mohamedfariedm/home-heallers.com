'use client';

import { useState } from 'react';
import { PiXBold, PiWarehouse, PiCurrencyDollar } from 'react-icons/pi';
import { SubmitHandler, Controller, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import FormGroup from '@/app/shared/form-group';
import SelectBox from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  StockFormInput,
  StockFormSchema,
} from '@/utils/validators/stock-form.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateStock,
  useUpdateStock,
  useCreateAllStock,
} from '@/framework/stock';
import Spinner from '@/components/ui/spinner';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type StockTabId = 'location' | 'pricing';

const STOCK_TABS: {
  id: StockTabId;
  label: string;
  icon: typeof PiWarehouse;
}[] = [
  { id: 'location', label: 'Location', icon: PiWarehouse },
  { id: 'pricing', label: 'Pricing', icon: PiCurrencyDollar },
];

function stockTabHasErrors(
  tabId: StockTabId,
  errors: FieldErrors<StockFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'location':
      return Boolean(err?.store_id || err?.product_id);
    case 'pricing':
      return Boolean(err?.price || err?.quentity || err?.discount);
    default:
      return false;
  }
}

export default function UpdateCreateStock({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { data: allData, isLoading: isAllStockLoading } = useCreateAllStock();
  const { mutate: update } = useUpdateStock();
  const { mutate: create, isPending } = useCreateStock();

  const onSubmit: SubmitHandler<StockFormInput> = (data) => {
    if (initValues) {
      update({
        store_id: Number(data?.store_id) || Number(initValues?.store_id),
        price: Number(data?.price) || Number(initValues?.price),
        quentity: Number(data?.quentity) || Number(initValues?.quentity),
        discount: Number(data?.discount) || Number(initValues?.discount),
        stock_id: Number(initValues?.id),
      });
    } else {
      create({
        product_id: Number(data?.product_id) || Number(initValues?.product_id),
        store_id: Number(data?.store_id) || Number(initValues?.store_id),
        price: Number(data?.price) || Number(initValues?.price),
        quentity: Number(data?.quentity) || Number(initValues?.quentity),
        discount: Number(data?.discount) || Number(initValues?.discount),
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<StockFormInput>) => {
    const tabIndex = STOCK_TABS.findIndex((tab) =>
      stockTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(STOCK_TABS.length - 1, index)));
  };

  if (isAllStockLoading) {
    return (
      <div className="m-auto flex items-center justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<StockFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={StockFormSchema}
      useFormProps={{
        defaultValues: {
          store_id: Number(initValues?.store_id),
          price: Number(initValues?.price),
          quentity: Number(initValues?.quentity),
          discount: Number(initValues?.discount),
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = STOCK_TABS.map((tab) => ({
          ...tab,
          hasError: stockTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiWarehouse className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Stock' : 'Add a new Stock'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </div>

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Location"
                    description="Store and product"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup title="Stores" className="pt-0">
                      <Controller
                        control={control}
                        name="store_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select Store"
                            options={allData?.data?.stores?.map(
                              (store: any) => {
                                return {
                                  name: store?.name,
                                  value: store?.id,
                                };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.value}
                            displayValue={(selected) =>
                              allData?.data?.stores?.find(
                                (r: any) => r.id === selected
                              )?.name ?? 'Select Store'
                            }
                            error={errors?.store_id?.message as string}
                          />
                        )}
                      />
                    </FormGroup>

                    {initValues?.product_id ? null : (
                      <FormGroup title="Products" className="pt-0">
                        <Controller
                          control={control}
                          name="product_id"
                          render={({ field: { value, onChange } }) => (
                            <SelectBox
                              placeholder="Select Product"
                              options={allData?.data?.products?.map(
                                (prod: any) => {
                                  return {
                                    name: prod?.sku_code,
                                    value: prod.id,
                                  };
                                }
                              )}
                              onChange={onChange}
                              value={value}
                              className="col-span-full"
                              getOptionValue={(option) => option.value}
                              displayValue={(selected) =>
                                allData?.data?.products?.find(
                                  (r: any) => r.id == selected
                                )?.sku_code ?? 'test'
                              }
                              error={errors?.product_id?.message as string}
                            />
                          )}
                        />
                      </FormGroup>
                    )}
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Pricing"
                    description="Price, quantity and discount"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Input
                      label="Price"
                      type="number"
                      placeholder="price"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message}
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      placeholder="Quantity"
                      {...register('quentity', { valueAsNumber: true })}
                      error={errors.quentity?.message}
                    />
                    <Input
                      label="Discount"
                      type="number"
                      placeholder="discount"
                      {...register('discount', { valueAsNumber: true })}
                      error={errors.discount?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={STOCK_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update Stock' : 'Create Stock'}
            />
          </>
        );
      }}
    </Form>
  );
}
