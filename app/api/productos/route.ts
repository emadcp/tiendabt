import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Obtener todos los productos
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        precios_canal: true,
        alertas: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(productos, { status: 200 });
  } catch (error) {
    console.error("Error fetching productos:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const producto = await prisma.producto.create({
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
        costo_unitario_prom: parseFloat(body.costo_unitario_actual || "0"),
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error("Error creating producto:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
