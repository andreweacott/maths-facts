"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import BackgroundPicker from "@/components/BackgroundPicker";
import ImagePicker from "@/components/ImagePicker";
import { useTheme } from "@/components/ThemeProvider";

const THEMES = [
  { id: "candy", name: "Candy", character: "/avatars/unicorn.svg", preview: "linear-gradient(135deg, #a78bfa, #c084fc, #f0abfc)" },
  { id: "ocean", name: "Ocean", character: "/avatars/penguin.svg", preview: "linear-gradient(135deg, #0077b6, #00b4d8, #90e0ef)" },
  { id: "sunset", name: "Sunset", character: "/avatars/sun.svg", preview: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)" },
  { id: "forest", name: "Forest", character: "/avatars/owl.svg", preview: "linear-gradient(135deg, #065f46, #10b981, #6ee7b7)" },
  { id: "bubblegum", name: "Bubblegum", character: "/avatars/bunny.svg", preview: "linear-gradient(135deg, #f472b6, #fb7185, #fda4af)" },
  { id: "golden", name: "Golden", character: "/avatars/cat.svg", preview: "linear-gradient(135deg, #b45309, #d97706, #fbbf24)" },
  { id: "arctic", name: "Arctic", character: "/avatars/polar-bear.svg", preview: "linear-gradient(135deg, #bae6fd, #e0f2fe, #f0f9ff)" },
  { id: "space", name: "Space", character: "/avatars/astronaut.svg", preview: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" },
];

const FONTS = [
  { id: "comic-sans", name: "Comic Sans", preview: "Comic Sans MS" },
  { id: "rounded", name: "Rounded", preview: "Nunito" },
  { id: "handwriting", name: "Handwriting", preview: "Caveat" },
  { id: "clean", name: "Clean", preview: "Inter" },
];

const FONT_SIZES = [
  { id: "small", name: "S", size: "14px" },
  { id: "medium", name: "M", size: "16px" },
  { id: "large", name: "L", size: "18px" },
  { id: "extra-large", name: "XL", size: "20px" },
];

const BUBBLE_STYLES = [
  { id: "rounded", name: "Rounded", radius: "1.25rem" },
  { id: "square", name: "Square", radius: "0.375rem" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsModal({ open, onClose }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const originalSettings = useRef<Record<string, string>>({});
  const originalProfileImage = useRef<string | null>(null);
  const { setTheme, setCustom } = useTheme();

  // Load settings when opened and snapshot the originals
  useEffect(() => {
    if (!open) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => {
        const s = u?.settings ?? {};
        setDraft(s);
        originalSettings.current = { ...s };
        setProfileImagePath(u?.profileImagePath ?? null);
        originalProfileImage.current = u?.profileImagePath ?? null;
      });
  }, [open]);

  // Revert all previewed changes back to original
  const revert = useCallback(() => {
    const orig = originalSettings.current;
    if (orig.theme) setTheme(orig.theme as "candy" | "ocean");
    for (const [key, value] of Object.entries(orig)) {
      if (key !== "theme") setCustom(key, value);
    }
    // Revert profile image if it was changed but not saved
    if (profileImagePath !== originalProfileImage.current) {
      setProfileImagePath(originalProfileImage.current);
      // Revert on server too
      fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImagePath: originalProfileImage.current ?? "" }),
      });
    }
  }, [setTheme, setCustom, profileImagePath]);

  // Close without saving — revert
  const handleCancel = useCallback(() => {
    revert();
    onClose();
  }, [revert, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Preview a change (apply to UI but don't persist)
  function preview(updates: Record<string, string>) {
    const next = { ...draft, ...updates };
    setDraft(next);
    for (const [key, value] of Object.entries(updates)) {
      if (key === "theme") setTheme(value as "candy" | "ocean");
      else setCustom(key, value);
    }
  }

  // Save all draft settings to server
  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    // Update the snapshot so future cancels don't revert to stale state
    originalSettings.current = { ...draft };
    originalProfileImage.current = profileImagePath;
    setSaving(false);
    onClose();
    router.refresh();
  }

  const current = (key: string, fallback: string) => draft[key] || fallback;

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="settings-modal relative w-full max-w-2xl max-h-[85vh] mt-16 mx-4 overflow-y-auto rounded-2xl shadow-2xl animate-slide-up" style={{ background: '#ffffff', color: '#000000' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: 'rgba(255,255,255,0.95)' }}>
          <h1 className="text-2xl font-extrabold text-black">Settings</h1>
          <button
            onClick={handleCancel}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold transition-colors"
          >
            &#x2715;
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile picture */}
          <Section title="&#x1F4F7; Your profile picture">
            <div className="flex items-center gap-6">
              {profileImagePath ? (
                <img
                  src={profileImagePath}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-yellow-300 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-3xl shadow-lg">
                  &#x1F9D1;
                </div>
              )}
              <div className="flex-1">
                <ImagePicker
                  label="Change your picture"
                  field="profile"
                  onSelected={async (path) => {
                    setProfileImagePath(path);
                    // Save profile image immediately (it's an uploaded file, not a setting)
                    await fetch("/api/auth/me", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ profileImagePath: path }),
                    });
                  }}
                />
              </div>
            </div>
          </Section>

          {/* Theme */}
          <Section title="&#x1F3A8; App theme">
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <PickerButton key={t.id} selected={current("theme", "candy") === t.id} onClick={() => preview({ theme: t.id })}>
                  <div className="w-full h-10 rounded-lg mb-1" style={{ background: t.preview }} />
                  <img src={t.character} alt={t.name} className="w-10 h-10 mx-auto rounded-full" />
                  <p className="font-extrabold text-xs">{t.name}</p>
                </PickerButton>
              ))}
            </div>
          </Section>

          {/* Font */}
          <Section title="&#x1F524; Font">
            <div className="grid grid-cols-2 gap-3">
              {FONTS.map((f) => (
                <PickerButton key={f.id} selected={current("font", "comic-sans") === f.id} onClick={() => preview({ font: f.id })}>
                  <p className="text-lg font-bold" style={{ fontFamily: f.preview }}>{f.name}</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: f.preview }}>Abc 123</p>
                </PickerButton>
              ))}
            </div>
          </Section>

          {/* Font size */}
          <Section title="&#x1F4CF; Text size">
            <div className="grid grid-cols-4 gap-2">
              {FONT_SIZES.map((s) => (
                <PickerButton key={s.id} selected={current("fontSize", "medium") === s.id} onClick={() => preview({ fontSize: s.id })}>
                  <p className="font-extrabold" style={{ fontSize: s.size }}>Aa</p>
                  <p className="text-sm text-gray-600">{s.name}</p>
                </PickerButton>
              ))}
            </div>
          </Section>

          {/* Bubble style */}
          <Section title="&#x1F4AD; Bubble shape">
            <div className="grid grid-cols-2 gap-3">
              {BUBBLE_STYLES.map((s) => (
                <PickerButton key={s.id} selected={current("bubbleStyle", "rounded") === s.id} onClick={() => preview({ bubbleStyle: s.id })}>
                  <div className="w-full h-8 mb-1 opacity-60" style={{ borderRadius: s.radius, background: 'var(--btn-gradient)' }} />
                  <p className="text-sm font-bold">{s.name}</p>
                </PickerButton>
              ))}
            </div>
          </Section>

          {/* Character position */}
          <Section title="&#x1F9D9; Character position">
            <div className="flex gap-3">
              {(["left", "right"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => preview({ characterPosition: pos })}
                  className={`flex-1 px-4 py-3 rounded-xl font-extrabold text-base transition-all ${
                    current("characterPosition", "left") === pos ? "btn-fun" : "bg-white ring-2 ring-gray-200 text-gray-700 hover:ring-gray-300"
                  }`}
                >
                  {pos === "left" ? "\u2190 Left" : "Right \u2192"}
                </button>
              ))}
            </div>
          </Section>

          <BackgroundPicker
            label="&#x1F304; Chat background"
            current={draft.chatBackground}
            onSelect={(bg) => preview({ chatBackground: bg })}
          />

          <BackgroundPicker
            label="&#x1F3A8; Character panel background"
            current={draft.characterPanelBackground}
            onSelect={(bg) => preview({ characterPanelBackground: `/backgrounds/${bg}` })}
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 rounded-xl font-extrabold text-base bg-white ring-2 ring-gray-200 text-gray-700 hover:ring-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-fun text-xl py-3"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="font-extrabold text-base text-black">{title}</p>
      {children}
    </div>
  );
}

function PickerButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-3 text-center transition-all ${
        selected ? "ring-4 ring-yellow-400 shadow-lg scale-105 bg-white" : "ring-2 ring-gray-200 hover:ring-gray-400 bg-white"
      }`}
    >
      {children}
    </button>
  );
}
