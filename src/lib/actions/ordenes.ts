'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getOrdenes(estado?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('ordenes_trabajo')
      .select('*, clientes(id, nombre), vehiculos(id, placa, marca, modelo), usuarios(id, nombre)')
      .order('created_at', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch {
    return { error: 'Error al obtener ordenes' };
  }
}

export async function createOrden(data: {
  cotizacion_id?: string;
  entrada_id?: string;
  cliente_id: string;
  vehiculo_id: string;
  mecanico_id?: string;
  fecha_estimada?: string;
  notas?: string;
}) {
  try {
    const supabase = await createClient();

    const { data: numero, error: rpcError } = await supabase.rpc('generar_numero', {
      tipo_seq: 'orden',
    });

    if (rpcError) return { error: rpcError.message };

    const orden = {
      numero,
      cotizacion_id: data.cotizacion_id || null,
      entrada_id: data.entrada_id || null,
      cliente_id: data.cliente_id,
      vehiculo_id: data.vehiculo_id,
      mecanico_id: data.mecanico_id || null,
      fecha_estimada: data.fecha_estimada || null,
      notas: data.notas || null,
    };

    const { data: nuevaOrden, error } = await supabase
      .from('ordenes_trabajo')
      .insert(orden)
      .select()
      .single();

    if (error) return { error: error.message };

    revalidatePath('/ordenes');
    return { data: nuevaOrden };
  } catch {
    return { error: 'Error al crear orden' };
  }
}

export async function getOrden(id: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('*, clientes(id, nombre, telefono, email), vehiculos(id, placa, marca, modelo, ano), usuarios(id, nombre), cotizaciones(id, numero, total)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch {
    return { error: 'Error al obtener orden' };
  }
}

export async function updateOrdenEstado(id: string, estado: string, progreso?: number) {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { estado };
    if (progreso !== undefined) updateData.progreso = progreso;
    if (estado === 'completada') {
      updateData.fecha_completada = new Date().toISOString();
      updateData.progreso = 100;
    }
    if (estado === 'en_progreso' && progreso === undefined) {
      updateData.progreso = 25;
    }

    const { error } = await supabase
      .from('ordenes_trabajo')
      .update(updateData)
      .eq('id', id);

    if (error) return { error: error.message };

    // Al completar la orden, mover la entrada a "listo"
    if (estado === 'completada') {
      const { data: orden } = await supabase
        .from('ordenes_trabajo')
        .select('entrada_id')
        .eq('id', id)
        .single();

      if (orden?.entrada_id) {
        await supabase
          .from('entradas_vehiculo')
          .update({ estado: 'listo' })
          .eq('id', orden.entrada_id);
        revalidatePath('/entradas');
      }
    }

    // Al poner en progreso, mover entrada a "en_reparacion"
    if (estado === 'en_progreso') {
      const { data: orden } = await supabase
        .from('ordenes_trabajo')
        .select('entrada_id')
        .eq('id', id)
        .single();

      if (orden?.entrada_id) {
        await supabase
          .from('entradas_vehiculo')
          .update({ estado: 'en_reparacion' })
          .eq('id', orden.entrada_id);
        revalidatePath('/entradas');
      }
    }

    revalidatePath('/ordenes');
    revalidatePath('/');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al actualizar orden' };
  }
}

export async function asignarMecanicoOrden(id: string, mecanicoId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('ordenes_trabajo')
      .update({ mecanico_id: mecanicoId })
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/ordenes');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al asignar mecánico' };
  }
}

export async function getMecanicos() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, rol')
      .in('rol', ['mecanico', 'admin'])
      .eq('activo', true);

    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch {
    return { error: 'Error al obtener mecánicos' };
  }
}
