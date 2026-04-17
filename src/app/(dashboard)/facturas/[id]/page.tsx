import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, Badge, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import { getFactura } from '@/lib/actions/facturas';
import { getTallerConfig } from '@/lib/actions/configuracion';
import FacturaAcciones from './factura-acciones';
import styles from './factura-detalle.module.css';

const estadoBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  parcial: { variant: 'info', label: 'Parcial' },
  pagada: { variant: 'success', label: 'Pagada' },
  anulada: { variant: 'danger', label: 'Anulada' },
};

function formatMoney(n: number) {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: factura, error }, tallerConfig] = await Promise.all([
    getFactura(id),
    getTallerConfig().catch(() => ({ nombre_comercial: 'SGT Taller' })),
  ]);
  const nombreTaller = tallerConfig.nombre_comercial || 'SGT Taller';

  if (error || !factura) notFound();

  const f = factura;
  const cliente = f.clientes as { id: string; nombre: string; telefono?: string; email?: string; cedula_rnc?: string } | null;
  const vehiculo = f.vehiculos as { id: string; placa: string; marca: string; modelo: string } | null;
  const items = (f.items ?? []) as { id: string; tipo: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];

  const subtotal = Number(f.subtotal ?? 0);
  const descuento = Number(f.descuento ?? 0);
  const itbis = Number(f.itbis ?? 0);
  const total = Number(f.total ?? 0);
  const pagado = Number(f.total_pagado ?? 0);
  const saldo = Number(f.saldo_pendiente ?? 0);
  const badge = estadoBadge[f.estado] ?? { variant: 'default' as const, label: f.estado };

  return (
    <div className={styles.page}>
      <Link href="/facturas" className={styles.backLink}>&larr; Volver a facturas</Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.facturaNum}>{f.numero}</h1>
          <div className={styles.headerMeta}>
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {f.ncf && <span>NCF: {f.ncf}</span>}
            {f.tipo_ncf && <span>({f.tipo_ncf})</span>}
          </div>
        </div>
        <FacturaAcciones
          facturaId={f.id}
          estado={f.estado}
          saldo={saldo}
          clienteNombre={cliente?.nombre || ''}
          clienteTelefono={cliente?.telefono || ''}
          vehiculoPlaca={vehiculo?.placa || ''}
          total={total}
          nombreTaller={nombreTaller}
        />
      </header>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {/* Info fiscal */}
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Información fiscal</h2>
              <div className={styles.infoGrid}>
                <div><span className={styles.label}>Fecha emisión</span><span>{f.fecha ? new Date(f.fecha).toLocaleDateString('es-DO') : '-'}</span></div>
                <div><span className={styles.label}>NCF</span><span>{f.ncf || 'Sin NCF'}</span></div>
                <div><span className={styles.label}>Tipo</span><span>{f.tipo_ncf || '-'}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Detalle</h2>
              {items.length === 0 ? (
                <p className={styles.empty}>Sin ítems</p>
              ) : (
                <>
                  <div className={styles.desktopTable}>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Tipo</Th>
                          <Th>Descripción</Th>
                          <Th>Cant.</Th>
                          <Th>Precio unit.</Th>
                          <Th>Subtotal</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {items.map((item) => (
                          <Tr key={item.id}>
                            <Td><Badge variant={item.tipo === 'servicio' ? 'info' : 'warning'}>{item.tipo}</Badge></Td>
                            <Td>{item.descripcion}</Td>
                            <Td>{item.cantidad}</Td>
                            <Td className={styles.monto}>{formatMoney(item.precio_unitario)}</Td>
                            <Td className={styles.monto}>{formatMoney(item.subtotal)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                  <div className={styles.mobileItems}>
                    {items.map((item) => (
                      <div key={item.id} className={styles.mobileItem}>
                        <div className={styles.mobileItemHead}>
                          <Badge variant={item.tipo === 'servicio' ? 'info' : 'warning'}>{item.tipo}</Badge>
                          <strong>{formatMoney(item.subtotal)}</strong>
                        </div>
                        <div className={styles.mobileItemDesc}>{item.descripcion}</div>
                        <div className={styles.mobileItemMeta}>{item.cantidad} x {formatMoney(item.precio_unitario)}</div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.totals}>
                    <div className={styles.totalRow}><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                    {descuento > 0 && <div className={styles.totalRow}><span>Descuento</span><span>-{formatMoney(descuento)}</span></div>}
                    <div className={styles.totalRow}><span>ITBIS (18%)</span><span>{formatMoney(itbis)}</span></div>
                    <div className={styles.totalGrand}><span>Total</span><span>{formatMoney(total)}</span></div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Estado de pago */}
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Estado de pago</h2>
              <div className={styles.pagoProgress}>
                <div className={styles.pagoBar}>
                  <div className={styles.pagoFill} style={{ width: total > 0 ? `${(pagado / total) * 100}%` : '0%' }} />
                </div>
                <div className={styles.pagoInfo}>
                  <span>Pagado: {formatMoney(pagado)}</span>
                  <span>Saldo: <strong className={saldo > 0 ? styles.saldoRojo : ''}>{formatMoney(saldo)}</strong></span>
                </div>
              </div>
              {saldo > 0 && (
                <Link href={`/pagos/nuevo?factura_id=${f.id}`} className={styles.registrarPagoLink}>
                  + Registrar pago
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={styles.sideCol}>
          {cliente && (
            <Card padding="md">
              <CardContent>
                <h2 className={styles.cardTitle}>Cliente</h2>
                <Link href={`/clientes/${cliente.id}`} className={styles.linkPrimary}>{cliente.nombre}</Link>
                {cliente.cedula_rnc && <span className={styles.subtext}>{cliente.cedula_rnc}</span>}
                {cliente.telefono && <a href={`tel:${cliente.telefono}`} className={styles.linkSecondary}>{cliente.telefono}</a>}
              </CardContent>
            </Card>
          )}
          {vehiculo && (
            <Card padding="md">
              <CardContent>
                <h2 className={styles.cardTitle}>Vehículo</h2>
                <Link href={`/vehiculos/${vehiculo.id}`} className={styles.linkPrimary}>{vehiculo.placa}</Link>
                <span className={styles.subtext}>{vehiculo.marca} {vehiculo.modelo}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
