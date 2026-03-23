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
      `appearance-none rounded-md relative block w-full px-3 py-2.5
       bg-sig-dark border border-sig-border placeholder-sig-dim
       text-gray-300 font-mono text-sm
       focus:outline-none focus:ring-1 focus:ring-sig-green/40
       focus:border-sig-green/40 transition-colors duration-200`.replace(/\n/g, " "),
  };

  return (
    <div className="relative">
      {error !== null && (
        <div className="absolute bottom-0 right-0 z-40 mb-1 mr-1">
          <p className="text-red-500 text-xs font-mono">{error}</p>
        </div>
      )}
      <label htmlFor={id} className="sr-only">
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
