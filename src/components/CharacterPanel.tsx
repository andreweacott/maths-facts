type Props = {
  characterImagePath: string | null;
  characterName: string;
  panelBackground: string;
};

export default function CharacterPanel({ characterImagePath, characterName, panelBackground }: Props) {
  const style: React.CSSProperties = panelBackground.startsWith("#") || panelBackground.startsWith("rgb")
    ? { backgroundColor: panelBackground }
    : { backgroundImage: `url(${panelBackground})`, backgroundSize: "cover", backgroundPosition: "center" };

  return (
    <div
      className="w-28 flex-shrink-0 flex flex-col items-center justify-start pt-6 gap-3"
      style={style}
    >
      {characterImagePath ? (
        <img
          src={characterImagePath}
          alt={characterName}
          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-2xl">&#x1F9D9;</div>
      )}
      <span className="text-xs font-bold text-white drop-shadow text-center px-1">{characterName}</span>
    </div>
  );
}
