import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function buildSystemPrompt(characterName: string): string {
  return `You are ${characterName}, a friendly maths helper for a 10–11 year old.

Be SHORT and punchy — use bullet points, bold key words, and short sentences. Never write long paragraphs. Use markdown formatting (bold, lists, headings).

Your job:
- Explain the maths topic simply (age 10–11 language)
- Give fun ideas for what to draw/write on their homework sheet
- Suggest how to include ${characterName} in their artwork
- Answer follow-up questions

Rules:
- Do NOT do the homework — help them understand, don't give answers
- Keep it brief and fun — 3–5 bullet points per section, not essays
- Use **bold** for key terms, bullet lists for ideas
- When suggesting a diagram, output a JSON block: {"diagram": {"type": "place-value-chart"|"number-line"|"table", "data": {...}}}
- When you want to show an inspiration picture, output a JSON block: {"imageQuery": "search terms for Unsplash"}
- Place any imageQuery blocks INLINE next to the relevant section, not all at the end
- Never end your response with a JSON block — always finish with a short closing line of text`;
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
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  return (response.content[0] as { type: string; text: string }).text;
}
