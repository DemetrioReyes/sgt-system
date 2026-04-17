'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea, Card, CardContent } from '@/components/ui';
import { createVehiculo } from '@/lib/actions/vehiculos';
import { createClient } from '@/lib/supabase/client';
import styles from './form.module.css';

interface Cliente {
  id: string;
  nombre: string;
  cedula_rnc: string;
  telefono: string;
}

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const [placa, setPlaca] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const searchClientes = useCallback(async (query: string) => {
    if (query.length < 2) {
      setClientes([]);
      return;
    }
    setSearching(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('clientes')
        .select('id, nombre, cedula_rnc, telefono')
        .or(`nombre.ilike.%${query}%,cedula_rnc.ilike.%${query}%,telefono.ilike.%${query}%`)
        .limit(10);
      setClientes(data || []);
    } catch {
      setClientes([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (clientSearch && !selectedCliente) {
        searchClientes(clientSearch);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [clientSearch, selectedCliente, searchClientes]);

  async function handleSubmit(formData: FormData) {
    if (!selectedCliente) {
      setError('Debe seleccionar un cliente.');
      return;
    }
    setSubmitting(true);
    setError('');
    formData.set('cliente_id', selectedCliente.id);
    const result = await createVehiculo(formData);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push('/vehiculos');
    }
  }

  return (
    <div className={styles.page}>
      <Link href="/vehiculos" className={styles.backLink}>
        &larr; Volver a vehiculos
      </Link>
      <h1 className={styles.title}>Nuevo vehiculo</h1>

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', padding: 'var(--space-2) 0' }}>
          {error}
        </div>
      )}

      <form action={handleSubmit}>
        {/* Section 1: Identificacion */}
        <Card>
          <CardContent>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Identificacion</h2>
              <div className={styles.fieldGrid}>
                <Input
                  name="placa"
                  label="Placa"
                  placeholder="Ej: A123456"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                <Input name="vin" label="VIN" placeholder="Numero de identificacion vehicular" />
                <Select
                  name="tipo"
                  label="Tipo"
                  placeholder="Seleccionar tipo"
                  options={[
                    { value: 'automovil', label: 'Automovil' },
                    { value: 'motocicleta', label: 'Motocicleta' },
                    { value: 'camioneta', label: 'Camioneta' },
                    { value: 'camion', label: 'Camion' },
                    { value: 'otro', label: 'Otro' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div style={{ height: 'var(--space-4)' }} />

        {/* Section 2: Especificaciones */}
        <Card>
          <CardContent>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Especificaciones</h2>
              <div className={styles.fieldGrid}>
                <Input name="marca" label="Marca" placeholder="Ej: Toyota" required />
                <Input name="modelo" label="Modelo" placeholder="Ej: Corolla" required />
                <Input name="ano" label="Ano" placeholder="Ej: 2022" type="number" />
                <Input name="color" label="Color" placeholder="Ej: Blanco" />
                <Select
                  name="combustible"
                  label="Combustible"
                  placeholder="Seleccionar combustible"
                  options={[
                    { value: 'gasolina', label: 'Gasolina' },
                    { value: 'gasoil', label: 'Gasoil' },
                    { value: 'glp', label: 'GLP' },
                    { value: 'electrico', label: 'Electrico' },
                    { value: 'hibrido', label: 'Hibrido' },
                  ]}
                />
                <Select
                  name="transmision"
                  label="Transmision"
                  placeholder="Seleccionar transmision"
                  options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'automatica', label: 'Automatica' },
                    { value: 'cvt', label: 'CVT' },
                  ]}
                />
                <Input name="cilindraje" label="Cilindraje" placeholder="Ej: 1.8L" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div style={{ height: 'var(--space-4)' }} />

        {/* Section 3: Estado actual */}
        <Card>
          <CardContent>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Estado actual</h2>
              <div className={styles.fieldGrid}>
                <Input name="kilometraje" label="Kilometraje actual" placeholder="Ej: 45320" type="number" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div style={{ height: 'var(--space-4)' }} />

        {/* Section 4: Dueno */}
        <Card>
          <CardContent>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Dueno</h2>
              <div className={styles.clientSearch}>
                {selectedCliente ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      border: '2px solid var(--color-primary-light)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)' }}>{selectedCliente.nombre}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {selectedCliente.cedula_rnc} &middot; {selectedCliente.telefono}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCliente(null);
                        setClientSearch('');
                        setClientes([]);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-danger)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Buscar cliente por nombre, cedula o telefono..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                    {searching && (
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Buscando...
                      </div>
                    )}
                    {clientes.length > 0 && (
                      <div
                        style={{
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {clientes.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCliente(c);
                              setClientes([]);
                              setClientSearch('');
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: 'var(--space-2) var(--space-3)',
                              background: 'none',
                              border: 'none',
                              borderBottom: '1px solid var(--color-border)',
                              cursor: 'pointer',
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            <div style={{ fontWeight: 'var(--font-medium)' }}>{c.nombre}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                              {c.cedula_rnc} &middot; {c.telefono}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {clientSearch.length >= 2 && clientes.length === 0 && !searching && (
                      <div className={styles.clientPlaceholder}>
                        No se encontraron clientes. Puede crear uno desde la seccion de clientes.
                      </div>
                    )}
                    {clientSearch.length < 2 && (
                      <div className={styles.clientPlaceholder}>
                        Busque un cliente para asociar al vehiculo
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div style={{ height: 'var(--space-4)' }} />

        {/* Section 5: Notas */}
        <Card>
          <CardContent>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Notas</h2>
              <Textarea
                name="notas"
                placeholder="Notas adicionales sobre el vehiculo..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className={styles.actions}>
          <Link href="/vehiculos">
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
