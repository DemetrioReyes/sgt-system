import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, CardContent, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import { getCotizacion } from '@/lib/actions/cotizaciones';
import styles from './cotizacion-detalle.module.css';
import CotizacionDetalleClient from './detalle-client';

const estadoBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  borrador: { variant: 'default', label: 'Borrador' },
  enviada: { variant: 'info', label: 'Enviada' },
  aprobada: { variant: 'success', label: 'Aprobada' },
  rechazada: { variant: 'danger', label: 'Rechazada' },
  vencida: { variant: 'warning', label: 'Vencida' },
  anulada: { variant: 'danger', label: 'Anulada' },
};

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function CotizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: cotizacion, error } = await getCotizacion(id);

  if (error || !cotizacion) {
    notFound();
  }

  const c = cotizacion;
  const cliente = c.clientes as {
    id: string;
    nombre: string;
    telefono?: string;
    email?: string;
  } | null;
  const vehiculo = c.vehiculos as {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano?: number;
  } | null;
  const items = (c.items ?? []) as {
    id: string;
    tipo: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];

  const fechaEmision = c.created_at ? new Date(c.created_at) : null;
  const vigenciaDias = c.vigencia_dias ?? 30;
  const fechaVencimiento = fechaEmision
    ? new Date(fechaEmision.getTime() + vigenciaDias * 86400000)
    : null;

  const subtotal = Number(c.subtotal ?? 0);
  const descuento = Number(c.descuento ?? 0);
  const itbis = Number(c.itbis ?? 0);
  const total = Number(c.total ?? 0);

  const badge = estadoBadge[c.estado] ?? { variant: 'default' as const, label: c.estado };

  return (
    <div className={styles.page}>
      <Link href="/cotizaciones" className={styles.backLink}>
        &larr; Volver a cotizaciones
      </Link>

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <span className={styles.cotizacionCode}>{c.numero}</span>
            <div className={styles.headerMeta}>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {cliente && <span>{cliente.nombre}</span>}
              {vehiculo && (
                <>
                  <span>&middot;</span>
                  <span>{vehiculo.placa}</span>
                </>
              )}
            </div>
          </div>
          <CotizacionDetalleClient
            cotizacionId={c.id}
            numero={c.numero}
            clienteNombre={cliente?.nombre || ''}
            clienteTelefono={cliente?.telefono || ''}
            vehiculoPlaca={vehiculo?.placa || ''}
            total={total}
          />
        </div>
      </header>

      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.columnStack}>
          {/* Dates */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Fechas</h2>
              <div className={styles.datesRow}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha de emision</span>
                  <span className={styles.infoValue}>
                    {fechaEmision ? fechaEmision.toLocaleDateString('es-DO') : '-'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Vigencia</span>
                  <span className={styles.infoValue}>{vigenciaDias} dias</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha de vencimiento</span>
                  <span className={styles.infoValue}>
                    {fechaVencimiento ? fechaVencimiento.toLocaleDateString('es-DO') : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Items de la cotizacion</h2>

              {items.length === 0 ? (
                <p className={styles.notesText}>No hay items en esta cotizacion.</p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className={styles.desktopTable}>
                    <div className={styles.itemsTableWrap}>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Tipo</Th>
                            <Th>Descripcion</Th>
                            <Th>Cant.</Th>
                            <Th>Precio unit.</Th>
                            <Th>Subtotal</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {items.map((item) => (
                            <Tr key={item.id}>
                              <Td>
                                <Badge variant="info" className={styles.tipoBadge}>
                                  {item.tipo}
                                </Badge>
                              </Td>
                              <Td>{item.descripcion}</Td>
                              <Td>{item.cantidad}</Td>
                              <Td className={styles.montoCell}>{formatMoney(item.precio_unitario)}</Td>
                              <Td className={styles.montoCell}>{formatMoney(item.subtotal)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile items */}
                  <div className={styles.mobileItems}>
                    {items.map((item) => (
                      <div key={item.id} className={styles.mobileItem}>
                        <div className={styles.mobileItemHeader}>
                          <Badge variant="info" className={styles.tipoBadge}>
                            {item.tipo}
                          </Badge>
                          <strong>{formatMoney(item.subtotal)}</strong>
                        </div>
                        <div className={styles.mobileItemDesc}>{item.descripcion}</div>
                        <div className={styles.mobileItemDetail}>
                          <span>{item.cantidad} x {formatMoney(item.precio_unitario)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className={styles.totalsSection}>
                    <div className={styles.totalsGrid}>
                      <div className={styles.totalRow}>
                        <span>Subtotal</span>
                        <span>{formatMoney(subtotal)}</span>
                      </div>
                      {descuento > 0 && (
                        <div className={styles.totalRow}>
                          <span>Descuento</span>
                          <span>-{formatMoney(descuento)}</span>
                        </div>
                      )}
                      <div className={styles.totalRow}>
                        <span>ITBIS (18%)</span>
                        <span>{formatMoney(itbis)}</span>
                      </div>
                      <div className={styles.totalRowGrand}>
                        <span>Total</span>
                        <span>{formatMoney(total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notas cliente */}
          {c.notas_cliente && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Notas para el cliente</h2>
                <p className={styles.notesText}>{c.notas_cliente}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas internas */}
          {c.notas_internas && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Notas internas</h2>
                <p className={styles.notesText}>{c.notas_internas}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className={styles.columnStack}>
          {/* Client info */}
          {cliente && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Cliente</h2>
                <Link
                  href={`/clientes/${cliente.id}`}
                  style={{
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {cliente.nombre}
                </Link>
                {cliente.telefono && (
                  <a
                    href={`tel:${cliente.telefono}`}
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    {cliente.telefono}
                  </a>
                )}
                {cliente.email && (
                  <a
                    href={`mailto:${cliente.email}`}
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    {cliente.email}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vehicle info */}
          {vehiculo && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Vehiculo</h2>
                <Link
                  href={`/vehiculos/${vehiculo.id}`}
                  style={{
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {vehiculo.placa}
                </Link>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                  {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano || ''}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estado */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Estado</h2>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {c.moneda && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                  Moneda: {c.moneda}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
