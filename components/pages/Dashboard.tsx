"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import AlertBox from "@/components/ui/AlertBox";
import Table from "@/components/ui/Table";

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    ingresos: 0,
    gastos: 0,
    costo_mercaderia: 0,
    ganancia_neta: 0,
  });
  const [ultimas_ventas, setUltimasVentas] = useState([]);
  const [alertas_stock, setAlertasStock] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ventasRes = await fetch("/api/ventas");
      const ventasData = await ventasRes.json();
      const ventas = Array.isArray(ventasData) ? ventasData : [];

      const gastosRes = await fetch("/api/gastos");
      const gastosData = await gastosRes.json();
      const gastos = Array.isArray(gastosData) ? gastosData : [];

      const productosRes = await fetch("/api/productos");
      const productosData = await productosRes.json();
      const productos = Array.isArray(productosData) ? productosData : [];

      const ingresos = ventas.reduce((sum: number, v: any) => sum + (parseFloat(v?.subtotal) || 0), 0);
      const gastos_total = gastos.reduce((sum: number, g: any) => sum + (parseFloat(g?.monto) || 0), 0);
      const costo_mercat = ventas.reduce((sum: number, v: any) => {
        const prod = productos.find((p: any) => p?.id === v?.producto_id);
        return sum + ((parseFloat(prod?.costo_unitario_actual) || 0) * (v?.cantidad || 0));
      }, 0);

      setMetricas({
        ingresos,
        gastos: gastos_total,
        costo_mercaderia: costo_mercat,
        ganancia_neta: ingresos - gastos_total - costo_mercat,
      });
      setUltimasVentas(ventas.slice(0, 5));
      setAlertasStock(productos.filter((p: any) => (p?.stock_actual || 0) <= (p?.stock_minimo || 0)));
    } catch (error) {
      console.error("Error:", error);
      setMetricas({ ingresos: 0, gastos: 0, costo_mercaderia: 0, ganancia_neta: 0 });
      setUltimasVentas([]);
      setAlertasStock([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 text-sm mt-1">
          Resumen general del negocio
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {/* Métricas */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Ingresos Totales"
            value={`$${metricas.ingresos.toLocaleString("es-AR")}`}
            color="green"
          />
          <MetricCard
            label="Gastos Totales"
            value={`$${metricas.gastos.toLocaleString("es-AR")}`}
            color="red"
          />
          <MetricCard
            label="Costo Mercadería"
            value={`$${metricas.costo_mercaderia.toLocaleString("es-AR")}`}
            color="orange"
          />
          <MetricCard
            label="Ganancia Neta"
            value={`$${metricas.ganancia_neta.toLocaleString("es-AR")}`}
            color="blue"
          />
        </div>

        {/* Alertas */}
        {alertas_stock.length > 0 && (
          <AlertBox
            title="⚠️ Alertas de Stock Bajo"
            items={alertas_stock.map(
              (p: any) =>
                `${p.nombre} - Stock: ${p.stock_actual} (Mínimo: ${p.stock_minimo})`
            )}
          />
        )}

        {/* Últimas Ventas */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Últimas Ventas
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">Transacciones recientes</p>
          </div>
          <Table
            columns={[
              { key: "producto", label: "Producto" },
              { key: "canal", label: "Canal" },
              { key: "cantidad", label: "Cantidad" },
              { key: "subtotal", label: "Ingreso" },
              { key: "fecha_venta", label: "Fecha" },
            ]}
            data={ultimas_ventas}
          />
        </div>
      </div>
    </div>
  );
}
