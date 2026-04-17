'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';
import { updateEntradaEstado, asignarMecanico } from '@/lib/actions/entradas';
import styles from './detalle-entrada.module.css';

const NEXT_ESTADO: Record<string, string> = {
  recibido: 'en_diagnostico',
  en_diagnostico: 'cotizado',
  cotizado: 'aprobado',
  aprobado: 'en_reparacion',
  en_reparacion: 'listo',
  listo: 'entregado',
};

const NEXT_LABEL: Record<string, string> = {
  recibido: 'Iniciar diagnóstico',
  en_diagnostico: 'Marcar cotizado',
  cotizado: 'Aprobar',
  aprobado: 'Iniciar reparación',
  en_reparacion: 'Marcar como listo',
  listo: 'Marcar como entregado',
};

interface Props {
  entradaId: string;
  estado: string;
  mecanicoId: string | null;
  mecanicos: { id: string; nombre: string; rol: string }[];
}

export default function EntradaDetalleClient({
  entradaId,
  estado,
  mecanicoId,
  mecanicos,
}: Props) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [showMecanicos, setShowMecanicos] = useState(false);
  const [isPending, startTransition] = useTransition();

  const nextEstado = NEXT_ESTADO[estado];
  const nextLabel = NEXT_LABEL[estado];

  async function handleAdvance() {
    if (!nextEstado) return;
    setUpdating(true);
    const result = await updateEntradaEstado(entradaId, nextEstado);
    if (result.error) alert(result.error);
    setUpdating(false);
    router.refresh();
  }

  function handleAsignar(id: string) {
    startTransition(async () => {
      const result = await asignarMecanico(entradaId, id);
      if (result.error) alert(result.error);
      setShowMecanicos(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className={styles.headerActions}>
        {nextLabel && (
          <Button size="sm" onClick={handleAdvance} disabled={updating}>
            {updating ? 'Actualizando...' : nextLabel}
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowMecanicos(!showMecanicos)}
        >
          <UserPlus size={16} /> {mecanicoId ? 'Cambiar mecánico' : 'Asignar mecánico'}
        </Button>
      </div>

      {showMecanicos && (
        <div className={styles.mecanicoPanel}>
          <h3 className={styles.mecanicoPanelTitle}>Seleccionar mecánico</h3>
          <div className={styles.mecanicoList}>
            {mecanicos.map((m) => (
              <button
                key={m.id}
                className={`${styles.mecanicoOption} ${m.id === mecanicoId ? styles.mecanicoSelected : ''}`}
                onClick={() => handleAsignar(m.id)}
                disabled={isPending}
              >
                <div className={styles.mecanicoAvatar}>{m.nombre.charAt(0)}</div>
                <div>
                  <div className={styles.mecanicoNombre}>{m.nombre}</div>
                  <div className={styles.mecanicoRol}>{m.rol}</div>
                </div>
              </button>
            ))}
            {mecanicos.length === 0 && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                No hay mecánicos. Créalos en Configuración → Usuarios.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
