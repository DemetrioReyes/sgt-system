import Link from 'next/link';
import { Button, Badge, Card, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import { getCotizaciones } from '@/lib/actions/cotizaciones';
import styles from './cotizaciones.module.css';

const estadoBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  borrador: { variant: 'default', label: 'Borrador' },
  enviada: { variant: 'info', label: 'Enviada' },
  aprobada: { variant: 'success', label: 'Aprobada' },
  rechazada: { variant: 'danger', label: 'Rechazada' },
  vencida: { variant: 'warning', label: 'Vencida' },
};

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO')}`;
}

function VigenciaLabel({ dias }: { dias: number }) {
  if (dias <= 0) return <span className={styles.vigenciaExpired}>Vencida</span>;
  if (dias <= 3) return <span className={styles.vigenciaWarn}>{dias} dias</span>;
  return <span className={styles.vigencia}>{dias} dias</span>;
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const result = await getCotizaciones(q, estado);
  const cotizaciones = result.data ?? [];

  const totalMes = cotizaciones.reduce((s, c) => s + Number(c.total ?? 0), 0);
  const aprobadas = cotizaciones.filter((c) => c.estado === 'aprobada').length;
  const pendientes = cotizaciones.filter((c) => c.estado === 'enviada' || c.estado === 'borrador').length;
  const rechazadas = cotizaciones.filter((c) => c.estado === 'rechazada').length;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Cotizaciones</h1>
        <Link href="/cotizaciones/nueva">
          <Button>+ Nueva cotizacion</Button>
        </Link>
      </div>

      <div className={styles.kpiRow}>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totalMes)}</div>
          <div className={styles.kpiLabel}>Total</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{aprobadas}</div>
          <div className={styles.kpiLabel}>Aprobadas</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{pendientes}</div>
          <div className={styles.kpiLabel}>Pendientes</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{rechazadas}</div>
          <div className={styles.kpiLabel}>Rechazadas</div>
        </Card>
      </div>

      <Card>
        <div className={styles.filters}>
          <form className={styles.filters}>
            <div className={styles.filterItem}>
              <input
                type="text"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Buscar cotizacion..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterItem}>
              <select name="estado" defaultValue={estado ?? ''} className={styles.filterSelect}>
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
                <option value="vencida">Vencida</option>
              </select>
            </div>
            <div className={styles.filterItem}>
              <Button type="submit" variant="secondary" size="sm">Filtrar</Button>
            </div>
          </form>
        </div>
      </Card>

      {cotizaciones.length === 0 ? (
        <Card>
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No se encontraron cotizaciones
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className={styles.tableWrap}>
            <Table>
              <Thead>
                <Tr>
                  <Th># Cotizacion</Th>
                  <Th>Fecha</Th>
                  <Th>Cliente</Th>
                  <Th>Placa</Th>
                  <Th>Monto total</Th>
                  <Th>Vigencia</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cotizaciones.map((c) => {
                  const cliente = c.clientes as Record<string, string> | null;
                  const vehiculo = c.vehiculos as Record<string, string> | null;
                  return (
                    <Tr key={c.id}>
                      <Td>{c.numero}</Td>
                      <Td>{c.created_at ? new Date(c.created_at).toLocaleDateString('es-DO') : '-'}</Td>
                      <Td>{cliente?.nombre ?? '-'}</Td>
                      <Td>{vehiculo?.placa ?? '-'}</Td>
                      <Td className={styles.montoCell}>{formatMoney(Number(c.total))}</Td>
                      <Td><VigenciaLabel dias={c.vigencia_dias_restantes} /></Td>
                      <Td>
                        <Badge variant={estadoBadge[c.estado]?.variant}>{estadoBadge[c.estado]?.label}</Badge>
                      </Td>
                      <Td>
                        <div className={styles.actions}>
                          <Link href={`/cotizaciones/${c.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                          <Link href={`/cotizaciones/${c.id}?print=1`}>
                            <Button variant="ghost" size="sm">PDF</Button>
                          </Link>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className={styles.mobileCards}>
            {cotizaciones.map((c) => {
              const cliente = c.clientes as Record<string, string> | null;
              const vehiculo = c.vehiculos as Record<string, string> | null;
              return (
                <Card key={c.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileCardNumber}>{c.numero}</span>
                    <Badge variant={estadoBadge[c.estado]?.variant}>{estadoBadge[c.estado]?.label}</Badge>
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div><strong>{cliente?.nombre ?? '-'}</strong> - {vehiculo?.placa ?? '-'}</div>
                    <div>{c.created_at ? new Date(c.created_at).toLocaleDateString('es-DO') : '-'} | <VigenciaLabel dias={c.vigencia_dias_restantes} /></div>
                    <div><strong>{formatMoney(Number(c.total))}</strong></div>
                  </div>
                  <div className={styles.mobileCardFooter}>
                    <Link href={`/cotizaciones/${c.id}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                    <Link href={`/cotizaciones/${c.id}?print=1`}>
                      <Button variant="ghost" size="sm">PDF</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
