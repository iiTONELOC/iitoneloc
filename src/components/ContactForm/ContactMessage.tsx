import { Input } from "./inputs/Input";
import { validateMessage } from "./inputs/utils";
import { InputProps, inputTypes } from "./inputs/types";

export default function ContactMessage({
  //NOSONAR
  onChange,
  currentValue,
  setValidated,
}: InputProps): JSX.Element {
  const validate = (
    e: React.SyntheticEvent,
    setValidated: inputTypes["setValidated"],
    _setError: React.Dispatch<React.SetStateAction<string | null>>,
    _clearError: Function
  ) => {
    const { value } = e.target as HTMLInputElement;
    const len = value.length;

    if (len === 0) {
      _setError("A message is required");
      setValidated(false);
      _clearError();
    }
    if (len > 0) {
      const isValid = validateMessage(value);
      if (!isValid) {
        _setError("Please enter a valid message");
        setValidated(false);
        _clearError();
      } else {
        setValidated(true);
        _setError(null);
      }
    }
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
      placeholder={`Message: `}
      description="Enter your message"
    />
  );
}
