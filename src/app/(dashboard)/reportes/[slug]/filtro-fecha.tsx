'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './reporte.module.css';

interface Props {
  desde: string;
  hasta: string;
  showFilter?: boolean;
}

export default function FiltroFecha({ desde, hasta, showFilter = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);

  if (!showFilter) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${pathname}?desde=${d}&hasta=${h}`);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.filterForm}>
      <div className={styles.filterField}>
        <label className={styles.filterLabel}>Desde</label>
        <Input type="date" value={d} onChange={(e) => setD(e.target.value)} />
      </div>
      <div className={styles.filterField}>
        <label className={styles.filterLabel}>Hasta</label>
        <Input type="date" value={h} onChange={(e) => setH(e.target.value)} />
      </div>
      <Button type="submit" className={styles.filterButton}>
        Generar
      </Button>
    </form>
  );
}

export function ExportButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className={styles.exportButton}
    >
      Imprimir / Exportar
    </Button>
  );
}
