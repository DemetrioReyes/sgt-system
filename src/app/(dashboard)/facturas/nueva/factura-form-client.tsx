'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { createFactura } from '@/lib/actions/facturas';
import styles from './factura-form.module.css';

interface Item {
  tipo: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

function formatMoney(n: number) {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

export default function FacturaFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('orden_id');

  const [loading, setLoading] = useState(false);
  const [loadingOrden, setLoadingOrden] = useState(!!ordenId);
  const [error, setError] = useState('');

  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [vehiculoPlaca, setVehiculoPlaca] = useState('');
  const [tipoNcf, setTipoNcf] = useState('B02');
  const [descuento, setDescuento] = useState(0);
  const [items, setItems] = useState<Item[]>([
    { tipo: 'servicio', descripcion: '', cantidad: 1, precio_unitario: 0 },
  ]);

  // Si viene de una orden, cargar datos
  useEffect(() => {
    if (!ordenId) return;

    async function cargarOrden() {
      const supabase = createClient();

      // Cargar orden con relaciones
      const { data: orden } = await supabase
        .from('ordenes_trabajo')
        .select('*, clientes(id, nombre), vehiculos(id, placa, marca, modelo), cotizaciones(id)')
        .eq('id', ordenId)
        .single();

      if (!orden) {
        setLoadingOrden(false);
        return;
      }

      const cliente = orden.clientes as { id: string; nombre: string } | null;
      const vehiculo = orden.vehiculos as { id: string; placa: string; marca: string; modelo: string } | null;
      const cotizacion = orden.cotizaciones as { id: string } | null;

      if (cliente) {
        setClienteId(cliente.id);
        setClienteNombre(cliente.nombre);
      }
      if (vehiculo) {
        setVehiculoId(vehiculo.id);
        setVehiculoPlaca(`${vehiculo.placa} — ${vehiculo.marca} ${vehiculo.modelo}`);
      }

      // Cargar items de la cotización si existe
      if (cotizacion?.id) {
        const { data: cotItems } = await supabase
          .from('cotizacion_items')
          .select('*')
          .eq('cotizacion_id', cotizacion.id);

        if (cotItems && cotItems.length > 0) {
          setItems(cotItems.map((i) => ({
            tipo: i.tipo,
            descripcion: i.descripcion,
            cantidad: Number(i.cantidad),
            precio_unitario: Number(i.precio_unitario),
          })));
        }
      }

      setLoadingOrden(false);
    }

    cargarOrden();
  }, [ordenId]);

  function updateItem(index: number, field: keyof Item, value: string | number) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, { tipo: 'servicio', descripcion: '', cantidad: 1, precio_unitario: 0 }]);
  }

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const itbis = (subtotal - descuento) * 0.18;
  const total = subtotal - descuento + itbis;

  async function handleSubmit() {
    if (!clienteId || !vehiculoId) {
      setError('Faltan datos de cliente y vehículo');
      return;
    }
    if (items.some((i) => !i.descripcion || i.precio_unitario <= 0)) {
      setError('Todos los ítems deben tener descripción y precio');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createFactura({
      orden_id: ordenId || undefined,
      cliente_id: clienteId,
      vehiculo_id: vehiculoId,
      tipo_ncf: tipoNcf,
      items,
      descuento,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/facturas');
  }

  if (loadingOrden) {
    return (
      <div className={styles.page}>
        <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
          Cargando datos de la orden...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/facturas" className={styles.backLink}>&larr; Volver a facturas</Link>
      <h1 className={styles.title}>Nueva Factura</h1>

      {/* Datos generales */}
      <Card padding="md">
        <CardContent>
          <h2 className={styles.sectionTitle}>Datos generales</h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldReadonly}>
              <span className={styles.fieldLabel}>Cliente</span>
              <span className={styles.fieldValue}>{clienteNombre || 'No seleccionado'}</span>
            </div>
            <div className={styles.fieldReadonly}>
              <span className={styles.fieldLabel}>Vehículo</span>
              <span className={styles.fieldValue}>{vehiculoPlaca || 'No seleccionado'}</span>
            </div>
            <div>
              <label className={styles.fieldLabel}>Tipo de comprobante</label>
              <select className={styles.select} value={tipoNcf} onChange={(e) => setTipoNcf(e.target.value)}>
                <option value="B02">Factura de Consumo (B02)</option>
                <option value="B01">Factura Crédito Fiscal (B01)</option>
                <option value="B14">Régimen Especial (B14)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card padding="md">
        <CardContent>
          <h2 className={styles.sectionTitle}>Ítems</h2>
          <div className={styles.itemsList}>
            {items.map((item, i) => (
              <div key={i} className={styles.itemRow}>
                <select
                  className={styles.selectSmall}
                  value={item.tipo}
                  onChange={(e) => updateItem(i, 'tipo', e.target.value)}
                >
                  <option value="servicio">Servicio</option>
                  <option value="repuesto">Repuesto</option>
                </select>
                <input
                  className={styles.inputDesc}
                  placeholder="Descripción"
                  value={item.descripcion}
                  onChange={(e) => updateItem(i, 'descripcion', e.target.value)}
                />
                <input
                  className={styles.inputNum}
                  type="number"
                  min="1"
                  placeholder="Cant."
                  value={item.cantidad}
                  onChange={(e) => updateItem(i, 'cantidad', Number(e.target.value))}
                />
                <input
                  className={styles.inputNum}
                  type="number"
                  min="0"
                  placeholder="Precio"
                  value={item.precio_unitario || ''}
                  onChange={(e) => updateItem(i, 'precio_unitario', Number(e.target.value))}
                />
                <span className={styles.itemSubtotal}>
                  {formatMoney(item.cantidad * item.precio_unitario)}
                </span>
                <button className={styles.removeBtn} onClick={() => removeItem(i)} disabled={items.length <= 1}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={addItem}>
            <Plus size={16} /> Agregar ítem
          </Button>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card padding="md">
        <CardContent>
          <h2 className={styles.sectionTitle}>Totales</h2>
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Descuento</span>
              <input
                className={styles.inputNumSmall}
                type="number"
                min="0"
                value={descuento || ''}
                onChange={(e) => setDescuento(Number(e.target.value))}
              />
            </div>
            <div className={styles.totalRow}>
              <span>ITBIS (18%)</span>
              <span>{formatMoney(itbis)}</span>
            </div>
            <div className={styles.totalGrand}>
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      <div className={styles.footerBtns}>
        <Button variant="primary" size="lg" loading={loading} onClick={handleSubmit}>
          Emitir factura
        </Button>
        <Link href="/facturas">
          <Button variant="ghost">Cancelar</Button>
        </Link>
      </div>
    </div>
  );
}
