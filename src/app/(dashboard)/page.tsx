import Link from 'next/link';
import {
  Car,
  Receipt,
  TrendingUp,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDashboardStats } from '@/lib/actions/dashboard';
import styles from './page.module.css';

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO')}`;
}

const estadoColor: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  'recibido': 'info',
  'en_diagnostico': 'warning',
  'diagnostico': 'warning',
  'cotizado': 'info',
  'aprobado': 'success',
  'en_reparacion': 'warning',
  'reparacion': 'warning',
  'listo': 'success',
  'entregado': 'default',
};

const estadoLabel: Record<string, string> = {
  'recibido': 'Recibido',
  'en_diagnostico': 'En diagnostico',
  'diagnostico': 'En diagnostico',
  'cotizado': 'Cotizado',
  'aprobado': 'Aprobado',
  'en_reparacion': 'En reparacion',
  'reparacion': 'En reparacion',
  'listo': 'Listo',
  'entregado': 'Entregado',
};

export default async function DashboardPage() {
  const result = await getDashboardStats();

  const stats = result.data ?? {
    vehiculosEnTaller: 0,
    porCobrar: 0,
    cotizacionesPendientes: 0,
    ingresosMes: 0,
    entradas: [],
    cotizaciones: [],
  };

  const kpis = [
    {
      label: 'Ingresos del mes',
      value: formatMoney(stats.ingresosMes),
      icon: TrendingUp,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
    },
    {
      label: 'Por cobrar',
      value: formatMoney(stats.porCobrar),
      icon: Receipt,
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-light)',
    },
    {
      label: 'Cotizaciones pendientes',
      value: String(stats.cotizacionesPendientes),
      icon: FileText,
      color: 'var(--color-info, var(--color-primary))',
      bg: 'var(--color-info-light, var(--color-primary-light))',
    },
    {
      label: 'Vehiculos en taller',
      value: String(stats.vehiculosEnTaller),
      icon: Car,
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-light)',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen general del taller</p>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} padding="md">
              <CardContent>
                <div className={styles.kpiCard}>
                  <div
                    className={styles.kpiIcon}
                    style={{ backgroundColor: kpi.bg, color: kpi.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiValue}>{kpi.value}</span>
                    <span className={styles.kpiLabel}>{kpi.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen operativo */}
      <div className={styles.twoColumns}>
        {/* Vehiculos en taller */}
        <Card padding="lg">
          <CardContent>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Vehiculos en taller</h2>
              <Link href="/entradas" className={styles.viewAll}>
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            {stats.entradas.length === 0 ? (
              <p className={styles.emptyState}>No hay vehiculos en taller</p>
            ) : (
              <div className={styles.vehiculoList}>
                {stats.entradas.map((v: Record<string, unknown>, i: number) => {
                  const vehiculo = v.vehiculos as Record<string, string> | null;
                  const cliente = v.clientes as Record<string, string> | null;
                  const mecanico = v.usuarios as Record<string, string> | null;
                  const est = v.estado as string;
                  return (
                    <div key={i} className={styles.vehiculoItem}>
                      <div className={styles.vehiculoMain}>
                        <span className={styles.vehiculoPlaca}>{vehiculo?.placa ?? '-'}</span>
                        <span className={styles.vehiculoCliente}>{cliente?.nombre ?? '-'}</span>
                      </div>
                      <div className={styles.vehiculoMeta}>
                        <Badge variant={estadoColor[est] || 'default'}>
                          {estadoLabel[est] || est}
                        </Badge>
                      </div>
                      <span className={styles.vehiculoMecanico}>{mecanico?.nombre ?? 'Sin asignar'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cotizaciones pendientes */}
        <Card padding="lg">
          <CardContent>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Cotizaciones pendientes</h2>
              <Link href="/cotizaciones" className={styles.viewAll}>
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
            {stats.cotizaciones.length === 0 ? (
              <p className={styles.emptyState}>No hay cotizaciones pendientes</p>
            ) : (
              <div className={styles.cotizacionList}>
                {stats.cotizaciones.map((c: Record<string, unknown>) => {
                  const cliente = c.clientes as Record<string, string> | null;
                  return (
                    <div key={c.id as string} className={styles.cotizacionItem}>
                      <div className={styles.cotizacionMain}>
                        <span className={styles.cotizacionNum}>{c.numero as string}</span>
                        <span className={styles.cotizacionCliente}>{cliente?.nombre ?? '-'}</span>
                      </div>
                      <div className={styles.cotizacionMeta}>
                        <span className={styles.cotizacionMonto}>{formatMoney(Number(c.total))}</span>
                        <span className={styles.cotizacionDias}>{c.dias_restantes as number} dias</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline placeholder */}
      <Card padding="lg">
        <CardContent>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Actividad reciente</h2>
          </div>
          <div className={styles.timeline}>
            <p className={styles.emptyState}>Proximamente: linea de tiempo de actividad</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
