import { getSession } from "@/lib/auth";
import SettingsButton from "./SettingsButton";

export default async function Header() {
  const session = await getSession();
  const user = session.user;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white/85 backdrop-blur-md border-b-2 border-purple-200 shadow-lg shadow-purple-100/30">
      <a href="/" className="text-2xl font-extrabold gradient-text tracking-tight">
        &#x2728; Maths Facts &#x2728;
      </a>
      {user && (
        <div className="flex items-center gap-3">
          {user.profileImagePath && (
            <img
              src={user.profileImagePath}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover border-3 border-yellow-300 shadow-md bounce-hover"
            />
          )}
          <span className="text-sm font-extrabold text-black">{user.username}</span>
          <SettingsButton />
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-gray-600 hover:text-red-500 font-bold transition-colors">
              Log out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
