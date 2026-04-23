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
    <main className="max-w-md mx-auto mt-16 p-2">
      <div className="card-fun animate-slide-up space-y-6 stagger-children">
        <div className="text-center animate-slide-up">
          <h1 className="text-3xl font-extrabold text-black">Add your pictures</h1>
          <p className="text-gray-600 text-base mt-1">A grown-up can help with this part.</p>
        </div>
        <div className="animate-slide-up">
          <ImagePicker
            label="Your profile picture"
            field="profile"
            onSelected={(path) => saveImagePath("profile", path)}
          />
        </div>
        <div className="animate-slide-up">
          <ImagePicker
            label="Your maths character"
            field="character"
            onSelected={(path) => saveImagePath("character", path)}
          />
        </div>
        <button
          onClick={() => router.push("/")}
          className="w-full btn-fun text-lg animate-slide-up"
        >
          Let&apos;s go! &rarr;
        </button>
      </div>
    </main>
  );
}
