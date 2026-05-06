import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import HomeShell from "@/components/HomeShell";

export default async function HomePage() {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <HomeShell
      username={session.user.username}
      characterName={session.user.characterName}
      profileImagePath={session.user.profileImagePath ?? null}
      characterImagePath={session.user.characterImagePath ?? null}
      year={session.user.settings?.year || "Year 4"}
      topics={topics.map((t) => ({
        id: t.id,
        title: t.title,
        createdAt: t.createdAt.toISOString(),
      }))}
    />
  );
}
