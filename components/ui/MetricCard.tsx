interface MetricCardProps {
  label: string;
  value: string;
  color: "green" | "red" | "blue" | "orange";
}

export default function MetricCard({ label, value, color }: MetricCardProps) {
  const colorMap = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
