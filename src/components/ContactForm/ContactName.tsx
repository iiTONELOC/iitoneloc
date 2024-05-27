import { Input } from "./inputs/Input";
import { InputProps, inputTypes } from "./inputs/types";

export default function ContactNameInput({
  //NOSONAR
  onChange,
  currentValue,
  setValidated,
}: InputProps): JSX.Element | null {
  const validate = (
    e: React.SyntheticEvent,
    setValidated: inputTypes["setValidated"],
    _setError: React.Dispatch<React.SetStateAction<string | null>>,
    _clearError: Function
  ) => {
    const { value } = e.target as HTMLInputElement;
    const len = value.length;

    if (len === 0) {
      _setError("A name is required");
      setValidated(false);
      _clearError();
    } else if (len > 0 && len <= 2) {
      _setError("Names must be at least 3 characters");
      setValidated(false);
      _clearError();
    } else {
      _setError(null);
      setValidated(true);
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
      placeholder={`What's your name?`}
      description="Your name"
    />
  );
}
