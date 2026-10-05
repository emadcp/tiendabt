import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Obtener todos los proveedores
export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(proveedores, { status: 200 });
  } catch (error) {
    console.error("Error fetching proveedores:", error);
    return NextResponse.json(
      { error: "Error al obtener proveedores" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nombre) {
      return NextResponse.json(
        { error: "El nombre del proveedor es obligatorio" },
        { status: 400 }
      );
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        nombre: body.nombre,
        contacto: body.contacto || null,
        email: body.email || null,
        telefono: body.telefono || null,
        pais: body.pais || null,
      },
    });

    return NextResponse.json(proveedor, { status: 201 });
  } catch (error) {
    console.error("Error creating proveedor:", error);
    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 }
    );
  }
}
