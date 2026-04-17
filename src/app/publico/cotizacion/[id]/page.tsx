import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Car } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import AccionesCliente from './acciones-cliente';
import styles from './publico.module.css';

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

export default async function CotizacionPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cotizacion } = await supabase
    .from('cotizaciones')
    .select('*, clientes(nombre, telefono), vehiculos(placa, marca, modelo, ano)')
    .eq('id', id)
    .single();

  if (!cotizacion) notFound();

  const { data: items } = await supabase
    .from('cotizacion_items')
    .select('*')
    .eq('cotizacion_id', id);

  const c = cotizacion;
  const cliente = c.clientes as { nombre: string; telefono?: string } | null;
  const vehiculo = c.vehiculos as { placa: string; marca: string; modelo: string; ano?: number } | null;
  const listaItems = (items || []) as { id: string; tipo: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];

  const subtotal = Number(c.subtotal ?? 0);
  const descuento = Number(c.descuento ?? 0);
  const itbis = Number(c.itbis ?? 0);
  const total = Number(c.total ?? 0);

  const yaRespondio = c.estado === 'aprobada' || c.estado === 'rechazada';

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Car size={32} />
          </div>
          <h1 className={styles.tallerName}>SGT Taller</h1>
        </div>

        <div className={styles.greeting}>
          <p>Cotización para <strong>{cliente?.nombre || 'Cliente'}</strong></p>
        </div>

        {/* Vehiculo */}
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

        {/* Cotizacion info */}
        <Card padding="md">
          <CardContent>
            <div className={styles.cotizacionHeader}>
              <span className={styles.cotizacionNum}>{c.numero}</span>
              <Badge variant={c.estado === 'aprobada' ? 'success' : c.estado === 'rechazada' ? 'danger' : 'info'}>
                {c.estado === 'aprobada' ? 'Aprobada' : c.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
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

            {/* Totales */}
            <div className={styles.totals}>
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
              <div className={styles.totalGrand}>
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        {c.notas_cliente && (
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Notas</h2>
              <p className={styles.notas}>{c.notas_cliente}</p>
            </CardContent>
          </Card>
        )}

        {/* Acciones del cliente */}
        {yaRespondio ? (
          <Card padding="md">
            <CardContent>
              <div className={styles.yaRespondio}>
                {c.estado === 'aprobada' ? (
                  <>
                    <span className={styles.checkIcon}>✅</span>
                    <h2>Cotización aprobada</h2>
                    <p>Gracias por aprobar. Nos pondremos en contacto para coordinar el servicio.</p>
                  </>
                ) : (
                  <>
                    <span className={styles.checkIcon}>❌</span>
                    <h2>Cotización rechazada</h2>
                    <p>Lamentamos que no hayamos podido ayudarte esta vez. Estamos a tu orden.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <AccionesCliente cotizacionId={c.id} />
        )}

        <p className={styles.footer}>SGT — Sistema de Gestión de Taller</p>
      </div>
    </div>
  );
}
