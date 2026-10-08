import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT: Editar producto existente (incluye activar/desactivar)
//
// IMPORTANTE: stock_actual, costo_unitario_actual y costo_unitario_prom NO
// se aceptan acá. Son campos derivados que calcula recalcularProducto()
// (lib/stock.ts) a partir del historial de Compras/Ventas no canceladas.
// Si se dejaran editar a mano acá, cualquier edición del producto pisaría
// silenciosamente el valor real y volvería a desalinearse la próxima vez
// que se registre/edite/cancele una compra o venta. Para cambiar el stock,
// el único camino es registrar una Compra o Venta (o, para una corrección
// manual puntual, una Compra de ajuste).
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
        stock_minimo: parseInt(body.stock_minimo || "5", 10),
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
