import { BarChart3, Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";

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
      id: "reportes",
      label: "Reportes",
      icon: TrendingUp,
      category: "Análisis",
    },
  ];

  const categories = ["Principal", "Operaciones", "Análisis"];

  return (
    <div className="w-80 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-8 overflow-y-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold">TiendaBT</h1>
        <p className="text-sm text-blue-200 mt-1">Sistema de Gestión</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
            {category}
          </p>
          <nav className="space-y-2">
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? "bg-white text-blue-900 font-semibold shadow-lg"
                        : "text-blue-100 hover:bg-blue-700"
                    }`}
                  >
                    <Icon size={20} />
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
