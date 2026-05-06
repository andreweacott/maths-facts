import Link from "next/link";
import { getSession } from "@/lib/auth";
import SettingsButton from "./SettingsButton";

export default async function Header() {
  const session = await getSession();
  const user = session.user;
  const year = user?.settings?.year || "Year 4";

  return (
    <header className="w-topbar">
      <Link href="/" className="w-crest" aria-label="Home">M·F</Link>
      <Link href="/" className="w-brand">
        Maths-Facts
        <small>{user ? `${year} · ${user.username}` : "Home learning"}</small>
      </Link>
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
          <Link href="/login">Log in</Link>
        </div>
      )}
    </header>
  );
}
