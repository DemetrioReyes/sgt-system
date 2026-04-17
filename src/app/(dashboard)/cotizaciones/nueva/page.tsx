'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea, Card } from '@/components/ui';
import { createCotizacion } from '@/lib/actions/cotizaciones';
import { createClient } from '@/lib/supabase/client';
import styles from './cotizacion-form.module.css';

interface Item {
  id: number;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

const tipoOptions = [
  { value: 'servicio', label: 'Servicio' },
  { value: 'repuesto', label: 'Repuesto' },
];

const monedaOptions = [
  { value: 'DOP', label: 'DOP (Peso dominicano)' },
  { value: 'USD', label: 'USD (Dolar)' },
];

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

let nextId = 2;

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientes, setClientes] = useState<Array<{ id: string; nombre: string }>>([]);
  const [vehiculos, setVehiculos] = useState<Array<{ id: string; placa: string; marca: string; modelo: string }>>([]);
  const [entradas, setEntradas] = useState<Array<{ id: string; numero: string; vehiculo_id: string; cliente_id: string }>>([]);

  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [entradaId, setEntradaId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [vigencia, setVigencia] = useState('15');
  const [moneda, setMoneda] = useState('DOP');

  const [items, setItems] = useState<Item[]>([
    { id: 1, tipo: 'servicio', descripcion: '', cantidad: 1, precioUnitario: 0 },
  ]);

  const [descuento, setDescuento] = useState(0);
  const [itbisEnabled, setItbisEnabled] = useState(true);
  const [notasCliente, setNotasCliente] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      const [clientesRes, vehiculosRes, entradasRes] = await Promise.all([
        supabase.from('clientes').select('id, nombre').order('nombre'),
        supabase.from('vehiculos').select('id, placa, marca, modelo').order('placa'),
        supabase.from('entradas_vehiculo').select('id, numero, vehiculo_id, cliente_id').not('estado', 'eq', 'entregado').order('created_at', { ascending: false }),
      ]);

      setClientes(clientesRes.data ?? []);
      setVehiculos(vehiculosRes.data ?? []);
      setEntradas(entradasRes.data ?? []);
    }

    loadData();
  }, []);

  const handleEntradaChange = (eId: string) => {
    setEntradaId(eId);
    const entrada = entradas.find((e) => e.id === eId);
    if (entrada) {
      setClienteId(entrada.cliente_id);
      setVehiculoId(entrada.vehiculo_id);
    }
  };

  const updateItem = (id: number, field: keyof Item, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: nextId++, tipo: 'servicio', descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
  const afterDiscount = subtotal - descuento;
  const itbis = itbisEnabled ? afterDiscount * 0.18 : 0;
  const total = afterDiscount + itbis;

  const handleSubmit = (_asEstado: 'borrador' | 'enviada') => {
    if (!clienteId || !vehiculoId) {
      setError('Selecciona un cliente y un vehiculo');
      return;
    }
    if (items.length === 0 || items.every((i) => !i.descripcion)) {
      setError('Agrega al menos un item con descripcion');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await createCotizacion({
        entrada_id: entradaId || undefined,
        cliente_id: clienteId,
        vehiculo_id: vehiculoId,
        vigencia_dias: parseInt(vigencia) || 15,
        moneda,
        notas_cliente: notasCliente || undefined,
        notas_internas: notasInternas || undefined,
        aplica_itbis: itbisEnabled,
        items: items.map((i) => ({
          tipo: i.tipo,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precio_unitario: i.precioUnitario,
        })),
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/cotizaciones');
      }
    });
  };

  const clienteOptions = [{ value: '', label: 'Seleccionar cliente...' }, ...clientes.map((c) => ({ value: c.id, label: c.nombre }))];
  const vehiculoOptions = [{ value: '', label: 'Seleccionar vehiculo...' }, ...vehiculos.map((v) => ({ value: v.id, label: `${v.placa} - ${v.marca} ${v.modelo}` }))];
  const entradaOptions = [{ value: '', label: 'Sin entrada...' }, ...entradas.map((e) => ({ value: e.id, label: e.numero }))];

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Nueva cotizacion</h1>
        <p className={styles.subtitle}>Crea una cotizacion para un cliente</p>
      </div>

      {error && (
        <Card>
          <div style={{ padding: 'var(--space-3)', color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        </Card>
      )}

      {/* Section 1: Datos generales */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Datos generales</h2>
          <div className={styles.fieldGrid}>
            <Select
              label="Entrada relacionada"
              options={entradaOptions}
              value={entradaId}
              onChange={(e) => handleEntradaChange(e.target.value)}
              placeholder="Sin entrada..."
            />
            <Select
              label="Cliente"
              options={clienteOptions}
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              placeholder="Seleccionar cliente..."
            />
            <Select
              label="Vehiculo"
              options={vehiculoOptions}
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              placeholder="Seleccionar vehiculo..."
            />
            <Input
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <Input
              label="Vigencia (dias)"
              type="number"
              value={vigencia}
              onChange={(e) => setVigencia(e.target.value)}
              min={1}
            />
            <Select
              label="Moneda"
              options={monedaOptions}
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Section 2: Items */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Items</h2>

          <div className={styles.itemsHeader}>
            <span>Tipo</span>
            <span>Descripcion</span>
            <span>Cant.</span>
            <span>Precio unit.</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div>
                  <span className={styles.mobileLabel}>Tipo</span>
                  <Select
                    options={tipoOptions}
                    value={item.tipo}
                    onChange={(e) => updateItem(item.id, 'tipo', e.target.value)}
                  />
                </div>
                <div>
                  <span className={styles.mobileLabel}>Descripcion</span>
                  <Input
                    value={item.descripcion}
                    onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                    placeholder="Descripcion del item..."
                  />
                </div>
                <div>
                  <span className={styles.mobileLabel}>Cantidad</span>
                  <Input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(item.id, 'cantidad', Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <span className={styles.mobileLabel}>Precio unitario</span>
                  <Input
                    type="number"
                    value={item.precioUnitario}
                    onChange={(e) => updateItem(item.id, 'precioUnitario', Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div className={styles.subtotalCell}>
                  <span className={styles.mobileLabel}>Subtotal</span>
                  {formatMoney(item.cantidad * item.precioUnitario)}
                </div>
                <button className={styles.deleteBtn} onClick={() => removeItem(item.id)} title="Eliminar item">
                  &times;
                </button>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" className={styles.addItemBtn} onClick={addItem}>
            + Agregar item
          </Button>
        </div>
      </Card>

      {/* Section 3: Totals */}
      <Card>
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Descuento</span>
            <Input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
              min={0}
              className={styles.discountInput}
            />
          </div>
          <div className={styles.totalRow}>
            <label className={styles.itbisCheck}>
              <input
                type="checkbox"
                checked={itbisEnabled}
                onChange={(e) => setItbisEnabled(e.target.checked)}
              />
              ITBIS (18%)
            </label>
            <span>{formatMoney(itbis)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalRowGrand}`}>
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </Card>

      {/* Section 4: Notas */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notas</h2>
          <div className={styles.notasGrid}>
            <Textarea
              label="Notas al cliente"
              placeholder="Notas visibles para el cliente..."
              value={notasCliente}
              onChange={(e) => setNotasCliente(e.target.value)}
            />
            <Textarea
              label="Notas internas"
              placeholder="Notas internas (no visibles para el cliente)..."
              value={notasInternas}
              onChange={(e) => setNotasInternas(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Footer actions */}
      <div className={styles.footerActions}>
        <Button variant="secondary" onClick={() => handleSubmit('borrador')} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar como borrador'}
        </Button>
        <Button variant="primary" onClick={() => handleSubmit('enviada')} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar y enviar'}
        </Button>
      </div>
    </div>
  );
}
