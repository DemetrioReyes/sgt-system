import Link from 'next/link';
import { Button, Badge, Card, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import { getFacturas, getFacturasTotals } from '@/lib/actions/facturas';
import styles from './facturas.module.css';

const estadoBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  parcial: { variant: 'info', label: 'Parcial' },
  pagada: { variant: 'success', label: 'Pagada' },
  anulada: { variant: 'danger', label: 'Anulada' },
};

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO')}`;
}

export default async function FacturasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const [facturasResult, totalsResult] = await Promise.all([
    getFacturas(q, estado),
    getFacturasTotals(),
  ]);

  const facturas = facturasResult.data ?? [];
  const totals = totalsResult.data ?? { totalFacturado: 0, porCobrar: 0, cobradas: 0, anuladas: 0 };

  const sumTotal = facturas.reduce((s, f) => s + Number(f.total ?? 0), 0);
  const sumPagado = facturas.reduce((s, f) => s + Number(f.total_pagado ?? 0), 0);
  const sumSaldo = facturas.reduce((s, f) => s + Number(f.saldo_pendiente ?? 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Facturas</h1>
        <Link href="/facturas/nueva"><Button>+ Nueva factura</Button></Link>
      </div>

      <div className={styles.kpiRow}>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totals.totalFacturado)}</div>
          <div className={styles.kpiLabel}>Total facturado</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totals.porCobrar)}</div>
          <div className={styles.kpiLabel}>Por cobrar</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{totals.cobradas}</div>
          <div className={styles.kpiLabel}>Cobradas</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{totals.anuladas}</div>
          <div className={styles.kpiLabel}>Anuladas</div>
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
                placeholder="Buscar # factura, NCF..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterItem}>
              <select name="estado" defaultValue={estado ?? ''} className={styles.filterSelect}>
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcialmente pagada</option>
                <option value="pagada">Pagada</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
            <div className={styles.filterItem}>
              <Button type="submit" variant="secondary" size="sm">Filtrar</Button>
            </div>
          </form>
        </div>
      </Card>

      {facturas.length === 0 ? (
        <Card>
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No se encontraron facturas
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className={styles.tableWrap}>
            <Table>
              <Thead>
                <Tr>
                  <Th># Factura</Th>
                  <Th>NCF</Th>
                  <Th>Fecha</Th>
                  <Th>Cliente</Th>
                  <Th>Placa</Th>
                  <Th>Subtotal</Th>
                  <Th>ITBIS</Th>
                  <Th>Total</Th>
                  <Th>Pagado</Th>
                  <Th>Saldo</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {facturas.map((f) => {
                  const cliente = f.clientes as Record<string, string> | null;
                  const vehiculo = f.vehiculos as Record<string, string> | null;
                  const saldo = Number(f.saldo_pendiente ?? 0);
                  const pagado = Number(f.total_pagado ?? 0);
                  return (
                    <Tr key={f.id}>
                      <Td>{f.numero}</Td>
                      <Td>{f.ncf ?? '-'}</Td>
                      <Td>{f.fecha ? new Date(f.fecha).toLocaleDateString('es-DO') : '-'}</Td>
                      <Td>{cliente?.nombre ?? '-'}</Td>
                      <Td>{vehiculo?.placa ?? '-'}</Td>
                      <Td className={styles.montoCell}>{formatMoney(Number(f.subtotal))}</Td>
                      <Td className={styles.montoCell}>{formatMoney(Number(f.itbis))}</Td>
                      <Td className={styles.montoCell}>{formatMoney(Number(f.total))}</Td>
                      <Td className={styles.montoCell}>{formatMoney(pagado)}</Td>
                      <Td className={saldo > 0 ? styles.saldoPositive : styles.saldoZero}>
                        {formatMoney(saldo)}
                      </Td>
                      <Td>
                        <Badge variant={estadoBadge[f.estado]?.variant}>{estadoBadge[f.estado]?.label}</Badge>
                      </Td>
                      <Td>
                        <div className={styles.actions}>
                          <Link href={`/facturas/${f.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
                          <Link href={`/facturas/${f.id}?print=1`}><Button variant="ghost" size="sm">PDF</Button></Link>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
                <Tr className={styles.totalsRow}>
                  <Td colSpan={7}><strong>Totales</strong></Td>
                  <Td className={styles.montoCell}><strong>{formatMoney(sumTotal)}</strong></Td>
                  <Td className={styles.montoCell}><strong>{formatMoney(sumPagado)}</strong></Td>
                  <Td className={styles.saldoPositive}><strong>{formatMoney(sumSaldo)}</strong></Td>
                  <Td colSpan={2}></Td>
                </Tr>
              </Tbody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className={styles.mobileCards}>
            {facturas.map((f) => {
              const cliente = f.clientes as Record<string, string> | null;
              const vehiculo = f.vehiculos as Record<string, string> | null;
              const saldo = Number(f.saldo_pendiente ?? 0);
              const pagado = Number(f.total_pagado ?? 0);
              return (
                <Card key={f.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileCardNumber}>{f.numero}</span>
                    <Badge variant={estadoBadge[f.estado]?.variant}>{estadoBadge[f.estado]?.label}</Badge>
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div><strong>{cliente?.nombre ?? '-'}</strong> - {vehiculo?.placa ?? '-'}</div>
                    <div>NCF: {f.ncf ?? '-'} | {f.fecha ? new Date(f.fecha).toLocaleDateString('es-DO') : '-'}</div>
                    <div>Total: <strong>{formatMoney(Number(f.total))}</strong> | Pagado: {formatMoney(pagado)}</div>
                    <div>Saldo: <span className={saldo > 0 ? styles.saldoPositive : styles.saldoZero}>{formatMoney(saldo)}</span></div>
                  </div>
                  <div className={styles.mobileCardFooter}>
                    <Link href={`/facturas/${f.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
                    <Link href={`/facturas/${f.id}?print=1`}><Button variant="ghost" size="sm">PDF</Button></Link>
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
