"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import AlertBox from "@/components/ui/AlertBox";
import Table from "@/components/ui/Table";

// Diferencia en días (UTC, solo fecha) entre hoy y una fecha dada.
function diasHasta(fechaIso: string) {
  const hoy = new Date();
  const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  const fecha = new Date(fechaIso);
  const fechaUTC = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  return Math.round((fechaUTC - hoyUTC) / 86400000);
}

// Suma el subtotal de las ventas cuya acreditación cae entre hoy y "max" días.
function sumarProximoALiquidar(ventas: any[], max: number) {
  return ventas.reduce((sum: number, v: any) => {
    if (!v?.fecha_acreditacion) return sum;
    const dias = diasHasta(v.fecha_acreditacion);
    if (dias >= 0 && dias <= max) {
      return sum + (parseFloat(v?.subtotal) || 0);
    }
    return sum;
  }, 0);
}

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    ingresos: 0,
    gastos: 0,
    costo_mercaderia: 0,
    capital_invertido: 0,
    ganancia_neta: 0,
  });
  const [proximoLiquidar, setProximoLiquidar] = useState({
    d7: 0,
    d15: 0,
    d21: 0,
    d30: 0,
  });
  const [ultimas_ventas, setUltimasVentas] = useState<any[]>([]);
  const [alertas_stock, setAlertasStock] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ventasRes = await fetch("/api/ventas");
      const ventasData = await ventasRes.json();
      const ventas = Array.isArray(ventasData) ? ventasData : [];
      // Las ventas canceladas no deben impactar en las métricas financieras.
      const ventasActivas = ventas.filter((v: any) => v?.estado !== "cancelada");

      const gastosRes = await fetch("/api/gastos");
      const gastosData = await gastosRes.json();
      const gastos = Array.isArray(gastosData) ? gastosData : [];

      const productosRes = await fetch("/api/productos");
      const productosData = await productosRes.json();
      const productos = Array.isArray(productosData) ? productosData : [];

      const ingresos = ventasActivas.reduce((sum: number, v: any) => sum + (parseFloat(v?.subtotal) || 0), 0);
      const gastos_total = gastos.reduce((sum: number, g: any) => sum + (parseFloat(g?.monto) || 0), 0);
      const costo_mercat = ventasActivas.reduce((sum: number, v: any) => {
        const prod = productos.find((p: any) => p?.id === v?.producto_id);
        return sum + ((parseFloat(prod?.costo_unitario_actual) || 0) * (v?.cantidad || 0));
      }, 0);
      // Capital inmovilizado en el stock actual: lo que costó (a costo
      // promedio ponderado histórico) todo lo que HOY sigue sin vender. Es
      // distinto de "Costo Merc. Vendida" arriba, que mide lo YA vendido.
      // Se incluyen todos los productos, activos o no: el capital sigue
      // inmovilizado en el stock aunque el producto se haya desactivado.
      const capital_invertido = productos.reduce((sum: number, p: any) => {
        return sum + (parseFloat(p?.costo_unitario_prom) || 0) * (p?.stock_actual || 0);
      }, 0);

      setMetricas({
        ingresos,
        gastos: gastos_total,
        costo_mercaderia: costo_mercat,
        capital_invertido,
        ganancia_neta: ingresos - gastos_total - costo_mercat,
      });
      setProximoLiquidar({
        d7: sumarProximoALiquidar(ventasActivas, 7),
        d15: sumarProximoALiquidar(ventasActivas, 15),
        d21: sumarProximoALiquidar(ventasActivas, 21),
        d30: sumarProximoALiquidar(ventasActivas, 30),
      });
      setUltimasVentas(
        ventasActivas.slice(0, 5).map((v: any) => ({
          ...v,
          // La API incluye el objeto `producto` completo (relación anidada);
          // acá se aplana a un string antes de pasarlo a <Table>, que no
          // puede renderizar objetos. Ver también el guard agregado en Table.tsx.
          producto: v?.producto?.nombre ?? "-",
          subtotal: `$${(parseFloat(v?.subtotal) || 0).toLocaleString("es-AR")}`,
          fecha_venta: v?.fecha_venta
            ? new Date(v.fecha_venta).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })
            : "-",
        }))
      );
      setAlertasStock(productos.filter((p: any) => (p?.stock_actual || 0) <= (p?.stock_minimo || 0)));
    } catch (error) {
      console.error("Error:", error);
      setMetricas({ ingresos: 0, gastos: 0, costo_mercaderia: 0, capital_invertido: 0, ganancia_neta: 0 });
      setProximoLiquidar({ d7: 0, d15: 0, d21: 0, d30: 0 });
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
        <div className="grid grid-cols-5 gap-4 mb-8">
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
            label="Costo Merc. Vendida"
            value={`$${metricas.costo_mercaderia.toLocaleString("es-AR")}`}
            color="orange"
          />
          <MetricCard
            label="Capital Invertido en Stock"
            value={`$${metricas.capital_invertido.toLocaleString("es-AR")}`}
            color="purple"
          />
          <MetricCard
            label="Ganancia Neta"
            value={`$${metricas.ganancia_neta.toLocaleString("es-AR")}`}
            color="blue"
          />
        </div>

        {/* Próximo a Liquidar */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Próximo a Liquidar
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="En 7 días"
              value={`$${proximoLiquidar.d7.toLocaleString("es-AR")}`}
              color="green"
            />
            <MetricCard
              label="En 15 días"
              value={`$${proximoLiquidar.d15.toLocaleString("es-AR")}`}
              color="blue"
            />
            <MetricCard
              label="En 21 días"
              value={`$${proximoLiquidar.d21.toLocaleString("es-AR")}`}
              color="orange"
            />
            <MetricCard
              label="En 30 días"
              value={`$${proximoLiquidar.d30.toLocaleString("es-AR")}`}
              color="red"
            />
          </div>
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
