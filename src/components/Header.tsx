import { getSession } from "@/lib/auth";
import SettingsButton from "./SettingsButton";

export default async function Header() {
  const session = await getSession();
  const user = session.user;

  return (
    <header className="w-topbar">
      <a href="/" className="w-crest" aria-label="Home">M·F</a>
      <a href="/" className="w-brand">
        Maths-Facts
        <small>{user ? `Welcome, ${user.username}` : "Year 4 home learning"}</small>
      </a>
      {user ? (
        <div className="w-topbar-right">
          {user.profileImagePath ? (
            <span className="username">
              <img src={user.profileImagePath} alt={user.username} />
              {user.username}
            </span>
          ) : (
            <span className="username">{user.username}</span>
          )}
          <SettingsButton />
          <form action="/api/auth/logout" method="POST">
            <button type="submit">Sign out</button>
          </form>
        </div>
      ) : (
        <div className="w-topbar-right">
          <a href="/login">Log in</a>
        </div>
      )}
    </header>
  );
}
