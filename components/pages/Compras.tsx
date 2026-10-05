"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CompraModal from "@/components/modals/CompraModal";

export default function Compras() {
  const [compras, setCompras] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);
  const [errorProveedor, setErrorProveedor] = useState("");

  const [formProveedor, setFormProveedor] = useState({
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    pais: "",
  });

  useEffect(() => {
    loadCompras();
    loadProveedores();
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

  const loadProveedores = async () => {
    try {
      const res = await fetch("/api/proveedores");
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const handleChangeProveedor = (e: any) => {
    const { name, value } = e.target;
    setFormProveedor((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProveedor = async (e: any) => {
    e.preventDefault();
    if (!formProveedor.nombre) return;
    setErrorProveedor("");
    setGuardandoProveedor(true);

    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProveedor),
      });

      if (res.ok) {
        setFormProveedor({ nombre: "", contacto: "", email: "", telefono: "", pais: "" });
        loadProveedores();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorProveedor(data.error || "Error al guardar el proveedor");
      }
    } catch (error) {
      console.error(error);
      setErrorProveedor("Error al guardar el proveedor");
    } finally {
      setGuardandoProveedor(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Compras</h1>
        <p className="text-slate-600 text-sm mt-1">
          Reposición de stock y proveedores
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white space-y-8">
        <div>
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
                          {new Date(c.fecha_compra).toLocaleDateString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Proveedores
              </h3>
            </div>

            {loadingProveedores ? (
              <p className="p-6 text-slate-500">Cargando...</p>
            ) : (
              proveedores.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                          País
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedores.map((p: any) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {p.nombre}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{p.contacto || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{p.email || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{p.telefono || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{p.pais || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            <form
              onSubmit={handleAddProveedor}
              className="p-6 border-t border-slate-200 grid grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formProveedor.nombre}
                  onChange={handleChangeProveedor}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contacto
                </label>
                <input
                  type="text"
                  name="contacto"
                  value={formProveedor.contacto}
                  onChange={handleChangeProveedor}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formProveedor.email}
                  onChange={handleChangeProveedor}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formProveedor.telefono}
                  onChange={handleChangeProveedor}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="pais"
                  placeholder="País"
                  value={formProveedor.pais}
                  onChange={handleChangeProveedor}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={guardandoProveedor}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                >
                  Agregar
                </button>
              </div>
              {errorProveedor && (
                <p className="col-span-5 text-sm text-red-600 font-semibold">
                  {errorProveedor}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <CompraModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadCompras();
            loadProveedores();
          }}
        />
      )}
    </div>
  );
}
