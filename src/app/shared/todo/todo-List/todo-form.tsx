'use client';

import { useState } from 'react';
import { PiInfo, PiListChecks, PiNotePencil, PiXBold } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useUpdateToDoList, useCreateToDo } from '@/framework/todolist';
import {
  ToDoFormSchema,
  toDoFormInput,
} from '@/utils/validators/todo-form.schema';

type FormTabId = 'general' | 'details';

const FORM_TABS: {
  id: FormTabId;
  label: string;
  icon: typeof PiInfo;
}[] = [
  { id: 'general', label: 'General', icon: PiInfo },
  { id: 'details', label: 'Details', icon: PiNotePencil },
];

const GENERAL_ERROR_KEYS = ['title'];
const DETAILS_ERROR_KEYS = ['description'];

function tabHasErrors(
  tabId: FormTabId,
  errors: FieldErrors<toDoFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));
  switch (tabId) {
    case 'general':
      return has(GENERAL_ERROR_KEYS);
    case 'details':
      return has(DETAILS_ERROR_KEYS);
    default:
      return false;
  }
}

export default function UpdateCreateStore({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateToDoList();
  const { mutate: create, isPending } = useCreateToDo();
  const [lang, setLang] = useState('en');
  const [titleen, settitleen] = useState(initValues ? initValues?.en_title : '');
  const [titleer, settitleer] = useState(initValues ? initValues?.ar_title : '');
  const [descriptionEn, setdescriptionEn] = useState(
    initValues ? initValues?.en_description : ''
  );
  const [descriptionAr, setdescriptionAr] = useState(
    initValues ? initValues?.ar_description : ''
  );
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit: SubmitHandler<toDoFormInput> = (data) => {
    const formatedTitle = JSON.stringify({
      en: lang == 'en' ? data.title : titleen,
      ar: lang == 'en' ? titleer : data.title,
    });
    const formatedDescription = JSON.stringify({
      en: lang == 'en' ? data.description : descriptionEn,
      ar: lang == 'en' ? descriptionAr : data.description,
    });
    if (initValues) {
      update({
        ...data,
        point_id: initValues?.id,
        title: formatedTitle,
        description: formatedDescription,
      });
    } else {
      create({
        ...data,
        //@ts-ignore
        title: formatedTitle,
        description: formatedDescription,
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<toDoFormInput>) => {
    const tabIndex = FORM_TABS.findIndex((tab) =>
      tabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  return (
    <Form<toDoFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={ToDoFormSchema}
      useFormProps={{
        defaultValues: {
          //@ts-ignore
          title: initValues?.title || '',
          description: initValues?.description || '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, getValues, setValue, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = FORM_TABS.map((tab) => ({
          ...tab,
          hasError: tabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiListChecks className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update node' : 'Add a new node'}
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
                    title="Title"
                    description="Language and node title"
                  >
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <Checkbox
                        key={0}
                        label={'English'}
                        checked={lang == 'en'}
                        onChange={function () {
                          if (lang == 'en') return;
                          const currentTitle = getValues('title');
                          settitleer(currentTitle);
                          const currentDescription = getValues('description');
                          setdescriptionAr(currentDescription);
                          setValue('title', titleen == '' ? '' : titleen);
                          setValue(
                            'description',
                            descriptionEn == '' ? '' : descriptionEn
                          );
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                      <Checkbox
                        key={1}
                        label={'Arabic'}
                        checked={lang == 'ar'}
                        onChange={function () {
                          if (lang == 'ar') return;
                          const currentTitle = getValues('title');
                          settitleen(currentTitle);
                          const currentDescription = getValues('description');
                          setdescriptionEn(currentDescription);
                          setValue('title', titleer == '' ? '' : titleer);
                          setValue(
                            'description',
                            descriptionAr == '' ? '' : descriptionAr
                          );
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="title"
                        placeholder="title"
                        {...register('title')}
                        error={errors.title?.message}
                      />
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Description"
                    description="Node details"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Input
                      label="description"
                      placeholder="description"
                      {...register('description')}
                      error={errors.description?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={FORM_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update Nodw' : 'Create Node'}
            />
          </>
        );
      }}
    </Form>
  );
}
