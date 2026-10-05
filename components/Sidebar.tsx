import { BarChart3, Package, ShoppingCart, TrendingUp, Truck, Wallet } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      category: "Principal",
    },
    {
      id: "inventario",
      label: "Inventario",
      icon: Package,
      category: "Principal",
    },
    {
      id: "ventas",
      label: "Ventas",
      icon: ShoppingCart,
      category: "Operaciones",
    },
    { id: "gastos", label: "Gastos", icon: Wallet, category: "Operaciones" },
    {
      id: "compras",
      label: "Compras",
      icon: Truck,
      category: "Operaciones",
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: TrendingUp,
      category: "Análisis",
    },
  ];

  const categories = ["Principal", "Operaciones", "Análisis"];

  return (
    <div className="w-64 bg-slate-900 text-white p-6 overflow-y-auto border-r border-slate-800">
      <div className="mb-10">
        {/* Logo */}
        <div className="mb-4 bg-slate-800 rounded-lg p-3 flex items-center justify-center">
          <img
            src="/images/logo.svg"
            alt="TiendaBT Logo"
            className="w-full max-h-16 object-contain"
          />
        </div>
        <h1 className="text-lg font-semibold text-center text-white">TiendaBT</h1>
        <p className="text-xs text-slate-400 mt-1 text-center">Gestión Comercial</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pl-1">
            {category}
          </p>
          <nav className="space-y-1">
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                      activeTab === item.id
                        ? "bg-slate-700 text-white font-medium"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>
      ))}
    </div>
  );
}
