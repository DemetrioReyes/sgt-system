'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@/components/ui';
import styles from './vehiculos.module.css';

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number | null;
  color: string | null;
  kilometraje: number | null;
  estado: string;
  clientes: { id: string; nombre: string } | null;
  updated_at: string | null;
}

const MARCAS = [
  { value: '', label: 'Todas las marcas' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Honda', label: 'Honda' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Chevrolet', label: 'Chevrolet' },
  { value: 'Ford', label: 'Ford' },
  { value: 'Mitsubishi', label: 'Mitsubishi' },
  { value: 'Suzuki', label: 'Suzuki' },
];

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'En taller', label: 'En taller' },
  { value: 'Fuera', label: 'Fuera' },
];

function formatKm(km: number | null) {
  if (km == null) return '-';
  return km.toLocaleString('es-DO') + ' km';
}

export default function VehiculosClient({
  vehiculos,
  error,
  initialSearch,
  initialMarca,
  initialEstado,
}: {
  vehiculos: Vehiculo[];
  error?: string;
  initialSearch: string;
  initialMarca: string;
  initialEstado: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [marcaFilter, setMarcaFilter] = useState(initialMarca);
  const [estadoFilter, setEstadoFilter] = useState(initialEstado);

  const applyFilters = (newSearch?: string, newMarca?: string, newEstado?: string) => {
    const q = newSearch ?? search;
    const marca = newMarca ?? marcaFilter;
    const estado = newEstado ?? estadoFilter;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (marca) params.set('marca', marca);
    if (estado) params.set('estado', estado);
    router.push(`/vehiculos${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Vehiculos</h1>
            <span className={styles.counter}>{vehiculos.length}</span>
          </div>
          <Link href="/vehiculos/nuevo">
            <Button size="sm">+ Nuevo vehiculo</Button>
          </Link>
        </div>
        <div className={styles.filters}>
          <div className={styles.searchInput}>
            <Input
              placeholder="Buscar por placa, marca, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => applyFilters()}
            />
          </div>
          <div className={styles.filterSelect}>
            <Select
              options={MARCAS}
              value={marcaFilter}
              onChange={(e) => {
                setMarcaFilter(e.target.value);
                applyFilters(undefined, e.target.value, undefined);
              }}
            />
          </div>
          <div className={styles.filterSelect}>
            <Select
              options={ESTADOS}
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                applyFilters(undefined, undefined, e.target.value);
              }}
            />
          </div>
        </div>
      </header>

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
          Error: {error}
        </div>
      )}

      {vehiculos.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
          No se encontraron vehiculos.
        </div>
      )}

      {/* Desktop table */}
      <div className={styles.tableWrapper}>
        <Table>
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Placa</Th>
              <Th>Marca / Modelo / Ano</Th>
              <Th>Color</Th>
              <Th>Dueno</Th>
              <Th>Kilometraje</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vehiculos.map((v) => (
              <Tr key={v.id}>
                <Td>
                  <div className={styles.photoPlaceholder}>
                    <Car size={20} />
                  </div>
                </Td>
                <Td>
                  <span className={styles.placaBold}>{v.placa}</span>
                </Td>
                <Td>
                  {v.marca} {v.modelo} {v.ano || ''}
                </Td>
                <Td>
                  {v.color || '-'}
                </Td>
                <Td>{v.clientes?.nombre || '-'}</Td>
                <Td>{formatKm(v.kilometraje)}</Td>
                <Td>
                  <Badge variant={v.estado === 'En taller' ? 'warning' : 'success'}>
                    {v.estado}
                  </Badge>
                </Td>
                <Td>
                  <div className={styles.actions}>
                    <Link href={`/vehiculos/${v.id}`} className={styles.actionLink}>
                      Ver
                    </Link>
                    <Link href={`/entradas/nueva?vehiculo_id=${v.id}&cliente_id=${v.clientes?.id || ''}`} className={styles.actionLink}>
                      Nueva entrada
                    </Link>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className={styles.cardList}>
        {vehiculos.map((v) => (
          <Card key={v.id} padding="sm">
            <CardContent>
              <div className={styles.vehicleCard}>
                <div className={styles.photoPlaceholder}>
                  <Car size={20} />
                </div>
                <div className={styles.vehicleCardBody}>
                  <div className={styles.vehicleCardPlaca}>{v.placa}</div>
                  <div className={styles.vehicleCardMeta}>
                    {v.marca} {v.modelo} {v.ano || ''} &middot; {v.clientes?.nombre || '-'}
                  </div>
                  <div className={styles.vehicleCardMeta}>
                    {formatKm(v.kilometraje)}
                  </div>
                  <div className={styles.vehicleCardFooter}>
                    <Badge variant={v.estado === 'En taller' ? 'warning' : 'success'}>
                      {v.estado}
                    </Badge>
                    <Link href={`/vehiculos/${v.id}`} className={styles.actionLink}>
                      Ver
                    </Link>
                    <Link href={`/entradas/nueva?vehiculo_id=${v.id}&cliente_id=${v.clientes?.id || ''}`} className={styles.actionLink}>
                      Nueva entrada
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
