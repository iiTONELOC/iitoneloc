type InputKind = "text" | "textarea";

export type InputChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

export type ValidateFn = (
  e: React.SyntheticEvent,
  setValidated: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  clearError: () => void
) => void;

export type inputTypes = {
  id: string;
  name: string;
  type: InputKind;
  description: string;
  autoComplete: string;
  placeholder: string;
  currentValue: string;
  required: boolean;
  onChange: (e: InputChangeEvent) => void;
  setValidated: React.Dispatch<React.SetStateAction<boolean>>;
  validate: ValidateFn;
};

export type InputProps = {
  currentValue: inputTypes["currentValue"];
  setValidated: inputTypes["setValidated"];
  onChange: inputTypes["onChange"];
};
