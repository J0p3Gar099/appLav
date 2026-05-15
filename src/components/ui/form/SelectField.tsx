import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: Option[];
  register: UseFormRegisterReturn;
  error?: FieldError;
}

export const SelectField = ({
  label,
  options,
  register,
  error,
}: Props) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <select
        {...register}
        className={`w-full border p-2 rounded ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-red-500 text-sm">{error.message}</p>
      )}
    </div>
  );
};