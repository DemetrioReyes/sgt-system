import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button, Card, CardContent, Tabs } from '@/components/ui';
import { getVehiculo } from '@/lib/actions/vehiculos';
import { createClient } from '@/lib/supabase/server';
import styles from './detalle.module.css';

export default async function VehiculoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: vehiculo, error } = await getVehiculo(id);

  if (error || !vehiculo) {
    notFound();
  }

  const v = vehiculo;
  const cliente = v.clientes as { id: string; nombre: string; telefono: string; email: string } | null;

  // Fetch entradas for this vehicle
  const supabase = await createClient();
  const { data: entradas } = await supabase
    .from('entradas_vehiculo')
    .select('id, numero, estado, fecha_entrada, descripcion_problema')
    .eq('vehiculo_id', id)
    .order('fecha_entrada', { ascending: false });

  // Determine estado from active entries
  const { data: entradasActivas } = await supabase
    .from('entradas_vehiculo')
    .select('vehiculo_id, estado')
    .eq('vehiculo_id', id)
    .in('estado', ['recibido', 'en_diagnostico', 'en_reparacion']);

  const enTaller = (entradasActivas?.length || 0) > 0;
  const estado = enTaller ? 'En taller' : 'Fuera';

  const estadoLabels: Record<string, string> = {
    recibido: 'Recibido',
    en_diagnostico: 'En diagnostico',
    cotizado: 'Cotizado',
    aprobado: 'Aprobado',
    en_reparacion: 'En reparacion',
    listo: 'Listo',
    entregado: 'Entregado',
  };

  const tabs = [
    {
      id: 'historial',
      label: 'Historial de entradas',
      content:
        entradas && entradas.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {entradas.map((e) => (
              <Link
                key={e.id}
                href={`/entradas/${e.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                    {e.numero}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {e.fecha_entrada
                      ? new Date(e.fecha_entrada).toLocaleDateString('es-DO')
                      : ''}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    {e.descripcion_problema?.slice(0, 80)}
                    {(e.descripcion_problema?.length || 0) > 80 ? '...' : ''}
                  </div>
                </div>
                <Badge>{estadoLabels[e.estado] || e.estado}</Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.tabPlaceholder}>
            No hay entradas registradas para este vehiculo.
          </div>
        ),
    },
    {
      id: 'mantenimientos',
      label: 'Mantenimientos',
      content: (
        <div className={styles.tabPlaceholder}>
          No hay mantenimientos programados.
        </div>
      ),
    },
    {
      id: 'facturas',
      label: 'Facturas',
      content: (
        <div className={styles.tabPlaceholder}>
          No hay facturas asociadas.
        </div>
      ),
    },
    {
      id: 'documentos',
      label: 'Documentos',
      content: (
        <div className={styles.tabPlaceholder}>
          No hay documentos adjuntos.
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Link href="/vehiculos" className={styles.backLink}>
        &larr; Volver a vehiculos
      </Link>

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className={styles.placa}>{v.placa}</span>
              <Badge variant={estado === 'En taller' ? 'warning' : 'success'}>
                {estado}
              </Badge>
            </div>
            <span className={styles.subtitle}>
              {v.marca} {v.modelo} {v.ano || ''}
            </span>
          </div>
          <div className={styles.headerActions}>
            <Link href={`/entradas/nueva?vehiculo_id=${v.id}&cliente_id=${cliente?.id || ''}`}>
              <Button size="sm">Nueva entrada</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Vehicle info card */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Informacion del vehiculo</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Placa</span>
                  <span className={styles.infoValue}>{v.placa}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>VIN</span>
                  <span className={styles.infoValue}>{v.vin || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Marca</span>
                  <span className={styles.infoValue}>{v.marca}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Modelo</span>
                  <span className={styles.infoValue}>{v.modelo}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ano</span>
                  <span className={styles.infoValue}>{v.ano || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Color</span>
                  <span className={styles.infoValue}>{v.color || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Combustible</span>
                  <span className={styles.infoValue}>{v.combustible || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Transmision</span>
                  <span className={styles.infoValue}>{v.transmision || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Kilometraje</span>
                  <span className={styles.infoValue}>
                    {v.kilometraje ? v.kilometraje.toLocaleString('es-DO') + ' km' : '-'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cilindraje</span>
                  <span className={styles.infoValue}>{v.cilindraje || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs tabs={tabs} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Owner card */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Dueno</h2>
              {cliente ? (
                <>
                  <Link href={`/clientes/${cliente.id}`} className={styles.ownerName}>
                    {cliente.nombre}
                  </Link>
                  {cliente.telefono && (
                    <a href={`tel:${cliente.telefono}`} className={styles.ownerPhone}>
                      {cliente.telefono}
                    </a>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Sin cliente asignado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {v.notas && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Notas</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {v.notas}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
