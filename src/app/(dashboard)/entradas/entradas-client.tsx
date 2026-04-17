'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import styles from './entradas.module.css';

type Estado =
  | 'recibido'
  | 'en_diagnostico'
  | 'cotizado'
  | 'aprobado'
  | 'en_reparacion'
  | 'listo';

interface Entrada {
  id: string;
  numero: string;
  placa: string;
  vehiculo_desc: string;
  cliente_nombre: string;
  tiempo_en_taller: string;
  mecanico_nombre: string;
  mecanico_inicial: string;
  descripcion_problema: string;
  urgencia: 'normal' | 'urgente' | 'emergencia';
  estado: Estado;
}

const COLUMNAS: { key: Estado; label: string }[] = [
  { key: 'recibido', label: 'Recibido' },
  { key: 'en_diagnostico', label: 'En diagnostico' },
  { key: 'cotizado', label: 'Cotizado' },
  { key: 'aprobado', label: 'Aprobado' },
  { key: 'en_reparacion', label: 'En reparacion' },
  { key: 'listo', label: 'Listo' },
];

const badgeVariant = (urgencia: string) => {
  if (urgencia === 'emergencia') return 'danger';
  if (urgencia === 'urgente') return 'warning';
  return 'default';
};

export default function EntradasClient({
  entradas,
  error,
}: {
  entradas: Entrada[];
  error?: string;
}) {
  const [mobileFilter, setMobileFilter] = useState<Estado | ''>('');

  const countByEstado = (estado: Estado) =>
    entradas.filter((e) => e.estado === estado).length;

  const mobileEntradas = mobileFilter
    ? entradas.filter((e) => e.estado === mobileFilter)
    : entradas;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Vehiculos en taller</h1>
          <Link href="/entradas/nueva">
            <Button size="sm">+ Nueva entrada</Button>
          </Link>
        </div>
        <div className={styles.statusBadges}>
          {COLUMNAS.map((col) => (
            <span key={col.key} className={styles.statusBadge}>
              <span className={styles.statusCount}>{countByEstado(col.key)}</span>
              {col.label}
            </span>
          ))}
        </div>
      </header>

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
          Error: {error}
        </div>
      )}

      {entradas.length === 0 && !error && (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--color-text-muted)',
          }}
        >
          No hay vehiculos en taller actualmente.
        </div>
      )}

      {/* Desktop kanban */}
      <div className={styles.kanban}>
        {COLUMNAS.map((col) => {
          const entries = entradas.filter((e) => e.estado === col.key);
          return (
            <div key={col.key} className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>{col.label}</span>
                <span className={styles.columnCount}>{entries.length}</span>
              </div>
              {entries.length === 0 && (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    textAlign: 'center',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Sin entradas
                </div>
              )}
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/entradas/${entry.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card padding="sm" className={styles.kanbanCard}>
                    <CardContent>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                        }}
                      >
                        <span
                          className={`${styles.urgencyDot} ${
                            entry.urgencia === 'emergencia'
                              ? styles.urgencyEmergencia
                              : entry.urgencia === 'urgente'
                              ? styles.urgencyUrgente
                              : styles.urgencyNormal
                          }`}
                        />
                        <span className={styles.cardPlaca}>{entry.placa}</span>
                      </div>
                      <div className={styles.cardVehicle}>{entry.vehiculo_desc}</div>
                      <div className={styles.cardClient}>{entry.cliente_nombre}</div>
                      <div className={styles.cardProblem}>
                        {entry.descripcion_problema}
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardTime}>
                          {entry.tiempo_en_taller}
                        </span>
                        {entry.mecanico_inicial && (
                          <span className={styles.mechanicAvatar}>
                            {entry.mecanico_inicial}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      {/* Mobile filters */}
      <div className={styles.mobileFilters}>
        <button
          className={`${styles.statusBadge} ${
            mobileFilter === '' ? styles.statusBadgeActive : ''
          }`}
          onClick={() => setMobileFilter('')}
        >
          Todos
        </button>
        {COLUMNAS.map((col) => (
          <button
            key={col.key}
            className={`${styles.statusBadge} ${
              mobileFilter === col.key ? styles.statusBadgeActive : ''
            }`}
            onClick={() => setMobileFilter(col.key)}
          >
            {col.label}
          </button>
        ))}
      </div>

      {/* Mobile list */}
      <div className={styles.mobileList}>
        {mobileEntradas.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-4)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
            }}
          >
            No hay entradas en este estado.
          </div>
        )}
        {mobileEntradas.map((entry) => (
          <Link
            key={entry.id}
            href={`/entradas/${entry.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card padding="sm">
              <CardContent>
                <div className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <div>
                      <span className={styles.cardPlaca}>{entry.placa}</span>
                      <span className={styles.cardVehicle}>
                        {' '}
                        {entry.vehiculo_desc}
                      </span>
                    </div>
                    <Badge variant={badgeVariant(entry.urgencia)}>
                      {entry.urgencia}
                    </Badge>
                  </div>
                  <div className={styles.mobileCardMeta}>
                    {entry.cliente_nombre}
                  </div>
                  <div className={styles.mobileCardFooter}>
                    <Badge>
                      {COLUMNAS.find((c) => c.key === entry.estado)?.label ||
                        entry.estado}
                    </Badge>
                    <span className={styles.cardTime}>
                      {entry.tiempo_en_taller}
                    </span>
                    {entry.mecanico_inicial && (
                      <span className={styles.mechanicAvatar}>
                        {entry.mecanico_inicial}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
