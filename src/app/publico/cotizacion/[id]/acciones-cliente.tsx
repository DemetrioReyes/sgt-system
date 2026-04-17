'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { updateCotizacionEstado } from '@/lib/actions/cotizaciones';
import styles from './publico.module.css';

const motivos = [
  'Precio muy alto',
  'Decidí no reparar',
  'Buscaré otro taller',
  'Otro',
];

export default function AccionesCliente({ cotizacionId }: { cotizacionId: string }) {
  const router = useRouter();
  const [vista, setVista] = useState<'opciones' | 'confirmar_aprobar' | 'confirmar_rechazar'>('opciones');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  async function aprobar() {
    setLoading(true);
    await updateCotizacionEstado(cotizacionId, 'aprobada');
    router.refresh();
  }

  async function rechazar() {
    setLoading(true);
    await updateCotizacionEstado(cotizacionId, 'rechazada');
    router.refresh();
  }

  if (vista === 'confirmar_aprobar') {
    return (
      <div className={styles.accionesCard}>
        <h2 className={styles.accionesTitle}>Confirmar aprobación</h2>
        <p className={styles.accionesText}>
          Al aprobar, autorizas al taller a proceder con los trabajos detallados en esta cotización.
          Se te contactará para coordinar la fecha del servicio.
        </p>
        <div className={styles.accionesBtns}>
          <Button variant="primary" size="lg" loading={loading} onClick={aprobar}>
            Confirmar aprobación
          </Button>
          <Button variant="ghost" size="md" onClick={() => setVista('opciones')}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (vista === 'confirmar_rechazar') {
    return (
      <div className={styles.accionesCard}>
        <h2 className={styles.accionesTitle}>¿Por qué rechazas la cotización?</h2>
        <div className={styles.motivosList}>
          {motivos.map((m) => (
            <label key={m} className={`${styles.motivoOption} ${motivo === m ? styles.motivoSelected : ''}`}>
              <input
                type="radio"
                name="motivo"
                value={m}
                checked={motivo === m}
                onChange={() => setMotivo(m)}
                className={styles.motivoRadio}
              />
              {m}
            </label>
          ))}
        </div>
        <div className={styles.accionesBtns}>
          <Button variant="danger" size="lg" loading={loading} onClick={rechazar}>
            Confirmar rechazo
          </Button>
          <Button variant="ghost" size="md" onClick={() => setVista('opciones')}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accionesCard}>
      <h2 className={styles.accionesTitle}>¿Qué deseas hacer?</h2>
      <div className={styles.accionesBtns}>
        <Button variant="primary" size="lg" onClick={() => setVista('confirmar_aprobar')}>
          ✅ Aprobar cotización
        </Button>
        <Button variant="danger" size="lg" onClick={() => setVista('confirmar_rechazar')}>
          ❌ Rechazar cotización
        </Button>
      </div>
    </div>
  );
}
