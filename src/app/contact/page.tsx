import { redirect } from "next/navigation";

/**
 * Contact now lives in the single-scroll home as `// contact`. Preserve the old
 * route by redirecting to that anchor.
 */
export default function ContactRedirect(): never {
  redirect("/#contact");
}
