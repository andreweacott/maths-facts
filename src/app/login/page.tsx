"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <main className="max-w-md mx-auto mt-16 p-2">
      <div className="card-fun animate-slide-up space-y-6">
        <div className="text-center">
          <p className="text-5xl mb-2 animate-pop-in">&#x1F44B;</p>
          <h1 className="text-4xl font-extrabold gradient-text">Welcome back!</h1>
          <p className="font-medium text-lg mt-1" style={{ color: 'var(--accent-dark)' }}>Log in to continue learning</p>
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
          {error && <p className="text-red-500 text-sm font-bold">&#x274C; {error}</p>}
          <button type="submit" className="w-full btn-fun text-xl">
            Let&apos;s go! &#x1F680;
          </button>
          <p className="text-base text-center text-gray-700">
            New here?{" "}
            <a href="/signup" className="font-extrabold transition-colors" style={{ color: 'var(--accent-dark)' }}>
              Sign up! &#x2728;
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
