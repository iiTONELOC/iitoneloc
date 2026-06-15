export default function FormContainer(
  props: Readonly<{
    children: JSX.Element[] | JSX.Element | null;
    onAction?: (formData: FormData) => void;
    _ref?: React.RefObject<HTMLFormElement>;
  }>
) {
  const { children, _ref } = props;
  return (
    <div className="w-full border border-op-border rounded-lg bg-op-surface p-6">
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
