import { Input } from "./Input";
import { validateEmail } from "./utils";
import type { InputProps, ValidateFn } from "./types";

export default function EmailInput({
  onChange,
  currentValue,
  setValidated,
}: Readonly<InputProps>): JSX.Element {
  const validate: ValidateFn = (e, setFieldValidated, setError, clearError) => {
    const { value } = e.target as HTMLInputElement;

    if (value.length === 0) {
      setError("Email is required");
      setFieldValidated(false);
      clearError();
      return;
    }

    if (validateEmail(value)) {
      setError(null);
      setFieldValidated(true);
      return;
    }

    setError("Please enter a valid email address");
    setFieldValidated(false);
    clearError();
  };

  return (
    <Input
      type="text"
      name="user_email"
      id="contactEmail"
      required={true}
      autoComplete="off"
      onChange={onChange}
      validate={validate}
      currentValue={currentValue}
      setValidated={setValidated}
      placeholder="you@example.com"
      description="Your email"
    />
  );
}
