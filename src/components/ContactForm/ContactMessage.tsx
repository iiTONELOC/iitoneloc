import { Input } from "./inputs/Input";
import { validateMessage } from "./inputs/utils";
import type { InputProps, ValidateFn } from "./inputs/types";

export default function ContactMessage({
  onChange,
  currentValue,
  setValidated,
}: Readonly<InputProps>): JSX.Element {
  const validate: ValidateFn = (e, setFieldValidated, setError, clearError) => {
    const { value } = e.target as HTMLTextAreaElement;

    if (value.length === 0) {
      setError("A message is required");
      setFieldValidated(false);
      clearError();
      return;
    }

    if (validateMessage(value)) {
      setError(null);
      setFieldValidated(true);
      return;
    }

    setError("Please enter a valid message");
    setFieldValidated(false);
    clearError();
  };

  return (
    <Input
      type="textarea"
      name="message"
      id="contactMessage"
      required={true}
      autoComplete="off"
      onChange={onChange}
      validate={validate}
      currentValue={currentValue}
      setValidated={setValidated}
      placeholder="What can I help with?"
      description="Enter your message"
    />
  );
}
