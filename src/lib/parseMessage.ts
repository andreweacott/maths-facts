type TextPart = { type: "text"; text: string };
type DiagramPart = { type: "diagram"; diagram: { type: string; data: Record<string, unknown> } };
type ImageQueryPart = { type: "imageQuery"; query: string };
export type MessagePart = TextPart | DiagramPart | ImageQueryPart;

function extractJsonObjects(text: string): { json: Record<string, unknown>; start: number; end: number }[] {
  const results = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "{") {
      let depth = 0;
      let j = i;
      while (j < text.length) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") { depth--; if (depth === 0) break; }
        j++;
      }
      try {
        const candidate = text.slice(i, j + 1);
        const json = JSON.parse(candidate);
        if (json.diagram || json.imageQuery) {
          results.push({ json, start: i, end: j + 1 });
        }
      } catch { /* not valid JSON, skip */ }
      i = j + 1;
    } else {
      i++;
    }
  }
  return results;
}

export function parseMessageContent(raw: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const blocks = extractJsonObjects(raw);
  let lastIndex = 0;

  for (const { json, start, end } of blocks) {
    if (start > lastIndex) {
      const text = raw.slice(lastIndex, start).trim();
      if (text) parts.push({ type: "text", text });
    }
    if (json.diagram) {
      parts.push({ type: "diagram", diagram: json.diagram as DiagramPart["diagram"] });
    } else if (json.imageQuery) {
      parts.push({ type: "imageQuery", query: json.imageQuery as string });
    }
    lastIndex = end;
  }

  if (lastIndex < raw.length) {
    const remaining = raw.slice(lastIndex).trim();
    if (remaining) parts.push({ type: "text", text: remaining });
  }

  return parts.length ? parts : [{ type: "text", text: raw }];
}
