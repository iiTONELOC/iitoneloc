import { useState } from "react";
import type { inputTypes } from "./types";

export const clearErrorTimeoutMs = 10000;

export function Input(props: Readonly<inputTypes>): JSX.Element {
  const [error, setError] = useState<null | string>(null);

  const {
    id,
    name,
    type,
    required,
    className,
    description,
    placeholder,
    currentValue,
    autoComplete,
    errorClearTime,
    onChange,
    validate,
    setValidated,
  } = props;

  const clearError = () => {
    setTimeout(() => {
      setError(null);
    }, errorClearTime || clearErrorTimeoutMs);
  };

  const _validate = (e: React.SyntheticEvent) =>
    validate(e, setValidated, setError, clearError);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    _validate(e);
  };

  const _props = {
    id,
    type,
    name,
    required,
    placeholder,
    autoComplete,
    onBlur: _validate,
    value: currentValue,
    onChange: handleOnChange,
    className:
      className ||
      `appearance-none rounded-lg relative 
                block w-full px-3 py-2 bg-slate-900 border-slate-500
                border placeholder-gray-500 text-gray-300 focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-600 focus:z-10
                sm:text-sm text-shadow`.replace(/\n/g, " "),
  };

  return (
    <div className="relative">
      {error !== null && (
        <div className="absolute bottom-0 right-0 z-40 mb-1 mr-1">
          <p className="text-red-600 text-shadow">{error}</p>
        </div>
      )}
      <label htmlFor={name} className="sr-only">
        {description}
      </label>
      {
        /* @ts-ignore */
        type === "textarea" ? (
          // @ts-ignore
          <textarea rows={6} {..._props} />
        ) : (
          <input {..._props} />
        )
      }
    </div>
  );
}
