'use client';

import React from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import { Controller, Control, FieldValues } from 'react-hook-form';
import { FieldError } from '@/components/ui/field-error';
import cn from '@/utils/class-names';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<ReactQuillProps, 'onChange'> {
  name: string;
  control?: Control<TFieldValues>;
  error?: string;
  label?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  toolbarPosition?: 'top' | 'bottom';
  placeholder?: string;
  showCharCount?: boolean;
  dir?: 'rtl' | 'ltr' | 'auto';
  modules?: ReactQuillProps['modules'];
  formats?: string[];
}

const defaultModules = {
  toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // 👈 for headings
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const defaultFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block',
  'list', 'bullet', 'script',
  'indent', 'color', 'background', 'font', 'align',
  'link', 'image', 'video'
];

export default function QuillEditor<TFieldValues extends FieldValues>({
  id,
  name,
  control,
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  toolbarPosition = 'top',
  placeholder = 'Write here...',
  showCharCount = false,
  dir = 'auto',
  modules,
  formats,
  ...props
}: QuillEditorProps<TFieldValues>) {
  const renderEditor = (field: any) => (
    <>
      <ReactQuill
        id={id}
        value={field.value || ''}
        onChange={field.onChange}
        modules={modules ?? defaultModules}
        formats={formats ?? defaultFormats}
        theme="snow"
        placeholder={placeholder}
        className={cn(
          'bg-white min-h-[160px]',
          toolbarPosition === 'bottom' && 'react-quill-toolbar-bottom'
        )}
        readOnly={props.readOnly || props.disabled}
        {...props}
      />
      
      {showCharCount && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {(field.value || '').length} characters
        </div>
      )}
    </>
  );

  return (
    <div className={cn('w-full', className)} dir={dir}>
      {label && (
        <label className={cn('mb-1.5 block text-sm font-medium text-gray-900', labelClassName)}>
          {label}
        </label>
      )}

      <div
        className={cn(
          'rounded border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-primary',
          error && 'border-red-500'
        )}
      >
        {control ? (
          <Controller name={name} control={control} render={({ field }) => renderEditor(field)} />
        ) : (
          renderEditor({ value: props.value, onChange: props.onChange })
        )}
      </div>

      {error && (
        <FieldError
          size="DEFAULT"
          error={error}
          className={cn('mt-1.5 text-sm text-red-500', errorClassName)}
        />
      )}
    </div>
  );
}
