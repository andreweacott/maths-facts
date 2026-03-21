import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TopicList from "@/components/TopicList";

export default async function HomePage() {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 space-y-6">
      <div className="flex items-center gap-4">
        {session.user.characterImagePath && (
          <img
            src={session.user.characterImagePath}
            alt={session.user.characterName}
            className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">Hi {session.user.username}!</h1>
          <p className="text-gray-500">
            {session.user.characterName} is ready to help.
          </p>
        </div>
      </div>
      <a
        href="/topic/new"
        className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition"
      >
        Start this week&#39;s topic &rarr;
      </a>
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Past topics</h2>
        <TopicList topics={topics} />
      </div>
    </main>
  );
}
