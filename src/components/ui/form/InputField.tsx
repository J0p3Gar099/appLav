import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
}

export const InputField = ({
  label,
  type = "text",
  placeholder,
  register,
  error,
}: Props) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`w-full border p-2 rounded ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {error && (
        <p className="text-red-500 text-sm">{error.message}</p>
      )}
    </div>
  );
};