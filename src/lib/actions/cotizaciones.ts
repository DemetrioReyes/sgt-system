'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCotizaciones(busqueda?: string, estado?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('cotizaciones')
      .select('*, clientes(id, nombre), vehiculos(id, placa, marca, modelo)')
      .order('created_at', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (busqueda) {
      query = query.or(
        `numero.ilike.%${busqueda}%`
      );
    }

    const { data, error } = await query;

    if (error) return { error: error.message };

    // Compute vigencia_dias_restantes
    const cotizacionesConVigencia = (data || []).map((c) => {
      const createdAt = new Date(c.created_at);
      const vigenciaFin = new Date(createdAt.getTime() + (c.vigencia_dias || 30) * 86400000);
      const hoy = new Date();
      const diasRestantes = Math.ceil((vigenciaFin.getTime() - hoy.getTime()) / 86400000);
      return { ...c, vigencia_dias_restantes: Math.max(0, diasRestantes) };
    });

    return { data: cotizacionesConVigencia };
  } catch {
    return { error: 'Error al obtener cotizaciones' };
  }
}

export async function getCotizacion(id: string) {
  try {
    const supabase = await createClient();

    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .select('*, clientes(id, nombre, telefono, email, cedula_rnc), vehiculos(id, placa, marca, modelo, ano)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };

    // Get items
    const { data: items, error: itemsError } = await supabase
      .from('cotizacion_items')
      .select('*')
      .eq('cotizacion_id', id);

    if (itemsError) return { error: itemsError.message };

    return { data: { ...cotizacion, items: items || [] } };
  } catch {
    return { error: 'Error al obtener cotización' };
  }
}

export async function createCotizacion(data: {
  entrada_id?: string;
  cliente_id: string;
  vehiculo_id: string;
  vigencia_dias?: number;
  moneda?: string;
  notas_cliente?: string;
  notas_internas?: string;
  aplica_itbis?: boolean;
  items: { tipo: string; descripcion: string; cantidad: number; precio_unitario: number }[];
}) {
  try {
    const supabase = await createClient();

    // Generate numero
    const { data: numero, error: rpcError } = await supabase.rpc('generar_numero', {
      tipo_seq: 'cotizacion',
    });

    if (rpcError) return { error: rpcError.message };

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.cantidad * item.precio_unitario,
      0
    );
    const itbis = data.aplica_itbis ? subtotal * 0.18 : 0;
    const total = subtotal + itbis;

    const cotizacion = {
      numero,
      entrada_id: data.entrada_id || null,
      cliente_id: data.cliente_id,
      vehiculo_id: data.vehiculo_id,
      vigencia_dias: data.vigencia_dias || 30,
      moneda: data.moneda || 'DOP',
      notas_cliente: data.notas_cliente || null,
      notas_internas: data.notas_internas || null,
      aplica_itbis: data.aplica_itbis ?? true,
      subtotal,
      itbis,
      total,
    };

    const { data: nuevaCotizacion, error } = await supabase
      .from('cotizaciones')
      .insert(cotizacion)
      .select()
      .single();

    if (error) return { error: error.message };

    // Insert items
    const items = data.items.map((item) => ({
      cotizacion_id: nuevaCotizacion.id,
      tipo: item.tipo,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
    }));

    const { error: itemsError } = await supabase.from('cotizacion_items').insert(items);

    if (itemsError) return { error: itemsError.message };

    revalidatePath('/cotizaciones');
    return { data: nuevaCotizacion };
  } catch {
    return { error: 'Error al crear cotización' };
  }
}

export async function updateCotizacionEstado(id: string, estado: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('cotizaciones').update({ estado }).eq('id', id);

    if (error) return { error: error.message };

    // Si se aprueba: actualizar entrada + crear orden de trabajo automáticamente
    if (estado === 'aprobada') {
      const { data: cotizacion } = await supabase
        .from('cotizaciones')
        .select('entrada_id, cliente_id, vehiculo_id')
        .eq('id', id)
        .single();

      if (cotizacion) {
        // Mover entrada a "aprobado"
        if (cotizacion.entrada_id) {
          await supabase
            .from('entradas_vehiculo')
            .update({ estado: 'aprobado' })
            .eq('id', cotizacion.entrada_id);
        }

        // Generar número de orden
        const { data: numero } = await supabase.rpc('generar_numero', {
          tipo_seq: 'orden',
        });

        if (numero) {
          // Crear orden de trabajo
          await supabase.from('ordenes_trabajo').insert({
            numero,
            cotizacion_id: id,
            entrada_id: cotizacion.entrada_id || null,
            cliente_id: cotizacion.cliente_id,
            vehiculo_id: cotizacion.vehiculo_id,
            estado: 'pendiente',
            progreso: 0,
          });
        }
      }
    }

    revalidatePath('/cotizaciones');
    revalidatePath('/entradas');
    revalidatePath('/ordenes');
    revalidatePath('/');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al actualizar estado de cotización' };
  }
}
