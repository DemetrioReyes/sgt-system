'use server';

import { createClient } from '@/lib/supabase/server';

function getDefaultRange() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { desde, hasta };
}

// ── Ventas por periodo ──────────────────────────────────────────────
export async function reporteVentasPeriodo(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('facturas')
      .select('fecha, total')
      .gte('fecha', d)
      .lte('fecha', h)
      .neq('estado', 'anulada')
      .order('fecha', { ascending: true });

    if (error) return { error: error.message };

    const grouped: Record<string, { fecha: string; total_facturas: number; monto_total: number }> = {};
    for (const f of data ?? []) {
      const key = f.fecha;
      if (!grouped[key]) grouped[key] = { fecha: key, total_facturas: 0, monto_total: 0 };
      grouped[key].total_facturas += 1;
      grouped[key].monto_total += Number(f.total) || 0;
    }

    return { data: Object.values(grouped) };
  } catch {
    return { error: 'Error al generar reporte de ventas por periodo' };
  }
}

// ── Ventas por servicio/repuesto ────────────────────────────────────
export async function reporteVentasServicioRepuesto(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('factura_items')
      .select('tipo, descripcion, cantidad, subtotal, facturas!inner(fecha, estado)')
      .gte('facturas.fecha', d)
      .lte('facturas.fecha', h)
      .neq('facturas.estado', 'anulada');

    if (error) return { error: error.message };

    const grouped: Record<string, { tipo: string; descripcion: string; cantidad_total: number; monto_total: number }> = {};
    for (const item of data ?? []) {
      const key = `${item.tipo}::${item.descripcion}`;
      if (!grouped[key]) grouped[key] = { tipo: item.tipo, descripcion: item.descripcion, cantidad_total: 0, monto_total: 0 };
      grouped[key].cantidad_total += Number(item.cantidad) || 0;
      grouped[key].monto_total += Number(item.subtotal) || 0;
    }

    const result = Object.values(grouped).sort((a, b) => b.monto_total - a.monto_total);
    return { data: result };
  } catch {
    return { error: 'Error al generar reporte de ventas por servicio/repuesto' };
  }
}

// ── Top clientes ────────────────────────────────────────────────────
export async function reporteTopClientes(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('facturas')
      .select('cliente_id, total, clientes(nombre)')
      .gte('fecha', d)
      .lte('fecha', h)
      .neq('estado', 'anulada');

    if (error) return { error: error.message };

    const grouped: Record<string, { nombre: string; total: number; cantidad_facturas: number }> = {};
    for (const f of data ?? []) {
      const cid = f.cliente_id;
      if (!cid) continue;
      if (!grouped[cid]) {
        const cliente = f.clientes as unknown as { nombre: string } | null;
        grouped[cid] = { nombre: cliente?.nombre || 'Sin nombre', total: 0, cantidad_facturas: 0 };
      }
      grouped[cid].total += Number(f.total) || 0;
      grouped[cid].cantidad_facturas += 1;
    }

    const result = Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return { data: result };
  } catch {
    return { error: 'Error al generar reporte de top clientes' };
  }
}

// ── Ticket promedio ─────────────────────────────────────────────────
export async function reporteTicketPromedio(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('facturas')
      .select('total')
      .gte('fecha', d)
      .lte('fecha', h)
      .neq('estado', 'anulada');

    if (error) return { error: error.message };

    const facturas = data ?? [];
    const monto_total = facturas.reduce((sum, f) => sum + (Number(f.total) || 0), 0);
    const total_facturas = facturas.length;
    const ticket_promedio = total_facturas > 0 ? monto_total / total_facturas : 0;

    return { data: { ticket_promedio, total_facturas, monto_total } };
  } catch {
    return { error: 'Error al generar reporte de ticket promedio' };
  }
}

// ── Flujo de caja ───────────────────────────────────────────────────
export async function reporteFlujoCaja(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('movimientos')
      .select('fecha, tipo, monto')
      .gte('fecha', d)
      .lte('fecha', h)
      .order('fecha', { ascending: true });

    if (error) return { error: error.message };

    const grouped: Record<string, { fecha: string; ingresos: number; egresos: number; balance: number }> = {};
    for (const m of data ?? []) {
      const key = m.fecha;
      if (!grouped[key]) grouped[key] = { fecha: key, ingresos: 0, egresos: 0, balance: 0 };
      const monto = Number(m.monto) || 0;
      if (m.tipo === 'ingreso') {
        grouped[key].ingresos += monto;
      } else {
        grouped[key].egresos += monto;
      }
      grouped[key].balance = grouped[key].ingresos - grouped[key].egresos;
    }

    return { data: Object.values(grouped) };
  } catch {
    return { error: 'Error al generar reporte de flujo de caja' };
  }
}

// ── Cuentas por cobrar (aging) ──────────────────────────────────────
export async function reporteCuentasPorCobrar() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('facturas')
      .select('numero, fecha, total, saldo_pendiente, clientes(nombre)')
      .gt('saldo_pendiente', 0)
      .neq('estado', 'anulada')
      .order('fecha', { ascending: true });

    if (error) return { error: error.message };

    const today = new Date();
    const ranges = [
      { rango: '0-30 dias', min: 0, max: 30, cantidad: 0, monto_total: 0, facturas: [] as Array<{ numero: string; cliente_nombre: string; total: number; saldo: number; dias: number }> },
      { rango: '31-60 dias', min: 31, max: 60, cantidad: 0, monto_total: 0, facturas: [] as Array<{ numero: string; cliente_nombre: string; total: number; saldo: number; dias: number }> },
      { rango: '61-90 dias', min: 61, max: 90, cantidad: 0, monto_total: 0, facturas: [] as Array<{ numero: string; cliente_nombre: string; total: number; saldo: number; dias: number }> },
      { rango: '90+ dias', min: 91, max: Infinity, cantidad: 0, monto_total: 0, facturas: [] as Array<{ numero: string; cliente_nombre: string; total: number; saldo: number; dias: number }> },
    ];

    for (const f of data ?? []) {
      const dias = Math.floor((today.getTime() - new Date(f.fecha).getTime()) / (1000 * 60 * 60 * 24));
      const saldo = Number(f.saldo_pendiente) || 0;
      const cliente = f.clientes as unknown as { nombre: string } | null;

      const entry = {
        numero: f.numero,
        cliente_nombre: cliente?.nombre || 'Sin nombre',
        total: Number(f.total) || 0,
        saldo,
        dias,
      };

      const bucket = ranges.find((r) => dias >= r.min && dias <= r.max);
      if (bucket) {
        bucket.cantidad += 1;
        bucket.monto_total += saldo;
        bucket.facturas.push(entry);
      }
    }

    return { data: ranges };
  } catch {
    return { error: 'Error al generar reporte de cuentas por cobrar' };
  }
}

// ── Ingresos vs egresos ─────────────────────────────────────────────
export async function reporteIngresosVsEgresos(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('movimientos')
      .select('fecha, tipo, monto')
      .gte('fecha', d)
      .lte('fecha', h)
      .order('fecha', { ascending: true });

    if (error) return { error: error.message };

    let ingresos_total = 0;
    let egresos_total = 0;
    const porMes: Record<string, { mes: string; ingresos: number; egresos: number }> = {};

    for (const m of data ?? []) {
      const monto = Number(m.monto) || 0;
      const mesKey = m.fecha.slice(0, 7); // YYYY-MM
      if (!porMes[mesKey]) porMes[mesKey] = { mes: mesKey, ingresos: 0, egresos: 0 };

      if (m.tipo === 'ingreso') {
        ingresos_total += monto;
        porMes[mesKey].ingresos += monto;
      } else {
        egresos_total += monto;
        porMes[mesKey].egresos += monto;
      }
    }

    return {
      data: {
        ingresos_total,
        egresos_total,
        balance: ingresos_total - egresos_total,
        por_mes: Object.values(porMes),
      },
    };
  } catch {
    return { error: 'Error al generar reporte de ingresos vs egresos' };
  }
}

// ── Tasa de conversion cotizaciones ─────────────────────────────────
export async function reporteTasaConversion(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('estado')
      .gte('fecha', d)
      .lte('fecha', h);

    if (error) return { error: error.message };

    const cotizaciones = data ?? [];
    const total_cotizaciones = cotizaciones.length;
    const aprobadas = cotizaciones.filter((c) => c.estado === 'aprobada').length;
    const rechazadas = cotizaciones.filter((c) => c.estado === 'rechazada').length;
    const pendientes = cotizaciones.filter((c) => c.estado === 'pendiente').length;
    const tasa_aprobacion_pct = total_cotizaciones > 0 ? Math.round((aprobadas / total_cotizaciones) * 100) : 0;

    return { data: { total_cotizaciones, aprobadas, rechazadas, pendientes, tasa_aprobacion_pct } };
  } catch {
    return { error: 'Error al generar reporte de tasa de conversion' };
  }
}

// ── Vehiculos mas atendidos ─────────────────────────────────────────
export async function reporteVehiculosMasAtendidos(desde?: string, hasta?: string) {
  const range = getDefaultRange();
  const d = desde || range.desde;
  const h = hasta || range.hasta;

  try {
    const supabase = await createClient();

    // Get entradas in range
    const { data: entradas, error: errEntradas } = await supabase
      .from('entradas_vehiculo')
      .select('vehiculo_id, vehiculos(placa, marca, modelo)')
      .gte('fecha_entrada', d)
      .lte('fecha_entrada', h);

    if (errEntradas) return { error: errEntradas.message };

    // Get facturas in range for monto
    const { data: facturas, error: errFacturas } = await supabase
      .from('facturas')
      .select('vehiculo_id, total')
      .gte('fecha', d)
      .lte('fecha', h)
      .neq('estado', 'anulada');

    if (errFacturas) return { error: errFacturas.message };

    // Group entradas by vehiculo
    const grouped: Record<string, { placa: string; marca: string; modelo: string; cantidad_entradas: number; monto_total: number }> = {};

    for (const e of entradas ?? []) {
      const vid = e.vehiculo_id;
      if (!vid) continue;
      const vehiculo = e.vehiculos as unknown as { placa: string; marca: string; modelo: string } | null;
      if (!grouped[vid]) {
        grouped[vid] = {
          placa: vehiculo?.placa || '',
          marca: vehiculo?.marca || '',
          modelo: vehiculo?.modelo || '',
          cantidad_entradas: 0,
          monto_total: 0,
        };
      }
      grouped[vid].cantidad_entradas += 1;
    }

    // Add montos from facturas
    for (const f of facturas ?? []) {
      const vid = f.vehiculo_id;
      if (!vid || !grouped[vid]) continue;
      grouped[vid].monto_total += Number(f.total) || 0;
    }

    const result = Object.values(grouped)
      .sort((a, b) => b.cantidad_entradas - a.cantidad_entradas)
      .slice(0, 10);

    return { data: result };
  } catch {
    return { error: 'Error al generar reporte de vehiculos mas atendidos' };
  }
}
