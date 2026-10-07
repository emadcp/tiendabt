"use client";

import { useEffect, useState } from "react";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    pais: "",
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const res = await fetch("/api/proveedores");
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.nombre) return;
    setError("");
    setGuardando(true);

    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ nombre: "", contacto: "", email: "", telefono: "", pais: "" });
        loadProveedores();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error al guardar el proveedor");
      }
    } catch (error) {
      console.error(error);
      setError("Error al guardar el proveedor");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
        <p className="text-slate-600 text-sm mt-1">
          Contactos de proveedores de mercadería
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Listado de Proveedores
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : proveedores.length === 0 ? (
            <p className="p-6 text-slate-500">No hay proveedores registrados</p>
          ) : (
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
          )}

          <form
            onSubmit={handleSubmit}
            className="p-6 border-t border-slate-200 grid grid-cols-5 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
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
                value={formData.contacto}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="pais"
                placeholder="País"
                value={formData.pais}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium whitespace-nowrap"
              >
                Agregar
              </button>
            </div>
            {error && (
              <p className="col-span-5 text-sm text-red-600 font-semibold">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
