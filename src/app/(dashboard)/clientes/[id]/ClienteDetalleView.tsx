'use client';

import Link from 'next/link';
import { ArrowLeft, Edit, MessageCircle, Phone, Car, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { deleteCliente } from '@/lib/actions/clientes';
import styles from './cliente-detalle.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  cliente: any;
  vehiculos: any[];
  facturas: any[];
  cotizaciones: any[];
  pagos: any[];
}

function formatMoney(val: number) {
  return `RD$${val?.toLocaleString() ?? 0}`;
}

function formatDate(val: string | null) {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('es-DO');
}

export function ClienteDetalleView({
  cliente,
  vehiculos,
  facturas,
  cotizaciones,
  pagos,
}: Props) {
  const deleteAction = deleteCliente.bind(null, cliente.id);

  const tabs = [
    {
      id: 'vehiculos',
      label: `Vehiculos (${vehiculos.length})`,
      content: (
        <div className={styles.vehicleList}>
          {vehiculos.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
              No hay vehiculos registrados
            </p>
          )}
          {vehiculos.map((v) => (
            <Link href={`/vehiculos/${v.id}`} key={v.id} className={styles.vehicleCard}>
              <div className={styles.vehicleIcon}>
                <Car size={22} />
              </div>
              <div className={styles.vehicleInfo}>
                <span className={styles.vehiclePlaca}>{v.placa}</span>
                <span className={styles.vehicleModel}>
                  {v.marca} {v.modelo}
                </span>
                <span className={styles.vehicleYear}>
                  {v.anio} {v.color ? `- ${v.color}` : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ),
    },
    {
      id: 'facturas',
      label: `Facturas (${facturas.length})`,
      content: (
        <>
          {facturas.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
              No hay facturas
            </p>
          )}
          <div className={styles.desktopTable}>
            <div className={styles.tableWrapper}>
              <table className={styles.tabTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Saldo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.numero}</td>
                      <td>{formatDate(f.fecha)}</td>
                      <td>{formatMoney(f.total)}</td>
                      <td>{formatMoney(f.saldo)}</td>
                      <td>
                        <Badge variant={f.estado === 'pagada' ? 'success' : 'warning'}>
                          {f.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.mobileCards}>
            {facturas.map((f) => (
              <div key={f.id} className={styles.mobileCard}>
                <div className={styles.mobileCardRow}>
                  <span style={{ fontWeight: 600 }}>{f.numero}</span>
                  <Badge variant={f.estado === 'pagada' ? 'success' : 'warning'}>
                    {f.estado}
                  </Badge>
                </div>
                <div className={styles.mobileCardRow}>
                  <span>{formatDate(f.fecha)}</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(f.total)}</span>
                </div>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileLabel}>Saldo</span>
                  <span>{formatMoney(f.saldo)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'cotizaciones',
      label: `Cotizaciones (${cotizaciones.length})`,
      content: (
        <>
          {cotizaciones.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
              No hay cotizaciones
            </p>
          )}
          <div className={styles.desktopTable}>
            <div className={styles.tableWrapper}>
              <table className={styles.tabTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.numero}</td>
                      <td>{formatDate(c.fecha)}</td>
                      <td>{formatMoney(c.total)}</td>
                      <td>
                        <Badge variant={c.estado === 'aceptada' ? 'success' : 'warning'}>
                          {c.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.mobileCards}>
            {cotizaciones.map((c) => (
              <div key={c.id} className={styles.mobileCard}>
                <div className={styles.mobileCardRow}>
                  <span style={{ fontWeight: 600 }}>{c.numero}</span>
                  <Badge variant={c.estado === 'aceptada' ? 'success' : 'warning'}>
                    {c.estado}
                  </Badge>
                </div>
                <div className={styles.mobileCardRow}>
                  <span>{formatDate(c.fecha)}</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(c.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'pagos',
      label: `Pagos (${pagos.length})`,
      content: (
        <>
          {pagos.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
              No hay pagos
            </p>
          )}
          <div className={styles.desktopTable}>
            <div className={styles.tableWrapper}>
              <table className={styles.tabTable}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Metodo</th>
                    <th>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.fecha)}</td>
                      <td>{formatMoney(p.monto)}</td>
                      <td>{p.metodo}</td>
                      <td style={{ fontWeight: 600 }}>
                        {p.facturas?.numero || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.mobileCards}>
            {pagos.map((p) => (
              <div key={p.id} className={styles.mobileCard}>
                <div className={styles.mobileCardRow}>
                  <span>{formatDate(p.fecha)}</span>
                  <span style={{ fontWeight: 600 }}>{formatMoney(p.monto)}</span>
                </div>
                <div className={styles.mobileCardRow}>
                  <span>{p.metodo}</span>
                  <span>{p.facturas?.numero || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Link href="/clientes" className={styles.backLink}>
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.clientName}>{cliente.nombre}</h1>
          <Badge variant={cliente.tipo === 'empresa' ? 'info' : 'default'}>
            {cliente.tipo === 'empresa' ? 'Empresa' : 'Persona'}
          </Badge>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm">
            <Edit size={16} /> Editar
          </Button>
          {cliente.telefono && (
            <>
              <a href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm" type="button">
                  <MessageCircle size={16} /> WhatsApp
                </Button>
              </a>
              <a href={`tel:${cliente.telefono}`}>
                <Button variant="secondary" size="sm" type="button">
                  <Phone size={16} /> Llamar
                </Button>
              </a>
            </>
          )}
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm('Seguro que deseas eliminar este cliente?')) {
                e.preventDefault();
              }
            }}
          >
            <Button variant="danger" size="sm" type="submit">
              <Trash2 size={16} /> Eliminar
            </Button>
          </form>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          {/* Contact info */}
          <Card padding="md">
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>
                  {cliente.tipo === 'empresa' ? 'RNC' : 'Cedula'}
                </span>
                <span className={styles.contactValue}>{cliente.cedula_rnc}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Telefono</span>
                <a href={`tel:${cliente.telefono}`} className={styles.contactLink}>
                  <Phone size={14} /> {cliente.telefono}
                </a>
              </div>
              {cliente.telefono2 && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Telefono 2</span>
                  <a href={`tel:${cliente.telefono2}`} className={styles.contactLink}>
                    <Phone size={14} /> {cliente.telefono2}
                  </a>
                </div>
              )}
              {cliente.email && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email</span>
                  <span className={styles.contactValue}>{cliente.email}</span>
                </div>
              )}
              {cliente.direccion && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Direccion</span>
                  <span className={styles.contactValue}>
                    {[cliente.direccion, cliente.municipio, cliente.provincia]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {cliente.notas && (
                <div className={styles.notesText}>
                  <strong>Notas:</strong> {cliente.notas}
                </div>
              )}
            </div>
          </Card>

          {/* Tabs */}
          <Tabs tabs={tabs} defaultTab="vehiculos" />
        </div>

        {/* Stats sidebar */}
        <aside className={styles.sidebar}>
          <Card padding="md">
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Cliente desde</span>
                <span className={styles.statValue}>{formatDate(cliente.created_at)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Vehiculos</span>
                <span className={styles.statValue}>{vehiculos.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Facturas</span>
                <span className={styles.statValue}>{facturas.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>WhatsApp mismo #</span>
                <span className={styles.statValue}>
                  {cliente.whatsapp_mismo ? 'Si' : 'No'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Recordatorios</span>
                <span className={styles.statValue}>
                  {cliente.acepta_recordatorios ? 'Si' : 'No'}
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
