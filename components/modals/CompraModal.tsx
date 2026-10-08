"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface CompraModalProps {
  compra?: any;
  onClose: () => void;
  onSave: () => void;
}

const hoyISO = () => new Date().toISOString().slice(0, 10);

export default function CompraModal({ compra, onClose, onSave }: CompraModalProps) {
  const isEdit = !!compra;

  const [productos, setProductos] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    producto_id: compra?.producto_id?.toString() || "",
    proveedor_id: compra?.proveedor_id?.toString() || "",
    cantidad: compra?.cantidad?.toString() || "1",
    precio_unitario: compra ? parseFloat(compra.precio_unitario).toString() : "",
    fecha_compra: compra?.fecha_compra ? compra.fecha_compra.slice(0, 10) : hoyISO(),
    referencia_proveedor: compra?.referencia_proveedor || "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/productos").then((res) => res.json()),
      fetch("/api/proveedores").then((res) => res.json()),
    ])
      .then(([productosData, proveedoresData]) => {
        const listaProductos = Array.isArray(productosData) ? productosData : [];
        const activos = listaProductos.filter((p: any) => p.activo);
        if (
          isEdit &&
          compra?.producto_id &&
          !activos.some((p: any) => p.id === compra.producto_id)
        ) {
          const actual = listaProductos.find((p: any) => p.id === compra.producto_id);
          if (actual) activos.unshift(actual);
        }
        setProductos(activos);

        const listaProveedores = Array.isArray(proveedoresData) ? proveedoresData : [];
        const proveedoresActivos = listaProveedores.filter((p: any) => p.activo);
        if (
          isEdit &&
          compra?.proveedor_id &&
          !proveedoresActivos.some((p: any) => p.id === compra.proveedor_id)
        ) {
          const actual = listaProveedores.find((p: any) => p.id === compra.proveedor_id);
          if (actual) proveedoresActivos.unshift(actual);
        }
        setProveedores(proveedoresActivos);
      })
      .catch(() => {
        setProductos([]);
        setProveedores([]);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const productoSeleccionado = productos.find(
    (p: any) => p.id === parseInt(formData.producto_id, 10)
  );
  const proveedorSeleccionado = proveedores.find(
    (p: any) => p.id === parseInt(formData.proveedor_id, 10)
  );

  const cantidad = parseInt(formData.cantidad, 10) || 0;
  const precio = parseFloat(formData.precio_unitario) || 0;
  const costoTotal = cantidad * precio;

  const stockAntes = productoSeleccionado?.stock_actual ?? 0;
  const costoPromAntes = productoSeleccionado
    ? parseFloat(productoSeleccionado.costo_unitario_prom)
    : 0;
  const stockDespues = stockAntes + cantidad;
  const costoPromDespues =
    stockDespues > 0
      ? (stockAntes * costoPromAntes + cantidad * precio) / stockDespues
      : precio;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!proveedorSeleccionado) {
      setError("Seleccioná un proveedor");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        isEdit ? `/api/compras/${compra.id}` : "/api/compras",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            proveedor_nombre: proveedorSeleccionado.nombre,
          }),
        }
      );

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error al registrar la compra");
      }
    } catch (err) {
      console.error(err);
      setError("Error al registrar la compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[28rem] max-h-[36rem] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Editar Compra" : "Nueva Compra"}
          </h2>
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingData}
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
              Proveedor
            </label>
            <select
              name="proveedor_id"
              value={formData.proveedor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingData}
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {!loadingData && proveedores.length === 0 && (
              <p className="text-xs mt-1 text-red-600 font-semibold">
                No hay proveedores creados. Agregá uno en la sección Proveedores antes de registrar una compra.
              </p>
            )}
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
                Fecha de Compra
              </label>
              <input
                type="date"
                name="fecha_compra"
                value={formData.fecha_compra}
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
                name="referencia_proveedor"
                value={formData.referencia_proveedor}
                onChange={handleChange}
                placeholder="N° de factura"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!isEdit && productoSeleccionado && cantidad > 0 && precio > 0 && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Costo Total</span>
                <span className="font-semibold text-slate-900">
                  ${costoTotal.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Stock resultante</span>
                <span className="font-semibold text-slate-900">
                  {stockAntes} → {stockDespues}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-700 font-semibold">Costo Prom. Ponderado</span>
                <span className="font-bold text-slate-900">
                  ${costoPromAntes.toLocaleString("es-AR")} → ${costoPromDespues.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}
          {isEdit && (
            <p className="text-xs text-slate-500">
              Al guardar, el stock y el costo promedio ponderado del producto
              se recalculan automáticamente a partir de todas las compras y
              ventas no canceladas.
            </p>
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
              disabled={loading || proveedores.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Registrar Compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
