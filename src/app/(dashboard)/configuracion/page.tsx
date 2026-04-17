import Link from 'next/link';
import {
  Building2,
  Users,
  Receipt,
  Wrench,
  Package,
  FileText,
  Bell,
  Link as LinkIcon,
  Shield,
  Database,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import styles from './configuracion.module.css';

const secciones = [
  {
    icon: Building2,
    titulo: 'Informacion del taller',
    descripcion: 'Logo, nombre, RNC, direccion, horarios',
    href: '/configuracion/taller',
  },
  {
    icon: Users,
    titulo: 'Usuarios y permisos',
    descripcion: 'Gestionar usuarios, roles e invitaciones',
    href: '/configuracion/usuarios',
  },
  {
    icon: Receipt,
    titulo: 'Facturacion electronica (NCF)',
    descripcion: 'Secuencias, ITBIS, comprobantes',
    href: '/configuracion/ncf',
  },
  {
    icon: Wrench,
    titulo: 'Catalogo de servicios',
    descripcion: 'Servicios ofrecidos y precios',
    href: '/configuracion/servicios',
  },
  {
    icon: Package,
    titulo: 'Catalogo de repuestos',
    descripcion: 'Inventario, proveedores, precios',
    href: '/configuracion/repuestos',
  },
  {
    icon: FileText,
    titulo: 'Plantillas de documentos',
    descripcion: 'Cotizaciones, facturas, recibos',
    href: null,
  },
  {
    icon: Bell,
    titulo: 'Notificaciones',
    descripcion: 'Alertas automaticas, WhatsApp, email',
    href: null,
  },
  {
    icon: LinkIcon,
    titulo: 'Integraciones',
    descripcion: 'WhatsApp Business, email, pasarelas',
    href: null,
  },
  {
    icon: Shield,
    titulo: 'Seguridad',
    descripcion: 'Contrasenas, MFA, auditoria',
    href: null,
  },
  {
    icon: Database,
    titulo: 'Respaldo de datos',
    descripcion: 'Backups, exportacion de datos',
    href: null,
  },
];

export default function ConfiguracionPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configuracion</h1>
        <p className={styles.subtitle}>Solo administradores</p>
      </header>

      <div className={styles.grid}>
        {secciones.map((seccion) => {
          const Icon = seccion.icon;
          const cardContent = (
            <Card padding="md" className={`${styles.configCard} ${!seccion.href ? styles.configCardDisabled : ''}`}>
              <div className={styles.configIcon}>
                <Icon size={22} />
              </div>
              <div className={styles.configInfo}>
                <h3 className={styles.configTitle}>
                  {seccion.titulo}
                  {!seccion.href && (
                    <span className={styles.proximamente}>Proximamente</span>
                  )}
                </h3>
                <p className={styles.configDesc}>{seccion.descripcion}</p>
              </div>
            </Card>
          );

          if (seccion.href) {
            return (
              <Link href={seccion.href} key={seccion.titulo} style={{ textDecoration: 'none' }}>
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={seccion.titulo}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
