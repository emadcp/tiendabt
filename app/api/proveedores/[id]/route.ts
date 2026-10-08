import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT: Editar un proveedor existente (incluye activar/desactivar).
// No existe DELETE a propósito: Compra.proveedor_id no tiene onDelete
// definido en el schema (comportamiento restrictivo por default), y borrar
// un proveedor con compras asociadas perdería trazabilidad histórica. Se
// usa el mismo patrón activo/inactivo que Producto en su lugar.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    if (body.nombre !== undefined && !body.nombre) {
      return NextResponse.json(
        { error: "El nombre del proveedor es obligatorio" },
        { status: 400 }
      );
    }

    const existente = await prisma.proveedor.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    const proveedor = await prisma.proveedor.update({
      where: { id },
      data: {
        nombre: body.nombre || existente.nombre,
        contacto:
          body.contacto !== undefined ? body.contacto || null : existente.contacto,
        email: body.email !== undefined ? body.email || null : existente.email,
        telefono:
          body.telefono !== undefined ? body.telefono || null : existente.telefono,
        pais: body.pais !== undefined ? body.pais || null : existente.pais,
        activo: body.activo ?? existente.activo,
      },
    });

    return NextResponse.json(proveedor, { status: 200 });
  } catch (error) {
    console.error("Error updating proveedor:", error);
    return NextResponse.json(
      { error: "Error al actualizar el proveedor" },
      { status: 500 }
    );
  }
}
