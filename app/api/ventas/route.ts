import { prisma } from "@/lib/prisma";
import { recalcularProducto } from "@/lib/stock";
import { NextRequest, NextResponse } from "next/server";

// Suma días a una fecha en UTC (evita corrimientos de un día por zona horaria).
function sumarDiasUTC(fecha: Date, dias: number) {
  const d = new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate())
  );
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

// GET: Obtener todas las ventas
export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        producto: true,
      },
      orderBy: { fecha_venta: "desc" },
    });

    return NextResponse.json(ventas, { status: 200 });
  } catch (error) {
    console.error("Error fetching ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// POST: Registrar una venta (descuenta stock automáticamente)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const producto_id = parseInt(body.producto_id, 10);
    const cantidad = parseInt(body.cantidad, 10);
    const precio_unitario = parseFloat(body.precio_unitario || "0");
    const comision_canal = parseFloat(body.comision_canal || "0");
    const costo_envio = parseFloat(body.costo_envio || "0");
    const costo_empaque = parseFloat(body.costo_empaque || "0");
    const otros_gastos = parseFloat(body.otros_gastos || "0");

    const fecha_venta = new Date(body.fecha_venta);
    // Fallback por si el cliente no envía la fecha de acreditación:
    // Mercado Libre retiene ~30 días; otros canales se asumen acreditados el mismo día.
    const fecha_acreditacion = body.fecha_acreditacion
      ? new Date(body.fecha_acreditacion)
      : sumarDiasUTC(
          fecha_venta,
          (body.canal || "").toLowerCase().includes("mercado libre") ? 30 : 0
        );

    const venta = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: producto_id },
      });

      if (!producto) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
      }
      if (producto.stock_actual < cantidad) {
        throw new Error("STOCK_INSUFICIENTE");
      }

      const costo_unitario = parseFloat(producto.costo_unitario_actual.toString());
      const subtotal = precio_unitario * cantidad;
      const costo_total = costo_unitario * cantidad;
      const ganancia_bruta = subtotal - costo_total;
      const ganancia_neta =
        ganancia_bruta - comision_canal - costo_envio - costo_empaque - otros_gastos;

      const nuevaVenta = await tx.venta.create({
        data: {
          producto_id,
          canal: body.canal,
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
          estado: body.estado || "completada",
          referencia_ext: body.referencia_ext || null,
        },
      });

      // Recalcula stock_actual y costos desde el ledger completo de
      // compras/ventas no canceladas (ver lib/stock.ts).
      await recalcularProducto(tx, producto_id);

      return nuevaVenta;
    });

    return NextResponse.json(venta, { status: 201 });
  } catch (error: any) {
    console.error("Error creating venta:", error);

    if (error.message === "STOCK_INSUFICIENTE") {
      return NextResponse.json(
        { error: "Stock insuficiente para registrar esta venta" },
        { status: 400 }
      );
    }
    if (error.message === "PRODUCTO_NO_ENCONTRADO") {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
