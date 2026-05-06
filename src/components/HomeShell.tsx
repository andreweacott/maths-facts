"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SettingsModal from "@/components/SettingsModal";

type Topic = { id: number; title: string; createdAt: string | Date };

type Props = {
  username: string;
  characterName: string;
  profileImagePath: string | null;
  characterImagePath: string | null;
  topics: Topic[];
};

const AV_CLASSES = ["hs-av-1", "hs-av-2", "hs-av-3", "hs-av-4", "hs-av-5"];

function initials(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function formatWhen(d: Date) {
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

const Tick = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 10l4 4 10-10M7 10l4 4 5-5" />
  </svg>
);

export default function HomeShell({
  username,
  characterName,
  profileImagePath,
  characterImagePath,
  topics,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [topicList, setTopicList] = useState(topics);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const visible = useMemo(() => {
    if (!filter.trim()) return topicList;
    const q = filter.toLowerCase();
    return topicList.filter((t) => t.title.toLowerCase().includes(q));
  }, [filter, topicList]);

  async function handleDelete(id: number) {
    const res = await fetch(`/api/topics/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTopicList((prev) => prev.filter((t) => t.id !== id));
    }
    setConfirmDelete(null);
  }

  function startNewTopic() {
    router.push("/topic/new");
  }

  return (
    <div className="home-shell">
      <header className="hs-topbar">
        <div className="hs-crest">M·F</div>
        <div className="hs-title">
          Maths-Facts
          <small>Welcome, {username}</small>
        </div>
        <div className="hs-actions">
          <button onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <form action="/api/auth/logout" method="POST">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <div className="hs-body">
        <aside className="hs-aside">
          <div className="hs-mebox">
            {profileImagePath ? (
              <img className="hs-meav" src={profileImagePath} alt={username} />
            ) : (
              <div className="hs-meav">{initials(username)}</div>
            )}
            <div>
              <div className="hs-mename">
                Welcome back, <em>{username}!</em>
              </div>
              <div className="hs-mesub">{characterName} is ready when you are</div>
            </div>
          </div>

          <div className="hs-sidehead">
            <h3>Your lessons</h3>
            <small>{topicList.length} saved</small>
          </div>

          <div className="hs-search">
            <input
              className="hs-searchbox"
              placeholder="Search lessons"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="hs-toplist">
            {visible.length === 0 ? (
              <div className="hs-empty">
                <p>📚</p>
                <p>{filter ? "No lessons match." : "No lessons yet — start your first one!"}</p>
              </div>
            ) : (
              visible.map((t, i) => (
                <a
                  key={t.id}
                  className="hs-row"
                  href={`/chat/${t.id}`}
                  onClick={(e) => {
                    if (confirmDelete === t.id) e.preventDefault();
                  }}
                >
                  <div className={`hs-av ${AV_CLASSES[i % AV_CLASSES.length]}`}>
                    {initials(t.title)}
                  </div>
                  <div className="hs-info">
                    <div className="hs-toprow">
                      <span className="hs-nm">{t.title}</span>
                      <span className="hs-when">{formatWhen(new Date(t.createdAt))}</span>
                    </div>
                    <div className="hs-preview">
                      <Tick />
                      Tap to continue
                    </div>
                  </div>
                  {confirmDelete === t.id ? (
                    <button
                      className="hs-trash"
                      style={{ opacity: 1, color: "var(--coral-2)" }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(t.id);
                      }}
                      title="Confirm delete"
                    >
                      ✓
                    </button>
                  ) : (
                    <button
                      className="hs-trash"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDelete(t.id);
                      }}
                      title="Delete lesson"
                    >
                      🗑
                    </button>
                  )}
                </a>
              ))
            )}
          </div>
        </aside>

        <section className="hs-thread">
          <header className="hs-threadhead">
            <div className="who">
              {characterImagePath ? (
                <img src={characterImagePath} alt={characterName} />
              ) : (
                <div className="hs-av hs-av-mathsie" style={{ width: 42, height: 42, fontSize: 16 }}>
                  {initials(characterName)}
                </div>
              )}
              <div>
                <h2>{characterName}</h2>
                <div className="status">Online · ready when you are</div>
              </div>
            </div>
          </header>

          <div className="hs-messages">
            <div className="hs-day">TODAY</div>
            <div className="hs-msg them">
              Hello hello, {username}! 🌼<br />
              So lovely to see you again.
            </div>
            <div className="hs-msg them">
              Whenever you're ready, tap the green button below to start a new lesson — I&apos;ll come up with something fun for us 🌱
            </div>
            <button
              className="hs-lessoncard"
              onClick={startNewTopic}
              style={{ border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <div className="banner">
                <div className="kicker">▶ Start a new lesson</div>
                <h3>
                  Pick a <em>topic</em>
                  <br />
                  and we&apos;ll go.
                </h3>
              </div>
              <div className="body">
                <p>
                  Tell {characterName}{" "}what you&apos;d like to learn — times tables, fractions, shapes, anything. About 12 minutes, no homework.
                </p>
                <span className="start">
                  Start lesson
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </button>
            <div className="hs-msg them">
              Or pick one of your past lessons on the left to keep going.
            </div>
          </div>

          <footer className="hs-compose">
            <span className="ic">😊</span>
            <input placeholder="Type a message…" disabled />
            <button className="send" type="button" disabled aria-label="Send">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="m3 11 18-8-8 18-2-7-8-3z" />
              </svg>
            </button>
          </footer>

          <div className="hs-grownup">
            <div className="dot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span>
              <b>For grown-ups:</b> lessons are gentle, never longer than 15 mins. Nothing to mark or hand in.
            </span>
            <a href="#">Read more</a>
          </div>
        </section>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
