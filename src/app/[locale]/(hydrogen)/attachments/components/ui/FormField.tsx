import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url';
  register: UseFormRegister<any>;
  errors: FieldErrors;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type,
  register,
  errors,
  placeholder,
  required = false,
  className = ''
}) => {
  const fieldError = name.split('.').reduce((obj, key) => obj?.[key], errors);
  
  const baseClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}
    ${className}
  `;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          {...register(name, { required: required ? `${label} is required` : false })}
          placeholder={placeholder}
          rows={4}
          className={`${baseClasses} resize-vertical`}
        />
      ) : (
        <input
          {...register(name, { required: required ? `${label} is required` : false })}
          type={type}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      
      {fieldError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span>
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
};