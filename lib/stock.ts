// Recalcula stock_actual, costo_unitario_prom y costo_unitario_actual de un
// producto desde cero, "reproduciendo" en orden cronológico todas sus Compras
// y Ventas no canceladas.
//
// Por qué: el cálculo incremental original (sumar/restar en cada POST) no
// puede revertirse de forma confiable cuando se edita, cancela o borra un
// movimiento histórico (no hay registro de "cuánto aportó cada compra" al
// promedio ponderado). Recalcular todo el ledger es la única forma
// matemáticamente correcta de mantener costo_unitario_prom consistente
// después de cualquier edición/cancelación/borrado.
//
// Se usa dentro de una transacción Prisma ($transaction) en cada endpoint
// que crea, edita, cancela o borra una Compra o una Venta.

type TxClient = any;

export interface ResultadoRecalculo {
  stock: number;
  costoProm: number;
  costoActual: number;
}

export async function recalcularProducto(
  tx: TxClient,
  producto_id: number
): Promise<ResultadoRecalculo> {
  const [compras, ventas] = await Promise.all([
    tx.compra.findMany({
      where: { producto_id, estado: { not: "cancelada" } },
      select: {
        id: true,
        cantidad: true,
        precio_unitario: true,
        fecha_compra: true,
        createdAt: true,
      },
    }),
    tx.venta.findMany({
      where: { producto_id, estado: { not: "cancelada" } },
      select: {
        id: true,
        cantidad: true,
        fecha_venta: true,
        createdAt: true,
      },
    }),
  ]);

  type Evento = {
    tipo: "compra" | "venta";
    cantidad: number;
    precio: number;
    fecha: Date;
    createdAt: Date;
    id: number;
  };

  const eventos: Evento[] = [
    ...compras.map((c: any): Evento => ({
      tipo: "compra",
      cantidad: c.cantidad,
      precio: parseFloat(c.precio_unitario.toString()),
      fecha: new Date(c.fecha_compra),
      createdAt: new Date(c.createdAt),
      id: c.id,
    })),
    ...ventas.map((v: any): Evento => ({
      tipo: "venta",
      cantidad: v.cantidad,
      precio: 0,
      fecha: new Date(v.fecha_venta),
      createdAt: new Date(v.createdAt),
      id: v.id,
    })),
  ];

  // Orden cronológico por fecha de la operación (criterio contable); ante
  // igualdad de fecha, por orden de creación real para mantener un resultado
  // determinístico y estable.
  eventos.sort((a, b) => {
    const porFecha = a.fecha.getTime() - b.fecha.getTime();
    if (porFecha !== 0) return porFecha;
    const porCreacion = a.createdAt.getTime() - b.createdAt.getTime();
    if (porCreacion !== 0) return porCreacion;
    return a.id - b.id;
  });

  let stock = 0;
  let costoProm = 0;
  let costoActual = 0;

  for (const ev of eventos) {
    if (ev.tipo === "compra") {
      const stockDespues = stock + ev.cantidad;
      costoProm =
        stockDespues > 0
          ? (stock * costoProm + ev.cantidad * ev.precio) / stockDespues
          : ev.precio;
      costoActual = ev.precio;
      stock = stockDespues;
    } else {
      stock -= ev.cantidad;
    }
  }

  await tx.producto.update({
    where: { id: producto_id },
    data: {
      stock_actual: stock,
      costo_unitario_prom: costoProm,
      costo_unitario_actual: costoActual,
    },
  });

  return { stock, costoProm, costoActual };
}
