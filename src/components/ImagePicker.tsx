"use client";
import { useState } from "react";

type Props = {
  label: string;
  field: "profile" | "character";
  onSelected: (path: string) => void;
};

const PRESET_AVATARS = [
  "/avatars/robot.png",
  "/avatars/wizard.png",
  "/avatars/astronaut.png",
  "/avatars/dragon.png",
  "/avatars/cat.png",
];

export default function ImagePicker({ label, field, onSelected }: Props) {
  const [mode, setMode] = useState<"upload" | "library">("upload");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("field", field);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const { path } = await res.json();
    setPreview(path);
    onSelected(path);
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
          onClick={() => setMode("upload")}
          className={`px-3 py-1 rounded text-sm ${mode === "upload" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
        >
          Upload photo
        </button>
        <button
          type="button"
          onClick={() => setMode("library")}
          className={`px-3 py-1 rounded text-sm ${mode === "library" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
        >
          Choose character
        </button>
      </div>

      {mode === "upload" && (
        <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
      )}

      {mode === "library" && (
        <div className="flex gap-2 flex-wrap">
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

      {preview && (
        <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
      )}
    </div>
  );
}
