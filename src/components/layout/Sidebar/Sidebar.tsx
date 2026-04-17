'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  LogIn,
  FileText,
  ClipboardList,
  Receipt,
  CreditCard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/vehiculos', label: 'Vehículos', icon: Car },
  { href: '/entradas', label: 'Entradas activas', icon: LogIn },
  { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/ordenes', label: 'Órdenes de trabajo', icon: ClipboardList },
  { href: '/facturas', label: 'Facturas', icon: Receipt },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Car size={28} />
          {!collapsed && <span className={styles.logoText}>SGT</span>}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar} />
          {!collapsed && (
            <div className={styles.userText}>
              <span className={styles.userName}>Administrador</span>
              <span className={styles.userRole}>admin</span>
            </div>
          )}
        </div>
        <button className={styles.navItem} title={collapsed ? 'Cerrar sesión' : undefined}>
          <LogOut size={20} />
          {!collapsed && <span className={styles.navLabel}>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
