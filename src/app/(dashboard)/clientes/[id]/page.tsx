import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClienteDetalleView } from './ClienteDetalleView';

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !cliente) {
    notFound();
  }

  // Fetch related data in parallel
  const [vehiculosRes, facturasRes, cotizacionesRes, pagosRes] = await Promise.all([
    supabase.from('vehiculos').select('*').eq('cliente_id', id),
    supabase
      .from('facturas')
      .select('*')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false }),
    supabase
      .from('cotizaciones')
      .select('*')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false }),
    supabase
      .from('pagos')
      .select('*, facturas(numero)')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false }),
  ]);

  return (
    <ClienteDetalleView
      cliente={cliente}
      vehiculos={vehiculosRes.data || []}
      facturas={facturasRes.data || []}
      cotizaciones={cotizacionesRes.data || []}
      pagos={pagosRes.data || []}
    />
  );
}
