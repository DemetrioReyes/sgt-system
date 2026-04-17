import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, Badge, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import {
  reporteVentasPeriodo,
  reporteVentasServicioRepuesto,
  reporteTopClientes,
  reporteTicketPromedio,
  reporteFlujoCaja,
  reporteCuentasPorCobrar,
  reporteIngresosVsEgresos,
  reporteTasaConversion,
  reporteVehiculosMasAtendidos,
} from '@/lib/actions/reportes';
import FiltroFecha, { ExportButton } from './filtro-fecha';
import styles from './reporte.module.css';

const REPORT_CONFIG: Record<string, { titulo: string; hasDateFilter: boolean }> = {
  'ventas-periodo': { titulo: 'Ventas por periodo', hasDateFilter: true },
  'ventas-servicio': { titulo: 'Ventas por servicio/repuesto', hasDateFilter: true },
  'top-clientes': { titulo: 'Top clientes', hasDateFilter: true },
  'ticket-promedio': { titulo: 'Ticket promedio', hasDateFilter: true },
  'flujo-caja': { titulo: 'Flujo de caja', hasDateFilter: true },
  'cuentas-por-cobrar': { titulo: 'Cuentas por cobrar (aging)', hasDateFilter: false },
  'ingresos-vs-egresos': { titulo: 'Ingresos vs egresos', hasDateFilter: true },
  'tasa-conversion': { titulo: 'Tasa de conversion de cotizaciones', hasDateFilter: true },
  'vehiculos-atendidos': { titulo: 'Vehiculos mas atendidos', hasDateFilter: true },
};

function formatMoney(n: number) {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getDefaultRange() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { desde, hasta };
}

export default async function ReporteDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const config = REPORT_CONFIG[slug];
  if (!config) notFound();

  const range = getDefaultRange();
  const desde = sp.desde || range.desde;
  const hasta = sp.hasta || range.hasta;

  return (
    <div className={styles.page}>
      <Link href="/reportes" className={styles.backLink}>
        <ArrowLeft size={16} />
        Volver a reportes
      </Link>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>{config.titulo}</h1>
        <div className={styles.actions}>
          <ExportButton />
        </div>
      </div>

      <FiltroFecha desde={desde} hasta={hasta} showFilter={config.hasDateFilter} />

      <ReportContent slug={slug} desde={desde} hasta={hasta} />
    </div>
  );
}

async function ReportContent({ slug, desde, hasta }: { slug: string; desde: string; hasta: string }) {
  switch (slug) {
    case 'ventas-periodo':
      return <VentasPeriodo desde={desde} hasta={hasta} />;
    case 'ventas-servicio':
      return <VentasServicio desde={desde} hasta={hasta} />;
    case 'top-clientes':
      return <TopClientes desde={desde} hasta={hasta} />;
    case 'ticket-promedio':
      return <TicketPromedio desde={desde} hasta={hasta} />;
    case 'flujo-caja':
      return <FlujoCaja desde={desde} hasta={hasta} />;
    case 'cuentas-por-cobrar':
      return <CuentasPorCobrar />;
    case 'ingresos-vs-egresos':
      return <IngresosVsEgresos desde={desde} hasta={hasta} />;
    case 'tasa-conversion':
      return <TasaConversion desde={desde} hasta={hasta} />;
    case 'vehiculos-atendidos':
      return <VehiculosAtendidos desde={desde} hasta={hasta} />;
    default:
      return null;
  }
}

// ── Ventas por periodo ──────────────────────────────────────────────

async function VentasPeriodo({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteVentasPeriodo(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data || data.length === 0) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  const totalGeneral = data.reduce((s, d) => s + d.monto_total, 0);
  const totalFacturas = data.reduce((s, d) => s + d.total_facturas, 0);

  return (
    <Card padding="md">
      <Table>
        <Thead>
          <Tr>
            <Th>Fecha</Th>
            <Th className={styles.centerAlign}># Facturas</Th>
            <Th className={styles.rightAlign}>Monto Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => (
            <Tr key={row.fecha}>
              <Td>{formatDate(row.fecha)}</Td>
              <Td className={styles.centerAlign}>{row.total_facturas}</Td>
              <Td className={styles.rightAlign}>{formatMoney(row.monto_total)}</Td>
            </Tr>
          ))}
          <Tr className={styles.totalRow}>
            <Td>Total</Td>
            <Td className={styles.centerAlign}>{totalFacturas}</Td>
            <Td className={styles.rightAlign}>{formatMoney(totalGeneral)}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
}

// ── Ventas por servicio/repuesto ────────────────────────────────────

async function VentasServicio({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteVentasServicioRepuesto(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data || data.length === 0) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  const totalMonto = data.reduce((s, d) => s + d.monto_total, 0);

  return (
    <Card padding="md">
      <Table>
        <Thead>
          <Tr>
            <Th>Tipo</Th>
            <Th>Descripcion</Th>
            <Th className={styles.centerAlign}>Cantidad</Th>
            <Th className={styles.rightAlign}>Monto Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, i) => (
            <Tr key={i}>
              <Td>
                <Badge variant={row.tipo === 'servicio' ? 'info' : 'warning'}>
                  {row.tipo === 'servicio' ? 'Servicio' : 'Repuesto'}
                </Badge>
              </Td>
              <Td>{row.descripcion}</Td>
              <Td className={styles.centerAlign}>{row.cantidad_total}</Td>
              <Td className={styles.rightAlign}>{formatMoney(row.monto_total)}</Td>
            </Tr>
          ))}
          <Tr className={styles.totalRow}>
            <Td colSpan={3}>Total</Td>
            <Td className={styles.rightAlign}>{formatMoney(totalMonto)}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
}

// ── Top clientes ────────────────────────────────────────────────────

async function TopClientes({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteTopClientes(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data || data.length === 0) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  return (
    <Card padding="md">
      <Table>
        <Thead>
          <Tr>
            <Th className={styles.centerAlign}>#</Th>
            <Th>Cliente</Th>
            <Th className={styles.centerAlign}># Facturas</Th>
            <Th className={styles.rightAlign}>Total Facturado</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, i) => (
            <Tr key={i}>
              <Td className={styles.centerAlign}>{i + 1}</Td>
              <Td>{row.nombre}</Td>
              <Td className={styles.centerAlign}>{row.cantidad_facturas}</Td>
              <Td className={styles.rightAlign}>{formatMoney(row.total)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
}

// ── Ticket promedio ─────────────────────────────────────────────────

async function TicketPromedio({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteTicketPromedio(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  return (
    <div className={styles.summaryGrid}>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Ticket Promedio</span>
          <span className={styles.summaryValueBig}>{formatMoney(data.ticket_promedio)}</span>
        </div>
      </Card>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Facturas</span>
          <span className={styles.summaryValue}>{data.total_facturas}</span>
        </div>
      </Card>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Monto Total</span>
          <span className={styles.summaryValue}>{formatMoney(data.monto_total)}</span>
        </div>
      </Card>
    </div>
  );
}

// ── Flujo de caja ───────────────────────────────────────────────────

async function FlujoCaja({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteFlujoCaja(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data || data.length === 0) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  const totalIngresos = data.reduce((s, d) => s + d.ingresos, 0);
  const totalEgresos = data.reduce((s, d) => s + d.egresos, 0);

  return (
    <Card padding="md">
      <Table>
        <Thead>
          <Tr>
            <Th>Fecha</Th>
            <Th className={styles.rightAlign}>Ingresos</Th>
            <Th className={styles.rightAlign}>Egresos</Th>
            <Th className={styles.rightAlign}>Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => (
            <Tr key={row.fecha}>
              <Td>{formatDate(row.fecha)}</Td>
              <Td className={`${styles.rightAlign} ${styles.montoPositivo}`}>
                {formatMoney(row.ingresos)}
              </Td>
              <Td className={`${styles.rightAlign} ${styles.montoNegativo}`}>
                {formatMoney(row.egresos)}
              </Td>
              <Td className={`${styles.rightAlign} ${row.balance >= 0 ? styles.montoPositivo : styles.montoNegativo}`}>
                {formatMoney(row.balance)}
              </Td>
            </Tr>
          ))}
          <Tr className={styles.totalRow}>
            <Td>Total</Td>
            <Td className={`${styles.rightAlign} ${styles.montoPositivo}`}>{formatMoney(totalIngresos)}</Td>
            <Td className={`${styles.rightAlign} ${styles.montoNegativo}`}>{formatMoney(totalEgresos)}</Td>
            <Td className={`${styles.rightAlign} ${totalIngresos - totalEgresos >= 0 ? styles.montoPositivo : styles.montoNegativo}`}>
              {formatMoney(totalIngresos - totalEgresos)}
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Card>
  );
}

// ── Cuentas por cobrar (aging) ──────────────────────────────────────

async function CuentasPorCobrar() {
  const { data, error } = await reporteCuentasPorCobrar();
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p className={styles.empty}>No hay cuentas por cobrar.</p>;

  const totalGeneral = data.reduce((s, d) => s + d.monto_total, 0);
  const totalCantidad = data.reduce((s, d) => s + d.cantidad, 0);

  return (
    <>
      <div className={styles.summaryGrid}>
        <Card padding="md">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total por cobrar</span>
            <span className={styles.summaryValue}>{formatMoney(totalGeneral)}</span>
          </div>
        </Card>
        <Card padding="md">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Facturas pendientes</span>
            <span className={styles.summaryValue}>{totalCantidad}</span>
          </div>
        </Card>
      </div>

      {data.map((grupo) => (
        <div key={grupo.rango} className={styles.agingSection}>
          <Card padding="md">
            <div className={styles.agingSectionHeader}>
              <h3 className={styles.agingSectionTitle}>{grupo.rango}</h3>
              <span className={styles.agingSectionMeta}>
                {grupo.cantidad} factura{grupo.cantidad !== 1 ? 's' : ''} &mdash; {formatMoney(grupo.monto_total)}
              </span>
            </div>
            {grupo.facturas.length > 0 ? (
              <Table>
                <Thead>
                  <Tr>
                    <Th># Factura</Th>
                    <Th>Cliente</Th>
                    <Th className={styles.rightAlign}>Total</Th>
                    <Th className={styles.rightAlign}>Saldo</Th>
                    <Th className={styles.centerAlign}>Dias</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {grupo.facturas.map((f, i) => (
                    <Tr key={i}>
                      <Td>{f.numero}</Td>
                      <Td>{f.cliente_nombre}</Td>
                      <Td className={styles.rightAlign}>{formatMoney(f.total)}</Td>
                      <Td className={`${styles.rightAlign} ${styles.montoNegativo}`}>{formatMoney(f.saldo)}</Td>
                      <Td className={styles.centerAlign}>{f.dias}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <p className={styles.empty}>Sin facturas en este rango.</p>
            )}
          </Card>
        </div>
      ))}
    </>
  );
}

// ── Ingresos vs egresos ─────────────────────────────────────────────

async function IngresosVsEgresos({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteIngresosVsEgresos(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  return (
    <>
      <div className={styles.summaryGrid}>
        <Card padding="md">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Ingresos totales</span>
            <span className={`${styles.summaryValue} ${styles.montoPositivo}`}>
              {formatMoney(data.ingresos_total)}
            </span>
          </div>
        </Card>
        <Card padding="md">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Egresos totales</span>
            <span className={`${styles.summaryValue} ${styles.montoNegativo}`}>
              {formatMoney(data.egresos_total)}
            </span>
          </div>
        </Card>
        <Card padding="md">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Balance</span>
            <span className={`${styles.summaryValue} ${data.balance >= 0 ? styles.montoPositivo : styles.montoNegativo}`}>
              {formatMoney(data.balance)}
            </span>
          </div>
        </Card>
      </div>

      {data.por_mes.length > 0 && (
        <Card padding="md">
          <Table>
            <Thead>
              <Tr>
                <Th>Mes</Th>
                <Th className={styles.rightAlign}>Ingresos</Th>
                <Th className={styles.rightAlign}>Egresos</Th>
                <Th className={styles.rightAlign}>Balance</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.por_mes.map((row) => (
                <Tr key={row.mes}>
                  <Td>{row.mes}</Td>
                  <Td className={`${styles.rightAlign} ${styles.montoPositivo}`}>{formatMoney(row.ingresos)}</Td>
                  <Td className={`${styles.rightAlign} ${styles.montoNegativo}`}>{formatMoney(row.egresos)}</Td>
                  <Td className={`${styles.rightAlign} ${row.ingresos - row.egresos >= 0 ? styles.montoPositivo : styles.montoNegativo}`}>
                    {formatMoney(row.ingresos - row.egresos)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}
    </>
  );
}

// ── Tasa de conversion ──────────────────────────────────────────────

async function TasaConversion({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteTasaConversion(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  return (
    <div className={styles.summaryGrid}>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Cotizaciones</span>
          <span className={styles.summaryValue}>{data.total_cotizaciones}</span>
        </div>
      </Card>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Aprobadas</span>
          <span className={`${styles.summaryValue} ${styles.montoPositivo}`}>{data.aprobadas}</span>
        </div>
      </Card>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Rechazadas</span>
          <span className={`${styles.summaryValue} ${styles.montoNegativo}`}>{data.rechazadas}</span>
        </div>
      </Card>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Pendientes</span>
          <span className={styles.summaryValue}>{data.pendientes}</span>
        </div>
      </Card>
      <Card padding="md">
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Tasa de Aprobacion</span>
          <span className={styles.summaryValueBig}>{data.tasa_aprobacion_pct}%</span>
        </div>
      </Card>
    </div>
  );
}

// ── Vehiculos mas atendidos ─────────────────────────────────────────

async function VehiculosAtendidos({ desde, hasta }: { desde: string; hasta: string }) {
  const { data, error } = await reporteVehiculosMasAtendidos(desde, hasta);
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data || data.length === 0) return <p className={styles.empty}>No hay datos para el periodo seleccionado.</p>;

  return (
    <Card padding="md">
      <Table>
        <Thead>
          <Tr>
            <Th className={styles.centerAlign}>#</Th>
            <Th>Placa</Th>
            <Th>Marca / Modelo</Th>
            <Th className={styles.centerAlign}># Entradas</Th>
            <Th className={styles.rightAlign}>Monto Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, i) => (
            <Tr key={i}>
              <Td className={styles.centerAlign}>{i + 1}</Td>
              <Td>{row.placa}</Td>
              <Td>{row.marca} {row.modelo}</Td>
              <Td className={styles.centerAlign}>{row.cantidad_entradas}</Td>
              <Td className={styles.rightAlign}>{formatMoney(row.monto_total)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
}
