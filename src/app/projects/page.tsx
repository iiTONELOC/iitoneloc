import { redirect } from "next/navigation";

/**
 * Projects now live in the single-scroll home as `// featured work`. Preserve
 * the old route by redirecting to that anchor.
 */
export default function ProjectsRedirect(): never {
  redirect("/#work");
}
