'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, FormEvent } from 'react';
import Link from 'next/link';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import styles from './clientes.module.css';

interface Cliente {
  id: string;
  tipo: string;
  nombre: string;
  cedula_rnc: string;
  telefono: string;
  telefono2: string | null;
  email: string | null;
  provincia: string | null;
  municipio: string | null;
  created_at: string;
}

interface Props {
  clientes: Cliente[];
  busqueda: string;
}

export function ClientesView({ clientes, busqueda }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(busqueda);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.push(`/clientes?${params.toString()}`);
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Clientes</h1>
          <span className={styles.counter}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Link href="/clientes/nuevo">
          <Button size="md">
            <Plus size={18} /> Nuevo cliente
          </Button>
        </Link>
      </header>

      <form onSubmit={handleSearch} className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por nombre, cedula o telefono..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" size="md" loading={isPending}>
          Buscar
        </Button>
      </form>

      {/* Vista desktop: tabla */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cedula/RNC</th>
              <th>Telefono</th>
              <th>Correo</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className={styles.clienteName}>
                    {cliente.nombre}
                  </div>
                </td>
                <td>{cliente.cedula_rnc}</td>
                <td>
                  <a href={`tel:${cliente.telefono}`} className={styles.phoneLink}>
                    <Phone size={14} /> {cliente.telefono}
                  </a>
                </td>
                <td>{cliente.email || '-'}</td>
                <td>
                  <Badge variant={cliente.tipo === 'empresa' ? 'info' : 'default'}>
                    {cliente.tipo === 'empresa' ? 'Empresa' : 'Persona'}
                  </Badge>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/clientes/${cliente.id}`} className={styles.actionLink}>
                      Ver
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista mobile: cards */}
      <div className={styles.cardList}>
        {clientes.map((cliente) => (
          <Link href={`/clientes/${cliente.id}`} key={cliente.id} className={styles.clienteCard}>
            <Card padding="md">
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>{cliente.nombre}</span>
                <Badge variant={cliente.tipo === 'empresa' ? 'info' : 'default'}>
                  {cliente.tipo === 'empresa' ? 'Empresa' : 'Persona'}
                </Badge>
              </div>
              <div className={styles.cardDetails}>
                <span><Phone size={14} /> {cliente.telefono}</span>
                {cliente.email && <span><Mail size={14} /> {cliente.email}</span>}
              </div>
              <div className={styles.cardFooter}>
                <span>{cliente.cedula_rnc}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {clientes.length === 0 && (
        <div className={styles.emptyState}>
          <p>{busqueda ? 'No se encontraron clientes para esta busqueda' : 'No hay clientes registrados'}</p>
          {!busqueda && (
            <Link href="/clientes/nuevo">
              <Button>Registrar primer cliente</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
