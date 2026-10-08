"use client";

import { useEffect, useState } from "react";
import { Pencil, Power } from "lucide-react";

const FORM_VACIO = { nombre: "", contacto: "", email: "", telefono: "", pais: "" };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [editingProveedor, setEditingProveedor] = useState<any>(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [formData, setFormData] = useState(FORM_VACIO);

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

  const handleEditProveedor = (proveedor: any) => {
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre || "",
      contacto: proveedor.contacto || "",
      email: proveedor.email || "",
      telefono: proveedor.telefono || "",
      pais: proveedor.pais || "",
    });
    setError("");
  };

  const handleCancelarEdicion = () => {
    setEditingProveedor(null);
    setFormData(FORM_VACIO);
    setError("");
  };

  const handleToggleActivo = async (proveedor: any) => {
    const accion = proveedor.activo ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que querés ${accion} "${proveedor.nombre}"?`)) return;

    try {
      const res = await fetch(`/api/proveedores/${proveedor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proveedor, activo: !proveedor.activo }),
      });
      if (res.ok) {
        loadProveedores();
      } else {
        alert("Error al actualizar el proveedor");
      }
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el proveedor");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.nombre) return;
    setError("");
    setGuardando(true);

    try {
      const res = await fetch(
        editingProveedor ? `/api/proveedores/${editingProveedor.id}` : "/api/proveedores",
        {
          method: editingProveedor ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setFormData(FORM_VACIO);
        setEditingProveedor(null);
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

  const proveedoresVisibles = proveedores.filter((p: any) =>
    mostrarInactivos ? true : p.activo
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
        <p className="text-slate-600 text-sm mt-1">
          Contactos de proveedores de mercadería
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="flex items-center justify-end mb-4">
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
              Listado de Proveedores
            </h3>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : proveedoresVisibles.length === 0 ? (
            <p className="p-6 text-slate-500">No hay proveedores para mostrar</p>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proveedoresVisibles.map((p: any) => (
                    <tr
                      key={p.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${
                        !p.activo ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.nombre}
                        {!p.activo && (
                          <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-semibold">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.contacto || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{p.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{p.telefono || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{p.pais || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditProveedor(p)}
                            title="Editar"
                            className="text-slate-500 hover:text-blue-600 transition"
                          >
                            <Pencil size={18} />
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-6 border-t border-slate-200 grid grid-cols-5 gap-3 items-end"
          >
            {editingProveedor && (
              <p className="col-span-5 text-sm font-semibold text-blue-700">
                Editando a &quot;{editingProveedor.nombre}&quot;
              </p>
            )}
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
                {editingProveedor ? "Guardar" : "Agregar"}
              </button>
              {editingProveedor && (
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm font-medium whitespace-nowrap"
                >
                  Cancelar
                </button>
              )}
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
