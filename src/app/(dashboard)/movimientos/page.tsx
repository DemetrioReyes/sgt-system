import { getMovimientos, getMovimientosTotals } from '@/lib/actions/movimientos';
import MovimientosClient from './movimientos-client';

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const [movResult, totalsResult] = await Promise.all([
    getMovimientos(tipo),
    getMovimientosTotals(),
  ]);

  const movimientos = movResult.data ?? [];
  const totals = totalsResult.data ?? { ingresos: 0, egresos: 0, balance: 0 };

  return (
    <MovimientosClient
      movimientos={movimientos}
      totals={totals}
      filtroTipo={tipo || ''}
    />
  );
}
