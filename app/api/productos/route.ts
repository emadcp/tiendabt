import { prisma } from "@/lib/prisma";
import { recalcularProducto } from "@/lib/stock";
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
//
// Si se carga stock_actual > 0 (stock que ya existía antes de dar de alta el
// producto en el sistema), se genera automáticamente una Compra "Stock
// inicial" por esa cantidad y ese costo, y se deja que recalcularProducto()
// derive stock_actual/costo_unitario_* desde ahí. Así el número que se ve en
// Inventario siempre tiene respaldo en Compras desde el primer momento, y
// nunca queda un stock "fantasma" sin historial detrás (ver lib/stock.ts).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stock_inicial = parseInt(body.stock_actual || "0", 10);
    const costo_inicial = parseFloat(body.costo_unitario_actual || "0");

    const producto = await prisma.$transaction(async (tx) => {
      const nuevoProducto = await tx.producto.create({
        data: {
          nombre: body.nombre,
          sku: body.sku,
          descripcion: body.descripcion || null,
          categoria: body.categoria || null,
          imagen_url: body.imagen_url || null,
          url_mercado_libre: body.url_mercado_libre || null,
          url_tienda_propia: body.url_tienda_propia || null,
          stock_actual: stock_inicial,
          stock_minimo: parseInt(body.stock_minimo || "5", 10),
          costo_unitario_actual: costo_inicial,
          costo_unitario_prom: costo_inicial,
        },
      });

      if (stock_inicial > 0) {
        await tx.compra.create({
          data: {
            producto_id: nuevoProducto.id,
            proveedor_id: null,
            proveedor_nombre: "Stock inicial",
            cantidad: stock_inicial,
            precio_unitario: costo_inicial,
            costo_total: stock_inicial * costo_inicial,
            fecha_compra: new Date(),
            referencia_proveedor: "Generada automáticamente al dar de alta el producto",
            estado: "completada",
          },
        });

        await recalcularProducto(tx, nuevoProducto.id);
        return tx.producto.findUniqueOrThrow({ where: { id: nuevoProducto.id } });
      }

      return nuevoProducto;
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error("Error creating producto:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
