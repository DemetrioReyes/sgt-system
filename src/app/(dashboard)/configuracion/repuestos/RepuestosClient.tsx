'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  createRepuesto,
  updateRepuesto,
  deleteRepuesto,
} from '@/lib/actions/configuracion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import styles from '../subpage.module.css';

interface Repuesto {
  id: string;
  codigo: string | null;
  nombre: string;
  marca_compatible: string | null;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor: string | null;
  activo: boolean;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);
}

export function RepuestosClient({ repuestos }: { repuestos: Repuesto[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleCreate(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await createRepuesto(formData);
        setMessage({ type: 'success', text: 'Repuesto creado correctamente.' });
        setShowForm(false);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al crear repuesto.' });
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateRepuesto(id, formData);
        setMessage({ type: 'success', text: 'Repuesto actualizado.' });
        setEditingId(null);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar.' });
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Estas seguro de eliminar este repuesto?')) return;
    startTransition(async () => {
      try {
        await deleteRepuesto(id);
        setMessage({ type: 'success', text: 'Repuesto eliminado.' });
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
        <h1 className={styles.title}>Catalogo de repuestos</h1>
        <p className={styles.subtitle}>Inventario, proveedores y precios</p>
      </div>

      <div className={styles.toolbar}>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
        >
          <Plus size={16} /> {showForm ? 'Cancelar' : 'Nuevo repuesto'}
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
              <Input label="Codigo" name="codigo" />
              <Input label="Nombre" name="nombre" required />
              <Input label="Marca compatible" name="marca_compatible" />
              <Input label="Precio compra" name="precio_compra" type="number" step="0.01" required />
              <Input label="Precio venta" name="precio_venta" type="number" step="0.01" required />
              <Input label="Stock actual" name="stock_actual" type="number" defaultValue="0" />
              <Input label="Stock minimo" name="stock_minimo" type="number" defaultValue="0" />
              <Input label="Proveedor" name="proveedor" />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" size="sm" loading={isPending}>
                Crear repuesto
              </Button>
            </div>
          </form>
        </Card>
      )}

      {repuestos.length === 0 ? (
        <div className={styles.emptyState}>
          No hay repuestos en el catalogo. Crea el primero.
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Codigo</Th>
              <Th>Nombre</Th>
              <Th>Marca</Th>
              <Th>P. Compra</Th>
              <Th>P. Venta</Th>
              <Th>Stock</Th>
              <Th>Min.</Th>
              <Th>Proveedor</Th>
              <Th>Activo</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {repuestos.map((r) =>
              editingId === r.id ? (
                <Tr key={r.id}>
                  <Td colSpan={10}>
                    <form
                      action={(fd) => handleUpdate(r.id, fd)}
                      className={styles.formCard}
                    >
                      <div className={styles.formGrid}>
                        <Input label="Codigo" name="codigo" defaultValue={r.codigo ?? ''} />
                        <Input label="Nombre" name="nombre" defaultValue={r.nombre} required />
                        <Input label="Marca compatible" name="marca_compatible" defaultValue={r.marca_compatible ?? ''} />
                        <Input label="Precio compra" name="precio_compra" type="number" step="0.01" defaultValue={r.precio_compra.toString()} required />
                        <Input label="Precio venta" name="precio_venta" type="number" step="0.01" defaultValue={r.precio_venta.toString()} required />
                        <Input label="Stock actual" name="stock_actual" type="number" defaultValue={r.stock_actual.toString()} />
                        <Input label="Stock minimo" name="stock_minimo" type="number" defaultValue={r.stock_minimo.toString()} />
                        <Input label="Proveedor" name="proveedor" defaultValue={r.proveedor ?? ''} />
                        <div className={styles.checkboxRow}>
                          <input type="checkbox" name="activo" id={`activo-${r.id}`} defaultChecked={r.activo} />
                          <label htmlFor={`activo-${r.id}`}>Activo</label>
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
                <Tr key={r.id}>
                  <Td>{r.codigo ?? '-'}</Td>
                  <Td>{r.nombre}</Td>
                  <Td>{r.marca_compatible ?? '-'}</Td>
                  <Td>{formatPrice(r.precio_compra)}</Td>
                  <Td>{formatPrice(r.precio_venta)}</Td>
                  <Td>
                    <Badge variant={r.stock_actual <= r.stock_minimo ? 'danger' : 'default'}>
                      {r.stock_actual}
                    </Badge>
                  </Td>
                  <Td>{r.stock_minimo}</Td>
                  <Td>{r.proveedor ?? '-'}</Td>
                  <Td>
                    <Badge variant={r.activo ? 'success' : 'danger'}>
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className={styles.tableActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingId(r.id); setShowForm(false); }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(r.id)}
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
