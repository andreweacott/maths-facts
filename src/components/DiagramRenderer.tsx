type Diagram = { type: string; data: Record<string, unknown> };

export default function DiagramRenderer({ diagram }: { diagram: Diagram }) {
  if (diagram.type === "place-value-chart") {
    const d = diagram.data as Record<string, number>;
    const columns = Object.entries(d);
    return (
      <div className="overflow-x-auto my-2">
        <table className="border-collapse text-center text-sm">
          <thead>
            <tr>
              {columns.map(([col]) => (
                <th key={col} className="bg-indigo-600 text-white px-4 py-2 capitalize">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map(([col, val]) => (
                <td key={col} className="border border-indigo-200 px-6 py-3 text-xl font-bold">{val}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (diagram.type === "number-line") {
    const { start, end, highlight } = diagram.data as { start: number; end: number; highlight?: number };
    const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return (
      <div className="flex items-center gap-1 my-2 overflow-x-auto py-2">
        {numbers.map((n) => (
          <div
            key={n}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              n === highlight ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {n}
          </div>
        ))}
      </div>
    );
  }

  return <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(diagram, null, 2)}</pre>;
}
