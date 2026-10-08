import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT: Editar un gasto operativo existente. No tiene efectos sobre stock ni
// costos (a diferencia de Venta/Compra), así que es un update directo.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const existente = await prisma.gastoOperativo.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    const gasto = await prisma.gastoOperativo.update({
      where: { id },
      data: {
        tipo_gasto: body.tipo_gasto || existente.tipo_gasto,
        descripcion: body.descripcion || existente.descripcion,
        monto:
          body.monto !== undefined
            ? parseFloat(body.monto)
            : parseFloat(existente.monto.toString()),
        canal: body.canal !== undefined ? body.canal || null : existente.canal,
        fecha_gasto: body.fecha_gasto
          ? new Date(body.fecha_gasto)
          : existente.fecha_gasto,
        observaciones:
          body.observaciones !== undefined
            ? body.observaciones || null
            : existente.observaciones,
      },
    });

    return NextResponse.json(gasto, { status: 200 });
  } catch (error) {
    console.error("Error updating gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el gasto" },
      { status: 500 }
    );
  }
}

// DELETE: Borrado definitivo de un gasto operativo.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    const existente = await prisma.gastoOperativo.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    await prisma.gastoOperativo.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting gasto:", error);
    return NextResponse.json(
      { error: "Error al borrar el gasto" },
      { status: 500 }
    );
  }
}
