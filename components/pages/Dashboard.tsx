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
    const loadData = async () => {
      // Cargar ventas
      const ventasRes = await fetch("/api/ventas");
      const ventas = await ventasRes.json();

      // Cargar gastos
      const gastosRes = await fetch("/api/gastos");
      const gastos = await gastosRes.json();

      // Cargar productos
      const productosRes = await fetch("/api/productos");
      const productos = await productosRes.json();

      // Calcular métricas
      const ingresos = ventas.reduce(
        (sum: number, v: any) => sum + parseFloat(v.subtotal),
        0
      );
      const gastos_total = gastos.reduce(
        (sum: number, g: any) => sum + parseFloat(g.monto),
        0
      );
      const costo_mercat = ventas.reduce((sum: number, v: any) => {
        const prod = productos.find((p: any) => p.id === v.producto_id);
        return sum + parseFloat(prod?.costo_unitario_actual || 0) * v.cantidad;
      }, 0);

      setMetricas({
        ingresos,
        gastos: gastos_total,
        costo_mercaderia: costo_mercat,
        ganancia_neta: ingresos - gastos_total - costo_mercat,
      });

      setUltimasVentas(ventas.slice(0, 5));

      // Alertas de stock bajo
      const alertas = productos.filter(
        (p: any) => p.stock_actual <= p.stock_minimo
      );
      setAlertasStock(alertas);
    };

    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-8 shadow-lg">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-blue-100 text-base mt-2">
          Resumen general del negocio
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {/* Métricas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="text-xl font-bold text-slate-900">
              Últimas Ventas
            </h3>
            <p className="text-slate-600 text-sm mt-1">Transacciones recientes</p>
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
