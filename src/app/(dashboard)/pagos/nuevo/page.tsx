'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card } from '@/components/ui';
import { createPago, getFacturasPendientes } from '@/lib/actions/pagos';
import styles from './pago-form.module.css';

type Metodo = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';

interface FacturaPendiente {
  id: string;
  numero: string;
  total: number;
  total_pagado: number;
  saldo_pendiente: number;
  clientes: { nombre: string } | null;
  vehiculos: { placa: string; marca: string; modelo: string } | null;
}

const metodos: { id: Metodo; label: string; icon: string }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: '\u{1F4B5}' },
  { id: 'transferencia', label: 'Transferencia', icon: '\u{1F3E6}' },
  { id: 'tarjeta', label: 'Tarjeta', icon: '\u{1F4B3}' },
  { id: 'cheque', label: 'Cheque', icon: '\u{1F4DD}' },
];

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

export default function NuevoPagoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [facturaSearch, setFacturaSearch] = useState('');
  const [facturasList, setFacturasList] = useState<FacturaPendiente[]>([]);
  const [factura, setFactura] = useState<FacturaPendiente | null>(null);
  const [monto, setMonto] = useState(0);
  const [metodo, setMetodo] = useState<Metodo>('efectivo');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  // Extra fields
  const [bancoOrigen, setBancoOrigen] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [ultimos4, setUltimos4] = useState('');
  const [tipoTarjeta, setTipoTarjeta] = useState('');
  const [autorizacion, setAutorizacion] = useState('');
  const [bancoCheque, setBancoCheque] = useState('');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [fechaCheque, setFechaCheque] = useState('');

  useEffect(() => {
    async function loadFacturas() {
      const result = await getFacturasPendientes(facturaSearch || undefined);
      if (result.data) {
        setFacturasList(result.data as unknown as FacturaPendiente[]);
      }
    }
    const timer = setTimeout(loadFacturas, 300);
    return () => clearTimeout(timer);
  }, [facturaSearch]);

  const selectFactura = (f: FacturaPendiente) => {
    setFactura(f);
    setFacturaSearch(f.numero);
    setMonto(0);
  };

  const saldo = factura ? Number(factura.saldo_pendiente ?? 0) : 0;
  const exceedsSaldo = factura ? monto > saldo : false;

  const handleSubmit = () => {
    if (!factura) {
      setError('Selecciona una factura');
      return;
    }
    if (!monto || monto <= 0) {
      setError('Ingresa un monto valido');
      return;
    }
    if (exceedsSaldo) {
      setError('El monto excede el saldo pendiente');
      return;
    }

    setError('');

    let referencia = '';
    if (metodo === 'transferencia') referencia = confirmacion;
    if (metodo === 'tarjeta') referencia = autorizacion;
    if (metodo === 'cheque') referencia = numeroCheque;

    startTransition(async () => {
      const result = await createPago({
        factura_id: factura.id,
        monto,
        metodo,
        referencia: referencia || undefined,
        banco_origen: bancoOrigen || bancoCheque || undefined,
        notas: notas || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/pagos');
      }
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Registrar pago</h1>
        <p className={styles.subtitle}>Registra un pago contra una factura</p>
      </div>

      {error && (
        <Card>
          <div style={{ padding: 'var(--space-3)', color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        </Card>
      )}

      {/* Section 1: Factura */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Factura</h2>
          <Input
            label="Buscar factura"
            placeholder="Buscar por # factura..."
            value={facturaSearch}
            onChange={(e) => {
              setFacturaSearch(e.target.value);
              if (factura && e.target.value !== factura.numero) {
                setFactura(null);
              }
            }}
          />
          {!factura && facturasList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
              {facturasList.slice(0, 5).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => selectFactura(f)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <strong>{f.numero}</strong> - {(f.clientes as { nombre: string } | null)?.nombre ?? '-'} | Saldo: {formatMoney(Number(f.saldo_pendiente ?? 0))}
                </button>
              ))}
            </div>
          )}
          {factura && (
            <>
              <div className={styles.facturaInfo}>
                <div><strong>{factura.numero}</strong> - {(factura.clientes as { nombre: string } | null)?.nombre ?? '-'}</div>
                <div>
                  {factura.vehiculos
                    ? `${(factura.vehiculos as { marca: string; modelo: string }).marca} ${(factura.vehiculos as { marca: string; modelo: string }).modelo} (${(factura.vehiculos as { placa: string }).placa})`
                    : '-'}
                </div>
                <div>Total: {formatMoney(Number(factura.total))} | Pagado: {formatMoney(Number(factura.total_pagado ?? 0))}</div>
              </div>
              <div className={styles.saldoDisplay}>
                <div>
                  <div className={styles.saldoLabel}>Saldo pendiente</div>
                  <div className={styles.saldoValue}>{formatMoney(saldo)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Section 2: Monto */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Monto</h2>
          <div className={styles.montoWrap}>
            <div className={styles.bigInput}>
              <Input
                type="number"
                value={monto || ''}
                onChange={(e) => setMonto(Number(e.target.value))}
                placeholder="0.00"
                min={0}
              />
            </div>
            {factura && (
              <div className={styles.quickButtons}>
                <Button variant="secondary" size="sm" onClick={() => setMonto(saldo)}>
                  Pagar todo
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setMonto(Math.round(saldo / 2))}>
                  50%
                </Button>
              </div>
            )}
            {exceedsSaldo && (
              <div className={styles.warning}>
                El monto excede el saldo pendiente de {formatMoney(saldo)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Section 3: Metodo */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Metodo de pago</h2>
          <div className={styles.metodoGrid}>
            {metodos.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${styles.metodoOption} ${metodo === m.id ? styles.metodoOptionActive : ''}`}
                onClick={() => setMetodo(m.id)}
              >
                <span className={styles.metodoIcon}>{m.icon}</span>
                <span className={styles.metodoLabel}>{m.label}</span>
              </button>
            ))}
          </div>

          {metodo === 'transferencia' && (
            <div className={styles.extraFields}>
              <Input label="Banco origen" value={bancoOrigen} onChange={(e) => setBancoOrigen(e.target.value)} placeholder="Nombre del banco" />
              <Input label="# Confirmacion" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} placeholder="Numero de confirmacion" />
            </div>
          )}

          {metodo === 'tarjeta' && (
            <div className={styles.extraFields}>
              <Input label="Ultimos 4 digitos" value={ultimos4} onChange={(e) => setUltimos4(e.target.value)} placeholder="0000" maxLength={4} />
              <Input label="Tipo de tarjeta" value={tipoTarjeta} onChange={(e) => setTipoTarjeta(e.target.value)} placeholder="Visa, Mastercard..." />
              <Input label="# Autorizacion" value={autorizacion} onChange={(e) => setAutorizacion(e.target.value)} placeholder="Numero de autorizacion" />
            </div>
          )}

          {metodo === 'cheque' && (
            <div className={styles.extraFields}>
              <Input label="Banco" value={bancoCheque} onChange={(e) => setBancoCheque(e.target.value)} placeholder="Nombre del banco" />
              <Input label="# Cheque" value={numeroCheque} onChange={(e) => setNumeroCheque(e.target.value)} placeholder="Numero del cheque" />
              <Input label="Fecha del cheque" type="date" value={fechaCheque} onChange={(e) => setFechaCheque(e.target.value)} />
            </div>
          )}
        </div>
      </Card>

      {/* Section 4: Notas */}
      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notas</h2>
          <Textarea
            placeholder="Notas adicionales sobre el pago..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </Card>

      {/* Footer */}
      <div className={styles.footerActions}>
        <Button variant="primary" disabled={!monto || exceedsSaldo || !factura || isPending} onClick={handleSubmit}>
          {isPending ? 'Registrando...' : 'Registrar pago'}
        </Button>
      </div>
    </div>
  );
}
