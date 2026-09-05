import { Input } from "./inputs/Input";
import type { InputProps, ValidateFn } from "./inputs/types";

const MINIMUM_NAME_LENGTH = 3;

export default function ContactNameInput({
  onChange,
  currentValue,
  setValidated,
}: Readonly<InputProps>): JSX.Element {
  const validate: ValidateFn = (e, setFieldValidated, setError, clearError) => {
    const { value } = e.target as HTMLInputElement;

    if (value.length === 0) {
      setError("A name is required");
      setFieldValidated(false);
      clearError();
    } else if (value.length < MINIMUM_NAME_LENGTH) {
      setError(`Names must be at least ${MINIMUM_NAME_LENGTH} characters`);
      setFieldValidated(false);
      clearError();
    } else {
      setError(null);
      setFieldValidated(true);
    }
  };

  return (
    <Input
      type="text"
      name="user_name"
      id="contactName"
      required={true}
      autoComplete="off"
      onChange={onChange}
      validate={validate}
      currentValue={currentValue}
      setValidated={setValidated}
      placeholder="Your full name"
      description="Your name"
    />
  );
}
