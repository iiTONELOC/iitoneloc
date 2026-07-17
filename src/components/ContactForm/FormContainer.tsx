export default function FormContainer(
  props: Readonly<{
    children: JSX.Element[] | JSX.Element | null;
    onAction?: (formData: FormData) => void;
  }>
) {
  const { children } = props;
  return (
    <div className="w-full border border-op-border rounded-lg bg-op-surface p-6">
      <form
        className="space-y-5"
        autoComplete="off"
        action={props?.onAction}
      >
        {children}
      </form>
    </div>
  );
}
