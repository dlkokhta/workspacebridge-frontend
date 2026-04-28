import type { RegistrationInputFieldTypes } from "../types/registrationInputFieldTypes";

export const RegistrationInputField: React.FC<RegistrationInputFieldTypes> = ({
  label,
  errors,
  type,
  id,
  register,
  name,
  errorMessage,
}) => {
  console.log("type", type);
  return (
    <div className="w-full ">
      <label className="block text-sm " htmlFor={id}>
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        id={id}
        name={name}
        className={`w-full border  ${
          errors ? ` border-red` : ` border-slate-400`
        }   outline-none`}
      />
      {errors && <div className="text-xs text-red-400">{errorMessage}</div>}
    </div>
  );
};
