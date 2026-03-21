import { getSession } from "@/lib/auth";

export default async function Header() {
  const session = await getSession();
  const user = session.user;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      <a href="/" className="text-xl font-bold text-indigo-600">
        Maths Facts
      </a>
      {user && (
        <div className="flex items-center gap-3">
          {user.profileImagePath && (
            <img
              src={user.profileImagePath}
              alt={user.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium">{user.username}</span>
          <a href="/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</a>
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Log out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
