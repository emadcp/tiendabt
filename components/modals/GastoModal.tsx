"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface GastoModalProps {
  gasto?: any;
  onClose: () => void;
  onSave: () => void;
}

const TIPOS_SUGERIDOS = [
  "Publicidad",
  "Packaging",
  "Logística",
  "Impuestos",
  "Servicios",
  "Otro",
];

const CANALES_SUGERIDOS = ["Mercado Libre", "Tienda Propia"];

const hoyISO = () => new Date().toISOString().slice(0, 10);

export default function GastoModal({ gasto, onClose, onSave }: GastoModalProps) {
  const isEdit = !!gasto;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    tipo_gasto: gasto?.tipo_gasto || "",
    descripcion: gasto?.descripcion || "",
    monto: gasto ? parseFloat(gasto.monto).toString() : "",
    canal: gasto?.canal || "",
    fecha_gasto: gasto?.fecha_gasto ? gasto.fecha_gasto.slice(0, 10) : hoyISO(),
    observaciones: gasto?.observaciones || "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        isEdit ? `/api/gastos/${gasto.id}` : "/api/gastos",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error al registrar el gasto");
      }
    } catch (err) {
      console.error(err);
      setError("Error al registrar el gasto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[28rem] max-h-[34rem] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Editar Gasto" : "Nuevo Gasto"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tipo de Gasto
            </label>
            <input
              type="text"
              list="tipos-sugeridos-gasto"
              name="tipo_gasto"
              value={formData.tipo_gasto}
              onChange={handleChange}
              placeholder="Publicidad"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="tipos-sugeridos-gasto">
              {TIPOS_SUGERIDOS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                step="0.01"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Canal (opcional)
              </label>
              <input
                type="text"
                list="canales-sugeridos-gasto"
                name="canal"
                value={formData.canal}
                onChange={handleChange}
                placeholder="Mercado Libre"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="canales-sugeridos-gasto">
                {CANALES_SUGERIDOS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha_gasto"
              value={formData.fecha_gasto}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Registrar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
