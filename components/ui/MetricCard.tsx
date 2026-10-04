import { TrendingUp, Wallet, ShoppingCart, Zap } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  color: "green" | "red" | "blue" | "orange";
}

export default function MetricCard({ label, value, color }: MetricCardProps) {
  const colorConfig = {
    green: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "text-emerald-600",
      accent: "bg-emerald-100",
      icon: TrendingUp,
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      iconColor: "text-red-600",
      accent: "bg-red-100",
      icon: Wallet,
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      iconColor: "text-blue-600",
      accent: "bg-blue-100",
      icon: Zap,
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      iconColor: "text-orange-600",
      accent: "bg-orange-100",
      icon: ShoppingCart,
    },
  };

  const config = colorConfig[color];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} rounded-xl border ${config.border} p-6 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-xs font-bold ${config.text} uppercase tracking-wider`}>
          {label}
        </p>
        <div className={`${config.accent} p-2 rounded-lg`}>
          <Icon size={20} className={config.iconColor} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${config.text}`}>{value}</p>
    </div>
  );
}
