'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, UserCheck, UserX } from 'lucide-react';
import {
  createUsuario,
  updateUsuario,
  toggleUsuarioActivo,
} from '@/lib/actions/configuracion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import styles from '../subpage.module.css';

interface Usuario {
  id: string;
  nombre: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
  created_at: string;
}

const rolOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'mecanico', label: 'Mecanico' },
  { value: 'contador', label: 'Contador' },
];

const rolBadgeVariant: Record<string, 'info' | 'warning' | 'success' | 'default'> = {
  admin: 'info',
  recepcionista: 'warning',
  mecanico: 'success',
  contador: 'default',
};

export function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleCreate(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await createUsuario(formData);
        setMessage({ type: 'success', text: 'Usuario creado correctamente.' });
        setShowForm(false);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al crear usuario.' });
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateUsuario(id, formData);
        setMessage({ type: 'success', text: 'Usuario actualizado.' });
        setEditingId(null);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar.' });
      }
    });
  }

  function handleToggle(id: string, activo: boolean) {
    startTransition(async () => {
      try {
        await toggleUsuarioActivo(id, !activo);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al cambiar estado.' });
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
        <h1 className={styles.title}>Usuarios y permisos</h1>
        <p className={styles.subtitle}>Gestionar usuarios del sistema</p>
      </div>

      <div className={styles.toolbar}>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
        >
          <Plus size={16} /> {showForm ? 'Cancelar' : 'Nuevo usuario'}
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
              <Input label="Nombre completo" name="nombre" required />
              <Input label="Correo electrónico" name="email" type="email" required />
              <Input label="Contraseña" name="password" type="password" required hint="Mínimo 6 caracteres" />
              <Input label="Teléfono" name="telefono" />
              <Select
                label="Rol"
                name="rol"
                options={rolOptions}
                defaultValue="mecanico"
              />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" size="sm" loading={isPending}>
                Crear usuario
              </Button>
            </div>
          </form>
        </Card>
      )}

      {usuarios.length === 0 ? (
        <div className={styles.emptyState}>
          No hay usuarios registrados. Crea el primero.
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Telefono</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {usuarios.map((u) =>
              editingId === u.id ? (
                <Tr key={u.id}>
                  <Td colSpan={5}>
                    <form
                      action={(fd) => handleUpdate(u.id, fd)}
                      className={styles.formCard}
                    >
                      <div className={styles.formGrid}>
                        <Input label="Nombre" name="nombre" defaultValue={u.nombre} required />
                        <Input label="Telefono" name="telefono" defaultValue={u.telefono ?? ''} />
                        <Select
                          label="Rol"
                          name="rol"
                          options={rolOptions}
                          defaultValue={u.rol}
                        />
                      </div>
                      <div className={styles.formActions}>
                        <Button type="submit" size="sm" loading={isPending}>
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Td>
                </Tr>
              ) : (
                <Tr key={u.id}>
                  <Td>{u.nombre}</Td>
                  <Td>{u.telefono ?? '-'}</Td>
                  <Td>
                    <Badge variant={rolBadgeVariant[u.rol] ?? 'default'}>
                      {u.rol}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge variant={u.activo ? 'success' : 'danger'}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className={styles.tableActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingId(u.id); setShowForm(false); }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(u.id, u.activo)}
                        title={u.activo ? 'Desactivar' : 'Activar'}
                      >
                        {u.activo ? <UserX size={14} /> : <UserCheck size={14} />}
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
