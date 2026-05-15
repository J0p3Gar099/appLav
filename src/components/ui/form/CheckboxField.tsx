import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  register: UseFormRegisterReturn;
}

export const CheckboxField = ({ label, register }: Props) => {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" {...register} />
      {label}
    </label>
  );
};