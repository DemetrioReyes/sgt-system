import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Car } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import styles from '../../cotizacion/[id]/publico.module.css';

function formatMoney(n: number) {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

export default async function FacturaPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: factura } = await supabase
    .from('facturas')
    .select('*, clientes(nombre, telefono), vehiculos(placa, marca, modelo, ano)')
    .eq('id', id)
    .single();

  if (!factura) notFound();

  const { data: items } = await supabase
    .from('factura_items')
    .select('*')
    .eq('factura_id', id);

  const f = factura;
  const cliente = f.clientes as { nombre: string } | null;
  const vehiculo = f.vehiculos as { placa: string; marca: string; modelo: string; ano?: number } | null;
  const listaItems = (items || []) as { id: string; tipo: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];

  const subtotal = Number(f.subtotal ?? 0);
  const descuento = Number(f.descuento ?? 0);
  const itbis = Number(f.itbis ?? 0);
  const total = Number(f.total ?? 0);
  const pagado = Number(f.total_pagado ?? 0);
  const saldo = Number(f.saldo_pendiente ?? 0);

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}><Car size={32} /></div>
          <h1 className={styles.tallerName}>SGT Taller</h1>
        </div>

        <div className={styles.greeting}>
          <p>Factura para <strong>{cliente?.nombre || 'Cliente'}</strong></p>
        </div>

        <Card padding="md">
          <CardContent>
            <div className={styles.cotizacionHeader}>
              <span className={styles.cotizacionNum}>{f.numero}</span>
              <Badge variant={f.estado === 'pagada' ? 'success' : f.estado === 'anulada' ? 'danger' : 'warning'}>
                {f.estado === 'pagada' ? 'Pagada' : f.estado === 'parcial' ? 'Pago parcial' : f.estado === 'anulada' ? 'Anulada' : 'Pendiente de pago'}
              </Badge>
            </div>
            {f.ncf && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>NCF: {f.ncf}</p>}
            {f.fecha && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Fecha: {new Date(f.fecha).toLocaleDateString('es-DO')}</p>}
          </CardContent>
        </Card>

        {vehiculo && (
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Vehículo</h2>
              <p className={styles.vehiculoInfo}>
                <strong>{vehiculo.placa}</strong> — {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano || ''}
              </p>
            </CardContent>
          </Card>
        )}

        <Card padding="md">
          <CardContent>
            <h2 className={styles.cardTitle}>Detalle de servicios</h2>
            <div className={styles.itemsList}>
              {listaItems.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <Badge variant={item.tipo === 'servicio' ? 'info' : 'warning'}>
                      {item.tipo === 'servicio' ? 'Servicio' : 'Repuesto'}
                    </Badge>
                    <span className={styles.itemDesc}>{item.descripcion}</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span>{item.cantidad} x {formatMoney(item.precio_unitario)}</span>
                    <strong>{formatMoney(item.subtotal)}</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totals}>
              <div className={styles.totalRow}><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
              {descuento > 0 && <div className={styles.totalRow}><span>Descuento</span><span>-{formatMoney(descuento)}</span></div>}
              <div className={styles.totalRow}><span>ITBIS (18%)</span><span>{formatMoney(itbis)}</span></div>
              <div className={styles.totalGrand}><span>Total</span><span>{formatMoney(total)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de pago */}
        <Card padding="md">
          <CardContent>
            <h2 className={styles.cardTitle}>Estado de pago</h2>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '100%', height: '10px', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: total > 0 ? `${(pagado / total) * 100}%` : '0%', background: 'var(--color-success)', borderRadius: 'var(--radius-full)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                <span>Pagado: {formatMoney(pagado)}</span>
                <span>Pendiente: <strong style={{ color: saldo > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatMoney(saldo)}</strong></span>
              </div>
            </div>
            {saldo <= 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem' }}>✅</span>
                <p style={{ fontWeight: 'var(--font-semibold)', marginTop: 'var(--space-2)' }}>Factura pagada en su totalidad</p>
              </div>
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Para realizar el pago, comuníquese con el taller.
              </p>
            )}
          </CardContent>
        </Card>

        <p className={styles.footer}>SGT — Sistema de Gestión de Taller</p>
      </div>
    </div>
  );
}
