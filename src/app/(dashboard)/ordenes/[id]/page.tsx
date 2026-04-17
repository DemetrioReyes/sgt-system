import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import { getOrden, getMecanicos } from '@/lib/actions/ordenes';
import { getTallerConfig } from '@/lib/actions/configuracion';
import OrdenControles from './orden-controles';
import styles from './orden-detalle.module.css';

const statusBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  en_progreso: { variant: 'info', label: 'En progreso' },
  espera_repuesto: { variant: 'default', label: 'Espera repuesto' },
  completada: { variant: 'success', label: 'Completada' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
};

export default async function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: orden, error }, { data: mecanicos }, tallerConfig] = await Promise.all([
    getOrden(id),
    getMecanicos(),
    getTallerConfig().catch(() => ({ nombre_comercial: 'SGT Taller' })),
  ]);
  const nombreTaller = tallerConfig.nombre_comercial || 'SGT Taller';

  if (error || !orden) notFound();

  const cliente = orden.clientes as { id: string; nombre: string; telefono?: string; email?: string } | null;
  const vehiculo = orden.vehiculos as { id: string; placa: string; marca: string; modelo: string; ano?: number } | null;
  const mecanico = orden.usuarios as { id: string; nombre: string } | null;
  const cotizacion = orden.cotizaciones as { id: string; numero: string; total: number } | null;
  const badge = statusBadge[orden.estado] ?? { variant: 'default' as const, label: orden.estado };

  const fechaInicio = orden.fecha_inicio ? new Date(orden.fecha_inicio) : null;
  const fechaCompletada = orden.fecha_completada ? new Date(orden.fecha_completada) : null;

  return (
    <div className={styles.page}>
      <Link href="/ordenes" className={styles.backLink}>&larr; Volver a órdenes</Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.ordenNum}>{orden.numero}</h1>
          <div className={styles.headerMeta}>
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {vehiculo && <span>{vehiculo.placa} — {vehiculo.marca} {vehiculo.modelo}</span>}
            {cliente && <span>· {cliente.nombre}</span>}
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Columna principal */}
        <div className={styles.mainCol}>
          {/* Controles de estado */}
          <OrdenControles
            ordenId={orden.id}
            estado={orden.estado}
            progreso={orden.progreso ?? 0}
            mecanicoId={mecanico?.id || null}
            mecanicos={mecanicos || []}
            clienteNombre={cliente?.nombre || ''}
            clienteTelefono={cliente?.telefono || ''}
            vehiculoPlaca={vehiculo?.placa || ''}
            nombreTaller={nombreTaller}
          />

          {/* Progreso */}
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Progreso</h2>
              <div className={styles.progressBarBig}>
                <div className={styles.progressFill} style={{ width: `${orden.progreso ?? 0}%` }} />
              </div>
              <span className={styles.progressLabel}>{orden.progreso ?? 0}%</span>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Tiempos</h2>
              <div className={styles.fechasGrid}>
                <div>
                  <span className={styles.fechaLabel}>Fecha de inicio</span>
                  <span className={styles.fechaValue}>{fechaInicio ? fechaInicio.toLocaleDateString('es-DO') : '-'}</span>
                </div>
                <div>
                  <span className={styles.fechaLabel}>Fecha estimada</span>
                  <span className={styles.fechaValue}>{orden.fecha_estimada ? new Date(orden.fecha_estimada).toLocaleDateString('es-DO') : 'Sin definir'}</span>
                </div>
                <div>
                  <span className={styles.fechaLabel}>Completada</span>
                  <span className={styles.fechaValue}>{fechaCompletada ? fechaCompletada.toLocaleDateString('es-DO') : '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          {orden.notas && (
            <Card padding="md">
              <CardContent>
                <h2 className={styles.cardTitle}>Notas</h2>
                <p className={styles.notas}>{orden.notas}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna lateral */}
        <div className={styles.sideCol}>
          {/* Cliente */}
          {cliente && (
            <Card padding="md">
              <CardContent>
                <h2 className={styles.cardTitle}>Cliente</h2>
                <Link href={`/clientes/${cliente.id}`} className={styles.linkPrimary}>{cliente.nombre}</Link>
                {cliente.telefono && <a href={`tel:${cliente.telefono}`} className={styles.linkSecondary}>{cliente.telefono}</a>}
              </CardContent>
            </Card>
          )}

          {/* Vehículo */}
          {vehiculo && (
            <Card padding="md">
              <CardContent>
                <h2 className={styles.cardTitle}>Vehículo</h2>
                <Link href={`/vehiculos/${vehiculo.id}`} className={styles.linkPrimary}>{vehiculo.placa}</Link>
                <span className={styles.vehiculoDesc}>{vehiculo.marca} {vehiculo.modelo} {vehiculo.ano || ''}</span>
              </CardContent>
            </Card>
          )}

          {/* Mecánico */}
          <Card padding="md">
            <CardContent>
              <h2 className={styles.cardTitle}>Mecánico asignado</h2>
              <span className={styles.mecanicoNombre}>{mecanico?.nombre || 'Sin asignar'}</span>
            </CardContent>
          </Card>

          {/* Cotización */}
          {cotizacion && (
            <Card padding="md">
              <CardContent>
                <h2 className={styles.cardTitle}>Cotización</h2>
                <Link href={`/cotizaciones/${cotizacion.id}`} className={styles.linkPrimary}>{cotizacion.numero}</Link>
                <span className={styles.cotizacionTotal}>RD${Number(cotizacion.total).toLocaleString('es-DO')}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
