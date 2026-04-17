'use client';

import Link from 'next/link';
import { Search, Bell, Plus } from 'lucide-react';
import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <header className={styles.topBar}>
      {/* Mobile layout */}
      <div className={styles.mobileBar}>
        <span className={styles.pageTitle}>SGT</span>
        <div className={styles.mobileActions}>
          <button className={styles.iconBtn} aria-label="Buscar">
            <Search size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Notificaciones">
            <Bell size={20} />
            <span className={styles.badge}>3</span>
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className={styles.desktopBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por placa, cédula, nombre, # factura..."
          />
        </div>
        <div className={styles.desktopActions}>
          <Link href="/entradas/nueva" className={styles.primaryBtn}>
            <Plus size={18} />
            <span>Nueva entrada</span>
          </Link>
          <button className={styles.iconBtn} aria-label="Notificaciones">
            <Bell size={20} />
            <span className={styles.badge}>3</span>
          </button>
          <div className={styles.avatarBtn} aria-label="Perfil" />
        </div>
      </div>
    </header>
  );
}
