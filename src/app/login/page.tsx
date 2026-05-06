import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session.user) redirect("/");

  return (
    <main className="w-stage">
      <div className="w-card">
        <p className="w-eyebrow">Welcome back</p>
        <h1 className="w-h1">Hello <em>again.</em></h1>
        <p className="w-sub">Log in to keep learning with Mathsie.</p>

        <LoginForm />

        <p className="w-foot-link">
          New here? <a href="/signup">Sign up</a>
        </p>
      </div>
    </main>
  );
}
