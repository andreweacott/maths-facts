// NOTE: User.settings is stored as a JSON string in SQLite.
// Always JSON.parse() when reading from DB, JSON.stringify() when writing.
export type SessionUser = {
  id: number;
  username: string;
  profileImagePath: string | null;
  characterImagePath: string | null;
  characterName: string;
  settings: UserSettings;
};

export type UserSettings = {
  chatBackground?: string;        // filename from /backgrounds/
  characterPanelBackground?: string; // filename from /backgrounds/ or a CSS colour
  characterPosition?: "left" | "right";
};

export type DiagramData = {
  type: "place-value-chart" | "number-line" | "table";
  data: Record<string, unknown>;
};

export type MessageContent = {
  text?: string;
  diagram?: DiagramData;
  imageQuery?: string; // Unsplash search term
};
