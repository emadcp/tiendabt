"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Ban, RotateCcw, Trash2 } from "lucide-react";
import CompraModal from "@/components/modals/CompraModal";

export default function Compras() {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompra, setEditingCompra] = useState<any>(null);

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

  const handleAddCompra = () => {
    setEditingCompra(null);
    setShowModal(true);
  };

  const handleEditCompra = (compra: any) => {
    setEditingCompra(compra);
    setShowModal(true);
  };

  const handleToggleCancelada = async (compra: any) => {
    const cancelando = compra.estado !== "cancelada";
    const mensaje = cancelando
      ? `¿Cancelar esta compra de "${compra.producto?.nombre}"? El stock y el costo promedio se recalcularán sin ella.`
      : `¿Reactivar esta compra de "${compra.producto?.nombre}"? Volverá a sumarse al stock y al costo promedio.`;
    if (!confirm(mensaje)) return;

    try {
      const res = await fetch(`/api/compras/${compra.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: cancelando ? "cancelada" : "completada" }),
      });
      if (res.ok) {
        loadCompras();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error al actualizar la compra");
      }
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la compra");
    }
  };

  const handleBorrarCompra = async (compra: any) => {
    if (
      !confirm(
        `¿Borrar definitivamente esta compra de "${compra.producto?.nombre}"? El stock y el costo promedio se recalcularán sin ella. Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/compras/${compra.id}`, { method: "DELETE" });
      if (res.ok) {
        loadCompras();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error al borrar la compra");
      }
    } catch (error) {
      console.error(error);
      alert("Error al borrar la compra");
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
            onClick={handleAddCompra}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((c: any) => {
                    const cancelada = c.estado === "cancelada";
                    return (
                      <tr
                        key={c.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${
                          cancelada ? "opacity-50" : ""
                        }`}
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
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              cancelada
                                ? "bg-slate-200 text-slate-600"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {cancelada ? "Cancelada" : "Completada"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditCompra(c)}
                              title="Editar"
                              className="text-slate-500 hover:text-blue-600 transition"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleCancelada(c)}
                              title={cancelada ? "Reactivar" : "Cancelar"}
                              className={`transition ${
                                cancelada
                                  ? "text-slate-500 hover:text-green-600"
                                  : "text-slate-500 hover:text-orange-600"
                              }`}
                            >
                              {cancelada ? <RotateCcw size={18} /> : <Ban size={18} />}
                            </button>
                            <button
                              onClick={() => handleBorrarCompra(c)}
                              title="Borrar"
                              className="text-slate-500 hover:text-red-600 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CompraModal
          compra={editingCompra}
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
