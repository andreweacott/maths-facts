"use client";
import { useRouter } from "next/navigation";
import ImagePicker from "@/components/ImagePicker";

async function saveImagePath(field: "profile" | "character", path: string) {
  const res = await fetch("/api/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      field === "profile" ? { profileImagePath: path } : { characterImagePath: path }
    ),
  });
  if (!res.ok) {
    console.error("Failed to save image path:", await res.text());
  }
}

export default function SetupPage() {
  const router = useRouter();

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add your pictures</h1>
        <p className="text-gray-500 text-sm mt-1">A grown-up can help with this part.</p>
      </div>
      <ImagePicker
        label="Your profile picture"
        field="profile"
        onSelected={(path) => saveImagePath("profile", path)}
      />
      <ImagePicker
        label="Your maths character"
        field="character"
        onSelected={(path) => saveImagePath("character", path)}
      />
      <button
        onClick={() => router.push("/")}
        className="w-full bg-indigo-600 text-white py-2 rounded font-semibold"
      >
        Let's go! →
      </button>
    </main>
  );
}
