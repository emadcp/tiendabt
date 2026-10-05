import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST: Crear o actualizar el precio de venta de un producto para un canal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producto_id = parseInt(params.id, 10);
    const body = await request.json();

    const producto = await prisma.producto.findUnique({
      where: { id: producto_id },
    });
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const precio_venta = parseFloat(body.precio_venta);
    const costo = parseFloat(producto.costo_unitario_actual.toString());
    const margen_pct =
      precio_venta > 0 ? ((precio_venta - costo) / precio_venta) * 100 : 0;

    const precioCanal = await prisma.precioCanal.upsert({
      where: {
        producto_id_canal: {
          producto_id,
          canal: body.canal,
        },
      },
      update: {
        precio_venta,
        margen_pct,
      },
      create: {
        producto_id,
        canal: body.canal,
        precio_venta,
        margen_pct,
      },
    });

    return NextResponse.json(precioCanal, { status: 200 });
  } catch (error) {
    console.error("Error guardando precio de canal:", error);
    return NextResponse.json(
      { error: "Error al guardar el precio" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar el precio de un canal (?canal=Mercado+Libre)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producto_id = parseInt(params.id, 10);
    const { searchParams } = new URL(request.url);
    const canal = searchParams.get("canal");

    if (!canal) {
      return NextResponse.json(
        { error: "Falta el parámetro canal" },
        { status: 400 }
      );
    }

    await prisma.precioCanal.delete({
      where: {
        producto_id_canal: {
          producto_id,
          canal,
        },
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error eliminando precio de canal:", error);
    return NextResponse.json(
      { error: "Error al eliminar el precio" },
      { status: 500 }
    );
  }
}
