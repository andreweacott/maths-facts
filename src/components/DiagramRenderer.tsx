type Diagram = { type: string; data: Record<string, unknown> };

const ROW_COLORS = ["bg-purple-50", "bg-pink-50", "bg-indigo-50", "bg-fuchsia-50", "bg-violet-50"];

export default function DiagramRenderer({ diagram }: { diagram: Diagram }) {
  if (diagram.type === "place-value-chart") {
    const d = diagram.data as Record<string, number>;
    const columns = Object.entries(d);
    return (
      <div className="overflow-x-auto my-3 rounded-xl border-2 border-purple-200 shadow-md">
        <table className="border-collapse text-center w-full">
          <thead>
            <tr>
              {columns.map(([col]) => (
                <th key={col} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 text-base font-extrabold capitalize">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map(([col, val]) => (
                <td key={col} className="border border-purple-200 px-6 py-4 text-2xl font-extrabold text-purple-700 bg-white">{val}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.type === "number-line") {
    const { start, end, highlight } = diagram.data as { start: number; end: number; highlight?: number };
    const count = end - start + 1;
    const numbers = Array.from({ length: count }, (_, i) => start + i);
    return (
      <div className="my-3 p-4 bg-white rounded-xl border-2 border-purple-200 shadow-md">
        <div className="flex items-center gap-0 overflow-x-auto py-2">
          {numbers.map((n, i) => (
            <div key={n} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 shadow-sm ${
                  n === highlight
                    ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white scale-125 ring-4 ring-yellow-300"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {n}
              </div>
              {i < numbers.length - 1 && <div className="w-4 h-1 bg-purple-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (diagram.type === "table") {
    const { headers, rows } = diagram.data as { headers: string[]; rows: string[][] };
    return (
      <div className="overflow-x-auto my-3 rounded-xl border-2 border-purple-200 shadow-md">
        <table className="border-collapse text-center w-full">
          {headers && (
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 text-base font-extrabold">{h}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ROW_COLORS[ri % ROW_COLORS.length]}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-purple-200 px-5 py-3 text-base font-bold text-gray-800">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback: render unknown diagram types as a styled card
  const entries = Object.entries(diagram.data);
  return (
    <div className="overflow-x-auto my-3 rounded-xl border-2 border-purple-200 shadow-md">
      <table className="border-collapse text-center w-full">
        <thead>
          <tr>
            {entries.map(([key]) => (
              <th key={key} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 text-base font-extrabold capitalize">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            {entries.map(([key, val]) => (
              <td key={key} className="border border-purple-200 px-5 py-3 text-base font-bold text-gray-800">{String(val)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
