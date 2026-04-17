'use client';

import { MessageCircle, FileDown, Send, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import styles from './factura-detalle.module.css';

interface Props {
  facturaId: string;
  estado: string;
  saldo: number;
  clienteNombre: string;
  clienteTelefono: string;
  vehiculoPlaca: string;
  total: number;
}

function formatMoney(n: number) {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

function limpiarTelefono(tel: string) {
  const limpio = tel.replace(/[^0-9]/g, '');
  if (limpio.startsWith('1')) return limpio;
  if (limpio.startsWith('809') || limpio.startsWith('829') || limpio.startsWith('849')) return '1' + limpio;
  return limpio;
}

export default function FacturaAcciones({ facturaId, estado, saldo, clienteNombre, clienteTelefono, vehiculoPlaca, total }: Props) {
  const router = useRouter();

  const linkPublico = `${window.location.origin}/publico/factura/${facturaId}`;

  const mensaje = [
    `Hola ${clienteNombre},`,
    ``,
    `Le enviamos la factura de su vehículo *${vehiculoPlaca}* por un total de *${formatMoney(total)}*.`,
    ``,
    `Puede ver el detalle completo aquí:`,
    linkPublico,
    ``,
    `Quedamos a su orden.`,
    `— SGT Taller`,
  ].join('\n');

  const whatsappUrl = clienteTelefono
    ? `https://wa.me/${limpiarTelefono(clienteTelefono)}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className={styles.headerActions} data-print-hide>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="primary" size="sm">
          <MessageCircle size={16} /> Enviar por WhatsApp
        </Button>
      </a>
      {saldo > 0 && estado !== 'anulada' && (
        <Button variant="secondary" size="sm" onClick={() => router.push(`/pagos/nuevo?factura_id=${facturaId}`)}>
          <CreditCard size={16} /> Registrar pago
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(linkPublico); alert('Link copiado'); }}>
        <Send size={16} /> Copiar link
      </Button>
      <Button variant="ghost" size="sm" onClick={() => window.print()}>
        <FileDown size={16} /> PDF
      </Button>
    </div>
  );
}
