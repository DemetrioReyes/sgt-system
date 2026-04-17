import Link from 'next/link';
import { Button, Badge, Card, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import { getPagos } from '@/lib/actions/pagos';
import styles from './pagos.module.css';

const metodoBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  efectivo: { variant: 'success', label: 'Efectivo' },
  transferencia: { variant: 'info', label: 'Transferencia' },
  tarjeta: { variant: 'default', label: 'Tarjeta' },
  cheque: { variant: 'warning', label: 'Cheque' },
};

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO')}`;
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; metodo?: string }>;
}) {
  const { q, metodo } = await searchParams;
  const result = await getPagos(q, metodo);
  const pagos = result.data ?? [];

  const totalGeneral = pagos.reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const totalEfectivo = pagos.filter((p) => p.metodo === 'efectivo').reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const totalTransferencia = pagos.filter((p) => p.metodo === 'transferencia').reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const totalTarjeta = pagos.filter((p) => p.metodo === 'tarjeta').reduce((s, p) => s + Number(p.monto ?? 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Pagos recibidos</h1>
        <Link href="/pagos/nuevo">
          <Button>+ Registrar pago</Button>
        </Link>
      </div>

      <div className={styles.kpiRow}>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totalGeneral)}</div>
          <div className={styles.kpiLabel}>Total</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totalEfectivo)}</div>
          <div className={styles.kpiLabel}>Efectivo</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totalTransferencia)}</div>
          <div className={styles.kpiLabel}>Transferencia</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totalTarjeta)}</div>
          <div className={styles.kpiLabel}>Tarjeta</div>
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
                placeholder="Buscar recibo, referencia..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterItem}>
              <select name="metodo" defaultValue={metodo ?? ''} className={styles.filterSelect}>
                <option value="">Todos los metodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className={styles.filterItem}>
              <Button type="submit" variant="secondary" size="sm">Filtrar</Button>
            </div>
          </form>
        </div>
      </Card>

      {pagos.length === 0 ? (
        <Card>
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No se encontraron pagos
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className={styles.tableWrap}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th># Recibo</Th>
                  <Th>Cliente</Th>
                  <Th># Factura</Th>
                  <Th>Monto</Th>
                  <Th>Metodo</Th>
                  <Th>Referencia</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagos.map((p) => {
                  const cliente = p.clientes as Record<string, string> | null;
                  const factura = p.facturas as Record<string, string> | null;
                  return (
                    <Tr key={p.id}>
                      <Td>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-DO') : '-'}</Td>
                      <Td>{p.numero}</Td>
                      <Td>{cliente?.nombre ?? '-'}</Td>
                      <Td>{factura?.numero ?? '-'}</Td>
                      <Td className={styles.montoCell}>{formatMoney(Number(p.monto))}</Td>
                      <Td>
                        <Badge variant={metodoBadge[p.metodo]?.variant}>{metodoBadge[p.metodo]?.label}</Badge>
                      </Td>
                      <Td>{p.referencia ?? '-'}</Td>
                      <Td>
                        <div className={styles.actions}>
                          <Button variant="ghost" size="sm">Ver</Button>
                          <Button variant="ghost" size="sm">Imprimir</Button>
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
            {pagos.map((p) => {
              const cliente = p.clientes as Record<string, string> | null;
              const factura = p.facturas as Record<string, string> | null;
              return (
                <Card key={p.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileCardNumber}>{p.numero}</span>
                    <Badge variant={metodoBadge[p.metodo]?.variant}>{metodoBadge[p.metodo]?.label}</Badge>
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div><strong>{cliente?.nombre ?? '-'}</strong></div>
                    <div>Factura: {factura?.numero ?? '-'} | {p.fecha ? new Date(p.fecha).toLocaleDateString('es-DO') : '-'}</div>
                    <div><strong>{formatMoney(Number(p.monto))}</strong> | Ref: {p.referencia ?? '-'}</div>
                  </div>
                  <div className={styles.mobileCardFooter}>
                    <Button variant="ghost" size="sm">Ver</Button>
                    <Button variant="ghost" size="sm">Imprimir</Button>
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
