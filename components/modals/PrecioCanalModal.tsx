"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";

interface PrecioCanalModalProps {
  producto: any;
  onClose: () => void;
  onSave: () => void;
}

const CANALES_SUGERIDOS = ["Mercado Libre", "Tienda Propia"];

export default function PrecioCanalModal({
  producto,
  onClose,
  onSave,
}: PrecioCanalModalProps) {
  const [precios, setPrecios] = useState<any[]>(producto.precios_canal || []);
  const [canal, setCanal] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [loading, setLoading] = useState(false);

  const costo = parseFloat(producto.costo_unitario_actual) || 0;
  const precioNum = parseFloat(precioVenta) || 0;
  const margenPreview =
    precioNum > 0 ? ((precioNum - costo) / precioNum) * 100 : null;

  const handleGuardar = async (e: any) => {
    e.preventDefault();
    if (!canal || !precioVenta) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/productos/${producto.id}/precios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal, precio_venta: precioVenta }),
      });

      if (res.ok) {
        const nuevo = await res.json();
        setPrecios((prev) => [
          ...prev.filter((p: any) => p.canal !== nuevo.canal),
          nuevo,
        ]);
        setCanal("");
        setPrecioVenta("");
        onSave();
      } else {
        alert("Error al guardar el precio");
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar el precio");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (precioCanal: any) => {
    if (!confirm(`¿Eliminar el precio de "${precioCanal.canal}"?`)) return;

    try {
      const res = await fetch(
        `/api/productos/${producto.id}/precios?canal=${encodeURIComponent(
          precioCanal.canal
        )}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setPrecios((prev) => prev.filter((p: any) => p.canal !== precioCanal.canal));
        onSave();
      } else {
        alert("Error al eliminar el precio");
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el precio");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[28rem] max-h-[34rem] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Precios por Canal</h2>
            <p className="text-sm text-slate-500 mt-0.5">{producto.nombre}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Costo unitario actual:{" "}
            <strong className="text-slate-900">
              ${costo.toLocaleString("es-AR")}
            </strong>
          </p>

          {precios.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                      Canal
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                      Margen
                    </th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {precios.map((p: any) => (
                    <tr key={p.canal} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2 text-slate-900">{p.canal}</td>
                      <td className="px-4 py-2 text-slate-900">
                        ${parseFloat(p.precio_venta).toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`font-semibold ${
                            parseFloat(p.margen_pct) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {parseFloat(p.margen_pct).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleEliminar(p)}
                          className="text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Canal
              </label>
              <input
                type="text"
                list="canales-sugeridos"
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                placeholder="Mercado Libre"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <datalist id="canales-sugeridos">
                {CANALES_SUGERIDOS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Precio de Venta
              </label>
              <input
                type="number"
                step="0.01"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {margenPreview !== null && (
                <p
                  className={`text-xs mt-1 font-semibold ${
                    margenPreview >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Margen: {margenPreview.toFixed(1)}%
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Precio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
