type AuthFieldProps = {
  label: string;
  name: string;
  type: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
};

export default function AuthField({
  label,
  name,
  type,
  value,
  required,
  disabled,
  onChange,
  options,
}: AuthFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-black">
      {label}
      {type === 'select' ? (
        <select
          name={name}
          className="border rounded px-3 py-2 disabled:bg-slate-200 disabled:border-slate-300"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          <option value="">Selecione...</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          className="border rounded px-3 py-2 disabled:bg-slate-200 disabled:border-slate-300"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
      )}
    </label>
  );
}
