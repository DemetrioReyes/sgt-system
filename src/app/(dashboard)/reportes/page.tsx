import Link from 'next/link';
import { TrendingUp, DollarSign, Wrench, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import styles from './reportes.module.css';

const REPORT_SLUGS: Record<string, string> = {
  'Ventas por periodo': 'ventas-periodo',
  'Ventas por servicio/repuesto': 'ventas-servicio',
  'Top clientes': 'top-clientes',
  'Ticket promedio': 'ticket-promedio',
  'Flujo de caja': 'flujo-caja',
  'Cuentas por cobrar (aging)': 'cuentas-por-cobrar',
  'Ingresos vs egresos': 'ingresos-vs-egresos',
  'Tasa de conversion cotizaciones': 'tasa-conversion',
  'Vehiculos mas atendidos': 'vehiculos-atendidos',
};

const categorias = [
  {
    titulo: 'Ventas',
    icon: TrendingUp,
    colorClass: 'iconBlue',
    reportes: [
      'Ventas por periodo',
      'Ventas por servicio/repuesto',
      'Ventas por mecanico',
      'Top clientes',
      'Ticket promedio',
    ],
  },
  {
    titulo: 'Financieros',
    icon: DollarSign,
    colorClass: 'iconGreen',
    reportes: [
      'Flujo de caja',
      'Estado de resultados',
      'Cuentas por cobrar (aging)',
      'Ingresos vs egresos',
      'Facturacion por tipo de NCF',
    ],
  },
  {
    titulo: 'Operativos',
    icon: Wrench,
    colorClass: 'iconOrange',
    reportes: [
      'Productividad por mecanico',
      'Tiempos de servicio',
      'Tasa de conversion cotizaciones',
      'Vehiculos mas atendidos',
      'Problemas mas frecuentes',
    ],
  },
  {
    titulo: 'Fiscales',
    icon: FileCheck,
    colorClass: 'iconRed',
    reportes: [
      'Reporte ITBIS mensual (DGII)',
      'Reporte de ventas por NCF',
      'Reporte 606/607',
    ],
  },
];

export default function ReportesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reportes</h1>
        <p className={styles.subtitle}>Selecciona un reporte para generar</p>
      </header>

      <div className={styles.grid}>
        {categorias.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.titulo} padding="md">
              <div className={styles.categoryHeader}>
                <div className={`${styles.categoryIcon} ${styles[cat.colorClass]}`}>
                  <Icon size={20} />
                </div>
                <h2 className={styles.categoryTitle}>{cat.titulo}</h2>
              </div>
              <ul className={styles.reportList}>
                {cat.reportes.map((reporte) => {
                  const slug = REPORT_SLUGS[reporte];
                  if (slug) {
                    return (
                      <li key={reporte} className={styles.reportItem}>
                        <Link href={`/reportes/${slug}`} className={styles.reportLink}>
                          {reporte}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={reporte} className={`${styles.reportItem} ${styles.reportItemDisabled}`}>
                      <span>{reporte}</span>
                      <Badge variant="default">Proximamente</Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
