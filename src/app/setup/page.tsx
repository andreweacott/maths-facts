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
    <main className="w-stage">
      <div className="w-card wide">
        <p className="w-eyebrow">Almost there</p>
        <h1 className="w-h1">Add a couple of <em>pictures.</em></h1>
        <p className="w-sub">A grown-up can help with this part. You can change them later in Settings.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, color: "var(--w-plum)", margin: "0 0 10px" }}>Your profile picture</p>
            <ImagePicker
              label=""
              field="profile"
              onSelected={(path) => saveImagePath("profile", path)}
            />
          </div>

          <div className="w-divider"></div>

          <div>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, color: "var(--w-plum)", margin: "0 0 10px" }}>Your maths character</p>
            <ImagePicker
              label=""
              field="character"
              onSelected={(path) => saveImagePath("character", path)}
            />
          </div>
        </div>

        <div className="w-divider"></div>

        <button
          onClick={() => router.push("/")}
          className="w-btn-primary"
        >
          Take me home
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </main>
  );
}
