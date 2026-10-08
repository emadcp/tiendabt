"use client";

import { useEffect, useState } from "react";

export default function Reportes() {
  const [datos, setDatos] = useState({
    ingresos: 0,
    gastos: 0,
    costo_mercat: 0,
    ganancia: 0,
    rentabilidad: 0,
  });

  useEffect(() => {
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

        const ingresos = ventasActivas.reduce(
          (sum: number, v: any) => sum + (parseFloat(v?.subtotal) || 0),
          0
        );
        const gastos_total = gastos.reduce(
          (sum: number, g: any) => sum + (parseFloat(g?.monto) || 0),
          0
        );
        const costo_mercat = ventasActivas.reduce((sum: number, v: any) => {
          const prod = productos.find((p: any) => p?.id === v?.producto_id);
          return sum + ((parseFloat(prod?.costo_unitario_actual) || 0) * (v?.cantidad || 0));
        }, 0);

      const ganancia = ingresos - gastos_total - costo_mercat;
      const rentabilidad = ingresos > 0 ? (ganancia / ingresos) * 100 : 0;

        setDatos({
          ingresos,
          gastos: gastos_total,
          costo_mercat,
          ganancia,
          rentabilidad,
        });
      } catch (error) {
        console.error("Error loading reportes data:", error);
        setDatos({
          ingresos: 0,
          gastos: 0,
          costo_mercat: 0,
          ganancia: 0,
          rentabilidad: 0,
        });
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-600 text-sm mt-1">
          Análisis de rentabilidad
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 uppercase mb-2">
              Ingresos
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ${datos.ingresos.toLocaleString("es-AR")}
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 uppercase mb-2">
              Costo Mercadería
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ${datos.costo_mercat.toLocaleString("es-AR")}
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 uppercase mb-2">
              Gastos Operativos
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ${datos.gastos.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-slate-900 text-white border border-slate-800 p-8 rounded-lg mb-8">
          <p className="text-xs font-semibold text-slate-300 uppercase mb-2">
            Ganancia Neta Final
          </p>
          <p className="text-4xl font-bold">
            ${datos.ganancia.toLocaleString("es-AR")}
          </p>
          <p className="text-lg font-semibold mt-3 text-slate-200">
            Rentabilidad: {datos.rentabilidad.toFixed(2)}%
          </p>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">
            Resumen Financiero
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Ingresos Totales</span>
              <span className="font-semibold text-green-600">
                +${datos.ingresos.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Costo de Mercadería</span>
              <span className="font-semibold text-red-600">
                -${datos.costo_mercat.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Gastos Operativos</span>
              <span className="font-semibold text-red-600">
                -${datos.gastos.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-lg">
              <span className="font-bold text-slate-900">Ganancia Neta</span>
              <span className="font-bold text-blue-600 text-lg">
                ${datos.ganancia.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
