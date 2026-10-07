"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import GastoModal from "@/components/modals/GastoModal";

export default function Gastos() {
  const [gastos, setGastos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    try {
      const res = await fetch("/api/gastos");
      const data = await res.json();
      setGastos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  const gastosPorTipo = gastos.reduce((acc: any, g: any) => {
    const tipo = g?.tipo_gasto || "Otro";
    acc[tipo] = (acc[tipo] || 0) + (parseFloat(g?.monto) || 0);
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Control de Gastos</h1>
        <p className="text-slate-600 text-sm mt-1">
          Discriminación de gastos por tipo
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={18} />
            Agregar Gasto
          </button>
        </div>

        {/* Resumen por tipo */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {Object.entries(gastosPorTipo).map(([tipo, monto]) => (
            <div
              key={tipo}
              className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-center"
            >
              <p className="text-sm font-semibold text-slate-700 mb-2">
                {tipo}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                ${(monto as number).toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </div>

        {/* Tabla de gastos */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Detalle de Gastos
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : gastos.length === 0 ? (
            <p className="p-6 text-slate-500">No hay gastos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Canal
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((g: any) => (
                    <tr
                      key={g.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                          {g.tipo_gasto}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900">
                        {g.descripcion}
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-600">
                        ${parseFloat(g.monto).toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {g.canal || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(g.fecha_gasto).toLocaleDateString("es-AR", {
                          timeZone: "UTC",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <GastoModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadGastos();
          }}
        />
      )}
    </div>
  );
}
