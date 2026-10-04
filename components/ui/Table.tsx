interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
}

export default function Table({ columns, data }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-slate-500"
              >
                Sin datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b border-slate-100 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-blue-50`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-slate-700">
                    {row[col.key] || "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
