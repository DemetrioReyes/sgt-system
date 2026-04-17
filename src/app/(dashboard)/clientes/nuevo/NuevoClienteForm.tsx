'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createCliente } from '@/lib/actions/clientes';
import styles from './cliente-form.module.css';

const provincias = [
  { value: 'santo-domingo', label: 'Santo Domingo' },
  { value: 'santiago', label: 'Santiago' },
  { value: 'la-vega', label: 'La Vega' },
  { value: 'puerto-plata', label: 'Puerto Plata' },
  { value: 'san-cristobal', label: 'San Cristobal' },
  { value: 'la-romana', label: 'La Romana' },
  { value: 'san-pedro', label: 'San Pedro de Macoris' },
  { value: 'duarte', label: 'Duarte' },
  { value: 'espaillat', label: 'Espaillat' },
  { value: 'azua', label: 'Azua' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" loading={pending}>
      Guardar
    </Button>
  );
}

export function NuevoClienteForm() {
  const [tipoCliente, setTipoCliente] = useState<'persona' | 'empresa'>('persona');
  const [whatsappMismo, setWhatsappMismo] = useState(true);
  const [recordatorios, setRecordatorios] = useState(false);

  return (
    <div className={styles.page}>
      <Link href="/clientes" className={styles.backLink}>
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <h1 className={styles.title}>Nuevo cliente</h1>

      <form action={createCliente}>
        {/* Hidden field for tipo */}
        <input type="hidden" name="tipo" value={tipoCliente} />
        {/* Hidden fields for checkboxes */}
        {whatsappMismo && <input type="hidden" name="whatsapp_mismo" value="on" />}
        {recordatorios && <input type="hidden" name="acepta_recordatorios" value="on" />}

        {/* Tipo */}
        <Card padding="lg">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipo</h2>
            <div className={styles.radioGroup}>
              <button
                type="button"
                className={`${styles.radioOption} ${tipoCliente === 'persona' ? styles.radioOptionActive : ''}`}
                onClick={() => setTipoCliente('persona')}
              >
                <input
                  type="radio"
                  checked={tipoCliente === 'persona'}
                  readOnly
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                Persona fisica
              </button>
              <button
                type="button"
                className={`${styles.radioOption} ${tipoCliente === 'empresa' ? styles.radioOptionActive : ''}`}
                onClick={() => setTipoCliente('empresa')}
              >
                <input
                  type="radio"
                  checked={tipoCliente === 'empresa'}
                  readOnly
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                Empresa
              </button>
            </div>
          </div>
        </Card>

        {/* Identificacion */}
        <Card padding="lg">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Identificacion</h2>
            <div className={styles.formGrid}>
              <Input
                label={tipoCliente === 'persona' ? 'Cedula' : 'RNC'}
                name="cedula_rnc"
                placeholder={tipoCliente === 'persona' ? '000-0000000-0' : '000000000'}
                required
              />
              <Input
                label="Nombre completo"
                name="nombre"
                placeholder={tipoCliente === 'persona' ? 'Nombre y apellido' : 'Nombre de contacto'}
                required
              />
            </div>
          </div>
        </Card>

        {/* Contacto */}
        <Card padding="lg">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contacto</h2>
            <div className={styles.formGrid}>
              <Input label="Telefono principal" name="telefono" placeholder="809-000-0000" type="tel" required />
              <Input label="Telefono secundario" name="telefono2" placeholder="829-000-0000" type="tel" />
              <Input label="Email" name="email" placeholder="correo@ejemplo.com" type="email" />
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={whatsappMismo}
                    onChange={(e) => setWhatsappMismo(e.target.checked)}
                  />
                  WhatsApp es el mismo numero
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Direccion */}
        <Card padding="lg">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Direccion</h2>
            <div className={styles.formGrid}>
              <Select
                label="Provincia"
                name="provincia"
                options={provincias}
                placeholder="Selecciona una provincia"
                defaultValue=""
              />
              <Input label="Municipio" name="municipio" placeholder="Municipio" />
              <Input label="Calle y numero" name="direccion" placeholder="Calle, numero, edificio" />
              <Input label="Referencia" name="referencia" placeholder="Cerca de..." />
            </div>
          </div>
        </Card>

        {/* Adicional */}
        <Card padding="lg">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Adicional</h2>
            <Textarea label="Notas" name="notas" placeholder="Notas internas sobre este cliente..." />
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={recordatorios}
                onChange={(e) => setRecordatorios(e.target.checked)}
              />
              Aceptar recordatorios por WhatsApp
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className={styles.footer}>
          <Link href="/clientes">
            <Button variant="secondary" size="md" type="button">
              Cancelar
            </Button>
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
