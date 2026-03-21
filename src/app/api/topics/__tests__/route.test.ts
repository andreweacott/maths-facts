import { prisma } from "@/lib/db";

describe("POST /api/topics", () => {
  it("creates a topic and returns its id", async () => {
    const user = await prisma.user.create({
      data: { username: "testuser1", passwordHash: "x", characterName: "T" },
    });

    const topic = await prisma.topic.create({
      data: { userId: user.id, title: "Place Value", rawInput: "Place value and digit positions" },
    });

    expect(topic.id).toBeDefined();
    expect(topic.title).toBe("Place Value");

    // Cleanup
    await prisma.topic.delete({ where: { id: topic.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
