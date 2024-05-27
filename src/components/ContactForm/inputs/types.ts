export type inputTypes = {
  id: string;
  name: string;
  type: string;
  description: string;
  autoComplete: string;
  placeholder: string;
  currentValue: string;
  required: boolean;
  className?: string;
  errorClearTime?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValidated: React.Dispatch<React.SetStateAction<boolean>>;

  /**
     * A custom validation function used to validate the input
     * Requires the following parameters:
     * @param e - the event
     * @param setValidated - the setValidated function from the grandparent component
     * @param setError - the setError function from the Input component
     * @param clearError - the clearError function from the Input component
     * @example
     * ```js
     *      // Validates that the repo name has at least 3 characters

            const validate = (e, setValidated, _setError, _clearError) => {
            const { value } = e.target as HTMLInputElement;
            const len = value.length;

            if (len === 0) {
                _setError('A repo name is required');
                setValidated(false);
                _clearError();
            } else if (len > 0 && len <= 2) {
                _setError('repoNames must be at least 3 characters');
                setValidated(false);
                _clearError();
            } else {
                _setError(null);
                setValidated(true);
            }
        };
     * ```
     */
  validate: (
    e: React.SyntheticEvent,
    _setValidated: React.Dispatch<React.SetStateAction<boolean>>,
    _setError: React.Dispatch<React.SetStateAction<string | null>>,
    _clearError: Function
  ) => void;
};

export type InputProps = {
  currentValue: inputTypes["currentValue"];
  setValidated: inputTypes["setValidated"];
  onChange: inputTypes["onChange"];
  availableRepos?: string[];
};
