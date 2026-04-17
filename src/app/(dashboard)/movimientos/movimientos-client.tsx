'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { Badge, Card, Table, Thead, Tbody, Tr, Th, Td, Button, Input, Select } from '@/components/ui';
import { createMovimiento } from '@/lib/actions/movimientos';
import styles from './movimientos.module.css';

const categoriasIngreso = [
  { value: 'Venta de servicios', label: 'Venta de servicios' },
  { value: 'Venta de repuestos', label: 'Venta de repuestos' },
  { value: 'Otros ingresos', label: 'Otros ingresos' },
];

const categoriasEgreso = [
  { value: 'Nomina / salarios', label: 'Nómina / salarios' },
  { value: 'Compra de repuestos', label: 'Compra de repuestos' },
  { value: 'Herramientas y equipos', label: 'Herramientas y equipos' },
  { value: 'Servicios publicos', label: 'Servicios públicos (luz, agua, internet)' },
  { value: 'Renta del local', label: 'Renta del local' },
  { value: 'Combustible', label: 'Combustible' },
  { value: 'Comida y viaticos', label: 'Comida y viáticos' },
  { value: 'Publicidad', label: 'Publicidad' },
  { value: 'Impuestos', label: 'Impuestos' },
  { value: 'Mantenimiento del taller', label: 'Mantenimiento del taller' },
  { value: 'Otros gastos', label: 'Otros gastos' },
];

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO')}`;
}

interface Props {
  movimientos: Record<string, unknown>[];
  totals: { ingresos: number; egresos: number; balance: number };
  filtroTipo: string;
}

export default function MovimientosClient({ movimientos, totals, filtroTipo }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState<'ingreso' | 'egreso' | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await createMovimiento(formData);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Movimiento registrado correctamente' });
        setShowForm(null);
        router.refresh();
      }
    });
  }

  const categorias = showForm === 'ingreso' ? categoriasIngreso : categoriasEgreso;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Movimientos financieros</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant={showForm === 'ingreso' ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setShowForm(showForm === 'ingreso' ? null : 'ingreso')}
          >
            {showForm === 'ingreso' ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Ingreso</>}
          </Button>
          <Button
            variant={showForm === 'egreso' ? 'ghost' : 'danger'}
            size="sm"
            onClick={() => setShowForm(showForm === 'egreso' ? null : 'egreso')}
          >
            {showForm === 'egreso' ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Egreso</>}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiRow}>
        <Card className={styles.kpi}>
          <div className={`${styles.kpiValue} ${styles.kpiValueGreen}`}>{formatMoney(totals.ingresos)}</div>
          <div className={styles.kpiLabel}>Ingresos del mes</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={`${styles.kpiValue} ${styles.kpiValueRed}`}>{formatMoney(totals.egresos)}</div>
          <div className={styles.kpiLabel}>Egresos del mes</div>
        </Card>
        <Card className={styles.kpi}>
          <div className={styles.kpiValue}>{formatMoney(totals.balance)}</div>
          <div className={styles.kpiLabel}>Balance</div>
        </Card>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card padding="md">
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
            Registrar {showForm === 'ingreso' ? 'ingreso' : 'egreso'}
          </h2>
          <form action={handleSubmit}>
            <input type="hidden" name="tipo" value={showForm} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <Select
                label="Categoría"
                name="categoria"
                options={categorias}
                required
              />
              <Input
                label="Monto (RD$)"
                name="monto"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              />
              <Input
                label="Fecha"
                name="fecha"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
              <Input
                label="Descripción"
                name="descripcion"
                placeholder={showForm === 'egreso' ? 'Ej: Pago mecánico Pedro - Semana 15' : 'Detalle del ingreso'}
                required
              />
            </div>
            {message && (
              <div style={{
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                background: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
              }}>
                {message.text}
              </div>
            )}
            <Button type="submit" variant={showForm === 'ingreso' ? 'primary' : 'danger'} loading={isPending}>
              Registrar {showForm}
            </Button>
          </form>
        </Card>
      )}

      {/* Filtro */}
      <Card>
        <div className={styles.filters}>
          <form className={styles.filters}>
            <div className={styles.filterItem}>
              <select name="tipo" defaultValue={filtroTipo} className={styles.filterSelect}>
                <option value="">Todos</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <div className={styles.filterItem}>
              <Button type="submit" variant="secondary" size="sm">Filtrar</Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Lista */}
      {movimientos.length === 0 ? (
        <Card>
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No se encontraron movimientos
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Tipo</Th>
                  <Th>Categoría</Th>
                  <Th>Descripción</Th>
                  <Th>Monto</Th>
                </Tr>
              </Thead>
              <Tbody>
                {movimientos.map((m) => (
                  <Tr key={m.id as string}>
                    <Td>{m.fecha ? new Date(m.fecha as string).toLocaleDateString('es-DO') : '-'}</Td>
                    <Td>
                      <Badge variant={m.tipo === 'ingreso' ? 'success' : 'danger'}>
                        {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </Td>
                    <Td>{(m.categoria as string) ?? '-'}</Td>
                    <Td>{(m.descripcion as string) ?? '-'}</Td>
                    <Td className={m.tipo === 'ingreso' ? styles.montoIngreso : styles.montoEgreso}>
                      {m.tipo === 'ingreso' ? '+' : '-'}{formatMoney(Number(m.monto))}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>

          <div className={styles.mobileCards}>
            {movimientos.map((m) => (
              <Card key={m.id as string} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <Badge variant={m.tipo === 'ingreso' ? 'success' : 'danger'}>
                    {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                  </Badge>
                  <span className={m.tipo === 'ingreso' ? styles.montoIngreso : styles.montoEgreso}>
                    {m.tipo === 'ingreso' ? '+' : '-'}{formatMoney(Number(m.monto))}
                  </span>
                </div>
                <div className={styles.mobileCardBody}>
                  <div><strong>{(m.descripcion as string) ?? '-'}</strong></div>
                  <div>{(m.categoria as string) ?? '-'} | {m.fecha ? new Date(m.fecha as string).toLocaleDateString('es-DO') : '-'}</div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
