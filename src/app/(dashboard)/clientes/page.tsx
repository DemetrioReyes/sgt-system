import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ClientesView } from './ClientesView';

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(
      `nombre.ilike.%${q}%,cedula_rnc.ilike.%${q}%,telefono.ilike.%${q}%`
    );
  }

  const { data: clientes } = await query;

  return (
    <Suspense fallback={<div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando...</div>}>
      <ClientesView clientes={clientes || []} busqueda={q || ''} />
    </Suspense>
  );
}
