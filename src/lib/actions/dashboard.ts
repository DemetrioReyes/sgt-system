'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. Count active entries (estado not 'entregado')
    const { count: vehiculosEnTaller } = await supabase
      .from('entradas_vehiculo')
      .select('*', { count: 'exact', head: true })
      .not('estado', 'eq', 'entregado');

    // 2. Sum facturas saldo_pendiente where estado in ('pendiente','parcial')
    const { data: facturasPendientes } = await supabase
      .from('facturas')
      .select('saldo_pendiente')
      .in('estado', ['pendiente', 'parcial']);

    const porCobrar = (facturasPendientes ?? []).reduce(
      (s, f) => s + Number(f.saldo_pendiente ?? 0),
      0
    );

    // 3. Count cotizaciones where estado='enviada'
    const { count: cotizacionesPendientesCount } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'enviada');

    // 4. Sum movimientos where tipo='ingreso' and fecha this month
    const { data: ingresosDelMes } = await supabase
      .from('movimientos')
      .select('monto')
      .eq('tipo', 'ingreso')
      .gte('fecha', firstOfMonth);

    const totalIngresosMes = (ingresosDelMes ?? []).reduce(
      (s, m) => s + Number(m.monto),
      0
    );

    // 5. Recent 5 entries for vehicle list
    const { data: entradasRecientes } = await supabase
      .from('entradas_vehiculo')
      .select('id, estado, fecha_entrada, vehiculos(placa, marca, modelo), clientes(nombre), usuarios(nombre)')
      .not('estado', 'eq', 'entregado')
      .order('fecha_entrada', { ascending: false })
      .limit(5);

    // 6. Recent pending cotizaciones
    const { data: cotizacionesPendientesList } = await supabase
      .from('cotizaciones')
      .select('id, numero, total, created_at, vigencia_dias, clientes(nombre)')
      .eq('estado', 'enviada')
      .order('created_at', { ascending: false })
      .limit(5);

    // Compute dias for cotizaciones
    const cotizacionesConDias = (cotizacionesPendientesList ?? []).map((c) => {
      const createdAt = new Date(c.created_at);
      const vigenciaFin = new Date(
        createdAt.getTime() + (c.vigencia_dias || 30) * 86400000
      );
      const diasRestantes = Math.ceil(
        (vigenciaFin.getTime() - now.getTime()) / 86400000
      );
      return { ...c, dias_restantes: diasRestantes };
    });

    return {
      data: {
        vehiculosEnTaller: vehiculosEnTaller ?? 0,
        porCobrar,
        cotizacionesPendientes: cotizacionesPendientesCount ?? 0,
        ingresosMes: totalIngresosMes,
        entradas: entradasRecientes ?? [],
        cotizaciones: cotizacionesConDias,
      },
    };
  } catch {
    return { error: 'Error al obtener estadisticas del dashboard' };
  }
}
