import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subtotal = body.cantidad * body.precio_unitario;
    const ganancia_bruta =
      subtotal - body.comision_canal - body.costo_envio - body.costo_empaque;

    const venta = await prisma.venta.create({
      data: {
        producto_id: body.producto_id,
        canal: body.canal,
        cantidad: body.cantidad,
        precio_unitario: parseFloat(body.precio_unitario),
        subtotal: subtotal,
        comision_canal: parseFloat(body.comision_canal || "0"),
        costo_envio: parseFloat(body.costo_envio || "0"),
        costo_empaque: parseFloat(body.costo_empaque || "0"),
        otros_gastos: parseFloat(body.otros_gastos || "0"),
        ganancia_bruta: ganancia_bruta,
        fecha_venta: new Date(body.fecha_venta),
        estado: body.estado || "completada",
      },
    });

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    console.error("Error creating venta:", error);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
