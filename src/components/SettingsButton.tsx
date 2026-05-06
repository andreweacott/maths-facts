"use client";
import { useState } from "react";
import SettingsModal from "./SettingsModal";

export default function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        &#x2699;&#xFE0F; Settings
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
