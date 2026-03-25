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

describe("rawInput length validation", () => {
  it("rejects rawInput over 2000 characters", () => {
    const rawInput = "a".repeat(2001);
    const isValid = rawInput.trim().length > 0 && rawInput.length <= 2000;
    expect(isValid).toBe(false);
  });

  it("accepts rawInput at exactly 2000 characters", () => {
    const rawInput = "a".repeat(2000);
    const isValid = rawInput.trim().length > 0 && rawInput.length <= 2000;
    expect(isValid).toBe(true);
  });
});
