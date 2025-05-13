import React, { useState, useEffect } from 'react';
import { useUploadProgress } from '@/app/hooks/useUploadProgress';
import EventField from './Field';
import UploadProgressBar from './UploadProgressBar';

export type FieldConfig = {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  showIf?: (form: Record<string, string | boolean | File | null>) => boolean;
  width?: 'full';
  options?: { label: string; value: string }[];
  disabled?: boolean;
  accept?: string;
};

export type Masker = {
  [fieldName: string]: (value: string) => string;
};

type FormProps = {
  title?: string;
  mode?: 'drawer' | 'page';
  fields: FieldConfig[];
  onSubmit: (
    form: Record<string, string | boolean | File | null>,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  submitLabel: string;
  columns?: 1 | 2 | 3;
  maxWidth?: string;
  maskers?: Masker;
  values?: Record<string, string | boolean | File | null>;
  onChange?: (name: string, value: string | boolean | File | null) => void;
  currentImageUrl?: string;
};

export default function Form({
  title,
  mode = 'page',
  fields,
  onSubmit,
  submitLabel,
  columns = 1,
  maxWidth = 'max-w-lg',
  maskers = {},
  values,
  onChange,
  currentImageUrl,
}: FormProps) {
  const [form, setForm] = useState<Record<string, string | boolean | File | null>>(
    values || Object.fromEntries(fields.map(f => [f.name, f.type === 'checkbox' ? false : '']))
  );
  const { uploadProgress, isUploading, startUpload, updateProgress, finishUpload } =
    useUploadProgress();

  useEffect(() => {
    if (values) {
      setForm(values);
    }
  }, [values]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, type } = e.target;

    if (type === 'file' && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0];
      if (file) {
        setForm(prev => ({ ...prev, [name]: file }));
        onChange?.(name, file);
      }
      return;
    }

    let newValue =
      type === 'checkbox' && e.target instanceof HTMLInputElement
        ? e.target.checked
        : e.target.value;

    if (typeof newValue === 'string' && maskers[name]) {
      newValue = maskers[name](newValue);
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
    onChange?.(name, newValue);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startUpload();
    onSubmit(form, progress => {
      updateProgress(progress);
      if (progress === 100 || progress === 0) {
        finishUpload();
      }
    }).catch(() => {
      finishUpload();
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className={`bg-white flex flex-col gap-4 w-full ${maxWidth} ${mode === 'page' ? 'p-8 rounded shadow-md' : ''}`}
      >
        {title && <h1 className="text-2xl font-bold mb-4 text-center text-strong">{title}</h1>}
        <div
          className={`grid gap-4 ${
            columns === 1 ? '' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}
        >
          {fields.map(field =>
            field.showIf && !field.showIf(form) ? null : (
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
                <EventField
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  required={field.required}
                  disabled={field.disabled}
                  onChange={handleChange}
                  options={field.options}
                  accept={field.accept}
                  currentImageUrl={field.name === 'logo' ? currentImageUrl : undefined}
                />
              </div>
            )
          )}
        </div>
        {isUploading && <UploadProgressBar progress={uploadProgress} />}
        <button
          type="submit"
          disabled={isUploading}
          className={`bg-text-strong text-white rounded px-4 py-2 font-semibold hover:bg-text-light cursor-pointer ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Enviando...' : submitLabel}
        </button>
      </form>
    </div>
  );
}
