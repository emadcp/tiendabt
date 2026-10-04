"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ProductoModal from "@/components/modals/ProductoModal";

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data);
    setLoading(false);
  };

  const handleAddProducto = () => {
    setShowModal(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Inventario</h1>
        <p className="text-slate-600 text-sm mt-1">
          Gestión de stock y productos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <button
            onClick={handleAddProducto}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">
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
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p: any) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
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
                        ${p.costo_unitario_actual.toLocaleString("es-AR")}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductoModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadProductos();
          }}
        />
      )}
    </div>
  );
}
