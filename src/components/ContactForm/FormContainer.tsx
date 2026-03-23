export default function FormContainer(
  props: Readonly<{
    children: JSX.Element[] | JSX.Element | null;
    onAction?: (formData: FormData) => void;
    _ref?: React.RefObject<HTMLFormElement>;
  }>
) {
  const { children, _ref } = props;
  return (
    <div className="w-full max-w-lg border border-sig-border rounded-lg bg-sig-dark-card p-6">
      {_ref ? (
        <form
          ref={_ref}
          className="space-y-5"
          autoComplete="off"
          action={props?.onAction}
        >
          {children}
        </form>
      ) : (
        <form
          className="space-y-5"
          autoComplete="off"
          action={props?.onAction}
        >
          {children}
        </form>
      )}
    </div>
  );
}
