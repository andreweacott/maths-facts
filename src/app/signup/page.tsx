"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("Mathsie");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, characterName }),
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
          <h1 className="text-4xl font-extrabold gradient-text">Join the fun!</h1>
          <p className="text-[#fbda04] font-medium text-lg mt-1">Create your account to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-purple-700 mb-1">Username</label>
            <input
              className="input-fun"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-purple-700 mb-1">Password</label>
            <input
              type="password"
              className="input-fun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-purple-700 mb-1">
              &#x1F9D9; Name your maths character
            </label>
            <input
              className="input-fun"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
            <p className="text-base text-[#0011ff] font-bold mt-1">Give them an awesome name!</p>
          </div>
          {error && <p className="text-red-500 text-sm font-bold">&#x274C; {error}</p>}
          <button type="submit" className="w-full btn-fun text-xl">
            Next &#x2192; &#x2728;
          </button>
          <p className="text-base text-center text-[#0011ff]">
            Already have an account?{" "}
            <a href="/login" className="text-[#0011ff] font-extrabold hover:text-blue-900 transition-colors">
              Log in! &#x1F511;
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
