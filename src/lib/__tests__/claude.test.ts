import { buildSystemPrompt } from "../claude";

describe("buildSystemPrompt", () => {
  it("includes the character name", () => {
    const prompt = buildSystemPrompt("Zara");
    expect(prompt).toContain("Zara");
  });

  it("instructs not to do homework", () => {
    const prompt = buildSystemPrompt("Zara");
    expect(prompt.toLowerCase()).toContain("do not");
  });
});
