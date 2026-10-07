"use client";

import { useEffect, useState } from "react";
import { Plus, Upload } from "lucide-react";
import VentaModal from "@/components/modals/VentaModal";

// Diferencia en días (UTC, solo fecha) entre hoy y una fecha dada.
function diasHasta(fechaIso: string) {
  const hoy = new Date();
  const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  const fecha = new Date(fechaIso);
  const fechaUTC = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  return Math.round((fechaUTC - hoyUTC) / 86400000);
}

export default function Ventas() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      const res = await fetch("/api/ventas");
      const data = await res.json();
      setVentas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
        <p className="text-slate-600 text-sm mt-1">
          Registro de operaciones de venta
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={18} />
            Agregar Venta Manual
          </button>
          <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm font-medium transition">
            <Upload size={18} />
            Importar CSV Mercado Libre
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Historial de Ventas
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : ventas.length === 0 ? (
            <p className="p-6 text-slate-500">No hay ventas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Canal
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Envío
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Fecha Venta
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Acreditación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v: any) => {
                    const diasAcreditacion = v.fecha_acreditacion
                      ? diasHasta(v.fecha_acreditacion)
                      : null;
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {v.producto?.nombre}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{v.canal}</td>
                        <td className="px-6 py-4">{v.cantidad}</td>
                        <td className="px-6 py-4">
                          ${parseFloat(v.precio_unitario).toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          ${parseFloat(v.subtotal).toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4 text-red-600">
                          ${parseFloat(v.comision_canal).toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4 text-red-600">
                          ${parseFloat(v.costo_envio).toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(v.fecha_venta).toLocaleDateString("es-AR", {
                            timeZone: "UTC",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {v.fecha_acreditacion ? (
                            <>
                              <p className="text-slate-500">
                                {new Date(v.fecha_acreditacion).toLocaleDateString(
                                  "es-AR",
                                  { timeZone: "UTC" }
                                )}
                              </p>
                              <p
                                className={`text-xs font-semibold ${
                                  diasAcreditacion !== null && diasAcreditacion <= 0
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                              >
                                {diasAcreditacion !== null && diasAcreditacion <= 0
                                  ? "Liquidado"
                                  : `Faltan ${diasAcreditacion} días`}
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
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
        <VentaModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadVentas();
          }}
        />
      )}
    </div>
  );
}
