import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const gastos = await prisma.gastoOperativo.findMany({
      orderBy: { fecha_gasto: "desc" },
    });

    return NextResponse.json(gastos, { status: 200 });
  } catch (error) {
    console.error("Error fetching gastos:", error);
    return NextResponse.json(
      { error: "Error al obtener gastos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const gasto = await prisma.gastoOperativo.create({
      data: {
        tipo_gasto: body.tipo_gasto,
        descripcion: body.descripcion,
        monto: parseFloat(body.monto),
        canal: body.canal || null,
        venta_id: body.venta_id || null,
        fecha_gasto: new Date(body.fecha_gasto),
        observaciones: body.observaciones || null,
      },
    });

    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    console.error("Error creating gasto:", error);
    return NextResponse.json(
      { error: "Error al crear gasto" },
      { status: 500 }
    );
  }
}
