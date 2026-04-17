'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { updateTallerConfig } from '@/lib/actions/configuracion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import styles from '../subpage.module.css';

interface TallerConfig {
  id: string;
  nombre_comercial: string | null;
  razon_social: string | null;
  rnc: string | null;
  direccion: string | null;
  provincia: string | null;
  municipio: string | null;
  telefono: string | null;
  telefono2: string | null;
  email: string | null;
  sitio_web: string | null;
  horario: string | null;
  moneda: string | null;
  itbis_porcentaje: number | null;
  aplicar_itbis_default: boolean | null;
}

export function TallerForm({ config }: { config: TallerConfig }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateTallerConfig(formData);
        setMessage({ type: 'success', text: 'Configuracion guardada correctamente.' });
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar.' });
      }
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/configuracion" className={styles.backLink}>
          <ArrowLeft size={16} />
          Volver a configuracion
        </Link>
        <h1 className={styles.title}>Informacion del taller</h1>
        <p className={styles.subtitle}>Datos generales del negocio</p>
      </div>

      <Card padding="lg">
        <form ref={formRef} action={handleSubmit} className={styles.formCard}>
          <div className={styles.formGrid}>
            <Input
              label="Nombre comercial"
              name="nombre_comercial"
              defaultValue={config.nombre_comercial ?? ''}
              required
            />
            <Input
              label="Razon social"
              name="razon_social"
              defaultValue={config.razon_social ?? ''}
            />
            <Input
              label="RNC"
              name="rnc"
              defaultValue={config.rnc ?? ''}
            />
            <Input
              label="Direccion"
              name="direccion"
              defaultValue={config.direccion ?? ''}
            />
            <Input
              label="Provincia"
              name="provincia"
              defaultValue={config.provincia ?? ''}
            />
            <Input
              label="Municipio"
              name="municipio"
              defaultValue={config.municipio ?? ''}
            />
            <Input
              label="Telefono"
              name="telefono"
              defaultValue={config.telefono ?? ''}
            />
            <Input
              label="Telefono 2"
              name="telefono2"
              defaultValue={config.telefono2 ?? ''}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              defaultValue={config.email ?? ''}
            />
            <Input
              label="Sitio web"
              name="sitio_web"
              defaultValue={config.sitio_web ?? ''}
            />
            <Select
              label="Moneda"
              name="moneda"
              defaultValue={config.moneda ?? 'DOP'}
              options={[
                { value: 'DOP', label: 'DOP - Peso Dominicano' },
                { value: 'USD', label: 'USD - Dolar Estadounidense' },
              ]}
            />
            <Input
              label="ITBIS %"
              name="itbis_porcentaje"
              type="number"
              step="0.01"
              defaultValue={config.itbis_porcentaje?.toString() ?? '18'}
            />
            <div className={`${styles.formGridFull}`}>
              <Textarea
                label="Horario"
                name="horario"
                defaultValue={config.horario ?? ''}
              />
            </div>
            <div className={`${styles.checkboxRow} ${styles.formGridFull}`}>
              <input
                type="checkbox"
                name="aplicar_itbis_default"
                id="aplicar_itbis_default"
                defaultChecked={config.aplicar_itbis_default ?? false}
              />
              <label htmlFor="aplicar_itbis_default">
                Aplicar ITBIS por defecto en servicios y productos
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="submit" loading={isPending}>
              Guardar cambios
            </Button>
            {message && (
              <span className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
