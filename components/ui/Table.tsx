interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
}

export default function Table({ columns, data }: TableProps) {
  const validData = Array.isArray(data) ? data : [];
  const validColumns = Array.isArray(columns) ? columns : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {validColumns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {validData.length === 0 ? (
            <tr>
              <td
                colSpan={validColumns.length}
                className="px-6 py-8 text-center text-slate-500"
              >
                Sin datos disponibles
              </td>
            </tr>
          ) : (
            validData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                {validColumns.map((col) => {
                  const value = row[col.key];
                  // Nunca renderizar un objeto/array crudo como hijo de React
                  // (p. ej. una relación anidada tipo `producto`). Si llega algo
                  // no primitivo, se muestra "-" en vez de crashear toda la tabla.
                  const safeValue =
                    typeof value === "object" && value !== null ? "-" : value;
                  return (
                    <td key={col.key} className="px-6 py-4 text-slate-700">
                      {safeValue || "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
