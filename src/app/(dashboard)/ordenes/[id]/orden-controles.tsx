'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Package, CheckCircle, MessageCircle, UserPlus } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { updateOrdenEstado, asignarMecanicoOrden } from '@/lib/actions/ordenes';
import styles from './orden-detalle.module.css';

interface Props {
  ordenId: string;
  estado: string;
  progreso: number;
  mecanicoId: string | null;
  mecanicos: { id: string; nombre: string; rol: string }[];
  clienteNombre: string;
  clienteTelefono: string;
  vehiculoPlaca: string;
  nombreTaller: string;
}

function limpiarTelefono(tel: string) {
  const limpio = tel.replace(/[^0-9]/g, '');
  if (limpio.startsWith('1')) return limpio;
  if (limpio.startsWith('809') || limpio.startsWith('829') || limpio.startsWith('849')) return '1' + limpio;
  return limpio;
}

export default function OrdenControles({
  ordenId,
  estado,
  progreso,
  mecanicoId,
  mecanicos,
  clienteNombre,
  clienteTelefono,
  vehiculoPlaca,
  nombreTaller,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [showMecanicoSelect, setShowMecanicoSelect] = useState(false);

  async function cambiarEstado(nuevoEstado: string, nuevoProg?: number) {
    setLoading(nuevoEstado);
    await updateOrdenEstado(ordenId, nuevoEstado, nuevoProg);
    router.refresh();
    setLoading('');
  }

  async function asignarMecanico(id: string) {
    setLoading('mecanico');
    await asignarMecanicoOrden(ordenId, id);
    setShowMecanicoSelect(false);
    router.refresh();
    setLoading('');
  }

  function enviarWhatsApp(mensaje: string) {
    const url = clienteTelefono
      ? `https://wa.me/${limpiarTelefono(clienteTelefono)}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  const completada = estado === 'completada';

  return (
    <>
      {/* Botones de estado */}
      <Card padding="md">
        <CardContent>
          <h2 className={styles.cardTitle}>Acciones</h2>
          <div className={styles.accionesBtns}>
            {estado === 'pendiente' && (
              <>
                <Button
                  variant="primary"
                  loading={loading === 'en_progreso'}
                  onClick={() => cambiarEstado('en_progreso')}
                >
                  <Play size={16} /> Iniciar trabajo
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowMecanicoSelect(!showMecanicoSelect)}
                >
                  <UserPlus size={16} /> Asignar mecánico
                </Button>
              </>
            )}

            {estado === 'en_progreso' && (
              <>
                <Button
                  variant="secondary"
                  loading={loading === 'espera_repuesto'}
                  onClick={() => cambiarEstado('espera_repuesto', progreso)}
                >
                  <Package size={16} /> En espera de repuesto
                </Button>
                <Button
                  variant="primary"
                  loading={loading === 'completada'}
                  onClick={() => cambiarEstado('completada', 100)}
                >
                  <CheckCircle size={16} /> Marcar completada
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => enviarWhatsApp(
                    `Hola ${clienteNombre}, le informamos que su vehículo ${vehiculoPlaca} está en proceso de reparación. Le mantendremos informado del progreso.\n\n— ${nombreTaller}`
                  )}
                >
                  <MessageCircle size={16} /> Notificar al cliente
                </Button>
              </>
            )}

            {estado === 'espera_repuesto' && (
              <>
                <Button
                  variant="primary"
                  loading={loading === 'en_progreso'}
                  onClick={() => cambiarEstado('en_progreso', progreso)}
                >
                  <Play size={16} /> Reanudar trabajo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => enviarWhatsApp(
                    `Hola ${clienteNombre}, le informamos que estamos a la espera de un repuesto para su vehículo ${vehiculoPlaca}. Le notificaremos tan pronto lo tengamos.\n\n— ${nombreTaller}`
                  )}
                >
                  <MessageCircle size={16} /> Notificar al cliente
                </Button>
              </>
            )}

            {completada && (
              <>
                <div className={styles.completadaBanner}>
                  <CheckCircle size={24} />
                  <div>
                    <strong>Orden completada</strong>
                    <p>El vehículo está listo para entregar</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => enviarWhatsApp(
                    `Hola ${clienteNombre}, ¡su vehículo ${vehiculoPlaca} está listo para recoger! 🎉\n\nPuede pasar por el taller en nuestro horario de atención.\n\n— ${nombreTaller}`
                  )}
                >
                  <MessageCircle size={16} /> Notificar al cliente que está listo
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/facturas/nueva?orden_id=${ordenId}`)}
                >
                  Generar factura
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selector de mecánico */}
      {showMecanicoSelect && (
        <Card padding="md">
          <CardContent>
            <h2 className={styles.cardTitle}>Seleccionar mecánico</h2>
            <div className={styles.mecanicoList}>
              {mecanicos.map((m) => (
                <button
                  key={m.id}
                  className={`${styles.mecanicoOption} ${m.id === mecanicoId ? styles.mecanicoSelected : ''}`}
                  onClick={() => asignarMecanico(m.id)}
                  disabled={loading === 'mecanico'}
                >
                  <div className={styles.mecanicoAvatar}>{m.nombre.charAt(0)}</div>
                  <div>
                    <div className={styles.mecanicoNombreOption}>{m.nombre}</div>
                    <div className={styles.mecanicoRol}>{m.rol}</div>
                  </div>
                </button>
              ))}
              {mecanicos.length === 0 && (
                <p className={styles.noMecanicos}>No hay mecánicos registrados</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
