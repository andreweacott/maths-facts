"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function uploadFile(file: File) {
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  }

  function handleUploadClick() {
    setMode("upload");
    fileInputRef.current?.click();
  }

  async function handleCameraClick() {
    setError(null);
    setMode("upload");
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Could not access camera. Check permissions or try Upload file.");
      setCameraOpen(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function handleSnap() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) {
      setError("Could not capture photo");
      return;
    }
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
    stopCamera();
    await uploadFile(file);
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handlePreset(path: string) {
    setPreview(path);
    onSelected(path);
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label}</p>
      <div className="flex gap-2 mb-2 flex-wrap">
        <button
          type="button"
          onClick={handleCameraClick}
          className="px-3 py-1 rounded text-sm font-bold bg-white ring-2 ring-gray-200 text-gray-700"
        >
          📷 Take photo
        </button>
        <button
          type="button"
          onClick={handleUploadClick}
          className={`px-3 py-1 rounded text-sm font-bold ${mode === "upload" ? "bg-indigo-600 text-white" : "bg-white ring-2 ring-gray-200 text-gray-700"}`}
        >
          {uploading ? "Uploading..." : "🖼️ From photos"}
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
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {cameraOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded bg-black"
            />
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={handleSnap}
                disabled={uploading}
                className="px-4 py-2 rounded font-bold bg-indigo-600 text-white disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "📸 Snap"}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded font-bold bg-gray-200 text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
