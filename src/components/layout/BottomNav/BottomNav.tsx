'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  FileText,
  Receipt,
  Menu,
  X,
  Users,
  LogIn,
  ClipboardList,
  CreditCard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import styles from './BottomNav.module.css';

const mainNavItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/vehiculos', label: 'Vehículos', icon: Car },
  { href: '/cotizaciones', label: 'Cotizar', icon: FileText },
  { href: '/facturas', label: 'Facturar', icon: Receipt },
];

const moreMenuItems = [
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/entradas', label: 'Entradas', icon: LogIn },
  { href: '/ordenes', label: 'Órdenes de trabajo', icon: ClipboardList },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
  { href: '/perfil', label: 'Mi perfil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {moreOpen && (
        <div className={styles.overlay}>
          <div className={styles.overlayHeader}>
            <span className={styles.overlayTitle}>Menú</span>
            <button
              className={styles.closeBtn}
              onClick={() => setMoreOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>
          <nav className={styles.overlayNav}>
            {moreMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.overlayItem} ${pathname === item.href ? styles.overlayItemActive : ''}`}
                  onClick={() => setMoreOpen(false)}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              className={styles.overlayItem}
              onClick={() => setMoreOpen(false)}
            >
              <LogOut size={22} />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>
      )}

      <nav className={styles.bottomNav}>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={22} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
        <button
          className={`${styles.navItem} ${moreOpen ? styles.active : ''}`}
          onClick={() => setMoreOpen(!moreOpen)}
        >
          <Menu size={22} />
          <span className={styles.label}>Más</span>
        </button>
      </nav>
    </>
  );
}
