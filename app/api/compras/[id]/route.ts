import { prisma } from "@/lib/prisma";
import { lockProducto, lockProductos, recalcularProducto } from "@/lib/stock";
import { NextRequest, NextResponse } from "next/server";

// PUT: Editar una compra existente (incluye cancelar/reactivar vía
// "estado"). Recalcula stock y costo_unitario_prom del producto afectado
// -y del anterior, si se cambia producto_id- a partir del ledger completo
// de movimientos no cancelados (ver lib/stock.ts).
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const compra = await prisma.$transaction(async (tx) => {
      const existente = await tx.compra.findUnique({ where: { id } });
      if (!existente) {
        throw new Error("COMPRA_NO_ENCONTRADA");
      }

      const producto_id_anterior = existente.producto_id;
      const producto_id =
        body.producto_id !== undefined
          ? parseInt(body.producto_id, 10)
          : existente.producto_id;
      const cantidad =
        body.cantidad !== undefined
          ? parseInt(body.cantidad, 10)
          : existente.cantidad;
      const precio_unitario =
        body.precio_unitario !== undefined
          ? parseFloat(body.precio_unitario)
          : parseFloat(existente.precio_unitario.toString());
      const proveedor_id =
        body.proveedor_id !== undefined
          ? body.proveedor_id
            ? parseInt(body.proveedor_id, 10)
            : null
          : existente.proveedor_id;
      const fecha_compra = body.fecha_compra
        ? new Date(body.fecha_compra)
        : existente.fecha_compra;
      const estado = body.estado || existente.estado;

      let proveedor_nombre = existente.proveedor_nombre;
      if (body.proveedor_nombre) {
        proveedor_nombre = body.proveedor_nombre;
      } else if (proveedor_id !== existente.proveedor_id && proveedor_id) {
        const proveedor = await tx.proveedor.findUnique({
          where: { id: proveedor_id },
        });
        proveedor_nombre = proveedor?.nombre || existente.proveedor_nombre;
      }

      const costo_total = cantidad * precio_unitario;

      // Bloquea ambos productos involucrados (el nuevo y, si cambia, el
      // anterior) ANTES de tocar la Compra, en orden consistente (ver
      // comentario en lib/stock.ts sobre por qué el orden evita deadlocks).
      await lockProductos(tx, [producto_id, producto_id_anterior]);

      const actualizada = await tx.compra.update({
        where: { id },
        data: {
          producto_id,
          proveedor_id,
          proveedor_nombre,
          cantidad,
          precio_unitario,
          costo_total,
          fecha_compra,
          referencia_proveedor:
            body.referencia_proveedor !== undefined
              ? body.referencia_proveedor || null
              : existente.referencia_proveedor,
          estado,
        },
      });

      const resultado = await recalcularProducto(tx, producto_id);
      if (resultado.stock < 0) {
        throw new Error("STOCK_NEGATIVO");
      }
      if (producto_id_anterior !== producto_id) {
        const resultadoAnterior = await recalcularProducto(tx, producto_id_anterior);
        if (resultadoAnterior.stock < 0) {
          throw new Error("STOCK_NEGATIVO");
        }
      }

      return actualizada;
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json(compra, { status: 200 });
  } catch (error: any) {
    console.error("Error updating compra:", error);

    if (error.message === "COMPRA_NO_ENCONTRADA") {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }
    if (error.message === "STOCK_NEGATIVO") {
      return NextResponse.json(
        {
          error:
            "No se puede guardar: el stock resultante sería negativo porque ya se vendieron unidades de esta compra",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar la compra" },
      { status: 500 }
    );
  }
}

// DELETE: Borrado definitivo de una compra. Recalcula el stock y el costo
// promedio ponderado del producto a partir del ledger restante; si el stock
// resultante sería negativo (porque ya se vendieron esas unidades), se
// bloquea la operación.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.$transaction(async (tx) => {
      const existente = await tx.compra.findUnique({ where: { id } });
      if (!existente) {
        throw new Error("COMPRA_NO_ENCONTRADA");
      }

      await lockProducto(tx, existente.producto_id);

      await tx.compra.delete({ where: { id } });

      const resultado = await recalcularProducto(tx, existente.producto_id);
      if (resultado.stock < 0) {
        throw new Error("STOCK_NEGATIVO");
      }
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting compra:", error);

    if (error.message === "COMPRA_NO_ENCONTRADA") {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }
    if (error.message === "STOCK_NEGATIVO") {
      return NextResponse.json(
        {
          error:
            "No se puede borrar: el stock resultante sería negativo porque ya se vendieron unidades de esta compra",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al borrar la compra" },
      { status: 500 }
    );
  }
}
