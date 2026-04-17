'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMovimientos(tipo?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('movimientos')
      .select('*')
      .order('fecha', { ascending: false });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch {
    return { error: 'Error al obtener movimientos' };
  }
}

export async function getMovimientosTotals() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: ingresos } = await supabase
      .from('movimientos')
      .select('monto')
      .eq('tipo', 'ingreso')
      .gte('fecha', firstOfMonth);

    const { data: egresos } = await supabase
      .from('movimientos')
      .select('monto')
      .eq('tipo', 'egreso')
      .gte('fecha', firstOfMonth);

    const totalIngresos = (ingresos ?? []).reduce((s, m) => s + Number(m.monto), 0);
    const totalEgresos = (egresos ?? []).reduce((s, m) => s + Number(m.monto), 0);

    return {
      data: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance: totalIngresos - totalEgresos,
      },
    };
  } catch {
    return { error: 'Error al obtener totales' };
  }
}

export async function createMovimiento(formData: FormData) {
  try {
    const supabase = await createClient();

    const movimiento = {
      tipo: formData.get('tipo') as string,
      categoria: formData.get('categoria') as string,
      descripcion: formData.get('descripcion') as string,
      monto: parseFloat(formData.get('monto') as string),
      fecha: (formData.get('fecha') as string) || new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('movimientos')
      .insert(movimiento)
      .select()
      .single();

    if (error) return { error: error.message };

    revalidatePath('/movimientos');
    return { data };
  } catch {
    return { error: 'Error al crear movimiento' };
  }
}
