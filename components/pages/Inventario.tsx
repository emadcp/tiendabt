"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Power, DollarSign } from "lucide-react";
import ProductoModal from "@/components/modals/ProductoModal";
import PrecioCanalModal from "@/components/modals/PrecioCanalModal";

export default function Inventario() {
  const [productos, setProductos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<any>(null);
  const [preciosProducto, setPreciosProducto] = useState<any>(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading productos:", error);
      setProductos([]);
    }
    setLoading(false);
  };

  const handleAddProducto = () => {
    setEditingProducto(null);
    setShowModal(true);
  };

  const handleEditProducto = (producto: any) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleToggleActivo = async (producto: any) => {
    const accion = producto.activo ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que querés ${accion} "${producto.nombre}"?`)) return;

    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...producto, activo: !producto.activo }),
      });
      if (res.ok) {
        loadProductos();
      } else {
        alert("Error al actualizar el producto");
      }
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el producto");
    }
  };

  const productosVisibles = productos.filter((p: any) =>
    mostrarInactivos ? true : p.activo
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
        <p className="text-slate-600 text-sm mt-1">
          Gestión de stock y productos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleAddProducto}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarInactivos}
              onChange={(e) => setMostrarInactivos(e.target.checked)}
              className="w-4 h-4"
            />
            Mostrar inactivos
          </label>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Productos en Stock
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Enlaces
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productosVisibles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        Sin productos para mostrar
                      </td>
                    </tr>
                  ) : (
                    productosVisibles.map((p: any) => (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${
                          !p.activo ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          {p.imagen_url ? (
                            <img
                              src={p.imagen_url}
                              alt={p.nombre}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                              📦
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {p.nombre}
                          {!p.activo && (
                            <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-semibold">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.sku}</td>
                        <td className="px-6 py-4">
                          <strong>
                            {p.stock_actual} / {p.stock_minimo}
                          </strong>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              p.stock_actual <= p.stock_minimo
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {p.stock_actual <= p.stock_minimo ? "🔴 BAJO" : "🟢 OK"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          ${parseFloat(p.costo_unitario_actual).toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          {p.url_mercado_libre && (
                            <a
                              href={p.url_mercado_libre}
                              target="_blank"
                              rel="noopener"
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              🔗 ML
                            </a>
                          )}
                          {p.url_tienda_propia && (
                            <a
                              href={p.url_tienda_propia}
                              target="_blank"
                              rel="noopener"
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              🔗 Web
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditProducto(p)}
                              title="Editar"
                              className="text-slate-500 hover:text-blue-600 transition"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => setPreciosProducto(p)}
                              title="Precios por canal"
                              className="text-slate-500 hover:text-emerald-600 transition"
                            >
                              <DollarSign size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleActivo(p)}
                              title={p.activo ? "Desactivar" : "Activar"}
                              className={`transition ${
                                p.activo
                                  ? "text-slate-500 hover:text-red-600"
                                  : "text-slate-500 hover:text-green-600"
                              }`}
                            >
                              <Power size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductoModal
          producto={editingProducto}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadProductos();
          }}
        />
      )}

      {preciosProducto && (
        <PrecioCanalModal
          producto={preciosProducto}
          onClose={() => setPreciosProducto(null)}
          onSave={() => {
            loadProductos();
          }}
        />
      )}
    </div>
  );
}
