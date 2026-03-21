"use client";

const BACKGROUNDS = ["mountains.jpg", "beach.jpg", "forest.jpg", "meadow.jpg", "snow.jpg"];

type Props = {
  label: string;
  current: string | undefined;
  onSelect: (filename: string) => void;
};

export default function BackgroundPicker({ label, current, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg}
            type="button"
            onClick={() => onSelect(bg)}
            className={`w-20 h-14 rounded-lg overflow-hidden border-4 transition ${
              current === bg ? "border-indigo-600" : "border-transparent"
            }`}
          >
            <img
              src={`/backgrounds/${bg}`}
              alt={bg}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
