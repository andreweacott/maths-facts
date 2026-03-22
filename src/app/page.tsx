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
    <main className="max-w-2xl mx-auto mt-10 p-6 space-y-6 stagger-children">
      <div className="card-fun animate-slide-up">
        <div className="flex items-center gap-5">
          {session.user.characterImagePath ? (
            <img
              src={session.user.characterImagePath}
              alt={session.user.characterName}
              className="w-28 h-28 rounded-full object-cover border-4 border-yellow-300 shadow-xl animate-float"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-5xl shadow-xl animate-float">
              &#x1F9D9;
            </div>
          )}
          <div>
            <h1 className="text-4xl font-extrabold gradient-text">
              Hi {session.user.username}! &#x1F44B;
            </h1>
            <p className="text-[#fbda04] font-bold text-xl mt-1">
              {session.user.characterName} is ready to help! &#x2728;
            </p>
          </div>
        </div>
      </div>

      <a
        href="/topic/new"
        className="block text-center btn-fun text-2xl py-5 animate-slide-up"
      >
        &#x1F680; Start this week&apos;s topic! &#x1F680;
      </a>

      <div className="animate-slide-up">
        <h2 className="font-extrabold text-white text-xl mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25)' }}>&#x1F4DA; Past topics</h2>
        <TopicList topics={topics} />
      </div>
    </main>
  );
}
