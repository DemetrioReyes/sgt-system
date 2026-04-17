'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import {
  createNcfSecuencia,
  updateNcfSecuencia,
} from '@/lib/actions/configuracion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import styles from '../subpage.module.css';

interface NcfSecuencia {
  id: string;
  tipo_comprobante: string;
  prefijo: string;
  rango_desde: number;
  rango_hasta: number;
  consecutivo_actual: number;
  fecha_vencimiento: string | null;
  activo: boolean;
}

const tipoOptions = [
  { value: 'B01', label: 'B01 - Credito Fiscal' },
  { value: 'B02', label: 'B02 - Consumidor Final' },
  { value: 'B14', label: 'B14 - Regimen Especial' },
  { value: 'B15', label: 'B15 - Gubernamental' },
  { value: 'B04', label: 'B04 - Nota de Debito' },
  { value: 'B03', label: 'B03 - Nota de Credito' },
];

export function NcfClient({ secuencias }: { secuencias: NcfSecuencia[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleCreate(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await createNcfSecuencia(formData);
        setMessage({ type: 'success', text: 'Secuencia creada correctamente.' });
        setShowForm(false);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al crear secuencia.' });
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateNcfSecuencia(id, formData);
        setMessage({ type: 'success', text: 'Secuencia actualizada.' });
        setEditingId(null);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar.' });
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
        <h1 className={styles.title}>Facturacion electronica (NCF)</h1>
        <p className={styles.subtitle}>Secuencias de comprobantes fiscales</p>
      </div>

      <div className={styles.toolbar}>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
        >
          <Plus size={16} /> {showForm ? 'Cancelar' : 'Nueva secuencia'}
        </Button>
        {message && (
          <span className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </span>
        )}
      </div>

      {showForm && (
        <Card padding="md">
          <form action={handleCreate} className={styles.formCard}>
            <div className={styles.formGrid}>
              <Select
                label="Tipo de comprobante"
                name="tipo_comprobante"
                options={tipoOptions}
                defaultValue="B01"
              />
              <Input label="Prefijo" name="prefijo" required placeholder="B0100000001" />
              <Input label="Rango desde" name="rango_desde" type="number" required />
              <Input label="Rango hasta" name="rango_hasta" type="number" required />
              <Input label="Fecha vencimiento" name="fecha_vencimiento" type="date" />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" size="sm" loading={isPending}>
                Crear secuencia
              </Button>
            </div>
          </form>
        </Card>
      )}

      {secuencias.length === 0 ? (
        <div className={styles.emptyState}>
          No hay secuencias NCF configuradas. Crea la primera.
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Tipo</Th>
              <Th>Prefijo</Th>
              <Th>Rango</Th>
              <Th>Consecutivo actual</Th>
              <Th>Vencimiento</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {secuencias.map((s) =>
              editingId === s.id ? (
                <Tr key={s.id}>
                  <Td colSpan={7}>
                    <form
                      action={(fd) => handleUpdate(s.id, fd)}
                      className={styles.formCard}
                    >
                      <div className={styles.formGrid}>
                        <Select
                          label="Tipo"
                          name="tipo_comprobante"
                          options={tipoOptions}
                          defaultValue={s.tipo_comprobante}
                        />
                        <Input label="Prefijo" name="prefijo" defaultValue={s.prefijo} required />
                        <Input label="Rango desde" name="rango_desde" type="number" defaultValue={s.rango_desde.toString()} required />
                        <Input label="Rango hasta" name="rango_hasta" type="number" defaultValue={s.rango_hasta.toString()} required />
                        <Input label="Consecutivo actual" name="consecutivo_actual" type="number" defaultValue={s.consecutivo_actual.toString()} required />
                        <Input label="Fecha vencimiento" name="fecha_vencimiento" type="date" defaultValue={s.fecha_vencimiento ?? ''} />
                        <div className={styles.checkboxRow}>
                          <input
                            type="checkbox"
                            name="activo"
                            id={`activo-${s.id}`}
                            defaultChecked={s.activo}
                          />
                          <label htmlFor={`activo-${s.id}`}>Activo</label>
                        </div>
                      </div>
                      <div className={styles.formActions}>
                        <Button type="submit" size="sm" loading={isPending}>Guardar</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </div>
                    </form>
                  </Td>
                </Tr>
              ) : (
                <Tr key={s.id}>
                  <Td>{s.tipo_comprobante}</Td>
                  <Td>{s.prefijo}</Td>
                  <Td>{s.rango_desde} - {s.rango_hasta}</Td>
                  <Td>{s.consecutivo_actual}</Td>
                  <Td>{s.fecha_vencimiento ?? '-'}</Td>
                  <Td>
                    <Badge variant={s.activo ? 'success' : 'danger'}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className={styles.tableActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingId(s.id); setShowForm(false); }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              )
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
