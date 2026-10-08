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

// Bloquea una fila de Producto (SELECT ... FOR UPDATE) para serializar el
// acceso concurrente de dos transacciones al mismo producto_id. Sin este
// lock, dos requests casi simultáneas sobre el mismo producto (p.ej. dos
// compras seguidas) pueden pisarse: ambas leen el ledger de compras/ventas
// antes de que la otra haga commit, y la que termina de escribir último
// sobreescribe el stock correcto con un valor que no incluye el aporte de
// la otra ("lost update" bajo READ COMMITTED, el nivel de aislamiento
// default de Postgres). Confirmado con pruebas de concurrencia reales: sin
// el lock, N compras concurrentes sobre el mismo producto podían terminar
// con stock_actual muy por debajo de la suma real, aunque todas las filas
// de Compra se guardaban bien (el problema era solo el campo derivado).
//
// IMPORTANTE sobre el orden: esto debe llamarse ANTES de crear/editar/borrar
// la Compra o Venta relacionada, no después. Un INSERT/UPDATE que apunta
// producto_id a este Producto ya toma, por la foreign key, un lock más
// débil (FOR KEY SHARE) sobre esa fila. Si el FOR UPDATE se pide recién
// después (p.ej. dentro de recalcularProducto llamado al final), dos
// transacciones concurrentes pueden quedar esperándose en círculo -cada
// una con su propio FOR KEY SHARE del INSERT, ambas queriendo subir a FOR
// UPDATE- y Postgres aborta una con "deadlock detected". Bloqueando primero
// (antes de tocar Compra/Venta) se evita esa ventana por completo.
export async function lockProducto(tx: TxClient, producto_id: number): Promise<void> {
  await tx.$queryRaw`SELECT id FROM "Producto" WHERE id = ${producto_id} FOR UPDATE`;
}

// Variante para cuando una misma transacción necesita bloquear más de un
// producto (p.ej. al editar una Compra/Venta y cambiarle el producto
// asignado: hay que recalcular el nuevo Y el anterior). Se bloquean en
// orden ascendente de id, siempre el mismo orden sin importar cuál sea
// "nuevo" o "anterior" en cada request -si no, dos ediciones concurrentes
// que cruzan los mismos dos productos en sentido opuesto podrían
// deadlockear entre sí (A bloquea 1 y espera 2; B bloquea 2 y espera 1).
export async function lockProductos(tx: TxClient, ids: number[]): Promise<void> {
  const unicos = Array.from(new Set(ids)).sort((a, b) => a - b);
  for (const id of unicos) {
    await lockProducto(tx, id);
  }
}

export async function recalcularProducto(
  tx: TxClient,
  producto_id: number
): Promise<ResultadoRecalculo> {
  // Redundante si el caller ya bloqueó con lockProducto/lockProductos antes
  // de mutar Compra/Venta (que es lo que deberían hacer todos los endpoints
  // - ver comentario arriba). Volver a pedir el mismo lock dentro de la
  // misma transacción es instantáneo (no-op), así que dejarlo acá también
  // sirve como red de seguridad ante algún caller futuro que se olvide.
  await lockProducto(tx, producto_id);

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
