import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const session = await getSession();
  if (session.user) redirect("/");

  return (
    <main className="w-stage">
      <div className="w-card">
        <p className="w-eyebrow">Welcome aboard</p>
        <h1 className="w-h1">Let&apos;s get you <em>set up.</em></h1>
        <p className="w-sub">Create an account and pick a name for your maths character.</p>

        <SignupForm />

        <p className="w-foot-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  );
}
