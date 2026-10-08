import { prisma } from "@/lib/prisma";
import { lockProducto, lockProductos, recalcularProducto } from "@/lib/stock";
import { NextRequest, NextResponse } from "next/server";

// PUT: Editar una venta existente. También se usa para cancelar/reactivar
// (el frontend envía el objeto completo con "estado" cambiado, igual que el
// patrón de activar/desactivar productos). Recalcula stock y costos del
// producto afectado -y del anterior, si se cambia producto_id- a partir del
// ledger completo de movimientos no cancelados (ver lib/stock.ts).
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const venta = await prisma.$transaction(async (tx) => {
      const existente = await tx.venta.findUnique({ where: { id } });
      if (!existente) {
        throw new Error("VENTA_NO_ENCONTRADA");
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
      const comision_canal =
        body.comision_canal !== undefined
          ? parseFloat(body.comision_canal)
          : parseFloat(existente.comision_canal.toString());
      const costo_envio =
        body.costo_envio !== undefined
          ? parseFloat(body.costo_envio)
          : parseFloat(existente.costo_envio.toString());
      const costo_empaque =
        body.costo_empaque !== undefined
          ? parseFloat(body.costo_empaque)
          : parseFloat(existente.costo_empaque.toString());
      const otros_gastos =
        body.otros_gastos !== undefined
          ? parseFloat(body.otros_gastos)
          : parseFloat(existente.otros_gastos.toString());
      const fecha_venta = body.fecha_venta
        ? new Date(body.fecha_venta)
        : existente.fecha_venta;
      const fecha_acreditacion = body.fecha_acreditacion
        ? new Date(body.fecha_acreditacion)
        : existente.fecha_acreditacion;
      const estado = body.estado || existente.estado;

      const producto = await tx.producto.findUnique({
        where: { id: producto_id },
      });
      if (!producto) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
      }

      // Bloquea ambos productos involucrados (el nuevo y, si cambia, el
      // anterior) ANTES de tocar la Venta, en orden consistente (ver
      // comentario en lib/stock.ts sobre por qué el orden evita deadlocks).
      await lockProductos(tx, [producto_id, producto_id_anterior]);

      const costo_unitario = parseFloat(producto.costo_unitario_actual.toString());
      const subtotal = precio_unitario * cantidad;
      const costo_total = costo_unitario * cantidad;
      const ganancia_bruta = subtotal - costo_total;
      const ganancia_neta =
        ganancia_bruta - comision_canal - costo_envio - costo_empaque - otros_gastos;

      const actualizada = await tx.venta.update({
        where: { id },
        data: {
          producto_id,
          canal: body.canal || existente.canal,
          cantidad,
          precio_unitario,
          subtotal,
          comision_canal,
          costo_envio,
          costo_empaque,
          otros_gastos,
          ganancia_bruta,
          ganancia_neta,
          fecha_venta,
          fecha_acreditacion,
          estado,
          referencia_ext:
            body.referencia_ext !== undefined
              ? body.referencia_ext || null
              : existente.referencia_ext,
        },
      });

      const resultado = await recalcularProducto(tx, producto_id);
      if (resultado.stock < 0) {
        throw new Error("STOCK_INSUFICIENTE");
      }
      if (producto_id_anterior !== producto_id) {
        const resultadoAnterior = await recalcularProducto(tx, producto_id_anterior);
        if (resultadoAnterior.stock < 0) {
          throw new Error("STOCK_INSUFICIENTE");
        }
      }

      return actualizada;
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json(venta, { status: 200 });
  } catch (error: any) {
    console.error("Error updating venta:", error);

    if (error.message === "VENTA_NO_ENCONTRADA") {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }
    if (error.message === "PRODUCTO_NO_ENCONTRADO") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    if (error.message === "STOCK_INSUFICIENTE") {
      return NextResponse.json(
        {
          error:
            "El stock resultante sería negativo: ya se vendieron o movieron esas unidades en otra operación",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar la venta" },
      { status: 500 }
    );
  }
}

// DELETE: Borrado definitivo de una venta. Al desaparecer del ledger, el
// stock del producto se restaura automáticamente al recalcular.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.$transaction(async (tx) => {
      const existente = await tx.venta.findUnique({ where: { id } });
      if (!existente) {
        throw new Error("VENTA_NO_ENCONTRADA");
      }

      await lockProducto(tx, existente.producto_id);

      await tx.venta.delete({ where: { id } });
      await recalcularProducto(tx, existente.producto_id);
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting venta:", error);

    if (error.message === "VENTA_NO_ENCONTRADA") {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Error al borrar la venta" },
      { status: 500 }
    );
  }
}
