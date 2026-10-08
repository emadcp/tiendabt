import { prisma } from "@/lib/prisma";
import { recalcularProducto } from "@/lib/stock";
import { NextRequest, NextResponse } from "next/server";

// GET: Obtener todas las compras
export async function GET() {
  try {
    const compras = await prisma.compra.findMany({
      include: {
        producto: true,
        proveedor: true,
      },
      orderBy: { fecha_compra: "desc" },
    });

    return NextResponse.json(compras, { status: 200 });
  } catch (error) {
    console.error("Error fetching compras:", error);
    return NextResponse.json(
      { error: "Error al obtener compras" },
      { status: 500 }
    );
  }
}

// POST: Registrar una compra (repone stock y recalcula costo promedio ponderado)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const producto_id = parseInt(body.producto_id, 10);
    const cantidad = parseInt(body.cantidad, 10);
    const precio_unitario = parseFloat(body.precio_unitario || "0");
    const proveedor_id = body.proveedor_id ? parseInt(body.proveedor_id, 10) : null;

    const compra = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: producto_id },
      });

      if (!producto) {
        throw new Error("PRODUCTO_NO_ENCONTRADO");
      }

      const costo_total = cantidad * precio_unitario;

      const nuevaCompra = await tx.compra.create({
        data: {
          producto_id,
          proveedor_id,
          proveedor_nombre: body.proveedor_nombre,
          cantidad,
          precio_unitario,
          costo_total,
          fecha_compra: new Date(body.fecha_compra),
          referencia_proveedor: body.referencia_proveedor || null,
          estado: body.estado || "completada",
        },
      });

      // Recalcula stock_actual, costo_unitario_prom y costo_unitario_actual
      // desde el ledger completo de compras/ventas no canceladas (lib/stock.ts).
      await recalcularProducto(tx, producto_id);

      return nuevaCompra;
    });

    return NextResponse.json(compra, { status: 201 });
  } catch (error: any) {
    console.error("Error creating compra:", error);

    if (error.message === "PRODUCTO_NO_ENCONTRADO") {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear compra" },
      { status: 500 }
    );
  }
}
