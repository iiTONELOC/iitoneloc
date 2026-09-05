import { useState } from "react";
import type { InputChangeEvent, inputTypes } from "./types";

const CLEAR_ERROR_TIMEOUT_MS = 10000;
const TEXTAREA_ROWS = 6;

const fieldClass = `appearance-none rounded-md relative block w-full px-3 py-2.5
   bg-op-bg border border-op-border placeholder-op-dim
   text-op-text font-mono text-[13px]
   focus:outline-none focus:ring-1 focus:ring-op-accent/50
   focus:border-op-accent transition-colors duration-200`.replaceAll("\n", " ");

export function Input(props: Readonly<inputTypes>): JSX.Element {
  const [error, setError] = useState<null | string>(null);

  const {
    id,
    name,
    type,
    required,
    description,
    placeholder,
    currentValue,
    autoComplete,
    onChange,
    validate,
    setValidated,
  } = props;

  const clearError = () => {
    setTimeout(() => setError(null), CLEAR_ERROR_TIMEOUT_MS);
  };

  const runValidate = (e: React.SyntheticEvent) =>
    validate(e, setValidated, setError, clearError);

  const handleOnChange = (e: InputChangeEvent) => {
    onChange(e);
    runValidate(e);
  };

  const shared = {
    id,
    name,
    required,
    placeholder,
    autoComplete,
    value: currentValue,
    className: fieldClass,
    onBlur: runValidate,
    onChange: handleOnChange,
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
      {type === "textarea" ? (
        <textarea rows={TEXTAREA_ROWS} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}
    </div>
  );
}
