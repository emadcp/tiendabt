import { TrendingUp, Wallet, ShoppingCart, Zap, Package } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  color: "green" | "red" | "blue" | "orange" | "purple";
}

export default function MetricCard({ label, value, color }: MetricCardProps) {
  const colorConfig = {
    green: {
      bg: "bg-white",
      border: "border-slate-200",
      accentColor: "from-emerald-500/10 to-emerald-500/5",
      text: "text-slate-900",
      label: "text-slate-600",
      iconColor: "text-emerald-600",
      accent: "bg-emerald-50",
      icon: TrendingUp,
    },
    red: {
      bg: "bg-white",
      border: "border-slate-200",
      accentColor: "from-red-500/10 to-red-500/5",
      text: "text-slate-900",
      label: "text-slate-600",
      iconColor: "text-red-600",
      accent: "bg-red-50",
      icon: Wallet,
    },
    blue: {
      bg: "bg-white",
      border: "border-slate-200",
      accentColor: "from-blue-500/10 to-blue-500/5",
      text: "text-slate-900",
      label: "text-slate-600",
      iconColor: "text-blue-600",
      accent: "bg-blue-50",
      icon: Zap,
    },
    orange: {
      bg: "bg-white",
      border: "border-slate-200",
      accentColor: "from-orange-500/10 to-orange-500/5",
      text: "text-slate-900",
      label: "text-slate-600",
      iconColor: "text-orange-600",
      accent: "bg-orange-50",
      icon: ShoppingCart,
    },
    purple: {
      bg: "bg-white",
      border: "border-slate-200",
      accentColor: "from-purple-500/10 to-purple-500/5",
      text: "text-slate-900",
      label: "text-slate-600",
      iconColor: "text-purple-600",
      accent: "bg-purple-50",
      icon: Package,
    },
  };

  const config = colorConfig[color];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} rounded-lg border ${config.border} p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br ${config.accentColor}`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold ${config.label} uppercase tracking-wider`}>
          {label}
        </p>
        <div className={`${config.accent} p-2 rounded-md`}>
          <Icon size={18} className={config.iconColor} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${config.text}`}>{value}</p>
    </div>
  );
}
