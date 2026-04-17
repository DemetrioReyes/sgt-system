'use client';

import { MessageCircle, FileDown, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './cotizacion-detalle.module.css';

interface Props {
  cotizacionId: string;
  numero: string;
  clienteNombre: string;
  clienteTelefono: string;
  vehiculoPlaca: string;
  total: number;
  nombreTaller: string;
}

function formatMoney(amount: number) {
  return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

function limpiarTelefono(tel: string) {
  const limpio = tel.replace(/[^0-9]/g, '');
  if (limpio.startsWith('1')) return limpio;
  if (limpio.startsWith('809') || limpio.startsWith('829') || limpio.startsWith('849')) {
    return '1' + limpio;
  }
  return limpio;
}

export default function CotizacionDetalleClient({
  cotizacionId,
  numero,
  clienteNombre,
  clienteTelefono,
  vehiculoPlaca,
  total,
  nombreTaller,
}: Props) {
  const linkPublico = `${window.location.origin}/publico/cotizacion/${cotizacionId}`;

  const mensaje = [
    `Hola ${clienteNombre},`,
    ``,
    `Le enviamos la cotización *${numero}* para su vehículo *${vehiculoPlaca}* por un total de *${formatMoney(total)}*.`,
    ``,
    `Puede ver los detalles y aprobar o rechazar desde este enlace:`,
    linkPublico,
    ``,
    `Quedamos a su orden.`,
    `— ${nombreTaller}`,
  ].join('\n');

  const whatsappUrl = clienteTelefono
    ? `https://wa.me/${limpiarTelefono(clienteTelefono)}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  function copiarLink() {
    navigator.clipboard.writeText(linkPublico);
    alert('Link copiado al portapapeles');
  }

  return (
    <div className={styles.headerActions}>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="primary" size="sm">
          <MessageCircle size={16} /> Enviar por WhatsApp
        </Button>
      </a>
      <Button variant="secondary" size="sm" onClick={copiarLink}>
        <Send size={16} /> Copiar link
      </Button>
      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        <FileDown size={16} /> PDF
      </Button>
    </div>
  );
}
