import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, CardContent } from '@/components/ui';
import { getEntrada } from '@/lib/actions/entradas';
import { getMecanicos } from '@/lib/actions/ordenes';
import styles from './detalle-entrada.module.css';
import EntradaDetalleClient from './detalle-client';

const estadoLabels: Record<string, string> = {
  recibido: 'Recibido',
  en_diagnostico: 'En diagnostico',
  cotizado: 'Cotizado',
  aprobado: 'Aprobado',
  en_reparacion: 'En reparacion',
  listo: 'Listo',
  entregado: 'Entregado',
};

const estadoBadgeVariant = (estado: string) => {
  if (estado === 'listo') return 'success';
  if (estado === 'entregado') return 'default';
  if (estado === 'en_reparacion' || estado === 'en_diagnostico') return 'warning';
  return 'info';
};

export default async function EntradaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entradaResult, mecanicosResult] = await Promise.all([
    getEntrada(id),
    getMecanicos(),
  ]);

  const { data: entrada, error } = entradaResult;
  const mecanicosList = mecanicosResult.data ?? [];

  if (error || !entrada) {
    notFound();
  }

  const e = entrada;
  const vehiculo = e.vehiculos as {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano: number;
    color: string;
  } | null;
  const cliente = e.clientes as {
    id: string;
    nombre: string;
    telefono: string;
    email: string;
  } | null;
  const mecanico = e.usuarios as {
    id: string;
    nombre: string;
    rol: string;
  } | null;

  const mecanicoInicial = mecanico?.nombre
    ? mecanico.nombre
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  const sintomas = Array.isArray(e.sintomas) ? e.sintomas : [];

  // Build timeline from available data
  const timeline: { fecha: string; texto: string }[] = [];
  if (e.created_at) {
    timeline.push({
      fecha: new Date(e.created_at).toLocaleString('es-DO'),
      texto: 'Entrada registrada',
    });
  }
  if (e.fecha_entrada && e.fecha_entrada !== e.created_at) {
    timeline.push({
      fecha: new Date(e.fecha_entrada).toLocaleString('es-DO'),
      texto: 'Vehiculo recibido en taller',
    });
  }

  return (
    <div className={styles.page}>
      <Link href="/entradas" className={styles.backLink}>
        &larr; Volver a entradas
      </Link>

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <span className={styles.entradaCode}>{e.numero}</span>
            <div className={styles.headerMeta}>
              <span>{vehiculo?.placa || ''}</span>
              <span>&middot;</span>
              <span>{cliente?.nombre || ''}</span>
              <Badge variant={estadoBadgeVariant(e.estado)}>
                {estadoLabels[e.estado] || e.estado}
              </Badge>
              <span className={styles.timeInShop}>{e.tiempo_en_taller}</span>
            </div>
          </div>
          <EntradaDetalleClient
            entradaId={e.id}
            estado={e.estado}
            mecanicoId={mecanico?.id || null}
            mecanicos={mecanicosList}
          />
        </div>
      </header>

      <div className={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Reception info */}
          <Card>
            <CardContent>
              <div className={styles.cardTitle}>
                <span>Informacion de recepcion</span>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Kilometraje</span>
                  <span className={styles.infoValue}>
                    {e.kilometraje ? e.kilometraje.toLocaleString('es-DO') + ' km' : '-'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nivel de combustible</span>
                  <span className={styles.infoValue}>{e.nivel_combustible || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Urgencia</span>
                  <span className={styles.infoValue}>{e.urgencia || 'normal'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha entrada</span>
                  <span className={styles.infoValue}>
                    {e.fecha_entrada
                      ? new Date(e.fecha_entrada).toLocaleString('es-DO')
                      : '-'}
                  </span>
                </div>
              </div>
              {e.descripcion_problema && (
                <p className={styles.description}>{e.descripcion_problema}</p>
              )}
              {sintomas.length > 0 && (
                <div className={styles.symptomsRow}>
                  {sintomas.map((s: string) => (
                    <Badge key={s} variant="info">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          {timeline.length > 0 && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Cronologia</h2>
                <div className={styles.timeline}>
                  {timeline.map((item, i) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineDate}>{item.fecha}</div>
                      <div className={styles.timelineText}>{item.texto}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostic section */}
          {e.diagnostico && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Diagnostico</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {e.diagnostico}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Internal notes */}
          {e.notas_internas && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Notas internas</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {e.notas_internas}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Vehicle info */}
          {vehiculo && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Vehiculo</h2>
                <Link
                  href={`/vehiculos/${vehiculo.id}`}
                  style={{
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {vehiculo.placa}
                </Link>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                  {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano || ''}
                  {vehiculo.color ? ` - ${vehiculo.color}` : ''}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client info */}
          {cliente && (
            <Card>
              <CardContent>
                <h2 className={styles.cardTitle}>Cliente</h2>
                <Link
                  href={`/clientes/${cliente.id}`}
                  style={{
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {cliente.nombre}
                </Link>
                {cliente.telefono && (
                  <a
                    href={`tel:${cliente.telefono}`}
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    {cliente.telefono}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mechanic assignment */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Mecanico asignado</h2>
              {mecanico ? (
                <div className={styles.mechanicRow}>
                  <div className={styles.mechanicAvatar}>{mecanicoInicial}</div>
                  <div className={styles.mechanicInfo}>
                    <span className={styles.mechanicName}>{mecanico.nombre}</span>
                    <span className={styles.mechanicRole}>{mecanico.rol || ''}</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Sin mecanico asignado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related actions */}
          <Card>
            <CardContent>
              <h2 className={styles.cardTitle}>Acciones relacionadas</h2>
              <div className={styles.relatedLinks}>
                {vehiculo && (
                  <Link href={`/vehiculos/${vehiculo.id}`} className={styles.relatedLink}>
                    Ver vehiculo
                  </Link>
                )}
                {cliente && (
                  <Link href={`/clientes/${cliente.id}`} className={styles.relatedLink}>
                    Ver cliente
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
