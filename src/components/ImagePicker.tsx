"use client";
import { useRef, useState } from "react";

type Props = {
  label: string;
  field: "profile" | "character";
  onSelected: (path: string) => void;
};

const PRESET_AVATARS = [
  "/avatars/robot.svg",
  "/avatars/wizard.svg",
  "/avatars/astronaut.svg",
  "/avatars/dragon.svg",
  "/avatars/cat.svg",
  "/avatars/unicorn.svg",
  "/avatars/penguin.svg",
  "/avatars/panda.svg",
  "/avatars/fox.svg",
  "/avatars/owl.svg",
  "/avatars/dinosaur.svg",
  "/avatars/bunny.svg",
];

export default function ImagePicker({ label, field, onSelected }: Props) {
  const [mode, setMode] = useState<"upload" | "library">("library");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("field", field);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        return;
      }
      const { path } = await res.json();
      setPreview(path);
      onSelected(path);
    } catch {
      setError("Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  }

  function handleUploadClick() {
    setMode("upload");
    // Small delay to ensure the input is rendered before clicking
    setTimeout(() => fileInputRef.current?.click(), 0);
  }

  function handlePreset(path: string) {
    setPreview(path);
    onSelected(path);
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label}</p>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={handleUploadClick}
          className={`px-3 py-1 rounded text-sm font-bold ${mode === "upload" ? "bg-indigo-600 text-white" : "bg-white ring-2 ring-gray-200 text-gray-700"}`}
        >
          {uploading ? "Uploading..." : "Upload photo"}
        </button>
        <button
          type="button"
          onClick={() => setMode("library")}
          className={`px-3 py-1 rounded text-sm font-bold ${mode === "library" ? "bg-indigo-600 text-white" : "bg-white ring-2 ring-gray-200 text-gray-700"}`}
        >
          Choose character
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {mode === "library" && (
        <div className="grid grid-cols-6 gap-2">
          {PRESET_AVATARS.map((src) => (
            <button key={src} type="button" onClick={() => handlePreset(src)}>
              <img
                src={src}
                alt=""
                className={`w-16 h-16 rounded-full object-cover border-4 ${
                  preview === src ? "border-indigo-600" : "border-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
