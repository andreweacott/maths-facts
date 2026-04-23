"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("Mathsie");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [showInviteCode, setShowInviteCode] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, characterName, inviteCode }),
    });
    if (res.ok) {
      router.push("/setup");
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  return (
    <main className="max-w-md mx-auto mt-16 p-2">
      <div className="card-fun animate-slide-up space-y-6">
        <div className="text-center">
          <p className="text-5xl mb-2 animate-pop-in">&#x1F389;</p>
          <h1 className="text-4xl font-extrabold text-black">Join the fun!</h1>
          <p className="font-medium text-lg mt-1 text-black">Create your account to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-black mb-1">Username</label>
            <input
              className="input-fun"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-black mb-1">Password</label>
            <input
              type="password"
              className="input-fun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-black mb-1">
              &#x1F9D9; Name your maths character
            </label>
            <input
              className="input-fun"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
            <p className="text-base font-bold mt-1 text-black">Give them an awesome name!</p>
          </div>
          <div>
            <label className="block text-sm font-extrabold text-black mb-1">Invite code</label>
            <div className="relative">
              <input
                type={showInviteCode ? "text" : "password"}
                className="input-fun pr-10"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowInviteCode((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                aria-label={showInviteCode ? "Hide invite code" : "Show invite code"}
              >
                {showInviteCode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-bold">&#x274C; {error}</p>}
          <button type="submit" className="w-full btn-fun text-xl">
            Next &#x2192; &#x2728;
          </button>
          <p className="text-base text-center text-gray-700">
            Already have an account?{" "}
            <a href="/login" className="font-extrabold transition-colors text-black underline">
              Log in! &#x1F511;
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
