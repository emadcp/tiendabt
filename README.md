# TiendaBT - Sistema de Gestión

Sistema completo de gestión de inventario, ventas y gastos para TiendaBT.

## Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Deploy**: Vercel

## Características

✅ **Dashboard** - Resumen general con KPIs en tiempo real  
✅ **Inventario** - Gestión de productos con imágenes y URLs  
✅ **Ventas** - Registro de ventas por canal  
✅ **Gastos** - Discriminación de gastos por tipo (Comisión, Envío, Plataforma, Publicidad, Empaque)  
✅ **Reportes** - Análisis de rentabilidad  

## Requisitos

- Node.js 18+
- PostgreSQL 13+
- npm o yarn

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd tiendabt-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb tiendabt

# Copiar .env.example a .env.local y configurar
cp .env.example .env.local

# En .env.local, actualizar:
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/tiendabt"
```

#### Opción B: PostgreSQL en la Nube (Recomendado para Vercel)

Crear cuenta en [Neon.tech](https://neon.tech) (gratuito):

```bash
# Copiar connection string desde Neon
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/tiendabt"
```

### 4. Ejecutar migraciones de Prisma

```bash
# Crear tablas en la BD
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate
```

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

## Estructura del Proyecto

```
tiendabt-app/
├── app/                          # App router de Next.js
│   ├── api/                      # API routes
│   │   ├── productos/route.ts
│   │   ├── ventas/route.ts
│   │   └── gastos/route.ts
│   ├── page.tsx                  # Página principal
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   ├── pages/                    # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── Inventario.tsx
│   │   ├── Ventas.tsx
│   │   ├── Gastos.tsx
│   │   └── Reportes.tsx
│   ├── ui/                       # Componentes reutilizables
│   │   ├── MetricCard.tsx
│   │   ├── AlertBox.tsx
│   │   └── Table.tsx
│   └── modals/                   # Modales
│       └── ProductoModal.tsx
├── lib/
│   └── prisma.ts                 # Cliente Prisma
├── prisma/
│   └── schema.prisma             # Modelo de datos
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Modelos de Datos (Prisma)

- **Producto** - Información del producto, stock, costo, imágenes y URLs
- **PrecioCanal** - Precios diferentes por canal (Mercado Libre, Tienda Propia)
- **Venta** - Registro de cada venta con comisiones, envíos, etc.
- **GastoOperativo** - Gastos discriminados por tipo
- **Compra** - Compras a proveedores
- **Devolucion** - Reembolsos y cancelaciones
- **Proveedor** - Información de proveedores
- **AlertaStock** - Alertas automáticas de stock bajo

## API Endpoints

### Productos

```bash
GET  /api/productos              # Obtener todos
POST /api/productos              # Crear nuevo
```

### Ventas

```bash
GET  /api/ventas                 # Obtener todas
POST /api/ventas                 # Crear nueva
```

### Gastos

```bash
GET  /api/gastos                 # Obtener todos
POST /api/gastos                 # Crear nuevo
```

## Deploy en Vercel

### 1. Crear cuenta en Vercel

https://vercel.com

### 2. Conectar repositorio

```bash
# Pushear a GitHub primero
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo>
git push -u origin main
```

### 3. Importar en Vercel

1. Ir a https://vercel.com/new
2. Seleccionar repositorio de GitHub
3. Configurar variables de entorno:
   - `DATABASE_URL` = tu connection string de Neon
4. Deploy

### 4. Ejecutar migraciones en Vercel

```bash
# En la carpeta local, después del deploy inicial:
npx prisma migrate deploy
```

## Variables de Entorno

```env
DATABASE_URL="postgresql://..."      # Connection string de PostgreSQL
NEXT_PUBLIC_API_URL="http://localhost:3000"  # URL pública (para Vercel: https://tu-domain.vercel.app)
```

## Próximos Pasos

- [ ] Implementar autenticación (NextAuth.js)
- [ ] Agregar importación de CSV desde Mercado Libre
- [ ] Crear dashboards de gráficos avanzados
- [ ] Implementar reportes en PDF
- [ ] Agregar notificaciones de stock bajo
- [ ] Optimizar queries con índices
- [ ] Implementar cache en el frontend
- [ ] Agregar pruebas unitarias y E2E

## Support

Para problemas o preguntas: emadcp@bcrypto.com.ar

---

Hecho con ❤️ por TiendaBT
