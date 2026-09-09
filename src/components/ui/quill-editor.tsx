'use client';

import React, { useEffect, useState } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import { Controller, Control, FieldValues } from 'react-hook-form';
import { FieldError } from '@/components/ui/field-error';
import cn from '@/utils/class-names';
import 'react-quill/dist/quill.snow.css';

const Quill = ReactQuill.Quill;

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
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }, { size: [] }],
    [{ align: [] }, { direction: 'rtl' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

let styleAttributorsRegistered = false;

function registerQuillStyleAttributors() {
  if (styleAttributorsRegistered || typeof window === 'undefined' || !Quill) return;
  styleAttributorsRegistered = true;

  const AlignStyle = Quill.import('attributors/style/align');
  const BackgroundStyle = Quill.import('attributors/style/background');
  const ColorStyle = Quill.import('attributors/style/color');
  const DirectionStyle = Quill.import('attributors/style/direction');
  const FontStyle = Quill.import('attributors/style/font');
  const SizeStyle = Quill.import('attributors/style/size');

  SizeStyle.whitelist = [
    false,
    'small',
    'large',
    'huge',
    '10px',
    '11px',
    '12px',
    '13px',
    '14px',
    '15px',
    '16px',
    '18px',
    '20px',
    '22px',
    '24px',
    '26px',
    '28px',
    '32px',
    '36px',
    '48px',
  ];

  Quill.register(AlignStyle, true);
  Quill.register(BackgroundStyle, true);
  Quill.register(ColorStyle, true);
  Quill.register(DirectionStyle, true);
  Quill.register(FontStyle, true);
  Quill.register(SizeStyle, true);
}

registerQuillStyleAttributors();

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const renderEditor = (field: any) => {
    if (!ready) {
      return <div className="min-h-[160px] bg-white" />;
    }

    return (
      <>
        <ReactQuill
          theme="snow"
          placeholder={placeholder}
          {...props}
          id={id}
          key={`${name}-${field.value ? 'loaded' : 'empty'}`}
          value={field.value || ''}
          onChange={(content, _delta, source) => {
            if (source !== 'user') return;
            field.onChange(content);
          }}
          modules={modules ?? defaultModules}
          {...(formats ? { formats } : {})}
          className={cn(
            'react-quill bg-white min-h-[160px]',
            toolbarPosition === 'bottom' && 'react-quill-toolbar-bottom'
          )}
          readOnly={props.readOnly || props.disabled}
        />

        {showCharCount && (
          <div className="text-right text-xs text-gray-500 mt-1">
            {(field.value || '').length} characters
          </div>
        )}
      </>
    );
  };

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
