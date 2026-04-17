# SGT - Sistema de Gestion de Taller

Sistema web completo para gestionar la operacion de un taller mecanico: recepcion de vehiculos, cotizaciones, ordenes de trabajo, facturacion, pagos, reportes y mas.

Diseñado mobile-first para que el mecanico use su celular, el recepcionista una tablet, y el administrador su desktop.

## Funcionalidades

### Operaciones
- **Clientes** — Registro de clientes (persona fisica o empresa), cedula/RNC, contacto, historial completo
- **Vehiculos** — Registro por placa, marca, modelo, kilometraje, historial de servicios
- **Entrada de vehiculos** — Wizard de 6 pasos: cliente, vehiculo, estado, problema, fotos, firma
- **Tablero Kanban** — Vista de entradas por estado (Recibido, Diagnostico, Cotizado, En reparacion, Listo)

### Cotizaciones
- Creacion de cotizaciones con items (servicios y repuestos)
- Calculo automatico de ITBIS 18%
- Envio por WhatsApp al cliente con link publico
- El cliente aprueba o rechaza desde su celular sin necesidad de login
- Al aprobar se crea orden de trabajo automaticamente

### Ordenes de trabajo
- Asignacion de mecanico
- Control de estados: Pendiente, En progreso, Espera de repuesto, Completada
- Notificacion al cliente por WhatsApp en cada cambio de estado
- Al completar, la entrada se marca como "Listo" automaticamente

### Facturacion
- Generacion de facturas con NCF (comprobantes fiscales RD)
- Items pre-llenados desde la cotizacion
- ITBIS desglosado
- Envio por WhatsApp al cliente con link publico
- Barra de progreso de pago

### Pagos y movimientos
- Registro de pagos parciales o totales contra factura
- Metodos: efectivo, transferencia, tarjeta, cheque
- Actualizacion automatica de saldo pendiente
- Registro de egresos (nomina, compras, servicios, etc.)
- Balance de ingresos vs egresos

### Reportes
- Ventas por periodo
- Top clientes
- Ticket promedio
- Flujo de caja
- Cuentas por cobrar (aging 0-30, 31-60, 61-90, 90+)
- Ingresos vs egresos
- Tasa de conversion de cotizaciones
- Vehiculos mas atendidos
- Filtro por rango de fechas, exportable a PDF

### Configuracion
- Informacion del taller (nombre, RNC, direccion, logo)
- Gestion de usuarios y roles (admin, recepcionista, mecanico, contador)
- Secuencias NCF
- Catalogo de servicios con precios
- Catalogo de repuestos con stock

### Seguridad
- Autenticacion con email/password y magic link
- Middleware de proteccion de rutas
- Row Level Security (RLS) en todas las tablas
- Roles: admin, recepcionista, mecanico, contador

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 15 + TypeScript + CSS Modules |
| UI | Componentes propios + Radix UI + Lucide Icons |
| Backend | Supabase (Postgres + Auth + Storage) |
| Estado servidor | TanStack Query |
| Deploy | Vercel |

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/DemetrioReyes/sgt-system.git
cd sgt-system
npm install
```

### 2. Configurar Supabase

Crea un proyecto en [Supabase](https://supabase.com) y ejecuta los archivos SQL en orden:

```
sql/01-clientes.sql
sql/02-vehiculos.sql
sql/03-entradas-vehiculo.sql
sql/04-cotizaciones.sql
sql/05-ordenes-trabajo.sql
sql/06-facturas.sql
sql/07-pagos.sql
sql/08-movimientos.sql
sql/09-secuencias-y-funciones.sql
sql/10-triggers-automaticos.sql
sql/11-politicas-publicas.sql
sql/12-politicas-facturas-publicas.sql
sql/13-configuracion-taller.sql
```

### 3. Variables de entorno

Crea un archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Crear usuario administrador

En Supabase Dashboard > Authentication > Users > Add user (con Auto Confirm).
Luego en SQL Editor:

```sql
INSERT INTO public.usuarios (id, nombre, rol)
VALUES ('uid-del-usuario', 'Tu Nombre', 'admin');
```

### 5. Ejecutar

```bash
npm run dev
```

### 6. Deploy en Vercel

Conecta el repo a Vercel y agrega las variables de entorno en Settings > Environment Variables.

## Adaptable

Este sistema esta diseñado para ser usado por cualquier taller. Solo configura:

1. Nombre del taller, RNC y datos fiscales en `/configuracion/taller`
2. Crea los usuarios (mecanicos, recepcionistas) en `/configuracion/usuarios`
3. Agrega tu catalogo de servicios y repuestos
4. Configura las secuencias NCF

## Licencia

Proyecto privado.
