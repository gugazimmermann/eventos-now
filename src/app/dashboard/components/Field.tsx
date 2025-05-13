import Image from 'next/image';

type FieldProps = {
  label: string;
  name: string;
  type: string;
  value: string | boolean | File | null;
  required?: boolean;
  disabled?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  options?: { label: string; value: string }[];
  accept?: string;
  currentImageUrl?: string;
};

export default function Field({
  label,
  name,
  type,
  value,
  required,
  disabled,
  onChange,
  options,
  accept,
  currentImageUrl,
}: FieldProps) {
  if (type === 'textarea') {
    return (
      <label className="flex flex-col gap-1 text-black">
        {label}
        <textarea
          name={name}
          className="border rounded px-3 py-2 disabled:bg-slate-200 disabled:border-slate-300"
          value={value as string}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
      </label>
    );
  }
  if (type === 'select') {
    return (
      <label className="flex flex-col gap-1 text-black">
        {label}
        <select
          name={name}
          className="border rounded px-3 py-2 disabled:bg-slate-200 disabled:border-slate-300"
          value={value as string}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          <option value="">Selecione...</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (type === 'file') {
    return (
      <label className="flex flex-col gap-1 text-black">
        {label}
        <div className="flex items-center gap-2">
          {currentImageUrl && (
            <div className="relative h-10 w-10">
              <Image
                src={currentImageUrl}
                alt="Current image"
                fill
                className="object-contain rounded"
              />
            </div>
          )}
          <input
            type="file"
            name={name}
            className="w-full border rounded px-3 py-2 disabled:bg-slate-200 disabled:border-slate-300"
            onChange={onChange}
            required={required}
            disabled={disabled}
            accept={accept}
          />
        </div>
      </label>
    );
  }
  return (
    <label className="flex flex-col gap-1 text-black">
      {label}
      <input
        type={type}
        name={name}
        className="border rounded px-3 py-2 disabled:bg-slate-200 disabled:border-slate-300"
        value={type === 'checkbox' ? undefined : (value as string)}
        checked={type === 'checkbox' ? (value as boolean) : undefined}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
    </label>
  );
}
