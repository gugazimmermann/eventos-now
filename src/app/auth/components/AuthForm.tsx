'use client';

import { useState } from 'react';
import AuthField from './AuthField';

export type Field = {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  width?: 'full';
  disabled?: boolean;
  options?: { value: string; label: string }[];
};

export type Masker = {
  [fieldName: string]: (value: string) => string;
};

type AuthFormProps = {
  title: string;
  fields: Field[];
  onSubmit: (form: Record<string, string>) => void;
  submitLabel: string;
  columns?: 1 | 2 | 3;
  maxWidth?: string;
  maskers?: Masker;
  values?: Record<string, string>;
  onChange?: (name: string, value: string) => void;
  loading?: boolean;
  links?: { text: string; href: string }[];
};

export default function AuthForm({
  title,
  fields,
  onSubmit,
  submitLabel,
  columns = 1,
  maxWidth = 'max-w-sm',
  maskers = {},
  values,
  onChange,
  loading = false,
  links = [],
}: AuthFormProps) {
  const [form, setForm] = useState(Object.fromEntries(fields.map(f => [f.name, ''])));

  const formState = values ?? form;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    const name = e.target.name;
    const masker = maskers[name];
    if (masker) {
      value = masker(value);
    }

    if (onChange) {
      onChange(name, value);
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full ${maxWidth}`}
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-strong">{title}</h1>
        <div
          className={`grid gap-4 ${
            columns === 1 ? '' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}
        >
          {fields.map(field => (
            <div
              key={field.name}
              className={
                field.width === 'full'
                  ? columns === 3
                    ? 'col-span-3'
                    : columns === 2
                      ? 'col-span-2'
                      : 'col-span-1'
                  : ''
              }
            >
              <AuthField
                label={field.label}
                name={field.name}
                type={field.type}
                value={formState[field.name]}
                required={field.required}
                disabled={field.disabled || loading}
                onChange={handleChange}
                options={field.options}
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-text-strong text-white rounded px-4 py-2 font-semibold hover:bg-text-light cursor-pointer"
          disabled={loading}
        >
          {submitLabel}
        </button>
        <div className="flex flex-col gap-1 mt-2">
          {links.map(link => (
            <a key={link.href} href={link.href} className="text-strong hover:underline text-center">
              {link.text}
            </a>
          ))}
        </div>
      </form>
    </div>
  );
}
