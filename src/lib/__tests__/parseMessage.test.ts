import { parseMessageContent } from "../parseMessage";

describe("parseMessageContent", () => {
  it("parses plain text", () => {
    const result = parseMessageContent("Hello there!");
    expect(result).toEqual([{ type: "text", text: "Hello there!" }]);
  });

  it("parses a diagram block", () => {
    const raw = 'Here is a chart: {"diagram": {"type": "place-value-chart", "data": {"hundreds": 3}}}';
    const result = parseMessageContent(raw);
    expect(result).toContainEqual(expect.objectContaining({ type: "diagram" }));
  });

  it("parses an image query block", () => {
    const raw = 'Look at this: {"imageQuery": "place value chart colourful"}';
    const result = parseMessageContent(raw);
    expect(result).toContainEqual(expect.objectContaining({ type: "imageQuery" }));
  });

  it("strips truncated JSON at end of message", () => {
    const raw = 'Some ideas:\n\n{"imageQuery": "colourful smoothie';
    const result = parseMessageContent(raw);
    expect(result).toEqual([{ type: "text", text: "Some ideas:" }]);
    expect(result).not.toContainEqual(expect.objectContaining({ type: "imageQuery" }));
  });
});
