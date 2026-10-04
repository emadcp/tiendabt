"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/pages/Dashboard";
import Inventario from "@/components/pages/Inventario";
import Ventas from "@/components/pages/Ventas";
import Gastos from "@/components/pages/Gastos";
import Reportes from "@/components/pages/Reportes";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventario":
        return <Inventario />;
      case "ventas":
        return <Ventas />;
      case "gastos":
        return <Gastos />;
      case "reportes":
        return <Reportes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
}
