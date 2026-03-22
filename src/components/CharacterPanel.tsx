type Props = {
  characterImagePath: string | null;
  characterName: string;
  panelBackground: string;
  reaction?: "idle" | "thinking" | "celebrating" | "waving";
};

const REACTION_EMOJI: Record<string, string> = {
  thinking: "🧠",
  celebrating: "🎉",
  waving: "👋",
};

export default function CharacterPanel({
  characterImagePath,
  characterName,
  panelBackground,
  reaction = "idle",
}: Props) {
  const isColor = panelBackground.startsWith("#") || panelBackground.startsWith("rgb");
  const style: React.CSSProperties = isColor
    ? { background: `linear-gradient(180deg, ${panelBackground}, ${panelBackground}cc)` }
    : { backgroundImage: `url(${panelBackground})`, backgroundSize: "cover", backgroundPosition: "center" };

  const reactionClass =
    reaction === "thinking" ? "animate-thinking" :
    reaction === "celebrating" ? "animate-celebrating" :
    reaction === "waving" ? "animate-waving" :
    "animate-float";

  return (
    <div
      className="w-36 flex-shrink-0 flex flex-col items-center justify-start pt-8 gap-4 relative"
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Reaction emoji bubble */}
        {reaction !== "idle" && REACTION_EMOJI[reaction] && (
          <div className="absolute -top-2 -right-2 text-2xl animate-pop-in z-20">
            {REACTION_EMOJI[reaction]}
          </div>
        )}

        {characterImagePath ? (
          <img
            src={characterImagePath}
            alt={characterName}
            className={`w-24 h-24 rounded-full object-cover border-4 border-yellow-300 shadow-2xl ${reactionClass}`}
          />
        ) : (
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-4xl shadow-2xl ${reactionClass}`}>
            &#x1F9D9;
          </div>
        )}
        <span className="text-base font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center px-2 tracking-wide">
          {characterName}
        </span>
      </div>
    </div>
  );
}
