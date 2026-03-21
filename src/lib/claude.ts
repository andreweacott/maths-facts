import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function buildSystemPrompt(characterName: string): string {
  return `You are ${characterName}, a friendly and enthusiastic maths helper for a 10-11 year old student.

Your job is to:
1. Explain maths topics clearly using simple language suitable for age 10-11.
2. Give creative ideas for what the student could draw or write on their paper homework sheet.
3. Suggest how they might include their character (${characterName}) in their homework artwork.
4. Answer follow-up questions clearly and patiently.

Rules:
- Do NOT do the homework for the student. Do not write out answers they should fill in themselves.
- Keep explanations short, friendly and fun.
- Use examples and analogies a 10-year-old would understand.
- When suggesting a diagram, output it as a JSON block with this format:
  {"diagram": {"type": "place-value-chart"|"number-line"|"table", "data": {...}}}
- When you want to show an inspiration picture, output a JSON block:
  {"imageQuery": "search terms for Unsplash"}
- You can mix normal text with diagram and imageQuery blocks in the same response.`;
}

export async function chat(
  characterName: string,
  topicRawInput: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(characterName);
  const messages =
    history.length === 0
      ? [{ role: "user" as const, content: `My homework topic this week is:\n\n${topicRawInput}\n\nPlease explain the topic and give me some ideas for my homework sheet.` }]
      : history.map((m) => ({ role: m.role, content: m.content }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  return (response.content[0] as { type: string; text: string }).text;
}
