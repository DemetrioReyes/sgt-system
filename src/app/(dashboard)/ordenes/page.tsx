import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import { getOrdenes } from '@/lib/actions/ordenes';
import styles from './ordenes.module.css';

type Status = 'pendiente' | 'en_progreso' | 'espera_repuesto' | 'completada' | 'cancelada';

const columns: { key: Status; label: string; className: string }[] = [
  { key: 'pendiente', label: 'Pendiente', className: styles.columnPendiente },
  { key: 'en_progreso', label: 'En progreso', className: styles.columnProgreso },
  { key: 'espera_repuesto', label: 'En espera de repuesto', className: styles.columnEspera },
  { key: 'completada', label: 'Completada', className: styles.columnCompletada },
];

const statusBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pendiente: { variant: 'warning', label: 'Pendiente' },
  en_progreso: { variant: 'info', label: 'En progreso' },
  espera_repuesto: { variant: 'default', label: 'Espera repuesto' },
  completada: { variant: 'success', label: 'Completada' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
};

function getIniciales(nombre: string) {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrdenCard({ orden }: { orden: any }) {
  const vehiculo = orden.vehiculos as Record<string, string> | null;
  const cliente = orden.clientes as Record<string, string> | null;
  const mecanico = orden.usuarios as Record<string, string> | null;
  const progreso = orden.progreso ?? 0;

  return (
    <Card className={styles.kanbanCard}>
      <div className={styles.cardOrderId}>{orden.numero}</div>
      <div className={styles.cardVehicle}>
        {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : '-'}
      </div>
      <div className={styles.cardPlaca}>{vehiculo?.placa ?? '-'}</div>
      <div className={styles.cardClient}>{cliente?.nombre ?? '-'}</div>
      <div className={styles.cardFooter}>
        {mecanico ? (
          <div
            className={styles.cardMechanic}
            style={{ background: '#3b82f6' }}
            title={mecanico.nombre}
          >
            {getIniciales(mecanico.nombre)}
          </div>
        ) : (
          <div
            className={styles.cardMechanic}
            style={{ background: '#94a3b8' }}
            title="Sin asignar"
          >
            --
          </div>
        )}
        <div className={styles.cardProgress}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${progreso >= 100 ? styles.progressFillSuccess : ''}`}
              style={{ width: `${Math.min(progreso, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>{progreso}%</span>
        </div>
      </div>
    </Card>
  );
}

export default async function OrdenesPage() {
  const result = await getOrdenes();
  const ordenes = result.data ?? [];

  const getColumnOrders = (status: Status) => ordenes.filter((o) => o.estado === status);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Ordenes de trabajo</h1>
      </div>

      {ordenes.length === 0 ? (
        <Card>
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No hay ordenes de trabajo
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop kanban */}
          <div className={styles.kanban}>
            {columns.map((col) => {
              const orders = getColumnOrders(col.key);
              return (
                <div key={col.key} className={`${styles.kanbanColumn} ${col.className}`}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>{col.label}</span>
                    <span className={styles.columnCount}>{orders.length}</span>
                  </div>
                  {orders.map((orden) => (
                    <Link key={orden.id} href={`/ordenes/${orden.id}`} style={{ textDecoration: 'none' }}>
                      <OrdenCard orden={orden} />
                    </Link>
                  ))}
                  {orders.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', padding: 'var(--space-8) 0' }}>
                      Sin ordenes
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile list */}
          <div className={styles.mobileList}>
            {ordenes.map((orden) => (
              <Link key={orden.id} href={`/ordenes/${orden.id}`} style={{ textDecoration: 'none' }}>
                <div className={styles.mobileCardStatus}>
                  <Badge variant={statusBadge[orden.estado]?.variant ?? 'default'}>
                    {statusBadge[orden.estado]?.label ?? orden.estado}
                  </Badge>
                </div>
                <OrdenCard orden={orden} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
