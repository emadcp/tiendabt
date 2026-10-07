"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CompraModal from "@/components/modals/CompraModal";

export default function Compras() {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async () => {
    try {
      const res = await fetch("/api/compras");
      const data = await res.json();
      setCompras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Compras</h1>
        <p className="text-slate-600 text-sm mt-1">
          Historial de reposición de stock
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={18} />
            Nueva Compra
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Historial de Compras
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : compras.length === 0 ? (
            <p className="p-6 text-slate-500">No hay compras registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Costo Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((c: any) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {c.producto?.nombre}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {c.proveedor_nombre}
                      </td>
                      <td className="px-6 py-4">{c.cantidad}</td>
                      <td className="px-6 py-4">
                        ${parseFloat(c.precio_unitario).toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ${parseFloat(c.costo_total).toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(c.fecha_compra).toLocaleDateString("es-AR", {
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
        <CompraModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadCompras();
          }}
        />
      )}
    </div>
  );
}
