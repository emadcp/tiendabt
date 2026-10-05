"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface VentaModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CANALES_SUGERIDOS = ["Mercado Libre", "Tienda Propia"];

const hoyISO = () => new Date().toISOString().slice(0, 10);

export default function VentaModal({ onClose, onSave }: VentaModalProps) {
  const [productos, setProductos] = useState<any[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    producto_id: "",
    canal: "",
    cantidad: "1",
    precio_unitario: "",
    comision_canal: "0",
    costo_envio: "0",
    costo_empaque: "0",
    otros_gastos: "0",
    fecha_venta: hoyISO(),
    referencia_ext: "",
  });

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data.filter((p: any) => p.activo) : []))
      .catch(() => setProductos([]))
      .finally(() => setLoadingProductos(false));
  }, []);

  const productoSeleccionado = productos.find(
    (p: any) => p.id === parseInt(formData.producto_id, 10)
  );

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Si el producto o el canal cambian y hay un precio cargado para ese canal, lo autocompleta
  const handleProductoChange = (e: any) => {
    const producto_id = e.target.value;
    const prod = productos.find((p: any) => p.id === parseInt(producto_id, 10));
    const precioCanal = prod?.precios_canal?.find((pc: any) => pc.canal === formData.canal);
    setFormData((prev) => ({
      ...prev,
      producto_id,
      precio_unitario: precioCanal ? precioCanal.precio_venta.toString() : prev.precio_unitario,
    }));
  };

  const handleCanalChange = (e: any) => {
    const canal = e.target.value;
    const precioCanal = productoSeleccionado?.precios_canal?.find(
      (pc: any) => pc.canal === canal
    );
    setFormData((prev) => ({
      ...prev,
      canal,
      precio_unitario: precioCanal ? precioCanal.precio_venta.toString() : prev.precio_unitario,
    }));
  };

  const cantidad = parseInt(formData.cantidad, 10) || 0;
  const precio = parseFloat(formData.precio_unitario) || 0;
  const subtotal = cantidad * precio;
  const costoUnitario = productoSeleccionado
    ? parseFloat(productoSeleccionado.costo_unitario_actual)
    : 0;
  const gananciaBruta = subtotal - costoUnitario * cantidad;
  const gananciaNeta =
    gananciaBruta -
    (parseFloat(formData.comision_canal) || 0) -
    (parseFloat(formData.costo_envio) || 0) -
    (parseFloat(formData.costo_empaque) || 0) -
    (parseFloat(formData.otros_gastos) || 0);

  const stockDisponible = productoSeleccionado?.stock_actual ?? null;
  const stockInsuficiente = stockDisponible !== null && cantidad > stockDisponible;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error al registrar la venta");
      }
    } catch (err) {
      console.error(err);
      setError("Error al registrar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[28rem] max-h-[36rem] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Nueva Venta</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Producto
            </label>
            <select
              name="producto_id"
              value={formData.producto_id}
              onChange={handleProductoChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingProductos}
            >
              <option value="">Seleccionar producto...</option>
              {productos.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.sku}) — Stock: {p.stock_actual}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Canal
            </label>
            <input
              type="text"
              list="canales-sugeridos-venta"
              name="canal"
              value={formData.canal}
              onChange={handleCanalChange}
              placeholder="Mercado Libre"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="canales-sugeridos-venta">
              {CANALES_SUGERIDOS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formData.cantidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {stockDisponible !== null && (
                <p className={`text-xs mt-1 ${stockInsuficiente ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                  Stock disponible: {stockDisponible}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Precio Unit.
              </label>
              <input
                type="number"
                step="0.01"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Comisión Canal
              </label>
              <input
                type="number"
                step="0.01"
                name="comision_canal"
                value={formData.comision_canal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Costo Envío
              </label>
              <input
                type="number"
                step="0.01"
                name="costo_envio"
                value={formData.costo_envio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Costo Empaque
              </label>
              <input
                type="number"
                step="0.01"
                name="costo_empaque"
                value={formData.costo_empaque}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Otros Gastos
              </label>
              <input
                type="number"
                step="0.01"
                name="otros_gastos"
                value={formData.otros_gastos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Fecha de Venta
              </label>
              <input
                type="date"
                name="fecha_venta"
                value={formData.fecha_venta}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Referencia (opcional)
              </label>
              <input
                type="text"
                name="referencia_ext"
                value={formData.referencia_ext}
                onChange={handleChange}
                placeholder="N° de orden"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {subtotal > 0 && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${subtotal.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ganancia Bruta</span>
                <span className="font-semibold text-slate-900">
                  ${gananciaBruta.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-700 font-semibold">Ganancia Neta</span>
                <span className={`font-bold ${gananciaNeta >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${gananciaNeta.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}

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
              disabled={loading || stockInsuficiente}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Registrar Venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
