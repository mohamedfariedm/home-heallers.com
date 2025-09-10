'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useUpdateToDoList, useCreateToDo } from '@/framework/todolist';
import { ToDoFormSchema, toDoFormInput } from '@/utils/validators/todo-form.schema';

// main category form component for create and update category
export default function UpdateCreateStore({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateToDoList();
  const { mutate: create, isPending } = useCreateToDo();
  const [lang, setLang] = useState('en')
  const [titleen, settitleen] = useState(initValues ? initValues?.en_title : '')
  const [titleer, settitleer] = useState(initValues ? initValues?.ar_title : '')
  const [descriptionEn, setdescriptionEn] = useState(initValues ? initValues?.en_description : '')
  const [descriptionAr, setdescriptionAr] = useState(initValues ? initValues?.ar_description : '')

  const onSubmit: SubmitHandler<toDoFormInput> = (data) => {
        
    const formatedTitle = JSON.stringify({
            en: lang == 'en' ? data.title : titleen,
            ar: lang == 'en' ? titleer : data.title
    })
    const formatedDescription = JSON.stringify({
            en: lang == 'en' ? data.description: descriptionEn,
            ar: lang == 'en' ? descriptionAr : data.description
    })
    if(initValues) {
            // lang == 'en' ? settitleen(data.name) : settitleer(data.name)
            update({
                ...data,
                point_id: initValues?.id,                
                title: formatedTitle,
                description:formatedDescription
            })
    } else {
        create({
            ...data,
            //@ts-ignore
            title: formatedTitle,
            description:formatedDescription
        })
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
    // closeModal()
  };

  return (
    <> (
        <Form<toDoFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={ToDoFormSchema}
            useFormProps={{
                defaultValues: {
                //@ts-ignore
                title: initValues?.title || '',
                description: initValues?.description || '',
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, control, getValues, setValue , formState: { errors } }) => {
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update node' : 'Add a new node'}
                        </Title>
                        <ActionIcon size="sm" variant="text" onClick={closeModal}>
                            <PiXBold className="h-auto w-5" />
                        </ActionIcon>
                    </div>
                    <div className='flex flex-wrap px-1 gap-3'>
                        <Checkbox
                            key={0} 
                            label={'English'}
                            checked={lang == 'en'}
                            onChange={ function() {
                                if(lang == 'en') return
                                
                                const currentTitle = getValues('title')
                                settitleer(currentTitle)
                                const currentDescription=getValues('description')
                                setdescriptionAr(currentDescription)
                                setValue('title', titleen == '' ? '' : titleen)
                                setValue('description', descriptionEn == '' ? '' : descriptionEn)
                                setLang(lang == 'en' ? 'ar' : 'en')
                            } }
                        />
                        <Checkbox
                            key={1} 
                            label={'Arabic'}
                            checked={lang == 'ar'}
                            onChange={ function() {
                                if(lang == 'ar') return
                                const currentTitle = getValues('title')
                                settitleen(currentTitle)
                                const currentDescription=getValues('description')
                                setdescriptionEn(currentDescription)
                                setValue('title', titleer == '' ? '' : titleer)
                                setValue('description', descriptionAr == '' ? '' : descriptionAr)
                                setLang(lang == 'en' ? 'ar' : 'en')
                            } }
                        />
                    </div>
                    <Input
                    label="title"
                    placeholder="title"
                    {...register('title')}
                    error={errors.title?.message}
                    />
                    <Input
                    label="description"
                    placeholder="description"
                    {...register('description')}
                    error={errors.description?.message}
                    />

                    <div className="flex items-center justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={closeModal}
                        className="w-full @xl:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full @xl:w-auto"
                    >
                        {initValues ? 'Update Nodw' : 'Create Node'}
                    </Button>
                    </div>
                </>
                );
            }}
        </Form>
    )
    </>   
  );
}
