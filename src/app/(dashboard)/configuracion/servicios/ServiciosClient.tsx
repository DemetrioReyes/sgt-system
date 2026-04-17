'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  createServicio,
  updateServicio,
  deleteServicio,
} from '@/lib/actions/configuracion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import styles from '../subpage.module.css';

interface Servicio {
  id: string;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
  tiempo_estimado: number | null;
  aplica_itbis: boolean;
  activo: boolean;
}

const categoriaOptions = [
  { value: 'Mecanica general', label: 'Mecanica general' },
  { value: 'Electrico', label: 'Electrico' },
  { value: 'Frenos', label: 'Frenos' },
  { value: 'Suspension', label: 'Suspension' },
  { value: 'Aire acondicionado', label: 'Aire acondicionado' },
  { value: 'Carroceria', label: 'Carroceria' },
  { value: 'Diagnostico', label: 'Diagnostico' },
  { value: 'Otro', label: 'Otro' },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);
}

export function ServiciosClient({ servicios }: { servicios: Servicio[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleCreate(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await createServicio(formData);
        setMessage({ type: 'success', text: 'Servicio creado correctamente.' });
        setShowForm(false);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al crear servicio.' });
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateServicio(id, formData);
        setMessage({ type: 'success', text: 'Servicio actualizado.' });
        setEditingId(null);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar.' });
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Estas seguro de eliminar este servicio?')) return;
    startTransition(async () => {
      try {
        await deleteServicio(id);
        setMessage({ type: 'success', text: 'Servicio eliminado.' });
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al eliminar.' });
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
        <h1 className={styles.title}>Catalogo de servicios</h1>
        <p className={styles.subtitle}>Servicios ofrecidos y precios</p>
      </div>

      <div className={styles.toolbar}>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
        >
          <Plus size={16} /> {showForm ? 'Cancelar' : 'Nuevo servicio'}
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
              <Input label="Nombre" name="nombre" required />
              <Select
                label="Categoria"
                name="categoria"
                options={categoriaOptions}
                placeholder="Selecciona una categoria"
                defaultValue=""
              />
              <Input label="Precio" name="precio" type="number" step="0.01" required />
              <Input label="Tiempo estimado (horas)" name="tiempo_estimado" type="number" step="0.5" />
              <div className={styles.checkboxRow}>
                <input type="checkbox" name="aplica_itbis" id="aplica_itbis_new" defaultChecked />
                <label htmlFor="aplica_itbis_new">Aplica ITBIS</label>
              </div>
              <div className={styles.formGridFull}>
                <Textarea label="Descripcion" name="descripcion" />
              </div>
            </div>
            <div className={styles.formActions}>
              <Button type="submit" size="sm" loading={isPending}>
                Crear servicio
              </Button>
            </div>
          </form>
        </Card>
      )}

      {servicios.length === 0 ? (
        <div className={styles.emptyState}>
          No hay servicios en el catalogo. Crea el primero.
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Categoria</Th>
              <Th>Precio</Th>
              <Th>Tiempo est.</Th>
              <Th>ITBIS</Th>
              <Th>Activo</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {servicios.map((s) =>
              editingId === s.id ? (
                <Tr key={s.id}>
                  <Td colSpan={7}>
                    <form
                      action={(fd) => handleUpdate(s.id, fd)}
                      className={styles.formCard}
                    >
                      <div className={styles.formGrid}>
                        <Input label="Nombre" name="nombre" defaultValue={s.nombre} required />
                        <Select
                          label="Categoria"
                          name="categoria"
                          options={categoriaOptions}
                          defaultValue={s.categoria ?? ''}
                        />
                        <Input label="Precio" name="precio" type="number" step="0.01" defaultValue={s.precio.toString()} required />
                        <Input label="Tiempo est. (horas)" name="tiempo_estimado" type="number" step="0.5" defaultValue={s.tiempo_estimado?.toString() ?? ''} />
                        <div className={styles.checkboxRow}>
                          <input type="checkbox" name="aplica_itbis" id={`itbis-${s.id}`} defaultChecked={s.aplica_itbis} />
                          <label htmlFor={`itbis-${s.id}`}>Aplica ITBIS</label>
                        </div>
                        <div className={styles.checkboxRow}>
                          <input type="checkbox" name="activo" id={`activo-${s.id}`} defaultChecked={s.activo} />
                          <label htmlFor={`activo-${s.id}`}>Activo</label>
                        </div>
                        <div className={styles.formGridFull}>
                          <Textarea label="Descripcion" name="descripcion" defaultValue={s.descripcion ?? ''} />
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
                  <Td>{s.nombre}</Td>
                  <Td>{s.categoria ?? '-'}</Td>
                  <Td>{formatPrice(s.precio)}</Td>
                  <Td>{s.tiempo_estimado ? `${s.tiempo_estimado}h` : '-'}</Td>
                  <Td>
                    <Badge variant={s.aplica_itbis ? 'success' : 'default'}>
                      {s.aplica_itbis ? 'Si' : 'No'}
                    </Badge>
                  </Td>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
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
