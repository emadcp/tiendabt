import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT: Editar producto existente (incluye activar/desactivar)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre: body.nombre,
        sku: body.sku,
        descripcion: body.descripcion || null,
        categoria: body.categoria || null,
        imagen_url: body.imagen_url || null,
        url_mercado_libre: body.url_mercado_libre || null,
        url_tienda_propia: body.url_tienda_propia || null,
        stock_actual: parseInt(body.stock_actual || "0", 10),
        stock_minimo: parseInt(body.stock_minimo || "5", 10),
        costo_unitario_actual: parseFloat(body.costo_unitario_actual || "0"),
        activo: body.activo ?? true,
      },
    });

    return NextResponse.json(producto, { status: 200 });
  } catch (error) {
    console.error("Error updating producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}
