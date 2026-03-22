"use client";

const BACKGROUNDS = [
  { file: "mountains.jpg", name: "Mountains" },
  { file: "beach.jpg", name: "Beach" },
  { file: "forest.jpg", name: "Forest" },
  { file: "meadow.jpg", name: "Meadow" },
  { file: "snow.jpg", name: "Snow" },
  { file: "autumn.jpg", name: "Autumn" },
  { file: "sunset.jpg", name: "Sunset" },
  { file: "tropical.jpg", name: "Tropical" },
  { file: "stars.jpg", name: "Stars" },
  { file: "desert.jpg", name: "Desert" },
  { file: "canyon.jpg", name: "Canyon" },
];

type Props = {
  label: string;
  current: string | undefined;
  onSelect: (filename: string) => void;
};

export default function BackgroundPicker({ label, current, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="font-extrabold text-purple-700 text-base">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.file}
            type="button"
            onClick={() => onSelect(bg.file)}
            className={`rounded-xl overflow-hidden transition-all ${
              current === bg.file || current === `/backgrounds/${bg.file}`
                ? "ring-4 ring-yellow-400 scale-105 shadow-lg"
                : "ring-2 ring-gray-200 hover:ring-purple-300"
            }`}
          >
            <img
              src={`/backgrounds/${bg.file}`}
              alt={bg.name}
              className="w-full h-16 object-cover"
            />
            <p className="text-xs font-bold py-1 bg-white">{bg.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
